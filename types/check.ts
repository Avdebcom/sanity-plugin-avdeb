// Type smoke test (npm run typecheck): the public API as users write it.
import { avdeb, avdebBlockTypes } from "sanity-plugin-avdeb";
import { avdebComponents } from "sanity-plugin-avdeb/react";
import { createAvdeb, toHTMLComponents } from "sanity-plugin-avdeb/render";

avdeb({ layout: "carousel", accentColor: "#7c3aed" });
avdeb();
const runtime = createAvdeb({ refCode: "YOURCODE", theme: "site" });
export const html: Promise<string> = runtime.block({ _type: "avdebProducts", url: "https://avdeb.com/category/stickers/" });
export const live = avdebComponents(runtime).types.avdebProducts;
export const pre = async (body: unknown[]) => toHTMLComponents(await runtime.prerender(body));
export const names: readonly string[] = avdebBlockTypes;
