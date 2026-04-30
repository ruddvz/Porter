"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function ensureInterval() {
  if (intervalId != null) return;
  intervalId = setInterval(() => {
    listeners.forEach((l) => l());
  }, 1000);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureInterval();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return Date.now();
}

/** Single shared 1s clock for the tree so relative times stay correct without one timer per row. */
export function useSharedNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
