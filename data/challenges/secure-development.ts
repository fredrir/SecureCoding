import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const EXPLAIN_AND_MC = [GAME_MODE_IDS.explainExam, GAME_MODE_IDS.multipleChoiceSprint] as const;

export const secureDevelopmentChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "sdlc-shift-left",
    title: "Where security touches the SDLC",
    summary:
      "Map a typical SDLC to the seven McGraw touchpoints. What happens during requirements vs. testing?",
    courseTopic: "secure-development",
    difficulty: "core",
    tags: ["sdlc", "touchpoints"],
    vulnerableLines: [],
    vulnerabilityType: "Process",
    fixOptions: [],
    explanation:
      "McGraw's seven touchpoints: code review, architectural risk analysis, penetration testing, risk-based security tests, abuse cases, security requirements, and security operations. Early-phase touchpoints (requirements, abuse cases, risk analysis) shape the design; later-phase touchpoints (code review, pen testing, security tests) verify it; ops feed lessons back. Shifting controls left lowers cost-of-fix.",
    examKeywords: [
      "touchpoints",
      "abuse cases",
      "code review",
      "risk analysis",
      "shift left",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which McGraw touchpoint belongs primarily to the requirements phase?",
        options: [
          { id: "a", text: "Security requirements and abuse cases.", correct: true, rationale: "Both happen alongside functional requirements." },
          { id: "b", text: "Penetration testing.", correct: false, rationale: "Pen testing is a verification activity." },
          { id: "c", text: "Security operations.", correct: false, rationale: "Ops is post-deploy." },
          { id: "d", text: "Code review.", correct: false, rationale: "Code review is implementation phase." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "sdlc-sast-vs-dast",
    title: "When to use SAST vs. DAST",
    summary:
      "A team is choosing between SAST and DAST for their CI pipeline.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["sast", "dast"],
    vulnerableLines: [],
    vulnerabilityType: "Tooling",
    fixOptions: [],
    explanation:
      "SAST analyses source code statically and is best at finding patterns like injection sinks, hardcoded secrets, and unsafe APIs early. DAST runs against a deployed instance and finds runtime configuration issues, missing headers, broken authentication. They are complementary; mature programs use both, plus IAST/SCA for dependency risk.",
    examKeywords: ["sast", "dast", "sca", "false positive", "complementary"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which class of issues is DAST better suited to find than SAST?",
        options: [
          { id: "a", text: "Misconfigured response headers and broken auth in a running app.", correct: true, rationale: "DAST sees runtime behaviour." },
          { id: "b", text: "Hardcoded secrets in source.", correct: false, rationale: "SAST excels at this." },
          { id: "c", text: "Insecure use of `eval` in a function.", correct: false, rationale: "SAST again." },
          { id: "d", text: "Outdated npm packages.", correct: false, rationale: "That's SCA territory." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "sdlc-bsimm-maturity",
    title: "Reading a maturity-model finding",
    summary:
      "An assessment finds the team has informal code review but no documented secure coding standard or training program.",
    courseTopic: "secure-development",
    difficulty: "core",
    tags: ["maturity"],
    vulnerableLines: [],
    vulnerabilityType: "Process Maturity Gap",
    fixOptions: [],
    explanation:
      "Maturity models like BSIMM/SAMM measure security practices across domains (governance, intelligence, SSDL touchpoints, deployment). Informal reviews without a documented standard or training are signs of a low-maturity practice. Improvements include publishing a coding standard, security champions per team, and onboarding training. Maturity is climbed in small repeatable steps, not by buying a tool.",
    examKeywords: ["bsimm", "samm", "champions", "standard", "training"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "What is a maturity model good at telling you?",
        options: [
          { id: "a", text: "Where your security practices stand and a roadmap for improvement.", correct: true, rationale: "BSIMM/SAMM are diagnostic and prescriptive." },
          { id: "b", text: "Specific CVEs in your codebase.", correct: false, rationale: "That's vulnerability scanning." },
          { id: "c", text: "Operational latency of your services.", correct: false, rationale: "Unrelated." },
          { id: "d", text: "GDPR fines you might face.", correct: false, rationale: "Different domain." },
        ],
      },
    },
  }),
];
