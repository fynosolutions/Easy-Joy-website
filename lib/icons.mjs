// Brand marks: Simple Icons (CC0 1.0, simpleicons.org); ezCater uses a generic serving-cloche mark.
import {readFileSync} from 'node:fs';
export const brandPaths = JSON.parse(readFileSync(new URL('./brand-paths.json', import.meta.url), 'utf8'));
export const brandIcon = (key, size = 20) => `<svg class="brand-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path fill="currentColor" d="${brandPaths[key]}"/></svg>`;

// UI glyphs as inline SVG: Unicode arrows/stars can render as colour emoji on iPhone.
const glyph = d => `<svg class="glyph" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const glyphs = {
  '↗': glyph('<path d="M7 17 17 7M8 7h9v9"/>'),
  '↓': glyph('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  '↑': glyph('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  '←': glyph('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  '→': glyph('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  '⌄': glyph('<path d="m6 9 6 6 6-6"/>'),
  '☰': glyph('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  '★': '<svg class="glyph star" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>'
};

// Replace glyph characters in text nodes only (never inside tags, attributes, scripts or JSON-LD).
export function svgGlyphs(html) {
  return html.split(/(<script[\s\S]*?<\/script>|<[^>]+>)/).map(part => part.startsWith('<') ? part : part.replace(/[↗↓↑←→⌄☰★]/g, ch => glyphs[ch]).replace(/à la carte/g, 'à\u00a0la\u00a0carte').replace(/(all)-(you)-(can)-(eat)/gi, '$1-\u2060$2-\u2060$3-\u2060$4').replace(/(\d)–(\d+) /g, '$1\u2060–\u2060$2\u00a0')).join('');
}

// Every public profile / ordering platform the restaurant is listed on (links checked 2026-11-04).
export function platformRow(r, {heading = 'Find us online', className = '', groups: only = ['reviews', 'social', 'order', 'catering']} = {}) {
  const labels = {reviews: 'Reviews & maps', social: 'Follow us', order: 'Delivery', catering: 'Catering'};
  const groups = only.map(key => [labels[key], r.profiles.filter(p => p.group === key)]).filter(([, list]) => list.length);
  return `<section class="platform-row ${className}" aria-label="${heading}"><h2 class="platform-heading">${heading}</h2><div class="platform-groups">${groups.map(([label, list]) => `<div class="platform-group platform-group-${list.length > 3 ? 'wide' : 'narrow'}"><p>${label}</p><ul>${list.map(p => `<li><a class="platform-link" href="${p.url}" target="_blank" rel="noopener" aria-label="Easy Joy on ${p.name}" title="${p.name}">${brandIcon(p.icon, 20)}<span>${p.name}</span></a></li>`).join('')}</ul></div>`).join('')}</div></section>`;
}
