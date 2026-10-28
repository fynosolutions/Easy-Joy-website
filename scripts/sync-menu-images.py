"""Fill missing menu photos from the reviewed public source manifest.

Requires Pillow. Does not change names, prices, availability, order or anchors.
The website build itself has no Python or network dependency.
"""
import concurrent.futures
import io
import json
from pathlib import Path
import time
import urllib.request
from urllib.parse import urlparse
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'content/menu-source-assets.json').read_text(encoding='utf-8'))
menu_path = ROOT / 'content/menu.json'
menu = json.loads(menu_path.read_text(encoding='utf-8'))
categories = {c['name']: c for c in menu['categories'] if not c.get('isRecommendationGroup')}


def prepare(row):
    item = categories[row['category']]['items'][row['itemIndex']]
    assert item['name'] == row['name'], 'Manifest no longer matches menu'
    if item.get('image') or not row['imageUrl']:
        return row, None
    url = row['imageUrl']
    assert urlparse(url).scheme == 'https' and urlparse(url).hostname == 'pixel.menusifu.com'
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(request, timeout=45) as response:
                data = response.read()
            with Image.open(io.BytesIO(data)) as source:
                photo = ImageOps.exif_transpose(source).convert('RGB')
                assert min(photo.size) >= 32, 'Unexpectedly small source image'
                metadata = {'alt': item['name'], 'imageSourceUrl': url,
                            'imageSourceItemId': row['sourceItemId'],
                            'imageVerifiedAt': manifest['verifiedAt']}
                for key, size in [('image', 960), ('imageSmall', 480)]:
                    result = photo.copy()
                    result.thumbnail((size, size))
                    path = f'/assets/images/ordering/menu-{row["sourceItemId"]}-{size}.webp'
                    target = ROOT / path.lstrip('/')
                    target.parent.mkdir(parents=True, exist_ok=True)
                    result.save(target, 'WEBP', quality=84, method=6)
                    metadata[key] = path
                    if key == 'image':
                        metadata.update(width=result.width, height=result.height)
                    else:
                        metadata['imageSmallWidth'] = result.width
                return row, metadata
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


if __name__ == '__main__':
    # Commit menu metadata only after every download and image decode succeeded.
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        prepared = list(pool.map(prepare, manifest['items']))
    added = 0
    for row, metadata in prepared:
        if metadata:
            categories[row['category']]['items'][row['itemIndex']].update(metadata)
            added += 1
    for group in menu['categories']:
        if not group.get('isRecommendationGroup'):
            continue
        for item in group['items']:
            canonical = next(i for i in categories[item['canonicalCategory']]['items']
                             if i['name'] == item['name'] and i.get('variant') == item.get('variant'))
            for key in ['image', 'imageSmall', 'width', 'height', 'imageSmallWidth', 'alt',
                        'imageSourceUrl', 'imageSourceItemId', 'imageVerifiedAt']:
                if key in canonical:
                    item[key] = canonical[key]
    menu_path.write_text(json.dumps(menu, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Added {added} official ordering photos; existing photos and menu facts preserved.')
