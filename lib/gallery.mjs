// Gallery page: the meal as a story (pot → dim sum → grill → together), own photos + Instagram/TikTok moments, then every food photo.
import {escape as e} from './site.mjs';
import {brandIcon} from './icons.mjs';
import {galleryCard} from './media.mjs';

const src = it => it.type === 'instagram' ? `<span class="g-src">${brandIcon('instagram', 15)}@${e(it.handle)}<span class="sr-only"> on Instagram</span></span>`
  : it.type === 'tiktok' ? `<span class="g-src">${brandIcon('tiktok', 15)}@${e(it.handle)}<span class="sr-only"> on TikTok</span></span>`
  : it.type === 'film' ? '<span class="g-src">Easy Joy film</span>' : '';
const link = it => it.url ? `<a class="g-out" href="${e(it.url)}" target="_blank" rel="noopener">View on ${it.type === 'tiktok' ? 'TikTok' : 'Instagram'} ↗</a>` : '';

function media(it) {
  if (it.type === 'photo') return `<img src="${e(it.imageSmall || it.image)}" srcset="${e(it.imageSmall || it.image)} ${Math.min(it.w, 960)}w, ${e(it.image)} ${it.w}w" sizes="(max-width:700px) 100vw, 50vw" width="${it.w}" height="${it.h}" alt="${e(it.alt)}" loading="lazy" decoding="async" style="object-position:${e(it.position || 'center')}">`;
  if (it.loop) return `<video data-gallery-loop muted loop playsinline preload="none" poster="${e(it.poster)}"${it.position ? ` style="object-position:${e(it.position)}"` : ''} width="${it.w}" height="${it.h}" aria-label="${e(it.alt)}"><source src="${e(it.loop)}" type="video/mp4"></video>`;
  return `<a class="g-cover" href="${e(it.url)}" target="_blank" rel="noopener" aria-label="${e(it.caption)}, @${e(it.handle)} on Instagram (opens Instagram)"><img src="${e(it.poster)}" width="${it.w}" height="${it.h}" alt="${e(it.alt)}" loading="lazy" decoding="async"><span class="g-play" aria-hidden="true">${brandIcon('instagram', 18)}</span></a>`;
}
const card = (it, cls) => `<figure class="g-item g-${it.type} ${cls}"><div class="g-media">${media(it)}</div><figcaption><span class="g-caption">${e(it.caption)}</span>${src(it)}${link(it)}</figcaption></figure>`;

function chapter(c) {
  const [first, ...rest] = c.items;
  const main = it => card(it, 'g-main');
  const side = it => card(it, it.type === 'photo' ? 'g-side g-side-photo' : 'g-side');
  const rowItem = it => card(it, it.type === 'photo' ? 'g-side g-side-photo' : 'g-side');
  const body = c.layout === 'main-right' ? [...c.items.slice(0, -1).map(side), main(c.items.at(-1))].join('')
    : c.layout === 'wide-then-pins' ? `${card(first, 'g-wide g-wide-pinned')}<div class="g-pins">${rest.map(it => card(it, 'g-pin')).join('')}<div class="g-tag"><p>Eating with us?</p><p>Tag <a href="https://www.instagram.com/easyjoybuffet/" target="_blank" rel="noopener">@easyjoybuffet</a> on Instagram or <a href="https://www.tiktok.com/@easyjoyhotpot" target="_blank" rel="noopener">@easyjoyhotpot</a> on TikTok. Your table could be next on this page.</p></div></div>`
    : c.layout === 'wide-then-row' ? `${card(first, 'g-wide')}${rest.map(rowItem).join('')}`
    : [main(first), ...rest.map(side)].join('');
  return `<section class="g-chapter container" id="g-${c.id}" aria-labelledby="g-${c.id}-title"><div class="g-head"><h2 id="g-${c.id}-title">${e(c.title)}</h2><p>${e(c.text)}</p></div><div class="g-grid g-${c.layout}">${body}</div></section>`;
}

