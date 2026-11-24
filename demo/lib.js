import { createClient } from "@sanity/client";
import { createAvdeb } from "sanity-plugin-avdeb/render";

// Reads the dev Studio's dataset. SANITY_API_READ_TOKEN is only needed for a private dataset.
export const sanity = createClient({
	projectId: process.env.SANITY_STUDIO_PROJECT_ID,
	dataset: process.env.SANITY_STUDIO_DATASET || "production",
	apiVersion: "2026-11-01",
	useCdn: false,
	token: process.env.SANITY_API_READ_TOKEN,
	perspective: process.env.SANITY_API_READ_TOKEN ? "drafts" : "published",
});

// Referral code from AVDEB_REF_CODE (or pass { refCode: "…" }).
export const avdeb = createAvdeb();
