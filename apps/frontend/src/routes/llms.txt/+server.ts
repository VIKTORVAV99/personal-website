export const prerender = true;
import { getAllPosts } from "$lib/blog";
import { SITE_URL, SITE_DESCRIPTION } from "$lib/config";
import { SITE_PAGES, RESOURCE_LINKS, type SiteLink } from "$lib/pages";

interface LlmsLink {
  title: string;
  url: string;
  description: string;
}

const toLlmsLink = (link: SiteLink): LlmsLink => ({
  title: link.title,
  url: `${SITE_URL}${link.path || "/"}`,
  description: link.description,
});

export const _sitePages: LlmsLink[] = SITE_PAGES.map(toLlmsLink);
export const _optionalLinks: LlmsLink[] = RESOURCE_LINKS.map(toLlmsLink);

const _linkList = (links: LlmsLink[]): string =>
  links.map((link) => `- [${link.title}](${link.url}): ${link.description}`).join("\n");

export const _buildLlmsTxt = (blogLinks: LlmsLink[]): string =>
  `# Viktor Andersson

> ${SITE_DESCRIPTION}

## Pages

${_linkList(_sitePages)}

## Blog

${_linkList(blogLinks)}

## Optional

${_linkList(_optionalLinks)}
`;

export const GET = async () => {
  const blogLinks = getAllPosts().map((post) => ({
    title: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    description: post.description,
  }));

  // Prerendered: only the body survives the build; caching is the asset layer's job.
  return new Response(_buildLlmsTxt(blogLinks), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
