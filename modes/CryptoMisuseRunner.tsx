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

export function CryptoMisuseRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.cryptoMisuse,
    examMode,
  });

  const [selected, setSelected] = useState<readonly string[]>([]);
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected([]);
  }

  const challenge = runner?.state.current;
  const crypto = challenge?.modeData?.cryptoMisuse;
  const cryptoOptions = useShuffled(crypto?.options ?? []);

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Crypto Misuse"
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
      mode: GAME_MODE_IDS.cryptoMisuse,
      submittedAt: Date.now(),
      selectedOptionIds: selected,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Crypto Misuse"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt={
        crypto?.question ??
        "Select every cryptographic misuse present in this snippet."
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
            Multiple flaws may apply: weak mode, reused nonce/key, insecure RNG,
            wrong primitive, missing integrity, hardcoded secrets.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Pick every misuse"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={selected.length > 0}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
        >
          {crypto ? (
            <SimpleGrid cols={1} spacing="xs">
              {cryptoOptions.map((option) => (
                <ScenarioChoiceCard
                  key={option.id}
                  multi
                  option={{
                    id: option.id,
                    label: option.label,
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
              No crypto misuse scenario configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
