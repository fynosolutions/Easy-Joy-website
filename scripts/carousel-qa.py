import asyncio, json, urllib.request, websockets, base64
from pathlib import Path

async def main():
    target=json.load(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:9334/json/new?about:blank',method='PUT')))
    out=Path('docs/carousel-qa');out.mkdir(exist_ok=True)
    n=0
    async with websockets.connect(target['webSocketDebuggerUrl'],max_size=50000000) as ws:
        async def send(method,params=None):
            nonlocal n
            n+=1;await ws.send(json.dumps(dict(id=n,method=method,params=params or {})))
            while True:
                r=json.loads(await ws.recv())
                if r.get('id')==n:
                    assert 'error' not in r,r
                    return r.get('result',{})
        async def ev(expr):
            r=await send('Runtime.evaluate',dict(expression=expr,returnByValue=True,awaitPromise=True,userGesture=True))
            assert 'exceptionDetails' not in r,r
            return r['result'].get('value')
        state="(()=>{let c=document.querySelector('.signature-carousel'),a=[...c.querySelectorAll('.signature-slide:not([data-loop-copy])')];return {left:c.scrollLeft,step:a[1].offsetLeft-a[0].offsetLeft,cycle:a[0].offsetLeft-c.querySelector('.signature-slide').offsetLeft,time:performance.now()}})()"
        async def stationary():
            a=await ev(state);await asyncio.sleep(.3);b=await ev(state);assert abs(a['left']-b['left'])<2,(a,b)
        for width in [1440,1024,768,390,360]:
            await send('Emulation.setDeviceMetricsOverride',dict(width=width,height=1000,deviceScaleFactor=1,mobile=False))
            await send('Page.navigate',dict(url='http://127.0.0.1:4173/'));await asyncio.sleep(.4)
            await ev("document.fonts.ready")
            await ev("document.documentElement.style.scrollBehavior='auto';document.querySelector('.signature-carousel').scrollIntoView({block:'center',behavior:'instant'})")
            await ev("Promise.all([...document.querySelectorAll('.signature-image')].map(i=>{i.loading='eager';return i.decode()}))")
            await asyncio.sleep(.2)
            assert await ev("document.querySelectorAll('.signature-slide:not([data-loop-copy])').length===10 && new Set([...document.querySelectorAll('.signature-slide:not([data-loop-copy]) h3')].map(e=>e.textContent)).size===10")
            assert await ev("[...document.querySelectorAll('[data-loop-copy]')].every(e=>e.tabIndex===-1 && e.getAttribute('aria-hidden')==='true')")
            assert await ev('document.documentElement.scrollWidth<=innerWidth')
            a=await ev(state);await asyncio.sleep(2);b=await ev(state)
            distance=(a['left']-b['left'])%a['cycle'];expected=a['step']*(b['time']-a['time'])/10000
            assert abs(distance-expected)<max(5,expected*.15),(width,distance,expected)
            await ev("document.querySelector('.carousel-pause').click()")
            await stationary()
            await ev("document.querySelector('[data-carousel-step=\"1\"]').click()")
            await asyncio.sleep(.2)
            assert (await ev(state))['left']!=b['left']
            await ev("document.querySelector('.carousel-pause').click();document.querySelector('.signature-carousel').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch'}))")
            await stationary()
            await ev("window.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch'}))")
            await ev("document.querySelector('.signature-slide:not([data-loop-copy])').focus()")
            await stationary()
            await ev("document.activeElement.blur()")
            if width in [1440,390]:
                await ev("document.querySelector('.carousel-pause').click();document.querySelector('#menu-highlights').scrollIntoView({behavior:'instant'});document.querySelector('.site-header').style.visibility='hidden';document.querySelector('.back-to-top').style.visibility='hidden'")
                clip=await ev("(()=>{let r=document.querySelector('#menu-highlights').getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()")
                shot=await send('Page.captureScreenshot',dict(format='png',captureBeyondViewport=True,clip=clip));(out/f'carousel-{width}.png').write_bytes(base64.b64decode(shot['data']))
            print('PASS',width,'10 unique cards, rightward speed, pause/manual/touch/focus and no overflow')
        await send('Emulation.setEmulatedMedia',dict(features=[dict(name='prefers-reduced-motion',value='reduce')]))
        await send('Page.navigate',dict(url='http://127.0.0.1:4173/'));await asyncio.sleep(.3)
        await ev("document.querySelector('.signature-carousel').scrollIntoView({block:'center',behavior:'instant'})")
        await stationary()
        assert await ev("document.querySelector('.carousel-pause').disabled")
        await send('Emulation.setScriptExecutionDisabled',dict(value=True))
        await send('Page.navigate',dict(url='http://127.0.0.1:4173/'));await asyncio.sleep(.3)
        assert await ev("document.querySelectorAll('.signature-slide').length===10 && document.querySelectorAll('[data-loop-copy]').length===0")
        print('PASS reduced motion and no-JS static content')
    urllib.request.urlopen('http://127.0.0.1:9334/json/close/'+target['id']).read()

asyncio.run(main())
