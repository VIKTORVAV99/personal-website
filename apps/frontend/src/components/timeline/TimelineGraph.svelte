<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { motion } from "$lib/motion";
  import { linear } from "svelte/easing";
  import { draw, fade, scale } from "svelte/transition";
  import { LINE_WIDTH, NODE_RADIUS } from "./constants";
  import {
    type GraphData,
    nodeY,
    monthToRow,
    toAbsoluteMonth,
    entryEndAbsMonth,
  } from "./types";

  let {
    graphData,
    yearMarkers,
    pxPerMonth,
    totalHeight,
  }: {
    graphData: GraphData;
    yearMarkers: number[];
    pxPerMonth: number;
    totalHeight: number;
  } = $props();

  // Draw in on arrival via afterNavigate (replays on each navigation). Elements
  // are held out of the DOM until then so their intro transitions run.
  let entered = $state(false);
  afterNavigate(() => {
    entered = true;
  });

  const maxGridRow = $derived(Math.max(...graphData.nodes.map((n) => n.gridRow)));

  // Stagger bottom-up: rows nearer the bottom (maxGridRow) start sooner.
  const msPerRow = 2;
  const rowDelay = (row: number) => (maxGridRow - row) * msPerRow;

  // Scale branch durations to the trunk's px/ms rate for a consistent draw speed.
  const trunkPxLen = $derived(Math.abs(nodeY(maxGridRow, pxPerMonth) - nodeY(1, pxPerMonth)));
  const trunkDuration = $derived(maxGridRow * msPerRow);
  const pxPerMs = $derived(trunkPxLen / trunkDuration);

  const drawIn = (bp: { verticalPx: number; forkRow: number }) =>
    motion({ duration: Math.max(400, bp.verticalPx / pxPerMs), delay: rowDelay(bp.forkRow), easing: linear });
  const scaleIn = (row: number) => motion({ duration: 300, delay: rowDelay(row), start: 0 });
  const fadeIn = (y: number) =>
    motion({ duration: 300, delay: (1 - y / totalHeight) * maxGridRow * msPerRow });

  const trunkLabels = $derived.by(() => {
    const labels: Array<{ y: number; text: string }> = [];
    for (const year of yearMarkers) {
      labels.push({
        y: nodeY(monthToRow(toAbsoluteMonth(year, 1)), pxPerMonth),
        text: String(year),
      });
    }
    for (const node of graphData.nodes) {
      if (node.entry.type === "life" && !node.entry.showDates) {
        labels.push({
          y: nodeY(node.row, pxPerMonth),
          text: node.entry.title,
        });
      }
    }
    return labels;
  });

  const branchPaths = $derived.by(() => {
    // Build tick y-positions per branch
    const ticksByBranch = new Map<string, number[]>();
    const byBranch = new Map<string, (typeof graphData.nodes)[number][]>();
    for (const node of graphData.nodes) {
      if (!byBranch.has(node.branchId)) byBranch.set(node.branchId, []);
      byBranch.get(node.branchId)!.push(node);
    }
    for (const [branchId, nodes] of byBranch) {
      if (nodes.length < 2) continue;
      const sorted = [...nodes].sort((a, b) => b.row - a.row);
      ticksByBranch.set(
        branchId,
        sorted
          .slice(0, -1)
          .map((n) => nodeY(monthToRow(entryEndAbsMonth(n.entry)), pxPerMonth)),
      );
    }

    return graphData.branches.map((branch) => {
      const mainX = graphData.laneX(0);
      const bx = graphData.laneX(branch.lane);
      const forkY = nodeY(branch.forkRow, pxPerMonth);
      const endY = nodeY(branch.endRow, pxPerMonth);
      const ch = branch.curveOffset * pxPerMonth;
      const { isOngoing } = branch;

      let d =
        `M ${mainX} ${forkY + ch}` +
        ` C ${mainX} ${forkY + 0.4 * ch}, ${bx} ${forkY + 0.6 * ch}, ${bx} ${forkY}`;

      // Interleave tick segments (sorted descending y, bottom to top)
      for (const ty of ticksByBranch.get(branch.id) ?? []) {
        d += ` L ${bx} ${ty} L ${bx - 5} ${ty} L ${bx + 5} ${ty} L ${bx} ${ty}`;
      }

      d += ` L ${bx} ${endY}`;

      if (!isOngoing) {
        d +=
          ` C ${bx} ${endY - 0.6 * ch}, ${mainX} ${endY - 0.4 * ch}, ${mainX} ${endY - ch}`;
      }

      const verticalPx = Math.abs(forkY + ch - (isOngoing ? endY : endY - ch));
      return { d, color: branch.color, forkRow: branch.forkRow, verticalPx };
    });
  });

  // Held empty until `entered`, so the {#each} items are "added" and animate in.
  const visibleBranches = $derived(entered ? branchPaths : []);
  const visibleNodes = $derived(entered ? graphData.nodes : []);
  const visibleLeaders = $derived(entered ? graphData.leaderLines : []);
  const visibleLabels = $derived(entered ? trunkLabels : []);
</script>

<div
  class={[graphData.mode === 'compact' ? 'col-start-1' : 'col-start-2', 'relative']}
  style="grid-row: 1 / {graphData.totalGridRows + 1}; width: {graphData.graphWidth}px;"
>
  <!-- Decorative: the accordion cards carry all of the graph's information -->
  <svg
    width={graphData.graphWidth}
    height={totalHeight}
    viewBox="0 0 {graphData.graphWidth} {totalHeight}"
    class="block"
    aria-hidden="true"
  >
    <!-- Main branch line -->
    <line
      x1={graphData.laneX(0)}
      y1={nodeY(maxGridRow, pxPerMonth)}
      x2={graphData.laneX(0)}
      y2={nodeY(1, pxPerMonth)}
      class="stroke-surface-600"
      stroke-width={LINE_WIDTH}
      stroke-linecap="round"
    />

    <!-- Branch paths (fork curve + vertical + merge curve combined) -->
    {#each visibleBranches as bp}
      <path
        d={bp.d}
        fill="none"
        stroke={bp.color}
        stroke-width={LINE_WIDTH}
        stroke-linecap="round"
        in:draw={drawIn(bp)}
      />
    {/each}

    <!-- Leader lines -->
    {#each visibleLeaders as leader}
      <polyline
        points={leader.points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={leader.color}
        stroke-width={1}
        stroke-dasharray="4 3"
        in:fade={fadeIn(leader.points[0].y)}
      />
    {/each}

    <!-- Commit nodes -->
    {#each visibleNodes as node}
      {@const ny = nodeY(node.row, pxPerMonth)}
      <circle
        cx={graphData.laneX(node.lane)}
        cy={ny}
        r={NODE_RADIUS}
        fill={node.color}
        class="transform-fill origin-center stroke-surface-950 stroke-3"
        in:scale={scaleIn(node.row)}
      />
    {/each}

    <!-- Trunk labels (year markers + life labels) -->
    {#each visibleLabels as label}
      {@const mx = graphData.laneX(0)}
      <g in:fade={fadeIn(label.y)}>
        <rect
          x={mx - 16}
          y={label.y - 8}
          width="32"
          height="16"
          rx="3"
          class="fill-surface-950"
        />
        <text
          x={mx}
          y={label.y + 4}
          text-anchor="middle"
          class="fill-surface-500 font-semibold tracking-[0.05em]"
          style="font-size: 0.5625rem;">{label.text}</text
        >
      </g>
    {/each}
  </svg>
</div>
