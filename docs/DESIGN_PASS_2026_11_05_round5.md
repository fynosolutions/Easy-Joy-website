# Round 5 (2026-11-05, owner feedback)

- 意中人 calligraphy is now upright: re-traced from the staff T-shirt print (owner's reference photo) into `lib/calligraphy-path.json` and `assets/yizhongren-calligraphy.svg`. The old trace came from an angled storefront photo and leaned. No Chinese text on any page is italic or skewed.
- Header: lion stamp removed; the header is the round logo + EASY JOY 意中人 again (footer keeps the lion stamp).
- Phones: the header shows the logo and wordmark; Reserve a table / Order pickup sit in a bar fixed to the bottom of the screen.
- Home hero: a "Special offers" band across the bottom quarter of the hero, one offer at a time (student deal: bring 3 friends, the 4th hot pot is free; $28 before 5 PM with dim sum from the cart). Text rises in, the fourth pot gets a FREE stamp, a progress bar shows the timing; pauses on hover/focus, with Pause motion, and with reduced motion. Offers live in `content/home.json → promotions`.
- Gallery: "All food photos" is the last section and uses only the official photos from the online ordering menu (123 dishes, one each). The old composite dish set (incl. dishes we do not serve, e.g. Seafood Congee) is no longer used on the gallery. Grill row uses the ordering-menu BBQ photos.
- `npm run check`: header has no lion, offers band present, gallery food photos = every ordering-menu photo once, no old dish photos, food photos at the bottom.

# Round 6 (2026-11-05, owner feedback)

- Offers band: a gold "★ Special offers 1 / 3" badge sits on the band's top edge, and every offer has its own tag (Student deal / Lunch special / Vegetarian options), so the band reads as a promotions area. The three offers: student 3 + 1; the $19.95 weekday lunch set (Mon–Fri 11 AM–4 PM: your own pot with a plate of sliced beef, a plate of fresh vegetables and egg noodles; a set, not all-you-can-eat; ask without meat for a vegetarian set); vegetarian options. The $28 slide was removed because the price block right below says the same.
- New page `/vegetarian/` for search and AI answers: vegetarian-friendly broths (printed menu: "most broth can be vegetarian friendly"; Yunnan mushroom; Hainan coconut made with coconut water), the all-you-can-eat fridge (16 ordering-menu photos), vegetarian dishes with menu prices, prices for vegetarians, FAQ. It states plainly that the Chongqing broth uses beef tallow, and does not claim vegan or allergy-safe. FAQPage + Menu schema with `suitableForDiet: VegetarianDiet`; `/faq/` has a vegetarian question; `llms.txt` has lunch-set and vegetarian lines; Restaurant `servesCuisine` includes "Vegetarian options"; footer links to the page.
- Google Business Profile and Yelp attributes (vegetarian options) need the owner's dashboards: see the owner to-do.
