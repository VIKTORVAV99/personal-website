// @ts-expect-error — Vite enhanced:img query string not resolvable by TypeScript
import FallbackHeroImage from "$lib/assets/hero_banner.svg?w=1200&h=675&format=jpg&url";

export const SITE_URL = "https://viktor.andersson.tech";

export const SITE_DESCRIPTION =
  "Personal website for Viktor Andersson, Software Engineer at Electricity Maps and Digital Design and Innovation graduate";

/** Blog section description, shared by the listing pages, RSS channel, and llms.txt. */
export const BLOG_DESCRIPTION = "Thoughts on software engineering, climate tech, and open source";

export const REPO_URL = "https://github.com/VIKTORVAV99/personal-website";

/** Also hardcoded in app.html's `<link rel="license">`, which cannot import. */
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

/**
 * Profile links, shared by the footer, ProfileCard, and the Person schema's sameAs.
 * Labels are the link text everywhere, so the same destination reads the same in both places.
 */
export const SOCIAL_LINKS = [
  { label: "github", href: "https://github.com/viktorvav99" },
  { label: "linkedin", href: "https://www.linkedin.com/in/viktor-va-andersson/" },
  { label: "bluesky", href: "https://bsky.app/profile/viktor.andersson.tech" },
] as const;

/** Identity URLs added to the Person schema's sameAs only, never rendered as links. */
export const IDENTITY_URLS: readonly string[] = [
  "https://dev.to/viktorvav99",
  "https://x.com/VIKTORVAV99",
];

// Social scrapers (Open Graph, Twitter Cards) and Google's structured-data
// parser require absolute image URLs, so prefix the Vite asset path.
export const FALLBACK_HERO_IMAGE = `${SITE_URL}${FallbackHeroImage}`;

export const FALLBACK_HERO_IMAGE_WIDTH = 1200;
export const FALLBACK_HERO_IMAGE_HEIGHT = 675;
