"use client";

import Link from "next/link";
import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useMistakes } from "@/state/useMistakes";
import { challengeRepository } from "@/data/challenges";
import { GAME_MODE_BY_ID } from "@/domain/gameMode";
import { TopicBadge } from "@/components/badges/TopicBadge";
import { DifficultyBadge } from "@/components/badges/DifficultyBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ShieldIcon } from "@/components/common/Icon";

export function ReviewClient() {
  const { items, remove } = useMistakes();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShieldIcon size={36} />}
        title="No mistakes saved"
        description="Submit a few challenges in any mode; the ones you miss will appear here for revisiting."
        action={
          <Button component={Link} href="/" variant="light">
            Back to dashboard
          </Button>
        }
      />
    );
  }

  // Most-recent first.
  const sorted = [...items].sort((a, b) => b.at - a.at);

  return (
    <Stack gap="lg" maw={900} mx="auto" w="100%">
      <Stack gap="xs">
        <Title order={1}>Mistake review</Title>
        <Text c="dimmed">
          Challenges you didn&apos;t solve correctly the last time around. Open
          a mode to retry from the dashboard.
        </Text>
      </Stack>

      <Stack gap="sm">
        {sorted.map((m) => {
          const challenge = challengeRepository.get(m.challengeId);
          const mode = GAME_MODE_BY_ID[m.mode];
          if (!challenge || !mode) return null;
          return (
            <Paper
              key={`${m.challengeId}-${m.mode}-${m.at}`}
              withBorder
              radius="lg"
              p="md"
              className="bg-app-surface border-app-border"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4} className="flex-1">
                  <Group gap={6}>
                    <TopicBadge topic={challenge.courseTopic} />
                    <DifficultyBadge difficulty={challenge.difficulty} />
                    <Text size="xs" c="dimmed">
                      via {mode.title}
                    </Text>
                  </Group>
                  <Text fw={600}>{challenge.title}</Text>
                  <Text size="sm" c="dimmed">
                    {challenge.summary}
                  </Text>
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    component={Link}
                    href={`/practice/${mode.slug}`}
                    variant="light"
                    size="xs"
                  >
                    Retry mode
                  </Button>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => remove(m.challengeId, m.mode)}
                  >
                    Forget
                  </Button>
                </Group>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
