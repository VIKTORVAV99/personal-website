import { getPostModule } from "$lib/blog-loader";

import type { PageLoadEvent } from "./$types";

export const load = async ({ data }: PageLoadEvent) => {
  const file = await getPostModule(data.moduleSlug ?? data.slug);
  return {
    ...data,
    component: file.default,
  };
};
