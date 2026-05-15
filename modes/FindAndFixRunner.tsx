"use client";

import { useState } from "react";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { SelectableCodeLines } from "@/components/challenge/SelectableCodeLines";
import { FixOptionCard } from "@/components/answers/FixOptionCard";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import { useShuffled } from "@/lib/useShuffled";
import type { Challenge } from "@/domain/challenge";
import type { FixOptionId } from "@/domain/ids";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function FindAndFixRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.findAndFix,
    examMode,
  });

  const [selectedLines, setSelectedLines] = useState<readonly number[]>([]);
  const [selectedFix, setSelectedFix] = useState<FixOptionId | null>(null);

  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelectedLines([]);
    setSelectedFix(null);
  }

  const reveal =
    runner && runner.state.stage === "feedback"
      ? { correct: runner.state.current?.vulnerableLines ?? [] }
      : undefined;

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Find & Fix"
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
  const fixOptions = useShuffled(challenge?.fixOptions ?? []);

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "find-and-fix",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.findAndFix,
      submittedAt: Date.now(),
      selectedLines,
      selectedFixId: selectedFix,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Find & Fix"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Step 1: mark the vulnerable line(s). Step 2: pick the fix you'd ship."
      workspace={
        <SelectableCodeLines
          code={code}
          language={language}
          selected={selectedLines}
          onChange={setSelectedLines}
          reveal={reveal}
          disabled={state.stage === "feedback"}
          filename={challenge?.filename}
        />
      }
      answer={
        <AnswerPanel
          title="Patch options"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selectedLines.length > 0 && selectedFix !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              Pick the fix that addresses the root cause. Watch for tempting but
              shallow patches.
            </Text>
            <SimpleGrid cols={1} spacing="xs">
              {fixOptions.map((option) => (
                <FixOptionCard
                  key={option.id}
                  option={option}
                  language={language}
                  selected={selectedFix === option.id}
                  onSelect={() => setSelectedFix(option.id)}
                  disabled={state.stage === "feedback"}
                  reveal={
                    state.stage === "feedback" && challenge.correctFixId
                      ? { correctId: challenge.correctFixId }
                      : undefined
                  }
                />
              ))}
            </SimpleGrid>
          </Stack>
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
