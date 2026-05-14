"use client";

import {
  Button,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { FlameIcon, TargetIcon } from "@/components/common/Icon";
import { useProgress } from "@/state/useProgress";
import { useStreak } from "@/state/useStreak";
import Link from "next/link";

function resetAllProgress() {
  try {
    window.localStorage.clear();
  } catch {
    // ignore quota/private-mode errors
  }
  window.location.reload();
}

export function ProgressDisplay() {
  const { totals, accuracy } = useProgress();
  const { current, best } = useStreak();
  const accuracyPct = Math.round(accuracy * 100);

  const confirmReset = () =>
    modals.openConfirmModal({
      title: "Reset all progress?",
      centered: true,
      children: (
        <Text size="sm">
          This will clear your attempts, streak, mistakes, and preferences from
          this browser. This cannot be undone.
        </Text>
      ),
      labels: { confirm: "Reset everything", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: resetAllProgress,
    });

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className=" text-white border-transparent bg-app-accent"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text size="xs" tt="uppercase" fw={700} className="opacity-80">
              Your training
            </Text>
            <Title order={2} mt={4} c="white" fw={700}>
              {totals.total === 0
                ? "Start your first run"
                : `${totals.total} attempts, ${totals.correct} solved`}
            </Title>
          </div>
          <Group gap="lg" wrap="nowrap">
            <Stat
              icon={<FlameIcon size={20} />}
              label="Streak"
              value={`${current}d`}
            />
            <Stat
              icon={<TargetIcon size={20} />}
              label="Best"
              value={`${best}d`}
            />
          </Group>
        </Group>

        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" tt="uppercase" fw={700} className="opacity-85">
              Accuracy
            </Text>
            <Text size="sm" fw={600}>
              {accuracyPct}%
            </Text>
          </Group>
          <Progress
            value={accuracyPct}
            color="white"
            radius="xl"
            size="md"
            className="bg-white/20"
          />
        </div>

        <Group justify="space-between">
          <Button
            component={Link}
            href="/review"
            size="xs"
            variant="white"
            color="dark"
            aria-label="Review mistakes"
          >
            Review mistakes
          </Button>

          <Button size="xs" variant="white" color="dark" onClick={confirmReset}>
            Reset progress
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Group gap={6} wrap="nowrap" align="center">
      <span className="opacity-85">{icon}</span>
      <div>
        <Text size="xs" className="opacity-80 leading-none">
          {label}
        </Text>
        <Text size="lg" fw={700} className="leading-none mt-0.5">
          {value}
        </Text>
      </div>
    </Group>
  );
}
