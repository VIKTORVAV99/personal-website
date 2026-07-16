<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  let {
    icon: Icon,
    title,
    description,
    buttonContent,
    href,
  }: {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonContent: Snippet;
    href: string;
  } = $props();
</script>

<div class="flex w-full flex-1 flex-col items-center justify-center gap-6 text-center">
  <div
    class="flex h-24 w-24 items-center justify-center rounded-full bg-error-900/20 text-error-500"
  >
    <Icon size={48} />
  </div>

  <div class="flex flex-col gap-2">
    <h1>
      {title}
    </h1>
    <p class="text-surface-300">
      {description}
    </p>
  </div>

  <a
    {href}
    class="rounded-full font-mono backdrop-blur-sm bg-surface-800/80 px-6 py-3 text-sm text-surface-50 transition-colors hover:bg-surface-700/80 [text-decoration:none]!"
  >
    {@render buttonContent()}
  </a>
</div>
