/**
 * Embed options: what one shortcode or content tag shows and how. Site-wide display defaults come
 * from the plugin options; every embed can override them. Pure module.
 *
 * Option names are forgiving: `card-style`, `card_style` and `cardStyle` all mean cardStyle.
 */
import { cleanSearch, cleanSlug, cleanType, parseAvdebLink } from "./catalog.js";
import {
	ALIGNMENTS,
	BUTTON_VARIANTS,
	CARD_STYLES,
	DEFAULT_LIMIT,
	IMAGE_RATIOS,
	LAYOUTS,
	MAX_LIMIT_SECRET,
	MODES,
	PRODUCT_VARIANTS,
	SOURCES,
	THEMES,
} from "./constants.js";
export const DISPLAY_DEFAULTS = {
	layout: "grid",
	columns: 3,
	cardStyle: "elevated",
	theme: "site",
	accentColor: "",
	radius: 16,
	imageRatio: "square",
	ctaLabel: "View product",
	showPrice: true,
	showCreator: true,
	showBadges: true,
	newTab: false,
};
const EMBED_DEFAULTS = {
	mode: "collection",
	source: "auto",
	limit: DEFAULT_LIMIT,
	variant: "horizontal",
	viewAll: true,
};
/** Accepted spellings (lower-cased, without "-" and "_") → canonical key. */
const ALIASES = {
	link: "value",
	url: "value",
	search: "value",
	show: "mode",
	buttontext: "ctaLabel",
	accent: "accentColor",
	ratio: "imageRatio",
	cols: "columns",
	count: "limit",
};
const CANONICAL = Object.fromEntries(
	[
		...Object.keys(DISPLAY_DEFAULTS),
		"mode",
		"source",
		"value",
		"limit",
		"variant",
		"badge",
		"note",
		"heading",
		"intro",
		"viewAll",
		"hidePrice",
		"hideCreator",
		"handle",
		"creator",
		"tag",
		"type",
		"q",
		"product",
	].map((k) => [k.toLowerCase(), k]),
);
/** "card-style" / "card_style" / "CardStyle" → "cardStyle"; unknown names are dropped. */
export function normalizeKeys(attrs) {
	const out = {};
	for (const [name, value] of Object.entries(attrs ?? {})) {
		const flat = name.replace(/[-_]/g, "").toLowerCase();
		const key = ALIASES[flat] ?? CANONICAL[flat];
		if (key && !(key in out)) out[key] = value;
	}
	return out;
}
export function oneOf(value, allowed) {
	const v = typeof value === "string" ? value.trim().toLowerCase() : "";
	return allowed.includes(v) ? v : undefined;
}
export function int(value, min, max, fallback) {
	const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
	return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}
export function bool(value, fallback) {
	if (typeof value === "boolean") return value;
	const v = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim().toLowerCase() : "";
	if (["1", "true", "yes", "on"].includes(v)) return true;
	if (["0", "false", "no", "off"].includes(v)) return false;
	return fallback;
}
export function text(value, max, fallback = "") {
	const v =
		typeof value === "string" || typeof value === "number"
			? String(value).replace(/\s+/g, " ").trim().slice(0, max)
			: "";
	return v || fallback;
}
/** A hex colour or "" — the value is placed in a style attribute, so nothing else is accepted. */
export function safeColor(value) {
	const v = typeof value === "string" ? value.trim() : "";
	return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v.toLowerCase() : "";
}
/** Validate display settings. Invalid or missing values fall back to `base`. */
export function parseDisplay(params = {}, base = DISPLAY_DEFAULTS) {
	const d = { ...DISPLAY_DEFAULTS, ...base };
	const v = normalizeKeys(params);
	const theme = v.theme === "inherit" ? "site" : v.theme;
	return {
		layout: oneOf(v.layout, LAYOUTS) ?? d.layout,
		columns: int(v.columns, 1, 6, d.columns),
		cardStyle: oneOf(v.cardStyle, CARD_STYLES) ?? d.cardStyle,
		theme: oneOf(theme, THEMES) ?? d.theme,
		accentColor: safeColor(v.accentColor) || safeColor(d.accentColor),
		radius: int(v.radius, 0, 32, d.radius),
		imageRatio: oneOf(v.imageRatio, IMAGE_RATIOS) ?? d.imageRatio,
		ctaLabel: text(v.ctaLabel, 40, d.ctaLabel),
		showPrice: bool(v.showPrice, d.showPrice),
		showCreator: bool(v.showCreator, d.showCreator),
		showBadges: bool(v.showBadges, d.showBadges),
		newTab: bool(v.newTab, d.newTab),
	};
}
function isEmpty(x) {
	return (
		x === null ||
		x === undefined ||
		(typeof x === "string" && (x.trim() === "" || x.trim().toLowerCase() === "default"))
	);
}
/**
 * One embed: its own options over the site display defaults. Empty values and "default" fall back
 * to the site setting.
 */
