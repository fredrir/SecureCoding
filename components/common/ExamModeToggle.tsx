"use client";

import { Group, Switch, Text, Tooltip } from "@mantine/core";
import { useSettings } from "@/state/useSettings";

interface Props {
  compact?: boolean;
}

export function ExamModeToggle({ compact = false }: Props) {
  const { settings, setExamMode } = useSettings();
  return (
    <Tooltip
      label="Exam mode hides feedback until the entire run is finished."
      multiline
      w={240}
    >
      <Group gap={compact ? "xs" : "sm"} className="min-w-32" wrap="nowrap">
        <Switch
          checked={settings.examMode}
          onChange={(e) => setExamMode(e.currentTarget.checked)}
          color="ntnuBlue"
          size={compact ? "sm" : "md"}
          aria-label="Toggle exam mode"
        />
        <Text size={compact ? "xs" : "sm"} fw={600}>
          Exam mode
        </Text>
      </Group>
    </Tooltip>
  );
}
