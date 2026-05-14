"use client";

import { Group, Paper, Progress, RingProgress, Stack, Text, Title } from "@mantine/core";
import type { SessionSummary } from "@/domain/scoring";

interface Props {
  summary: SessionSummary;
}

export function ScoreSummary({ summary }: Props) {
  const accuracyPct = Math.round(summary.accuracy * 100);
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-app-surface border-app-border"
    >
      <Group align="center" wrap="nowrap" gap="xl">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: accuracyPct, color: "ntnuBlue" }]}
          label={
            <Text ta="center" fw={700} size="lg">
              {accuracyPct}%
            </Text>
          }
        />
        <Stack gap={4} className="flex-1">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Run summary
          </Text>
          <Title order={3}>
            {summary.correct} correct · {summary.partial} partial · {summary.incorrect} wrong
          </Title>
          <Text size="sm" c="dimmed">
            Across {summary.total} {summary.total === 1 ? "challenge" : "challenges"}.
          </Text>
          <Group mt="sm" gap="xs">
            <Bar label="Correct" value={summary.correct} total={summary.total} color="lime" />
            <Bar label="Partial" value={summary.partial} total={summary.total} color="orange" />
            <Bar label="Wrong" value={summary.incorrect} total={summary.total} color="magenta" />
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}

function Bar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <Stack gap={2} className="flex-1 min-w-20">
      <Group justify="space-between">
        <Text size="xs" fw={600}>
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          {value}
        </Text>
      </Group>
      <Progress value={pct} color={color} size="xs" radius="xl" />
    </Stack>
  );
}
