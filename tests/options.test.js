import assert from "node:assert/strict";
import { test } from "node:test";

import { DISPLAY_DEFAULTS, normalizeKeys, parseButton, parseDisplay, parseEmbed, queryFor } from "../src/core/options.js";
import { resolveSettings } from "../src/core/settings.js";

test("normalizeKeys accepts kebab, snake and camel case plus aliases", () => {
	assert.deepEqual(normalizeKeys({ "card-style": "outline", card_style: "minimal", url: "u", accent: "#fff", nope: 1 }), {
		cardStyle: "outline",
		value: "u",
		accentColor: "#fff",
	});
});

test("parseEmbed: site defaults, overrides, 'default' and invalid values", () => {
	const site = parseDisplay({ layout: "carousel", accentColor: "#123456" });
	const o = parseEmbed({ columns: "9", theme: "inherit", layout: "default", radius: "x", "hide-price": "true" }, site);
	assert.equal(o.layout, "carousel");
	assert.equal(o.columns, 6);
	assert.equal(o.theme, "site");
	assert.equal(o.radius, DISPLAY_DEFAULTS.radius);
	assert.equal(o.accentColor, "#123456");
	assert.equal(o.showPrice, false);
	assert.equal(parseEmbed({ accent: "red;background:url(x)" }).accentColor, "");
});

test("queryFor: links are detected; shorthands set the source", () => {
	assert.deepEqual(queryFor(parseEmbed({ link: "https://avdeb.com/creators/cleo/" })), { limit: 6, creator: "cleo" });
	assert.deepEqual(queryFor(parseEmbed({ url: "https://avdeb.com/category/stickers/", limit: 3 })), { limit: 3, tag: "stickers" });
	assert.deepEqual(queryFor(parseEmbed({ tag: "3d-prints" })), { limit: 6, tag: "3d-prints" });
	assert.deepEqual(queryFor(parseEmbed({ q: "cat mug" })), { limit: 6, q: "cat mug" });
	assert.deepEqual(queryFor(parseEmbed({ link: "cute cats" })), { limit: 6, q: "cute cats" });
	assert.deepEqual(queryFor(parseEmbed({})), { limit: 6 });
	assert.deepEqual(queryFor(parseEmbed({ product: "https://avdeb.com/store/cat-sticker/" })), { handle: "cat-sticker", limit: 1 });
	assert.deepEqual(queryFor(parseEmbed({ mode: "product", link: "https://evil.example/store/x/" })), { limit: 1 });
});

test("parseButton defaults and validation", () => {
	assert.deepEqual(parseButton({}), { href: "/", label: "Shop on AVDEB", variant: "solid", align: "start" });
	assert.deepEqual(parseButton({ link: "/creators/cleo/", text: "Shop", style: "outline", align: "center" }), {
		href: "/creators/cleo/",
		label: "Shop",
		variant: "outline",
		align: "center",
	});
});

test("resolveSettings: env fallback, key checks and warnings", () => {
	const key = `avdeb_sk_${"a".repeat(32)}`;
	assert.equal(resolveSettings({}, { AVDEB_SECRET_KEY: key }).apiKey, key);
	assert.equal(resolveSettings({ refCode: "ABC" }, { AVDEB_REF_CODE: "ENV" }).refCode, "ABC");
	assert.equal(resolveSettings({}, { AVDEB_REF_CODE: "ENV" }).refCode, "ENV");
	const bad = resolveSettings({ apiKey: "avdeb_pk_123", refCode: "a b!", accentColor: "blue" });
	assert.equal(bad.apiKey, "");
	assert.equal(bad.warnings.length, 3);
	assert.equal(resolveSettings({ cacheMinutes: 1 }).cacheMinutes, 5);
});
