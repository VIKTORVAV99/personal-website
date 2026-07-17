<script lang="ts">
  import { onMount } from "svelte";
  import ActivityLine from "$components/ActivityLine.svelte";
  import ContributionsSummary from "$components/ContributionsSummary.svelte";
  import Highlight from "$components/Highlight.svelte";
  import { api, type Contributions, type LatestActivity } from "$lib/api";

  let activity = $state<LatestActivity | null>(null);
  let contributions = $state<Contributions>(null);

  onMount(() => {
    const controller = new AbortController();
    api.github.activity
      .$get(undefined, { init: { signal: controller.signal } })
      .then(async (response) => {
        if (response.status === 200) {
          const body = await response.json();
          activity = body.log[0] ?? null;
          contributions = body.contributions;
        }
      })
      .catch(() => {
        // Backend unreachable — the widget just stays hidden.
      });
    return () => controller.abort();
  });

  const showContributions = $derived(
    contributions !== null && contributions.publicCount + contributions.privateCount > 0,
  );
</script>

{#if activity || showContributions}
  <div class="font-mono text-lg flex flex-col w-full leading-tight" aria-label="Latest GitHub activity">
    <span
      ><Highlight>$</Highlight>
      <a href="/activity" class="hover:underline underline-offset-4">gh activity -1</a></span
    >
    {#if activity}
      <ActivityLine {activity} />
    {/if}
    {#if contributions !== null && showContributions}
      <ContributionsSummary
        publicCount={contributions.publicCount}
        privateCount={contributions.privateCount}
      />
    {/if}
  </div>
{/if}
