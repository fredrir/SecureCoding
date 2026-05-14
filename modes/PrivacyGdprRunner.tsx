"use client";

import { useState } from "react";
import { Badge, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { ScenarioChoiceCard } from "@/components/answers/ScenarioChoiceCard";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function PrivacyGdprRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.privacyGdpr,
    examMode,
  });

  const [selected, setSelected] = useState<readonly string[]>([]);
  const [dpiaPick, setDpiaPick] = useState<"yes" | "no" | null>(null);
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected([]);
    setDpiaPick(null);
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Privacy / GDPR"
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
  const scenario = challenge?.modeData?.privacyScenario;

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
      mode: GAME_MODE_IDS.privacyGdpr,
      submittedAt: Date.now(),
      selectedOptionIds: selected,
    });
  };

  const expectedDpia = scenario?.dpiaRequired ? "yes" : "no";
  const dpiaShown = state.stage === "feedback" && dpiaPick !== null;

  return (
    <RunnerScaffold
      modeTitle="Privacy / GDPR"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Identify the principles violated and decide whether a DPIA is required."
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
                Feature scenario
              </Text>
              <Text size="sm">{scenario?.scenario ?? challenge?.summary}</Text>
            </Stack>
          </Paper>
          <Paper
            withBorder
            radius="lg"
            p="md"
            className="bg-app-surface border-app-border"
          >
            <Stack gap="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                DPIA required (Art. 35)?
              </Text>
              <Group gap="xs">
                {(["yes", "no"] as const).map((v) => {
                  const isCorrect = dpiaShown && v === expectedDpia;
                  const isWrong =
                    dpiaShown && dpiaPick === v && v !== expectedDpia;
                  return (
                    <Badge
                      key={v}
                      size="lg"
                      radius="sm"
                      onClick={() => {
                        if (state.stage === "feedback") return;
                        setDpiaPick(v);
                      }}
                      style={{
                        cursor:
                          state.stage === "feedback" ? "default" : "pointer",
                      }}
                      color={
                        isCorrect
                          ? "lime"
                          : isWrong
                            ? "magenta"
                            : dpiaPick === v
                              ? "ntnuBlue"
                              : "gray"
                      }
                      variant={
                        isCorrect || isWrong || dpiaPick === v
                          ? "filled"
                          : "light"
                      }
                    >
                      {v === "yes" ? "DPIA needed" : "No DPIA"}
                    </Badge>
                  );
                })}
              </Group>
              {state.stage === "feedback" && scenario ? (
                <Text size="xs" c="dimmed">
                  {scenario.dpiaRationale}
                </Text>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Violated principles"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected.length > 0 && dpiaPick !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {scenario ? (
            <SimpleGrid cols={1} spacing="xs">
              {scenario.principles.map((p) => (
                <ScenarioChoiceCard
                  key={p.id}
                  multi
                  option={{
                    id: p.id,
                    label: p.label,
                    correct: p.correct,
                    rationale: p.rationale,
                  }}
                  selected={selected.includes(p.id)}
                  onSelect={() => toggle(p.id)}
                  disabled={state.stage === "feedback"}
                  reveal={state.stage === "feedback"}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text size="sm" c="dimmed">
              No privacy scenario configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
