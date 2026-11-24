/**
 * sanity-plugin-avdeb/react: React components for AVDEB objects in Portable Text.
 *
 * Server components (Next.js App Router, React Router / Remix with RSC…): pass the runtime and the
 * components fetch products on the server.
 *
 *   import { createAvdeb } from "sanity-plugin-avdeb/render";
 *   import { avdebComponents } from "sanity-plugin-avdeb/react";
 *   import "sanity-plugin-avdeb/avdeb.css";
 *
 *   const avdeb = createAvdeb({ refCode: process.env.AVDEB_REF_CODE });
 *   <PortableText value={post.body} components={avdebComponents(avdeb)} />
 *
 * Anywhere else (client components, Pages Router, Vite): render first, then pass the result.
 *
 *   const embeds = await avdeb.prerender(post.body); // in getStaticProps, a loader…
 *   <PortableText value={post.body} components={avdebComponents(embeds)} />
 */

import { createElement as h, Fragment } from "react";

import { AvdebCarousel } from "./react-client.js";
import { AVDEB_TYPES, hasCarousel } from "./runtime.js";

/** Embed HTML from `avdeb.block()` / `avdeb.prerender()`, plus the carousel script when needed. */
export function AvdebHtml({ html, className }) {
	if (!html) return null;
	return h(
		Fragment,
		null,
		h("div", {
			className: className ? `avdeb-embed ${className}` : "avdeb-embed",
			dangerouslySetInnerHTML: { __html: html },
		}),
		hasCarousel(html) ? h(AvdebCarousel) : null,
	);
}

/** Async server component: renders one AVDEB object (avdebProducts, avdebProduct or avdebButton). */
export async function AvdebBlock({ value, avdeb, className, ...extra }) {
	const html = await avdeb.block(value, extra);
	return h(AvdebHtml, { html, className });
}

/**
 * Portable Text `components` for AVDEB objects. Pass a runtime from `createAvdeb()` (server
 * components) or the result of `await avdeb.prerender(value)` (any React). Merge with your own:
 * `{ ...avdebComponents(avdeb).types, ...myTypes }`.
 */
export function avdebComponents(source, options = {}) {
	const live = Boolean(source && typeof source.block === "function");
	const render = live
		? ({ value }) => h(AvdebBlock, { value, avdeb: source, className: options.className })
		: ({ value }) => h(AvdebHtml, { html: (value && source?.[value._key]) || "", className: options.className });
	return { types: Object.fromEntries(AVDEB_TYPES.map((t) => [t, render])) };
}

export { AvdebCarousel };
