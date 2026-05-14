"use client";

import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { Feedback, FeedbackHighlight } from "@/domain/feedback";
import { CheckIcon, CrossIcon, TargetIcon } from "@/components/common/Icon";

interface Props {
  feedback: Feedback;
  reference?: string;
}

const TONE_COLOR: Record<NonNullable<FeedbackHighlight["tone"]>, string> = {
  positive: "lime",
  negative: "magenta",
  neutral: "gray",
};

export function FeedbackCard({ feedback, reference }: Props) {
  const accent =
    feedback.verdict === "correct"
      ? "lime"
      : feedback.verdict === "partial"
        ? "orange"
        : "magenta";
  const Icon =
    feedback.verdict === "correct"
      ? CheckIcon
      : feedback.verdict === "partial"
        ? TargetIcon
        : CrossIcon;

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      style={{
        background: `var(--mantine-color-${accent}-light)`,
        borderColor: `var(--mantine-color-${accent}-filled)`,
      }}
    >
      <Stack gap="sm">
        <Group gap="sm" wrap="nowrap">
          <span
            className="inline-flex p-2 rounded-xl bg-app-surface"
            style={{ color: `var(--mantine-color-${accent}-filled)` }}
          >
            <Icon size={20} />
          </span>
          <div>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">
              {feedback.verdict === "correct"
                ? "Correct"
                : feedback.verdict === "partial"
                  ? "Partial credit"
                  : "Try again"}
              {" · "}
              {Math.round(feedback.score * 100)}%
            </Text>
            <Title order={4} mt={2}>
              {feedback.headline}
            </Title>
          </div>
        </Group>

        {feedback.highlights && feedback.highlights.length > 0 ? (
          <Group gap="xs" wrap="wrap">
            {feedback.highlights.map((h, i) => (
              <Badge
                key={i}
                variant="light"
                color={TONE_COLOR[h.tone]}
                size="sm"
                radius="sm"
              >
                {h.label}
                {h.value ? `: ${h.value}` : ""}
              </Badge>
            ))}
          </Group>
        ) : null}

        <Text size="sm" className="whitespace-pre-wrap">
          {feedback.detail}
        </Text>

        {reference ? (
          <Text size="xs" c="dimmed">
            {reference}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
