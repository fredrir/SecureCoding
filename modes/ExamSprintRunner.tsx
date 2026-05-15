"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Badge,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";

import { AnswerPanel } from "@/components/challenge/AnswerPanel";
import { MultipleChoiceOptions } from "@/components/answers/MultipleChoiceOptions";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import { MultiCodeViewer } from "@/components/challenge/MultiCodeViewer";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { useChallengeRunner } from "./useChallengeRunner";
import { RunnerScaffold } from "./RunnerScaffold";
import { GAME_MODE_IDS } from "@/domain/gameMode";

import {
  CASE_DESCRIPTIONS,
  CASE_TITLES,
  caseYearFromSourceLabel,
  isCaseSourceLabel,
} from "@/data/cases";
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
  const currentId = runner?.state.current?.id;
  const [prevId, setPrevId] = useState(currentId);
  if (prevId !== currentId) {
    setPrevId(currentId);
    setSelected(null);
  }

  if (!runner) {
    return (
      <Stack gap="sm">
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
      </Stack>
    );
  }

  const { state, controls } = runner;
  const challenge = state.current;
  const mc = challenge?.modeData?.multipleChoice;
  const isTextMode = mc?.modifiedFromOpenQuestion === true;
  const questionText =
    mc?.question ?? challenge?.modeData?.explainPrompt ?? challenge?.summary;

  const caseYear = caseYearFromSourceLabel(challenge?.sourceLabel);
  const caseDescription = caseYear ? CASE_DESCRIPTIONS[caseYear] : undefined;
  const caseTitle = caseYear ? CASE_TITLES[caseYear] : undefined;
  const isCase = isCaseSourceLabel(challenge?.sourceLabel);

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

  return (
    <Stack gap="sm">
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
            {caseDescription ? (
              <CaseDescriptionPanel
                description={caseDescription}
                title={caseTitle}
                isCase={isCase}
                caseYear={caseYear}
              />
            ) : null}
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
                  label="This was originally an open-answer exam task. The question has been changed to a multiple-choice format, for better practice."
                >
                  <Badge size="xs" variant="light" color="orange">
                    Modified question
                  </Badge>
                </Tooltip>
              ) : null}
            </Group>
          </Stack>
        }
        answer={
          <AnswerPanel
            title="Pick one"
            onSubmit={
              state.stage === "in-progress" ? handleMcSubmit : undefined
            }
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
    </Stack>
  );
}

function CaseDescriptionPanel({
  description,
  title,
  isCase,
  caseYear,
}: {
  description: string;
  title: string | undefined;
  isCase: boolean;
  caseYear: string | undefined;
}) {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Paper withBorder radius="lg" p={0} className="overflow-hidden">
      <UnstyledButton
        py="lg"
        onClick={toggle}
        className="flex w-full transition-colors items-center hover:bg-app-accent-soft/60 justify-between px-4 py-3"
      >
        <Group gap="xs" className="border-t-0">
          <span className="text-sm font-medium  text-app-fg">
            {title ?? "Case Description"}
          </span>
        </Group>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{
            transition: "transform 200ms",
            transform: opened ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--app-fg-subtle)",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </UnstyledButton>
      <Collapse expanded={opened}>
        <div className="px-4 pb-4">
          <MarkdownRenderer>{description}</MarkdownRenderer>
        </div>
      </Collapse>
    </Paper>
  );
}
