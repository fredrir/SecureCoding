"use client";

import Link from "next/link";
import { Burger, Group, Text, Title } from "@mantine/core";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ExamModeToggle } from "@/components/common/ExamModeToggle";
import Image from "next/image";

interface Props {
  navOpened: boolean;
  onToggleNav: () => void;
}

export function Header({ navOpened, onToggleNav }: Props) {
  return (
    <Group h="100%" w="100%" px="lg" align="center" wrap="nowrap">
      <Group
        gap="md"
        w="100%"
        align="center"
        justify="space-between"
        wrap="nowrap"
      >
        <Link
          href="/"
          className="no-underline text-inherit hover:opacity-80 transition-opacity duration-150"
          aria-label="Go to dashboard"
        >
          <Group gap={10} wrap="nowrap">
            <span className="h-6 w-6 md:w-8 md:h-8 text-app-accent">
              <Image
                src={"/PatchQuest.svg"}
                alt="PatchQuest logo"
                height={150}
                width={150}
              />
            </span>
            <div>
              <Title order={3} className="leading-none tracking-tight">
                PatchQuest
              </Title>
              <Text c="dimmed" size="xs" mt={2}>
                TDT4237 practice
              </Text>
            </div>
          </Group>
        </Link>
        <Burger
          opened={navOpened}
          onClick={onToggleNav}
          hiddenFrom="sm"
          size="sm"
          aria-label="Toggle navigation"
        />
      </Group>
      <Group gap="sm" wrap="nowrap" visibleFrom="sm">
        <ExamModeToggle compact />
        <ThemeToggle />
      </Group>
    </Group>
  );
}
