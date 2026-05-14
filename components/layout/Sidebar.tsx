"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Group, NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import { GAME_MODES } from "@/domain/gameMode";
import { GameModeIconView } from "@/components/common/Icon";
import { ExamModeToggle } from "../common/ExamModeToggle";
import { ThemeToggle } from "../common/ThemeToggle";

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <ScrollArea h="100%" type="auto" scrollbarSize={6}>
      <Stack gap={2} p="sm">
        <Stack hiddenFrom="sm" gap={6} mb="xs">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Preferences
          </Text>
          <Group
            justify="space-between"
            wrap="nowrap"
            className="bg-app-accent-soft border border-app-border rounded-xl px-3 py-2.5"
          >
            <ExamModeToggle compact />
            <ThemeToggle />
          </Group>
        </Stack>

        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mt="md" mb={4}>
          Navigation
        </Text>

        <NavLink
          component={Link}
          href="/"
          label="Dashboard"
          onClick={onNavigate}
          active={isActive("/")}
          variant="filled"
          className={` transition-colors duration-150 ${isActive("/") ? "hover:bg-app-accent text-white" : "hover:bg-app-accent-soft"}`}
        />
        <NavLink
          component={Link}
          href="/review"
          label="Mistake review"
          onClick={onNavigate}
          active={isActive("/review")}
          variant="filled"
          className={` transition-colors duration-150 ${isActive("/review") ? "hover:bg-app-accent text-white" : "hover:bg-app-accent-soft"}`}
        />

        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mt="md" mb={4}>
          Game modes
        </Text>

        {GAME_MODES.map((mode) => {
          const href = `/practice/${mode.slug}`;
          const ready = mode.status === "ready";
          return (
            <NavLink
              key={mode.id}
              component={Link}
              href={ready ? href : "#"}
              label={mode.title}
              description={mode.tagline}
              onClick={ready ? onNavigate : (e) => e.preventDefault()}
              active={ready && isActive(href)}
              variant="filled"
              className={`transition-colors duration-150 ${isActive(href) ? "hover:bg-app-accent text-white" : "hover:bg-app-accent-soft"} ${!ready ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={!ready}
              leftSection={
                <span
                  style={{ color: `var(--mantine-color-${mode.accent}-6)` }}
                >
                  <GameModeIconView
                    className={`${isActive(href) ? "text-white" : ""}`}
                    name={mode.icon}
                    size={18}
                  />
                </span>
              }
              rightSection={
                ready ? null : (
                  <Badge size="xs" variant="default" color="gray" radius="sm">
                    soon
                  </Badge>
                )
              }
            />
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
