import { Anchor, Group, Text } from "@mantine/core";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <Group
      h="100%"
      px="lg"
      justify="space-between"
      wrap="nowrap"
      gap="md"
      style={{
        background: "var(--app-accent)",
        color: "#ffffff",
      }}
    >
      <Text size="xs" c="white" fw={500}>
        Fredrik Carsten Hansteen
      </Text>
      <Group gap="md" wrap="nowrap" visibleFrom="sm">
        <Anchor
          href="mailto:fhansteen@gmail.com"
          c="white"
          size="xs"
          fw={600}
          underline="hover"
          style={{ whiteSpace: "nowrap" }}
        >
          fhansteen@gmail.com
        </Anchor>
      </Group>
      <Anchor
        href="mailto:fhansteen@gmail.com"
        c="white"
        size="xs"
        fw={600}
        underline="hover"
        hiddenFrom="sm"
        style={{ whiteSpace: "nowrap" }}
      >
        fhansteen@gmail.com
      </Anchor>
    </Group>
  );
}
