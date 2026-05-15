"use client";

import { useState } from "react";
import { Code, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { ScenarioChoiceCard } from "@/components/answers/ScenarioChoiceCard";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import { useShuffled } from "@/lib/useShuffled";
import type { Challenge } from "@/domain/challenge";
import QuestionBox from "@/components/challenge/QuestionBox";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function RiskScoringRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.riskScoring,
    examMode,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected(null);
  }

  const challenge = runner?.state.current;
  const risk = challenge?.modeData?.riskScoring;
  const riskOptions = useShuffled(risk?.options ?? []);

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Risk Scoring"
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

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "multiple-choice",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.riskScoring,
      submittedAt: Date.now(),
      selectedOptionId: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Risk Scoring"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      workspace={
        <Stack gap="lg">
          <QuestionBox
            question={
              risk?.question ??
              "Reason about exploitability and impact, then pick the severity that best fits."
            }
          />
          <Paper
            withBorder
            radius="lg"
            p="lg"
            className="bg-app-surface border-app-border"
          >
            <Stack gap="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Scenario
              </Text>
              <Text size="sm">{risk?.scenario ?? challenge?.summary}</Text>
              {risk?.cvssVector ? (
                <Text size="xs" c="dimmed">
                  CVSS vector: <Code>{risk.cvssVector}</Code>
                </Text>
              ) : null}
            </Stack>
          </Paper>
          <Text size="xs" c="dimmed">
            Consider AV, AC, PR, UI, scope, and CIA impact. Treat
            &quot;critical&quot; as remote, unauthenticated, low complexity,
            full impact.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Severity"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {risk ? (
            <SimpleGrid cols={1} spacing="xs">
              {riskOptions.map((option) => (
                <ScenarioChoiceCard
                  key={option.id}
                  option={{
                    id: option.id,
                    label: option.label,
                    correct: option.correct,
                    rationale: option.rationale,
                  }}
                  selected={selected === option.id}
                  onSelect={() => setSelected(option.id)}
                  disabled={state.stage === "feedback"}
                  reveal={state.stage === "feedback"}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text size="sm" c="dimmed">
              No risk scenario configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
