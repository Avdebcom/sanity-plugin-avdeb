/** Field definitions shared by the AVDEB schema types. */

import { CARD_STYLES, IMAGE_RATIOS, LAYOUTS, THEMES } from "../core/constants.js";

const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const DEFAULT = { title: "Site default", value: "default" };

export const DISPLAY_FIELDSET = {
	name: "display",
	title: "Display",
	description: "Overrides for this embed. Empty fields use the defaults from your front end.",
	options: { collapsible: true, collapsed: true },
};

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const layoutField = {
	name: "layout",
	title: "Layout",
	type: "string",
	options: { list: LAYOUTS.map((v) => ({ title: label(v), value: v })), layout: "radio", direction: "horizontal" },
	initialValue: "grid",
};

/** Card and colour options (products and single product). */
export function displayFields({ columns = false } = {}) {
	return [
		...(columns
			? [
					{
						name: "columns",
						title: "Columns",
						type: "number",
						fieldset: "display",
						description: "1–6. Narrow columns get fewer automatically.",
						validation: (rule) => rule.min(1).max(6).integer(),
					},
				]
			: []),
		{
			name: "cardStyle",
			title: "Card style",
			type: "string",
			fieldset: "display",
			options: { list: [DEFAULT, ...CARD_STYLES.map((v) => ({ title: label(v), value: v }))] },
		},
		{
			name: "theme",
			title: "Theme",
			type: "string",
			fieldset: "display",
			options: {
				list: [
					DEFAULT,
					...THEMES.map((v) => ({
						title: v === "site" ? "Inherit your site's colours" : v === "auto" ? "System (light or dark)" : label(v),
						value: v,
					})),
				],
			},
		},
		{
			name: "accentColor",
			title: "Accent colour",
			type: "string",
			fieldset: "display",
			description: "Hex colour for buttons and highlights, for example #7c3aed.",
			validation: (rule) =>
				rule.custom((v) => (v === undefined || v === "" || HEX_RE.test(v) ? true : "Use a hex colour, for example #7c3aed")),
		},
		{
			name: "radius",
			title: "Corner radius (px)",
			type: "number",
			fieldset: "display",
			validation: (rule) => rule.min(0).max(32).integer(),
		},
		{
			name: "imageRatio",
			title: "Image shape",
			type: "string",
			fieldset: "display",
			options: { list: [DEFAULT, ...IMAGE_RATIOS.map((v) => ({ title: label(v), value: v }))] },
		},
		{ name: "ctaLabel", title: "Button text", type: "string", fieldset: "display", description: "Default: View product" },
		{ name: "hidePrice", title: "Hide prices", type: "boolean", fieldset: "display" },
		{ name: "hideCreator", title: "Hide creator names", type: "boolean", fieldset: "display" },
		{ name: "newTab", title: "Open links in a new tab", type: "boolean", fieldset: "display" },
	];
}

/** Every field the preview needs, as a `preview.select` object. */
export function selectAll(fields) {
	return Object.fromEntries(fields.map((f) => [f.name, f.name]));
}
