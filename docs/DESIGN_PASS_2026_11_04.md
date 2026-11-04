# Design pass · 2026-11-04 (Fyno review)

Two blind design reviews (screenshots only) scored the 11-03 site 4.5/10. Main reasons: nothing on the site was specific to this restaurant, the AYCE price was missing, photos repeated across pages, and the storefront photo was cropped badly and showed a HungryPanda ad board. This pass fixes those points.

## What changed

| Area | Change |
|---|---|
| Brand element | `意中人` is traced from the restaurant's own yellow storefront sign (photo `_25A4705`) into `lib/calligraphy-path.json` and `assets/yizhongren-calligraphy.svg`. It appears in the header, the footer and the homepage hero. The system-font 意中人 is gone from those places. |
| AYCE price | $28 per person before 5 PM, which includes 4–6 rotating dim sum from the cart. $43 after 5 PM, when dim sum is à la carte. These are the prices 毛 published on Google Business Profile, Yelp, Google Ads and ChatGPT ads (confirmed 2026-10-31). They now appear on the homepage, Dining, Menu, the FAQ (`#ayce-price`), the About facts and `llms.txt`. |
| Reservations | Every "Reserve a table" link goes to the Yelp Guest Manager page, which also powers the Google Maps reservation button. |
| Platform row | Every page footer now has a row of icons: Google, Yelp, Tripadvisor, Apple Maps, Instagram, TikTok, DoorDash, Uber Eats, Grubhub and ezCater. The data lives in `content/restaurant.json → profiles`. Each link was opened in a real browser on 2026-11-04. Brand icons come from Simple Icons (CC0). ezCater uses a generic cloche icon. |
| AI search | Restaurant JSON-LD gains `sameAs` (all 10 platforms), `geo`, `priceRange`, `acceptsReservations`, `hasMap`, `image` and `logo`. `/faq/` gets FAQPage schema. New FAQs cover price, reservations, delivery and catering. The production robots.txt names the AI crawlers (OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot, Google-Extended and others) as allowed. New `/llms.txt` gives a plain fact sheet. |
| Photos | The storefront photo is re-cropped (`storefront-sign-1262.webp`): the sign is kept and the HungryPanda board removed. It is used on About and Visit Us only. The homepage hot pot scene now shows the hot pot table. The dim sum scene shows siu mai, so the soup-dumpling photo no longer repeats. Gallery no longer reuses the Dining room and entrance photos. Each venue photo is used on at most 2 pages. |
| Our Story | Added the storefront photo, photos on the signature-dish cards and a new headline. Removed the 01/02/03 numbering. |
| Dining | The dining room photo now runs full width. Added the entrance and hot pot table photos below it. Captions describe what is in each photo. |
| Visit Us | Added a "Look for the yellow sign" section with the storefront photo, the cross streets (Grand St / Hester St) and a note that Canal St station is about a 5-minute walk away. Added a Reservations box. |
| Wording | Removed "MealKeyway", "Reviewed on", "captured", "not a live Google reviews feed" and "do not indicate AYCE inclusions" from visible text. Translated the one Chinese-only menu description (the source text is kept in `sourceDescription`). |
| Glyphs | `↗ ↓ ↑ ← → ⌄ ☰ ★ ▶` are rendered as inline SVG (`lib/icons.mjs → svgGlyphs`), because iPhone can turn them into colour emoji. |
| Layout | The homepage width now matches the inner pages (1200px). The hero has one main button (Reserve) and one text link. The cuisine cards have different heights and no numbers. The phone header is one row of about 64px. Native video controls stay hidden until the viewer presses Play. Phone body text is at least 14px. |
| Checks | `npm run check` has a new block for llms.txt, FAQPage, sameAs = 10, no Unicode glyphs or internal wording in visible text, and a platform row on every page. A negative control was run: an injected glyph made it fail. |

## Still needs the restaurant (not done)

- Confirm the AYCE prices and the 5 PM cut-off before the domain switches. Also confirm children's pricing and the dining time limit.
- Provide real story facts (opening year, who runs the kitchen). The About page still uses the owner's original copy.
- Provide seat count, large tables and group size for the Dining page.
- Provide new photos: a full room with guests, the sauce bar, the dim sum cart, and a hot pot close-up with steam. The current set is small, so several pages share photos.
- Menu category names come from the ordering system ("Take Out Menu", "New Arrival"). Renaming them changes URLs, so they are left as they are.

## Round 2 (same day, owner-side feedback)

| Area | Change |
|---|---|
| AYCE wording | All-you-can-eat covers the **hot pot only**. Dim sum and BBQ skewers are à la carte at lunch and dinner. Before 5 PM the $28 price also includes 4–6 kinds of dim sum from the daily rotating cart. One sentence in `content/restaurant.json → ayceNote` drives the homepage; FAQ, About, Dining, Contact, Menu and `llms.txt` say the same. `$28` is every day (Monday to Sunday) before 5 PM. |
| Hero | The 意中人 sign calligraphy now sits beside the gold "Easy Joy." line (`.hero-mark`) instead of a large watermark over the photo. |
| Price block | Two columns on desktop: prices left, rules right (no empty red block). |
| Cuisine cards | Wider hot pot card (1.6fr / 1fr / 1fr), equal heights. Dim sum and BBQ use real Feishu photos (`宣传片图/_25A4682`, `0906新图/DSC04491`). |
| Story scenes | "A table full of possibilities" and "One more basket. Always." use full-table images instead of single studio dishes. On desktop the photo sits beside the text panel, not under it. |
| Carousel | No cloned cards: each dish appears once, autoplay steps one card and rewinds. Mystery Box removed; dishes are unique. |
| Menu | Mystery Box Set (sold out) removed from the menu and gallery. |
| Text | "à la carte" and "4–6 kinds" never break across lines. |
| Checks | New `check.mjs` block: AYCE = hot pot only, no "unlimited dim sum", no Mystery Box, unique carousel dishes, no card cloning, hero mark inline. |

Image sources (real vs AI-generated) are listed in `docs/HOME_IMAGE_SOURCES.json`.

## Round 3 (owner feedback, same day)
- "Find your next favorite" now uses the printed menu's own dish photos (cutouts in `assets/images/menu-card/`), in menu order: hot pot broths and $43 meat → dim sum → BBQ → mains. Cards are menu-paper cream with dark text.
- Dim sum card and the "One more basket" scene use photos from the printed menu (pages 16 and 15) instead of AI images. BBQ card uses the photo from the BBQ & beer A-frame board.
