import type { GameModeId } from "./ids";
import { gameModeId } from "./ids";

export const GAME_MODE_IDS = {
  examSprint: gameModeId("exam-sprint"),
  vulnSearch: gameModeId("vuln-search"),
  fixSuggestion: gameModeId("fix-suggestion"),
  findAndFix: gameModeId("find-and-fix"),
  explainExam: gameModeId("explain-exam"),
  attackTrace: gameModeId("attack-trace"),
  wstgMapping: gameModeId("wstg-mapping"),
  secureRequirement: gameModeId("secure-requirement"),
  strideThreat: gameModeId("stride-threat"),
  riskScoring: gameModeId("risk-scoring"),
  privacyGdpr: gameModeId("privacy-gdpr"),
  cryptoMisuse: gameModeId("crypto-misuse"),
  multipleChoiceSprint: gameModeId("mc-sprint"),
  aiReview: gameModeId("ai-review"),
  reportBuilder: gameModeId("report-builder"),
} as const;

export type GameModeKey = keyof typeof GAME_MODE_IDS;

export interface GameModeMeta {
  readonly id: GameModeId;
  readonly key: GameModeKey;
  readonly slug: string;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly accent: string; // Mantine color
  readonly icon: GameModeIcon;
  readonly status: "ready" | "coming-soon";
  readonly pinned?: boolean;
}

/**
 * Icon names are kept as a string literal union so each card can pick its
 * Tabler icon at render time without forcing the domain layer to depend on
 * the icon library.
 */
export type GameModeIcon =
  | "search"
  | "wrench"
  | "shield"
  | "pencil"
  | "bug"
  | "map"
  | "flag"
  | "diagram"
  | "scale"
  | "lock"
  | "key"
  | "lightning"
  | "robot"
  | "report"
  | "flame";

export const GAME_MODES: readonly GameModeMeta[] = [
  {
    id: GAME_MODE_IDS.examSprint,
    key: "examSprint",
    slug: "exam-sprint",
    title: "Exam Bank",
    tagline: "Real past-exam questions",
    description: "Work through every question pulled directly from past exams.",
    accent: "red",
    icon: "flame",
    status: "ready",
    pinned: true,
  },
  {
    id: GAME_MODE_IDS.vulnSearch,
    key: "vulnSearch",
    slug: "vulnerability-search",
    title: "Vulnerability Searching",
    tagline: "Spot the line",
    description:
      "Read a snippet and tag the lines you suspect contain the flaw.",
    accent: "ntnuBlue",
    icon: "search",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.multipleChoiceSprint,
    key: "multipleChoiceSprint",
    slug: "multiple-choice-sprint",
    title: "Multiple Choice Sprint",
    tagline: "20 questions, no penalty",
    description: "Closed-ended exam-style questions with instant feedback.",
    accent: "lightBlue",
    icon: "lightning",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.findAndFix,
    key: "findAndFix",
    slug: "find-and-fix",
    title: "Find & Fix",
    tagline: "Locate, then repair",
    description: "First mark the vulnerable lines, then select the right fix.",
    accent: "magenta",
    icon: "shield",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.explainExam,
    key: "explainExam",
    slug: "explain-like-the-exam",
    title: "Explain Like the Exam",
    tagline: "Three to six sentences",
    description:
      "Write an exam-style answer; Scoring is based on expected keywords.",
    accent: "purple",
    icon: "pencil",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.fixSuggestion,
    key: "fixSuggestion",
    slug: "fix-suggestion",
    title: "Fix Suggestion",
    tagline: "Pick the patch",
    description:
      "Choose the safest patch among tempting decoys like blacklists or weak hashes.",
    accent: "lightBlue",
    icon: "wrench",
    status: "ready",
  },

  {
    id: GAME_MODE_IDS.attackTrace,
    key: "attackTrace",
    slug: "attack-trace",
    title: "Attack Trace",
    tagline: "Pick the payload",
    description: "Choose the exploit request sequence that triggers the bug.",
    accent: "orange",
    icon: "bug",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.wstgMapping,
    key: "wstgMapping",
    slug: "wstg-mapping",
    title: "WSTG Mapping",
    tagline: "Tag the standard",
    description: "Map a finding to the correct OWASP WSTG and Top 10 category.",
    accent: "lime",
    icon: "map",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.secureRequirement,
    key: "secureRequirement",
    slug: "secure-requirement",
    title: "Secure Requirement",
    tagline: "Rewrite for clarity",
    description: "Take a vague rule and make it specific, testable, and safe.",
    accent: "beige",
    icon: "flag",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.strideThreat,
    key: "strideThreat",
    slug: "stride-threat",
    title: "STRIDE Threat Modeling",
    tagline: "Find the threat",
    description:
      "Map an architecture description to STRIDE categories of threats.",
    accent: "magenta",
    icon: "diagram",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.riskScoring,
    key: "riskScoring",
    slug: "risk-scoring",
    title: "Risk Scoring",
    tagline: "Reason about CVSS",
    description: "Estimate likelihood, impact and overall severity.",
    accent: "orange",
    icon: "scale",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.privacyGdpr,
    key: "privacyGdpr",
    slug: "privacy-gdpr",
    title: "Privacy / GDPR",
    tagline: "Lawful by design",
    description:
      "Identify which privacy principles a feature violates and when DPIA is needed.",
    accent: "yellow",
    icon: "lock",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.cryptoMisuse,
    key: "cryptoMisuse",
    slug: "crypto-misuse",
    title: "Crypto Misuse",
    tagline: "Spot the wrong primitive",
    description: "Identify reused keys, weak randomness, missing integrity.",
    accent: "turquoise",
    icon: "key",
    status: "ready",
  },

  {
    id: GAME_MODE_IDS.aiReview,
    key: "aiReview",
    slug: "ai-review",
    title: "AI Code Assistant Review",
    tagline: "Trust, but verify",
    description: "Decide whether an AI-generated patch is actually secure.",
    accent: "magenta",
    icon: "robot",
    status: "ready",
  },
  {
    id: GAME_MODE_IDS.reportBuilder,
    key: "reportBuilder",
    slug: "report-builder",
    title: "Report Builder",
    tagline: "Practice the writeup",
    description: "Author a vulnerability report end to end.",
    accent: "ntnuBlue",
    icon: "report",
    status: "ready",
  },
] as const;

export const GAME_MODE_BY_SLUG: Record<string, GameModeMeta> =
  Object.fromEntries(GAME_MODES.map((m) => [m.slug, m]));

export const GAME_MODE_BY_ID: Record<string, GameModeMeta> = Object.fromEntries(
  GAME_MODES.map((m) => [m.id, m]),
);
