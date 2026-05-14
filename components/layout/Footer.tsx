import Link from "next/link";
import { Anchor, Group, Tooltip } from "@mantine/core";
import { GitHubIcon, MailIcon } from "@/components/common/Icon";
import { ThemeToggle } from "../common/ThemeToggle";

const GITHUB_URL = "https://github.com/fredrir/PatchQuest";
const EMAIL = "fhansteen@gmail.com";

export function Footer() {
  return (
    <Group
      px="lg"
      justify="space-between"
      wrap="nowrap"
      gap="md"
      className="bg-app-accent h-full py-3 sm:py-0"
    >
      <div className="grid w-full grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-3">
        <Group gap="xs" wrap="nowrap" className="justify-center sm:justify-start">
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
          <ThemeToggle className="bg-inherit ring-0 border-0 rounded-lg text-white transition-all  hover:bg-white/20" />
        </Group>
      </div>
    </Group>
  );
}
