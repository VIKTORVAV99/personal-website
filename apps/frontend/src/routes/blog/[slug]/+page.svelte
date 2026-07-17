<script lang="ts">
  import type { PageData } from './$types';
  import SEO from '$lib/seo/components/SEO.svelte';
  import { SITE_URL } from '$lib/config';
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import PostDate from '$components/blog/PostDate.svelte';
  import PostTags from '$components/blog/PostTags.svelte';
  import AuthorBanner from '$components/blog/AuthorBanner.svelte';
  import './blog.css';

  let { data }: { data: PageData } = $props();

  const prevURL = $derived(data.nextPost ? `${SITE_URL}/blog/${data.nextPost.slug}` : undefined);
  const nextURL = $derived(data.prevPost ? `${SITE_URL}/blog/${data.prevPost.slug}` : undefined);
</script>

{#snippet postNavLink(href: string, title: string, direction: 'prev' | 'next')}
  {@const isPrev = direction === 'prev'}
  <a
    {href}
    class={[
      'group relative flex items-center md:max-w-1/2 text-surface-300 hover:text-accent transition-colors',
      !isPrev && 'text-right md:ml-auto'
    ]}
  >
    {#if isPrev}
      <span class="absolute -left-6 top-1/2 -translate-y-1/2">
        <ChevronLeft size={16} />
      </span>
    {/if}
    <div class={['flex flex-col', !isPrev && 'items-end']}>
      <span class="text-xs font-mono uppercase tracking-wide">{isPrev ? "Newer" : "Older"}</span>
      <span class="text-sm text-surface-300 group-hover:text-accent transition-colors">{title}</span>
    </div>
    {#if !isPrev}
      <span class="absolute -right-6 top-1/2 -translate-y-1/2">
        <ChevronRight size={16} />
      </span>
    {/if}
  </a>
{/snippet}

<SEO
  title={`${data.metadata.title} | Viktor Andersson`}
  description={data.metadata.description}
  type="article"
  canonicalURL={data.postUrl}
  structuredData={data.structuredData}
  prevURL={prevURL}
  nextURL={nextURL}
  publishedTime={data.datePublished}
  modifiedTime={data.dateModified}
  tags={data.metadata.tags}
/>

<article class="w-full max-w-prose mx-auto mt-16 flex flex-1 flex-col gap-8">
  <header class="flex flex-col gap-3">
    <h1>{data.metadata.title}</h1>
    <PostDate date={data.metadata.date} lastUpdated={data.metadata.last_updated} readingTime={data.readingTime} />
    <PostTags tags={data.metadata.tags} />
    <AuthorBanner />
  </header>
  <section class="blog-content">
    <data.component />
  </section>
  {#if data.prevPost || data.nextPost}
    <footer class="mt-auto w-full flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4 md:gap-8" aria-label="Post navigation">
      <div class="flex flex-col md:contents gap-4 max-w-2/3">
        {#if data.prevPost}
          {@render postNavLink(`/blog/${data.prevPost.slug}`, data.prevPost.title, "prev")}
        {/if}
        {#if data.nextPost}
          {@render postNavLink(`/blog/${data.nextPost.slug}`, data.nextPost.title, "next")}
        {/if}
      </div>
    </footer>
  {/if}
</article>
