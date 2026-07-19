// @ts-expect-error — Vite enhanced:img query string not resolvable by TypeScript
import FallbackHeroImage from "$lib/assets/hero_banner.svg?w=1200&h=675&format=jpg&url";

export const SITE_URL = "https://viktor.andersson.tech";

export const SITE_DESCRIPTION =
  "Personal website for Viktor Andersson, Software Engineer at Electricity Maps and Digital Design and Innovation graduate";

/** Blog section description, shared by the listing pages, RSS channel, and llms.txt. */
export const BLOG_DESCRIPTION = "Thoughts on software engineering, climate tech, and open source";

// Social scrapers (Open Graph, Twitter Cards) and Google's structured-data
// parser require absolute image URLs, so prefix the Vite asset path.
export const FALLBACK_HERO_IMAGE = `${SITE_URL}${FallbackHeroImage}`;

export const FALLBACK_HERO_IMAGE_WIDTH = 1200;
export const FALLBACK_HERO_IMAGE_HEIGHT = 675;
