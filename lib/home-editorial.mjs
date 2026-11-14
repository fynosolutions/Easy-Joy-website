import {escape as e, slug, addressLine, foodImage} from './site.mjs';
import {hotpotVideo} from './media.mjs';
import {locationMap} from './map.mjs';
import {calligraphy} from './site.mjs';
import {platformRow} from './icons.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const sceneImage = image => `<div class="scene-visual" data-parallax><img src="${e(image.image)}" alt="${e(image.alt)}" style="object-position:${e(image.position)}" ${image.imageSmall ? ` srcset="${e(image.imageSmall)} 960w, ${e(image.image)} ${image.width || 1920}w" sizes="100vw"` : ''} width="1920" height="1280" loading="lazy" decoding="async"></div>`;

// Special offers band along the bottom of the hero: one offer at a time, text rises in, the 4th pot gets a FREE stamp.
function promoBand(list = [], reservationUrl = '') {
  if (!list.length) return '';
  const pots = `<span class="promo-pots" aria-hidden="true">${[1, 2, 3, 4].map(n => `<span class="promo-pot${n === 4 ? ' is-free' : ''}"><svg viewBox="0 0 48 40" width="44" height="37"><path d="M6 15h36v4c0 9-7 16-18 16S6 28 6 19v-4Z" fill="currentColor"/><path d="M2 15h44M14 9c0-3 3-3 3-6M24 9c0-3 3-3 3-6M34 9c0-3 3-3 3-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><small>${n === 4 ? 'FREE' : 'PAID'}</small></span>`).join('')}</span>`;
  const leafMark = '<span class="promo-leaf" aria-hidden="true"><svg viewBox="0 0 24 24" width="64" height="64"><path fill="currentColor" d="M20 3C10 3 4 8.6 4 15.5c0 1.6.4 3.1 1 4.5l1.6-1.2C8.4 14.6 12 11.6 16 10c-3.6 2.3-6.5 5.3-8.4 9.6 1.3.6 2.7.9 4.2.9C18 20.5 21 14 20 3Z"/></svg></span>';
  const slide = (p, i) => `<article class="promo-slide${i === 0 ? ' is-active' : ''}" id="promo-${e(p.id)}" aria-roledescription="slide" aria-label="${i + 1} of ${list.length}"${i ? ' aria-hidden="true"' : ''}><div class="promo-visual">${p.visual === 'pots' ? pots : p.visual === 'leaf' ? leafMark : `<span class="promo-price" aria-hidden="true">${e(p.price)}</span>`}</div><div class="promo-copy"><p class="promo-kicker"><span><b class="promo-tag">${e(p.tag)}</b> <span class="promo-meta">${e(p.kicker)}</span></span></p><h2 class="promo-title"><span>${e(p.title)}</span></h2><p class="promo-fine"><span>${e(p.fine)}</span></p>${p.link ? `<p class="promo-more"><span><a class="promo-link" href="${e(p.link)}">${e(p.linkLabel)} →</a></span></p>` : ''}</div></article>`;
  return `<aside class="promo-band" aria-roledescription="carousel" aria-label="Special offers"><div class="home-wrap promo-inner"><p class="promo-badge"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg><span>Special offers</span><span class="promo-count" aria-hidden="true"><b>1</b> / ${list.length}</span></p><div class="promo-stage">${list.map(slide).join('')}</div><div class="promo-controls"><a class="promo-cta" href="${e(reservationUrl)}" target="_blank" rel="noopener">Reserve a table <span aria-hidden="true">↗</span></a>${list.length > 1 ? `<div class="promo-dots">${list.map((p, i) => `<button type="button" class="promo-dot" aria-controls="promo-${e(p.id)}" aria-current="${i === 0}" aria-label="Show offer ${i + 1}"><span></span></button>`).join('')}</div>` : ''}</div></div></aside>`;
}

