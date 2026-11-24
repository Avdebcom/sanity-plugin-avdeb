// Dev Studio for the plugin: `npm run dev` (set SANITY_STUDIO_PROJECT_ID in studio/.env).
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { avdeb } from "sanity-plugin-avdeb";

import { page } from "./schemas/page.js";
import { post } from "./schemas/post.js";

export default defineConfig({
	name: "default",
	title: "AVDEB plugin demo",
	projectId: process.env.SANITY_STUDIO_PROJECT_ID,
	dataset: process.env.SANITY_STUDIO_DATASET || "production",
	plugins: [structureTool(), avdeb()],
	schema: { types: [post, page] },
});
