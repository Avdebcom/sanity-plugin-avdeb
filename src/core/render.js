/**
 * Renders AVDEB products to an HTML string — grid, carousel, list, spotlight, the single-product
 * variants (card / horizontal / hero) and the referral button. Same markup and BEM classes as the
 * other AVDEB integrations, so avdeb.css is shared. Pure module: every value is escaped, URLs are
 * validated by view.js (avdeb.com links, https images), style values are numbers/hex only.
 */
import { avdebLink } from "./catalog.js";
import { buildCards, effectiveColumns, relFor, rootStyle, viewAllHref } from "./view.js";
export function escapeHtml(value) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}
const e = escapeHtml;
const chevron = (dir) =>
	`<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="${dir === "right" ? "M6 3.5 10.5 8 6 12.5" : "M10 3.5 5.5 8 10 12.5"}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW =
	'<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h9.5M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLACEHOLDER =
	'<svg class="avdeb-card__placeholder" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z M4 7.5l8 4.5 8-4.5 M12 12v9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const INFO =
	'<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2v4M8 4.8v.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
function styleAttr(style) {
	return Object.entries(style)
		.map(([k, v]) => `${k}:${v}`)
		.join(";");
}
function attr(name, value) {
	return value === undefined || value === null ? "" : ` ${name}="${e(String(value))}"`;
}
export function renderEmbed(data, config, { locale = "en-US", now = Date.now(), headingLevel = 2 } = {}) {
	const h = Math.max(2, Math.min(5, Math.trunc(headingLevel) || 2));
	const hCard = Math.min(6, h + 1);
	const single = config.mode === "product";
	const cards = buildCards(single ? data.products.slice(0, 1) : data.products, config, { locale, now });
	if (cards.length === 0) return "<!-- AVDEB Products: nothing to show for this embed -->";
	const layout = single ? "single" : config.layout;
	const isCarousel = layout === "carousel";
	const columns = single ? 1 : effectiveColumns(config, cards.length);
	const allHref = !single && config.viewAll ? viewAllHref(data.query, data.products, data.ref) : null;
	const featuredFirst = single ? config.variant !== "card" : layout === "spotlight";
	const heading = single ? "" : config.heading;
	const intro = single ? "" : config.intro;
	const label = heading || (single ? cards[0].title : "") || "AVDEB products";
	const newTab = config.newTab ? "_blank" : undefined;
	const classes = ["avdeb", `avdeb--${layout}`, single ? `avdeb--${config.variant}` : "", `avdeb--${config.cardStyle}`]
		.filter(Boolean)
		.join(" ");
	let header = "";
	if (heading || intro || allHref || isCarousel) {
		const titles =
			heading || intro
				? `<div class="avdeb__titles">${heading ? `<h${h} class="avdeb__heading">${e(heading)}</h${h}>` : ""}${intro ? `<p class="avdeb__intro">${e(intro)}</p>` : ""}</div>`
				: "";
		const all = allHref
			? `<a class="avdeb__all"${attr("href", allHref)}${attr("rel", relFor(allHref))}${attr("target", newTab)}>View all${chevron("right")}</a>`
			: "";
		const nav = isCarousel
			? `<div class="avdeb__nav"><button type="button" class="avdeb__navbtn" data-avdeb-prev aria-label="Previous products" hidden>${chevron("left")}</button><button type="button" class="avdeb__navbtn" data-avdeb-next aria-label="Next products" hidden>${chevron("right")}</button></div>`
			: "";
		header = `<header class="avdeb__header">${titles}${all || nav ? `<div class="avdeb__tools">${all}${nav}</div>` : ""}</header>`;
	}
	const items = cards
		.map((c, i) => {
			const cardClasses = [
				"avdeb-card",
				featuredFirst && i === 0 ? "avdeb-card--featured" : "",
				single && config.variant === "hero" ? "avdeb-card--hero" : "",
			]
				.filter(Boolean)
				.join(" ");
			const badge = single ? config.badge : "";
			const badges =
				badge || c.discount || c.isNew
					? `<div class="avdeb-card__badges" aria-hidden="true">${badge ? `<span class="avdeb-badge avdeb-badge--pick">${e(badge)}</span>` : ""}${c.discount ? `<span class="avdeb-badge avdeb-badge--sale">−${c.discount}%</span>` : ""}${c.isNew ? '<span class="avdeb-badge">New</span>' : ""}</div>`
					: "";
			const media = c.image
				? `<img${attr("src", c.image)}${attr("alt", c.title)}${attr("width", c.width)}${attr("height", c.height)} loading="${single ? "eager" : "lazy"}" decoding="async">`
				: PLACEHOLDER;
			const price = c.price
				? `<p class="avdeb-card__price">${c.compareAt ? `<del><span class="avdeb-sr">Was </span>${e(c.compareAt)}</del>` : ""}<span>${c.compareAt ? '<span class="avdeb-sr">now </span>' : ""}${e(c.price)}</span></p>`
				: "";
			return (
				`<li class="avdeb__item"><article class="${cardClasses}">` +
				`<div class="avdeb-card__media">${media}${badges}</div>` +
				`<div class="avdeb-card__body"><div class="avdeb-card__main">` +
				(c.creator ? `<p class="avdeb-card__by">by ${e(c.creator)}</p>` : "") +
				`<h${hCard} class="avdeb-card__title"><a class="avdeb-card__link"${attr("href", c.href)}${attr("rel", c.rel)}${attr("target", c.target)}>${e(c.title)}</a></h${hCard}>` +
				(single && config.note ? `<p class="avdeb-card__note">${e(config.note)}</p>` : "") +
				`</div><div class="avdeb-card__footer">${price}<span class="avdeb-card__cta" aria-hidden="true"><span class="avdeb-card__cta-label">${e(config.ctaLabel)}</span>${ARROW}</span></div></div></article></li>`
			);
		})
		.join("");
	const track = isCarousel ? ` data-avdeb-track tabindex="0"${attr("aria-label", `${label} — scroll for more`)}` : "";
	const disclosure = data.disclosure ? `<p class="avdeb__disclosure">${INFO}${e(data.disclosure)}</p>` : "";
	return (
		`<section class="${classes} not-prose" data-theme="${config.theme}"${isCarousel ? " data-avdeb-carousel" : ""}` +
		`${attr("style", styleAttr(rootStyle(config, columns)))}${attr("aria-label", label)}>` +
		`${header}<ul class="avdeb__items" role="list"${track}>${items}</ul>${disclosure}</section>`
	);
}
/** A call-to-action link to an AVDEB page, carrying the referral code. */
export function renderButton(button, ref, display) {
	const url = avdebLink(button.href, ref);
	if (!url) return "<!-- AVDEB Button: not an avdeb.com link -->";
	const style = display.accentColor ? attr("style", `--_avdeb-accent:${display.accentColor}`) : "";
	return (
		`<p class="avdeb-cta avdeb-cta--${button.align}"${style}>` +
		`<a class="avdeb-btn avdeb-btn--${button.variant}"${attr("href", url)}${attr("rel", relFor(url))}${attr("target", display.newTab ? "_blank" : undefined)}>${e(button.label)}${ARROW}</a></p>`
	);
}