export function parseEmbed(attrs = {}, site = DISPLAY_DEFAULTS) {
	const v = {};
	for (const [k, x] of Object.entries(normalizeKeys(attrs))) if (!isEmpty(x)) v[k] = x;
	// Explicit filters (creator="…", tag="…", handle="…", q="…") are shorthands for source + value.
	const shorthands = [
		["creator", "creator"],
		["tag", "tag"],
		["type", "type"],
		["q", "search"],
		["handle", null],
		["product", null],
	];
	for (const [key, source] of shorthands) {
		if (v[key] === undefined) continue;
		if (source === null) {
			v.mode = "product";
			v.value = v[key];
		} else if (v.value === undefined) {
			v.source = source;
			v.value = v[key];
		}
	}
	const displayInput = {};
	for (const k of Object.keys(DISPLAY_DEFAULTS)) if (v[k] !== undefined) displayInput[k] = v[k];
	const display = parseDisplay(displayInput, site);
	if (bool(v.hidePrice, false)) display.showPrice = false;
	if (bool(v.hideCreator, false)) display.showCreator = false;
	const e = EMBED_DEFAULTS;
	return {
		...display,
		mode: oneOf(v.mode, MODES) ?? e.mode,
		source: oneOf(v.source, SOURCES) ?? e.source,
		value: text(v.value, 300),
		limit: int(v.limit, 1, MAX_LIMIT_SECRET, e.limit),
		variant: oneOf(v.variant, PRODUCT_VARIANTS) ?? e.variant,
		badge: text(v.badge, 40),
		// Keep line breaks in the note (rendered with white-space: pre-line).
		note: typeof v.note === "string" ? v.note.trim().slice(0, 600) : "",
		heading: text(v.heading, 120),
		intro: text(v.intro, 400),
		viewAll: bool(v.viewAll, e.viewAll),
	};
}
/** Product handle from a pasted product link or a bare handle ("" for anything else). */
export function productHandle(value) {
	const link = parseAvdebLink(value);
	if (link) return link.kind === "handle" ? link.value : "";
	return /[/.:]/.test(value) ? "" : cleanSlug(value);
}
/** Unsanitised catalog query (the client re-validates and clamps the limit to the tier). */
export function queryFor(o) {
	if (o.mode === "product") {
		const handle = productHandle(o.value);
		return handle ? { handle, limit: 1 } : { limit: 1 };
	}
	const raw = o.value;
	const link = parseAvdebLink(raw);
	const query = { limit: o.limit };
	const slug = (kind) => (link?.kind === kind ? link.value : cleanSlug(raw));
	const set = (key, value) => {
		if (value) query[key] = value;
	};
	switch (o.source) {
		case "creator":
			set("creator", slug("creator"));
			break;
		case "tag":
			set("tag", slug("tag"));
			break;
		case "type":
			set("type", cleanType(raw));
			break;
		case "search":
			set("q", cleanSearch(raw));
			break;
		case "newest":
			break;
		default:
			if (link) set(link.kind, link.value);
			else set("q", cleanSearch(raw));
	}
	return query;
}
/** Button: { href, label, variant, align }. */
export function parseButton(attrs = {}) {
	const v = {};
	for (const [k, x] of Object.entries(attrs ?? {})) v[k.toLowerCase()] = x;
	const href = text(v.href ?? v.link ?? v.url ?? "", 300);
	return {
		href: href || "/",
		label: text(v.label ?? v.text ?? "", 80, "Shop on AVDEB"),
		variant: oneOf(v.variant ?? v.style, BUTTON_VARIANTS) ?? "solid",
		align: oneOf(v.align, ALIGNMENTS) ?? "start",
	};
}
