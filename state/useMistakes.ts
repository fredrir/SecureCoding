"use client";

import { usePersistentState } from "./usePersistentState";
import type { ChallengeId, GameModeId } from "@/domain/ids";

export interface MistakeRecord {
  challengeId: ChallengeId;
  mode: GameModeId;
  at: number;
  note?: string;
}

interface MistakesState {
  items: MistakeRecord[];
}

const DEFAULTS: MistakesState = { items: [] };
const MAX = 200;

export function useMistakes() {
  const [state, setState, reset] = usePersistentState<MistakesState>(
    "mistakes",
    DEFAULTS,
  );

  const add = (record: MistakeRecord) =>
    setState((prev) => {
      // Deduplicate per (challenge, mode), keeping the most recent.
      const filtered = prev.items.filter(
        (m) => !(m.challengeId === record.challengeId && m.mode === record.mode),
      );
      const next = [...filtered, record];
      if (next.length > MAX) next.splice(0, next.length - MAX);
      return { items: next };
    });

  const remove = (challengeId: ChallengeId, mode: GameModeId) =>
    setState((prev) => ({
      items: prev.items.filter(
        (m) => !(m.challengeId === challengeId && m.mode === mode),
      ),
    }));

  return { items: state.items, add, remove, reset };
}
