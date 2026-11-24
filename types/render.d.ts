/** Display defaults: every embed can override them in the Studio. */
export interface AvdebDisplayOptions {
	/** `grid` (default), `carousel`, `list` or `spotlight`. */
	layout?: "grid" | "carousel" | "list" | "spotlight";
	/** 1–6 (default 3). Narrow columns get fewer automatically. */
	columns?: number;
	cardStyle?: "elevated" | "outline" | "minimal";
	/** `site` (default) inherits your colours and fonts. */
	theme?: "site" | "light" | "dark" | "auto";
	/** Hex colour for buttons and highlights. */
	accentColor?: string;
	/** Corner radius in px, 0–32 (default 16). */
	radius?: number;
	imageRatio?: "square" | "portrait" | "landscape";
	/** Button text on cards (default "View product"). */
	ctaLabel?: string;
	showPrice?: boolean;
	showCreator?: boolean;
	showBadges?: boolean;
	newTab?: boolean;
}

export interface AvdebOptions extends AvdebDisplayOptions {
	/** Your referral code, added as `?ref=` to every link. Default: `AVDEB_REF_CODE`. */
	refCode?: string;
	/** Secret key (`avdeb_sk_…`), server only. Default: `AVDEB_SECRET_KEY`. */
	apiKey?: string;
	/** Show the affiliate disclosure under embeds that carry a code (default true). */
	showDisclosure?: boolean;
	disclosureText?: string;
	/** How long fetched products stay fresh, 5–2880 minutes (default 360). */
	cacheMinutes?: number;
	/** Price formatting locale (default `en-US`). */
	locale?: string;
	/** Max API calls a minute (default 120). */
	requestsPerMinute?: number;
	/** Custom fetch (proxies, Next.js caching options…). */
	fetch?: typeof fetch;
	/** `false`: don't read AVDEB_* environment variables. */
	env?: false;
	/** No console messages. */
	quiet?: boolean;
}

/** An avdebProducts, avdebProduct or avdebButton object from Sanity. */
export interface AvdebBlockValue {
	_type: "avdebProducts" | "avdebProduct" | "avdebButton" | (string & {});
	_key?: string;
	[field: string]: unknown;
}

export interface AvdebCard {
	href: string;
	rel: string;
	target: string | null;
	title: string;
	image: string | null;
	width: number;
	height: number;
	price: string | null;
	compareAt: string | null;
	discount: number | null;
	isNew: boolean;
	creator: string | null;
}

export interface AvdebData {
	products: Array<Record<string, unknown>>;
	cards: AvdebCard[];
	ref: string;
	viewAll: string | null;
	disclosure: string | null;
	error: string | null;
}

/** Embed options for products(), product() and data(): Sanity field names or attribute names. */
export interface AvdebEmbedInput extends AvdebDisplayOptions {
	url?: string;
	creator?: string;
	tag?: string;
	type?: string;
	q?: string;
	limit?: number;
	heading?: string;
	intro?: string;
	headingLevel?: number;
	viewAll?: boolean;
	hidePrice?: boolean;
	hideCreator?: boolean;
	variant?: "horizontal" | "hero" | "card";
	badge?: string;
	note?: string;
	locale?: string;
	[name: string]: unknown;
}

export interface Avdeb {
	readonly settings: Readonly<Record<string, unknown>>;
	/** Any AVDEB object from Sanity as HTML ("" for other types). Never throws. */
	block(value: AvdebBlockValue, extra?: { headingLevel?: number; locale?: string }): Promise<string>;
	/** Every AVDEB object in a value (Portable Text, a document…) as HTML, by `_key`. */
	prerender(value: unknown, extra?: { headingLevel?: number; locale?: string }): Promise<Record<string, string>>;
	products(input?: AvdebEmbedInput): Promise<string>;
	product(handleOrLink: string, input?: AvdebEmbedInput): Promise<string>;
	button(input: { href: string; label?: string; variant?: "solid" | "outline" | "link"; align?: "start" | "center" | "end" }): Promise<string>;
	/** Products and render-ready cards for your own markup. */
	data(input?: AvdebEmbedInput | AvdebBlockValue): Promise<AvdebData>;
	/** The referral code links carry. */
	ref(): Promise<string>;
	/** Drop every cached product query. */
	refresh(): Promise<void>;
	stats(): Promise<Record<string, unknown>>;
}

export declare const AVDEB_TYPES: readonly ["avdebProducts", "avdebProduct", "avdebButton"];
export declare function createAvdeb(options?: AvdebOptions): Avdeb;
export declare function isAvdebBlock(value: unknown): value is AvdebBlockValue;
export declare function hasCarousel(html: string): boolean;
/** Set up carousel arrows and keys inside `root` (default: document). */
export declare function initCarousels(root?: ParentNode): void;
/** `components` for @portabletext/to-html from `await avdeb.prerender(value)`. */
export declare function toHTMLComponents(embeds: Record<string, string>): {
	types: Record<"avdebProducts" | "avdebProduct" | "avdebButton", (props: { value: AvdebBlockValue }) => string>;
};
