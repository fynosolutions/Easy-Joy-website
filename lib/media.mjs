import {escape as e,foodImage} from './site.mjs';
export function filmSection(media) {
 const film=media.film;
 return `<section class="section film-section" id="easyjoy-film" aria-labelledby="film-heading"><div class="container film-layout"><div class="film-story"><p class="eyebrow">INSIDE EASY JOY · CHINATOWN, NYC</p><h3 id="film-heading">A moment inside Easy Joy</h3><p>From steaming hot pot and handcrafted dim sum to BBQ skewers. Take a little look inside, then come share a meal with us.</p><a class="text-link film-watch-link" href="#film-player">Watch the film <span aria-hidden="true">↗</span></a></div><div class="film-frame"><div class="film-player-wrap"><video id="film-player" controls playsinline preload="none" poster="${e(film.poster)}" width="${film.width}" height="${film.height}" aria-label="Easy Joy restaurant promotional film"><source src="${e(film.mobileSrc)}" type="video/mp4" media="(max-width: 600px)"><source src="${e(film.src)}" type="video/mp4"><a href="${e(film.src)}">Watch the Easy Joy film</a></video><button class="film-play" type="button" aria-label="Play the Easy Joy film" hidden><span class="film-play-icon" aria-hidden="true">▶</span><span>PLAY THE FILM</span><small>00:20 · EASY JOY</small></button></div><p class="film-caption">HOT POT. DIM SUM. BBQ SKEWERS.</p><p class="film-error" role="status" hidden>Having trouble playing? <a href="${e(film.src)}">Open the video directly ↗</a></p></div></div></section>`;
}
export function galleryCard(photo) {
 return `<figure class="food-gallery-card">${foodImage(photo,'gallery-photo')}<figcaption>${e(photo.englishName)}</figcaption></figure>`;
}
export function galleryPreview(media) {
 const names=['上海小笼包','烤羊肉(5串)','蛋挞','牛肉肠粉','椰子鸡套餐','马拉糕'];
 const photos=names.map(name=>media.photos.find(photo=>photo.chineseName===name));
 return `<section class="section container gallery-preview" aria-labelledby="gallery-heading"><div class="section-heading"><div><p class="eyebrow">A TASTE OF EASY JOY</p><h2 id="gallery-heading">Made to be shared.</h2></div><a class="text-link" href="/gallery/">Explore the food gallery ↗</a></div><div class="food-gallery-grid">${photos.map(galleryCard).join('')}</div><p class="fine">${e(media.galleryNotice)}</p></section>`;
}

export function hotpotVideo(media) {
 const video = media.hotpotVideo;
 const content = video.src
  ? `<video class="hotpot-player" controls playsinline preload="none" width="1920" height="1080"${video.poster ? ` poster="${e(video.poster)}"` : ''} aria-label="${e(video.title)}">${video.mobileSrc ? `<source src="${e(video.mobileSrc)}" type="video/mp4" media="(max-width: 600px)">` : ''}<source src="${e(video.src)}" type="video/mp4"><a href="${e(video.src)}">Watch the hot pot video</a></video>`
  : `<div class="hotpot-video-placeholder" role="img" aria-label="Hot pot video coming soon"><svg viewBox="0 0 64 48" width="64" height="48" fill="none" aria-hidden="true"><rect x="1" y="1" width="62" height="46" rx="8" stroke="currentColor" stroke-width="2"/><path d="m27 16 13 8-13 8V16Z" fill="currentColor"/></svg><span class="hotpot-video-title">At the Easy Joy table</span><span class="hotpot-video-status">Film coming soon</span></div>`;
 return `<figure class="hotpot-media"><div class="hotpot-video-frame">${content}</div><figcaption>${e(video.caption)}${video.src ? ` <a href="${e(video.src)}" target="_blank" rel="noopener">Open video directly ↗</a>` : ''}</figcaption></figure>`;
}
