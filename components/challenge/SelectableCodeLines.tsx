"use client";

import { useMemo } from "react";
import { CodeViewer, type CodeLineState } from "./CodeViewer";
import type { CodeLanguage } from "@/domain/language";

interface Props {
  code: string;
  language: CodeLanguage;
  selected: readonly number[];
  onChange: (next: readonly number[]) => void;
  /**
   * Optional reveal: after submission, the runner can pass the correct lines
   * so the component can render the right colours without rebuilding logic.
   */
  reveal?: { correct: readonly number[] };
  disabled?: boolean;
  filename?: string;
}

/**
 * Wraps CodeViewer with line-toggle behaviour. The runner stays simple
 * because it just owns the `selected` array and forwards the change handler.
 */
export function SelectableCodeLines({
  code,
  language,
  selected,
  onChange,
  reveal,
  disabled,
  filename,
}: Props) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const correctSet = useMemo(
    () => new Set(reveal?.correct ?? []),
    [reveal?.correct],
  );

  const lineStates: Record<number, CodeLineState> = {};
  if (reveal) {
    // After submission: every selected line is correct or incorrect; missed
    // correct lines are highlighted as correct so the user sees what they
    // should have picked.
    for (const line of selectedSet) {
      lineStates[line] = correctSet.has(line)
        ? { correct: true }
        : { incorrect: true };
    }
    for (const line of correctSet) {
      if (!selectedSet.has(line)) lineStates[line] = { correct: true };
    }
  } else {
    for (const line of selectedSet) lineStates[line] = { selected: true };
  }

  const handleClick = (lineNumber: number) => {
    if (disabled || reveal) return;
    if (selectedSet.has(lineNumber)) {
      onChange(selected.filter((l) => l !== lineNumber));
    } else {
      onChange([...selected, lineNumber].sort((a, b) => a - b));
    }
  };

  return (
    <CodeViewer
      code={code}
      language={language}
      lineStates={lineStates}
      onLineClick={disabled || reveal ? undefined : handleClick}
      ariaLabel="Select vulnerable lines"
      filename={filename}
    />
  );
}
