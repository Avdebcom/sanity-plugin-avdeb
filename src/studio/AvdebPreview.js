/**
 * Live preview of an AVDEB object in the Studio: the same HTML and CSS your front end renders,
 * in a shadow root so Studio styles and the embed's styles don't mix.
 */

import { Box, Card, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { createElement as h, useEffect, useRef, useState } from "react";

import { initCarousels } from "../carousel.js";
import CSS from "./css.js";
import { previewAvdeb } from "./runtime.js";

const FRAME_CSS = `
:host { display: block; }
.frame { pointer-events: none; max-height: 30rem; overflow: hidden; padding: 4px 2px;
  -webkit-mask-image: linear-gradient(#000 26rem, transparent);
  mask-image: linear-gradient(#000 26rem, transparent); }
.frame .avdeb, .frame .avdeb-cta { margin: 0; }
.frame .avdeb--single .avdeb-card__media { max-height: 15rem; }
`;

/** The product's real title from rendered HTML (the stored value is only a link). */
function productTitle(html) {
	const m = /class="avdeb-card__link"[^>]*>([^<]+)</.exec(html || "");
	if (!m) return "";
	const t = document.createElement("textarea");
	t.innerHTML = m[1];
	return t.value;
}

function isEmptyHtml(html) {
	return !html || /^\s*<!--/.test(html);
}

function hint(type) {
	if (type === "avdebProduct") return "Search for a product or paste a product link.";
	if (type === "avdebButton") return "Add an avdeb.com link.";
	return "Nothing to show for these settings. Try another link or search.";
}

function usePreviewHtml(value) {
	const [state, setState] = useState({ html: "", loading: true });
	const key = JSON.stringify(value ?? null);
	useEffect(() => {
		let live = true;
		setState((s) => ({ ...s, loading: true }));
		const timer = setTimeout(() => {
			previewAvdeb()
				.block(value)
				.then((html) => live && setState({ html, loading: false }))
				.catch(() => live && setState({ html: "", loading: false }));
		}, 300);
		return () => {
			live = false;
			clearTimeout(timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);
	return state;
}

function ShadowHtml({ html }) {
	const host = useRef(null);
	useEffect(() => {
		const el = host.current;
		if (!el) return;
		const root = el.shadowRoot ?? el.attachShadow({ mode: "open" });
		root.innerHTML = `<style>${CSS}${FRAME_CSS}</style><div class="frame">${html}</div>`;
		initCarousels(root);
	}, [html]);
	return h("div", { ref: host, "data-avdeb-preview": "" });
}

/** Studio preview component for avdebProducts, avdebProduct and avdebButton. */
export function AvdebPreview(props) {
	const value = props.avdeb ?? null;
	const { html, loading } = usePreviewHtml(value);
	const compact = props.layout && props.layout !== "block" && props.layout !== "default";
	if (!value || compact) return props.renderDefault(props);

	const empty = isEmptyHtml(html);
	return h(
		Stack,
		{ gap: 2 },
		props.renderDefault({
			...props,
			layout: "default",
			title: (value._type === "avdebProduct" && productTitle(html)) || props.title,
		}),
		h(
			Card,
			{ padding: 2, radius: 2, tone: empty && !loading ? "caution" : "default", border: empty && !loading },
			loading && empty
				? h(Flex, { align: "center", gap: 2, padding: 2 }, h(Spinner, { muted: true }), h(Text, { size: 1, muted: true }, "Loading products…"))
				: empty
					? h(Box, { padding: 2 }, h(Text, { size: 1, muted: true }, hint(value._type)))
					: h(ShadowHtml, { html }),
		),
	);
}
