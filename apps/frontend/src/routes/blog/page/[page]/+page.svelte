<script lang="ts">
  import type { PageData } from './$types';
  import SEO from "$lib/seo/components/SEO.svelte";
  import BlogPostList from "$components/blog/BlogPostList.svelte";
  import TitleText from "$components/TitleText.svelte";

  let { data }: { data: PageData } = $props();
</script>

<SEO
  title={`Viktor Andersson | Blog — Page ${data.currentPage}`}
  description={data.description}
  canonicalURL={data.canonicalURL}
  prevURL={data.prevURL}
  nextURL={data.nextURL}
  structuredData={data.structuredData}
/>

<div class="page-container">

  <TitleText path="blog" heading="Blog" subtitle={data.description} />

  <BlogPostList posts={data.pagedPosts} currentPage={data.currentPage} totalPages={data.totalPages} />
</div>
