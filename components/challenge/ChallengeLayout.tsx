"use client";

import { SimpleGrid, Stack } from "@mantine/core";
import type { ReactNode } from "react";
import { ChallengeHeader } from "./ChallengeHeader";
import { ProgressHeader } from "./ProgressHeader";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenge: Challenge;
  prompt?: string;
  modeTitle: string;
  current: number;
  total: number;
  examMode?: boolean;
  /** Left column, usually CodeViewer / SelectableCodeLines / scenario text. */
  workspace: ReactNode;
  /** Right column with AnswerPanel + FeedbackCard. */
  answer: ReactNode;
}

/**
 * Standard two-pane layout used by every mode runner. The runner only
 * declares what goes in `workspace` and `answer`. The layout owns the
 * spacing, the responsive collapse, and the header chrome.
 */
export function ChallengeLayout({
  challenge,
  prompt,
  modeTitle,
  current,
  total,
  examMode,
  workspace,
  answer,
}: Props) {
  return (
    <Stack gap="lg" maw={1200} mx="auto" w="100%">
      <ProgressHeader
        current={current}
        total={total}
        modeTitle={modeTitle}
        examMode={examMode}
      />
      <ChallengeHeader challenge={challenge} prompt={prompt} />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <div>{workspace}</div>
        <div>{answer}</div>
      </SimpleGrid>
    </Stack>
  );
}
