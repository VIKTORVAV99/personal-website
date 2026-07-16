import { getAllPosts, PAGE_SIZE, parsePageParam } from "$lib/blog";
import { error, redirect } from "@sveltejs/kit";

import type { PageServerLoadEvent } from "./$types";

import { loadBlogListing } from "../../listing";

export const entries = () => {
  const totalPages = Math.ceil(getAllPosts().length / PAGE_SIZE);
  const result: { page: string }[] = [];
  for (let p = 2; p <= totalPages; p++) {
    result.push({ page: String(p) });
  }
  return result;
};

export const load = async ({ params }: PageServerLoadEvent) => {
  const page = parsePageParam(params.page);
  if (!page) error(404, "Page not found");
  if (page === 1) redirect(308, "/blog");

  const data = loadBlogListing(page);
  if (page > data.totalPages) error(404, "Page not found");

  return data;
};
