import { getAllPosts, getAllTags, PAGE_SIZE, parsePageParam, slugifyTag } from "$lib/blog";
import { error, redirect } from "@sveltejs/kit";

import type { PageServerLoadEvent } from "./$types";

import { loadTagListing } from "../../listing";

export const entries = () => {
  const posts = getAllPosts();
  const result: { tag: string; page: string }[] = [];
  for (const tag of getAllTags(posts)) {
    const tagSlug = slugifyTag(tag);
    const count = posts.filter((p) => p.tags?.some((t) => slugifyTag(t) === tagSlug)).length;
    const totalPages = Math.ceil(count / PAGE_SIZE);
    for (let p = 2; p <= totalPages; p++) {
      result.push({ tag: tagSlug, page: String(p) });
    }
  }
  return result;
};

export const load = async ({ params }: PageServerLoadEvent) => {
  const page = parsePageParam(params.page);
  if (!page) error(404, "Page not found");
  if (page === 1) redirect(308, `/blog/tag/${params.tag.toLowerCase()}`);

  const data = loadTagListing(params.tag, page);
  if (page > data.totalPages) error(404, "Page not found");

  return data;
};
