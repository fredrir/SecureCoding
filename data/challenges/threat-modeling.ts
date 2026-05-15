import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const EXPLAIN_AND_MC = [GAME_MODE_IDS.explainExam, GAME_MODE_IDS.multipleChoiceSprint] as const;

export const threatModelingChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "threat-stride-tampering",
    title: "STRIDE on a download URL",
    summary:
      "A user downloads a generated PDF via a signed URL. The signature parameter is the SHA-1 of `report_id|secret`.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling",
    fixOptions: [],
    explanation:
      "STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. SHA-1 of `id|secret` is a length-extension target (T) and a bypass for integrity guarantees. Use HMAC-SHA-256 with a long key, include an expiry in the signed payload, and treat the URL as bearer credentials.",
    examKeywords: [
      "stride",
      "tampering",
      "hmac",
      "length extension",
      "bearer",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which STRIDE category does length-extension on a SHA-1 signed URL most directly enable?",
        options: [
          { id: "a", text: "T", correct: true, rationale: "An attacker forges a valid signature for a modified payload." },
          { id: "b", text: "R", correct: false, rationale: "Repudiation concerns disputing actions, not modification." },
          { id: "c", text: "S", correct: false, rationale: "Spoofing is identity, not message tampering." },
          { id: "d", text: "D", correct: false, rationale: "Not the failure mode here." },
        ],
      },
      explainPrompt:
        "Apply STRIDE to a SHA-1-signed download URL: which categories are most relevant and how would you mitigate them?",
    },
  }),

  buildChallenge({
    id: "threat-misuse-case",
    title: "Misuse case for a password-reset flow",
    summary:
      "Outline a misuse case for a self-service password-reset feature.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["misuse-case"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling (Misuse Case)",
    fixOptions: [],
    explanation:
      "A misuse case mirrors a use case from the attacker's perspective. For password reset, the misuser tries: enumerate accounts, take over via a leaked email account, brute-force OTP codes, replay tokens, race the reset window. Each misuse case maps to a control: generic responses, MFA on reset, rate limiting, single-use tokens, expiry.",
    examKeywords: [
      "misuse case",
      "actor",
      "enumerate",
      "single-use token",
      "rate limit",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "What does a misuse case express that a use case does not?",
        options: [
          { id: "a", text: "An adversary's goal and the steps to achieve it against the system.", correct: true, rationale: "Misuse cases are mirror cases from an attacker's perspective." },
          { id: "b", text: "Performance under load.", correct: false, rationale: "Unrelated to threat modeling." },
          { id: "c", text: "Branding requirements.", correct: false, rationale: "Unrelated." },
          { id: "d", text: "Database schema.", correct: false, rationale: "Implementation detail, not a misuse model." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "threat-attack-tree",
    title: "Build an attack tree for stealing API keys",
    summary:
      "Top goal: exfiltrate a customer's API key. Sketch an attack tree with at least three child branches.",
    courseTopic: "threat-modeling",
    difficulty: "advanced",
    tags: ["attack-tree"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling (Attack Tree)",
    fixOptions: [],
    explanation:
      "Top goal: steal API key. Branches: (1) phish the developer; (2) compromise a build pipeline that prints the key in logs; (3) exploit an SSRF that reads environment variables from instance metadata; (4) abuse a misconfigured IAM role to read the secret store. Each leaf earns a likelihood and impact, leading to prioritised mitigations: hardware MFA on the IdP, no secrets in CI logs, blocked metadata IP, scoped IAM policies.",
    examKeywords: [
      "attack tree",
      "leaf",
      "likelihood",
      "impact",
      "and/or",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      explainPrompt:
        "Sketch an attack tree for stealing a customer's API key. List at least three independent sub-goals and the controls that mitigate each.",
    },
  }),
];
