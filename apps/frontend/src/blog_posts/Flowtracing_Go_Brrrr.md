---
title: "Flowtracing Go Brrrr - Making our pipeline faster, cheaper and greener with ARM"
date: 2026-07-20
last_updated: 2026-07-20
description: "How we made the flowtracing pipeline at Electricity Maps 30% faster with 46% less CPU time by switching to Google's ARM-based Axion (C4A) processors on Dataflow, and what it actually took to get there."
tags: ["Google Cloud", "Dataflow", "ARM", "Axion", "Performance", "Sustainability"]
---

**TL;DR:** We switched the flowtracing pipeline at Electricity Maps from x86 workers to ARM-based C4A machines powered by Google's Axion processors. Wall time went down 30%, CPU time went down 46%, the machines are about 25% cheaper and, according to Google, up to 60% more energy efficient. Faster, cheaper and greener! Funny thing is, we didn't even have to change the pipeline code to do it.

## What is flowtracing?

At [Electricity Maps](https://www.electricitymaps.com) we track how electricity flows across interconnected zones of the grid so we can figure out where the electricity you consume actually comes from, imports included. That's what powers the consumption-based values you see on the map, most noticeably carbon intensity. If you're curious about how all of this works in detail, the full [methodology is publicly documented](https://www.electricitymaps.com/data/methodology).

The flowtracing pipeline is the thing that does this math. It's an Apache Beam pipeline running on Google Cloud Dataflow that takes cleaned production and exchange data, aligns everything to minute-level grid states, runs the flowtracing algorithm for every minute and then aggregates it all back up again so that we can support any input granularity from 1 minute to 1 hour. It runs continuously on a rolling window, plus some scheduled reprocessing jobs that re-crunch longer historical windows as the data sources correct themselves to get the most accurate data possible.

The important part for this post: the hot path is CPU-bound numpy and scipy math, repeated for every single minute. And CPU-bound work is exactly where this processor change should make a difference.

## Why ARM?

This didn't start as a cost thing. It started with me just wanting to try it out, partly for efficiency but honestly mostly out of curiosity.

A colleague (fairly!) pointed out that our pipelines were already cheap to run and probably not worth optimizing. But that was never really the point. The new ARM processors are a bit faster and have a much lower carbon footprint, so if it was something we could do easily there was really no downside.

And for a company whose entire mission is decarbonizing electricity, running our own compute on more efficient processors just makes sense.

### So what is C4A?

C4A is Google Cloud's first VM series built on [Axion](https://cloud.google.com/blog/products/compute/introducing-googles-new-arm-based-cpu), their custom ARM CPU based on the Arm Neoverse V2 core. Google claims [up to 65% better price-performance](https://cloud.google.com/blog/products/compute/try-c4a-the-first-google-axion-processor) and [up to 60% better energy efficiency](https://cloud.google.com/blog/products/compute/introducing-googles-new-arm-based-cpu) than comparable x86 instances. Those are marketing numbers with unnamed baselines so we have to take them with a grain of salt but even if the magnitude is optimistic the directionality is exactly what we want for this.

The thing that was most interesting for our case was not the marketing numbers though, it was the fact that C4A has no hyperthreading, every vCPU is a full physical core. On most x86 machine types two vCPUs are actually sibling threads sharing one core's caches, so they end up fighting each other for it under heavy load. For cache-hungry math like ours, getting a whole core per vCPU is a real architectural advantage and not just a benchmark trick.

## Waiting for the pieces

When I first looked into ARM processors for our workflows in 2025 Dataflow didn't support C4A yet, so the idea went on the shelf. Then in February 2026 Google [announced](https://docs.cloud.google.com/dataflow/docs/release-notes) that Dataflow support for C4A was generally available. And then the fun began!

## The actual work

Like I said, the pipeline code itself didn't change at all. All the work was in the plumbing around it, and in cleaning up some tech debt that had quietly become a blocker.

### Step 0: the tech debt

Our Beam utilities package bundles the Cloud SQL Auth Proxy binary so the Dataflow workers can talk to the database (there are more modern alternatives now but changing was out of scope for the machine switch). It had binaries for macOS (both architectures) and Linux x86, but not Linux ARM, so any ARM worker would crash right at startup. The bundled version had also been in maintenance mode since 2023. So the fix was upgrading to v2 (with a new CLI syntax and everything) and adding the missing ARM binary. The one trade-off is that the v2 binaries are about twice the size, and we're now shipping one more of them, so the package grew from around 48 MB to 140 MB, not ideal but easily something we can live with.

### Step 1: multi-arch images

The worker image needed to exist for both architectures. We build our images with [Earthly](https://earthly.dev) for this pipeline so this was mostly configuring it to build for both platforms and push a multi-arch manifest. The wrinkles were all in CI:

- Our CI agents are x86, so building the ARM images requires QEMU emulation (one privileged docker run to register the handlers).
- We added a multi-arch smoke build to CI so every PR verifies that both architectures still build, instead of finding out at deploy time (already bit us in the ass on staging once).
- Some images deliberately stayed x86 only. The launcher images never run on the ARM workers, and Google's cloud-sdk image only ships x86 (it just crashes under QEMU).

### Step 2: flip the machine type

With multi-arch images in place, switching is just setting `machineType: c4a-standard-4` at the launch points. "Just" is doing a bit of work in that sentence though. As always it's not as straightforward as it should be...

- Dataflow's classic templates call the field `workerMachineType` but the Flex Template launch API calls it `machineType` (which is quite confusing tbh). Get that wrong and you get an HTTP 400 at launch time, after everything built and deployed just fine.
- If your pipeline sets its machine type in the pipeline options, be aware that Flex Templates can silently ignore it. The machine type has to come from the launch environment.
- While in there we also found (and fixed) an edge case where workers could boot the default Beam image without any of our dependencies installed. That one existed before the migration, it just became visible while testing. Which seems to happen a bit more than it should with legacy code!

## The results

First the staging benchmark that convinced us, then production.

In a staging comparison of the same reprocessing job, the CPU-heavy processing stage went from 12m18s on Intel workers to 4m27s on c4a-standard-4. That's about 2.8× faster! A later staging run also showed the cache-bound aggregation stage running about 2× faster than on N4. That's the whole-core-per-vCPU thing showing up in practice.

In production, for the continuously running pipeline:

|                 | Before (x86)      | After (C4A)        | Change       |
| --------------- | ----------------- | ------------------ | ------------ |
| Workers         | 2 × n4-standard-2 | 1 × c4a-standard-4 | same 4 vCPUs |
| Wall time / run | ~10 min           | ~7 min             | −30%         |
| CPU time / run  | ~26 min           | ~14 min            | −46%         |

Note the first row, both setups have exactly 4 vCPUs. So this is a true like-for-like comparison and the gains come from the processors themselves, not from throwing more hardware at the problem.

We actually halved the worker count too, which has its own quiet benefits (no traffic between workers and one less VM to start up).

The reason the production numbers don't scale linearly with that 2.8× stage speedup is the overhead of starting the pipeline (which runs before our processing kicks in) and saving the data to the database, which is I/O bound instead of CPU bound.

### Zooming out: a year of runs

A few minutes per run doesn't sound like much until you remember this pipeline runs every 15 minutes, around the clock. That's about 35,000 runs a year (not counting manual re-processing):

|                 | Per run | Per year                       |
| --------------- | ------- | ------------------------------ |
| Wall time saved | ~3 min  | ~1,750 hours (≈ 73 days)       |
| CPU time saved  | ~12 min | ~7,000 hours (≈ 0.8 CPU-years) |

Saving 12 CPU-minutes every 15 minutes is the same as permanently switching off 0.8 CPU cores that would otherwise be running 24/7. And that's just this one pipeline, every other pipeline we move adds to it.

### What about the money?

With 30% less wall time on machines that are about 25% cheaper per hour, each run costs roughly half of what it did before, but these were never the expensive line items to begin with.

The wins that actually mattered were the 3 minutes of latency per run, the 0.8 CPU-years of compute and the carbon footprint that comes with it. The halved bill is just a nice bonus.

## What's next

The obvious next step is moving more of our pipelines! Flowtracing was the perfect first candidate since it's CPU-bound and well benchmarked, but nothing about the recipe is specific to flowtracing.

Now that the multi-arch build setup exists and is verified on every PR, moving another pipeline is mostly a machine type change at its launch points. So the rest of our Dataflow fleet is next in line, and every pipeline we move gets the same cheaper and lower-carbon compute (no need to rush it though, the recipe keeps).

There are also code changes we could make to reshape the pipeline itself but those are diminishing returns at this point and would cost a lot more in time than the machine change does.

## Wrap up

I went into this thinking it would be a quick multi-arch image build and machine type swap and came out the other side having upgraded proxy binaries, reworked our CI builds and fixed edge cases. It was still worth it for the gains we got, but it just reinforces the fact that there is no _just_ in tech. There is always something that pops up that you have to take care of to make it work...

Lastly I would recommend everyone that is running VM workloads (in our case the Dataflow workers) to switch to ARM and C4A (or whatever comes after it), it's almost free in terms of workload and CI maintenance and there are substantial benefits that scale with how much compute you need.
