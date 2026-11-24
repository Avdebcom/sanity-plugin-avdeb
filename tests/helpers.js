/** Test doubles: scripted fetch and sample products. */

/** fetch that answers from a queue (or a function) and records every call. */
export function scriptedFetch(replies) {
	const calls = [];
	const fetch = async (url, init) => {
		calls.push({ url: String(url), headers: { ...(init?.headers ?? {}) } });
		const reply = typeof replies === "function" ? replies(String(url)) : replies.shift();
		if (!reply) throw new Error(`unexpected fetch ${url}`);
		if (reply instanceof Error) throw reply;
		return new Response(JSON.stringify(reply.body), {
			status: reply.status ?? 200,
			headers: { "Content-Type": "application/json" },
		});
	};
	return { fetch, calls };
}

export function product(overrides = {}) {
	return {
		id: "p1",
		handle: "cat-sticker",
		title: "Cat Sticker",
		url: "https://avdeb.com/store/cat-sticker/?ref=ABC12345",
		image: "https://cdn.avdeb.com/cat.webp",
		price: 4.9,
		compare_at_price: null,
		currency: "USD",
		type: "Sticker",
		tags: ["stickers", "cats"],
		creator: { slug: "cleo", name: "Cleo", url: "https://avdeb.com/creators/cleo/?ref=ABC12345" },
		created_at: "2026-09-30T10:00:00Z",
		...overrides,
	};
}

/** A catalog API that answers every products request with `products` and echoes the ref. */
export function fakeApi(products = [product(), product({ id: "p2", handle: "dog-sticker", title: "Dog <Sticker>", url: "https://avdeb.com/store/dog-sticker/?ref=ABC12345" })]) {
	return scriptedFetch((url) => {
		const u = new URL(url);
		if (u.pathname.endsWith("/key")) return { body: { owner: { type: "affiliate", name: "Pat", ref: "KEYREF", creator_slug: "" } } };
		const limit = Number(u.searchParams.get("limit") ?? 6);
		return { body: { products: products.slice(0, limit), ref: u.searchParams.get("ref") ?? "", tier: "anonymous" } };
	});
}

export const silent = { info() {}, warn() {} };
