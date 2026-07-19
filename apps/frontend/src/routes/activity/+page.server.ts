import { fetchActivityServer } from "$lib/api";
import { SITE_URL } from "$lib/config";
import { createBreadcrumbListSchema, createWebPageSchema, SITE_WEBSITE_REF } from "$lib/seo";

import type { PageServerLoad } from "./$types";

// Rendered per request (not prerendered like the rest of the site): the git log
// is the page's real content, so it must be in the HTML crawlers receive. The
// backend's 1-hour cache keeps the per-request cost off GitHub.
export const prerender = false;

const description = "A live feed of my recently merged pull requests and opened issues.";

const structuredData = [
  createWebPageSchema({ "@id": `${SITE_URL}/activity`, isPartOf: SITE_WEBSITE_REF }),
  createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "Activity" }]),
];

export const load = (async ({ platform }) => {
  const backend = platform?.env?.BACKEND;
  // No binding (e.g. build-time discovery or a misconfigured env) → null, which
  // the page renders as the git-flavored error state.
  const activity = backend ? await fetchActivityServer(backend) : null;
  return { structuredData, description, activity };
}) satisfies PageServerLoad;
