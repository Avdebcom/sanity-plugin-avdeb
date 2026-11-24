/**
 * The AVDEB runtime shared by the Studio preview and your front end: settings, the cached catalog
 * client and every render entry point. No Node.js APIs: it runs on the server, at the edge or in a
 * browser. Nothing here throws into a render: a failed lookup renders an HTML comment (or no
 * products) and logs a warning, so one unreachable API never breaks a page.
 *
 *   import { createAvdeb } from "sanity-plugin-avdeb/render";
 *   const avdeb = createAvdeb({ refCode: "YOURCODE" });
 *   const html = await avdeb.block(value); // any avdebProducts / avdebProduct / avdebButton object
 */

import { maxLimit, sanitizeQuery } from "./core/catalog.js";
import { createCatalogClient } from "./core/client.js";
import { PACKAGE_NAME } from "./core/constants.js";
import { parseButton, parseEmbed, queryFor } from "./core/options.js";
import { escapeHtml, renderButton, renderEmbed } from "./core/render.js";
import { disclosureFor, resolveSettings } from "./core/settings.js";
import { MemoryStore } from "./core/store.js";
import { buildCards, viewAllHref } from "./core/view.js";

/** Schema type names of the three AVDEB objects. */
export const AVDEB_TYPES = ["avdebProducts", "avdebProduct", "avdebButton"];

/** True for an avdebProducts, avdebProduct or avdebButton object. */
export function isAvdebBlock(value) {
	return Boolean(value && typeof value === "object" && AVDEB_TYPES.includes(value._type));
}

function readEnv() {
	const env = typeof process !== "undefined" && process && process.env ? process.env : {};
	return { AVDEB_SECRET_KEY: env.AVDEB_SECRET_KEY, AVDEB_REF_CODE: env.AVDEB_REF_CODE };
}

function headingLevelOf(attrs, fallback = 2) {
	const n = Number.parseInt(String(attrs.headingLevel ?? ""), 10);
	return Number.isFinite(n) ? n : fallback;
}

const LOCALE_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
function localeOf(attrs, fallback) {
	const l = typeof attrs.locale === "string" ? attrs.locale.trim() : "";
	return LOCALE_RE.test(l) ? l : fallback;
}

/** A Sanity object (or plain options) → embed attributes: drops `_type`, `_key` and empty values. */
function attrsOf(value) {
	const out = {};
	if (!value || typeof value !== "object") return out;
	for (const [k, v] of Object.entries(value)) {
		if (k.startsWith("_") || v === null || v === undefined || v === "") continue;
		out[k] = v;
	}
	return out;
}

/**
 * @param {import("./render.js").AvdebOptions} [options]
 * @param {{ fetch?: typeof fetch, env?: Record<string, string | undefined>, now?: () => number, log?: { info: Function, warn: Function } }} [deps]
 */
