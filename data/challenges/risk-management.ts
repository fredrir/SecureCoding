import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const EXPLAIN_AND_MC = [GAME_MODE_IDS.explainExam, GAME_MODE_IDS.multipleChoiceSprint] as const;

export const riskManagementChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "risk-cvss-vector",
    title: "Read this CVSS vector",
    summary:
      "Interpret CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H. What does it tell you about the vulnerability?",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["cvss"],
    vulnerableLines: [],
    vulnerabilityType: "Risk Scoring",
    fixOptions: [],
    explanation:
      "AV:N = network-reachable; AC:L = low complexity; PR:N = no privileges required; UI:N = no user interaction; S:U = scope unchanged; C/I/A:H = high impact across the triad. That's a critical, unauthenticated, remotely exploitable vulnerability with full impact, scoring 9.8. It should be a top patch priority and likely an out-of-band advisory.",
    examKeywords: ["cvss", "av:n", "no privileges", "scope", "critical"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "What is the most accurate one-line summary of CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H?",
        options: [
          { id: "a", text: "Critical, network-exploitable without authentication or interaction, full CIA impact.", correct: true, rationale: "Each metric pieces together this picture." },
          { id: "b", text: "Local-only, requires admin privileges.", correct: false, rationale: "AV:N is network, PR:N is no privileges." },
          { id: "c", text: "Exploitable only by physically present attackers.", correct: false, rationale: "AV:P would indicate physical." },
          { id: "d", text: "Affects only availability.", correct: false, rationale: "All three CIA metrics are H." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "risk-good-vs-bad-requirement",
    title: "Bad security requirement: 'use AES'",
    summary:
      "A draft security requirement says: 'Personal data shall be encrypted with AES.'",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["security-requirements"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "A good requirement is testable, scoped, and outcome-oriented. 'Use AES' tells implementers nothing about mode, key size, key management, or whether it covers data-at-rest, in-transit, or both. A better requirement: 'Personal data shall be encrypted in transit using TLS 1.2+ with strong cipher suites and at rest using AES-256-GCM with keys managed by an approved KMS, rotated at least annually.'",
    examKeywords: [
      "specific",
      "testable",
      "key management",
      "in transit",
      "at rest",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Why is 'Use AES' a poor security requirement?",
        options: [
          { id: "a", text: "It is not specific or testable, omits mode and key management, and doesn't say where it applies.", correct: true, rationale: "Good requirements pin down the testable outcome." },
          { id: "b", text: "AES is too slow for production.", correct: false, rationale: "AES is fast and hardware-accelerated." },
          { id: "c", text: "AES is illegal in the EU.", correct: false, rationale: "It is not." },
          { id: "d", text: "AES is deprecated.", correct: false, rationale: "AES is the standard symmetric cipher." },
        ],
      },
      explainPrompt:
        "Rewrite 'Personal data shall be encrypted with AES' as a strong, testable security requirement.",
    },
  }),
];
