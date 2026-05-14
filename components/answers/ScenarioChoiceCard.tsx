"use client";

import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { CodeViewer } from "@/components/challenge/CodeViewer";
import type { CodeLanguage } from "@/domain/language";

interface Option {
  readonly id: string;
  readonly label: string;
  readonly code?: string;
  readonly correct?: boolean;
  readonly rationale?: string;
}

interface Props {
  option: Option;
  language?: CodeLanguage;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  reveal?: boolean;
  multi?: boolean;
}

/**
 * Generic selectable card used by Attack Trace, Crypto Misuse, STRIDE, etc.
 * Renders an optional code preview and a rationale once revealed.
 */
export function ScenarioChoiceCard({
  option,
  language,
  selected,
  onSelect,
  disabled,
  reveal,
  multi,
}: Props) {
  const isCorrect = reveal && option.correct === true;
  const isWrongPick = reveal && selected && !option.correct;
  const isMissed = reveal && !selected && option.correct === true;
  const accent = reveal
    ? isCorrect
      ? "lime"
      : isWrongPick
        ? "magenta"
        : isMissed
          ? "orange"
          : "gray"
    : selected
      ? "ntnuBlue"
      : "gray";

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      role={multi ? "checkbox" : "radio"}
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
        borderColor:
          selected || isCorrect || isWrongPick || isMissed
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
            isCorrect ? (
              <Badge color="lime" variant="filled" size="sm" radius="sm">
                {selected ? "Correct pick" : "Correct"}
              </Badge>
            ) : isWrongPick ? (
              <Badge color="magenta" variant="filled" size="sm" radius="sm">
                Your pick
              </Badge>
            ) : isMissed ? (
              <Badge color="orange" variant="light" size="sm" radius="sm">
                Missed
              </Badge>
            ) : null
          ) : null}
        </Group>
        {option.code ? (
          <CodeViewer
            code={option.code}
            language={language ?? "plaintext"}
            showHeader={false}
          />
        ) : null}
        {reveal && option.rationale ? (
          <Text size="xs" c="dimmed">
            {option.rationale}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
