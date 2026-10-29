"""Exercise real input and browser navigation, rather than synthetic element.click()."""
import asyncio
import json
import urllib.request
import websockets

BASE = 'http://127.0.0.1:9334'

async def main():
    target = json.load(urllib.request.urlopen(urllib.request.Request(BASE + '/json/new?about:blank', method='PUT')))
    seq = 0
    opened = []
    async with websockets.connect(target['webSocketDebuggerUrl'], max_size=50000000) as ws:
        async def send(method, params=None):
            nonlocal seq
            seq += 1
            await ws.send(json.dumps(dict(id=seq, method=method, params=params or {})))
            while True:
                message = json.loads(await ws.recv())
                if message.get('method') == 'Page.windowOpen':
                    opened.append(message['params'])
                if message.get('id') == seq:
                    assert 'error' not in message, message
                    return message.get('result', {})

        async def ev(expression):
            result = await send('Runtime.evaluate', dict(expression=expression, returnByValue=True, awaitPromise=True))
            assert 'exceptionDetails' not in result, result
            return result['result'].get('value')

        async def click(selector, touch=False):
            point = await ev("(()=>{const e=document.querySelector(" + json.dumps(selector) + ");e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
            if touch:
                await send('Input.dispatchTouchEvent', dict(type='touchStart', touchPoints=[point]))
                await send('Input.dispatchTouchEvent', dict(type='touchEnd', touchPoints=[]))
            else:
                await send('Input.dispatchMouseEvent', dict(type='mousePressed', button='left', clickCount=1, **point))
                await send('Input.dispatchMouseEvent', dict(type='mouseReleased', button='left', clickCount=1, **point))
            await asyncio.sleep(.1)

        await send('Page.enable')
        for width, touch in [(1440, False), (390, True)]:
            await send('Emulation.setDeviceMetricsOverride', dict(width=width, height=1000, deviceScaleFactor=1, mobile=touch))
            await send('Emulation.setTouchEmulationEnabled', dict(enabled=touch))
            await send('Page.navigate', dict(url='http://127.0.0.1:4173/'))
            await asyncio.sleep(.7)
            await ev("window.inputLog=[];['pointerdown','focusout','focusin','click'].forEach(type=>document.addEventListener(type,e=>inputLog.push({type,target:e.target.tagName,active:document.activeElement.tagName,related:e.relatedTarget?.tagName}),true))")
            for i in range(1, 4):
                await click('.header-order summary', touch)
                selector = f'.header-order .delivery-panel a:nth-of-type({i})'
                href = await ev('document.querySelector(' + json.dumps(selector) + ').href')
                before = len(opened)
                await click(selector, touch)
                await ev('true')
                assert len(opened) == before + 1 and opened[-1]['url'] == href and opened[-1]['userGesture'], dict(width=width, link=i, opened=opened, events=await ev('inputLog'))
                await ev("document.querySelector('.header-order .delivery-menu').open=false")
            print(f'PASS {width}px: all three delivery links open via {"touch" if touch else "mouse"}')
            await click('.header-order summary', touch)
            await send('Input.dispatchKeyEvent', dict(type='keyDown', key='Tab', code='Tab', windowsVirtualKeyCode=9))
            await send('Input.dispatchKeyEvent', dict(type='keyUp', key='Tab', code='Tab', windowsVirtualKeyCode=9))
            assert await ev("document.activeElement.matches('.header-order .delivery-panel a')")
            before = len(opened)
            await send('Input.dispatchKeyEvent', dict(type='keyDown', key='Enter', code='Enter', windowsVirtualKeyCode=13))
            await send('Input.dispatchKeyEvent', dict(type='keyUp', key='Enter', code='Enter', windowsVirtualKeyCode=13))
            await ev('true')
            assert len(opened) == before + 1
            await send('Input.dispatchKeyEvent', dict(type='keyDown', key='Escape', code='Escape'))
            assert await ev("!document.querySelector('.header-order .delivery-menu').open && document.activeElement.matches('.header-order summary')")
            await click('.header-order summary', touch)
            await ev("document.querySelector('.brand').focus()")
            assert await ev("!document.querySelector('.header-order .delivery-menu').open")
            print('PASS keyboard activation, Escape focus return and focus-out dismissal')
    urllib.request.urlopen(BASE + '/json/close/' + target['id']).read()

asyncio.run(main())
