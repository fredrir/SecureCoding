import { GameCard } from "./GameCard";
import type { GameModeMeta } from "@/domain/gameMode";

interface Props {
  modes: readonly GameModeMeta[];
  countsByMode: Record<string, number>;
}

export function GameGrid({ modes, countsByMode }: Props) {
  const sortedModes = [...modes].sort((a, b) => {
    const countA = countsByMode[a.id] ?? 0;
    const countB = countsByMode[b.id] ?? 0;
    return countB - countA;
  });

  return (
    <div className="game-grid">
      {sortedModes.map((mode, index) => (
        <GameCard
          key={mode.id}
          mode={mode}
          challengeCount={countsByMode[mode.id] ?? 0}
          featured={index === 0 && mode.status === "ready"}
        />
      ))}
    </div>
  );
}
