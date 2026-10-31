<script lang="ts">
  import { formatDate } from "#lib/helpers/formatDate.ts";

  interface Props {
    date: string;
    lastUpdated?: string;
    readingTime?: number;
  }

  let { date, lastUpdated, readingTime }: Props = $props();
  const showUpdated = $derived(lastUpdated && formatDate(lastUpdated) !== formatDate(date));
</script>

<div class="flex flex-wrap items-center gap-2 text-sm font-mono text-surface-300">
  <time datetime={date}>
    {formatDate(date)}
  </time>

  {#if showUpdated}
    <span class="opacity-40">|</span>
    <span>Updated: <time datetime={lastUpdated}>{formatDate(lastUpdated!)}</time></span>
  {/if}

  {#if readingTime}
    <span class="opacity-40">|</span>
    <span>{readingTime} min read</span>
  {/if}
</div>
