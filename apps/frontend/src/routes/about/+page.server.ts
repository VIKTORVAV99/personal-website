import { createBreadcrumbListSchema, createProfilePageSchema } from "structured-data-generators";

import { SITE_URL } from "#lib/config.ts";
import { SITE_WEBSITE_REF } from "#lib/seo/index.ts";
import { PROFILE_DATE_CREATED, PROFILE_DATE_MODIFIED, siteOwnerPerson } from "#lib/seo/person.ts";

import type { PageServerLoad } from "./$types";

const pageUrl = `${SITE_URL}/about`;

const structuredData = [
  createProfilePageSchema({
    "@id": pageUrl,
    url: pageUrl,
    isPartOf: SITE_WEBSITE_REF,
    dateCreated: PROFILE_DATE_CREATED,
    dateModified: PROFILE_DATE_MODIFIED,
    mainEntity: siteOwnerPerson,
  }),
  createBreadcrumbListSchema([{ name: "Home", url: SITE_URL }, { name: "About" }]),
];

export const load = (() => ({
  structuredData,
})) satisfies PageServerLoad;
