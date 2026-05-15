"use client";

import { useState } from "react";
import { Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { ScenarioChoiceCard } from "@/components/answers/ScenarioChoiceCard";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import { useShuffled } from "@/lib/useShuffled";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function AttackTraceRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.attackTrace,
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
  const attack = challenge?.modeData?.attackTrace;
  const attackOptions = useShuffled(attack?.options ?? []);

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Attack Trace"
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
      mode: GAME_MODE_IDS.attackTrace,
      submittedAt: Date.now(),
      selectedOptionId: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Attack Trace"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt={
        attack?.question ??
        "Which exploit payload or request sequence triggers this vulnerability?"
      }
      workspace={
        <Stack gap="md">
          {challenge?.code ? (
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
              <Text size="sm">{challenge?.summary}</Text>
            </Paper>
          )}
          <Text size="xs" c="dimmed">
            Think black-box. Only one option both reaches the sink and triggers
            the bug.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Pick the exploit"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {attack ? (
            <SimpleGrid cols={1} spacing="xs">
              {attackOptions.map((option) => (
                <ScenarioChoiceCard
                  key={option.id}
                  option={{
                    id: option.id,
                    label: option.label,
                    code: option.request,
                    correct: option.correct,
                    rationale: option.rationale,
                  }}
                  language="http"
                  selected={selected === option.id}
                  onSelect={() => setSelected(option.id)}
                  disabled={state.stage === "feedback"}
                  reveal={state.stage === "feedback"}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text size="sm" c="dimmed">
              No attack trace configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
