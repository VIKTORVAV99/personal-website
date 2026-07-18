<script lang="ts">
  import { SITE_URL } from "$lib/config";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <link rel="alternate" type="application/rss+xml" title="Viktor Andersson" href={`${SITE_URL}/rss.xml`} />
</svelte:head>

{@render children()}
