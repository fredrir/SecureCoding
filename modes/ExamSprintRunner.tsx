"use client";

import { useState } from "react";
import { Badge, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { MultipleChoiceOptions } from "@/components/answers/MultipleChoiceOptions";
import { TextAnswerBox } from "@/components/answers/TextAnswerBox";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { MultiCodeViewer } from "@/components/challenge/MultiCodeViewer";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function ExamSprintRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.examSprint,
    examMode,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected(null);
    setText("");
  }

  if (!runner) {
    return (
      <RunnerScaffold
        modeTitle="Exam Bank"
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
  const isTextMode = mc?.modifiedFromOpenQuestion === true;
  const questionText =
    mc?.question ?? challenge?.modeData?.explainPrompt ?? challenge?.summary;

  const handleMcSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "multiple-choice",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.examSprint,
      submittedAt: Date.now(),
      selectedOptionId: selected,
    });
  };

  const handleTextSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "text",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.examSprint,
      submittedAt: Date.now(),
      text,
    });
  };

  return (
    <RunnerScaffold
      modeTitle="Exam Bank"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      workspace={
        <Stack gap="md">
          {questionText ? (
            <Paper
              withBorder
              radius="lg"
              p="lg"
              className="bg-app-surface border-app-border"
            >
              <Text size="sm" fw={500} style={{ whiteSpace: "pre-wrap" }}>
                {questionText}
              </Text>
            </Paper>
          ) : null}
          {challenge?.codeSnippets ? (
            <MultiCodeViewer snippets={challenge.codeSnippets} />
          ) : challenge?.code ? (
            <CodeViewer
              code={challenge.code}
              language={challenge.language ?? "plaintext"}
              filename={challenge.filename}
            />
          ) : null}
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              {isTextMode
                ? "Open question from a past exam. Write a concise answer."
                : "Multiple choice from a past exam. Pick the best answer."}
            </Text>
            {mc?.modifiedFromOpenQuestion ? (
              <Tooltip
                withArrow
                openDelay={250}
                label="This was originally an open-answer exam task. The question text is from the exam, but the multiple-choice answers were added for practice."
              >
                <Badge size="xs" variant="light" color="orange">
                  Modified answers
                </Badge>
              </Tooltip>
            ) : null}
          </Group>
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Pick one"
          onSubmit={state.stage === "in-progress" ? handleMcSubmit : undefined}
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
