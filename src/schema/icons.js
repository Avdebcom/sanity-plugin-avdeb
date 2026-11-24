import { createElement as h } from "react";

const svg = (paths) =>
	function AvdebIcon() {
		return h(
			"svg",
			{ width: "1em", height: "1em", viewBox: "0 0 25 25", fill: "none", "data-sanity-icon": "avdeb" },
			paths.map((d, i) =>
				h("path", { key: i, d, stroke: "currentColor", strokeWidth: 1.2, strokeLinejoin: "round", strokeLinecap: "round" }),
			),
		);
	};

/** A grid of cards. */
export const ProductsIcon = svg(["M5.5 5.5h6v6h-6zM13.5 5.5h6v6h-6zM5.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z"]);
/** A tag. */
export const ProductIcon = svg(["M5.5 12.8V5.5h7.3l7 7-7.3 7.3-7-7Z", "M9.5 9.5h.01"]);
/** A button with an arrow. */
export const ButtonIcon = svg(["M4.5 8.5h16v8h-16z", "M9 12.5h6.5M13.5 10.5l2 2-2 2"]);
