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

	let { entries }: { entries: TimelineEntry[] } = $props();

	const COMPACT_QUERY = '(max-width: 640px)';

	// Resolve the mode during init (not in the after-paint effect) so mobile
	// clients don't hydrate a desktop layout and then reflow to compact.
	let mode = $state<TimelineMode>(
		typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches
			? 'compact'
			: 'desktop'
	);

	$effect(() => {
		const mql = window.matchMedia(COMPACT_QUERY);
		const update = () => {
			mode = mql.matches ? 'compact' : 'desktop';
		};
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	});

	let measuredHeightsByEntry = $state(new Map<TimelineEntry, number>());

	const setMeasuredHeight = (entry: TimelineEntry, height: number) => {
		if (measuredHeightsByEntry.get(entry) === height) return;
		const next = new Map(measuredHeightsByEntry);
		next.set(entry, height);
		measuredHeightsByEntry = next;
	};

	const observeCardHeight = (element: HTMLElement, entry: TimelineEntry) => {
		if (typeof ResizeObserver === 'undefined') return;

		let currentEntry = entry;
		const measure = () => {
			setMeasuredHeight(currentEntry, element.offsetHeight);
		};

		const observer = new ResizeObserver(measure);
		observer.observe(element);
		measure();

		return {
			update(nextEntry: TimelineEntry) {
				currentEntry = nextEntry;
				measure();
			},
			destroy() {
				observer.disconnect();
			}
		};
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
					use:observeCardHeight={node.entry}
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
