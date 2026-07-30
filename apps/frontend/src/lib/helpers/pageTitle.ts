import { SITE_AUTHOR } from "$lib/config";

/** Maximum `<title>` length before the author suffix is dropped. */
const MAX_TITLE_LENGTH = 60;

/** `<section> | <author>`, or the bare section past 60 chars; the bare author when no section is given. */
export const pageTitle = (section?: string) => {
  if (!section) return SITE_AUTHOR;
  const withAuthor = `${section} | ${SITE_AUTHOR}`;
  return withAuthor.length <= MAX_TITLE_LENGTH ? withAuthor : section;
};
