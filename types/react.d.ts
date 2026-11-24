import type { ReactElement } from "react";

import type { Avdeb, AvdebBlockValue } from "./render.js";

type Renderer = (props: { value: AvdebBlockValue }) => ReactElement | null;

/** Embed HTML from `avdeb.block()` / `avdeb.prerender()`, plus the carousel script when needed. */
export declare function AvdebHtml(props: { html: string; className?: string }): ReactElement | null;
/** Async server component: fetches products on the server. */
export declare function AvdebBlock(props: {
	value: AvdebBlockValue;
	avdeb: Avdeb;
	className?: string;
	headingLevel?: number;
	locale?: string;
}): Promise<ReactElement | null>;
/** Client component that sets up carousel arrows. AvdebHtml adds it for you. */
export declare function AvdebCarousel(): null;
/**
 * Portable Text `components` for the AVDEB objects. Pass a runtime from `createAvdeb()` (React
 * Server Components) or `await avdeb.prerender(value)` (any React).
 */
export declare function avdebComponents(
	source: Avdeb | Record<string, string>,
	options?: { className?: string },
): { types: Record<"avdebProducts" | "avdebProduct" | "avdebButton", Renderer> };
