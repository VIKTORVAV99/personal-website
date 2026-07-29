import { SITE_AUTHOR } from "$lib/config";

/** `<section> | <author>`; the bare author when no section is given. */
export const pageTitle = (section?: string) =>
  section ? `${section} | ${SITE_AUTHOR}` : SITE_AUTHOR;
