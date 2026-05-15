"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
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

export function WstgMappingRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.wstgMapping,
    examMode,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected(null);
    setTipOpen(false);
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="WSTG Mapping"
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
  const mapping = challenge?.modeData?.wstgMapping;
  const mappingOptions = useShuffled(mapping?.options ?? []);

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "multiple-choice",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.wstgMapping,
      submittedAt: Date.now(),
      selectedOptionId: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="WSTG Mapping"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt={
        mapping?.question ??
        "Map this finding to the correct OWASP WSTG category."
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
          {mapping?.top10Hint ? (
            tipOpen ? (
              <Alert
                color="ntnuBlue"
                variant="light"
                radius="md"
                title="Tip"
                withCloseButton
                onClose={() => setTipOpen(false)}
              >
                <Text size="sm">
                  Aligns with OWASP Top 10 category{" "}
                  <Text span fw={600}>
                    {mapping.top10Hint}
                  </Text>
                  .
                </Text>
              </Alert>
            ) : (
              <Group justify="flex-start">
                <Button
                  size="xs"
                  variant="subtle"
                  color="ntnuBlue"
                  onClick={() => setTipOpen(true)}
                >
                  Show tip
                </Button>
              </Group>
            )
          ) : null}
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Pick the WSTG code"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected !== null}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {mapping ? (
            <SimpleGrid cols={1} spacing="xs">
              {mappingOptions.map((option) => (
                <ScenarioChoiceCard
                  key={option.id}
                  option={{
                    id: option.id,
                    label: `${option.code} · ${option.label}`,
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
              No mapping configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
