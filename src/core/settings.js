/**
 * Plugin options → validated site settings. Pure module (the environment is passed in).
 *
 * Credentials come from the options, else from the AVDEB_SECRET_KEY / AVDEB_REF_CODE environment
 * variables (process.env or the project's .env file), so the secret key never has to be committed.
 */

import { cleanRef, keyProblem, usableKey } from "./catalog.js";
import { DEFAULT_DISCLOSURE } from "./constants.js";
import { bool, int, parseDisplay, safeColor, text } from "./options.js";

const LOCALE_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/**
 * @param {Record<string, unknown>} options plugin options
 * @param {Record<string, string | undefined>} env AVDEB_* environment variables
 */
export function resolveSettings(options = {}, env = {}) {
	const o = options ?? {};
	const warnings = [];

	const rawKey = text(o.apiKey ?? env.AVDEB_SECRET_KEY ?? "", 200);
	const problem = keyProblem(rawKey);
	if (problem === "publishable") {
		warnings.push("apiKey is a publishable key (avdeb_pk_…). Use the secret key (avdeb_sk_…); links fall back to refCode.");
	} else if (problem === "malformed") {
		warnings.push("apiKey doesn't look like an AVDEB secret key (avdeb_sk_ + 32 characters); it is ignored.");
	}

	const rawRef = text(o.refCode ?? env.AVDEB_REF_CODE ?? "", 100);
	const refCode = cleanRef(rawRef);
	if (rawRef && refCode !== rawRef) {
		warnings.push(`refCode was cleaned to "${refCode}" (letters, digits, "-" and "_" only).`);
	}
	if (typeof o.accentColor === "string" && o.accentColor.trim() !== "" && !safeColor(o.accentColor)) {
		warnings.push(`accentColor "${o.accentColor}" is not a hex colour; the default is used.`);
	}

	const locale = typeof o.locale === "string" && LOCALE_RE.test(o.locale) ? o.locale : "en-US";

	return {
		apiKey: usableKey(rawKey),
		refCode,
		keyProblem: problem,
		display: parseDisplay(o),
		showDisclosure: bool(o.showDisclosure, true),
		disclosureText: text(o.disclosureText, 300, DEFAULT_DISCLOSURE),
		cacheMinutes: int(o.cacheMinutes, 5, 2880, 360),
		requestsPerMinute: int(o.requestsPerMinute, 1, 6000, 120),
		locale,
		warnings,
	};
}

/** Disclosure shown under an embed — only when its links actually carry a referral code. */
export function disclosureFor(settings, ref) {
	return ref && settings.showDisclosure ? settings.disclosureText : null;
}
