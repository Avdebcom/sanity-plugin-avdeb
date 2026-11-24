import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeProduct } from "../src/core/catalog.js";
import { parseButton, parseEmbed } from "../src/core/options.js";
import { renderButton, renderEmbed } from "../src/core/render.js";
import { product } from "./helpers.js";

const products = [
	normalizeProduct(product()),
	normalizeProduct(product({ id: "p2", handle: "dog", title: 'Dog "<b>"', url: "https://avdeb.com/store/dog/?ref=ABC12345" })),
];
const data = (o = {}) => ({ products, ref: "ABC12345", query: { tag: "stickers", limit: 6 }, disclosure: "Disclosure", ...o });

test("grid: escaped titles, sponsored links, disclosure and private CSS variables", () => {
	const html = renderEmbed(data(), parseEmbed({ heading: "Picks & more", accent: "#ff0000" }));
	assert.match(html, /^<section class="avdeb avdeb--grid avdeb--elevated not-prose"/);
	assert.match(html, /<h2 class="avdeb__heading">Picks &amp; more<\/h2>/);
	assert.match(html, /Dog &quot;&lt;b&gt;&quot;/);
	assert.doesNotMatch(html, /<b>/);
	assert.match(html, /rel="sponsored noopener"/);
	assert.match(html, /--_avdeb-cols:2;--_avdeb-radius:16px;--_avdeb-ratio:1 \/ 1;--_avdeb-accent:#ff0000/);
	assert.match(html, /href="https:\/\/avdeb.com\/category\/stickers\/\?ref=ABC12345"/);
	assert.match(html, /<p class="avdeb__disclosure">/);
});

test("heading level moves the card titles one level down", () => {
	const html = renderEmbed(data(), parseEmbed({ heading: "H" }), { headingLevel: 3 });
	assert.match(html, /<h3 class="avdeb__heading">/);
	assert.match(html, /<h4 class="avdeb-card__title">/);
});

test("carousel has nav buttons and a focusable track; single product renders one hero card", () => {
	assert.match(renderEmbed(data(), parseEmbed({ layout: "carousel" })), /data-avdeb-carousel.*data-avdeb-next.*data-avdeb-track tabindex="0"/s);
	const hero = renderEmbed(data(), parseEmbed({ mode: "product", variant: "hero", badge: "Pick", note: "Love it" }));
	assert.equal(hero.match(/<article /g).length, 1);
	assert.match(hero, /avdeb-card--hero/);
	assert.match(hero, /avdeb-badge--pick">Pick/);
	assert.match(hero, /avdeb-card__note">Love it/);
});

test("no products renders a comment, not an empty section", () => {
	assert.match(renderEmbed(data({ products: [] }), parseEmbed({})), /^<!-- AVDEB Products:/);
});

test("button: avdeb.com only, carries the referral code", () => {
	const html = renderButton(parseButton({ href: "/creators/cleo/", label: "Shop <now>" }), "ABC", { accentColor: "", newTab: true });
	assert.match(html, /href="https:\/\/avdeb.com\/creators\/cleo\/\?ref=ABC"/);
	assert.match(html, /Shop &lt;now&gt;/);
	assert.match(html, /target="_blank"/);
	assert.match(renderButton(parseButton({ href: "https://evil.example/" }), "ABC", { accentColor: "", newTab: false }), /^<!-- AVDEB Button/);
});
