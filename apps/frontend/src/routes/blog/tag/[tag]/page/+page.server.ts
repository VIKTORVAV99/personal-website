import { slugifyTag } from "$lib/blog";
import { redirect } from "@sveltejs/kit";

import type { PageServerLoadEvent } from "./$types";

// Served from the worker so any tag redirects without enumerating them at build time.
export const prerender = false;

// The bare namespace path has no page of its own; send it to the tag listing.
export const load = ({ params }: PageServerLoadEvent) => {
  redirect(308, `/blog/tag/${slugifyTag(params.tag)}`);
};
