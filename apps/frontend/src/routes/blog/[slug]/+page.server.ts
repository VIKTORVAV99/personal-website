import { getAllPosts } from "$lib/blog";
import { FALLBACK_HERO_IMAGE, SITE_URL } from "$lib/config";
import {
  createArticleSchema,
  createBreadcrumbListSchema,
  createWebPageSchema,
  SITE_OWNER_PERSON_REF,
  SITE_WEBSITE_REF,
} from "$lib/seo";
import { error } from "@sveltejs/kit";

import type { PageServerLoadEvent } from "./$types";

export const load = async ({ params }: PageServerLoadEvent) => {
  const posts = getAllPosts();

  const index = posts.findIndex((p) => p.slug === params.slug.toLowerCase());
  if (index === -1) throw error(404, `Post "${params.slug}" not found`);

  const post = posts[index];
  // Build the canonical from the post's own slug, not params.slug, so a
  // mixed-case request can never become its own canonical URL.
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const datePublished = new Date(post.date).toISOString();
  const dateModified = new Date(post.last_updated || post.date).toISOString();

  const prevPost =
    index > 0 ? { slug: posts[index - 1].slug, title: posts[index - 1].title } : undefined;
  const nextPost =
    index < posts.length - 1
      ? { slug: posts[index + 1].slug, title: posts[index + 1].title }
      : undefined;

  return {
    slug: post.slug,
    metadata: {
      title: post.title,
      description: post.description,
      date: post.date,
      last_updated: post.last_updated,
      tags: post.tags,
    },
    readingTime: post.readingTime,
    postUrl,
    datePublished,
    dateModified,
    structuredData: [
      createArticleSchema({
        headline: post.title,
        description: post.description,
        datePublished,
        dateModified,
        author: SITE_OWNER_PERSON_REF,
        publisher: SITE_OWNER_PERSON_REF,
        keywords: post.tags,
        url: postUrl,
        mainEntityOfPage: createWebPageSchema({ "@id": postUrl }),
        isPartOf: SITE_WEBSITE_REF,
        image: FALLBACK_HERO_IMAGE,
      }),
      createBreadcrumbListSchema([
        { name: "Home", url: SITE_URL },
        { name: "Blog", url: `${SITE_URL}/blog` },
        { name: post.title },
      ]),
    ],
    prevPost,
    nextPost,
  };
};
