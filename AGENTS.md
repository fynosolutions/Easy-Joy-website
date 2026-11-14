# Restaurant site implementation

- Read README.md and docs/CONTENT_GAPS.md before changing restaurant facts.
- Keep menu data in content/menu.json; keep NAP, domain and order URL in content/restaurant.json.
- Preserve source dish names, prices, serving sizes and sold-out snapshot context.
- Do not infer AYCE prices from pickup item prices. Do not publish unconfirmed opening hours, reviews, history, dietary guarantees or reservation links.
- Core content must be generated in static HTML; JS provides only optional interaction.
- Images are deferred. Missing images must not block menu, about, location or FAQ content.
- Run npm run build and npm run check after changes. No dependency installation is required.
- Keep staging noindex distinct from production indexing configuration.

## Production (since 2026-11-14)
- www.easyjoybuffet.com is live on this repo. Vercel builds **production only from the `live` branch**. Pushing to `main` makes a preview URL (noindex, no analytics) and does not change the live site.
- Fyno reviews `main` and merges it into `live` to publish. Do not push to `live` directly.
- Until 2026-12-11 (four weeks after the domain switch) do not change page URLs or page wording; swapping images is fine.
