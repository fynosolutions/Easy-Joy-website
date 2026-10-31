export const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const slug = value => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const money = value => `$${Number(value).toFixed(2)}`;
export const addressLine = r => `${r.address.streetAddress}, ${r.address.addressLocality}, ${r.address.addressRegion} ${r.address.postalCode}`;
export const absolute = (r, path) => `${r.domain}${path}`;
export function restaurantSchema(r) {
  const data = {
    '@type':'Restaurant', '@id':`${r.domain}/#restaurant`, name:r.name, alternateName:r.alternateName,
    url:`${r.domain}/`, telephone:r.telephone, servesCuisine:r.servesCuisine, ...(r.description ? {description:r.description} : {}),
    address:{'@type':'PostalAddress', ...r.address}, hasMenu:`${r.domain}/menu/`
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
    return `<section class="faq-item"><h2>${escape(faq.question)}</h2><p>${escape(faq.answer)}</p><a href="${escape(url)}">${escape(faq.linkLabel)} ↗</a></section>`;
  }).join('')}</div>`;
}
export function shell(r, {route='/',title,description,body,schemas=[],active='',preview=false,noindex=false,categories=[]}) {
  let orderIndex = 0;
  const orderActions = header => {
    const panelId = `delivery-options-${orderIndex++}`;
    return `<div class="order-actions${header ? ' header-order' : ''}"><a class="order-pickup" href="${escape(r.orderUrl)}">Order Pickup <span aria-hidden="true">↗</span></a><details class="delivery-menu"><summary aria-controls="${panelId}">Order Delivery <span aria-hidden="true">⌄</span></summary><div class="delivery-panel" id="${panelId}"><p>Choose your delivery platform</p>${r.deliveryPlatforms.map(platform=>`<a href="${escape(platform.url)}" target="_blank" rel="noopener noreferrer">${escape(platform.name)} <span aria-hidden="true">↗</span></a>`).join('')}<small>Availability, delivery fees and range are shown on each platform.</small></div></details></div>`;
  };
  const nav = r.navigation.map(({label,href})=>[label,href]);
  const footerNav = [...nav, ['Contact','/contact/'], ['Gallery','/gallery/'], ['FAQ','/faq/']];
  const categoryPanel = `<div class="category-dropdown" id="category-dropdown" hidden><div class="container"><div class="dropdown-heading"><h2>Find your favorite.</h2><a href="/menu/">Full menu ↗</a></div><nav aria-label="Quick menu categories"><ul>${categories.map(category=>`<li><a href="/menu/#${slug(category.name)}" data-category-link>${escape(category.name)}<span>${category.items.length} dishes ↗</span></a></li>`).join('')}<li><a href="/menu/#drinks-menu" data-category-link>Drinks Menu<span>Dine-in</span></a></li></ul></nav></div></div>`;
  const graph = [restaurantSchema(r),{'@type':'WebSite','@id':`${r.domain}/#website`,url:`${r.domain}/`,name:r.name,inLanguage:r.language},...schemas];
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${preview || noindex ? 'noindex, nofollow' : 'index, follow'}">
  <link rel="canonical" href="${escape(absolute(r,route))}"><meta property="og:type" content="website"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="${escape(r.name)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(absolute(r,route))}">
  <meta name="theme-color" content="#A52A2F"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/style.css">${route === '/' ? '<link rel="stylesheet" href="/assets/home.css"><script src="/assets/home.js" defer></script>' : ''}
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script><script src="/assets/site.js" defer></script>
  </head><body${route === '/' ? ' class="home-page"' : ''}><a class="skip-link" href="#main">Skip to content</a>
  
  <header class="site-header"><div class="container header-row"><a class="brand" href="/" aria-label="Easy Joy home"><img class="brand-logo" src="/assets/easy-joy-logo-transparent.png" width="1254" height="1254" alt="Easy Joy logo" decoding="async"><span class="brand-copy"><span class="brand-name">EASY JOY <span lang="zh">意中人</span></span><small>HOT POT · DIM SUM · BBQ SKEWERS</small></span></a><button class="mobile-nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu <span aria-hidden="true">☰</span></button><nav id="primary-nav" aria-label="Main navigation"><ul class="navlinks">${nav.map(([label,url])=>`<li class="${label==='Menu'?'has-category-menu':''}"><a href="${url}"${(url === '/' ? route === '/' : route.startsWith(url)) ? ' aria-current="page"' : ''}>${label}</a>${label==='Menu'?'<button class="category-toggle" type="button" aria-label="Show menu categories" aria-expanded="false" aria-controls="category-dropdown"><span aria-hidden="true">⌄</span></button>'+categoryPanel:''}</li>`).join('')}</ul></nav><a class="button small header-order" href="${escape(r.orderUrl)}">Order online <span aria-hidden="true">↗</span></a></div></header>
  <main id="main">${body}</main>
  <a class="back-to-top" href="#main" hidden>Back to top ↑</a>
  <footer class="site-footer"><div class="container">
    <div class="footer-upper"><div class="footer-brand"><a class="wordmark" href="/">EASY JOY<span lang="zh">意中人</span></a><p class="footer-tagline">Hot Pot · Dim Sum · BBQ Skewers</p></div><nav aria-label="Footer navigation"><h2 class="sr-only">Explore</h2><div class="footer-links">${footerNav.map(([l,u])=>`<a href="${u}">${l}</a>`).join('')}</div></nav></div>
    <div class="footer-lower"><div class="footer-contact"><address>${escape(addressLine(r))}</address><a href="tel:${r.telephone}">${escape(r.displayPhone)}</a><p>${escape(r.hoursMessage)}</p></div><div class="footer-order"><h2 class="sr-only">Order &amp; Visit</h2><a href="${escape(r.orderUrl)}">Online ordering ↗</a><a class="footer-directions" href="${escape(r.directionsUrl)}">Get directions ↗</a></div></div>
    <div class="footer-bottom"><span>© ${r.lastReviewed.slice(0,4)} ${escape(r.shortName)}</span></div>
  </div></footer></body></html>`;
  return html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (link, before, href, after) => href === escape(r.orderUrl) ? orderActions((before + after).includes('header-order')) : link);
}
