import type { ChallengeId, FixOptionId } from "./ids";
import type { CodeLanguage } from "./language";
import type { Difficulty } from "./difficulty";
import type { CourseTopic } from "./topic";
import type { OwaspTop10Id, OwaspWstgId } from "./owasp";
import type { GameModeId } from "./ids";

export interface FixOption {
  readonly id: FixOptionId;
  readonly label: string;
  readonly code?: string;
  readonly rationale: string;
  readonly tempting?: boolean;
}

export interface Reference {
  readonly label: string;
  readonly url?: string;
}

/**
 * Canonical challenge record. A single challenge may be replayed across many
 * game modes; `supportedModes` declares which modes can run it. Keeping the
 * shape uniform is what allows the runners and reusable components to stay
 * mode-agnostic.
 */
export interface Challenge {
  readonly id: ChallengeId;
  readonly title: string;
  readonly summary: string;
  readonly courseTopic: CourseTopic;
  readonly difficulty: Difficulty;
  readonly tags: readonly string[];

  /** Required for code-based modes. STRIDE / risk modes may omit it. */
  readonly code?: string;
  readonly language?: CodeLanguage;
  /** Display filename shown in the CodeViewer header. Defaults from language. */
  readonly filename?: string;
  readonly vulnerableLines: readonly number[];
  readonly vulnerabilityType: string;

  /** Multi-option fix selection, also used for mode 2 + mode 3. */
  readonly fixOptions: readonly FixOption[];
  readonly correctFixId?: FixOptionId;

  /** Long-form explanation surfaced in the FeedbackCard after every mode. */
  readonly explanation: string;
  readonly examKeywords: readonly string[];

  readonly owaspTop10?: OwaspTop10Id;
  readonly owaspWstg?: OwaspWstgId;
  readonly references?: readonly Reference[];

  readonly supportedModes: readonly GameModeId[];

  /**
   * Optional mode-specific extensions. Each mode reads only the slot it owns
   * so the base shape stays clean.
   */
  readonly modeData?: ChallengeModeData;
}

export interface MultipleChoiceOption {
  readonly id: string;
  readonly text: string;
  readonly correct: boolean;
  readonly rationale?: string;
}

export interface MultipleChoiceQuestion {
  readonly question: string;
  readonly options: readonly MultipleChoiceOption[];
}

export interface ChallengeModeData {
  /** Closed-ended question used by Multiple Choice Sprint. */
  readonly multipleChoice?: MultipleChoiceQuestion;

  /** Optional override for the prompt used in Explain Like the Exam. */
  readonly explainPrompt?: string;

  /** Optional intro line for Fix Suggestion above the code snippet. */
  readonly fixSuggestion?: { readonly intro?: string };

  /** Single-correct attack payload selection. */
  readonly attackTrace?: AttackTraceQuestion;

  /** Single-correct WSTG / Top10 mapping. */
  readonly wstgMapping?: WstgMappingQuestion;

  /** Secure-requirement rewrite prompt with expected concept keywords. */
  readonly secureRequirement?: SecureRequirementPrompt;

  /** STRIDE multi-select on a scenario / DFD description. */
  readonly stride?: StrideQuestion;

  /** Risk scoring single-choice with optional CVSS reference. */
  readonly riskScoring?: RiskScoringQuestion;

  /** Privacy/GDPR scenario with violated principles + DPIA flag. */
  readonly privacyScenario?: PrivacyScenario;

  /** Crypto-misuse multi-select on the snippet. */
  readonly cryptoMisuse?: CryptoMisuseQuestion;

  /** AI patch review: safe vs unsafe + concept keywords. */
  readonly aiReview?: AiReviewScenario;

  /** Multi-field vulnerability writeup template. */
  readonly reportBuilder?: ReportBuilderTemplate;
}

export interface AttackTraceOption {
  readonly id: string;
  readonly label: string;
  readonly request?: string;
  readonly correct: boolean;
  readonly rationale: string;
}

export interface AttackTraceQuestion {
  readonly question: string;
  readonly options: readonly AttackTraceOption[];
}

export interface WstgMappingOption {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly correct: boolean;
  readonly rationale: string;
}

export interface WstgMappingQuestion {
  readonly question: string;
  readonly options: readonly WstgMappingOption[];
  readonly top10Hint?: string;
}

export interface SecureRequirementPrompt {
  readonly bad: string;
  readonly context: string;
  readonly keywords: readonly string[];
  readonly goodExample: string;
}

export interface StrideOption {
  readonly id: "S" | "T" | "R" | "I" | "D" | "E";
  readonly label: string;
  readonly correct: boolean;
  readonly rationale: string;
}

export interface StrideQuestion {
  readonly scenario: string;
  readonly diagram?: string;
  readonly options: readonly StrideOption[];
}

export interface RiskScoringOption {
  readonly id: string;
  readonly label: string;
  readonly correct: boolean;
  readonly rationale: string;
}

export interface RiskScoringQuestion {
  readonly scenario: string;
  readonly cvssVector?: string;
  readonly question: string;
  readonly options: readonly RiskScoringOption[];
}

export interface PrivacyPrincipleOption {
  readonly id: string;
  readonly label: string;
  readonly correct: boolean;
  readonly rationale: string;
}

export interface PrivacyScenario {
  readonly scenario: string;
  readonly principles: readonly PrivacyPrincipleOption[];
  readonly dpiaRequired: boolean;
  readonly dpiaRationale: string;
}

export interface CryptoMisuseOption {
  readonly id: string;
  readonly label: string;
  readonly correct: boolean;
  readonly rationale: string;
}

export interface CryptoMisuseQuestion {
  readonly question: string;
  readonly options: readonly CryptoMisuseOption[];
}

export interface AiReviewScenario {
  readonly originalCode: string;
  readonly aiPatch: string;
  readonly language: string;
  readonly aiClaim: string;
  readonly safe: boolean;
  readonly reasonKeywords: readonly string[];
}

export interface ReportBuilderField {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly keywords: readonly string[];
  readonly multiline?: boolean;
}

export interface ReportBuilderTemplate {
  readonly fields: readonly ReportBuilderField[];
}

export class ChallengeRepository {
  private readonly byId: Map<ChallengeId, Challenge>;

  constructor(private readonly all: readonly Challenge[]) {
    this.byId = new Map(all.map((c) => [c.id, c]));
  }

  list(): readonly Challenge[] {
    return this.all;
  }

  get(id: ChallengeId): Challenge | undefined {
    return this.byId.get(id);
  }

  forMode(mode: GameModeId): readonly Challenge[] {
    return this.all.filter((c) => c.supportedModes.includes(mode));
  }

  filter(predicate: (c: Challenge) => boolean): readonly Challenge[] {
    return this.all.filter(predicate);
  }
}
