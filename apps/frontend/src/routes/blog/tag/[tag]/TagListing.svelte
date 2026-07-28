<script lang="ts">
  import BlogPostList from "$components/blog/BlogPostList.svelte";
  import TitleText from "$components/TitleText.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";

  import type { loadTagListing } from "./listing";

  let { data }: { data: ReturnType<typeof loadTagListing> } = $props();
</script>

<SEO
  robots={data.robots}
  title={data.title}
  description={data.description}
  canonicalURL={data.canonicalURL}
  prevURL={data.prevURL}
  nextURL={data.nextURL}
  structuredData={data.structuredData}
/>

<div class="page-container">
  <TitleText
    path="blog/tag/{data.tag}"
    heading="Posts tagged #{data.displayTag}"
    subtitle="Posts tagged with #{data.displayTag}"
  />

  <BlogPostList
    posts={data.pagedPosts}
    currentPage={data.currentPage}
    totalPages={data.totalPages}
    baseHref="/blog/tag/{data.tag}"
  />
</div>
