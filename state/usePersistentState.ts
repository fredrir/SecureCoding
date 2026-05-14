"use client";

import { useCallback, useSyncExternalStore } from "react";
import { clearKey, readJson, subscribe, writeJson } from "./storage";

/**
 * `useState`-shaped hook backed by `localStorage`, implemented with
 * `useSyncExternalStore` so SSR returns the fallback and the client picks up
 * the persisted value with no in-effect setState. Cross-component writes are
 * propagated via the storage subscriber, so two components reading the same
 * key stay in sync without prop drilling.
 */
export function usePersistentState<T>(
  name: string,
  fallback: T,
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const value = useSyncExternalStore<T>(
    (listener) => subscribe(name, listener),
    () => readJson(name, fallback),
    () => fallback,
  );

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = readJson(name, fallback);
      const resolved =
        typeof next === "function"
          ? (next as (p: T) => T)(current)
          : next;
      writeJson(name, resolved);
    },
    // Fallback is intentionally omitted because callers usually pass an inline
    // literal that would otherwise change identity each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name],
  );

  const reset = useCallback(() => {
    clearKey(name);
    writeJson(name, fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return [value, update, reset];
}
