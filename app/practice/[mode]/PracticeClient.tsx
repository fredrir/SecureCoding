"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Stack } from "@mantine/core";
import { challengeRepository } from "@/data/challenges";
import { GAME_MODE_BY_SLUG, GAME_MODE_IDS } from "@/domain/gameMode";
import { EmptyState } from "@/components/common/EmptyState";
import { ShieldIcon } from "@/components/common/Icon";
import { useSettings } from "@/state/useSettings";

import { VulnSearchRunner } from "@/modes/VulnSearchRunner";
import { FindAndFixRunner } from "@/modes/FindAndFixRunner";
import { ExplainRunner } from "@/modes/ExplainRunner";
import { MultipleChoiceSprintRunner } from "@/modes/MultipleChoiceSprintRunner";

export function PracticeClient({ slug }: { slug: string }) {
  const router = useRouter();
  const mode = GAME_MODE_BY_SLUG[slug];
  const { settings } = useSettings();

  const challenges = useMemo(() => {
    if (!mode) return [];
    return challengeRepository.filter(
      (c) =>
        c.supportedModes.includes(mode.id) &&
        (settings.topicFilter.length === 0 ||
          settings.topicFilter.includes(c.courseTopic)) &&
        (settings.difficultyFilter.length === 0 ||
          settings.difficultyFilter.includes(c.difficulty)),
    );
  }, [mode, settings.topicFilter, settings.difficultyFilter]);

  if (!mode) {
    return (
      <EmptyState
        icon={<ShieldIcon size={36} />}
        title="Unknown game mode"
        description="That mode doesn't exist or isn't available yet."
        action={
          <Button variant="light" onClick={() => router.push("/")}>
            Back to dashboard
          </Button>
        }
      />
    );
  }

  if (mode.status !== "ready") {
    return (
      <EmptyState
        icon={<ShieldIcon size={36} />}
        title={`${mode.title}: coming soon`}
        description="This mode is still being authored. The data model is ready; only the runner is missing."
        action={
          <Button variant="light" onClick={() => router.push("/")}>
            Back to dashboard
          </Button>
        }
      />
    );
  }

  if (challenges.length === 0) {
    return (
      <EmptyState
        icon={<ShieldIcon size={36} />}
        title="No challenges match your filters"
        description="Loosen the topic or difficulty filters from the dashboard, then try again."
        action={
          <Button variant="light" onClick={() => router.push("/")}>
            Back to dashboard
          </Button>
        }
      />
    );
  }

  return (
    <Stack gap="md">
      {mode.id === GAME_MODE_IDS.vulnSearch ? (
        <VulnSearchRunner challenges={challenges} examMode={settings.examMode} />
      ) : mode.id === GAME_MODE_IDS.findAndFix ? (
        <FindAndFixRunner challenges={challenges} examMode={settings.examMode} />
      ) : mode.id === GAME_MODE_IDS.explainExam ? (
        <ExplainRunner challenges={challenges} examMode={settings.examMode} />
      ) : mode.id === GAME_MODE_IDS.multipleChoiceSprint ? (
        <MultipleChoiceSprintRunner
          challenges={challenges}
          examMode={settings.examMode}
        />
      ) : (
        <EmptyState
          title="No runner registered for this mode"
          description="The mode is marked as ready but no runner is wired in."
        />
      )}
    </Stack>
  );
}
