<script lang="ts">
  import Timeline from "$components/Timeline.svelte";
  import TitleText from "$components/TitleText.svelte";
  import { timelineEntries } from "$data/metadata";
  import SEO from "$lib/seo/components/SEO.svelte";
  import { SITE_URL } from "$lib/config";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<SEO
  title="Viktor Andersson | History"
  description={data.description}
  canonicalURL={`${SITE_URL}/history`}
  type="profile"
  structuredData={data.structuredData}
/>

<div class="page-container">
  <TitleText path="history" heading="History" subtitle={data.description} />
  <section class="flex flex-col gap-4 items-center w-full">
    <Timeline entries={timelineEntries} />
  </section>
</div>
