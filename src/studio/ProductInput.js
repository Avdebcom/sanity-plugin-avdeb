/**
 * Product field: paste a product link, or search AVDEB and pick a product.
 */

import { Box, Button, Card, Flex, Grid, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import { createElement as h, useEffect, useState } from "react";
import { set } from "sanity";

import { previewAvdeb } from "./runtime.js";

function useSearch(query) {
	const [state, setState] = useState({ cards: [], loading: false, done: false });
	useEffect(() => {
		const q = query.trim();
		if (q.length < 2) {
			setState({ cards: [], loading: false, done: false });
			return undefined;
		}
		let live = true;
		setState((s) => ({ ...s, loading: true }));
		const timer = setTimeout(() => {
			previewAvdeb()
				.data({ url: q, source: "search", limit: 8 })
				.then((d) =>
					live &&
					setState({
						cards: d.products.map((p, i) => ({ ...d.cards[i], handle: p.handle })),
						loading: false,
						done: true,
					}),
				)
				.catch(() => live && setState({ cards: [], loading: false, done: true }));
		}, 350);
		return () => {
			live = false;
			clearTimeout(timer);
		};
	}, [query]);
	return state;
}

function ResultCard({ card, selected, onPick }) {
	const pick = () => onPick(card);
	return h(
		Card,
		{
			padding: 2,
			radius: 2,
			border: true,
			tone: selected ? "primary" : "default",
			role: "button",
			tabIndex: 0,
			onClick: pick,
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					pick();
				}
			},
			style: { cursor: "pointer" },
			"data-avdeb-result": card.handle,
			"aria-label": `Choose ${card.title}`,
		},
		h(
			Flex,
			{ gap: 3, align: "center" },
			card.image
				? h("img", { src: card.image, alt: "", width: 44, height: 44, style: { display: "block", width: 44, height: 44, borderRadius: 4, objectFit: "cover", flex: "none" } })
				: h(Box, { style: { width: 44, height: 44, flex: "none" } }),
			h(
				Box,
				{ flex: 1, style: { minWidth: 0 } },
				h(
					Stack,
					{ gap: 2 },
					h(Text, { size: 1, weight: "medium", textOverflow: "ellipsis" }, card.title),
					h(Text, { size: 1, muted: true, textOverflow: "ellipsis" }, [card.price, card.creator].filter(Boolean).join(" · ")),
				),
			),
		),
	);
}

export function ProductInput(props) {
	const { value, onChange, readOnly } = props;
	const [query, setQuery] = useState("");
	const { cards, loading, done } = useSearch(query);
	const current = typeof value === "string" ? value : "";

	const pick = (card) => {
		onChange(set(`https://avdeb.com/store/${card.handle}/`));
		setQuery("");
	};

	return h(
		Stack,
		{ gap: 3 },
		props.renderDefault(props),
		readOnly
			? null
			: h(
					Stack,
					{ gap: 2 },
					h(TextInput, {
						value: query,
						onChange: (e) => setQuery(e.currentTarget.value),
						placeholder: "Search AVDEB products…",
						fontSize: 1,
						"aria-label": "Search AVDEB products",
						"data-avdeb-search": "",
						iconRight: loading ? Spinner : undefined,
					}),
					cards.length
						? h(
								Grid,
								{ columns: [1, 2], gap: 2 },
								cards.map((card) =>
									h(ResultCard, {
										key: card.handle,
										card,
										selected: current.includes(`/store/${card.handle}/`),
										onPick: pick,
									}),
								),
							)
						: done && !loading
							? h(Text, { size: 1, muted: true }, "No products found.")
							: null,
					query && cards.length ? h(Flex, { justify: "flex-end" }, h(Button, { mode: "bleed", fontSize: 1, text: "Clear search", onClick: () => setQuery("") })) : null,
				),
	);
}