// 2026-11-14: Extra Spicy Challenge hidden on request (Fyno). Set to true to bring the second pop-up page back.
const SHOW_SPICY_CHALLENGE = false;

function lunchPoster(offer, directionsUrl) {
  if (!offer) return '';
  return `<dialog class="lunch-poster" aria-label="Easy Joy offers">
    <div class="lunch-stage">
      <article class="lunch-slide" data-slide aria-label="${e(offer.title)}">
        <img src="/assets/images/lunch-special-poster.webp" width="1060" height="1500" alt="Lunch Special $19.95: choice of 4 flavors, 1 premium beef platter, vegetable combo platter. ${e(offer.kicker)}" loading="lazy">
        <p class="lunch-when">${e(offer.kicker)}</p>
      </article>
      ${SHOW_SPICY_CHALLENGE ? `      <article class="lunch-slide lunch-challenge" data-slide inert aria-label="Extra Spicy Challenge">
        <p class="challenge-kicker">Easy Joy challenge</p>
        <h2>Extra Spicy<br>Challenge</h2>
        <ol class="challenge-steps">
          <li><b>1</b><span>Finish our extra spicy pot.</span></li>
          <li><b>2</b><span>Unlock the <em>hidden</em> spicy challenge.</span></li>
          <li><b>3</b><span>Finish that too and win a <em>mystery prize</em>.</span></li>
        </ol>
        <p class="challenge-ask">Ask your server for details.</p>
      </article>` : ''}
      <button class="lunch-close" type="button" aria-label="Close offers" autofocus>×</button>
    </div>
    <div class="lunch-controls">
      ${SHOW_SPICY_CHALLENGE ? `      <button type="button" data-prev aria-label="Previous offer">←</button>
      <span class="lunch-dots" aria-live="polite"><i class="is-on"></i><i></i></span>
      <button type="button" data-next aria-label="Next offer">→</button>` : ''}
      <a class="lunch-directions" href="${e(directionsUrl)}">Directions ${arrow}</a>
    </div>
  </dialog>`;
}

