import type { ChallengeId, FixOptionId, GameModeId } from "./ids";

/**
 * Discriminated union of every answer shape the app can produce. New game
 * modes add a new variant; runners stay loosely coupled because each variant
 * carries its own kind tag.
 */
export type Answer =
  | LineSelectionAnswer
  | FixSelectionAnswer
  | FindAndFixAnswer
  | TextAnswer
  | MultipleChoiceAnswer;

export interface AnswerBase {
  readonly challengeId: ChallengeId;
  readonly mode: GameModeId;
  readonly submittedAt: number;
}

export interface LineSelectionAnswer extends AnswerBase {
  readonly kind: "line-selection";
  readonly selectedLines: readonly number[];
}

export interface FixSelectionAnswer extends AnswerBase {
  readonly kind: "fix-selection";
  readonly selectedFixId: FixOptionId | null;
}

export interface FindAndFixAnswer extends AnswerBase {
  readonly kind: "find-and-fix";
  readonly selectedLines: readonly number[];
  readonly selectedFixId: FixOptionId | null;
}

export interface TextAnswer extends AnswerBase {
  readonly kind: "text";
  readonly text: string;
}

export interface MultipleChoiceAnswer extends AnswerBase {
  readonly kind: "multiple-choice";
  readonly selectedOptionId: string | null;
}
