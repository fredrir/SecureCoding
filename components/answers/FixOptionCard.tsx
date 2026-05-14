"use client";

import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import type { FixOption } from "@/domain/challenge";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import type { CodeLanguage } from "@/domain/language";

interface Props {
  option: FixOption;
  language: CodeLanguage;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  /** When set, render correct / wrong / neutral styling. */
  reveal?: { correctId: string };
}

export function FixOptionCard({
  option,
  language,
  selected,
  onSelect,
  disabled,
  reveal,
}: Props) {
  const isCorrect = reveal && reveal.correctId === option.id;
  const isWrongPick = reveal && selected && !isCorrect;
  const accent = reveal
    ? isCorrect
      ? "lime"
      : isWrongPick
        ? "magenta"
        : "gray"
    : selected
      ? "ntnuBlue"
      : "gray";

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`bg-app-surface transition-[border-color,box-shadow] duration-100 ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${selected ? "shadow-sm" : "shadow-none"}`}
      style={{
        borderColor: selected || isCorrect || isWrongPick
          ? `var(--mantine-color-${accent}-filled)`
          : "var(--app-border)",
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Text fw={600} size="sm" className="flex-1">
            {option.label}
          </Text>
          {reveal ? (
            <Group gap={4} wrap="nowrap">
              {option.tempting && !isCorrect ? (
                <Badge color="orange" variant="light" size="xs" radius="sm">
                  Tempting
                </Badge>
              ) : null}
              {isCorrect ? (
                <Badge color="lime" variant="filled" size="sm" radius="sm">
                  Correct
                </Badge>
              ) : isWrongPick ? (
                <Badge color="magenta" variant="filled" size="sm" radius="sm">
                  Your pick
                </Badge>
              ) : null}
            </Group>
          ) : null}
        </Group>
        {option.code ? (
          <CodeViewer code={option.code} language={language} showHeader={false} />
        ) : null}
        {reveal ? (
          <Text size="xs" c="dimmed">
            {option.rationale}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
