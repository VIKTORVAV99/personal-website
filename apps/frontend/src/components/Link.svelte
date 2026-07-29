<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  let {
    href,
    mono = false,
    children,
    class: className = "",
    rel: relProp,
    target: targetProp,
    ...restProps
  }: HTMLAnchorAttributes & { mono?: boolean; children: Snippet } = $props();

  const isExternal = $derived(
    href?.startsWith("http://") || href?.startsWith("https://"),
  );

  const target = $derived(targetProp ?? (isExternal ? "_blank" : undefined));

  // Merged, not left to restProps, which spreads last and would replace it.
  const rel = $derived(
    [(isExternal || target === "_blank") && "noopener noreferrer", relProp]
      .filter(Boolean)
      .join(" ") || undefined,
  );
</script>

<a
  {href}
  {target}
  {rel}
  class={[
    'inline-flex items-center gap-0.5 hover:text-accent transition-colors',
    mono && 'font-mono',
    className,
  ]}
  {...restProps}
>
  {@render children()}
  {#if isExternal}
    <ArrowUpRight size={14} />
  {/if}
</a>
