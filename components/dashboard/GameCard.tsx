import Link from "next/link";
import type { GameModeMeta } from "@/domain/gameMode";
import { GameModeIconView } from "@/components/common/Icon";

interface Props {
  mode: GameModeMeta;
  challengeCount: number;
  featured?: boolean;
}

export function GameCard({ mode, challengeCount, featured = false }: Props) {
  const ready = mode.status === "ready";
  const accent = `var(--mantine-color-${mode.accent}-6)`;
  const accentSoft = `var(--mantine-color-${mode.accent}-light)`;

  const tileStyle = {
    ["--tile-accent" as string]: accent,
    ["--tile-accent-soft" as string]: accentSoft,
  } as React.CSSProperties;

  const inner = (
    <>
      <div className="game-tile__body">
        <div className="game-tile__signal">
          <span className="game-tile__icon" aria-hidden>
            <GameModeIconView name={mode.icon} size={26} />
          </span>
          <div className="game-tile__heading">
            <span className="game-tile__tagline">{mode.tagline}</span>
            <h3 className="game-tile__title">{mode.title}</h3>
          </div>
        </div>

        <p className="game-tile__description">{mode.description}</p>

        <div className="game-tile__footer">
          <span className="game-tile__count">
            {ready ? `${challengeCount} challenges` : "Coming soon"}
          </span>
          {ready && (
            <span className="game-tile__arrow" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </div>

      <span className="game-tile__corner game-tile__corner--tl" aria-hidden />
      <span className="game-tile__corner game-tile__corner--tr" aria-hidden />
      <span className="game-tile__corner game-tile__corner--bl" aria-hidden />
      <span className="game-tile__corner game-tile__corner--br" aria-hidden />
    </>
  );

  const className = [
    "game-tile",
    featured && "game-tile--featured",
    !ready && "game-tile--disabled",
  ]
    .filter(Boolean)
    .join(" ");

  if (!ready) {
    return (
      <div className={className} style={tileStyle} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/practice/${mode.slug}`}
      className={className}
      style={tileStyle}
      aria-label={`${mode.title}: ${mode.tagline}`}
    >
      {inner}
    </Link>
  );
}
