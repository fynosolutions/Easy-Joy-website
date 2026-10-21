"""Regenerate WebP assets from content/media.json. Requires Pillow; not part of npm build."""
import json
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
media = json.loads((root / 'content/media.json').read_text())
for photo in [*media['photos'], *media.get('lifestylePhotos', [])]:
    original = root.parent / photo['sourceFile']
    with Image.open(original) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        for key, size in [('imageSmall', 480), ('image', 960)]:
            target = root / photo[key].lstrip('/')
            target.parent.mkdir(parents=True, exist_ok=True)
            output = image.copy()
            output.thumbnail((size, size))
            output.save(target, 'WEBP', quality=82, method=6)
print(f"Prepared {len(media['photos'])} images in two sizes.")
