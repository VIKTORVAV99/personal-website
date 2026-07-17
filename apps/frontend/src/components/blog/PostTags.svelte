<script lang="ts">
  import { slugifyTag } from "$lib/blog";

  interface Props {
    tags?: string[];
  }

  let { tags }: Props = $props();
</script>

{#if tags?.length}
  <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-mono">
    {#each tags as tag}
      <a href="/blog/tag/{slugifyTag(tag)}" class="text-surface-300 hover:text-accent transition-colors">
        <span class="text-accent">#</span>{tag}
      </a>
    {/each}
  </div>
{/if}
