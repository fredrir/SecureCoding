import Link from "next/link";
import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { GameModeMeta } from "@/domain/gameMode";
import { GameModeIconView } from "@/components/common/Icon";

interface Props {
  mode: GameModeMeta;
  challengeCount: number;
}

export function GameCard({ mode, challengeCount }: Props) {
  const ready = mode.status === "ready";
  const accentVar = `var(--mantine-color-${mode.accent}-6)`;
  const accentSoftVar = `var(--mantine-color-${mode.accent}-light)`;

  const inner = (
    <Card
      withBorder
      padding="lg"
      radius="lg"
      h="100%"
      className={`game-card hover:shadow-md bg-app-surface border-app-border relative overflow-hidden transition-[transform,box-shadow,border-color] duration-150 ${
        ready ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-60"
      }`}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
        style={{ background: accentVar }}
      />
      <Stack gap="md" className="relative h-full">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <span
            className="inline-flex p-2.5 rounded-xl"
            style={{ color: accentVar, background: accentSoftVar }}
          >
            <GameModeIconView name={mode.icon} size={24} />
          </span>
          {ready ? (
            <Badge variant="light" color={mode.accent} size="sm" radius="sm">
              {challengeCount} challenges
            </Badge>
          ) : (
            <Badge variant="default" color="gray" size="sm" radius="sm">
              Coming soon
            </Badge>
          )}
        </Group>

        <div>
          <Title order={4} mt={4}>
            {mode.title}
          </Title>
          <Text size="sm" c="dimmed" mt={2}>
            {mode.tagline}
          </Text>
        </div>

        <Text size="sm" className="flex-1">
          {mode.description}
        </Text>
      </Stack>
    </Card>
  );

  if (!ready) return inner;

  return (
    <Link
      href={`/practice/${mode.slug}`}
      className="block h-full no-underline text-inherit"
    >
      {inner}
    </Link>
  );
}