export function renderGallery({r, media, gallery, intro}) {
  const v = media.hotpotVideo;
  const hero = `<section class="g-hero container" aria-label="Easy Joy at a glance"><div class="g-hero-film"><video data-gallery-loop data-gallery-hero muted loop playsinline preload="none" poster="${e(gallery.heroPoster || v.poster)}" width="1280" height="720" aria-label="Hot pot, dim sum and skewers at Easy Joy"><source src="${e(gallery.heroLoopMobile || v.loopMobileSrc)}" type="video/mp4" media="(max-width: 600px)"><source src="${e(gallery.heroLoop || v.loopSrc || v.src)}" type="video/mp4"></video><a class="g-full-film" href="${e(v.src)}" target="_blank" rel="noopener">Watch the full film with sound (2:48) ↗</a></div><figure class="g-sign"><img src="${e(gallery.sign.imageSmall)}" srcset="${e(gallery.sign.imageSmall)} 480w, ${e(gallery.sign.image)} 705w" sizes="(max-width:700px) 40vw, 360px" width="${gallery.sign.w}" height="${gallery.sign.h}" alt="${e(gallery.sign.alt)}" decoding="async"><figcaption><strong>Look for the yellow sign</strong><span>145 Mulberry St</span><span>Chinatown,&nbsp;NYC</span></figcaption></figure></section>`;
  const nav = `<nav class="g-chapters container" aria-label="Gallery sections">${gallery.chapters.map(c => `<a href="#g-${c.id}">${e(c.title)}</a>`).join('')}<a href="#g-photos">All food photos</a></nav>`;
  // Interleave the four groups so look-alike dishes (three soup dumplings) never sit side by side.
  const byGroup = media.groups.map(g => media.photos.filter(p => p.group === g.id));
  const all = []; for (let i = 0; all.length < media.photos.length; i++) byGroup.forEach(list => list[i] && all.push(list[i]));
  const photos = `<section class="g-photos container" id="g-photos" aria-labelledby="g-photos-title"><div class="g-head"><h2 id="g-photos-title">All food photos</h2><p>${all.length} dishes from our menu. ${e(media.galleryNotice.replace(/^Explore our food in photos\.\s*/, ''))}</p></div><div class="g-filter" role="group" aria-label="Filter food photos"><button type="button" aria-pressed="true" data-g-filter="all">All</button>${media.groups.map(g => `<button type="button" aria-pressed="false" data-g-filter="${e(g.id)}">${e(g.label)}</button>`).join('')}</div><div class="food-gallery-grid g-photo-grid">${all.map(p => galleryCard(p).replace('<figure class="food-gallery-card"', `<figure class="food-gallery-card" data-g-group="${e(p.group)}"`)).join('')}</div><div class="g-more-row"><button class="button g-more" type="button" hidden>Show all ${all.length} photos</button><p class="g-count" aria-live="polite"></p></div></section>`;
  const close = `<section class="g-close container"><h2>Come hungry.<br><em>Find the yellow sign.</em></h2><div class="actions"><a class="button" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">${brandIcon('yelp', 18)} Reserve a table</a><a class="text-link" href="${e(r.directionsUrl)}">Get directions ↗</a></div><p class="g-follow"><span>Follow along:</span> <span class="nowrap"><a href="https://www.instagram.com/easyjoybuffet/" target="_blank" rel="noopener">Instagram @easyjoybuffet ↗</a></span><span class="g-dot" aria-hidden="true"> · </span><span class="nowrap"><a href="https://www.tiktok.com/@easyjoyhotpot" target="_blank" rel="noopener">TikTok @easyjoyhotpot ↗</a></span></p></section>`;
  return `<div class="gallery-page">${intro('THE EASY JOY TABLE', gallery.title, gallery.lead)}${hero}${nav}${gallery.chapters.map(chapter).join('')}${photos}${close}</div>`;
}
