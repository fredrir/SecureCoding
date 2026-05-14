"use client";

import { Badge, Button, Chip, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { COURSE_TOPIC_META, type CourseTopic } from "@/domain/topic";
import { DIFFICULTIES, DIFFICULTY_META, type Difficulty } from "@/domain/difficulty";
import { useSettings } from "@/state/useSettings";
import { FilterIcon, GaugeIcon, TagIcon } from "@/components/common/Icon";

const TOPIC_COUNT = Object.keys(COURSE_TOPIC_META).length;
const DIFFICULTY_COUNT = DIFFICULTIES.length;

export function FiltersBar() {
  const { settings, setTopicFilter, setDifficultyFilter } = useSettings();

  const topicSelected = settings.topicFilter.length;
  const difficultySelected = settings.difficultyFilter.length;
  const hasAny = topicSelected > 0 || difficultySelected > 0;

  const clearAll = () => {
    setTopicFilter([]);
    setDifficultyFilter([]);
  };

  return (
    <Paper
      withBorder
      radius="lg"
      className="bg-app-surface border-app-border overflow-hidden"
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        px="lg"
        py="sm"
        className="bg-app-surface-muted border-b border-app-border"
      >
        <Group gap="xs" wrap="nowrap">
          <span className="text-app-accent inline-flex">
            <FilterIcon size={18} />
          </span>
          <Text fw={650} size="sm">
            Filters
          </Text>
          {hasAny ? (
            <Badge size="sm" radius="sm" variant="light" color="ntnuBlue">
              {topicSelected + difficultySelected} active
            </Badge>
          ) : (
            <Text size="xs" c="dimmed">
              Showing all challenges
            </Text>
          )}
        </Group>
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          onClick={clearAll}
          disabled={!hasAny}
        >
          Clear all
        </Button>
      </Group>

      <Stack gap={0} p="lg">
        <FilterSection
          icon={<TagIcon size={16} />}
          label="Topic"
          selected={topicSelected}
          total={TOPIC_COUNT}
          onClear={topicSelected > 0 ? () => setTopicFilter([]) : undefined}
        >
          <Chip.Group
            multiple
            value={[...settings.topicFilter]}
            onChange={(v) => setTopicFilter(v as CourseTopic[])}
          >
            <Group gap={8}>
              {Object.values(COURSE_TOPIC_META).map((meta) => (
                <Chip
                  key={meta.id}
                  value={meta.id}
                  color={meta.color}
                  variant="light"
                  size="sm"
                  radius="sm"
                >
                  {meta.label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </FilterSection>

        <Divider my="md" color="var(--app-border)" />

        <FilterSection
          icon={<GaugeIcon size={16} />}
          label="Difficulty"
          selected={difficultySelected}
          total={DIFFICULTY_COUNT}
          onClear={
            difficultySelected > 0 ? () => setDifficultyFilter([]) : undefined
          }
        >
          <Chip.Group
            multiple
            value={[...settings.difficultyFilter]}
            onChange={(v) => setDifficultyFilter(v as Difficulty[])}
          >
            <Group gap={8}>
              {DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  value={d}
                  color={DIFFICULTY_META[d].color}
                  variant="light"
                  size="sm"
                  radius="sm"
                >
                  {DIFFICULTY_META[d].label}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </FilterSection>
      </Stack>
    </Paper>
  );
}

interface FilterSectionProps {
  icon: React.ReactNode;
  label: string;
  selected: number;
  total: number;
  onClear?: () => void;
  children: React.ReactNode;
}

function FilterSection({
  icon,
  label,
  selected,
  total,
  onClear,
  children,
}: FilterSectionProps) {
  return (
    <div>
      <Group justify="space-between" align="center" mb="xs" wrap="nowrap">
        <Group gap={8} wrap="nowrap" align="center">
          <span className="text-app-fg-muted inline-flex">{icon}</span>
          <Text size="xs" tt="uppercase" fw={700} className="text-app-fg-muted tracking-wider">
            {label}
          </Text>
          <Text size="xs" className="text-app-fg-subtle tabular-nums">
            {selected === 0 ? `All · ${total}` : `${selected} of ${total}`}
          </Text>
        </Group>
        {onClear ? (
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            onClick={onClear}
          >
            Reset
          </Button>
        ) : null}
      </Group>
      {children}
    </div>
  );
}