export function createAvdeb(options = {}, deps = {}) {
	const settings = resolveSettings(options, deps.env ?? (options.env === false ? {} : readEnv()));
	const quiet = options.quiet === true;
	const log = deps.log ?? {
		info: (m) => quiet || console.info(`[${PACKAGE_NAME}] ${m}`),
		warn: (m) => quiet || console.warn(`[${PACKAGE_NAME}] ${m}`),
	};
	const fetchImpl = deps.fetch ?? options.fetch ?? ((url, init) => globalThis.fetch(url, init));

	const client = createCatalogClient({
		kv: new MemoryStore(),
		fetch: fetchImpl,
		apiKey: settings.apiKey,
		refCode: settings.refCode,
		cacheMinutes: settings.cacheMinutes,
		budgetPerMinute: settings.requestsPerMinute,
		now: deps.now,
		log: { warn: (message, data) => log.warn(`${message}${data?.error ? `: ${data.error}` : ""}`) },
	});

	// Identical embeds rendered at the same time share one request.
	const inflight = new Map();
	let announced = false;

	function announce() {
		if (announced) return;
		announced = true;
		for (const w of settings.warnings) log.warn(w);
		if (!settings.apiKey && !settings.refCode && options.preview !== true) {
			log.warn("No AVDEB secret key or referral code set: product links won't earn commission.");
		}
	}

	/** Products for a sanitised query. Never throws: on failure the list is empty. */
	function lookup(query) {
		announce();
		const key = JSON.stringify(query);
		let hit = inflight.get(key);
		if (!hit) {
			hit = client
				.products(query)
				.then((out) => ({ products: out.products, ref: out.ref || "", error: out.error ?? null }))
				.catch((error) => ({ products: [], ref: "", error: error instanceof Error ? error.message : String(error) }))
				.finally(() => setTimeout(() => inflight.delete(key), 0));
			inflight.set(key, hit);
		}
		return hit;
	}

	function prepare(attrs) {
		const o = parseEmbed(attrs, settings.display);
		const query = sanitizeQuery(queryFor(o), maxLimit(Boolean(settings.apiKey)));
		return { o, query };
	}

	/** Products (a creator, category, search or the newest) as HTML. */
	async function products(input = {}) {
		const attrs = attrsOf(input);
		try {
			const { o, query } = prepare(attrs);
			const out = await lookup(query);
			return renderEmbed(
				{ products: out.products, ref: out.ref, query, disclosure: disclosureFor(settings, out.ref) },
				o,
				{ locale: localeOf(attrs, settings.locale), headingLevel: headingLevelOf(attrs) },
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			log.warn(`embed failed: ${message}`);
			return `<!-- AVDEB Products: ${escapeHtml(message)} -->`;
		}
	}

	/** One featured product (horizontal card, hero or compact card). */
	function product(handleOrLink, input = {}) {
		const attrs = typeof handleOrLink === "object" && handleOrLink !== null ? attrsOf(handleOrLink) : { ...attrsOf(input), product: handleOrLink };
		return products({ ...attrs, mode: "product" });
	}

	/** The referral code links carry: the key owner's with a secret key, else `refCode`. */
	async function ref() {
		try {
			return (await client.ref()) || settings.refCode;
		} catch {
			return settings.refCode;
		}
	}

	/** A referral button to any avdeb.com page. */
	async function button(input = {}) {
		announce();
		return renderButton(parseButton(attrsOf(input)), await ref(), settings.display);
	}

	/** Any AVDEB object from Sanity (avdebProducts, avdebProduct, avdebButton) as HTML. */
	function block(value, extra = {}) {
		const attrs = { ...attrsOf(value), ...attrsOf(extra) };
		switch (value?._type) {
			case "avdebProducts":
				return products(attrs);
			case "avdebProduct":
				return products({ ...attrs, mode: "product" });
			case "avdebButton":
				return button(attrs);
			default:
				return Promise.resolve("");
		}
	}

	/**
	 * Render every AVDEB object in a Portable Text value (or any document, array or object) ahead
	 * of time. Returns HTML by `_key`, for synchronous renderers such as @portabletext/to-html.
	 */
	async function prerender(value, extra = {}) {
		const found = [];
		const seen = new Set();
		const walk = (node, depth) => {
			if (!node || typeof node !== "object" || depth > 32 || seen.has(node)) return;
			seen.add(node);
			if (Array.isArray(node)) {
				for (const item of node) walk(item, depth + 1);
				return;
			}
			if (isAvdebBlock(node)) {
				found.push(node);
				return;
			}
			for (const child of Object.values(node)) walk(child, depth + 1);
		};
		walk(value, 0);
		const out = {};
		await Promise.all(
			found.map(async (node, i) => {
				out[typeof node._key === "string" && node._key ? node._key : `avdeb-${i}`] = await block(node, extra);
			}),
		);
		return out;
	}

	/** Products and render-ready cards for your own markup. */
	async function data(input = {}) {
		const attrs = attrsOf(input);
		if (input?._type === "avdebProduct") attrs.mode = "product";
		const { o, query } = prepare(attrs);
		const out = await lookup(query);
		const cards = buildCards(o.mode === "product" ? out.products.slice(0, 1) : out.products, o, {
			locale: localeOf(attrs, settings.locale),
		});
		return {
			products: out.products,
			cards,
			ref: out.ref,
			viewAll: o.mode !== "product" && o.viewAll ? viewAllHref(query, out.products, out.ref) : null,
			disclosure: disclosureFor(settings, out.ref),
			error: out.error,
		};
	}

	return {
		settings,
		block,
		prerender,
		products,
		product,
		button,
		data,
		ref,
		/** Drop every cached product query ("refresh products now"). */
		refresh: () => client.flush(),
		stats: () => client.stats(),
	};
}

/** True when the HTML contains a carousel (it then needs the small carousel script). */
export function hasCarousel(html) {
	return typeof html === "string" && html.includes("data-avdeb-carousel");
}
