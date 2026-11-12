import {foodImage} from './site.mjs';
import {filmSection} from './media.mjs';

export function diningExperience(media, standalone = false) {
  const room = media.diningPhotos.find(photo => photo.id === 'dining-room');
  const entrance = media.diningPhotos.find(photo => photo.id === 'entrance');
  return `<section id="dining-experience" class="section dining-section${standalone ? ' dining-standalone' : ''}"><div class="container">
    ${standalone ? `<figure class="dining-hero">${foodImage(room,'dining-room-image').replace('loading="lazy"','fetchpriority="high"')}<figcaption>The main dining room, set for hot pot.</figcaption></figure>` : ''}<div class="section-heading"><div><p class="eyebrow">The dining room</p><h2>Lanterns, long tables<br>and hot pots for the table.</h2></div>${standalone ? '<a class="text-link" href="/location/">Plan your visit ↗</a>' : '<a class="text-link" href="/facility/">Explore Our Dining Space ↗</a>'}</div>
    ${standalone ? '' : `<figure class="dining-hero">${foodImage(room,'dining-room-image')}<figcaption>The main dining room, set for hot pot.</figcaption></figure>`}<div class="dining-photos"><figure>${foodImage(entrance,'dining-entry-image')}<figcaption>The entrance and front tables.</figcaption></figure><figure><img class="dining-entry-image" src="/assets/images/home/dining-atmosphere-960.webp" srcset="/assets/images/home/dining-atmosphere-960.webp 960w, /assets/images/home/dining-atmosphere-1920.webp 1920w" sizes="(max-width:600px) calc(100vw - 40px), 50vw" width="1920" height="1280" alt="Guests at dinner under the lanterns in the Easy Joy dining room" loading="lazy" decoding="async"><figcaption>Dinner service in the main room.</figcaption></figure></div>
    ${filmSection(media)}
  </div></section>`;
}

export {renderHome} from './home-editorial.mjs';
