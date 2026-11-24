// Inlines assets/avdeb.css into src/studio/css.js for the Studio preview (shadow DOM, no CSS import needed).
import { readFileSync, writeFileSync } from "node:fs";

const css = readFileSync(new URL("../assets/avdeb.css", import.meta.url), "utf8");
writeFileSync(
	new URL("../src/studio/css.js", import.meta.url),
	`// Generated from assets/avdeb.css by scripts/build-css.mjs. Do not edit.\nexport default ${JSON.stringify(css)};\n`,
);
