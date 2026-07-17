<script lang="ts">
  import ActivityLine from "$components/ActivityLine.svelte";
  import ContributionsSummary from "$components/ContributionsSummary.svelte";
  import Highlight from "$components/Highlight.svelte";
  import TitleText from "$components/TitleText.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
  import { SITE_URL } from "$lib/config";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  // Server-rendered: null means the backend was unreachable at request time.
  const activity = $derived(data.activity);
</script>

<SEO
  title="Viktor Andersson | Activity"
  description={data.description}
  canonicalURL={`${SITE_URL}/activity`}
  structuredData={data.structuredData}
/>

<div class="page-container">
  <TitleText path="activity" subtitle={data.description} />
  <section class="font-mono text-lg flex flex-col gap-4 w-full leading-tight" aria-label="Latest GitHub activity">
    <span
      ><Highlight>$</Highlight> gh activity{activity?.log.length ? ` -n ${activity.log.length}` : ""}</span
    >
    <div class="flex flex-col gap-2">
      {#if activity === null}
        <span class="text-surface-500">fatal: unable to read from remote</span>
      {:else if activity.log.length === 0}
        <span class="text-surface-500">no recent activity</span>
      {:else}
        {#each activity.log as entry}
          <ActivityLine activity={entry} />
        {/each}
      {/if}
      <ContributionsSummary contributions={activity?.contributions ?? null} />
    </div>
  </section>
</div>
