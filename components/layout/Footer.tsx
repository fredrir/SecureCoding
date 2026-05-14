import Link from "next/link";
import Image from "next/image";
import { Anchor, Group, Stack, Text, Tooltip } from "@mantine/core";
import { GitHubIcon, MailIcon } from "@/components/common/Icon";

const GITHUB_URL = "https://github.com/fredrir/PatchQuest";
const EMAIL = "fhansteen@gmail.com";

export function Footer() {
  return (
    <Group
      h="100%"
      px="lg"
      justify="space-between"
      wrap="nowrap"
      gap="md"
      className="bg-app-accent"
    >
      <div className="grid w-full grid-cols-1 sm:grid-cols-3 items-center gap-3">
        <Group gap="xs" wrap="nowrap">
          <Anchor
            component={Link}
            href="https://hansteen.dev"
            c="white"
            size="xs"
            fw={600}
            underline="never"
            className="whitespace-nowrap hover:opacity-90 hover:underline transition-opacity"
          >
            Fredrik Carsten Hansteen
          </Anchor>
        </Group>

        <Group gap="lg" wrap="nowrap" className="justify-center">
          <Anchor
            component={Link}
            href="/privacy"
            c="white"
            size="xs"
            fw={600}
            underline="never"
            className="whitespace-nowrap  hover:opacity-90 hover:underline transition-opacity"
          >
            Privacy
          </Anchor>
          <span aria-hidden className="h-3 w-px bg-white/25" />
          <Anchor
            component={Link}
            href="/qa"
            c="white"
            size="xs"
            fw={600}
            underline="never"
            className="whitespace-nowrap hover:opacity-90 hover:underline transition-opacity"
          >
            Q&amp;A
          </Anchor>
        </Group>

        <Group gap="xs" wrap="nowrap" className="justify-center sm:justify-end">
          <Tooltip label="View source on GitHub" withArrow>
            <Anchor
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub repository"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-all  hover:bg-white/20"
            >
              <GitHubIcon size={18} />
            </Anchor>
          </Tooltip>
          <Tooltip label={EMAIL} withArrow>
            <Anchor
              href={`mailto:${EMAIL}`}
              aria-label="Send email"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-all  hover:bg-white/20"
            >
              <MailIcon size={18} />
            </Anchor>
          </Tooltip>
        </Group>
      </div>
    </Group>
  );
}
