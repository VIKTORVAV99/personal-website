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

{#snippet treeLink(href: string, label: string)}<a
    {href}
    class="link-plain hover:underline underline-offset-4">{label}</a
  >{/snippet}

<SEO
  title={`${SITE_AUTHOR} - Software Engineer`}
  description={SITE_DESCRIPTION}
  structuredData={data.structuredData}
/>
<div class="page-container">
  <TitleText path="" subtitle="Welcome" />
  <ProfileCard as="h1" />
  <nav aria-label="Site map" class="font-mono text-lg leading-tight w-full">
    <span><Highlight>~</Highlight>/</span>
    <ul class="tree">
      {#each treePages as page}
        <li>{@render treeLink(page.path, page.path.slice(1))}</li>
      {/each}
      <li>
        {@render treeLink("/blog", "blog/")}
        <ul class="tree">
          {#each blogPosts as post}
            <li>{@render treeLink(`/blog/${post.slug}`, post.title)}</li>
          {/each}
          <li>{@render treeLink("/blog", "...")}</li>
        </ul>
      </li>
    </ul>
  </nav>
</div>

<style>
  /* The connectors are drawn with borders instead of box-drawing glyphs so the
     rails span a row's full height and stay attached when a title wraps. */
  .tree {
    --rail-color: var(--color-surface-500);
    --rail-width: 1.5px;
    /* Row padding plus half the leading-tight line box: the first line's center. */
    --rail-tick-y: calc(0.2em + 0.625em);
    /* Vertical distance from a row's tick down to a nested list's top edge. */
    --rail-join: 0.625em;
  }

  .tree li {
    position: relative;
    padding-block: 0.2em;
    padding-left: 4ch;
  }

  /* ├── the horizontal tick from the rail to the label. */
  .tree li::before {
    content: "";
    position: absolute;
    top: var(--rail-tick-y);
    left: 0;
    width: 3ch;
    border-top: var(--rail-width) solid var(--rail-color);
  }

  /* │ the vertical rail, spanning the full row. */
  .tree li::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-left: var(--rail-width) solid var(--rail-color);
  }

  /* └ the last row's rail stops at its tick. */
  .tree li:last-child::after {
    height: var(--rail-tick-y);
  }

  /* ┬ nested lists start one step in, and the first row's rail reaches back up
     to the parent row's tick. */
  .tree .tree {
    margin-left: -1ch;
  }

  .tree .tree > li:first-child::after {
    top: calc(-1 * var(--rail-join));
    height: calc(100% + var(--rail-join));
  }
</style>
