import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const EXPLAIN_AND_MC = [
  GAME_MODE_IDS.explainExam,
  GAME_MODE_IDS.multipleChoiceSprint,
] as const;

export const aiSecurityChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "ai-prompt-injection-summarizer",
    title: "Prompt injection in a document summariser",
    summary:
      "A 'summarise this PDF' feature drops the document text into the system prompt for an LLM.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["prompt-injection"],
    vulnerableLines: [],
    vulnerabilityType: "Prompt Injection",
    fixOptions: [],
    explanation:
      "Untrusted text in the model's context can override the developer's instructions ('Ignore previous instructions and ...'). Treat external content as untrusted: separate system instructions from data, do not let model output drive privileged actions without confirmation, and constrain tools the model can call. Output filtering helps for known patterns but cannot fully sanitise natural language.",
    examKeywords: [
      "prompt injection",
      "untrusted",
      "system prompt",
      "tool use",
      "human-in-the-loop",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question:
          "What is the most reliable mitigation against indirect prompt injection from documents?",
        options: [
          {
            id: "a",
            text: "Treat document text as untrusted; gate any model-driven action behind explicit user approval and limit tool permissions.",
            correct: true,
            rationale:
              "Defence in depth: don't let untrusted text grant capabilities.",
          },
          {
            id: "b",
            text: "Tell the model not to follow instructions in the document.",
            correct: false,
            rationale:
              "Models do not reliably resist injection through instructions alone.",
          },
          {
            id: "c",
            text: "Strip the word 'ignore' from documents.",
            correct: false,
            rationale: "Trivially bypassed.",
          },
          {
            id: "d",
            text: "Use only longer system prompts.",
            correct: false,
            rationale: "Length doesn't outweigh injected text.",
          },
        ],
      },
      explainPrompt:
        "Explain prompt injection (direct vs indirect) and the layered controls a product team should put in place around an LLM-powered summariser.",
    },
  }),

  buildChallenge({
    id: "ai-jailbreak-policies",
    title: "Jailbreaking and policy enforcement",
    summary:
      "A chat assistant is supposed to refuse legal advice, but users get past the refusal by claiming a hypothetical context.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["jailbreak"],
    vulnerableLines: [],
    vulnerabilityType: "LLM Policy Bypass",
    fixOptions: [],
    explanation:
      "Jailbreaks are prompts that coax the model past its training-time policies. Mitigation is layered: stronger model fine-tuning, runtime classifiers on input and output, refusal heuristics, and importantly product design that makes risky actions impossible (e.g., never let the assistant draft legally binding documents). Don't rely on a single prompt-level instruction.",
    examKeywords: [
      "jailbreak",
      "policy",
      "classifier",
      "guardrail",
      "least capability",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which is the *least* effective control against jailbreaks?",
        options: [
          {
            id: "a",
            text: "A single line in the system prompt asking the model to refuse.",
            correct: true,
            rationale: "Easily defeated; needs layered controls.",
          },
          {
            id: "b",
            text: "Output classifiers checking for restricted content.",
            correct: false,
            rationale: "An effective layer.",
          },
          {
            id: "c",
            text: "Fine-tuning with refusal data.",
            correct: false,
            rationale: "Strengthens default behaviour.",
          },
          {
            id: "d",
            text: "Architectural isolation of risky tools.",
            correct: false,
            rationale: "Strong, makes some attacks impossible.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "ai-vulnerable-codegen",
    title: "Trusting an AI-generated 'secure' patch",
    summary:
      "An AI assistant proposes a patch for an SQL injection that switches the query to use string interpolation with `parseInt`.",
    courseTopic: "ai-security",
    difficulty: "advanced",
    tags: ["llm-codegen"],
    vulnerableLines: [],
    vulnerabilityType: "Insecure AI-Generated Code",
    fixOptions: [],
    explanation:
      "AI-generated patches are plausible by construction but not verified. `parseInt` only protects integer columns; everywhere else the bug remains. Always review AI patches against the threat model: does it use parameterisation? does it cover all sinks? are the assumptions documented? Combine code review, SAST, and tests; treat the AI as a junior engineer.",
    examKeywords: [
      "verify",
      "parameterisation",
      "code review",
      "junior engineer",
      "false confidence",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "How should a team treat an AI-suggested 'security' patch?",
        options: [
          {
            id: "a",
            text: "Code-review and test it like any junior engineer's patch, and re-verify against the threat model.",
            correct: true,
            rationale: "Plausible ≠ correct; verify before merging.",
          },
          {
            id: "b",
            text: "Merge fast; the model is trained on best practice.",
            correct: false,
            rationale:
              "Models hallucinate confidently and follow patterns from buggy training data.",
          },
          {
            id: "c",
            text: "Refuse to use AI for any security work.",
            correct: false,
            rationale: "Useful, just not blindly.",
          },
          {
            id: "d",
            text: "Trust it if linting passes.",
            correct: false,
            rationale: "Linting doesn't catch logic flaws.",
          },
        ],
      },
      explainPrompt:
        "Explain the risks of trusting AI-generated 'fixes' for security bugs and outline a review workflow that uses AI safely.",
    },
  }),
  // courseTopic: "ai-security"

  buildChallenge({
    id: "llm-code-generation-risk",
    title: "LLM-generated code in a pull request",
    summary:
      "A developer accepts an LLM-generated authentication helper without review because the code 'looks correct'.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["llm", "ai-code-generation", "secure-review"],
    vulnerableLines: [],
    vulnerabilityType: "Unsafe AI-Assisted Development",
    fixOptions: [],
    explanation:
      "LLM tools can leak sensitive data, suggest vulnerable code, hallucinate APIs, miss business-logic risks, or produce code that appears plausible but is insecure. Generated code should be treated like untrusted third-party output: review it, test it, scan it, threat-model sensitive flows, and avoid pasting secrets or confidential source code into external tools.",
    examKeywords: [
      "LLM",
      "AI-assisted development",
      "sensitive data leakage",
      "vulnerable code",
      "security review",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question:
          "What is the safest way to handle security-critical code generated by an LLM?",
        options: [
          {
            id: "a",
            text: "Accept it if the explanation sounds confident.",
            correct: false,
            rationale: "Confidence is not evidence of correctness or security.",
          },
          {
            id: "b",
            text: "Treat it as untrusted code and subject it to review, tests, and security checks.",
            correct: true,
            rationale:
              "Generated code needs the same or stronger review as human-written code.",
          },
          {
            id: "c",
            text: "Disable all static analysis because the LLM already checked the code.",
            correct: false,
            rationale: "LLMs do not replace analysis and testing.",
          },
          {
            id: "d",
            text: "Paste production secrets into the prompt so the model can make the code realistic.",
            correct: false,
            rationale: "This creates a sensitive data leakage risk.",
          },
        ],
      },
      explainPrompt:
        "List security and privacy risks of using LLMs for software development, and describe controls a secure development team should apply.",
    },
  }),
];
