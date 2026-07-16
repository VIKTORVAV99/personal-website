import type { PageServerLoad } from "./$types";

import { loadBlogListing } from "./listing";

export const load = (() => loadBlogListing(1)) satisfies PageServerLoad;
