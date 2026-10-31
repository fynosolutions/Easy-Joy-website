import asyncio,json,urllib.request,websockets

async def main():
    target=json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:9334/json/new?about:blank',method='PUT')))
    n=0
    async with websockets.connect(target['webSocketDebuggerUrl']) as ws:
        async def send(method,params=None):
            nonlocal n
            n+=1;await ws.send(json.dumps(dict(id=n,method=method,params=params or {})))
            while True:
                r=json.loads(await ws.recv())
                if r.get('id')==n:
                    assert 'error' not in r,r
                    return r.get('result',{})
        async def ev(expr):
            r=await send('Runtime.evaluate',dict(expression=expr,returnByValue=True,awaitPromise=True));assert 'exceptionDetails' not in r,r
            return r['result'].get('value')
        async def click(selector,touch=False):
            point=await ev("(()=>{let e=document.querySelector("+json.dumps(selector)+");e.scrollIntoView({block:'center',behavior:'instant'});let r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
            if touch:
                await send('Input.dispatchTouchEvent',dict(type='touchStart',touchPoints=[point]));await send('Input.dispatchTouchEvent',dict(type='touchEnd',touchPoints=[]))
            else:
                for event in ['mousePressed','mouseReleased']:await send('Input.dispatchMouseEvent',dict(type=event,button='left',clickCount=1,**point))
        async def load(path='/'):
            await send('Page.navigate',dict(url='http://127.0.0.1:4173'+path));await asyncio.sleep(.18)
            await ev("document.documentElement.style.scrollBehavior='auto'")
        for width in [1440,390]:
            touch=width<600
            await send('Emulation.setDeviceMetricsOverride',dict(width=width,height=1000,deviceScaleFactor=1,mobile=touch))
            await send('Emulation.setTouchEmulationEnabled',dict(enabled=touch))
            for index in range(14):
                await load('/' if index%2==0 else '/menu/')
                if touch:await click('.mobile-nav-toggle',True)
                await click('.category-toggle',touch)
                selector='.dropdown-heading>a' if index==0 else f'#category-dropdown li:nth-child({index}) a'
                expected=await ev('document.querySelector('+json.dumps(selector)+').href')
                await click(selector,touch);await asyncio.sleep(.25)
                actual=await ev('location.href')
                assert actual==expected,(width,index,expected,actual)
                if '#' in expected:assert await ev("!!document.querySelector(location.hash) && !document.querySelector(location.hash).hidden")
            print('PASS',width,'full menu, all 12 categories and drinks link via', 'touch' if touch else 'mouse')
            await load()
            ratio=await ev("(()=>{let v=document.querySelector('.table-film .hotpot-media').getBoundingClientRect(),p=document.querySelector('.table-film-layout').getBoundingClientRect(),h=document.querySelector('.table-film-heading').getBoundingClientRect();return {ratio:v.width/p.width,left:v.right<=h.left,below:v.top>=h.bottom}})()")
            assert abs(ratio['ratio']-(1 if touch else .65))<.005 and ratio['below' if touch else 'left'],ratio
            print('PASS responsive video placement',width)
        await send('Emulation.setDeviceMetricsOverride',dict(width=1440,height=1000,deviceScaleFactor=1,mobile=False))
        await load()
        await ev("document.querySelector('.category-toggle').focus()")
        await send('Input.dispatchKeyEvent',dict(type='keyDown',key='ArrowDown',code='ArrowDown',windowsVirtualKeyCode=40))
        assert await ev("!document.querySelector('#category-dropdown').hidden && document.activeElement.matches('#category-dropdown a')")
        await send('Input.dispatchKeyEvent',dict(type='keyDown',key='Enter',code='Enter',windowsVirtualKeyCode=13));await asyncio.sleep(.3)
        assert await ev("location.pathname==='/menu/'")
        await click('.category-toggle')
        await send('Input.dispatchKeyEvent',dict(type='keyDown',key='Escape',code='Escape',windowsVirtualKeyCode=27))
        assert await ev("document.querySelector('#category-dropdown').hidden && document.activeElement.matches('.category-toggle')")
        print('PASS keyboard open, navigate, Escape/focus return')
    urllib.request.urlopen('http://127.0.0.1:9334/json/close/'+target['id']).read()

asyncio.run(main())
