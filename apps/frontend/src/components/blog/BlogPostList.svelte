<script lang="ts">
  import type { BlogPostMeta } from "$lib/blog";
  import type { LucideIcon } from "@lucide/svelte";
  import ChevronLeft from "@lucide/svelte/icons/chevron-left";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import PostDate from "./PostDate.svelte";
  import PostTags from "./PostTags.svelte";

  interface Props {
    posts: BlogPostMeta[];
    currentPage: number;
    totalPages: number;
    baseHref?: string;
  }

  let { posts, currentPage, totalPages, baseHref = "/blog" }: Props = $props();

  const box = "inline-flex items-center justify-center size-8";

  const pageHref = (page: number): string =>
    page === 1 ? baseHref : `${baseHref}/page/${page}`;
</script>

{#snippet blogPostCard(post: BlogPostMeta, last: boolean)}
  <li>
    <article class="flex flex-col gap-2">
      <h2 class="text-2xl w-fit">
        <a href="/blog/{post.slug}" data-sveltekit-preload-data="tap" class="text-surface-100 hover:text-green-500 transition-colors">
          {post.title}
        </a>
      </h2>
      <PostDate date={post.date} readingTime={post.readingTime} />
      <p class="text-surface-300 leading-relaxed text-base md:text-lg max-w-3xl">
        {post.description}
      </p>
      <PostTags tags={post.tags} />
    </article>
    {#if !last}
      <hr class="border-surface-700 mt-4" />
    {/if}
  </li>
{/snippet}

{#snippet chevron(href: string | undefined, label: string, Icon: LucideIcon)}
  {#if href}
    <a {href} class={[box, 'text-surface-300 hover:text-green-500 transition-colors']} aria-label={label}>
      <Icon size={16} />
    </a>
  {:else}
    <span class={[box, 'text-surface-300 opacity-30 cursor-not-allowed']} aria-disabled="true">
      <Icon size={16} />
    </span>
  {/if}
{/snippet}

<section class="flex flex-col w-full">
  {#if posts.length === 0}
    <p class="text-surface-300 font-mono">No posts found.</p>
  {:else}
    <ul class="flex flex-col gap-8">
      {#each posts as post, index}
        {@render blogPostCard(post, index === posts.length - 1)}
      {/each}
    </ul>

    {#if totalPages > 1}
      <div class="flex justify-center mt-8">
        <nav class="flex items-center gap-2 font-mono text-sm" aria-label="Pagination">
          {@render chevron(currentPage > 1 ? pageHref(currentPage - 1) : undefined, "Previous page", ChevronLeft)}

          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
            {#if page === currentPage}
              <span class={[box, 'text-green-500']} aria-current="page">{page}</span>
            {:else}
              <a href={pageHref(page)} class={[box, 'text-surface-300 hover:text-green-500 transition-colors']}>{page}</a>
            {/if}
          {/each}

          {@render chevron(currentPage < totalPages ? pageHref(currentPage + 1) : undefined, "Next page", ChevronRight)}
        </nav>
      </div>
    {/if}
  {/if}
</section>
