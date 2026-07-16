import { getAllPosts, getAllTags, slugifyTag } from "$lib/blog";

import type { PageServerLoadEvent } from "./$types";

import { loadTagListing } from "./listing";

export const entries = () => {
  const posts = getAllPosts();
  const tags = getAllTags(posts);
  return tags.map((tag) => ({ tag: slugifyTag(tag) }));
};

export const load = async ({ params }: PageServerLoadEvent) => loadTagListing(params.tag, 1);
