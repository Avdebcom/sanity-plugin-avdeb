/**
 * Carousel arrows and ←/→ keys over the native scroll-snap track. Without it the carousel still
 * scrolls. `initCarousels(root)` sets up every carousel inside `root` (a document, element or shadow root).
 */

function setup(root) {
	if (root.dataset.avdebReady) return;
	root.dataset.avdebReady = "1";
	const track = root.querySelector("[data-avdeb-track]");
	const prev = root.querySelector("[data-avdeb-prev]");
	const next = root.querySelector("[data-avdeb-next]");
	if (!track || !prev || !next) return;

	const rtl = getComputedStyle(track).direction === "rtl";
	const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
	const update = () => {
		const max = track.scrollWidth - track.clientWidth - 2;
		const x = Math.abs(track.scrollLeft);
		prev.disabled = x <= 2;
		next.disabled = x >= max;
		const overflow = max > 0;
		prev.hidden = !overflow;
		next.hidden = !overflow;
		root.toggleAttribute("data-avdeb-overflow", overflow);
	};
	const go = (dir) =>
		track.scrollBy({ left: dir * (rtl ? -1 : 1) * track.clientWidth * 0.9, behavior: smooth ? "smooth" : "auto" });

	prev.addEventListener("click", () => go(-1));
	next.addEventListener("click", () => go(1));
	track.addEventListener("scroll", update, { passive: true });
	track.addEventListener("keydown", (e) => {
		if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
			e.preventDefault();
			go((e.key === "ArrowRight") !== rtl ? 1 : -1);
		}
	});
	if (typeof ResizeObserver !== "undefined") new ResizeObserver(update).observe(track);
	update();
}

export function initCarousels(root = typeof document === "undefined" ? null : document) {
	if (!root || typeof root.querySelectorAll !== "function") return;
	root.querySelectorAll("[data-avdeb-carousel]").forEach(setup);
}
