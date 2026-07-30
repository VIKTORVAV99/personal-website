import { redirect } from "@sveltejs/kit";

// The bare namespace path has no page of its own; send it to the blog listing.
export const load = () => {
  redirect(308, "/blog");
};
