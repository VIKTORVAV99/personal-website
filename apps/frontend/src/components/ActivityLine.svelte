<script lang="ts">
  import Link from "$components/Link.svelte";
  import type { LatestActivity } from "$lib/api";
  import { relativeTime } from "$lib/helpers/relativeTime";

  let { activity }: { activity: LatestActivity } = $props();

  const verbs: Record<LatestActivity["type"], string> = {
    "pr-merged": "landed a PR in",
    "issue-opened": "opened an issue in",
  };
</script>

<span class="text-surface-400"
  >{verbs[activity.type]}
  {#if activity.private}a private repo{:else}<Link href={activity.url} class="hover:underline underline-offset-4">{activity.repo}</Link>{#if activity.message}: “{activity.message}”{/if}{/if}
  <span class="whitespace-nowrap">({relativeTime(activity.timestamp)})</span></span
>
