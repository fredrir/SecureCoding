"use client";

import { useMemo, useState } from "react";
import { Paper, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { MultipleChoiceOptions } from "@/components/answers/MultipleChoiceOptions";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { MultiCodeViewer } from "@/components/challenge/MultiCodeViewer";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";
import { mulberry32, shuffle } from "@/lib/random";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
  /** Cap the run length; sprint mode is short on purpose. */
  questionLimit?: number;
}

export function MultipleChoiceSprintRunner({
  challenges,
  examMode,
  questionLimit = 20,
}: Props) {
  // Restrict to challenges that have a multiple-choice question.
  const eligible = useMemo(
    () => challenges.filter((c) => c.modeData?.multipleChoice),
    [challenges],
  );

  // Stable per-mount shuffle so refresh gives a different sprint without
  // re-shuffling between renders.
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const sprintChallenges = useMemo(() => {
    const rng = mulberry32(seed);
    return shuffle(eligible, rng).slice(0, questionLimit);
  }, [eligible, seed, questionLimit]);

  const runner = useChallengeRunner({
    challenges: sprintChallenges,
    mode: GAME_MODE_IDS.multipleChoiceSprint,
    examMode,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected(null);
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Multiple Choice Sprint"
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
  const mc = challenge?.modeData?.multipleChoice;

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "multiple-choice",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.multipleChoiceSprint,
      submittedAt: Date.now(),
      selectedOptionId: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Multiple Choice Sprint"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt={mc?.question}
      workspace={
        <Stack gap="md">
          {challenge?.codeSnippets ? (
            <MultiCodeViewer snippets={challenge.codeSnippets} />
          ) : challenge?.code ? (
            <CodeViewer
              code={challenge.code}
              language={challenge.language ?? "plaintext"}
              filename={challenge.filename}
            />
          ) : (
            <Paper
              withBorder
              radius="lg"
              p="lg"
              className="bg-app-surface border-app-border"
            >
              <Stack gap="md">
                <div className="text-xs uppercase font-bold text-app-fg-muted tracking-wider">
                  Question
                </div>
                <Text size="sm">{challenge?.summary}</Text>
              </Stack>
            </Paper>
          )}
          <Text size="xs" c="dimmed">
            No penalty for wrong answers, pick the most justified option.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Pick one"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {mc ? (
            <MultipleChoiceOptions
              options={mc.options}
              value={selected}
              onChange={setSelected}
              disabled={state.stage === "feedback"}
              reveal={state.stage === "feedback"}
            />
          ) : (
            <Text size="sm" c="dimmed">
              No question on this challenge.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
