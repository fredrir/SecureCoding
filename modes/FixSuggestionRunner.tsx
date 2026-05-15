"use client";

import { useState } from "react";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { CodeViewer } from "@/components/challenge/CodeViewer";
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

export function FixSuggestionRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.fixSuggestion,
    examMode,
  });

  const [selectedFix, setSelectedFix] = useState<FixOptionId | null>(null);

  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelectedFix(null);
  }

  const challenge = runner?.state.current;
  const fixOptions = useShuffled(challenge?.fixOptions ?? []);

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Fix Suggestion"
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
  const language = challenge?.language ?? "plaintext";
  const code = challenge?.code ?? "";
  const intro = challenge?.modeData?.fixSuggestion?.intro;

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "fix-selection",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.fixSuggestion,
      submittedAt: Date.now(),
      selectedFixId: selectedFix,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Fix Suggestion"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt={
        intro ??
        "Read the vulnerable snippet. Pick the safest, root-cause patch. Some options are deliberately tempting."
      }
      workspace={
        <Stack gap="md">
          <CodeViewer code={code} language={language} filename={challenge?.filename} />
          <Text size="xs" c="dimmed">
            The vulnerability is already located. Your job is the fix.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Patch options"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selectedFix !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              Watch out for blacklist-only validation, weak hashes, client-only
              checks, or just catching the exception.
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
