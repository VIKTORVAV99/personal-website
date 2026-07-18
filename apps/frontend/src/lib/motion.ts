import { prefersReducedMotion } from "svelte/motion";

/** Collapse a transition's params to an instant (duration 0) under reduced motion. */
export const motion = <T>(params: T) => (prefersReducedMotion.current ? { duration: 0 } : params);
