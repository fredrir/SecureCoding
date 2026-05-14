import { SimpleGrid } from "@mantine/core";
import { GameCard } from "./GameCard";
import type { GameModeMeta } from "@/domain/gameMode";

interface Props {
  modes: readonly GameModeMeta[];
  countsByMode: Record<string, number>;
}

export function GameGrid({ modes, countsByMode }: Props) {
  // Sort by number of challenges
  const sortedModes = [...modes].sort((a, b) => {
    const countA = countsByMode[a.id] ?? 0;
    const countB = countsByMode[b.id] ?? 0;
    return countB - countA;
  });

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
      spacing="lg"
      verticalSpacing="lg"
    >
      {sortedModes.map((mode) => (
        <GameCard
          key={mode.id}
          mode={mode}
          challengeCount={countsByMode[mode.id] ?? 0}
        />
      ))}
    </SimpleGrid>
  );
}
