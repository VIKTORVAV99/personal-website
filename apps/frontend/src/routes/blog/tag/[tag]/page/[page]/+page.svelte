<script lang="ts">
  import type { PageData } from './$types';
  import SEO from "$lib/seo/components/SEO.svelte";
  import BlogPostList from "$components/blog/BlogPostList.svelte";
  import TitleText from "$components/TitleText.svelte";

  let { data }: { data: PageData } = $props();
</script>

<SEO
  noIndex={data.totalPosts < 4}
  title={`Viktor Andersson | #${data.displayTag} — Page ${data.currentPage}`}
  description={data.description}
  canonicalURL={data.canonicalURL}
  prevURL={data.prevURL}
  nextURL={data.nextURL}
  structuredData={data.structuredData}
/>

<div class="page-container">

  <TitleText path="blog/tag/{data.tag}" heading="Posts tagged #{data.displayTag}" subtitle="Posts tagged with #{data.displayTag}" />

  <BlogPostList posts={data.pagedPosts} currentPage={data.currentPage} totalPages={data.totalPages} baseHref="/blog/tag/{data.tag}" />
</div>
