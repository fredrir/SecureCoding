# PatchQuest

Practice app for **TDT4237: Software Security and Data Privacy** at NTNU. It turns the syllabus into short, repeatable drills: spot vulnerabilities in code, pick the right patch, write exam-style answers, and sprint through multiple-choice questions.

## Features

- **Vulnerability Searching**: read a snippet and tag the lines you suspect.
- **Find & Fix**: locate the vulnerable lines, then pick the correct patch.
- **Explain Like the Exam**: write a 3-6 sentence answer; the app scores it
  against expected keywords.
- **Multiple Choice Sprint**: 20 quick exam-style questions with instant
  feedback.
- **Exam Mode**: hides per-question feedback until the entire run ends, so you
  can practice the way you'll actually be graded.
- **Streaks & accuracy**: daily streak tracker plus per-topic and per-mode
  accuracy.
- **Filter by topic & difficulty**: narrow the pool to the OWASP categories
  or WSTG sub-topics you want to drill.
- **Light / dark / system theme**: synced to the OS and persisted across
  reloads.

Several additional modes (Attack Trace, STRIDE Threat Modeling, Risk Scoring,
Crypto Misuse, Privacy/GDPR, AI Code Assistant Review, Report Builder, …) are
defined in `domain/gameMode.ts` and surfaced in the dashboard as
_coming soon_.

## Tech stack

- **Next.js 16** (App Router) on the **Turbopack** dev server
- **React 19** with `useSyncExternalStore`-backed persistent state
- **Mantine 9** for the component library (`@mantine/core`, `@mantine/hooks`,
  `@mantine/modals`, `@mantine/notifications`)
- **Tailwind v4** for utility classes layered on top of the design tokens in
  `app/globals.css`
- **TypeScript** throughout

## Project layout

```
app/                Next.js App Router entries (layout, dashboard, /practice/[mode], /review)
components/         UI building blocks (challenge view, dashboard, layout, badges, common)
modes/              Per-game-mode runners (VulnSearch, FindAndFix, Explain, Multiple-Choice)
domain/             Pure-TS domain types (challenges, scoring, grading, topics, ids)
data/challenges/    The challenge corpus, grouped by topic
state/              Persistent hooks (settings, progress, streak, mistakes) and storage shim
theme/              Mantine theme + NTNU brand palette
lib/                Small utilities (lightweight syntax highlighter, RNG)
public/             Static assets
```

## Getting started

This project uses **pnpm** (a `pnpm-lock.yaml` is checked in). With Node.js 20+:

```bash
pnpm install
pnpm run dev    # http://localhost:3000 (Turbopack)
pnpm run build  # production build
pnpm run start  # serve the production build
pnpm run lint   # ESLint
```

## Design tokens

All colours, spacing, and surfaces are sourced from CSS custom properties in
`app/globals.css` and the Mantine theme override in `theme/theme.ts`. The
palette in `theme/palette.ts` mirrors NTNU's brand colours.

Light/dark scheme variables flip automatically based on
`data-mantine-color-scheme`; the theme toggle in the header writes the user's
choice to `localStorage` via Mantine's `ColorSchemeScript`.

## State & persistence

`state/usePersistentState.ts` is a thin `useState`-shaped hook backed by
`localStorage` and wired through `useSyncExternalStore`, so:

- SSR renders fall back to a default value (no hydration mismatch).
- Two components reading the same key stay in sync without prop drilling.
- Snapshots are reference-stable, which keeps React 19 happy.

The keys it stores live under the namespace `sct/v1/*`. Clearing site data in
DevTools resets the app entirely.

## Authoring challenges

Challenges are plain TypeScript objects grouped by topic under
`data/challenges/`. Each file exports an array; the aggregate in
`data/challenges/index.ts` is what the runners pull from. The shape is defined
in `domain/challenge.ts`. Add a snippet, the answer payload for the relevant
mode(s), the expected feedback, and tag the topic, difficulty, and any OWASP /
WSTG references.
