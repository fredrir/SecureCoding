"use client";

import { useState } from "react";
import { Paper, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function ReportBuilderRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.reportBuilder,
    examMode,
  });

  const [fields, setFields] = useState<Record<string, string>>({});
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setFields({});
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Report Builder"
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
  const template = challenge?.modeData?.reportBuilder;

  const update = (id: string, value: string) => {
    setFields((cur) => ({ ...cur, [id]: value }));
  };

  const allFilled =
    template !== undefined &&
    template.fields.every(
      (f) =>
        (fields[f.id] ?? "").trim().split(/\s+/).filter(Boolean).length >= 3,
    );

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "report-builder",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.reportBuilder,
      submittedAt: Date.now(),
      fields,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Report Builder"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      prompt="Author a full vulnerability writeup. Each field is graded against expected concepts."
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
            Treat this as a real bug report. Cite the WSTG and Top 10 if you
            know them, and include exploit steps.
          </Text>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Writeup"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={allFilled}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
          submitLabel="Grade my report"
        >
          {template ? (
            <Stack gap="sm">
              {template.fields.map((field) => (
                <div key={field.id}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
                    {field.label}
                  </Text>
                  {field.multiline ? (
                    <Textarea
                      value={fields[field.id] ?? ""}
                      onChange={(e) => update(field.id, e.currentTarget.value)}
                      placeholder={field.placeholder}
                      disabled={state.stage === "feedback"}
                      autosize
                      minRows={3}
                      maxRows={8}
                      styles={{
                        input: {
                          background: "var(--app-surface-muted)",
                          borderColor: "var(--app-border-strong)",
                          fontSize: 14,
                          lineHeight: 1.55,
                        },
                      }}
                    />
                  ) : (
                    <TextInput
                      value={fields[field.id] ?? ""}
                      onChange={(e) => update(field.id, e.currentTarget.value)}
                      placeholder={field.placeholder}
                      disabled={state.stage === "feedback"}
                      styles={{
                        input: {
                          background: "var(--app-surface-muted)",
                          borderColor: "var(--app-border-strong)",
                        },
                      }}
                    />
                  )}
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed">
              No report template configured.
            </Text>
          )}
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
