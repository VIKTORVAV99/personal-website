import { getAllTagSlugs, getPostsForTag, PAGE_SIZE, parsePageParam, slugifyTag } from "$lib/blog";
import { getAllPosts } from "$lib/blog.server";
import { error, redirect } from "@sveltejs/kit";

import type { PageServerLoadEvent } from "./$types";

import { loadTagListing } from "../../listing";

export const entries = () => {
  const posts = getAllPosts();
  const result: { tag: string; page: string }[] = [];
  for (const tagSlug of getAllTagSlugs(posts)) {
    const totalPages = Math.ceil(getPostsForTag(posts, tagSlug).length / PAGE_SIZE);
    for (let p = 2; p <= totalPages; p++) {
      result.push({ tag: tagSlug, page: String(p) });
    }
  }
  return result;
};

export const load = async ({ params }: PageServerLoadEvent) => {
  const page = parsePageParam(params.page);
  if (!page) error(404, "Page not found");
  if (page === 1) redirect(308, `/blog/tag/${slugifyTag(params.tag)}`);

  const data = loadTagListing(params.tag, page, getAllPosts());
  if (page > data.totalPages) error(404, "Page not found");

  return data;
};
