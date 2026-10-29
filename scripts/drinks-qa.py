"""Check drinks navigation, image/PDF links and food filtering in the local preview."""
import asyncio, base64, json, urllib.request
from pathlib import Path
import websockets

async def main():
    base = 'http://127.0.0.1:9334'
    target = json.load(urllib.request.urlopen(urllib.request.Request(base + '/json/new?about:blank', method='PUT')))
    out = Path(__file__).resolve().parents[1] / 'docs/drinks-qa'
    out.mkdir(exist_ok=True)
    seq = 0
    opened, errors = [], []
    async with websockets.connect(target['webSocketDebuggerUrl'], max_size=50000000) as ws:
        async def send(method, params=None):
            nonlocal seq
            seq += 1
            await ws.send(json.dumps(dict(id=seq, method=method, params=params or {})))
            while True:
                result = json.loads(await ws.recv())
                if result.get('method') == 'Page.windowOpen': opened.append(result['params']['url'])
                if result.get('method') == 'Runtime.exceptionThrown': errors.append(result['params'])
                if result.get('id') == seq:
                    assert 'error' not in result, result
                    return result.get('result', {})
        async def ev(expression):
            result = await send('Runtime.evaluate', dict(expression=expression, returnByValue=True, awaitPromise=True))
            assert 'exceptionDetails' not in result, result
            return result['result'].get('value')
        async def click(selector):
            point = await ev("(()=>{let e=document.querySelector(" + json.dumps(selector) + ");e.scrollIntoView({block:'center',behavior:'instant'});let r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
            for event in ['mousePressed','mouseReleased']:
                await send('Input.dispatchMouseEvent', dict(type=event, button='left', clickCount=1, **point))
        await send('Page.enable'); await send('Runtime.enable')
        await send('Emulation.setEmulatedMedia', {'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
        for width in [1440,1024,768,390,360]:
            await send('Emulation.setDeviceMetricsOverride', dict(width=width,height=1000,deviceScaleFactor=1,mobile=False))
            await send('Page.navigate', dict(url='http://127.0.0.1:4173/menu/'))
            await asyncio.sleep(.4)
            await ev('document.fonts.ready')
            await click('.page-intro a[href="#drinks-menu"]')
            await asyncio.sleep(.3)
            await ev("document.querySelector('.drinks-artwork img').decode()")
            assert await ev("location.hash==='#drinks-menu'")
            assert await ev('document.documentElement.scrollWidth<=innerWidth')
            assert await ev("document.querySelectorAll('.dish').length===152 && document.querySelectorAll('[data-category]').length===12")
            assert await ev("document.querySelector('.drinks-artwork img').naturalWidth>0")
            assert await ev("document.querySelector('#category-jump').value==='drinks-menu'")
            if width in [1440,390]:
                shot = await send('Page.captureScreenshot', dict(format='png'))
                (out / f'drinks-{width}.png').write_bytes(base64.b64decode(shot['data']))
            await click('.drinks-artwork a'); await ev('true')
            assert opened[-1].endswith('/assets/menus/drinks-menu-1890.webp')
            await click('.drinks-heading a[type="application/pdf"]'); await ev('true')
            assert opened[-1].endswith('/assets/menus/easy-joy-drinks-menu.pdf')
            await ev("(()=>{let input=document.querySelector('#menu-search');input.value='zzzznomatch';input.dispatchEvent(new Event('input'));window.scrollTo({top:0,behavior:'instant'})})()")
            assert await ev("!document.querySelector('#no-results').hidden && !document.querySelector('#drinks-menu').hidden")
            await ev("(()=>{let select=document.querySelector('#category-jump');select.value='drinks-menu';select.dispatchEvent(new Event('change'))})()")
            await asyncio.sleep(.3)
            assert await ev("document.querySelectorAll('.dish:not([hidden])').length===152 && location.hash==='#drinks-menu'")
            print(f'PASS {width}px: layout, drinks links, food counts, search and category navigation')
        await send('Emulation.setScriptExecutionDisabled', dict(value=True))
        await send('Page.navigate', dict(url='http://127.0.0.1:4173/menu/'))
        await asyncio.sleep(.4)
        await click('.page-intro a[href="#drinks-menu"]')
        assert await ev("location.hash==='#drinks-menu'")
        await click('.drinks-artwork a'); await ev('true')
        assert opened[-1].endswith('drinks-menu-1890.webp')
        assert not errors, errors
        print('PASS no-JS drinks navigation/image link; no runtime exceptions')
    response = urllib.request.urlopen('http://127.0.0.1:4173/assets/menus/easy-joy-drinks-menu.pdf')
    assert response.headers.get_content_type() == 'application/pdf'
    assert response.read(5) == b'%PDF-'
    print('PASS PDF served with browser-viewable MIME type')
    urllib.request.urlopen(base + '/json/close/' + target['id']).read()

asyncio.run(main())
