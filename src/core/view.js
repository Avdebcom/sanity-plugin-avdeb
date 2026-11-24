/**
 * Turns catalog products + the widget config into ready-to-render view models.
 * Pure module: render.js only prints these values.
 */
import { avdebLink, hasRef, isAvdebUrl } from "./catalog.js";
const RATIO_SIZE = {
	square: [600, 600],
	portrait: [600, 750],
	landscape: [600, 450],
};
export const RATIO_CSS = {
	square: "1 / 1",
	portrait: "4 / 5",
	landscape: "4 / 3",
};
const NEW_DAYS = 14;
export function formatPrice(amount, currency, locale = "en-US") {
	if (amount === null) return null;
	try {
		return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${currency}`;
	}
}
/** Whole-number discount (e.g. 25 for 25 % off), or null when there's no real markdown. */
export function discountPercent(price, compareAt) {
	if (price === null || compareAt === null || compareAt <= price || compareAt <= 0) return null;
	const pct = Math.round((1 - price / compareAt) * 100);
	return pct >= 1 && pct < 100 ? pct : null;
}
export function isNew(createdAt, now, days = NEW_DAYS) {
	if (!createdAt) return false;
	const t = Date.parse(createdAt);
	return Number.isFinite(t) && t <= now && now - t < days * 86_400_000;
}
/** Referral links are paid links: `sponsored` (Google) — plus `noopener` for new tabs. */
export function relFor(url) {
	return hasRef(url) ? "sponsored noopener" : "noopener";
}
export function buildCards(products, options, { locale = "en-US", now = Date.now() } = {}) {
	const [width, height] = RATIO_SIZE[options.imageRatio];
	const cards = [];
	for (const p of products) {
		if (!isAvdebUrl(p.url)) continue;
		const hasSale = options.showPrice && p.compareAtPrice !== null && p.price !== null && p.compareAtPrice > p.price;
		cards.push({
			key: p.handle,
			href: p.url,
			rel: relFor(p.url),
			target: options.newTab ? "_blank" : undefined,
			title: p.title,
			image: p.image,
			width,
			height,
			price: options.showPrice ? formatPrice(p.price, p.currency, locale) : null,
			compareAt: hasSale ? formatPrice(p.compareAtPrice, p.currency, locale) : null,
			discount: options.showBadges && options.showPrice ? discountPercent(p.price, p.compareAtPrice) : null,
			isNew: options.showBadges && isNew(p.createdAt, now),
			creator: options.showCreator && p.creator ? p.creator.name : null,
		});
	}
	return cards;
}
/** "View all" target for a creator or category embed (with the referral code), else null. */
export function viewAllHref(query, products, ref) {
	if (query.handle || query.q || query.type) return null;
	if (query.creator && !query.tag) {
		const fromApi = products.find((p) => p.creator?.slug === query.creator)?.creator?.url;
		return fromApi ?? (avdebLink(`/creators/${query.creator}/`, ref) || null);
	}
	if (query.tag && !query.creator) return avdebLink(`/category/${query.tag}/`, ref) || null;
	return null;
}
/** CSS custom properties for the embed root. Values are validated numbers/hex only. */
export function rootStyle(config, columns) {
	const style = {
		"--_avdeb-cols": String(Math.min(6, Math.max(1, Math.trunc(columns)))),
		"--_avdeb-radius": `${config.radius}px`,
		"--_avdeb-ratio": RATIO_CSS[config.imageRatio],
	};
	if (config.accentColor) style["--_avdeb-accent"] = config.accentColor;
	return style;
}
/** Columns actually used: never more than there are products (a lone card shouldn't be 1/3 wide). */
export function effectiveColumns(config, count) {
	if (config.layout === "list") return 1;
	return Math.max(1, Math.min(config.columns, count || 1));
}
