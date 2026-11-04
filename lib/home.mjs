import {foodImage} from './site.mjs';
import {filmSection} from './media.mjs';

export function diningExperience(media, standalone = false) {
  const room = media.diningPhotos.find(photo => photo.id === 'dining-room');
  const entrance = media.diningPhotos.find(photo => photo.id === 'entrance');
  return `<section id="dining-experience" class="section dining-section"><div class="container">
    <div class="section-heading"><div><p class="eyebrow">The dining room</p><h2>Lanterns, long tables<br>and hot pots for the table.</h2></div>${standalone ? '<a class="text-link" href="/location/">Plan your visit ↗</a>' : '<a class="text-link" href="/facility/">Explore Our Dining Space ↗</a>'}</div>
    <figure class="dining-hero">${foodImage(room,'dining-room-image')}<figcaption>The main dining room, set for hot pot.</figcaption></figure><div class="dining-photos"><figure>${foodImage(entrance,'dining-entry-image')}<figcaption>The entrance and front tables.</figcaption></figure><figure><img class="dining-entry-image" src="/assets/images/lifestyle/squid-on-the-grill-960.webp" srcset="/assets/images/lifestyle/squid-on-the-grill-480.webp 480w, /assets/images/lifestyle/squid-on-the-grill-960.webp 960w" sizes="(max-width:600px) calc(100vw - 40px), 50vw" width="960" height="640" alt="Squid skewers on the grill" loading="lazy" decoding="async"><figcaption>Skewers on the grill.</figcaption></figure></div>
    ${filmSection(media)}
  </div></section>`;
}

export {renderHome} from './home-editorial.mjs';
