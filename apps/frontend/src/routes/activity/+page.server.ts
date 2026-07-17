import { SITE_URL } from "$lib/config";
import { createBreadcrumbListSchema, createWebPageSchema } from "$lib/seo";

import type { PageServerLoad } from "./$types";

const description = "A live feed of my recently merged pull requests and opened issues.";

const structuredData = [
  createWebPageSchema(`${SITE_URL}/activity`),
  createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "Activity" }]),
];

export const load = (() => ({ structuredData, description })) satisfies PageServerLoad;
