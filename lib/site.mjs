import {readFileSync} from 'node:fs';
import {brandIcon, platformRow, svgGlyphs} from './icons.mjs';
const wordmark = JSON.parse(readFileSync(new URL('./logo-wordmark.json', import.meta.url), 'utf8'));
// One logo everywhere: EASY JOY + brush 意中人, supplied by the owner 2026-11-12. Drawn once as a symbol, reused with currentColor.
export const logoSprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="ej-logo" viewBox="0 0 ${wordmark.w} ${wordmark.h}"><path fill-rule="evenodd" fill="currentColor" d="${wordmark.d}"/></symbol></svg>`;
export const logoMark = (cls = 'brand-wordmark') => `<svg class="${cls}" viewBox="0 0 ${wordmark.w} ${wordmark.h}" aria-hidden="true" focusable="false"><use href="#ej-logo"/></svg>`;
const callig = JSON.parse(readFileSync(new URL('./calligraphy-path.json', import.meta.url), 'utf8'));
// 意中人 = the Chinese part of the owner-supplied logo (traced 2026-11-12).
export const calligraphy = (label = '') => `<svg class="calligraphy" viewBox="0 0 ${callig.w} ${callig.h}"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'} focusable="false"><path fill-rule="evenodd" fill="currentColor" d="${callig.d}"/></svg>`;
export const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const slug = value => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const money = value => `$${Number(value).toFixed(2)}`;
export const addressLine = r => `${r.address.streetAddress}, ${r.address.addressLocality}, ${r.address.addressRegion} ${r.address.postalCode}`;
export const absolute = (r, path) => `${r.domain}${path}`;
export function restaurantSchema(r) {
  const data = {
    '@type':'Restaurant', '@id':`${r.domain}/#restaurant`, name:r.name, alternateName:r.alternateName,
    url:`${r.domain}/`, telephone:r.telephone, servesCuisine:r.servesCuisine, ...(r.description ? {description:r.description} : {}),
    address:{'@type':'PostalAddress', ...r.address}, hasMenu:`${r.domain}/menu/`,
    ...(r.geo ? {geo:{'@type':'GeoCoordinates', ...r.geo}} : {}), hasMap:r.googleMapsUrl,
    image:`${r.domain}/assets/images/home/mulberry-storefront-1920.webp`, logo:`${r.domain}/assets/easy-joy-logo.jpg`,
    ...(r.priceRange ? {priceRange:r.priceRange} : {}), ...(r.reservationUrl ? {acceptsReservations:r.reservationUrl} : {}),
    ...(r.profiles ? {sameAs:r.profiles.filter(p => p.sameAs !== false).map(p => p.url)} : {})
  };
  if (r.hours) data.openingHoursSpecification = r.hours;
  return data;
}
export function menuSchema(r, categories, route = "/menu/") {
  return {
    '@type':'Menu','@id':`${r.domain}${route}#menu`,name:`${r.shortName} ${categories.length === 1 ? categories[0].name : 'online'} menu`,url:`${r.domain}${route}`,
    hasMenuSection: categories.map(category => ({
      '@type':'MenuSection', name:category.name, url:`${r.domain}/menu/${slug(category.name)}/`,
      hasMenuItem:category.items.map((item,i) => ({
        '@type':'MenuItem', name:item.name + (item.variant ? ` (${item.variant})` : ''),
        url:`${r.domain}/menu/${slug(category.name)}/#dish-${slug(category.name)}-${i+1}`,
        ...(item.description ? {description:item.description} : {}),
        ...(item.image ? {image:absolute(r,item.image)} : {}),
        offers:{'@type':'Offer',price:item.price.toFixed(2),priceCurrency:'USD',url:r.orderUrl}
      }))
    }))
  };
}
export function breadcrumbSchema(r, route, name, category = false) {
  const list = [{name:'Home',path:'/'}];
  if (category) list.push({name:'Menu',path:'/menu/'});
  list.push({name,path:route});
  return {'@type':'BreadcrumbList',itemListElement:list.map((entry,i)=>({'@type':'ListItem',position:i+1,name:entry.name,item:absolute(r,entry.path)}))};
}
export function foodImage(item, className='dish-photo') {
  if (!item.image) return '';
  const sizes = className === 'signature-image' ? '(max-width:600px) 135vw, 700px' : className === 'dining-room-image' ? '(max-width:600px) calc(100vw - 40px), (max-width:1264px) calc((100vw - 92px) * .622642), 730px' : className === 'dining-entry-image' ? '(max-width:600px) calc(100vw - 40px), (max-width:1264px) calc((100vw - 92px) * .377358), 443px' : className === 'dish-photo' ? '128px' : '(max-width:600px) 90vw, (max-width:1000px) 45vw, 400px';
  return `<img class="${className}" src="${escape(item.image)}"${item.imageSmall ? ` srcset="${escape(item.imageSmall)} ${item.imageSmallWidth || Math.min(480,item.width)}w, ${escape(item.image)} ${item.width}w" sizes="${sizes}"` : ''} alt="${escape(item.alt || item.name || item.englishName)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">`;
}
export function dish(item, categoryName, i, categoryPage = false) {
  const id = `dish-${slug(categoryName)}-${i+1}`;
  const tags = `${item.popular ? '<span class="tag">Popular</span>' : ''}${item.availability === 'sold_out' ? '<span class="tag muted">Listed as sold out</span>' : ''}`;
  return `<article id="${id}" class="dish${item.image ? ' has-photo' : ''}" data-popular="${Boolean(item.popular)}" data-search="${escape(`${categoryName} ${item.name} ${item.alternateName || ''} ${item.sourceName || ''} ${item.imageSourceName || ''} ${item.description || ''}`.toLowerCase())}">
    ${foodImage(item)}<div class="dish-copy"><div class="dish-heading"><h3>${categoryPage ? escape(item.name) : `<a class="dish-title" href="/menu/${slug(categoryName)}/#${id}">${escape(item.name)}</a>`}${item.variant ? ` <span class="portion">${escape(item.variant)}</span>` : ''}</h3><span class="price">${money(item.price)}</span></div>
    ${item.alternateName ? `<p class="alternate">${escape(item.alternateName)}</p>` : ''}
    ${item.description ? `<p class="dish-description">${escape(item.description)}</p>` : ''}
    ${tags ? `<div class="tags">${tags}</div>` : ''}</div>
  </article>`;
}
export function faqItems(r, faqs) {
  return `<div class="faq-list">${faqs.map(faq => {
    const url = faq.external === 'order' ? r.orderUrl : faq.external === 'phone' ? `tel:${r.telephone}` : faq.link;
    return `<section class="faq-item"${faq.id ? ` id="${escape(faq.id)}"` : ''}><h2>${escape(faq.question)}</h2><p>${escape(faq.answer)}</p><a${faq.plain ? ' data-plain' : ''} href="${escape(url)}">${escape(faq.linkLabel)} ↗</a></section>`;
  }).join('')}</div>`;
}
// Production only: the same Google tag IDs the old easyjoybuffet.com carried (GA4 + Google Ads), so stats and ad conversions continue after the domain cutover.
const analyticsTag = a => { const ids=[a.ga4,...(a.googleAds||[])].filter(Boolean); return ids.length ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${ids[0]}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${ids.map(id=>`gtag('config','${id}');`).join('')}</script>` : ''; };

export function shell(r, {route='/',title,description,body,schemas=[],active='',preview=false,noindex=false,categories=[]}) {
  let orderIndex = 0;
  const orderActions = header => {
    const panelId = `delivery-options-${orderIndex++}`;
    return `<div class="order-actions${header ? ' header-order' : ''}">${header && r.reservationUrl ? `<a class="header-reserve" data-plain href="${escape(r.reservationUrl)}" target="_blank" rel="noopener" aria-label="Reserve a table on Yelp">${brandIcon('yelp', 18)}<span class="label-long">Reserve a table</span><span class="label-short">Reserve</span></a>` : ''}<a class="order-pickup" href="${escape(r.orderUrl)}"><span class="label-long">Order Pickup</span><span class="label-short">Order</span> <span aria-hidden="true">↗</span></a><details class="delivery-menu"><summary aria-controls="${panelId}">Order Delivery <span aria-hidden="true">⌄</span></summary><div class="delivery-panel" id="${panelId}"><p>Choose your delivery platform</p>${r.deliveryPlatforms.map(platform=>`<a href="${escape(platform.url)}" target="_blank" rel="noopener noreferrer">${escape(platform.name)} <span aria-hidden="true">↗</span></a>`).join('')}<small>Availability, delivery fees and range are shown on each platform.</small></div></details></div>`;
  };
  const nav = r.navigation.map(({label,href})=>[label,href]);
  const footerNav = [...nav, ['Contact','/contact/'], ['Gallery','/gallery/'], ['Vegetarian','/vegetarian/'], ['FAQ','/faq/']].filter(([, u], i, all) => all.findIndex(([, v]) => v === u) === i);
  const categoryPanel = `<div class="category-dropdown" id="category-dropdown" hidden><div class="container"><div class="dropdown-heading"><h2>Find your favorite.</h2><a href="/menu/">Full menu ↗</a></div><nav aria-label="Quick menu categories"><ul>${categories.map(category=>`<li><a href="/menu/#${slug(category.name)}" data-category-link>${escape(category.name)}<span>${category.items.length} dishes ↗</span></a></li>`).join('')}<li><a href="/menu/#drinks-menu" data-category-link>Drinks Menu<span>Dine-in</span></a></li><li><a href="/vegetarian/">Vegetarian Menu<span>Meat-free ↗</span></a></li></ul></nav></div></div>`;
  const graph = [restaurantSchema(r),{'@type':'WebSite','@id':`${r.domain}/#website`,url:`${r.domain}/`,name:r.name,inLanguage:r.language},...schemas];
  const brandMark = logoMark();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${preview || noindex ? 'noindex, nofollow' : 'index, follow'}">
  ${route === '/' && r.googleSiteVerification ? `<meta name="google-site-verification" content="${r.googleSiteVerification}">` : ''}<link rel="canonical" href="${escape(absolute(r,route))}"><meta property="og:type" content="website"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="${escape(r.name)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(absolute(r,route))}"><meta property="og:image" content="${r.domain}/assets/images/home/share-storefront-1200x628.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="628"><meta property="og:image:alt" content="Easy Joy 意中人 storefront at 145 Mulberry Street, Chinatown"><meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#A52A2F"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><script>document.documentElement.classList.add('js')</script><link rel="preload" href="/assets/fonts/kumbh-sans-variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/style.css">${route === '/' ? '<link rel="stylesheet" href="/assets/home.css"><script src="/assets/home.js" defer></script>' : ''}
  ${!preview && !noindex && r.analytics ? analyticsTag(r.analytics) : ''}<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script><script src="/assets/site.js" defer></script>
  <script>
    try {
      const key = 'easyjoy.navigation';
      const arrival = JSON.parse(sessionStorage.getItem(key));
      sessionStorage.removeItem(key);
      if (arrival && arrival.url === location.href && Date.now() - arrival.at < 60000 &&
          !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('brand-arrival');
      }
    } catch {}
  </script>
  </head><body${route === '/' ? ' class="home-page"' : ''}>${logoSprite}<a class="skip-link" href="#main">Skip to content</a>
  
  <div class="brand-transition" aria-hidden="true" inert><div class="transition-lockup">${logoMark()}</div></div>
  <header class="site-header"><div class="container header-row"><a class="brand" href="/" aria-label="Easy Joy home">${brandMark}</a><button class="mobile-nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Menu"><span class="toggle-label">Menu</span> <span aria-hidden="true">☰</span></button><nav id="primary-nav" aria-label="Main navigation"><ul class="navlinks">${nav.map(([label,url])=>`<li class="${label==='Menu'?'has-category-menu':''}"><a href="${url}"${(url === '/' ? route === '/' : route.startsWith(url)) ? ' aria-current="page"' : ''}>${label}</a>${label==='Menu'?'<button class="category-toggle" type="button" aria-label="Show menu categories" aria-expanded="false" aria-controls="category-dropdown"><span aria-hidden="true">⌄</span></button>'+categoryPanel:''}</li>`).join('')}</ul><div class="nav-contact"><a href="tel:${r.telephone}" aria-label="Call Easy Joy, ${escape(r.displayPhone)}">Call us</a><a href="${escape(r.directionsUrl)}" target="_blank" rel="noopener">Get directions</a><p>${escape(r.displayPhone)}<br>${escape(r.hoursMessage)}</p></div></nav><a class="button small header-order" href="${escape(r.orderUrl)}">Order online <span aria-hidden="true">↗</span></a></div></header>
  <nav class="mobile-actions" aria-label="Reserve or order">${r.reservationUrl ? `<a class="mobile-reserve" data-plain href="${escape(r.reservationUrl)}" target="_blank" rel="noopener">${brandIcon('yelp', 18)}Reserve a table</a>` : ''}<a class="mobile-order" data-plain href="${escape(r.orderUrl)}">Order pickup <span aria-hidden="true">↗</span></a></nav>
  <main id="main">${body}</main>
  <a class="back-to-top" href="#main" hidden>Back to top ↑</a>
  <footer class="site-footer"><div class="container">
    <div class="footer-upper"><div class="footer-brand"><a class="wordmark" href="/" aria-label="Easy Joy home">${logoMark('footer-logo')}</a><p class="footer-tagline">Hot Pot · Dim Sum · BBQ Skewers</p></div><nav aria-label="Footer navigation"><h2 class="sr-only">Explore</h2><div class="footer-links">${footerNav.map(([l,u])=>`<a href="${u}">${l}</a>`).join('')}</div></nav></div>
    ${platformRow(r,{heading:'Find Easy Joy online',className:'platform-row-footer'})}
    <div class="footer-lower"><div class="footer-contact"><address>${escape(addressLine(r))}</address><a href="tel:${r.telephone}">${escape(r.displayPhone)}</a><p>${escape(r.hoursMessage)}</p></div><div class="footer-order"><h2 class="sr-only">Order &amp; Visit</h2><a data-plain href="${escape(r.orderUrl)}">Order pickup online ↗</a><a data-plain href="${escape(r.reservationUrl)}" target="_blank" rel="noopener">Reserve a table ↗</a><a class="footer-directions" href="${escape(r.directionsUrl)}">Get directions ↗</a></div></div>
    <div class="footer-bottom"><span>© ${r.lastReviewed.slice(0,4)} ${escape(r.shortName)}</span></div>
  </div></footer></body></html>`;
  // ↗ means "leaves this site". Links that stay on the site get → instead.
  const arrows = page => page.replace(/<a\b[^>]*?href="(?:\/|#)[^"]*"[^>]*>[\s\S]*?<\/a>/g, link => link.replace(/↗/g, '→'));
  const out = svgGlyphs(arrows(html).replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (link, before, href, after) => href === escape(r.orderUrl) && !(before + after).includes('data-plain') ? orderActions((before + after).includes('header-order')) : link));
  const cut = out.indexOf('</head>');
  return out.slice(0, cut) + out.slice(cut).replace(/(?<=>[^<]*)all-\u2060you-\u2060can-\u2060eat/gi, m => `<span class="nowrap">${m}</span>`);
}
export function faqSchema(faqs) {
  return {'@type':'FAQPage', mainEntity:faqs.map(faq => ({'@type':'Question', name:faq.question, acceptedAnswer:{'@type':'Answer', text:faq.answer}}))};
}
