import {escape as e, slug, addressLine, foodImage} from './site.mjs';
import {hotpotVideo} from './media.mjs';
import {locationMap} from './map.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const sceneImage = image => `<div class="scene-visual" data-parallax><img src="${e(image.image)}" alt="${e(image.alt)}" style="object-position:${e(image.position)}" ${image.imageSmall ? ` srcset="${e(image.imageSmall)} 960w, ${e(image.image)} 1920w" sizes="100vw"` : ''} width="1920" height="1280" loading="lazy" decoding="async"></div>`;

export function renderHome(r, about, media, reviews, categories, home) {
  const featured = [
    ['上海小笼包', 'From the steamer'], ['烤羊肉(5串)', 'From the grill'],
    ['蛋挞', 'A sweet little finish'], ['牛肉肠粉', 'A dim sum favorite'],
    ['椰子鸡套餐', 'Explore our mini hot pots'], ['马拉糕', 'Something to share']
  ];
  const cards = featured.map(([name, tagline], index) => {
    const photo = media.photos.find(photo => photo.chineseName === name);
    const category = photo.menuName && categories.find(c => c.items.some(item => item.name === photo.menuName));
    const href = category ? `/menu/${slug(category.name)}/#dish-${slug(category.name)}-${category.items.findIndex(item => item.name === photo.menuName) + 1}` : `/gallery/#gallery-${photo.group}`;
    return `<a class="signature-slide" href="${href}" aria-label="${e(photo.englishName)} — ${category ? 'view menu item' : 'explore food gallery'}"><span class="signature-number" aria-hidden="true">0${index + 1}</span>${foodImage(photo, 'signature-image')}<div class="signature-copy"><p>${e(tagline)}</p><h3>${e(photo.englishName)}</h3><span class="signature-link">${category ? 'View menu item' : 'Explore gallery'} ${arrow}</span></div></a>`;
  }).join('');
  const reviewCards = reviews.items.map(item => {
    const excerpt = item.paragraphs[0].match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || item.paragraphs[0];
    return `<article class="review-card" data-home-reveal><p class="review-stars"><span role="img" aria-label="${item.sourceDisplayedStars} out of 5 stars, as displayed on our previous website">${'★'.repeat(item.sourceDisplayedStars)}</span></p><blockquote><p>${e(excerpt)}</p></blockquote><details><summary>Read full review<span class="sr-only"> about ${e(item.topic)}</span></summary><div class="review-full">${item.paragraphs.map(p => `<p>${e(p)}</p>`).join('')}</div></details></article>`;
  }).join('');
  const repeat = (text, outline = false) => `<div class="brand-marquee${outline ? ' outline' : ''}" aria-hidden="true"><div class="marquee-track"><span>${text} &nbsp;✳&nbsp; ${text} &nbsp;✳&nbsp; </span><span>${text} &nbsp;✳&nbsp; ${text} &nbsp;✳&nbsp; </span></div></div>`;
  const video = home.hero.videoSrc ? `<video class="hero-motion-video" muted loop playsinline preload="none" poster="${e(home.hero.image)}" aria-label="Easy Joy restaurant atmosphere"><source src="${e(home.hero.videoSrc)}" type="video/mp4"></video>` : '';

  return `<div class="home-editorial">
  <section class="cinema-hero" aria-labelledby="hero-title">
    <div class="hero-visual" data-hero-parallax><img src="${e(home.hero.image)}" alt="${e(home.hero.alt)}" width="1920" height="1280" srcset="${e(home.hero.imageSmall || home.hero.image)} 960w, ${e(home.hero.image)} 1920w" sizes="100vw" fetchpriority="high" style="object-position:${e(home.hero.position)}">${video}</div>
    <div class="hero-shade"></div>
    <div class="home-wrap hero-content"><p class="eyebrow">New York, Chinatown <span class="hero-chinese" lang="zh">意中人</span></p><h1 id="hero-title"><span>Hot Pot.</span><span>Dim Sum.</span><span class="hero-outline">Easy Joy.</span></h1><div class="hero-bottom"><p>Good food.<br>Even better company.</p><div class="actions"><a class="home-button" href="/menu/">Explore the menu ${arrow}</a><a class="home-button ghost" href="${e(r.orderUrl)}">Order online ${arrow}</a></div></div></div>
    ${home.hero.videoSrc ? '<button class="hero-video-control" type="button" hidden>Play video</button>' : ''}<a class="hero-scroll" href="#brand-intro"><span>Come on in</span><span aria-hidden="true">↓</span></a>
  </section>

  <section id="brand-intro" class="brand-intro" aria-labelledby="brand-heading">
    <div class="motion-toolbar home-wrap"><span>HOT POT · DIM SUM · CHINATOWN</span><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion <span aria-hidden="true">Ⅱ</span></button></div>
    <div class="marquee-pair">${repeat('EASY JOY')}${repeat('GOOD COMPANY', true)}</div>
    <div class="brand-statement home-wrap" data-home-reveal><p class="eyebrow">A table worth coming together for</p><h2 id="brand-heading">A little heat.<br>A lot of <em>joy.</em></h2><p class="brand-description">${e(about.homeSummary)}</p><a class="home-text-link" href="/about/">Our story ${arrow}</a></div>
    <div class="brand-pillars home-wrap"><div data-home-reveal><span class="pillar-number">01 /</span><h3>Hot pot.</h3><p>Gather around the broth.</p></div><div data-home-reveal><span class="pillar-number">02 /</span><h3>Dim sum.</h3><p>Handcrafted. Made to share.</p></div><div data-home-reveal><span class="pillar-number">03 /</span><h3>Chinatown.</h3><p>Find your table on Mulberry Street.</p></div></div>
  </section>

  <section id="menu-highlights" class="signature-section" aria-labelledby="signature-heading">
    <div class="home-wrap section-heading" data-home-reveal><div><p class="eyebrow">A taste of Easy Joy</p><h2 id="signature-heading">Find your<br><em>next favorite.</em></h2></div><a class="home-text-link" href="/menu/">Explore the full menu ${arrow}</a></div>
    <div class="signature-carousel" role="region" aria-roledescription="carousel" aria-label="Featured food" tabindex="0"><div class="signature-track">${cards}</div></div>
    <div class="home-wrap carousel-footer"><p class="fine">A selection from our gallery and pickup menu.<br>Selection and portions may vary; dishes shown do not indicate AYCE inclusions.</p><div class="carousel-controls" hidden><span class="carousel-position" aria-hidden="true">01 / 06</span><button type="button" data-carousel-step="-1" aria-label="Previous dishes">←</button><button type="button" data-carousel-step="1" aria-label="Next dishes">→</button></div></div><p class="sr-only carousel-announcement" role="status" aria-live="polite"></p>
  </section>

  <div class="story-stack">
    <section id="hot-pot" class="story-scene" aria-labelledby="hotpot-heading">
      ${sceneImage(home.scenes.hotPot)}
      <div class="scene-panel"><span class="scene-index">01 / THE HOT POT</span><div class="scene-copy" data-home-reveal><p class="eyebrow">Come together around the table</p><h2 id="hotpot-heading">A table <br>full of <br><em>possibilities.</em></h2><h3>All-You-Can-Eat Hot Pot</h3><p>Pick up your chopsticks. Gather your favorite people. Settle in for all-you-can-eat hot pot at Easy Joy.</p><a class="home-text-link" href="tel:${e(r.telephone)}">Call for AYCE Details ${arrow}</a><p class="scene-phone">${e(r.displayPhone)}</p><p class="scene-note">Call for current prices, dining time limits, children’s pricing and what’s included. Online pickup menu prices are separate from dine-in AYCE pricing.</p></div><span class="scene-bottom">HOT POT. GOOD COMPANY.</span></div>
    </section>
    <section id="dim-sum" class="story-scene scene-dimsum" aria-labelledby="dimsum-heading">
      ${sceneImage(home.scenes.dimSum)}
      <div class="scene-panel"><span class="scene-index">02 / THE DIM SUM</span><div class="scene-copy" data-home-reveal><p class="eyebrow">Little bites. Big joy.</p><h2 id="dimsum-heading">One more <br>basket. <br><em>Always.</em></h2><p>Handcrafted dim sum, time-honored recipes and something delicious to pass around the table.</p><a class="home-text-link" href="/menu/premium-dim-sum/">Discover our dim sum ${arrow}</a></div><span class="scene-bottom">FROM OUR KITCHEN, TO YOUR TABLE.</span></div>
    </section>
    <section id="dining-experience" class="story-scene" aria-labelledby="dining-heading">
      ${sceneImage(home.scenes.dining)}
      <div class="scene-panel"><span class="scene-index">03 / THE GOOD COMPANY</span><div class="scene-copy" data-home-reveal><p class="eyebrow">145 Mulberry Street</p><h2 id="dining-heading">Pull up <br>a chair. <br><em>Stay a while.</em></h2><p>A lively table. A warm welcome. Come for the hot pot and dim sum, and share a little Easy Joy in the heart of Chinatown.</p><a class="home-text-link" href="/facility/">Explore our dining space ${arrow}</a></div><span class="scene-bottom">CHINATOWN, NEW YORK.</span></div>
    </section>
  </div>

  <section id="at-the-table" class="table-film home-wrap" aria-labelledby="table-film-heading"><div class="atmosphere-grid">${home.atmosphere.map((photo,i)=>`<figure data-home-reveal><img src="${e(photo.image)}" srcset="${e(photo.imageSmall)} 960w, ${e(photo.image)} 1920w" sizes="(max-width:600px) 100vw, 50vw" width="1920" height="1280" alt="${e(photo.alt)}" loading="lazy" decoding="async"><figcaption><span>${e(photo.caption)}</span><span aria-hidden="true">0${i+1} /</span></figcaption></figure>`).join('')}</div><div class="section-heading" data-home-reveal><div><p class="eyebrow">A moment at our table</p><h2 id="table-film-heading">Come for the food.<br><em>Stay for the feeling.</em></h2></div><a class="home-text-link" href="/gallery/">Explore the gallery ${arrow}</a></div><div id="easyjoy-film">${hotpotVideo(media)}<a class="home-text-link" href="/facility/#easyjoy-film">Watch our restaurant film ${arrow}</a></div></section>

  <section id="guest-reviews" class="editorial-reviews"><div class="home-wrap"><div class="section-heading" data-home-reveal><div><p class="eyebrow">Around our table</p><h2>Good food.<br><em>Good words.</em></h2></div><a class="home-text-link" href="${e(r.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">Find us on Google Maps ${arrow}</a></div><div class="reviews-grid">${reviewCards}</div><p class="fine review-notice">${e(reviews.notice)}</p></div></section>

  <section id="find-us" class="editorial-visit"><div class="home-wrap location-map-grid"><div class="location-info" data-home-reveal><p class="eyebrow">Your next stop</p><h2>See you on<br><em>Mulberry.</em></h2><dl class="location-contact"><div><dt>Address</dt><dd><address>${e(addressLine(r))}</address></dd></div><div><dt>Opening hours · New York time</dt><dd>${e(r.hoursMessage)}</dd></div><div><dt>Phone</dt><dd><a href="tel:${e(r.telephone)}">${e(r.displayPhone)}</a></dd></div></dl><div class="actions"><a class="home-button" href="${e(r.directionsUrl)}">Get directions ${arrow}</a><a class="home-text-link" href="${e(r.orderUrl)}">Order online ${arrow}</a></div></div>${locationMap(r)}</div><div class="home-wrap home-back-row"><a class="home-text-link" href="#main">Back to top <span aria-hidden="true">↑</span></a></div><div class="visit-wordmark" aria-hidden="true">EASY JOY<span>✳</span></div></section>
  </div>`;
}
