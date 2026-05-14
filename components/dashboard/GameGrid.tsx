import { GameCard } from "./GameCard";
import type { GameModeMeta } from "@/domain/gameMode";

interface Props {
  modes: readonly GameModeMeta[];
  countsByMode: Record<string, number>;
}

export function GameGrid({ modes, countsByMode }: Props) {
  const sortedModes = [...modes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Sort alphabetically by title
    const titleA = (a.title ?? "").toLowerCase();
    const titleB = (b.title ?? "").toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
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
