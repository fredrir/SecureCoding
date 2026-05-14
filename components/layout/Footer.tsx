import Link from "next/link";
import { Anchor, Group, Text } from "@mantine/core";

export function Footer() {
  return (
    <Group
      h="100%"
      px="lg"
      justify="space-between"
      wrap="nowrap"
      gap="md"
      className="bg-app-accent text-white"
    >
      <Text size="xs" c="white" fw={500}>
        Fredrik Carsten Hansteen
      </Text>

      <Group gap="lg" wrap="nowrap" visibleFrom="sm">
        <Anchor
          component={Link}
          href="/privacy"
          c="white"
          size="xs"
          fw={600}
          underline="hover"
          className="whitespace-nowrap"
        >
          Privacy
        </Anchor>
        <Anchor
          component={Link}
          href="/qa"
          c="white"
          size="xs"
          fw={600}
          underline="hover"
          className="whitespace-nowrap"
        >
          Q&amp;A
        </Anchor>
        <Anchor
          href="mailto:fhansteen@gmail.com"
          c="white"
          size="xs"
          fw={600}
          underline="hover"
          className="whitespace-nowrap"
        >
          fhansteen@gmail.com
        </Anchor>
      </Group>

      <Group gap="sm" wrap="nowrap" hiddenFrom="sm">
        <Anchor
          component={Link}
          href="/privacy"
          c="white"
          size="xs"
          fw={600}
          underline="hover"
          className="whitespace-nowrap"
        >
          Privacy Policy
        </Anchor>
        <Anchor
          component={Link}
          href="/qa"
          c="white"
          size="xs"
          fw={600}
          underline="hover"
          className="whitespace-nowrap"
        >
          Q&amp;A
        </Anchor>
      </Group>
    </Group>
  );
}
