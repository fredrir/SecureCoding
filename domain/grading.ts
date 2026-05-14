import type { Answer } from "./answer";
import type { Challenge } from "./challenge";
import type { Feedback } from "./feedback";
import { verdictFromScore } from "./scoring";

/** Set-similarity for line-selection answers (Jaccard). */
function jaccard<T>(
  a: ReadonlySet<T> | readonly T[],
  b: ReadonlySet<T> | readonly T[],
): number {
  const setA = a instanceof Set ? a : new Set(a);
  const setB = b instanceof Set ? b : new Set(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const v of setA) if (setB.has(v)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

/**
 * Keyword-presence scorer used by Explain Like the Exam. Each keyword can be
 * a single token or a multi-word phrase; matching is case-insensitive and
 * tolerates surrounding punctuation. Returns the share of keywords found.
 */
export function gradeKeywords(
  text: string,
  keywords: readonly string[],
): { score: number; matched: string[]; missed: string[] } {
  if (keywords.length === 0) {
    return { score: 1, matched: [], missed: [] };
  }
  const haystack = ` ${normalize(text)} `;
  const matched: string[] = [];
  const missed: string[] = [];
  for (const kw of keywords) {
    const needle = normalize(kw).trim();
    if (!needle) continue;
    if (haystack.includes(` ${needle} `) || haystack.includes(needle)) {
      matched.push(kw);
    } else {
      missed.push(kw);
    }
  }
  return {
    score: matched.length / keywords.length,
    matched,
    missed,
  };
}

/**
 * Single entry point. Pure: given the challenge and the user's answer, return
 * a `Feedback` value. Each mode handler is local and easy to extend.
 */
export function gradeAnswer(challenge: Challenge, answer: Answer): Feedback {
  switch (answer.kind) {
    case "line-selection":
      return gradeLineSelection(challenge, answer.selectedLines);
    case "fix-selection":
      return gradeFixSelection(challenge, answer.selectedFixId);
    case "find-and-fix":
      return gradeFindAndFix(
        challenge,
        answer.selectedLines,
        answer.selectedFixId,
      );
    case "text":
      return gradeText(challenge, answer.text);
    case "multiple-choice":
      return gradeMultipleChoice(challenge, answer.selectedOptionId);
  }
}

function gradeLineSelection(
  challenge: Challenge,
  selected: readonly number[],
): Feedback {
  const expected = challenge.vulnerableLines;
  const score = jaccard(selected, expected);
  const verdict = verdictFromScore(score);

  const expectedSet = new Set(expected);
  const selectedSet = new Set(selected);
  const missed = expected.filter((l) => !selectedSet.has(l));
  const wrong = [...selectedSet].filter((l) => !expectedSet.has(l));

  return {
    verdict,
    score,
    headline:
      verdict === "correct"
        ? "Spot on"
        : verdict === "partial"
          ? "Almost there"
          : "Missed the flaw",
    detail: challenge.explanation,
    highlights: [
      {
        label: "Vulnerable lines",
        tone: "neutral",
        value: expected.join(", "),
      },
      missed.length
        ? { label: "Missed", tone: "negative", value: missed.join(", ") }
        : { label: "Missed", tone: "positive", value: "none" },
      wrong.length
        ? { label: "Extra", tone: "negative", value: wrong.join(", ") }
        : { label: "Extra", tone: "positive", value: "none" },
    ],
  };
}

function gradeFixSelection(
  challenge: Challenge,
  selectedFixId: string | null,
): Feedback {
  const correct =
    selectedFixId !== null && selectedFixId === challenge.correctFixId;
  const picked = challenge.fixOptions.find((o) => o.id === selectedFixId);
  return {
    verdict: correct ? "correct" : "incorrect",
    score: correct ? 1 : 0,
    headline: correct ? "Correct fix" : "Tempting, but no",
    detail: picked
      ? `${picked.rationale}\n\n${challenge.explanation}`
      : challenge.explanation,
  };
}

function gradeFindAndFix(
  challenge: Challenge,
  selectedLines: readonly number[],
  selectedFixId: string | null,
): Feedback {
  const lineScore = jaccard(selectedLines, challenge.vulnerableLines);
  const fixCorrect =
    selectedFixId !== null && selectedFixId === challenge.correctFixId;
  // 50% lines, 50% fix; both must be right for a perfect score.
  const score = lineScore * 0.5 + (fixCorrect ? 0.5 : 0);
  const verdict = verdictFromScore(score);
  return {
    verdict,
    score,
    headline:
      verdict === "correct"
        ? "Located and patched"
        : verdict === "partial"
          ? "Partial credit"
          : "Needs another look",
    detail: challenge.explanation,
    highlights: [
      {
        label: "Lines",
        tone: lineScore >= 0.85 ? "positive" : lineScore > 0 ? "neutral" : "negative",
        value: `${Math.round(lineScore * 100)}%`,
      },
      {
        label: "Fix",
        tone: fixCorrect ? "positive" : "negative",
        value: fixCorrect ? "correct" : "wrong",
      },
    ],
  };
}

function gradeText(challenge: Challenge, text: string): Feedback {
  const { score, matched, missed } = gradeKeywords(text, challenge.examKeywords);
  const verdict = verdictFromScore(score);
  return {
    verdict,
    score,
    headline:
      verdict === "correct"
        ? "Strong answer"
        : verdict === "partial"
          ? "Some key points"
          : "Missing the core ideas",
    detail: challenge.explanation,
    highlights: [
      matched.length
        ? { label: "Mentioned", tone: "positive", value: matched.join(", ") }
        : { label: "Mentioned", tone: "neutral", value: "none" },
      missed.length
        ? { label: "Missing", tone: "negative", value: missed.join(", ") }
        : { label: "Missing", tone: "positive", value: "none" },
    ],
  };
}

function gradeMultipleChoice(
  challenge: Challenge,
  selectedOptionId: string | null,
): Feedback {
  const mc = challenge.modeData?.multipleChoice;
  if (!mc) {
    return {
      verdict: "incorrect",
      score: 0,
      headline: "No question",
      detail: "This challenge does not include a multiple-choice question.",
    };
  }
  const picked = mc.options.find((o) => o.id === selectedOptionId);
  const correct = picked?.correct === true;
  return {
    verdict: correct ? "correct" : "incorrect",
    score: correct ? 1 : 0,
    headline: correct ? "Correct" : "Incorrect",
    detail: picked?.rationale ?? challenge.explanation,
  };
}
