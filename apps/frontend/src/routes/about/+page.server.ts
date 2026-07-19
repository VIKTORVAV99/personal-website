import { SITE_URL } from "$lib/config";
import { createBreadcrumbListSchema, createProfilePageSchema, SITE_WEBSITE_REF } from "$lib/seo";
import { PROFILE_DATE_CREATED, PROFILE_DATE_MODIFIED, siteOwnerPerson } from "$lib/seo/person";

import type { PageServerLoad } from "./$types";

const pageUrl = `${SITE_URL}/about`;

const structuredData = [
  createProfilePageSchema({
    "@id": pageUrl,
    url: pageUrl,
    isPartOf: SITE_WEBSITE_REF,
    dateCreated: PROFILE_DATE_CREATED,
    dateModified: PROFILE_DATE_MODIFIED,
    mainEntity: { ...siteOwnerPerson, mainEntityOfPage: { "@id": pageUrl } },
  }),
  createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "About" }]),
];

export const load = (() => ({
  structuredData,
})) satisfies PageServerLoad;
