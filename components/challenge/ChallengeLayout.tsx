"use client";

import { Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { ChallengeHeader } from "./ChallengeHeader";
import { ProgressHeader } from "./ProgressHeader";
import type { Challenge } from "@/domain/challenge";

interface Props {
  challenge: Challenge;
  prompt?: string;
  modeTitle: string;
  current: number;
  total: number;
  examMode?: boolean;
  /** Left column, usually CodeViewer / SelectableCodeLines / scenario text. */
  workspace: ReactNode;
  /** Right column with AnswerPanel + FeedbackCard. */
  answer: ReactNode;
}

const HANDLE_WIDTH = 8;
const DEFAULT_LEFT_PCT = 56.7;
const MIN_PCT = 20;
const MAX_PCT = 80;

export function ChallengeLayout({
  challenge,
  prompt,
  modeTitle,
  current,
  total,
  examMode,
  workspace,
  answer,
}: Props) {
  const [leftPct, setLeftPct] = useState(DEFAULT_LEFT_PCT);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(Math.max(pct, MIN_PCT), MAX_PCT));
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <Stack gap="lg" maw={1200} mx="auto" w="100%">
      <ProgressHeader
        current={current}
        total={total}
        modeTitle={modeTitle}
        examMode={examMode}
      />
      <ChallengeHeader challenge={challenge} prompt={prompt} />

      {isMobile ? (
        <Stack gap="lg">
          {workspace}
          {answer}
        </Stack>
      ) : (
        <div
          ref={containerRef}
          style={{ display: "flex", alignItems: "stretch", gap: 0 }}
        >
          <div style={{ width: `${leftPct}%`, flexShrink: 0, minWidth: 0 }}>
            {workspace}
          </div>

          <div
            onMouseDown={onMouseDown}
            style={{
              width: HANDLE_WIDTH,
              flexShrink: 0,
              cursor: "col-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 2px",
            }}
          >
            <div
              style={{
                width: 2,
                height: "100%",
                minHeight: 40,
                borderRadius: 1,
                background: "var(--mantine-color-default-border)",
                transition: "background 150ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "var(--mantine-color-blue-5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "var(--mantine-color-default-border)";
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>{answer}</div>
        </div>
      )}
    </Stack>
  );
}
