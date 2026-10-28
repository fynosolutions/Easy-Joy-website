// Local browser QA. Start a headless browser with --remote-debugging-port=9334 first.
import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const output = fileURLToPath(new URL('../docs/redesign-qa/', import.meta.url));
await fs.mkdir(output,{recursive:true});
const target = await (await fetch('http://127.0.0.1:9334/json/new?about:blank',{method:'PUT'})).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
ws.onclose=event=>{for(const p of pending.values())p.reject(new Error('Browser disconnected '+event.code+' '+event.reason));};
let id=0;const pending=new Map();const errors=[];
ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const size=width=>send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
const navigate=async(path='/')=>{await send('Page.navigate',{url:'http://127.0.0.1:4173'+path});await pause(450);await evaluate('document.fonts.ready.then(()=>true)');};
const screenshot=async(name,full=false)=>{
 const metric=await send('Page.getLayoutMetrics');const height=full?Math.ceil(metric.cssContentSize.height):900;const width=await evaluate('innerWidth');
 await run('python',['-c',`import asyncio,json,sys,base64,websockets
from pathlib import Path
async def main():
 async with websockets.connect(sys.argv[1],max_size=50000000) as ws:
  await ws.send(json.dumps({'id':1,'method':'Page.captureScreenshot','params':{'format':'png','captureBeyondViewport':True,'clip':{'x':0,'y':0,'width':int(sys.argv[3]),'height':int(sys.argv[4]),'scale':1}}}))
  while True:
   r=json.loads(await ws.recv())
   if r.get('id')==1:
    Path(sys.argv[2]).write_bytes(base64.b64decode(r['result']['data']))
    break
asyncio.run(main())`,target.webSocketDebuggerUrl,output+name+'.png',String(width),String(height)]);
};
const results=[];
try {
 await send('Page.enable');await send('Runtime.enable');
 for(const width of [1440,1024,768,390,360]){
  await size(width);await navigate();
  await evaluate('window.scrollTo(0,document.body.scrollHeight)');await pause(650);await evaluate('window.scrollTo(0,0)');await pause(150);
  const state=await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,sections:[...document.querySelector('.home-editorial').children].map(x=>x.id||x.className),brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),font:getComputedStyle(document.querySelector('h1')).fontFamily,overflow:[...document.querySelectorAll('main *,header *,footer *')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).map(x=>x.className).slice(0,10)})`);
  assert.ok(state.scroll<=width,JSON.stringify(state));assert.equal(state.h1,1);assert.equal(state.brokenImages.length,0);
  assert.deepEqual(state.sections,['cinema-hero','brand-intro','menu-highlights','story-stack','at-the-table','guest-reviews','find-us']);
  results.push(state);await screenshot('home-'+width,width===1440||width===390);
 }
 await size(390);await navigate();
 assert.equal(await evaluate("getComputedStyle(document.querySelector('#primary-nav')).display"),'none');
 await evaluate("document.querySelector('.mobile-nav-toggle').click()");
 assert.equal(await evaluate("document.querySelector('.mobile-nav-toggle').getAttribute('aria-expanded')"),'true');
 await evaluate("document.querySelector('#primary-nav a').focus()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
 assert.equal(await evaluate("document.activeElement.className"),'mobile-nav-toggle');
 assert.equal(await evaluate("document.querySelector('.mobile-nav-toggle').getAttribute('aria-expanded')"),'false');
 await evaluate("document.querySelector('.mobile-nav-toggle').click();document.querySelector('.category-toggle').click()");
 assert.equal(await evaluate("document.querySelector('#category-dropdown').hidden"),false);
 await screenshot('mobile-navigation');
 await evaluate("document.querySelector('.mobile-nav-toggle').click();document.querySelector('.review-card summary').click()");
 assert.equal(await evaluate("document.querySelector('.review-card details').open"),true);
 assert.equal(await evaluate("document.querySelector('.review-full').textContent.length > 200"),true);
 await navigate('/facility/');
 await evaluate("document.querySelector('#film-player').scrollIntoView();document.querySelector('.film-play').click()");await pause(3500);
 const video=await evaluate("({paused:document.querySelector('video').paused,time:document.querySelector('video').currentTime,error:document.querySelector('video').error?.message})");
 assert.ok(!video.paused&&video.time>0,JSON.stringify(video));await evaluate("document.querySelector('video').pause()");
 for(const width of [1440,1024,768,390,360]){
  await size(width);await navigate('/menu/');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`Menu overflow ${width}`);
  assert.equal(await evaluate("document.querySelectorAll('.dish').length"),152);
 }
 await evaluate("document.querySelector('#menu-search').value='dumplings';document.querySelector('#menu-search').dispatchEvent(new Event('input'))");
 const count=await evaluate("document.querySelectorAll('.dish:not([hidden])').length");assert.ok(count>0&&count<152);
 await evaluate("document.querySelector('#clear-search').click()");assert.equal(await evaluate("document.querySelectorAll('.dish:not([hidden])').length"),152);
 await evaluate("document.querySelector('#popular-filter').click()");assert.equal(await evaluate("document.querySelectorAll('.dish:not([hidden])').length"),14);
 for(const route of ['/about/','/facility/','/location/','/contact/','/gallery/','/faq/']){
  for(const width of [1440,360]){
   await size(width);await navigate(route);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`Overflow ${route} ${width}`);
   assert.equal(await evaluate("document.querySelectorAll('h1').length"),1);
  }
 }
 await size(390);await send('Emulation.setScriptExecutionDisabled',{value:true});await navigate();
 assert.notEqual(await evaluate("getComputedStyle(document.querySelector('#primary-nav')).display"),'none');
 await evaluate("document.querySelector('.review-card details').open=true");
 await navigate('/facility/');
 assert.equal(await evaluate("document.querySelector('video').controls"),true);
 await navigate('/menu/');assert.equal(await evaluate("document.querySelectorAll('.dish').length"),152);
 await send('Emulation.setScriptExecutionDisabled',{value:false});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate();
 assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'),'auto');
 assert.equal(errors.length,0,errors.join('\n'));
 const report={passed:true,widths:results,interactions:['mobile navigation + Escape + focus return','category dropdown','review full text','video playback','menu search + clear + 14 popular dishes','interior overflow at desktop and mobile','no-JS navigation + menu + native video controls','reduced motion'],video,errors};
 await fs.writeFile(output+'results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} finally {ws.close();await fetch('http://127.0.0.1:9334/json/close/'+target.id);}
