# Restaurant site implementation

- Read README.md and docs/CONTENT_GAPS.md before changing restaurant facts.
- Keep menu data in content/menu.json; keep NAP, domain and order URL in content/restaurant.json.
- Preserve source dish names, prices, serving sizes and sold-out snapshot context.
- Do not infer AYCE prices from pickup item prices. Do not publish unconfirmed opening hours, reviews, history, dietary guarantees or reservation links.
- Core content must be generated in static HTML; JS provides only optional interaction.
- Images are deferred. Missing images must not block menu, about, location or FAQ content.
- Run npm run build and npm run check after changes. No dependency installation is required.
- Keep staging noindex distinct from production indexing configuration.
