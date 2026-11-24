/** Shared identifiers and limits. Pure module. */
export const PACKAGE_NAME = "sanity-plugin-avdeb";
export const VERSION = "0.1.0";
export const API_HOST = "api.avdeb.com";
export const API_BASE = `https://${API_HOST}/v1/catalog`;
export const SITE_ORIGIN = "https://avdeb.com";
export const DOCS_URL = "https://avdeb.com/developers/#sanity";
export const PARTNER_DASHBOARD_URL = "https://avdeb.com/affiliate/dashboard/developers/";
export const AFFILIATE_URL = "https://avdeb.com/affiliate/";
/** Secret keys are issued as `avdeb_sk_` + 32 letters/digits (partner dashboard → Embeds & API). */
export const SECRET_KEY_RE = /^avdeb_sk_[A-Za-z0-9]{32}$/;
export const PUBLISHABLE_KEY_PREFIX = "avdeb_pk_";
/** Catalog API tier limits. */
export const MAX_LIMIT_ANONYMOUS = 12;
export const MAX_LIMIT_SECRET = 48;
export const DEFAULT_LIMIT = 6;
export const DEFAULT_DISCLOSURE = "As an AVDEB affiliate, I earn a commission from qualifying purchases.";
export const MODES = ["collection", "product"];
export const SOURCES = ["auto", "creator", "tag", "type", "search", "newest"];
export const LAYOUTS = ["grid", "carousel", "list", "spotlight"];
export const CARD_STYLES = ["elevated", "outline", "minimal"];
/** `site` inherits colours and fonts from your CSS. */
export const THEMES = ["site", "light", "dark", "auto"];
export const IMAGE_RATIOS = ["square", "portrait", "landscape"];
export const PRODUCT_VARIANTS = ["card", "horizontal", "hero"];
export const BUTTON_VARIANTS = ["solid", "outline", "link"];
export const ALIGNMENTS = ["start", "center", "end"];