export function renderHome(r, about, media, reviews, categories, home) {
  // Carousel = the printed menu's own dish photos, in menu order: hot pot → dim sum → BBQ → mains.
  const featured = [
    ['Hot Pot · Broth', 'Chongqing Spicy Broth', 'chongqing-spicy-broth', '/menu/soup-base-delivery/', 'Chongqing spicy hot pot broth in a gold pot'],
    ['Hot Pot · Mini pot', 'Fish Maw Chicken', 'coconut-chicken-broth', '/menu/take-out-menu/', 'Fish maw chicken hot pot in golden broth'],
    ['Hot Pot · $43 Premium', 'Snowflake Beef', 'snowflake-beef', '/faq/#ayce-price', 'A platter of thinly sliced snowflake beef'],
    ['Dim Sum', 'Soup Dumplings', 'soup-dumplings', '/menu/bun-dumplings/', 'Soup dumplings in a bamboo steamer'],
    ['Dim Sum', 'Shrimp Rice Noodle Roll', 'shrimp-rice-roll', '/menu/rice-noodle-roll/', 'Shrimp rice noodle rolls with soy sauce'],
    ['Dim Sum', 'Flaky Pastry Pie', 'flaky-pastry-pie', '/menu/pie/', 'Flaky pastry pie cut open'],
    ['BBQ', 'Grilled Chicken Skewers', 'chicken-skewers', '/menu/bbq/', 'Grilled chicken skewers on a plate'],
    ['BBQ', 'Grilled Oysters', 'grilled-oysters', '/menu/bbq/', 'Grilled oysters with garlic and chili'],
    ['Homestyle Mains', 'Beef Fried Rice', 'beef-fried-rice', '/menu/fried-rice-and-noodles/', 'A bowl of beef fried rice'],
    ['Homestyle Mains', 'Chow Mein', 'chow-mein', '/menu/fried-rice-and-noodles/', 'Shrimp chow mein lifted with chopsticks']
  ];
  const cards = featured.map(([group, name, file, href, alt]) => `<a class="signature-slide menu-card" href="${href}" aria-label="${e(name)} — view on the menu"><span class="dish-art"><img class="signature-image" src="/assets/images/menu-card/${file}.webp" alt="${e(alt)}" loading="lazy" decoding="async"></span><div class="signature-copy"><p>${e(group)}</p><h3>${e(name)}</h3><span class="signature-link"><span class="wave-label">View on the menu</span> ${arrow}</span></div></a>`).join('');
  const reviewCards = reviews.items.filter(item => item.publicationStatus === 'approved').map(item => {
    const excerpt = item.homeExcerpt || item.paragraphs[0].match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || item.paragraphs[0];
    return `<article class="review-card" data-home-reveal><p class="review-stars"><span role="img" aria-label="${item.sourceDisplayedStars} out of 5 stars, as displayed on our previous website">${'★'.repeat(item.sourceDisplayedStars)}</span></p><blockquote><p>${e(excerpt)}</p></blockquote><details><summary>Read full review<span class="sr-only"> about ${e(item.topic)}</span></summary><div class="review-full">${item.paragraphs.map(p => `<p>${e(p)}</p>`).join('')}</div></details></article>`;
  }).join('');
  const video = home.hero.videoSrc ? `<video class="hero-motion-video" muted loop playsinline preload="none" poster="${e(home.hero.image)}" aria-label="Easy Joy restaurant atmosphere"><source src="${e(home.hero.videoSrc)}" type="video/mp4"></video>` : '';

  return `<div class="home-editorial">
  ${lunchPoster(home.promotions?.find(offer => offer.id === 'lunch'), r.directionsUrl)}
  <section class="cinema-hero" aria-labelledby="hero-title">
    <div class="hero-visual" data-hero-parallax><img src="${e(home.hero.image)}" alt="${e(home.hero.alt)}" width="1920" height="1280" srcset="${e(home.hero.imageSmall || home.hero.image)} 960w, ${e(home.hero.image)} ${home.hero.width || 1920}w" sizes="(max-width:600px) 82vw, 100vw" fetchpriority="high" style="object-position:${e(home.hero.position)}">${video}</div>
    <div class="hero-shade"></div>
    <div class="home-wrap hero-content"><p class="eyebrow">145 Mulberry St · Chinatown, New York</p><h1 id="hero-title"><span>Hot Pot.</span><span>Dim Sum.</span><span>BBQ Skewers.</span><span class="hero-outline">Easy Joy.<span class="hero-mark" aria-hidden="true">${calligraphy()}</span></span></h1><div class="hero-bottom"><p>Steaming pots, a dim sum cart<br>and skewers off the grill.</p><div class="actions"><a class="home-button" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ${arrow}</a><a class="home-text-link hero-link" href="/menu/"><span class="wave-label">Explore the menu</span> ${arrow}</a></div></div></div>
    ${home.hero.videoSrc ? '<button class="hero-video-control" type="button" hidden>Play video</button>' : ''}${promoBand(home.promotions, r.reservationUrl)}
  </section>

  <section id="brand-intro" class="brand-intro" aria-labelledby="brand-heading">
    <div class="motion-toolbar home-wrap"><span class="nowrap">Open daily · 10 AM–10:30 PM</span><button class="motion-toggle" type="button" aria-pressed="false" hidden>Pause motion <span aria-hidden="true">Ⅱ</span></button></div>
    <div class="home-wrap cuisine-intro"><div class="intro-price"><p class="eyebrow">All-you-can-eat hot pot</p><h2 id="brand-heading">$28 before 5 PM.<br><em>$43 after.</em></h2></div><div class="intro-rules"><p>${e(about.homeSummary)} ${e(r.ayceNote)}</p><p class="price-small">Per person, tax and tip extra. Prices can change — <a href="/faq/#ayce-price"><span class="wave-label">see details</span></a> or call ${e(r.displayPhone)}.</p></div></div>
    <div class="home-wrap cuisine-grid">
      <a href="/menu/take-out-menu/" class="cuisine-card" data-home-reveal><span class="cuisine-photo"><img src="/assets/images/home/cuisine-hot-pot-pots-960.webp" srcset="/assets/images/home/cuisine-hot-pot-pots-480.webp 480w, /assets/images/home/cuisine-hot-pot-pots-960.webp 960w" sizes="(max-width:700px) calc(100vw - 40px), 45vw" width="960" height="859" alt="Two copper hot pots, one clear broth and one spicy broth, with sliced meat, shrimp and tofu around them" loading="lazy" decoding="async"></span><h3>Hot Pot</h3><p>Gather around the broth.</p></a>
      <a href="/menu/premium-dim-sum/" class="cuisine-card" data-home-reveal><span class="cuisine-photo"><img src="/assets/images/home/cuisine-dim-sum-menu-960.webp" srcset="/assets/images/home/cuisine-dim-sum-menu-480.webp 480w, /assets/images/home/cuisine-dim-sum-menu-960.webp 960w" sizes="(max-width:700px) calc(100vw - 40px), 33vw" width="960" height="1280" alt="Har gow, siu mai, sticky rice in lotus leaf, beancurd rolls and choy sum" loading="lazy" decoding="async"></span><h3>Dim Sum</h3><p>Handcrafted. Made to share.</p></a>
      <a href="/menu/bbq/" class="cuisine-card" data-home-reveal><span class="cuisine-photo"><img src="/assets/images/home/cuisine-bbq-grill-960.webp" srcset="/assets/images/home/cuisine-bbq-grill-480.webp 480w, /assets/images/home/cuisine-bbq-grill-960.webp 960w" sizes="(max-width:700px) calc(100vw - 40px), 33vw" width="960" height="1440" alt="Skewers sizzling over the flames on the grill" loading="lazy" decoding="async"></span><h3>BBQ Skewers</h3><p>Straight off the grill.</p></a>
    </div>
  </section>

  <section id="menu-highlights" class="signature-section" aria-labelledby="signature-heading">
    <div class="home-wrap section-heading" data-home-reveal><div><p class="eyebrow">A taste of Easy Joy</p><h2 id="signature-heading">Find your<br><em>next favorite.</em></h2></div><a class="home-text-link" href="/menu/"><span class="wave-label">Explore the full menu</span> ${arrow}</a></div>
    <div class="signature-carousel" role="region" aria-roledescription="carousel" aria-label="Featured food" tabindex="0"><div class="signature-track">${cards}</div></div>
    <div class="home-wrap carousel-footer"><p class="fine">A few favorites from our menu, from hot pot to fried rice. Pictures are for reference.</p><div class="carousel-controls" hidden><button class="carousel-pause" type="button" aria-pressed="false">Pause scrolling</button><span class="carousel-position" aria-hidden="true">01 / ${String(featured.length).padStart(2, '0')}</span><button type="button" data-carousel-step="-1" aria-label="Previous dishes">←</button><button type="button" data-carousel-step="1" aria-label="Next dishes">→</button></div></div><p class="sr-only carousel-announcement" role="status" aria-live="polite"></p>
  </section>

  <div class="story-stack">
    <section id="hot-pot" class="story-scene" aria-labelledby="hotpot-heading">
      ${sceneImage(home.scenes.hotPot)}
      <div class="scene-panel"><span class="scene-index">THE HOT POT</span><div class="scene-copy" data-home-reveal><h2 id="hotpot-heading">A table <br>full of <br><em>possibilities.</em></h2><h3>All-You-Can-Eat Hot Pot</h3><p>Pick up your chopsticks. Gather your favorite people. Settle in for all-you-can-eat hot pot at Easy Joy.</p><p class="scene-note">Choose your broths and mix your own sauce at the sauce bar. <a class="nowrap" href="/faq/#ayce-price"><span class="wave-label">What the price includes</span></a></p><div class="actions"><a class="home-button" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ${arrow}</a><a class="home-text-link" href="tel:${e(r.telephone)}"><span class="wave-label">Call ${e(r.displayPhone)}</span></a></div></div></div>
    </section>
    <section id="dim-sum" class="story-scene scene-dimsum" aria-labelledby="dimsum-heading">
      ${sceneImage(home.scenes.dimSum)}
      <div class="scene-panel"><span class="scene-index">THE DIM SUM</span><div class="scene-copy" data-home-reveal><h2 id="dimsum-heading">One more <br>basket. <br><em>Always.</em></h2><p>Handcrafted dim sum, steamed and baked fresh. Order à la carte any time of day; before 5 PM, 4–6 kinds also come around on the cart with the $28 hot pot.</p><a class="home-text-link" href="/menu/premium-dim-sum/"><span class="wave-label">Discover our dim sum</span> ${arrow}</a></div></div>
    </section>
    <section id="dining-experience" class="story-scene" aria-labelledby="dining-heading">
      ${sceneImage(home.scenes.dining)}
      <div class="scene-panel"><span class="scene-index">THE DINING ROOM</span><div class="scene-copy" data-home-reveal><h2 id="dining-heading">Pull up <br>a chair. <br><em>Stay a while.</em></h2><p>A lively table. A warm welcome. Come for the hot pot, dim sum and BBQ skewers, and share a little Easy Joy in the heart of Chinatown.</p><a class="home-text-link" href="/facility/"><span class="wave-label">Explore our dining space</span> ${arrow}</a></div></div>
    </section>
  </div>

  <section id="at-the-table" class="table-film home-wrap" aria-labelledby="table-film-heading"><div class="table-film-layout"><div class="table-film-heading" data-home-reveal><div><p class="eyebrow">A moment at our table</p><h2 id="table-film-heading">Steam, lanterns<br><em>and a full table.</em></h2></div><a class="button gallery-button" href="/gallery/">Explore the gallery ${arrow}</a></div><div id="easyjoy-film">${hotpotVideo(media)}</div></div></section>

  <section id="guest-reviews" class="editorial-reviews"><div class="home-wrap"><div class="section-heading" data-home-reveal><div><p class="eyebrow">Around our table</p><h2>What guests<br><em>tell us.</em></h2></div><a class="home-text-link" href="${e(r.googleMapsUrl)}" target="_blank" rel="noopener"><span class="wave-label">Read more reviews on Google</span> ${arrow}</a></div><div class="reviews-grid">${reviewCards}</div></div></section>

  <section id="find-us" class="editorial-visit"><div class="home-wrap location-map-grid"><div class="location-info" data-home-reveal><p class="eyebrow">Your next stop</p><h2>See you on<br><em>Mulberry.</em></h2><dl class="location-contact"><div><dt>Address</dt><dd><address>${e(addressLine(r))}</address></dd></div><div><dt>Opening hours · New York time</dt><dd>${e(r.hoursMessage)}</dd></div><div><dt>Phone</dt><dd><a href="tel:${e(r.telephone)}">${e(r.displayPhone)}</a></dd></div></dl><div class="visit-mark" aria-hidden="true">${calligraphy()}</div><p class="visit-landmark">Look for the yellow <span lang="zh">意中人</span> sign, between Grand St and Hester St.</p><div class="actions"><a class="home-button" href="${e(r.directionsUrl)}">Get directions ${arrow}</a><a class="home-button home-button-reserve" href="${e(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ${arrow}</a></div></div>${locationMap(r)}</div><div class="home-wrap home-back-row"><a class="home-text-link" href="#main"><span class="wave-label">Back to top</span> <span aria-hidden="true">↑</span></a></div></section>
  </div>`;
}
