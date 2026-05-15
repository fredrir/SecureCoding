"use client";

import { Button, Group, Paper, Stack } from "@mantine/core";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/common/Icon";

interface Props {
  title?: string;
  children: ReactNode;
  /** Footer slot, usually the submit/skip buttons. */
  footer?: ReactNode;
  submitLabel?: string;
  onSubmit?: () => void;
  canSubmit?: boolean;
  onSkip?: () => void;
  busy?: boolean;
}

/**
 * Generic shell for answer-input UIs (line picker, fix picker, text box,
 * multiple choice). The runner composes the panel by passing its
 * mode-specific input as `children` plus a submit handler. No mode logic
 * lives here.
 */
export function AnswerPanel({
  title,
  children,
  footer,
  submitLabel = "Check answer",
  onSubmit,
  canSubmit = true,
  onSkip,
  busy,
}: Props) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-app-surface border-app-border"
    >
      <Stack gap="md">
        {title ? (
          <div className="text-xs uppercase font-bold text-app-fg-muted tracking-wider">
            {title}
          </div>
        ) : null}
        {children}
        {footer ?? (
          <Group justify="space-between" mt="xs">
            {onSkip ? (
              <Button
                variant="subtle"
                color="gray"
                onClick={onSkip}
                disabled={busy}
              >
                Skip
              </Button>
            ) : (
              <span />
            )}
            {onSubmit ? (
              <Button
                color="ntnuBlue"
                onClick={onSubmit}
                disabled={!canSubmit || busy}
                rightSection={<ArrowRightIcon size={16} />}
              >
                {submitLabel}
              </Button>
            ) : null}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
