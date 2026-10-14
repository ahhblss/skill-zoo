import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia?.(query);
  if (!media) return () => {};
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia?.(query).matches ?? false;
}

// Framer Motion's hook snapshots the initial preference; this subscription also
// responds when the OS preference changes while the app is open.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
