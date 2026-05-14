"use client";

import { Radio, Stack } from "@mantine/core";
import { useMemo } from "react";
import type { MultipleChoiceOption } from "@/domain/challenge";

interface Props {
  options: readonly MultipleChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** When set, renders correct/wrong styling on each option. */
  reveal?: boolean;
}

function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function MultipleChoiceOptions({
  options,
  value,
  onChange,
  disabled,
  reveal,
}: Props) {
  // Shuffle once per question -- key on text content so a new question always reshuffles
  const key = options.map((o) => o.text).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffledOptions = useMemo(() => shuffled(options), [key]);

  return (
    <Radio.Group value={value ?? ""} onChange={(v) => onChange(v)}>
      <Stack gap="xs">
        {shuffledOptions.map((opt) => {
          const wasPicked = value === opt.id;
          const isCorrect = opt.correct;
          const tone = reveal
            ? isCorrect
              ? "lime"
              : wasPicked
                ? "magenta"
                : "gray"
            : "ntnuBlue";
          return (
            <Radio
              key={opt.id}
              value={opt.id}
              disabled={disabled}
              color={tone}
              label={opt.text}
              description={
                reveal && wasPicked && opt.rationale ? opt.rationale : undefined
              }
              styles={{
                root: {
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${
                    reveal && (isCorrect || wasPicked)
                      ? `var(--mantine-color-${tone}-filled)`
                      : "var(--app-border)"
                  }`,
                  background:
                    reveal && (isCorrect || wasPicked)
                      ? `var(--mantine-color-${tone}-light)`
                      : "transparent",
                  transition: "border-color 120ms ease, background 120ms ease",
                },
                label: {
                  whiteSpace: "pre-wrap",
                },
              }}
            />
          );
        })}
      </Stack>
    </Radio.Group>
  );
}
