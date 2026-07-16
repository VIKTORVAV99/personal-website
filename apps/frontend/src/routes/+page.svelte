<script lang="ts">
  import type { PageData } from "./$types";
  import TitleText from "$components/TitleText.svelte";
  import ProfileCard from "$components/ProfileCard.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
  import Highlight from "$components/Highlight.svelte";
  import { SITE_URL } from "$lib/config";

  let { data }: { data: PageData } = $props();

  const blogSlugs = $derived(data.blogSlugs);
</script>

{#snippet treeChar(char: string)}<span class="text-2xl text-surface-500" aria-hidden="true">{char}</span>{/snippet}
{#snippet treeLink(href: string, label: string, prefix: string)}<a {href} class="flex items-center [text-decoration:none]!">{@render treeChar(prefix)}<span class="hover:underline underline-offset-4">{label}</span></a>{/snippet}

<SEO
  title="Viktor Andersson - Software Engineer"
  description="Personal website for Viktor Andersson, Software Engineer at Electricity Maps and Digital Design and Innovation graduate"
  canonicalURL={SITE_URL}
  structuredData={data.structuredData}
/>
<div class="page-container">
  <TitleText path="" subtitle="Welcome" />
  <ProfileCard />
  <nav aria-label="Site map" class="font-mono text-lg flex flex-col w-full leading-tight whitespace-pre">
    <span><Highlight>~</Highlight>/</span>
    {@render treeLink("/about", "about", "├── ")}
    {@render treeLink("/history", "history", "├── ")}
    {@render treeLink("/blog", "blog/", "└─┬ ")}
    {#each blogSlugs as slug}
      {@render treeLink(`/blog/${slug}`, slug, "  ├── ")}
    {/each}
    {@render treeLink("/blog", "...", "  └── ")}
  </nav>
</div>
