"use client";

import { useState } from "react";
import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { TextAnswerBox } from "@/components/answers/TextAnswerBox";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";
import type { CodeLanguage } from "@/domain/language";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function AiReviewRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.aiReview,
    examMode,
  });

  const [verdict, setVerdict] = useState<"safe" | "unsafe" | null>(null);
  const [reason, setReason] = useState("");
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setVerdict(null);
    setReason("");
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="AI Code Assistant Review"
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
  const ai = challenge?.modeData?.aiReview;
  const language = (ai?.language ??
    challenge?.language ??
    "plaintext") as CodeLanguage;

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "ai-review",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.aiReview,
      submittedAt: Date.now(),
      verdict,
      reason,
    });
  };

  const expected = ai?.safe ? "safe" : "unsafe";

  return (
    <RunnerScaffold
      modeTitle="AI Code Assistant Review"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Review the AI assistant's patch. Is it actually safe? Explain your reasoning."
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
                Original vulnerable code
              </Text>
              {ai?.originalCode ? (
                <CodeViewer
                  code={ai.originalCode}
                  language={language}
                  filename={challenge?.filename}
                />
              ) : (
                <Text size="sm">No baseline provided.</Text>
              )}
            </Stack>
          </Paper>
          <Paper
            withBorder
            radius="lg"
            p="md"
            style={{
              background: "var(--mantine-color-purple-light)",
              borderColor: "var(--mantine-color-purple-filled)",
            }}
          >
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="xs" tt="uppercase" fw={700}>
                  AI patch
                </Text>
                <Badge color="purple" variant="filled" size="sm" radius="sm">
                  Trust, but verify
                </Badge>
              </Group>
              {ai?.aiClaim ? (
                <Text size="sm" fs="italic" c="dimmed">
                  &quot;{ai.aiClaim}&quot;
                </Text>
              ) : null}
              {ai?.aiPatch ? (
                <CodeViewer
                  code={ai.aiPatch}
                  language={language}
                  filename={challenge?.filename}
                />
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Your review"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={verdict !== null && reason.trim().split(/\s+/).length >= 6}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
          submitLabel="Submit review"
        >
          <Stack gap="sm">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              Is the AI patch safe?
            </Text>
            <Group gap="xs">
              {(["safe", "unsafe"] as const).map((v) => {
                const isShownCorrect =
                  state.stage === "feedback" && v === expected;
                const isShownWrong =
                  state.stage === "feedback" && verdict === v && v !== expected;
                return (
                  <Badge
                    key={v}
                    size="lg"
                    radius="sm"
                    onClick={() => {
                      if (state.stage === "feedback") return;
                      setVerdict(v);
                    }}
                    style={{
                      cursor:
                        state.stage === "feedback" ? "default" : "pointer",
                    }}
                    color={
                      isShownCorrect
                        ? "lime"
                        : isShownWrong
                          ? "magenta"
                          : verdict === v
                            ? "ntnuBlue"
                            : "gray"
                    }
                    variant={
                      isShownCorrect || isShownWrong || verdict === v
                        ? "filled"
                        : "light"
                    }
                  >
                    {v === "safe" ? "Safe to ship" : "Not actually safe"}
                  </Badge>
                );
              })}
            </Group>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mt="xs">
              Why?
            </Text>
            <TextAnswerBox
              value={reason}
              onChange={setReason}
              disabled={state.stage === "feedback"}
              placeholder="The patch only protects integer columns; string sinks still concatenate user input..."
              hintRange={[1, 3]}
            />
          </Stack>
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
