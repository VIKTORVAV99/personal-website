<script lang="ts">
  import TitleText from "$components/TitleText.svelte";
  import ProfileCard from "$components/ProfileCard.svelte";
  import SEO from "$lib/seo/components/SEO.svelte";
  import { SITE_URL } from "$lib/config";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<SEO
  title="Viktor Andersson | About"
  description="About Viktor Andersson, Software Engineer at Electricity Maps."
  canonicalURL={`${SITE_URL}/about`}
  structuredData={data.structuredData}
/>

<div class="page-container">
  <TitleText path="about" subtitle="Get to know me" />

  <ProfileCard />

  <section class="flex flex-col gap-8 w-full">
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl">Personal</h2>
      <p class="text-surface-300">
        I'm a Software Engineer by day and hobby coder and home automator by night.
        I enjoy building things that are useful both on a personal level but also for others, either professionally or as contributions to open source.
        When I'm not coding you can find me watching Sci-Fi and Formula 1, going on walks or just reading a nice Sci-Fi book. Yes I do love Sci-Fi.
      </p>
    </section>
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl">Professional</h2>
      <p class="text-surface-300">
        I work as a full-stack Software Engineer at Electricity Maps and work on everything from our data ingestion, processing pipelines and optimizing our frontend application (optimizations I do for fun).
        I have a passion for optimization, performance and automating things as much as possible.
        I prefer to do this in a way that is maintainable and lowers our technical debt, processing needs and data usage so it has as low impact on the environment as possible.
        Plus making things faster is just fun and provides a better user experience for our users, both internal and external.
        I have worked mostly with TypeScript and Python but am quick at adapting new languages and frameworks!
      </p>
    </section>
  </section>
</div>
