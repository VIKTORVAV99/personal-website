import { SITE_URL } from "$lib/config";

const postalAddressType = "PostalAddress" as const;
const placeType = "Place" as const;
const organizationType = "Organization" as const;
const employeeRoleType = "EmployeeRole" as const;
const educationalOrganizationType = "EducationalOrganization" as const;
const collegeOrUniversityType = "CollegeOrUniversity" as const;
const highSchoolType = "HighSchool" as const;
const educationalCredentialType = "EducationalOccupationalCredential" as const;
const webPageType = "WebPage" as const;
const softwareSourceCodeType = "SoftwareSourceCode" as const;
const personType = "Person" as const;
const blogPostingType = "BlogPosting" as const;
const profilePageType = "ProfilePage" as const;
const listItemType = "ListItem" as const;
const itemListType = "ItemList" as const;
const breadcrumbListType = "BreadcrumbList" as const;
const definedTermType = "DefinedTerm" as const;
const collectionPageType = "CollectionPage" as const;
const webSiteType = "WebSite" as const;

export interface PostalAddressSchema {
  "@type": typeof postalAddressType;
  addressLocality?: string;
  addressCountry?: string;
}

export interface PlaceSchema {
  "@type": typeof placeType;
  address: PostalAddressSchema;
}

export const createPlaceSchema = (
  addressLocality: string,
  addressCountry: string,
): PlaceSchema => ({
  "@type": placeType,
  address: { "@type": postalAddressType, addressLocality, addressCountry },
});

export interface OrganizationSchema {
  "@type": typeof organizationType;
  name: string;
  url?: string;
  description?: string;
  location?: string | PlaceSchema;
  sameAs?: string[];
}

export const createOrganizationSchema = (
  options: Omit<OrganizationSchema, "@type">,
): OrganizationSchema => ({ "@type": organizationType, ...options });

export interface EmployeeRoleSchema {
  "@type": typeof employeeRoleType;
  roleName?: string;
  startDate?: string;
  endDate?: string;
  worksFor?: OrganizationSchema;
}

export const createEmployeeRoleSchema = (
  options: Omit<EmployeeRoleSchema, "@type">,
): EmployeeRoleSchema => ({ "@type": employeeRoleType, ...options });

export interface EducationalOrganizationSchema {
  "@type": typeof educationalOrganizationType;
  name: string;
  url?: string;
  sameAs?: string[];
  location?: string | PlaceSchema;
}

export const createEducationalOrganizationSchema = (
  options: Omit<EducationalOrganizationSchema, "@type">,
): EducationalOrganizationSchema => ({ "@type": educationalOrganizationType, ...options });

export interface CollegeOrUniversitySchema {
  "@type": typeof collegeOrUniversityType;
  name: string;
  url?: string;
  sameAs?: string[];
  location?: string | PlaceSchema;
}

export const createCollegeOrUniversitySchema = (
  options: Omit<CollegeOrUniversitySchema, "@type">,
): CollegeOrUniversitySchema => ({ "@type": collegeOrUniversityType, ...options });

export interface HighSchoolSchema {
  "@type": typeof highSchoolType;
  name: string;
  url?: string;
  sameAs?: string[];
  location?: string | PlaceSchema;
}

export const createHighSchoolSchema = (
  options: Omit<HighSchoolSchema, "@type">,
): HighSchoolSchema => ({ "@type": highSchoolType, ...options });

export interface EducationalCredentialSchema {
  "@type": typeof educationalCredentialType;
  name: string;
  credentialCategory?: DefinedTermSchema;
  educationalLevel?: string;
  datePublished?: string;
  recognizedBy?: EducationalOrganizationSchema | CollegeOrUniversitySchema | HighSchoolSchema;
}

export const createEducationalCredentialSchema = (
  options: Omit<EducationalCredentialSchema, "@type">,
): EducationalCredentialSchema => ({ "@type": educationalCredentialType, ...options });

/** Bare "@id" reference to a node declared elsewhere in the graph. */
export interface NodeRefSchema {
  "@id": string;
}

