import { Group, Stack, Text, Title } from "@mantine/core";
import type { Challenge } from "@/domain/challenge";
import { TopicBadge } from "@/components/badges/TopicBadge";
import { DifficultyBadge } from "@/components/badges/DifficultyBadge";
import { Top10Badge } from "@/components/badges/Top10Badge";
import { WstgBadge } from "@/components/badges/WstgBadge";

interface Props {
  challenge: Challenge;
  prompt?: string;
}

export function ChallengeHeader({ challenge, prompt }: Props) {
  return (
    <Stack gap="sm">
      <Group gap={6} wrap="wrap">
        <TopicBadge topic={challenge.courseTopic} />
        <DifficultyBadge difficulty={challenge.difficulty} />
        {challenge.owaspTop10 ? <Top10Badge id={challenge.owaspTop10} /> : null}
        {challenge.owaspWstg ? <WstgBadge id={challenge.owaspWstg} /> : null}
      </Group>
      <Title order={2} className="tracking-tight">
        {challenge.title}
      </Title>
      {prompt ? (
        <Text size="md" c="dimmed">
          {prompt}
        </Text>
      ) : (
        <Text size="md" c="dimmed">
          {challenge.summary}
        </Text>
      )}
    </Stack>
  );
}
