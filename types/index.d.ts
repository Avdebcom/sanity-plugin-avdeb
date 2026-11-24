import type { ComponentType } from "react";
import type { Plugin, PreviewProps, StringInputProps } from "sanity";

import type { AvdebDisplayOptions } from "./render.js";

export interface AvdebPluginOptions extends AvdebDisplayOptions {
	/** Shown in Studio previews only; your front end adds the code to links. */
	refCode?: string;
	/** Price locale for previews (default `en-US`). */
	locale?: string;
	showDisclosure?: boolean;
	disclosureText?: string;
}

/** Adds the avdebProducts, avdebProduct and avdebButton object types with live previews. */
export declare const avdeb: Plugin<AvdebPluginOptions | void>;
export default avdeb;

/** `["avdebProducts", "avdebProduct", "avdebButton"]` */
export declare const avdebBlockTypes: readonly ["avdebProducts", "avdebProduct", "avdebButton"];

// The schema types, if you register them yourself instead of using the plugin.
export declare const avdebProducts: { name: "avdebProducts"; type: "object"; [key: string]: unknown };
export declare const avdebProduct: { name: "avdebProduct"; type: "object"; [key: string]: unknown };
export declare const avdebButton: { name: "avdebButton"; type: "object"; [key: string]: unknown };
export declare const avdebTypes: Array<typeof avdebProducts | typeof avdebProduct | typeof avdebButton>;

export declare const AvdebPreview: ComponentType<PreviewProps & { avdeb?: Record<string, unknown> }>;
export declare const ProductInput: ComponentType<StringInputProps>;