export interface WebPageSchema {
  "@type": typeof webPageType;
  "@id": string;
  isPartOf?: NodeRefSchema;
}

export const createWebPageSchema = (options: Omit<WebPageSchema, "@type">): WebPageSchema => ({
  "@type": webPageType,
  ...options,
});

export interface SoftwareSourceCodeSchema {
  "@type": typeof softwareSourceCodeType;
  name: string;
  description?: string;
  codeRepository?: string; // URL to the GitHub repo
  programmingLanguage?: string | string[]; // e.g., ["TypeScript", "Svelte"]
  author?: PersonSchema;
  license?: string; // URL to the license (e.g., MIT)
  dateCreated?: string;
  dateModified?: string;
}

export const createSoftwareSourceCodeSchema = (
  options: Omit<SoftwareSourceCodeSchema, "@type">,
): SoftwareSourceCodeSchema => ({ "@type": softwareSourceCodeType, ...options });

export interface PersonSchema {
  "@type": typeof personType;
  /**
   * The "@id" property is optional but can be very useful for uniquely identifying the person in structured data, especially when linking to other entities.
   * It should be a URL that ideally points to a page about the person (e.g., their profile page).
   * This allows search engines and other consumers of the structured data to understand that different pieces of data refer to the same individual.
   * For example, you could set it to "https://viktor.andersson.tech/#person" to indicate that this schema describes the person associated with that URL.
   */
  "@id"?: string;
  mainEntityOfPage?: WebPageSchema | NodeRefSchema;
  name: string;
  givenName?: string;
  familyName?: string;
  url?: string;
  image?: string | string[];
  homeLocation?: string | PlaceSchema;
  jobTitle?: string;
  description?: string;
  knowsLanguage?: string | string[];
  knowsAbout?: string | string[];
  worksFor?:
    | OrganizationSchema
    | EmployeeRoleSchema
    | Array<OrganizationSchema | EmployeeRoleSchema>;
  alumniOf?:
    | EducationalOrganizationSchema
    | CollegeOrUniversitySchema
    | HighSchoolSchema
    | Array<EducationalOrganizationSchema | CollegeOrUniversitySchema | HighSchoolSchema>;
  hasCredential?: EducationalCredentialSchema | EducationalCredentialSchema[];
  sameAs?: string[];
}

export const createPersonSchema = (options: Omit<PersonSchema, "@type">): PersonSchema => ({
  "@type": personType,
  ...options,
});

export const SITE_OWNER_PERSON_REF = createPersonSchema({
  "@id": `${SITE_URL}/#person`,
  name: "Viktor Andersson",
  url: SITE_URL,
});

export interface ArticleSchema {
  "@type": "Article" | "BlogPosting" | "NewsArticle";
  headline: string;
  description?: string;
  inLanguage?: string;
  image?: string | string[];
  datePublished: string; // ISO 8601 format (e.g., "2026-03-15T21:07:31+01:00")
  dateModified?: string; // ISO 8601 format
  author?: PersonSchema | OrganizationSchema | Array<PersonSchema | OrganizationSchema>;
  publisher?: OrganizationSchema | PersonSchema;
  mainEntityOfPage?: WebPageSchema | string;
  isPartOf?: NodeRefSchema;
  wordCount?: number;
  keywords?: string | string[];
  articleBody?: string;
  url?: string;
}

export const createArticleSchema = (
  options: Omit<ArticleSchema, "@type"> & { "@type"?: "Article" | "BlogPosting" | "NewsArticle" },
): ArticleSchema => ({
  "@type": options["@type"] || blogPostingType,
  inLanguage: "en",
  ...options,
});

export interface ProfilePageSchema {
  "@type": typeof profilePageType;
  "@id"?: string;
  url?: string;
  isPartOf?: NodeRefSchema;
  dateCreated?: string;
  dateModified?: string;
  mainEntity: PersonSchema;
}

export const createProfilePageSchema = (
  options: Omit<ProfilePageSchema, "@type">,
): ProfilePageSchema => ({ "@type": profilePageType, ...options });

