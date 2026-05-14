"use client";

import { modals } from "@mantine/modals";
import { Anchor, Button, Text } from "@mantine/core";

interface Props {
  variant?: "button" | "link";
  label?: string;
}

function openResetModal() {
  modals.openConfirmModal({
    title: "Reset all progress?",
    centered: true,
    children: (
      <Text size="sm">
        This will clear your attempts, streak, mistakes, and preferences from
        this browser. This cannot be undone.
      </Text>
    ),
    labels: { confirm: "Reset everything", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onConfirm: () => {
      try {
        window.localStorage.clear();
      } catch {
        // ignore quota/private-mode errors
      }
      window.location.reload();
    },
  });
}

export default function ResetProgress({
  variant = "button",
  label = "Reset progress",
}: Props) {
  if (variant === "link") {
    return (
      <Anchor
        component="button"
        type="button"
        onClick={openResetModal}
        className="font-medium"
      >
        {label}
      </Anchor>
    );
  }
  return (
    <Button size="xs" variant="light" color="red" onClick={openResetModal}>
      {label}
    </Button>
  );
}
