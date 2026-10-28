import {foodImage} from './site.mjs';
import {filmSection} from './media.mjs';

export function diningExperience(media, standalone = false) {
  const room = media.lifestylePhotos.find(photo => photo.id === 'dining-room');
  const entrance = media.lifestylePhotos.find(photo => photo.id === 'entrance');
  return `<section id="dining-experience" class="section dining-section"><div class="container">
    <div class="section-heading"><div><p class="eyebrow">Good food. Good company.</p><h2>Gather at Easy Joy</h2></div>${standalone ? '<a class="text-link" href="/location/">Plan your visit ↗</a>' : '<a class="text-link" href="/facility/">Explore Our Dining Space ↗</a>'}</div>
    <div class="dining-photos"><figure>${foodImage(room,'dining-room-image')}<figcaption>A place to come together.</figcaption></figure><figure>${foodImage(entrance,'dining-entry-image')}<figcaption>Find us at 145 Mulberry Street.</figcaption></figure></div>
    ${filmSection(media)}
  </div></section>`;
}

export {renderHome} from './home-editorial.mjs';
