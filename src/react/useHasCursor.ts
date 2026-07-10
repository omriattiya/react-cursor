import { useSyncExternalStore } from "react";

const QUERY = "(pointer: fine)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  // Environments without matchMedia (older jsdom) are assumed to have a cursor
  if (typeof window.matchMedia !== "function") return true;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/** True when the device has a fine pointer (mouse/trackpad); false on touch-only devices. */
export function useHasCursor(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
