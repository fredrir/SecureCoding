"use client";

import { useState } from "react";
import { Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { ScenarioChoiceCard } from "@/components/answers/ScenarioChoiceCard";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";

const STRIDE_NAMES: Record<string, string> = {
  S: "S · Spoofing",
  T: "T · Tampering",
  R: "R · Repudiation",
  I: "I · Information Disclosure",
  D: "D · Denial of Service",
  E: "E · Elevation of Privilege",
};

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function StrideRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.strideThreat,
    examMode,
  });

  const [selected, setSelected] = useState<readonly string[]>([]);
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected([]);
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="STRIDE Threat Modeling"
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
  const stride = challenge?.modeData?.stride;

  const toggle = (id: string) => {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  };

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "multi-select",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.strideThreat,
      submittedAt: Date.now(),
      selectedOptionIds: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="STRIDE Threat Modeling"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Read the scenario, then pick every STRIDE category that materially applies."
      workspace={
        <Stack gap="md">
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
              <Text size="sm">{stride?.scenario ?? challenge?.summary}</Text>
              {stride?.diagram ? (
                <pre className="code-block">{stride.diagram}</pre>
              ) : null}
            </Stack>
          </Paper>
          <Text size="xs" c="dimmed">
            STRIDE = Spoofing, Tampering, Repudiation, Information disclosure,
            Denial of service, Elevation of privilege.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Applicable STRIDE categories"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected.length > 0}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {stride ? (
            <SimpleGrid cols={1} spacing="xs">
              {stride.options.map((option) => (
                <ScenarioChoiceCard
                  key={option.id}
                  multi
                  option={{
                    id: option.id,
                    label: `${STRIDE_NAMES[option.id] ?? option.id}  -  ${option.label}`,
                    correct: option.correct,
                    rationale: option.rationale,
                  }}
                  selected={selected.includes(option.id)}
                  onSelect={() => toggle(option.id)}
                  disabled={state.stage === "feedback"}
                  reveal={state.stage === "feedback"}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text size="sm" c="dimmed">
              No STRIDE scenario configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
