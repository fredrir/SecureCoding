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
      style={{
        background: "var(--app-surface)",
        borderColor: "var(--app-border)",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        opacity: ready ? 1 : 0.62,
        cursor: ready ? "pointer" : "not-allowed",
        position: "relative",
        overflow: "hidden",
      }}
      className="game-card"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accentVar,
          pointerEvents: "none",
        }}
      />
      <Stack gap="md" style={{ position: "relative", height: "100%" }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <span
            style={{
              color: accentVar,
              background: accentSoftVar,
              padding: "10px",
              borderRadius: 12,
              display: "inline-flex",
            }}
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

        <Text size="sm" style={{ flex: 1 }}>
          {mode.description}
        </Text>
      </Stack>
    </Card>
  );

  if (!ready) return inner;

  return (
    <Link
      href={`/practice/${mode.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
    >
      {inner}
    </Link>
  );
}
