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
  return `<img class="${className}" src="${escape(item.image)}"${item.imageSmall ? ` srcset="${escape(item.imageSmall)} 480w, ${escape(item.image)} 960w" sizes="${className==='dish-photo' ? '128px' : '(max-width:600px) 90vw, (max-width:1000px) 45vw, 400px'}"` : ''} alt="${escape(item.alt || item.name || item.englishName)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">`;
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
  const nav = r.navigation.map(({label,href})=>[label,href]);
  const footerNav = [...nav, ['Gallery','/gallery/'], ['FAQ','/faq/']];
  const categoryPanel = `<div class="category-dropdown" id="category-dropdown" hidden><div class="container"><div class="dropdown-heading"><h2>Find your favorite.</h2><a href="/menu/">Full menu ↗</a></div><nav aria-label="Quick menu categories"><ul>${categories.map(category=>`<li><a href="/menu/#${slug(category.name)}" data-category-link>${escape(category.name)}<span>${category.items.length} dishes ↗</span></a></li>`).join('')}</ul></nav></div></div>`;
  const graph = [restaurantSchema(r),{'@type':'WebSite','@id':`${r.domain}/#website`,url:`${r.domain}/`,name:r.name,inLanguage:r.language},...schemas];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${preview || noindex ? 'noindex, nofollow' : 'index, follow'}">
  <link rel="canonical" href="${escape(absolute(r,route))}"><meta property="og:type" content="website"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="${escape(r.name)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(absolute(r,route))}">
  <meta name="theme-color" content="#febd2d"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script><script src="/assets/site.js" defer></script>
  </head><body><a class="skip-link" href="#main">Skip to content</a>
  <div class="topline"><span>145 Mulberry St · Chinatown, New York</span><a href="tel:${r.telephone}">${escape(r.displayPhone)}</a></div>
  <header class="site-header"><div class="container header-row"><a class="brand" href="/" aria-label="Easy Joy home"><span class="brand-name">EASY JOY <span lang="zh">意中人</span></span><small>DIM SUM & AYCE HOT POT</small></a><nav id="primary-nav" aria-label="Main navigation"><ul class="navlinks">${nav.map(([label,url])=>`<li class="${label==='Menu'?'has-category-menu':''}"><a href="${url}"${active===label || (label==='Overview' && route==='/') ? ' aria-current="page"' : ''}>${label}</a>${label==='Menu'?'<button class="category-toggle" type="button" aria-label="Show menu categories" aria-expanded="false" aria-controls="category-dropdown"><span aria-hidden="true">⌄</span></button>'+categoryPanel:''}</li>`).join('')}</ul></nav><a class="button small header-order" href="${escape(r.orderUrl)}">Order online <span aria-hidden="true">↗</span></a></div></header>
  <main id="main">${body}</main>
  <section class="closing"><div class="container closing-row"><div><p class="eyebrow">YOUR NEXT BITE STARTS HERE</p><h2>A little dim sum.<br>A lot to look forward to.</h2></div><div class="closing-links"><a class="button light" href="${escape(r.orderUrl)}">Order online ↗</a><a class="text-link" href="/location/">Find us on Mulberry Street ↗</a></div></div></section>
  <a class="back-to-top" href="#main" hidden>Back to top ↑</a>
  <footer class="site-footer"><div class="container footer-grid"><div><a class="wordmark" href="/">EASY JOY<span lang="zh">意中人</span></a><p>${escape(r.name)}</p><address>${escape(addressLine(r))}<br><a href="tel:${r.telephone}">${escape(r.displayPhone)}</a></address><p class="fine">${escape(r.hoursMessage)}</p></div><nav aria-label="Footer navigation"><h2>Explore</h2>${footerNav.map(([l,u])=>`<a href="${u}">${l}</a>`).join('')}</nav><div><h2>Make it a meal</h2><a href="${escape(r.orderUrl)}">Online ordering ↗</a><a href="${escape(r.directionsUrl)}">Get directions ↗</a><p class="fine">Online menu prices in USD.<br>Menu recorded on October 20, 2026.</p></div></div><div class="container footer-bottom"><span>© ${r.lastReviewed.slice(0,4)} ${escape(r.shortName)}</span><span>Dim sum & hot pot · New York, NY</span></div></footer></body></html>`;
}
