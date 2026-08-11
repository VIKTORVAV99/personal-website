import { SITE_AUTHOR, SITE_URL } from "$lib/config";
import { createPersonSchema, type NodeRefSchema } from "structured-data-generators";

export * from "structured-data-generators";

/** robots directives, one per indexing policy. Pages pick a policy; they never spell out directives. */
export const ROBOTS = {
  default: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  /** Listings too thin to index, still crawled so they pass equity to the posts they link. */
  thinArchive: "noindex, follow",
  error: "noindex, nofollow",
} as const;

export type Robots = (typeof ROBOTS)[keyof typeof ROBOTS];

export const SITE_OWNER_PERSON_REF = createPersonSchema({
  "@id": `${SITE_URL}/#person`,
  name: SITE_AUTHOR,
  url: SITE_URL,
});

/** Reference to the WebSite node declared on the home page. */
export const SITE_WEBSITE_REF: NodeRefSchema = { "@id": `${SITE_URL}/#website` };
