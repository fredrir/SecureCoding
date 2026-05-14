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