export interface ListItemSchema {
  "@type": typeof listItemType;
  position: number;
  name?: string;
  url?: string;
  item?: string;
}

export interface ItemListSchema {
  "@type": typeof itemListType;
  numberOfItems?: number;
  itemListElement: Pick<ListItemSchema, "@type" | "position" | "item">[];
}

export interface BreadcrumbListSchema {
  "@type": typeof breadcrumbListType;
  itemListElement: Pick<ListItemSchema, "@type" | "position" | "name" | "item">[];
}

export const createBreadcrumbListSchema = (
  items: { name: string; url?: string }[],
): BreadcrumbListSchema => ({
  "@type": breadcrumbListType,
  itemListElement: items.map((entry, i) => ({
    "@type": listItemType,
    position: i + 1,
    name: entry.name,
    ...(entry.url && { item: entry.url }),
  })),
});

export const createItemListSchema = (urls: string[]): ItemListSchema => ({
  "@type": itemListType,
  numberOfItems: urls.length,
  itemListElement: urls.map((url, i) => ({
    "@type": listItemType,
    position: i + 1,
    item: url,
  })),
});

export interface DefinedTermSchema {
  "@type": typeof definedTermType;
  name: string;
  termCode?: string;
}

export const createDefinedTermSchema = (
  options: Omit<DefinedTermSchema, "@type">,
): DefinedTermSchema => ({ "@type": definedTermType, ...options });

export interface CollectionPageRefSchema {
  "@type": typeof collectionPageType;
  url: string;
}

export const createCollectionPageRefSchema = (url: string): CollectionPageRefSchema => ({
  "@type": collectionPageType,
  url,
});

export interface CollectionPageSchema {
  "@type": typeof collectionPageType;
  name: string;
  description?: string;
  inLanguage?: string;
  url: string;
  mainEntity: ItemListSchema;
  isPartOf?:
    | CollectionPageRefSchema
    | NodeRefSchema
    | Array<CollectionPageRefSchema | NodeRefSchema>;
  about?: DefinedTermSchema;
}

export const createCollectionPageSchema = (
  options: Omit<CollectionPageSchema, "@type">,
): CollectionPageSchema => ({ "@type": collectionPageType, inLanguage: "en", ...options });

export interface WebSiteSchema {
  "@type": typeof webSiteType;
  "@id"?: string;
  name: string;
  url: string;
  description?: string;
  inLanguage?: string;
  author?: PersonSchema | OrganizationSchema;
  publisher?: PersonSchema | OrganizationSchema;
}

export const createWebSiteSchema = (options: Omit<WebSiteSchema, "@type">): WebSiteSchema => ({
  "@type": webSiteType,
  inLanguage: "en",
  ...options,
});

/** Reference to the WebSite node declared on the home page. */
export const SITE_WEBSITE_REF: NodeRefSchema = { "@id": `${SITE_URL}/#website` };

export type StructuredDataSchema =
  | PersonSchema
  | OrganizationSchema
  | EducationalOrganizationSchema
  | CollegeOrUniversitySchema
  | HighSchoolSchema
  | EmployeeRoleSchema
  | EducationalCredentialSchema
  | WebPageSchema
  | SoftwareSourceCodeSchema
  | ArticleSchema
  | ProfilePageSchema
  | WebSiteSchema
  | CollectionPageSchema
  | BreadcrumbListSchema
  | DefinedTermSchema;

const schemaURL = "https://schema.org/";

export const toJsonLd = (schema: StructuredDataSchema | StructuredDataSchema[]): string => {
  try {
    const payload = Array.isArray(schema)
      ? { "@context": schemaURL, "@graph": schema }
      : { "@context": schemaURL, ...schema };

    const json = JSON.stringify(payload);

    // Escape characters that can break out of an HTML <script> tag
    return json
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(/\u2028/g, "\\u2028") // Line separator
      .replace(/\u2029/g, "\\u2029"); // Paragraph separator
  } catch (error) {
    console.error("Failed to stringify JSON-LD schema:", error);
    return "{}"; // Fallback to a safe, empty JSON object
  }
};
