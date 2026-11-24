/** The three AVDEB object types. Add them to Portable Text (`of: [...]`) or any array of blocks. */

import { defineField, defineType } from "sanity";

import { ALIGNMENTS, BUTTON_VARIANTS, MAX_LIMIT_ANONYMOUS, MAX_LIMIT_SECRET, PRODUCT_VARIANTS } from "../core/constants.js";
import { AvdebPreview } from "../studio/AvdebPreview.js";
import { ProductInput } from "../studio/ProductInput.js";
import { DISPLAY_FIELDSET, displayFields, layoutField, selectAll } from "./fields.js";
import { ButtonIcon, ProductIcon, ProductsIcon } from "./icons.js";

const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const titleOf = (v) => (typeof v === "string" ? v.replace(/^https?:\/\/(www\.)?avdeb\.com/, "").replace(/\?.*$/, "") : "");
/** "https://avdeb.com/store/custom-qr-code-keychain/" → "Custom qr code keychain" */
const productName = (v) => {
	const slug = titleOf(v).split("/").filter(Boolean).pop() || "";
	const words = slug.replace(/[-_]+/g, " ").trim();
	return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
};

const productsFields = [
	{
		name: "url",
		title: "Products",
		type: "string",
		description:
			"An AVDEB creator, category or product link (https://avdeb.com/category/stickers/), or search words. Leave empty for the newest products.",
		placeholder: "https://avdeb.com/creators/…",
	},
	layoutField,
	{
		name: "limit",
		title: "Number of products",
		type: "number",
		description: `1–${MAX_LIMIT_ANONYMOUS} (up to ${MAX_LIMIT_SECRET} with a secret key). Default: 6`,
		validation: (rule) => rule.min(1).max(MAX_LIMIT_SECRET).integer(),
	},
	{ name: "heading", title: "Heading", type: "string" },
	{ name: "intro", title: "Intro", type: "text", rows: 2 },
	{ name: "viewAll", title: "Show the “View all” link", type: "boolean", initialValue: true },
	...displayFields({ columns: true }),
];

export const avdebProducts = defineType({
	name: "avdebProducts",
	title: "AVDEB products",
	type: "object",
	icon: ProductsIcon,
	fieldsets: [DISPLAY_FIELDSET],
	fields: productsFields.map((f) => defineField(f)),
	preview: {
		select: selectAll(productsFields),
		prepare: (v) => ({
			title: v.heading || titleOf(v.url) || "Newest products",
			subtitle: `AVDEB products · ${label(v.layout || "grid")}`,
			avdeb: { _type: "avdebProducts", ...v },
		}),
	},
	components: { preview: AvdebPreview },
});

const productFields = [
	{
		name: "product",
		title: "Product",
		type: "string",
		description: "Search AVDEB, or paste a product link (https://avdeb.com/store/…).",
		components: { input: ProductInput },
	},
	{
		name: "variant",
		title: "Style",
		type: "string",
		options: {
			list: PRODUCT_VARIANTS.map((v) => ({ title: v === "card" ? "Compact card" : label(v), value: v })),
			layout: "radio",
			direction: "horizontal",
		},
		initialValue: "horizontal",
	},
	{ name: "badge", title: "Badge", type: "string", description: "For example Editor's pick", validation: (rule) => rule.max(40) },
	{ name: "note", title: "Your note", type: "text", rows: 3 },
	...displayFields(),
];

export const avdebProduct = defineType({
	name: "avdebProduct",
	title: "AVDEB product",
	type: "object",
	icon: ProductIcon,
	fieldsets: [DISPLAY_FIELDSET],
	fields: productFields.map((f) => defineField(f)),
	preview: {
		select: selectAll(productFields),
		prepare: (v) => ({
			title: productName(v.product) || "Choose a product",
			subtitle: `AVDEB product · ${label(v.variant || "horizontal")}`,
			avdeb: { _type: "avdebProduct", ...v },
		}),
	},
	components: { preview: AvdebPreview },
});

const buttonFields = [
	{
		name: "href",
		title: "Link",
		type: "string",
		description: "Any avdeb.com page: /creators/cleo/ or https://avdeb.com/category/stickers/. Your referral code is added.",
		validation: (rule) => rule.required(),
	},
	{ name: "label", title: "Label", type: "string", placeholder: "Shop on AVDEB" },
	{
		name: "variant",
		title: "Style",
		type: "string",
		options: { list: BUTTON_VARIANTS.map((v) => ({ title: label(v), value: v })), layout: "radio", direction: "horizontal" },
		initialValue: "solid",
	},
	{
		name: "align",
		title: "Alignment",
		type: "string",
		options: { list: ALIGNMENTS.map((v) => ({ title: label(v), value: v })), layout: "radio", direction: "horizontal" },
		initialValue: "start",
	},
];

export const avdebButton = defineType({
	name: "avdebButton",
	title: "AVDEB button",
	type: "object",
	icon: ButtonIcon,
	fields: buttonFields.map((f) => defineField(f)),
	preview: {
		select: selectAll(buttonFields),
		prepare: (v) => ({
			title: v.label || "Shop on AVDEB",
			subtitle: `AVDEB button · ${titleOf(v.href) || "no link yet"}`,
			avdeb: { _type: "avdebButton", ...v },
		}),
	},
	components: { preview: AvdebPreview },
});

export const avdebTypes = [avdebProducts, avdebProduct, avdebButton];
