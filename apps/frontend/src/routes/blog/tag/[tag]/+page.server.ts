import { getAllTagSlugs } from "$lib/blog";
import { getAllPosts } from "$lib/blog.server";

import type { PageServerLoadEvent } from "./$types";

import { loadTagListing } from "./listing";

export const entries = () => getAllTagSlugs(getAllPosts()).map((tag) => ({ tag }));

export const load = async ({ params }: PageServerLoadEvent) =>
  loadTagListing(params.tag, 1, getAllPosts());
