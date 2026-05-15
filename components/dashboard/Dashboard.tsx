"use client";

import { useMemo } from "react";
import { Stack, Title, Text } from "@mantine/core";
import { GameGrid } from "./GameGrid";
import { FiltersBar } from "./FiltersBar";
import { ProgressDisplay } from "./ProgressDisplay";
import { GAME_MODES } from "@/domain/gameMode";
import { useSettings } from "@/state/useSettings";
import { challengeRepository } from "@/data/challenges";

function matchesYearFilter(
  sourceLabel: string | undefined,
  yearFilter: readonly string[],
): boolean {
  if (yearFilter.length === 0) return true;
  const year = sourceLabel?.match(/\b(\d{4})\b/)?.[1];
  if (!year) return true; // non-exam challenges are unaffected
  return yearFilter.includes(year);
}

export function Dashboard() {
  const { settings } = useSettings();

  // Per-mode counts after filters: only count challenges that match the
  // current topic & difficulty selection. Empty filter sets mean "all".
  const countsByMode = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mode of GAME_MODES) {
      const filtered = challengeRepository.filter(
        (c) =>
          c.supportedModes.includes(mode.id) &&
          (settings.topicFilter.length === 0 ||
            settings.topicFilter.includes(c.courseTopic)) &&
          (settings.difficultyFilter.length === 0 ||
            settings.difficultyFilter.includes(c.difficulty)) &&
          matchesYearFilter(c.sourceLabel, settings.examYearFilter),
      );
      counts[mode.id] = filtered.length;
    }
    return counts;
  }, [
    settings.topicFilter,
    settings.difficultyFilter,
    settings.examYearFilter,
  ]);

  const filtersActive =
    settings.topicFilter.length > 0 ||
    settings.difficultyFilter.length > 0 ||
    settings.examYearFilter.length > 0;

  return (
    <Stack gap="xl" maw={1200} mx="auto" w="100%">
      <Stack gap="xs">
        <Title order={1} className="tracking-tight">
          Practice Ground for TDT4237
        </Title>
        <Text c="dimmed" size="md" maw={680}>
          Spot vulnerable lines, choose patches, write exam-style explanations,
          and sprint through closed-ended questions. Progress is stored locally.
        </Text>
      </Stack>

      <ProgressDisplay />

      <FiltersBar />

      <GameGrid
        modes={GAME_MODES}
        countsByMode={countsByMode}
        filtersActive={filtersActive}
      />
    </Stack>
  );
}
