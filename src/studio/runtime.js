/** The browser runtime behind the Studio preview and product search. */

import { createAvdeb } from "../runtime.js";

let options = {};
let instance = null;

/** Called by the plugin with its options (display defaults, refCode, locale). */
export function configurePreview(next = {}) {
	const { apiKey, ...rest } = next ?? {};
	if (apiKey) {
		console.warn(
			"[sanity-plugin-avdeb] apiKey is ignored in the Studio: it would be published in the Studio bundle. Set it on your front end (createAvdeb) or in AVDEB_SECRET_KEY.",
		);
	}
	options = rest;
	instance = null;
}

/** One shared runtime per Studio tab: products are cached while you edit. */
export function previewAvdeb() {
	if (!instance) instance = createAvdeb({ ...options, preview: true, env: false, quiet: true, cacheMinutes: 30 });
	return instance;
}
