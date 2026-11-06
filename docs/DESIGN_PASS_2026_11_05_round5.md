# Round 5 (2026-11-05, owner feedback)

- 意中人 calligraphy is now upright: re-traced from the staff T-shirt print (owner's reference photo) into `lib/calligraphy-path.json` and `assets/yizhongren-calligraphy.svg`. The old trace came from an angled storefront photo and leaned. No Chinese text on any page is italic or skewed.
- Header: lion stamp removed; the header is the round logo + EASY JOY 意中人 again (footer keeps the lion stamp).
- Phones: the header shows the logo and wordmark; Reserve a table / Order pickup sit in a bar fixed to the bottom of the screen.
- Home hero: a "Special offers" band across the bottom quarter of the hero, one offer at a time (student deal: bring 3 friends, the 4th hot pot is free; $28 before 5 PM with dim sum from the cart). Text rises in, the fourth pot gets a FREE stamp, a progress bar shows the timing; pauses on hover/focus, with Pause motion, and with reduced motion. Offers live in `content/home.json → promotions`.
- Gallery: "All food photos" is the last section and uses only the official photos from the online ordering menu (123 dishes, one each). The old composite dish set (incl. dishes we do not serve, e.g. Seafood Congee) is no longer used on the gallery. Grill row uses the ordering-menu BBQ photos.
- `npm run check`: header has no lion, offers band present, gallery food photos = every ordering-menu photo once, no old dish photos, food photos at the bottom.
