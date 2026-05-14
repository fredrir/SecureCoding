"use client";

import { usePersistentState } from "./usePersistentState";
import type { CourseTopic } from "@/domain/topic";
import type { Difficulty } from "@/domain/difficulty";

export interface AppSettings {
  examMode: boolean;
  topicFilter: readonly CourseTopic[]; // empty = all
  difficultyFilter: readonly Difficulty[]; // empty = all
  examYearFilter: readonly string[]; // empty = all; e.g. ["2023", "2025"]
}

const DEFAULTS: AppSettings = {
  examMode: false,
  topicFilter: [],
  difficultyFilter: [],
  examYearFilter: [],
};

export function useSettings() {
  const [rawSettings, setSettings, reset] = usePersistentState<AppSettings>(
    "settings",
    DEFAULTS,
  );

  // Merge with DEFAULTS so that fields added after a user's first visit are
  // never undefined (localStorage may hold an older shape).
  const settings: AppSettings = { ...DEFAULTS, ...rawSettings };

  return {
    settings,
    setExamMode: (examMode: boolean) =>
      setSettings((s) => ({ ...s, examMode })),
    setTopicFilter: (topicFilter: readonly CourseTopic[]) =>
      setSettings((s) => ({ ...s, topicFilter })),
    setDifficultyFilter: (difficultyFilter: readonly Difficulty[]) =>
      setSettings((s) => ({ ...s, difficultyFilter })),
    setExamYearFilter: (examYearFilter: readonly string[]) =>
      setSettings((s) => ({ ...s, examYearFilter })),
    reset,
  };
}
