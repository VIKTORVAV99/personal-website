import { getAllPosts } from "#lib/blog.server.ts";
import { getAllTagSlugs } from "#lib/blog.ts";

import type { PageServerLoadEvent } from "./$types";

import { loadTagListing } from "./listing";

export const entries = () => getAllTagSlugs(getAllPosts()).map((tag) => ({ tag }));

export const load = async ({ params }: PageServerLoadEvent) =>
  loadTagListing(params.tag, 1, getAllPosts());
