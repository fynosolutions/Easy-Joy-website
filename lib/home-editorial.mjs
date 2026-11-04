import {escape as e, slug, addressLine, foodImage} from './site.mjs';
import {hotpotVideo} from './media.mjs';
import {locationMap} from './map.mjs';
import {calligraphy} from './site.mjs';
import {platformRow} from './icons.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const sceneImage = image => `<div class="scene-visual" data-parallax><img src="${e(image.image)}" alt="${e(image.alt)}" style="object-position:${e(image.position)}" ${image.imageSmall ? ` srcset="${e(image.imageSmall)} 960w, ${e(image.image)} ${image.width || 1920}w" sizes="100vw"` : ''} width="1920" height="1280" loading="lazy" decoding="async"></div>`;

export function renderHome(r, about, media, reviews, categories, home) {
  const featured = [
    ['上海小笼包', 'From the steamer'], ['烤羊肉(5串)', 'From the grill'],
    ['豉汁凤爪', 'A dim sum classic'], ['椰子鸡套餐', 'A mini hot pot for one'],
    ['蛋挞', 'A sweet little finish'], ['烤鱿鱼（3）', 'Off the grill'],
    ['牛肉肠粉', 'A dim sum favorite'], ['冬阴功套餐', 'A mini hot pot favorite'],
    ['豉汁排骨', 'Steamed to share'], ['烤牛肉（5）', 'Smoky and charred']
  ];
  const cards = featured.map(([name, tagline], index) => {
    const photo = media.photos.find(photo => photo.chineseName === name);
    const category = photo.menuName && categories.find(c => c.items.some(item => item.name === photo.menuName));
    const href = category ? `/menu/${slug(category.name)}/#dish-${slug(category.name)}-${category.items.findIndex(item => item.name === photo.menuName) + 1}` : `/gallery/#gallery-${photo.group}`;
    return `<a class="signature-slide" href="${href}" aria-label="${e(photo.englishName)} — ${category ? 'view menu item' : 'explore food gallery'}">${foodImage(photo, 'signature-image')}<div class="signature-copy"><p>${e(tagline)}</p><h3>${e(photo.englishName.replace(/\s*\(([^)]*)\)$/, ''))}${/\(([^)]*)\)$/.test(photo.englishName) ? `<small>${e(photo.englishName.match(/\(([^)]*)\)$/)[1])}</small>` : ''}</h3><span class="signature-link">${category ? 'View menu item' : 'Explore gallery'} ${arrow}</span></div></a>`;
  }).join('');
  const reviewCards = reviews.items.filter(item => item.publicationStatus === 'approved').map(item => {
    const excerpt = item.homeExcerpt || item.paragraphs[0].match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || item.paragraphs[0];
    return `<article class="review-card" data-home-reveal><p class="review-stars"><span role="img" aria-label="${item.sourceDisplayedStars} out of 5 stars, as displayed on our previous website">${'★'.repeat(item.sourceDisplayedStars)}</span></p><blockquote><p>${e(excerpt)}</p></blockquote><details><summary>Read full review<span class="sr-only"> about ${e(item.topic)}</span></summary><div class="review-full">${item.paragraphs.map(p => `<p>${e(p)}</p>`).join('')}</div></details></article>`;
  }).join('');
  const video = home.hero.videoSrc ? `<video class="hero-motion-video" muted loop playsinline preload="none" poster="${e(home.hero.image)}" aria-label="Easy Joy restaurant atmosphere"><source src="${e(home.hero.videoSrc)}" type="video/mp4"></video>` : '';

  return `<div class="home-editorial">
  <section class="cinema-hero" aria-labelledby="hero-title">
    <div class="hero-visual" data-hero-parallax><img src="${e(home.hero.image)}" alt="${e(home.hero.alt)}" width="1920" height="1280" srcset="${e(home.hero.imageSmall || home.hero.image)} 960w, ${e(home.hero.image)} ${home.hero.width || 1920}w" sizes="100vw" fetchpriority="high" style="object-position:${e(home.hero.position)}">${video}</div>
    <div class="hero-shade"></div>
    <div class="home-wrap hero-content"><p class="eyebrow">145 Mulberry St · Chinatown, New York</p><h1 id="hero-title"><span>Hot Pot.</span><span>Dim Sum.</span><span>BBQ Skewers.</span><span class="hero-outline">Easy Joy.<span class="hero-mark" aria-hidden="true">${calligraphy()}</span></span></h1><div class="hero-bottom"><p>Steaming pots, a dim sum cart<br>and skewers off the grill.</p><div class="actions"><a class="home-button" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ${arrow}</a><a class="home-text-link hero-link" href="/menu/">Explore the menu ${arrow}</a></div></div></div>
    ${home.hero.videoSrc ? '<button class="hero-video-control" type="button" hidden>Play video</button>' : ''}<a class="hero-scroll" href="#brand-intro"><span>Come on in</span><span aria-hidden="true">↓</span></a>
  </section>

  <section id="brand-intro" class="brand-intro" aria-labelledby="brand-heading">
    <div class="motion-toolbar home-wrap"><span class="nowrap">Open daily · 10 AM–10:30 PM</span><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion <span aria-hidden="true">Ⅱ</span></button></div>
    <div class="home-wrap cuisine-intro"><div class="intro-price"><p class="eyebrow">All-you-can-eat hot pot</p><h2 id="brand-heading">$28 before 5 PM.<br><em>$43 after.</em></h2></div><div class="intro-rules"><p>${e(about.homeSummary)} ${e(r.ayceNote)}</p><p class="price-small">Per person, tax and tip extra. Prices can change — <a href="/faq/#ayce-price">see details</a> or call ${e(r.displayPhone)}.</p></div></div>
    <div class="home-wrap cuisine-grid">
      <a href="/menu/take-out-menu/" class="cuisine-card" data-home-reveal><img src="/assets/images/home/cuisine-hot-pot-pots-960.webp" srcset="/assets/images/home/cuisine-hot-pot-pots-480.webp 480w, /assets/images/home/cuisine-hot-pot-pots-960.webp 960w" sizes="(max-width:700px) calc(100vw - 40px), 45vw" width="960" height="859" alt="Two copper hot pots, one clear broth and one spicy broth, with sliced meat, shrimp and tofu around them" loading="lazy" decoding="async"><h3>Hot Pot</h3><p>Gather around the broth.</p></a>
      <a href="/menu/premium-dim-sum/" class="cuisine-card" data-home-reveal><img src="/assets/images/home/cuisine-dim-sum-real-960.webp" srcset="/assets/images/home/cuisine-dim-sum-real-480.webp 480w, /assets/images/home/cuisine-dim-sum-real-960.webp 960w" sizes="(max-width:700px) calc(100vw - 40px), 33vw" width="960" height="1200" alt="A steamer of har gow shrimp dumplings with a baked bun and grilled shrimp" loading="lazy" decoding="async"><h3>Dim Sum</h3><p>Handcrafted. Made to share.</p></a>
      <a href="/menu/bbq/" class="cuisine-card" data-home-reveal><img src="/assets/images/home/cuisine-bbq-real-960.webp" srcset="/assets/images/home/cuisine-bbq-real-480.webp 480w, /assets/images/home/cuisine-bbq-real-960.webp 960w" sizes="(max-width:700px) calc(100vw - 40px), 33vw" width="960" height="1200" alt="Grilled skewers fresh off the grill on an Easy Joy plate" loading="lazy" decoding="async"><h3>BBQ Skewers</h3><p>Straight off the grill.</p></a>
    </div>
  </section>

  <section id="menu-highlights" class="signature-section" aria-labelledby="signature-heading">
    <div class="home-wrap section-heading" data-home-reveal><div><p class="eyebrow">A taste of Easy Joy</p><h2 id="signature-heading">Find your<br><em>next favorite.</em></h2></div><a class="home-text-link" href="/menu/">Explore the full menu ${arrow}</a></div>
    <div class="signature-carousel" role="region" aria-roledescription="carousel" aria-label="Featured food" tabindex="0"><div class="signature-track">${cards}</div></div>
    <div class="home-wrap carousel-footer"><p class="fine">A few favorites from the menu. Selection and portions may vary.</p><div class="carousel-controls" hidden><button class="carousel-pause" type="button" aria-pressed="false">Pause scrolling</button><span class="carousel-position" aria-hidden="true">01 / ${String(featured.length).padStart(2, '0')}</span><button type="button" data-carousel-step="-1" aria-label="Previous dishes">←</button><button type="button" data-carousel-step="1" aria-label="Next dishes">→</button></div></div><p class="sr-only carousel-announcement" role="status" aria-live="polite"></p>
  </section>

  <div class="story-stack">
    <section id="hot-pot" class="story-scene" aria-labelledby="hotpot-heading">
      ${sceneImage(home.scenes.hotPot)}
      <div class="scene-panel"><span class="scene-index">THE HOT POT</span><div class="scene-copy" data-home-reveal><h2 id="hotpot-heading">A table <br>full of <br><em>possibilities.</em></h2><h3>All-You-Can-Eat Hot Pot</h3><p>Pick up your chopsticks. Gather your favorite people. Settle in for all-you-can-eat hot pot at Easy Joy.</p><p class="scene-note">Choose your broths and mix your own sauce at the sauce bar. <a class="nowrap" href="/faq/#ayce-price">What the price includes</a></p><div class="actions"><a class="home-button" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ${arrow}</a><a class="home-text-link" href="tel:${e(r.telephone)}">Call ${e(r.displayPhone)}</a></div></div></div>
    </section>
    <section id="dim-sum" class="story-scene scene-dimsum" aria-labelledby="dimsum-heading">
      ${sceneImage(home.scenes.dimSum)}
      <div class="scene-panel"><span class="scene-index">THE DIM SUM</span><div class="scene-copy" data-home-reveal><h2 id="dimsum-heading">One more <br>basket. <br><em>Always.</em></h2><p>Handcrafted dim sum, steamed and baked fresh. Order à la carte any time of day; before 5 PM, 4–6 kinds also come around on the cart with the $28 hot pot.</p><a class="home-text-link" href="/menu/premium-dim-sum/">Discover our dim sum ${arrow}</a></div></div>
    </section>
    <section id="dining-experience" class="story-scene" aria-labelledby="dining-heading">
      ${sceneImage(home.scenes.dining)}
      <div class="scene-panel"><span class="scene-index">THE DINING ROOM</span><div class="scene-copy" data-home-reveal><h2 id="dining-heading">Pull up <br>a chair. <br><em>Stay a while.</em></h2><p>A lively table. A warm welcome. Come for the hot pot, dim sum and BBQ skewers, and share a little Easy Joy in the heart of Chinatown.</p><a class="home-text-link" href="/facility/">Explore our dining space ${arrow}</a></div></div>
    </section>
  </div>

  <section id="at-the-table" class="table-film home-wrap" aria-labelledby="table-film-heading"><div class="table-film-layout"><div class="table-film-heading" data-home-reveal><div><p class="eyebrow">A moment at our table</p><h2 id="table-film-heading">Steam, lanterns<br><em>and a full table.</em></h2></div><a class="button gallery-button" href="/gallery/">Explore the gallery ${arrow}</a></div><div id="easyjoy-film">${hotpotVideo(media)}</div></div></section>

  <section id="guest-reviews" class="editorial-reviews"><div class="home-wrap"><div class="section-heading" data-home-reveal><div><p class="eyebrow">Around our table</p><h2>What guests<br><em>tell us.</em></h2></div><a class="home-text-link" href="${e(r.googleMapsUrl)}" target="_blank" rel="noopener">Read more reviews on Google ${arrow}</a></div><div class="reviews-grid">${reviewCards}</div></div></section>

  <section id="find-us" class="editorial-visit"><div class="home-wrap location-map-grid"><div class="location-info" data-home-reveal><p class="eyebrow">Your next stop</p><h2>See you on<br><em>Mulberry.</em></h2><dl class="location-contact"><div><dt>Address</dt><dd><address>${e(addressLine(r))}</address></dd></div><div><dt>Opening hours · New York time</dt><dd>${e(r.hoursMessage)}</dd></div><div><dt>Phone</dt><dd><a href="tel:${e(r.telephone)}">${e(r.displayPhone)}</a></dd></div></dl><div class="visit-mark" aria-hidden="true">${calligraphy()}</div><p class="visit-landmark">Look for the yellow <span lang="zh">意中人</span> sign, between Grand St and Hester St.</p><div class="actions"><a class="home-button" href="${e(r.directionsUrl)}">Get directions ${arrow}</a><a class="home-text-link" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ${arrow}</a></div></div>${locationMap(r)}</div><div class="home-wrap home-back-row"><a class="home-text-link" href="#main">Back to top <span aria-hidden="true">↑</span></a></div></section>
  </div>`;
}
