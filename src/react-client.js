"use client";

/**
 * Client part of sanity-plugin-avdeb/react: sets up carousel arrows and ←/→ keys after the
 * embed is on the page (also after client-side navigation).
 */

import { useEffect } from "react";

import { initCarousels } from "./carousel.js";

export function AvdebCarousel() {
	useEffect(() => {
		initCarousels(document);
	}, []);
	return null;
}
