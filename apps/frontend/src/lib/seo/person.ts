import portrait from "$images/Viktor_Andersson.jpeg";
import { SITE_URL } from "$lib/config";
import {
  createPersonSchema,
  createOrganizationSchema,
  createCollegeOrUniversitySchema,
  createHighSchoolSchema,
  createEmployeeRoleSchema,
  createPlaceSchema,
  createDefinedTermSchema,
  createEducationalCredentialSchema,
} from "$lib/seo";

export const electricityMaps = createOrganizationSchema({
  name: "Electricity Maps",
  url: "https://www.electricitymaps.com",
  description: "The world's most comprehensive electricity data platform",
  location: createPlaceSchema("Copenhagen", "DK"),
  sameAs: [
    "https://www.wikidata.org/wiki/Q109023297",
    "https://www.linkedin.com/company/electricitymaps/",
  ],
});

const hh = createCollegeOrUniversitySchema({
  name: "Halmstad University",
  url: "https://www.hh.se",
  location: createPlaceSchema("Halmstad", "SE"),
  sameAs: [
    "https://www.wikidata.org/wiki/Q502842",
    "https://www.linkedin.com/school/h%C3%B6gskolan-i-halmstad/",
  ],
});

export const PROFILE_DATE_CREATED = new Date("2026-03-20").toISOString();
export const PROFILE_DATE_MODIFIED = new Date("2026-07-18").toISOString();

export const siteOwnerPerson = createPersonSchema({
  "@id": `${SITE_URL}/#person`,
  name: "Viktor Andersson",
  givenName: "Viktor",
  familyName: "Andersson",
  url: SITE_URL,
  image: `${SITE_URL}${portrait}`,
  homeLocation: createPlaceSchema("Malmö", "SE"),
  jobTitle: "Software Engineer",
  description:
    "Software Engineer at Electricity Maps, the world's most comprehensive electricity data platform. BSc in Digital Design and Innovation from Halmstad University.",
  knowsLanguage: ["English", "Swedish"],
  knowsAbout: [
    "Software Engineering",
    "Web Development",
    "SvelteKit",
    "React",
    "TypeScript",
    "Python",
    "Apache Airflow",
    "Apache Beam",
    "Data Visualization",
    "Data Engineering",
    "Open Source Software",
  ],
  worksFor: [
    createEmployeeRoleSchema({
      roleName: "Software Engineer",
      startDate: "2025-07",
      worksFor: electricityMaps,
    }),
    createEmployeeRoleSchema({
      roleName: "Open Source Community Engineer",
      startDate: "2022-12",
      endDate: "2025-06",
      worksFor: electricityMaps,
    }),
  ],
  alumniOf: hh,
  hasCredential: [
    createEducationalCredentialSchema({
      name: "Bachelor of Science in Digital Design and Innovation",
      credentialCategory: createDefinedTermSchema({ name: "Degree", termCode: "BSc" }),
      educationalLevel: "Bachelor",
      datePublished: "2025-06",
      recognizedBy: hh,
    }),
    createEducationalCredentialSchema({
      name: "High School Diploma in Information and Media Technology",
      credentialCategory: createDefinedTermSchema({ name: "High School Diploma" }),
      educationalLevel: "Upper secondary",
      datePublished: "2020-06",
      recognizedBy: createHighSchoolSchema({
        name: "Haganässkolan",
        location: createPlaceSchema("Älmhult", "SE"),
        sameAs: ["https://www.wikidata.org/wiki/Q89791742"],
      }),
    }),
  ],
  sameAs: [
    "https://github.com/viktorvav99",
    "https://www.linkedin.com/in/viktor-va-andersson/",
    "https://bsky.app/profile/viktor.andersson.tech",
  ],
});
