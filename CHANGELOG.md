# Changelog

## 0.1.0 - 2026-11-24

- First release: `avdebProducts`, `avdebProduct` and `avdebButton` object types for Portable Text and page builders, with live previews in Sanity Studio 5 and 6 and a product search for single products.
- Front end: `sanity-plugin-avdeb/react` (async server components or prerendered HTML for `@portabletext/react`), `sanity-plugin-avdeb/render` (`createAvdeb`, `block`, `prerender`, `data`, `toHTMLComponents` for `@portabletext/to-html`).
- Grid, carousel, list and spotlight layouts; horizontal, hero and compact single products; referral buttons.
- Products cached in memory; the last good copy is used for a week if AVDEB can't be reached.
