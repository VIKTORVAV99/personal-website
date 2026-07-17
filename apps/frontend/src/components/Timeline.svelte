<script lang="ts">
	import type { TimelineEntry } from '$interfaces/timelineEntry';
	import type { TimelineMode } from './timeline/types';
	import TimelineGraph from './timeline/TimelineGraph.svelte';
	import TimelineAccordionCard from './timeline/TimelineAccordionCard.svelte';
	import {
		ORIGIN_YEAR,
		CURRENT_YEAR,
		PX_PER_MONTH,
		GRAPH_TOP_PADDING_PX
	} from './timeline/constants';
	import { buildGraphData } from './timeline/buildGraphData';
	import { MediaQuery, SvelteMap } from 'svelte/reactivity';
	import type { Attachment } from 'svelte/attachments';

	let { entries }: { entries: TimelineEntry[] } = $props();

	// Resolved synchronously on first client read, so mobile avoids hydrating the
	// desktop layout then reflowing. SSR uses the fallback (false -> desktop).
	const compact = new MediaQuery('max-width: 640px');
	const mode = $derived<TimelineMode>(compact.current ? 'compact' : 'desktop');

	const measuredHeightsByEntry = new SvelteMap<TimelineEntry, number>();

	const setMeasuredHeight = (entry: TimelineEntry, height: number) => {
		if (measuredHeightsByEntry.get(entry) === height) return;
		measuredHeightsByEntry.set(entry, height);
	};

	// Attachment factory: re-runs (tears down + re-observes) whenever the bound
	// entry changes, replacing the action's manual update() lifecycle.
	const observeCardHeight =
		(entry: TimelineEntry): Attachment<HTMLElement> =>
		(element) => {
			if (typeof ResizeObserver === 'undefined') return;

			const measure = () => setMeasuredHeight(entry, element.offsetHeight);
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			measure();

			return () => observer.disconnect();
		};

	const yearMarkers = $derived.by(() => {
		const markers: number[] = [];
		const first = Math.ceil(ORIGIN_YEAR / 5) * 5;
		for (let y = first; y <= CURRENT_YEAR; y += 5) {
			markers.push(y);
		}
		return markers;
	});

	const graphData = $derived.by(() =>
		buildGraphData(entries, PX_PER_MONTH, measuredHeightsByEntry, mode)
	);

	const totalHeight = $derived(graphData.totalGridRows * PX_PER_MONTH + GRAPH_TOP_PADDING_PX);

	const isCompact = $derived(mode === 'compact');
</script>

<div class="w-full max-w-5xl mx-auto">
	<div
		class={['grid w-full', isCompact ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr_auto_1fr]']}
		style="grid-template-rows: repeat({graphData.totalGridRows}, {PX_PER_MONTH}px);"
	>
		<!-- Graph -->
		<TimelineGraph {graphData} {yearMarkers} pxPerMonth={PX_PER_MONTH} {totalHeight} />

		<!-- Cards -->
		{#each graphData.nodes as node}
			{#if !(node.entry.type === 'life' && !node.entry.showDates)}
				{@const isLeft = node.side === 'left'}
				<div
					class={[
						isLeft ? 'col-start-1' : isCompact ? 'col-start-2' : 'col-start-3',
						'flex self-start',
						isLeft ? 'justify-end' : 'justify-start'
					]}
					style="grid-row: {node.gridRow} / {node.gridRowEnd};"
					{@attach observeCardHeight(node.entry)}
				>
					<TimelineAccordionCard
						entry={node.entry}
						color={node.color}
						accentSide={isLeft ? 'right' : 'left'}
						defaultOpen={!isCompact}
					/>
				</div>
			{/if}
		{/each}
	</div>
</div>
