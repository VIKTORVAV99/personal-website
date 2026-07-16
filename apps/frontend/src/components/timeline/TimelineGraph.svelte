<script lang="ts">
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

  let inView = $state(false);

  const observeInView = (node: HTMLElement) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView = true;
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  };

  const maxGridRow = $derived(Math.max(...graphData.nodes.map((n) => n.gridRow)));

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

      return { d, color: branch.color };
    });
  });
</script>

<div
  class={[
    graphData.mode === 'compact' ? 'col-start-1' : 'col-start-2',
    'relative',
    inView && 'in-view'
  ]}
  style="grid-row: 1 / {graphData.totalGridRows + 1}; width: {graphData.graphWidth}px;"
  use:observeInView
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
      class="stroke-surface-600 graph-line"
      stroke-width={LINE_WIDTH}
      stroke-linecap="round"
      pathLength="1"
      style="animation-delay: 200ms;"
    />

    <!-- Branch paths (fork curve + vertical + merge curve combined) -->
    {#each branchPaths as bp, i}
      <path
        d={bp.d}
        fill="none"
        stroke={bp.color}
        stroke-width={LINE_WIDTH}
        stroke-linecap="round"
        class="graph-line"
        pathLength="1"
        style="animation-delay: {300 + i * 100}ms;"
      />
    {/each}

    <!-- Leader lines -->
    {#each graphData.leaderLines as leader, i}
      <polyline
        points={leader.points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={leader.color}
        stroke-width={1}
        stroke-dasharray="4 3"
        class="graph-fade"
        style="animation-delay: {600 + i * 50}ms;"
      />
    {/each}

    <!-- Commit nodes -->
    {#each graphData.nodes as node, i}
      {@const ny = nodeY(node.row, pxPerMonth)}
      <circle
        cx={graphData.laneX(node.lane)}
        cy={ny}
        r={NODE_RADIUS}
        fill={node.color}
        class="stroke-surface-950 stroke-3 graph-node"
        style="animation-delay: {600 + i * 50}ms;"
      />
    {/each}

    <!-- Trunk labels (year markers + life labels) -->
    {#each trunkLabels as label, i}
      {@const mx = graphData.laneX(0)}
      <g class="graph-fade" style="animation-delay: {800 + i * 50}ms;">
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

<style>
  /* SVG graph draw-in. The hidden initial states live inside the motion
     query so reduced-motion users see the finished graph immediately. */
  @media (prefers-reduced-motion: no-preference) {
    .graph-line {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
    }

    .in-view .graph-line {
      animation: draw-line 1.2s ease forwards;
    }

    .graph-node {
      transform-box: fill-box;
      transform-origin: center;
      transform: scale(0);
    }

    .in-view .graph-node {
      animation: pop-in 0.4s ease forwards;
    }

    .graph-fade {
      opacity: 0;
    }

    .in-view .graph-fade {
      animation: fade-in 0.5s ease forwards;
    }
  }

  /* Without JavaScript the IntersectionObserver never adds .in-view;
     show the finished graph instead of leaving it hidden. */
  @media (scripting: none) {
    .graph-line {
      stroke-dashoffset: 0;
    }

    .graph-node {
      transform: scale(1);
    }

    .graph-fade {
      opacity: 1;
    }
  }

  @keyframes draw-line {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes pop-in {
    to {
      transform: scale(1);
    }
  }

  @keyframes fade-in {
    to {
      opacity: 1;
    }
  }
</style>
