// @ts-expect-error — Vite enhanced:img query string not resolvable by TypeScript
import FallbackHeroImage from "$lib/assets/hero_banner.svg?w=1200&h=675&format=jpg&url";

export const SITE_URL = "https://viktor.andersson.tech";

// Social scrapers (Open Graph, Twitter Cards) and Google's structured-data
// parser require absolute image URLs, so prefix the Vite asset path.
export const FALLBACK_HERO_IMAGE = `${SITE_URL}${FallbackHeroImage}`;

export const FALLBACK_HERO_IMAGE_WIDTH = 1200;
export const FALLBACK_HERO_IMAGE_HEIGHT = 675;
