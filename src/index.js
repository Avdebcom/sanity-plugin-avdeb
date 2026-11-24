/**
 * sanity-plugin-avdeb: AVDEB products in Sanity Studio, with your affiliate referral code on every link.
 *
 *   // sanity.config.ts
 *   import { avdeb } from "sanity-plugin-avdeb";
 *   export default defineConfig({ plugins: [avdeb()] });
 *
 *   // in a Portable Text field
 *   defineField({ name: "body", type: "array", of: [{ type: "block" }, { type: "avdebProducts" }, { type: "avdebProduct" }, { type: "avdebButton" }] })
 *
 * Render them on your site with `sanity-plugin-avdeb/react` or `sanity-plugin-avdeb/render`.
 */

import { definePlugin } from "sanity";

import { avdebButton, avdebProduct, avdebProducts, avdebTypes } from "./schema/types.js";
import { configurePreview } from "./studio/runtime.js";

export const avdeb = definePlugin((options = {}) => {
	configurePreview(options);
	return {
		name: "sanity-plugin-avdeb",
		schema: { types: avdebTypes },
	};
});

/** The three type names, for `of: avdebBlockTypes.map((type) => ({ type }))`. */
export const avdebBlockTypes = ["avdebProducts", "avdebProduct", "avdebButton"];

export { avdebButton, avdebProduct, avdebProducts, avdebTypes };
export { AvdebPreview } from "./studio/AvdebPreview.js";
export { ProductInput } from "./studio/ProductInput.js";
export default avdeb;
