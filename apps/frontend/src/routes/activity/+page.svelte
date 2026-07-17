<script lang="ts">
  import { onMount } from "svelte";
  import ActivityLine from "$components/ActivityLine.svelte";
  import ContributionsSummary from "$components/ContributionsSummary.svelte";
  import Highlight from "$components/Highlight.svelte";
  import TitleText from "$components/TitleText.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
  import { SITE_URL } from "$lib/config";
  import { api, type ActivityResponse } from "$lib/api";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let response = $state<ActivityResponse | null>(null);
  let failed = $state(false);

  onMount(() => {
    const controller = new AbortController();
    api.github.activity
      .$get(undefined, { init: { signal: controller.signal } })
      .then(async (res) => {
        if (res.status === 200) {
          response = await res.json();
        } else {
          failed = true;
        }
      })
      .catch(() => {
        failed = true;
      });
    return () => controller.abort();
  });

  const contributions = $derived(response?.contributions ?? null);
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
    <span><Highlight>$</Highlight> gh activity -n {response?.log.length ?? 15}</span>
    <div class="flex flex-col gap-2">
      {#if failed}
        <span class="text-surface-500">fatal: unable to read from remote</span>
      {:else if response === null}
        <span class="text-surface-500">loading…</span>
      {:else if response.log.length === 0}
        <span class="text-surface-500">no recent activity</span>
      {:else}
        {#each response.log as activity}
          <ActivityLine {activity} />
        {/each}
      {/if}
      {#if contributions !== null && contributions.publicCount + contributions.privateCount > 0}
        <ContributionsSummary
          publicCount={contributions.publicCount}
          privateCount={contributions.privateCount}
        />
      {/if}
    </div>
    <noscript><span class="text-surface-500">JavaScript is required to load live GitHub activity.</span></noscript>
  </section>
</div>
