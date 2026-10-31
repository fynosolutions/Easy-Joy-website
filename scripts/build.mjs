import {readFile,writeFile,mkdir,cp,rm,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {escape as e,slug,money,addressLine,absolute,dish,faqItems,shell,menuSchema,breadcrumbSchema,foodImage} from '../lib/site.mjs';
import {renderAbout} from '../lib/about.mjs';
import {drinksMenu} from '../lib/drinks.mjs';
import {locationMap} from '../lib/map.mjs';
import {galleryCard} from '../lib/media.mjs';
import {renderHome,diningExperience} from '../lib/home.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=async name=>JSON.parse(await readFile(path.join(root,'content',name),'utf8'));
const [restaurant,menu,pages,about]=await Promise.all([read('restaurant.json'),read('menu.json'),read('pages.json'),read('about.json')]);
const reviews=await read('reviews.json');
const media=await read('media.json');
const home=await read('home.json');
if (!home.hero.videoSrc && await access(path.join(root,'assets/video/hero-landscape.mp4')).then(() => true, () => false)) home.hero.videoSrc='/assets/video/hero-landscape.mp4';
// Dropping the landscape MP4 into this path enables it on the next build.
if (!media.hotpotVideo.src) {
 const videoPath = 'assets/video/hot-pot-landscape.mp4';
 if (await access(path.join(root, videoPath)).then(() => true, () => false)) {
  media.hotpotVideo.src = '/' + videoPath;
 }
}
const r={...restaurant,description:about.intro};
const categories=menu.categories.filter(c=>!c.isRecommendationGroup);
const total=categories.reduce((sum,c)=>sum+c.items.length,0);
const preview=process.argv.includes('--preview') || (process.argv.includes('--vercel') && process.env.EASYJOY_INDEXING!=='production');
const dist=path.join(root,'dist');
await rm(dist,{recursive:true,force:true}); await mkdir(dist,{recursive:true});
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
const routes=[];
const intro=(eyebrow,title,description,extra='')=>`<header class="page-intro container"><p class="eyebrow">${e(eyebrow)}</p><h1>${title}</h1><p class="lead">${description}</p>${extra}</header>`;
async function page(route,meta,body,active,schemas=[],noindex=false){
 const target=route==='/404/' ? path.join(dist,'404.html') : path.join(dist,route,'index.html');
 await mkdir(path.dirname(target),{recursive:true});
 await writeFile(target,shell(r,{route,title:meta.title,description:meta.description,body,active,preview,noindex,schemas,categories}));
 if(!noindex) routes.push(route);
}
const crumb=(route,name,category=false)=>breadcrumbSchema(r,route,name,category);
// Source menu order is canonical; original indices also keep permanent anchors stable.
const orderedDishes=(category,categoryPage=false)=>category.items
 .map((item,index)=>dish(item,category.name,index,categoryPage)).join('');
await page('/',pages.home,renderHome(r,about,media,reviews,categories,home), 'Home');
const menuNav=`<nav class="menu-nav" aria-label="Menu categories"><p class="eyebrow">ON THE MENU</p>${categories.map(c=>`<a href="#${slug(c.name)}">${e(c.name)} <span>${c.items.length}</span></a>`).join('')}<a href="#drinks-menu">Drinks Menu <span>Dine-in</span></a></nav>`;
const menuSections=categories.map((c,i)=>`<section id="${slug(c.name)}" class="menu-category" data-category><header class="category-heading"><div><span class="section-number">${String(i+1).padStart(2,'0')}</span><h2>${e(c.name)}</h2></div><a href="/menu/${slug(c.name)}/">Category page ↗</a></header><div class="dish-grid">${orderedDishes(c)}</div></section>`).join('');
await page('/menu/',pages.menu,`${intro('OUR ONLINE MENU','Something for<br><em>every craving.</em>','Hot pot, dim sum, BBQ skewers and dumplings. Browse the categories, find your favorites and order through MealKeyway.',`<p class="menu-context">Online ordering menu · USD · Reviewed on October 20, 2026</p><details class="menu-price-details"><summary>About prices, availability & AYCE</summary><p>${e(r.menuNotice)}</p></details><div class="actions"><a class="button" href="${e(r.orderUrl)}">Order online ↗</a><a class="text-link" href="#drinks-menu">View Drinks Menu ↓</a><a class="text-link" href="/gallery/">Browse food photos ↗</a></div>`)}<div class="container menu-search"><label for="menu-search">Find a dish</label><div class="search-row"><input id="menu-search" type="search" placeholder="Try dumplings, shrimp, broth…" autocomplete="off"><button id="clear-search" type="button" class="button secondary">Clear</button></div><div class="menu-tools"><button id="popular-filter" class="filter-chip" type="button" aria-pressed="false">Popular dishes</button><a href="/menu.txt" class="text-link">Text menu ↗</a></div><p id="search-count" role="status" aria-live="polite">${total} dishes in ${categories.length} categories</p><noscript><p>All menu items are available below. Use your browser’s Find command to search without JavaScript.</p></noscript></div><div class="container menu-layout"><div class="mobile-category-jump"><label for="category-jump">Jump to a category</label><select id="category-jump"><option value="">Choose a category</option>${categories.map(c=>`<option value="${slug(c.name)}">${e(c.name)} (${c.items.length})</option>`).join('')}<option value="drinks-menu">Drinks Menu (Dine-in)</option></select></div>${menuNav}<div class="menu-content">${menuSections}<p id="no-results" hidden>No dishes match your search. Try a different word or clear the search.</p></div></div>${drinksMenu}`, 'Menu',[menuSchema(r,categories),crumb('/menu/','Menu')]);
for(const c of categories){
 const route=`/menu/${slug(c.name)}/`;
 const examples=c.items.slice(0,3).map(x=>x.name).join(', ');
 await page(route,{title:`${c.name} Menu & Prices | Easy Joy NYC`,description:`Explore Easy Joy's ${c.name} menu in Chinatown, New York, including ${examples}. View online menu prices and order through MealKeyway.`},`${intro('EASY JOY · MENU',e(c.name),`Explore ${c.items.length} dishes in this online menu category. Prices are in USD.`,`<a class="text-link" href="/menu/">← All menu categories</a><p class="menu-notice">${e(r.menuNotice)}</p>`)}<div class="container category-page"><div class="dish-grid">${orderedDishes(c,true)}</div><div class="actions section-actions"><a class="button" href="${e(r.orderUrl)}">Order online ↗</a><a class="text-link" href="/menu/">Browse every category ↗</a></div></div>`, 'Menu',[menuSchema(r,[c],route),crumb(route,c.name,true)]);
}
await page('/gallery/',{title:'Food Gallery | Easy Joy Hot Pot, Dim Sum & BBQ Skewers, NYC',description:'Explore Easy Joy’s dim sum, hot pot, grilled skewers, rice dishes and congee in our food photo gallery. Visit us in New York’s Chinatown.'},`${intro('THE EASY JOY TABLE','Good food.<br><em>In good company.</em>',media.galleryNotice,`<div class="actions"><a class="button" href="/menu/">Menu & prices ↗</a><a class="text-link" href="/facility/#easyjoy-film">Watch our film ↗</a></div>`)}<div class="container gallery-categories"><nav aria-label="Food gallery categories">${media.groups.map(group=>`<a href="#gallery-${group.id}">${e(group.label)}</a>`).join('')}</nav></div>${media.lifestylePhotos?.length ? `<section class="section container gallery-group" id="gallery-at-easyjoy"><div class="section-heading"><h2>At Easy Joy</h2></div><div class="food-gallery-grid lifestyle-gallery-grid">${media.lifestylePhotos.map(galleryCard).join('')}</div></section>` : ''}${media.groups.map(group=>`<section class="section container gallery-group" id="gallery-${group.id}"><div class="section-heading"><h2>${e(group.label)}</h2></div><div class="food-gallery-grid">${media.photos.filter(photo=>photo.group===group.id).map(galleryCard).join('')}</div></section>`).join('')}`, '',[crumb('/gallery/','Gallery')]);
await page('/about/',pages.about,renderAbout(r,about),'About',[crumb('/about/','About')]);
await page('/location/',pages.location,`${intro('HOURS & LOCATION','Your next stop:<br><em>Mulberry Street.</em>','Easy Joy is at 145 Mulberry St in Manhattan’s Chinatown, New York.')}
<div class="container location-content">
  <div class="location-facts">
    <section><h2>Address</h2><address><strong>${e(r.address.streetAddress)}</strong><br>${e(r.address.addressLocality)}, ${e(r.address.addressRegion)} ${e(r.address.postalCode)}</address><a class="text-link" href="${e(r.directionsUrl)}">Get directions ↗</a></section>
    <section><h2>Opening Hours</h2><p>${e(r.hoursMessage)}</p><p class="location-note">New York local time</p></section>
    <section><h2>Phone</h2><a class="location-phone" href="tel:${r.telephone}">${e(r.displayPhone)}</a><a class="text-link" href="tel:${r.telephone}">Call the restaurant ↗</a></section>
  </div>
  <div class="location-services">
    <section><h2>Pickup &amp; Delivery</h2><p>Order pickup online or choose a delivery platform.</p><a href="${e(r.orderUrl)}">Order online ↗</a></section>
    <section><h2>Dining Questions</h2><p>Questions about AYCE pricing or group dining? Contact us.</p><a class="text-link" href="/contact/">Contact Easy Joy ↗</a></section>
  </div>
</div><section class="container location-page-map" aria-label="Restaurant map">${locationMap(r)}</section>`, 'Location',[crumb('/location/','Location')]);
await page('/facility/',{...pages.facility,title:'Dining at Easy Joy | Hot Pot, Dim Sum & BBQ Skewers, NYC',description:'Take a look inside Easy Joy on Mulberry Street. Explore our dining room and restaurant film, and plan your hot pot, dim sum and BBQ skewers visit.'},`${intro('DINING AT EASY JOY','Good food.<br>Good company.','Gather over all-you-can-eat hot pot, handcrafted dim sum and BBQ skewers in Chinatown.')}
${diningExperience(media,true)}<section class="section container"><div class="dining-plan"><div><p class="eyebrow">Plan your meal</p><h2>We look forward<br>to welcoming you.</h2></div><div><p>Call for current AYCE pricing and rules, reservations, group dining questions, or information about access and seating.</p><div class="actions"><a class="button" href="tel:${r.telephone}">Call ${e(r.displayPhone)} ↗</a><a class="text-link" href="/location/">Hours & location ↗</a></div></div></div></section>`, 'Dining',[crumb('/facility/','Dining')]);
await page('/contact/',pages.contact,`
<section class="container contact-intro" aria-labelledby="contact-heading">
  <div class="contact-welcome"><p class="eyebrow">CONTACT EASY JOY</p><h1 id="contact-heading">Let’s talk<br><em>good food.</em></h1><p class="lead">Planning a meal with us? Call with dining questions, order online, or find your way to Mulberry Street.</p><a class="text-link" href="/faq/">Browse common questions <span aria-hidden="true">↗</span></a></div>
  <section class="contact-call" aria-labelledby="contact-call-heading"><h2 id="contact-call-heading">Call Easy Joy</h2><a class="contact-phone" href="tel:${r.telephone}">${e(r.displayPhone)} <span aria-hidden="true">↗</span></a><p>For AYCE pricing, group dining or dietary questions, speak with the restaurant directly.</p><div class="contact-hours"><span>Opening hours · New York local time</span><p>${e(r.hoursMessage)}</p></div></section>
</section>`, 'Contact',[crumb('/contact/','Contact')]);
await page('/faq/',pages.faq,`${intro('A FEW GOOD QUESTIONS','Before you<br><em>take a bite.</em>','Menu details, ordering and visiting information, in one place.')}<div class="container faq-container">${faqItems(r,pages.faqs)}</div>`, 'FAQ',[crumb('/faq/','FAQ')]);
await page('/404/',{title:'Page not found | Easy Joy',description:'Find the Easy Joy menu, location and contact information.'},`${intro('PAGE NOT FOUND','Let’s get you<br><em>back to the menu.</em>','The page you are looking for is not here.')}<div class="container section-actions"><a class="button" href="/menu/">Browse the menu ↗</a></div>`, '',[],true);
await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${e(absolute(r,route))}</loc></url>`).join('')}</urlset>\n`);
await writeFile(path.join(dist,'robots.txt'),preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${r.domain}/sitemap.xml\n`);
await writeFile(path.join(dist,'menu.txt'),`${r.name}\n${addressLine(r)}\n${r.displayPhone}\n${r.menuNotice}\n\n${categories.map(c=>`${c.name}\n${c.items.map(x=>`${x.name}${x.variant?' ('+x.variant+')':''} — ${money(x.price)}${x.availability==='sold_out'?' [Listed as sold out]':''}${x.description?'\n'+x.description:''}`).join('\n')}`).join('\n\n')}\n`);
console.log(`Built ${routes.length} indexable routes + 404, ${total} menu items, ${categories.length} category pages. Mode: ${preview ? 'preview (noindex)' : 'production'}. Output: ${dist}`);
