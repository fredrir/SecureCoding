import { Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack
      align="center"
      gap="sm"
      py="xl"
      className="border border-dashed border-app-border-strong rounded-2xl bg-app-surface-muted"
    >
      {icon ? <div className="text-app-fg-subtle">{icon}</div> : null}
      <Title order={4} ta="center">
        {title}
      </Title>
      {description ? (
        <Text c="dimmed" size="sm" ta="center" maw={420}>
          {description}
        </Text>
      ) : null}
      {action}
    </Stack>
  );
}
