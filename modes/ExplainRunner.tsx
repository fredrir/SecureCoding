"use client";

import { useState } from "react";
import { Paper, Stack, Text } from "@mantine/core";
import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { TextAnswerBox } from "@/components/answers/TextAnswerBox";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import type { Challenge } from "@/domain/challenge";
import QuestionBox from "@/components/challenge/QuestionBox";

interface Props {
  challenges: readonly Challenge[];
  examMode: boolean;
}

export function ExplainRunner({ challenges, examMode }: Props) {
  const runner = useChallengeRunner({
    challenges,
    mode: GAME_MODE_IDS.explainExam,
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
        modeTitle="Explain Like the Exam"
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

  const handleSubmit = () => {
    if (!challenge) return;
    controls.submit({
      kind: "text",
      challengeId: challenge.id,
      mode: GAME_MODE_IDS.explainExam,
      submittedAt: Date.now(),
      text,
    });
  };

  const question =
    challenge?.modeData?.explainPrompt ??
    `Explain ${challenge?.vulnerabilityType.toLowerCase()} based on the snippet below. ` +
      "Cover what is wrong, why it is exploitable, and how a correct fix works.";

  return (
    <RunnerScaffold
      modeTitle="Explain Like the Exam"
      examMode={examMode}
      total={state.total}
      index={state.index}
      current={challenge}
      feedback={state.feedback}
      stage={state.stage}
      attempts={state.attempts}
      workspace={
        <Stack gap="lg">
          <QuestionBox question={question} />

          {challenge?.code ? (
            <CodeViewer
              code={challenge.code}
              language={challenge.language ?? "plaintext"}
              filename={challenge.filename}
            />
          ) : null}
        </Stack>
      }
      answer={
        <AnswerPanel
          title="Your explanation"
          onSubmit={state.stage === "in-progress" ? handleSubmit : undefined}
          canSubmit={text.trim().split(/\s+/).length >= 5}
          onSkip={state.stage === "in-progress" ? controls.skip : undefined}
          submitLabel="Grade my answer"
        >
          <TextAnswerBox
            value={text}
            onChange={setText}
            disabled={state.stage === "feedback"}
          />
        </AnswerPanel>
      }
      onNext={controls.next}
      onRestart={controls.restart}
    />
  );
}
