import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {slug,escape,money} from '../lib/site.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');
const r=JSON.parse(await fs.readFile(path.join(root,'content/restaurant.json'),'utf8'));
const menu=JSON.parse(await fs.readFile(path.join(root,'content/menu.json'),'utf8'));
const categories=menu.categories.filter(c=>!c.isRecommendationGroup);
assert.equal(menu.currency,'USD');
assert.equal(new Set(categories.map(c=>slug(c.name))).size,categories.length,'Duplicate category slug');
let total=0;
for(const category of categories){
 assert.equal(category.items.length,category.sourceCount,`Source count mismatch: ${category.name}`);
 const html=await fs.readFile(path.join(dist,'menu',slug(category.name),'index.html'),'utf8');
 for(const [i,item] of category.items.entries()){
  assert.ok(item.name&&Number.isFinite(item.price)&&item.price>=0,'Missing name or valid price');
  const start=html.indexOf(`<article id="dish-${slug(category.name)}-${i+1}"`);
  assert.ok(start>=0,`Missing HTML item: ${item.name}`);
  const block=html.slice(start,html.indexOf('</article>',start));
  assert.ok(block.includes(escape(item.name)),`Name mismatch: ${item.name}`);
  assert.ok(block.includes(money(item.price)),`Price mismatch: ${item.name}`);
  if(item.variant)assert.ok(block.includes(escape(item.variant)),`Missing serving size: ${item.name}`);
  if(item.availability==='sold_out')assert.ok(block.includes('Listed as sold out'));
  total++;
 }
}
for(const group of menu.categories.filter(c=>c.isRecommendationGroup))for(const popular of group.items){
 const category=categories.find(c=>c.name===popular.canonicalCategory);
 const item=category?.items.find(x=>x.name===popular.name&&x.variant===popular.variant);
 assert.ok(item,`Unmatched recommendation: ${popular.name}`);
 assert.equal(item.price,popular.price,`Recommendation price mismatch: ${popular.name}`);
 assert.equal(item.popular,true,`Missing popular flag: ${popular.name}`);
}
const files=[];
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())await walk(p);else files.push(p);}}
await walk(dist);
const htmlFiles=files.filter(p=>p.endsWith('.html'));
let links=0;
for(const file of htmlFiles){
 const html=await fs.readFile(file,'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`H1 count: ${file}`);
 assert.ok(html.includes('<meta name="description" content="'));
 assert.ok(html.includes('<link rel="canonical"'));
 assert.ok(html.includes(r.telephone),'Missing phone');
 const encoded=(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)||[])[1];
 const schema=JSON.parse(encoded);
 const restaurant=schema['@graph'].find(x=>x['@type']==='Restaurant');
 assert.equal(restaurant.address.streetAddress,r.address.streetAddress);
 assert.equal(restaurant.telephone,r.telephone);
 if(r.hours===null)assert.ok(!restaurant.openingHoursSpecification,'Unconfirmed hours in schema');
 for(const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
  const href=match[1];
  if(!href.startsWith('/')&&!href.startsWith('#'))continue;
  const [pathname,hash]=href.split('#');
  const target=pathname ? path.join(dist,pathname,pathname.endsWith('/')?'index.html':'') : file;
  assert.ok(files.includes(target),`Broken link ${href} in ${file}`);
  if(hash){const targetHTML=await fs.readFile(target,'utf8');assert.ok(targetHTML.includes(`id="${hash}"`),`Broken anchor ${href}`);}
  links++;
 }
}
const html=await fs.readFile(path.join(dist,'menu/index.html'),'utf8');
const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const structuredMenu=graph['@graph'].find(x=>x['@type']==='Menu');
assert.equal(structuredMenu.hasMenuSection.reduce((n,c)=>n+c.hasMenuItem.length,0),total);
assert.equal((html.match(/<article id="dish-/g)||[]).length,total);
console.log(`PASS: ${total} HTML menu entries and structured prices; ${categories.length} category counts; ${htmlFiles.length} pages; ${links} internal links/anchors; NAP, metadata and recommendation matching.`);

const aboutData=JSON.parse(await fs.readFile(path.join(root,'content/about.json'),'utf8'));
const aboutHTML=await fs.readFile(path.join(dist,'about/index.html'),'utf8');
for(const text of [aboutData.intro,aboutData.kitchenIntro,...aboutData.signatures.map(x=>x.name)])assert.ok(aboutHTML.includes(escape(text)),`Missing official About content: ${text}`);
const homeHTML=await fs.readFile(path.join(dist,'index.html'),'utf8');
assert.ok(homeHTML.includes(escape(aboutData.homeSummary)), 'Home and About content source drift');
const aboutGraph=JSON.parse(aboutHTML.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(aboutGraph['@graph'].find(x=>x['@type']==='Restaurant').description,aboutData.intro);
console.log('PASS: official About copy, signature dishes, home summary and Restaurant description alignment.');

// Redesign contracts: keep the home story distinct from the pickup menu.
const homeSections=['class="cinema-hero"','id="brand-intro"','id="menu-highlights"','id="hot-pot"','id="dim-sum"','id="dining-experience"','id="at-the-table"','id="guest-reviews"','id="find-us"'];
let lastSection=-1;
for(const marker of homeSections){const next=homeHTML.indexOf(marker);assert.ok(next>lastSection,`Home section missing or out of order: ${marker}`);lastSection=next;}
assert.equal((homeHTML.match(/class="signature-slide"/g)||[]).length,10);
assert.ok(!homeHTML.includes('class="closing"')&&!homeHTML.includes('class="category-grid"'));
assert.ok(homeHTML.includes('Online pickup menu prices are separate from dine-in AYCE pricing.'));
const reviews=JSON.parse(await fs.readFile(path.join(root,'content/reviews.json'),'utf8'));
for(const review of reviews.items)for(const paragraph of review.paragraphs)assert.ok(homeHTML.includes(escape(paragraph)),'Review original text missing');
for(const [route,label] of [['/','Home'],['/menu/','Menu'],['/about/','Our Story'],['/facility/','Dining'],['/location/','Visit Us']]){
 const content=await fs.readFile(path.join(dist,route,'index.html'),'utf8');
 assert.ok(content.includes(`href="${route}" aria-current="page">${label}</a>`),`Navigation active state: ${route}`);
}
console.log('PASS: redesigned home section order, ten food links, full review text, AYCE distinction and route-based navigation.');

const imageSource=JSON.parse(await fs.readFile(path.join(root,'content/menu-source-assets.json'),'utf8'));
assert.equal(imageSource.items.length,total,'Source image manifest must cover every canonical dish');
assert.deepEqual([...new Set(imageSource.items.map(row=>row.category))],categories.map(c=>c.name),'Source category order drift');
const expectedIds=[];
for(const category of categories){
 const rows=imageSource.items.filter(row=>row.category===category.name);
 assert.deepEqual(rows.map(row=>row.name),category.items.map(item=>item.name),'Source item order drift');
 assert.deepEqual(rows.map(row=>row.sourceOrder),rows.map((_,i)=>i),'Ordering page sequence drift');
 const ids=category.items.map((_,i)=>`dish-${slug(category.name)}-${i+1}`);
 expectedIds.push(...ids);
 const categoryHTML=await fs.readFile(path.join(dist,'menu',slug(category.name),'index.html'),'utf8');
 assert.deepEqual([...categoryHTML.matchAll(/<article id="(dish-[^"]+)"/g)].map(m=>m[1]),ids,'Category HTML must follow source order');
 for(const row of rows){
  const item=category.items[row.itemIndex];
  if(row.imageUrl)assert.ok(item.image&&item.imageSmall,`Missing available official photo: ${row.name}`);
  if(item.image){
   assert.ok(item.width>0&&item.height>0);
   for(const asset of [item.image,item.imageSmall])assert.ok((await fs.stat(path.join(dist,asset))).size>0);
  }
 }
}
assert.deepEqual([...html.matchAll(/<article id="(dish-[^"]+)"/g)].map(m=>m[1]),expectedIds,'Full menu HTML must follow source order');
console.log(`PASS: source menu order and available official photos (${categories.flatMap(c=>c.items).filter(i=>i.image).length}/${total}); stable dish anchors.`);
