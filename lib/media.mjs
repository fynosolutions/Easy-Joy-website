import {escape as e,foodImage} from './site.mjs';
export function filmSection(media) {
 const film=media.film;
 const stills=media.lifestylePhotos?.filter(photo=>['skewers-on-the-grill','squid-on-the-grill'].includes(photo.id)) || media.photos.filter(photo=>['上海小笼包','椰子鸡套餐'].includes(photo.chineseName));
 return `<section class="section film-section" id="easyjoy-film" aria-labelledby="film-heading"><div class="container film-layout"><div class="film-story"><p class="eyebrow">INSIDE EASY JOY · CHINATOWN, NYC</p><h2 id="film-heading">A taste of<br><em>Easy Joy.</em></h2><p>From a steaming hot pot to a table of dim sum. Take a little look inside, then come share a meal with us.</p><a class="text-link film-watch-link" href="#film-player">Watch the film <span aria-hidden="true">↗</span></a><div class="film-stills">${stills.map(photo=>`<figure>${foodImage(photo,'film-still')}<figcaption>${e(photo.englishName)}</figcaption></figure>`).join('')}</div></div><div class="film-frame"><div class="film-player-wrap"><video id="film-player" controls playsinline preload="none" poster="${e(film.poster)}" width="${film.width}" height="${film.height}" aria-label="Easy Joy restaurant promotional film"><source src="${e(film.mobileSrc)}" type="video/mp4" media="(max-width: 600px)"><source src="${e(film.src)}" type="video/mp4"><a href="${e(film.src)}">Watch the Easy Joy film</a></video><button class="film-play" type="button" aria-label="Play the Easy Joy film" hidden><span class="film-play-icon" aria-hidden="true">▶</span><span>PLAY THE FILM</span><small>00:20 · EASY JOY</small></button></div><p class="film-caption">DIM SUM. HOT POT. GOOD COMPANY.</p><p class="film-error" role="status" hidden>Having trouble playing? <a href="${e(film.src)}">Open the video directly ↗</a></p></div></div></section>`;
}
export function galleryCard(photo) {
 return `<figure class="food-gallery-card">${foodImage(photo,'gallery-photo')}<figcaption>${e(photo.englishName)}</figcaption></figure>`;
}
export function galleryPreview(media) {
 const names=['上海小笼包','烤羊肉(5串)','蛋挞','牛肉肠粉','椰子鸡套餐','马拉糕'];
 const photos=names.map(name=>media.photos.find(photo=>photo.chineseName===name));
 return `<section class="section container gallery-preview" aria-labelledby="gallery-heading"><div class="section-heading"><div><p class="eyebrow">A TASTE OF EASY JOY</p><h2 id="gallery-heading">Made to be shared.</h2></div><a class="text-link" href="/gallery/">Explore the food gallery ↗</a></div><div class="food-gallery-grid">${photos.map(galleryCard).join('')}</div><p class="fine">${e(media.galleryNotice)}</p></section>`;
}
