import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const EXPLAIN_AND_MC = [GAME_MODE_IDS.explainExam, GAME_MODE_IDS.multipleChoiceSprint] as const;

export const securityBasicsChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "basics-cia",
    title: "CIA triad in a payment service",
    summary:
      "A payments team is asked which property of the CIA triad fails when an attacker is able to alter transfer amounts in flight.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["cia"],
    vulnerableLines: [],
    vulnerabilityType: "Conceptual",
    fixOptions: [],
    explanation:
      "Confidentiality protects against unauthorised disclosure; integrity protects against unauthorised modification; availability protects against unauthorised denial of access. An on-path attacker rewriting amounts breaks integrity (and consequently undermines non-repudiation in the audit trail).",
    examKeywords: ["confidentiality", "integrity", "availability", "non-repudiation"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Modifying transfer amounts in flight primarily attacks which property?",
        options: [
          { id: "a", text: "Integrity", correct: true, rationale: "Unauthorised modification of data in transit." },
          { id: "b", text: "Confidentiality", correct: false, rationale: "Disclosure isn't the attack here." },
          { id: "c", text: "Availability", correct: false, rationale: "Service is still up." },
          { id: "d", text: "Authentication", correct: false, rationale: "Auth is not in the CIA triad." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "basics-defense-in-depth",
    title: "Why one strong control isn't enough",
    summary:
      "A team argues that since their WAF blocks SQL injection, the application code can keep concatenating SQL.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["defense-in-depth"],
    vulnerableLines: [],
    vulnerabilityType: "Conceptual",
    fixOptions: [],
    explanation:
      "Defence in depth assumes any single control will eventually fail (configuration drift, bypasses, edge cases). Application-level controls (parameterised queries) and perimeter controls (WAF) reinforce each other. Relying on one control concentrates risk and creates monoculture failure.",
    examKeywords: [
      "defense in depth",
      "fail securely",
      "least privilege",
      "compensating control",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Why is relying solely on a WAF risky for SQLi?",
        options: [
          { id: "a", text: "WAFs have known bypasses; defence in depth requires the app to also use parameterised queries.", correct: true, rationale: "Multiple, independent controls limit the blast radius of any single failure." },
          { id: "b", text: "WAFs are too slow.", correct: false, rationale: "Performance isn't the security argument." },
          { id: "c", text: "WAFs require admin access to configure.", correct: false, rationale: "Operational not security." },
          { id: "d", text: "WAFs cannot read TLS traffic.", correct: false, rationale: "They typically can in a deployed setup." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "basics-fail-securely",
    title: "Fail-securely in an authorisation check",
    summary:
      "An access-check function returns `true` when the upstream identity provider times out.",
    courseTopic: "security-basics",
    difficulty: "core",
    tags: ["fail-securely"],
    vulnerableLines: [],
    vulnerabilityType: "Insecure Failure Mode",
    fixOptions: [],
    explanation:
      "When a security-critical service fails, the safe default is to deny (`fail-closed`). Returning `true` on timeout opens access during the moments your security infrastructure is weakest (which is exactly when attackers may exploit the situation, e.g. by inducing the timeout).",
    examKeywords: ["fail securely", "fail closed", "default deny", "timeout"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "What should an authorisation check return when its dependency times out?",
        options: [
          { id: "a", text: "Deny by default and log/alert.", correct: true, rationale: "Fail-closed minimises exposure during incidents." },
          { id: "b", text: "Allow temporarily so users aren't disrupted.", correct: false, rationale: "Allows attackers to induce the failure and gain access." },
          { id: "c", text: "Pick at random.", correct: false, rationale: "Unsafe and unpredictable." },
          { id: "d", text: "Cache the previous answer indefinitely.", correct: false, rationale: "Stale auth decisions cause inconsistencies." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "basics-least-privilege-cron",
    title: "Cron job with sudo access for one operation",
    summary:
      "A cron job needs to restart a service daily and the team grants the cron user full sudo.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["least-privilege"],
    vulnerableLines: [],
    vulnerabilityType: "Excess Privilege",
    fixOptions: [],
    explanation:
      "Least privilege says give a principal exactly the rights it needs and no more. A blanket `ALL` in sudoers grants every other capability too. The right approach is a sudoers entry that allows only the specific systemctl command without a password and nothing else.",
    examKeywords: ["least privilege", "sudoers", "scoped", "capabilities"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which approach honours least privilege for a cron job that needs only `systemctl restart svc`?",
        options: [
          { id: "a", text: "A sudoers rule scoped to that single command for that user.", correct: true, rationale: "Grants exactly the required capability." },
          { id: "b", text: "Adding the cron user to the sudo group.", correct: false, rationale: "Grants far more than needed." },
          { id: "c", text: "Running cron as root for simplicity.", correct: false, rationale: "Gives every cron job full privilege." },
          { id: "d", text: "Granting the user CAP_SYS_ADMIN.", correct: false, rationale: "Equivalent to root for many operations." },
        ],
      },
    },
  }),
];
