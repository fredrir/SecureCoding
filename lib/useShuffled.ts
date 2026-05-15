"use client";

import { useMemo } from "react";

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Returns a shuffled copy of `items`, stable for the lifetime of the current
 * question. Re-shuffles whenever `keyOf(item)` values change.
 *
 * Pass a custom `keyOf` when IDs alone are not unique across questions (e.g.
 * multiple-choice options that always use ids a/b/c/d).
 */
export function useShuffled<T extends { id: string }>(
  items: readonly T[],
  keyOf: (item: T) => string = (item) => item.id,
): readonly T[] {
  const key = items.map(keyOf).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => shuffle(items), [key]);
}
