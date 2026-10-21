import {escape as e,addressLine} from './site.mjs';
export function locationMap(r) {
  const address=addressLine(r);
  const src=`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;
  return `<div class="location-map"><iframe src="${e(src)}" title="Google Maps: ${e(r.shortName)} at ${e(address)}" width="800" height="440" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a class="map-external" href="${e(r.googleMapsUrl || r.directionsUrl)}" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a></div>`;
}
