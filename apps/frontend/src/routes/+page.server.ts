import { getAllPosts } from "$lib/blog";
import { SITE_URL, SITE_DESCRIPTION } from "$lib/config";
import {
  createWebSiteSchema,
  createSoftwareSourceCodeSchema,
  SITE_OWNER_PERSON_REF,
} from "$lib/seo";
import { siteOwnerPerson } from "$lib/seo/person";

import type { PageServerLoad } from "./$types";

const structuredData = [
  createWebSiteSchema({
    "@id": `${SITE_URL}/#website`,
    name: "Viktor Andersson",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    author: SITE_OWNER_PERSON_REF,
    publisher: SITE_OWNER_PERSON_REF,
  }),
  siteOwnerPerson,
  createSoftwareSourceCodeSchema({
    name: "personal-website",
    codeRepository: "https://github.com/VIKTORVAV99/personal-website",
    programmingLanguage: ["TypeScript", "Svelte"],
    author: SITE_OWNER_PERSON_REF,
    license: "https://github.com/VIKTORVAV99/personal-website/blob/main/LICENSE",
  }),
];

const blogSlugs = getAllPosts()
  .slice(0, 5)
  .map((post) => post.slug);

export const load = (() => ({
  structuredData,
  blogSlugs,
})) satisfies PageServerLoad;
