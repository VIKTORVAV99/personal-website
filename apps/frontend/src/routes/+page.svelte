<script lang="ts">
  import type { PageData } from "./$types";
  import TitleText from "$components/TitleText.svelte";
  import ProfileCard from "$components/ProfileCard.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
  import Highlight from "$components/Highlight.svelte";
  import { SITE_AUTHOR, SITE_DESCRIPTION } from "$lib/config";
  import { SITE_PAGES } from "$lib/pages";

  let { data }: { data: PageData } = $props();

  const blogPosts = $derived(data.blogPosts);
  const treePages = SITE_PAGES.filter((page) => page.path !== "" && page.path !== "/blog");
</script>

{#snippet treeChar(char: string)}<span class="text-2xl text-surface-500" aria-hidden="true">{char}</span>{/snippet}
{#snippet treeLink(href: string, label: string, prefix: string)}<a {href} class="flex items-baseline link-plain">{@render treeChar(prefix)}<span class="hover:underline underline-offset-4 whitespace-normal">{label}</span></a>{/snippet}

<SEO
  title={`${SITE_AUTHOR} - Software Engineer`}
  description={SITE_DESCRIPTION}
  structuredData={data.structuredData}
/>
<div class="page-container">
  <TitleText path="" subtitle="Welcome" />
  <ProfileCard as="h1" />
  <nav aria-label="Site map" class="font-mono text-lg flex flex-col w-full leading-tight whitespace-pre">
    <span><Highlight>~</Highlight>/</span>
    {#each treePages as page}
      {@render treeLink(page.path, page.path.slice(1), "├── ")}
    {/each}
    {@render treeLink("/blog", "blog/", "└─┬ ")}
    {#each blogPosts as post}
      {@render treeLink(`/blog/${post.slug}`, post.title, "  ├── ")}
    {/each}
    {@render treeLink("/blog", "...", "  └── ")}
  </nav>
</div>
