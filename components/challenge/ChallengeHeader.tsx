import { Badge, Group, Stack, Text, Title, Tooltip } from "@mantine/core";
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
        {challenge.sourceLabel ? (
          <Tooltip
            withArrow
            openDelay={250}
            label={challenge.sourceLabel.split(",")[1]}
          >
            <Badge variant="light" color="ntnuBlue">
              {challenge.sourceLabel.split(",")[0]}
            </Badge>
          </Tooltip>
        ) : null}
        {challenge.pointsLabel ? (
          <Badge variant="light" color="green">
            {challenge.pointsLabel}
          </Badge>
        ) : null}
        {challenge.owaspTop10 ? <Top10Badge id={challenge.owaspTop10} /> : null}
        {challenge.owaspWstg ? <WstgBadge id={challenge.owaspWstg} /> : null}
      </Group>
      <Title order={2} className="tracking-tight">
        {challenge.title}
      </Title>
      {prompt ? (
        <Text size="md" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
          {prompt}
        </Text>
      ) : null}
    </Stack>
  );
}
