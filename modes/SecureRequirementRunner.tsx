"use client";

import { useState } from "react";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { TextAnswerBox } from "@/components/answers/TextAnswerBox";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function SecureRequirementRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.secureRequirement,
    examMode,
  });

  const [text, setText] = useState("");
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setText("");
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Secure Requirement"
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
  const sr = challenge?.modeData?.secureRequirement;

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "text",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.secureRequirement,
      submittedAt: Date.now(),
      text,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Secure Requirement"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Rewrite the requirement so it is specific, testable, and outcome-focused."
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
                Context
              </Text>
              <Text size="sm">{sr?.context ?? challenge?.summary}</Text>
            </Stack>
          </Paper>
          <Paper
            withBorder
            radius="lg"
            p="md"
            style={{
              background: "var(--mantine-color-orange-light)",
              borderColor: "var(--mantine-color-orange-filled)",
            }}
          >
            <Stack gap="xs">
              <Text size="xs" tt="uppercase" fw={700}>
                Bad requirement
              </Text>
              <Title order={4}>{sr?.bad ?? challenge?.summary}</Title>
            </Stack>
          </Paper>
          {state.stage === "feedback" && sr?.goodExample ? (
            <Paper
              withBorder
              radius="lg"
              p="md"
              style={{
                background: "var(--mantine-color-lime-light)",
                borderColor: "var(--mantine-color-lime-filled)",
              }}
            >
              <Stack gap="xs">
                <Text size="xs" tt="uppercase" fw={700}>
                  Example of a strong rewrite
                </Text>
                <Text size="sm">{sr.goodExample}</Text>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Your rewrite"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={text.trim().split(/\s+/).length >= 6}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
          submitLabel="Grade my rewrite"
        >
          <TextAnswerBox
            value={text}
            onChange={setText}
            disabled={state.stage === "feedback"}
            placeholder="Personal data shall be encrypted in transit using TLS 1.2+ ..."
            hintRange={[2, 4]}
          />
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
