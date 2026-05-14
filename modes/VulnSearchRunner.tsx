"use client";

import { useState } from "react";
import { Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { SelectableCodeLines } from "@/components/challenge/SelectableCodeLines";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function VulnSearchRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.vulnSearch,
    examMode,
  });

  const [selected, setSelected] = useState<readonly number[]>([]);
  const currentId = runner?.state.current?.id;
  // Reset per-challenge selection when the active challenge changes.
  // React docs pattern: derive from previous render and bail to a clean state.
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected([]);
  }

  const reveal =
    runner && runner.state.stage === "feedback"
      ? { correct: runner.state.current?.vulnerableLines ?? [] }
      : undefined;

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Vulnerability Searching"
        examMode={examMode}
        total={0}
        index={0}
        current={undefined}
        feedback={null}
        stage="in-progress"
        attempts={[]}
        workspace={null}
        answer={null}
        onNext={() => {}}
        onRestart={() => {}}
      />
    );
  }

  const { state, controls } = runner;
  const challenge = state.current;
  const code = challenge?.code ?? "";
  const language = challenge?.language ?? "plaintext";

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "line-selection",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.vulnSearch,
      submittedAt: Date.now(),
      selectedLines: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Vulnerability Searching"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Click on every line you believe is vulnerable, then check your answer."
      workspace={
        <SelectableCodeLines
          code={code}
          language={language}
          selected={selected}
          onChange={setSelected}
          reveal={reveal}
          disabled={state.stage === "feedback"}
          filename={challenge?.filename}
        />
      }
      answer={
        <AnswerPanel
          title="Selected lines"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected.length > 0}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {selected.length === 0
                ? "No lines selected yet."
                : `Lines ${selected.join(", ")} flagged.`}
            </Text>
            <Text size="xs" c="dimmed">
              You can pick multiple lines. Look for the place where untrusted
              data enters the system, where it&apos;s used unsafely, or where a
              missing check enables abuse.
            </Text>
          </Stack>
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
