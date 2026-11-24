import assert from "node:assert/strict";
import { test } from "node:test";

import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { toHTML } from "@portabletext/to-html";

import { avdebComponents, AvdebHtml } from "../src/react.js";
import { createAvdeb, isAvdebBlock, toHTMLComponents } from "../src/render.js";
import { fakeApi, scriptedFetch, silent } from "./helpers.js";

const make = (options = {}, api = fakeApi()) => ({
	avdeb: createAvdeb({ refCode: "ABC12345", ...options }, { fetch: api.fetch, env: {}, log: silent }),
	api,
});

const body = [
	{ _type: "block", _key: "b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "s1", text: "Hello", marks: [] }] },
	{ _type: "avdebProducts", _key: "p1", url: "https://avdeb.com/category/stickers/", layout: "carousel", heading: "Stickers", limit: 2 },
	{ _type: "avdebProduct", _key: "p2", product: "https://avdeb.com/store/cat-sticker/", variant: "hero", badge: "Pick" },
	{ _type: "avdebButton", _key: "p3", href: "/creators/cleo/", label: "Visit my shop", variant: "outline" },
];

test("isAvdebBlock", () => {
	assert.equal(isAvdebBlock(body[1]), true);
	assert.equal(isAvdebBlock(body[0]), false);
	assert.equal(isAvdebBlock(null), false);
});

test("block(): products map Sanity fields to the catalog query and render", async () => {
	const { avdeb, api } = make();
	const html = await avdeb.block(body[1]);
	assert.match(html, /^<section class="avdeb avdeb--carousel/);
	assert.match(html, /<h2 class="avdeb__heading">Stickers<\/h2>/);
	assert.match(html, /\?ref=ABC12345/);
	const url = new URL(api.calls[0].url);
	assert.equal(url.searchParams.get("tag"), "stickers");
	assert.equal(url.searchParams.get("limit"), "2");
	assert.equal(url.searchParams.get("ref"), "ABC12345");
});

test("block(): product and button", async () => {
	const { avdeb, api } = make();
	const hero = await avdeb.block(body[2]);
	assert.match(hero, /avdeb-card--hero/);
	assert.match(hero, /avdeb-badge--pick">Pick/);
	assert.equal(new URL(api.calls[0].url).searchParams.get("handle"), "cat-sticker");
	const btn = await avdeb.block(body[3]);
	assert.match(btn, /href="https:\/\/avdeb.com\/creators\/cleo\/\?ref=ABC12345"/);
	assert.match(btn, /avdeb-btn--outline/);
	assert.equal(await avdeb.block({ _type: "image" }), "");
});

test("block(): empty and 'default' Sanity values fall back to the site defaults", async () => {
	const { avdeb } = make({ layout: "list", cardStyle: "outline" });
	const html = await avdeb.block({ _type: "avdebProducts", _key: "x", url: "", layout: "default", cardStyle: "default", theme: null });
	assert.match(html, /avdeb--list avdeb--outline/);
});

test("Sanity system fields are ignored", async () => {
	const { avdeb, api } = make();
	await avdeb.block({ _type: "avdebProducts", _key: "x", _id: "nope", url: "keychain" });
	assert.equal(new URL(api.calls[0].url).searchParams.get("q"), "keychain");
});

test("prerender() finds AVDEB objects anywhere and keys them by _key", async () => {
	const { avdeb } = make();
	const doc = { title: "Post", sections: [{ _type: "section", content: body }] };
	const out = await avdeb.prerender(doc);
	assert.deepEqual(Object.keys(out).sort(), ["p1", "p2", "p3"]);
	assert.match(out.p1, /avdeb--carousel/);
});

test("toHTMLComponents() plugs prerendered embeds into @portabletext/to-html", async () => {
	const { avdeb } = make();
	const html = toHTML(body, { components: toHTMLComponents(await avdeb.prerender(body)) });
	assert.match(html, /<p>Hello<\/p><section class="avdeb avdeb--carousel/);
	assert.match(html, /avdeb-btn--outline/);
});

test("avdebComponents(prerendered) renders with @portabletext/react-style props", async () => {
	const { avdeb } = make();
	const embeds = await avdeb.prerender(body);
	const { types } = avdebComponents(embeds);
	const markup = renderToStaticMarkup(h(types.avdebProducts, { value: body[1] }));
	assert.match(markup, /^<div class="avdeb-embed"><section class="avdeb avdeb--carousel/);
	assert.equal(renderToStaticMarkup(h(AvdebHtml, { html: "" })), "");
	assert.equal(typeof avdebComponents(avdeb).types.avdebButton, "function");
});

test("an unreachable API renders a comment, never throws", async () => {
	const { avdeb } = make({}, scriptedFetch(() => new Error("offline")));
	assert.match(await avdeb.block(body[1]), /^<!-- AVDEB Products:/);
});

test("secret key: Bearer header, no ref in the URL; User-Agent only outside browsers", async () => {
	const key = `avdeb_sk_${"a".repeat(32)}`;
	const { avdeb, api } = make({ apiKey: key, refCode: "" });
	await avdeb.block(body[1]);
	assert.equal(api.calls[0].headers.Authorization, `Bearer ${key}`);
	assert.match(api.calls[0].headers["User-Agent"], /^sanity-plugin-avdeb\//);
	assert.equal(new URL(api.calls[0].url).searchParams.get("ref"), null);
});

test("credentials fall back to AVDEB_* environment variables", async () => {
	const api = fakeApi();
	const avdeb = createAvdeb({}, { fetch: api.fetch, env: { AVDEB_REF_CODE: "ENVCODE" }, log: silent });
	assert.equal(avdeb.settings.refCode, "ENVCODE");
});
