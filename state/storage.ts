"use client";

/**
 * Tiny typed wrapper around `localStorage`. Lives in its own file so the rest
 * of the state layer never has to think about JSON, SSR, or quota errors.
 */

const NAMESPACE = "sct/v1";

function key(name: string): string {
  return `${NAMESPACE}/${name}`;
}

/**
 * Snapshot cache for `useSyncExternalStore`. The cache holds the most recent
 * raw JSON string we saw together with its parsed value so that repeated reads
 * return a referentially-stable object. React 19 treats reference equality of
 * the snapshot as "no change" and otherwise bails out with an infinite-loop
 * warning.
 */
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

export function readJson<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key(name));
  } catch {
    return fallback;
  }
  const cached = snapshotCache.get(name);
  if (cached && cached.raw === raw) return cached.value as T;
  if (raw === null) {
    snapshotCache.set(name, { raw, value: fallback });
    return fallback;
  }
  try {
    const value = JSON.parse(raw) as T;
    snapshotCache.set(name, { raw, value });
    return value;
  } catch {
    snapshotCache.set(name, { raw, value: fallback });
    return fallback;
  }
}

function notify(name: string): void {
  // Defer to a microtask so cross-component subscribers don't `setState`
  // during the writer's render/commit phase (which React 19 warns about).
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent("sct:storage", { detail: { key: name } }),
    );
  });
}

export function writeJson<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(key(name), raw);
    snapshotCache.set(name, { raw, value });
    notify(name);
  } catch {
    // Quota or private mode: silently ignore; in-memory state still works.
  }
}

export function clearKey(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(name));
    snapshotCache.delete(name);
    notify(name);
  } catch {
    // ignore
  }
}

export function subscribe(name: string, listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ key: string }>).detail;
    if (detail?.key === name) listener();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === key(name)) {
      // Invalidate cache so the next read sees the cross-tab change.
      snapshotCache.delete(name);
      listener();
    }
  };
  window.addEventListener("sct:storage", handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("sct:storage", handler);
    window.removeEventListener("storage", onStorage);
  };
}
