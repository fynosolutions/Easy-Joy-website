import asyncio,json,urllib.request,websockets,base64
from pathlib import Path

async def main():
 out=Path(__file__).resolve().parents[1]/'docs/refinement-qa';out.mkdir(parents=True,exist_ok=True)
 seq=0;errors=[];report=[]
 t=json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:9334/json/new?about:blank',method='PUT')))
 async with websockets.connect(t['webSocketDebuggerUrl'],max_size=50000000) as ws:
  async def send(m,p={}):
   nonlocal seq
   seq+=1;await ws.send(json.dumps({'id':seq,'method':m,'params':p}))
   while True:
    r=json.loads(await ws.recv())
    if r.get('method')=='Runtime.exceptionThrown':errors.append(r['params'])
    if r.get('id')==seq:
     assert 'error' not in r,r
     return r.get('result',{})
  async def ev(expr):
   r=await send('Runtime.evaluate',{'expression':expr,'returnByValue':True,'awaitPromise':True,'userGesture':True});assert 'exceptionDetails' not in r,r
   return r['result'].get('value')
  async def shot(name,selector=None):
   clip=await ev("(()=>{const r=document.querySelector("+json.dumps(selector)+").getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()") if selector else {'x':0,'y':0,'width':await ev('innerWidth'),'height':1000,'scale':1}
   if selector:await ev("document.querySelector('.site-header').style.visibility='hidden';document.querySelector('.skip-link').style.visibility='hidden';document.activeElement.blur()")
   data=await send('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True,'clip':clip});(out/(name+'.png')).write_bytes(base64.b64decode(data['data']))
   if selector:await ev("document.querySelector('.site-header').style.visibility='';document.querySelector('.skip-link').style.visibility=''")
  await send('Page.enable');await send('Runtime.enable')
  for width in [1440,1024,768,390,360]:
   await send('Emulation.setDeviceMetricsOverride',{'width':width,'height':1000,'deviceScaleFactor':1,'mobile':False})
   await send('Page.navigate',{'url':'http://127.0.0.1:4173/'});await asyncio.sleep(.5);await ev('document.fonts.ready')
   await ev("Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))")
   state=await ev("({width:innerWidth,scroll:document.documentElement.scrollWidth,font:getComputedStyle(document.body).fontFamily,headingFont:getComputedStyle(document.querySelector('h1')).fontFamily,marquee:document.querySelectorAll('.marquee-track').length,cuisines:document.querySelectorAll('.cuisine-card').length,photos:[...document.querySelectorAll('.atmosphere-grid img')].map(i=>{const r=i.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length})")
   assert state['scroll']<=width,state
   assert 'Kumbh Sans' in state['font'] and 'Kumbh Sans' in state['headingFont'],state
   assert state['marquee']==0 and state['cuisines']==3 and state['broken']==0,state
   a,b=state['photos'];assert abs(a['w']-b['w'])<1 and abs(a['h']-b['h'])<1,state
   if width>600:assert abs(a['y']-b['y'])<1,state
   else:assert b['y']>a['y'] and abs(a['x']-b['x'])<1,state
   report.append(state)
   await ev("document.querySelector('.header-order summary').click()")
   assert await ev("document.querySelector('.header-order .delivery-menu').open")
   panel=await ev("(()=>{let r=document.querySelector('.header-order .delivery-panel').getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom}})()")
   assert panel['left']>=0 and panel['right']<=width and panel['bottom']<=1000,panel
   assert await ev("document.querySelectorAll('.header-order .delivery-panel a').length")==3
   await ev("document.querySelector('.header-order .delivery-panel a').focus()")
   await send('Input.dispatchKeyEvent',{'type':'keyDown','key':'Escape','code':'Escape'})
   assert not await ev("document.querySelector('.header-order .delivery-menu').open")
   assert await ev("document.activeElement.matches('.header-order summary')")
   if width in [1440,390]:
    await shot('hero-'+str(width))
    for name,selector in [('aligned-photos','.atmosphere-grid'),('cuisines','#brand-intro')]:
     await ev('document.querySelector('+json.dumps(selector)+').scrollIntoView()');await asyncio.sleep(.4);await shot(name+'-'+str(width),selector)
  for route in ['/menu/','/about/','/facility/','/location/','/contact/','/gallery/','/faq/']:
   await send('Page.navigate',{'url':'http://127.0.0.1:4173'+route});await asyncio.sleep(.3)
   assert await ev('document.documentElement.scrollWidth<=innerWidth'),route
   assert await ev("document.querySelectorAll('.header-order .delivery-panel a').length")==3
  await send('Emulation.setScriptExecutionDisabled',{'value':True});await send('Page.navigate',{'url':'http://127.0.0.1:4173/'});await asyncio.sleep(.4)
  await ev("document.querySelector('.header-order .delivery-menu').open=true")
  assert await ev("document.querySelector('.header-order .delivery-panel a').getBoundingClientRect().height>0")
  assert not errors,errors
  (out/'results.json').write_text(json.dumps({'passed':True,'viewports':report,'errors':errors,'deliveryKeyboardAndNoJS':True},indent=2),encoding='utf-8')
  print('PASS responsive layouts, equal photos, fonts, images, delivery links, Escape/focus return, no-JS details and interior mobile pages')
 urllib.request.urlopen('http://127.0.0.1:9334/json/close/'+t['id']).read()
asyncio.run(main())
