/**
 * sanity-plugin-avdeb/render: render AVDEB objects from Sanity to HTML on your server (Node, edge,
 * Deno, Bun) or in a browser. No framework needed.
 *
 *   import { createAvdeb, toHTMLComponents } from "sanity-plugin-avdeb/render";
 *   const avdeb = createAvdeb({ refCode: process.env.AVDEB_REF_CODE });
 *
 *   // one object
 *   const html = await avdeb.block(value);
 *
 *   // @portabletext/to-html (synchronous): render the AVDEB objects first
 *   const embeds = await avdeb.prerender(post.body);
 *   const html = toHTML(post.body, { components: toHTMLComponents(embeds) });
 */

import { AVDEB_TYPES, createAvdeb, hasCarousel, isAvdebBlock } from "./runtime.js";

export { AVDEB_TYPES, createAvdeb, hasCarousel, isAvdebBlock };
export { initCarousels } from "./carousel.js";

/** `components` for @portabletext/to-html from `await avdeb.prerender(value)`. */
export function toHTMLComponents(embeds = {}) {
	const pick = ({ value }) => (value && typeof value._key === "string" && embeds[value._key]) || "";
	return { types: Object.fromEntries(AVDEB_TYPES.map((t) => [t, pick])) };
}
