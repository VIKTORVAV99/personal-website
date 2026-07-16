<script lang="ts">
  import {
    FALLBACK_HERO_IMAGE,
    FALLBACK_HERO_IMAGE_HEIGHT,
    FALLBACK_HERO_IMAGE_WIDTH,
  } from "$lib/config";
  import type { StructuredDataSchema } from "..";
  import { toJsonLd } from "..";

  let {
    title,
    description,
    canonicalURL,
    prevURL,
    nextURL,
    structuredData,
    noIndex = false,
    image = FALLBACK_HERO_IMAGE,
    imageWidth = FALLBACK_HERO_IMAGE_WIDTH,
    imageHeight = FALLBACK_HERO_IMAGE_HEIGHT,
    imageAlt = "viktor.andersson.tech",
    type = "website",
    publishedTime,
    modifiedTime,
    tags,
  }: {
    title: string;
    description: string;
    canonicalURL?: string;
    prevURL?: string;
    nextURL?: string;
    structuredData?: StructuredDataSchema | StructuredDataSchema[];
    noIndex?: boolean;
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
    imageAlt?: string;
    type?: "website" | "article" | "profile" | string;
    /** ISO 8601 date; emitted as article:published_time when type is "article" */
    publishedTime?: string;
    /** ISO 8601 date; emitted as article:modified_time when type is "article" */
    modifiedTime?: string;
    /** Emitted as article:tag when type is "article" */
    tags?: string[];
  } = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  {#if canonicalURL}
    <link rel="canonical" href={canonicalURL} />
    <meta property="og:url" content={canonicalURL} />
  {/if}
  {#if prevURL}<link rel="prev" href={prevURL} />{/if}
  {#if nextURL}<link rel="next" href={nextURL} />{/if}

  {#if structuredData}
    {@html `<script type="application/ld+json">${toJsonLd(structuredData)}<` + `/script>`}
  {/if}

  <meta property="og:site_name" content="Viktor Andersson" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />

  {#if type === "article"}
    {#if publishedTime}<meta property="article:published_time" content={publishedTime} />{/if}
    {#if modifiedTime}<meta property="article:modified_time" content={modifiedTime} />{/if}
    {#each tags ?? [] as tag}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  {#if image}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={image} />
    <meta name="twitter:image:alt" content={imageAlt} />
    <meta property="og:image" content={image} />
    <meta property="og:image:width" content={String(imageWidth)} />
    <meta property="og:image:height" content={String(imageHeight)} />
    <meta property="og:image:alt" content={imageAlt} />
  {:else}
    <meta name="twitter:card" content="summary" />
  {/if}

  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />

  {#if noIndex}
    <meta name="robots" content="noindex, nofollow" />
  {:else}
    <meta name="robots" content="index, follow" />
  {/if}
</svelte:head>
