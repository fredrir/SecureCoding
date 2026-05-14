import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const EXPLAIN_AND_MC = [
  GAME_MODE_IDS.explainExam,
  GAME_MODE_IDS.multipleChoiceSprint,
] as const;

export const privacyChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "gdpr-marketing-without-consent",
    title: "Sign-up form opts everyone into marketing email",
    summary:
      "A new product feature ticks a `Send me product news` checkbox by default during signup.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["consent", "marketing"],
    vulnerableLines: [],
    vulnerabilityType: "Invalid Consent (GDPR Art. 7)",
    fixOptions: [],
    explanation:
      "GDPR-compliant consent must be freely given, specific, informed, and unambiguous, and given by a clear affirmative action. Pre-ticked boxes do not constitute consent (recital 32). Marketing must be opt-in, with clear separation from the core service contract, and an equally easy way to withdraw consent.",
    examKeywords: [
      "consent",
      "opt-in",
      "freely given",
      "withdraw",
      "recital 32",
    ],
    owaspTop10: undefined,
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Why is the pre-ticked marketing box not valid GDPR consent?",
        options: [
          {
            id: "a",
            text: "Consent must be a clear affirmative action; pre-ticked boxes don't qualify.",
            correct: true,
            rationale: "GDPR Recital 32 explicitly excludes pre-ticked boxes.",
          },
          {
            id: "b",
            text: "Marketing emails are illegal in the EU.",
            correct: false,
            rationale: "They are legal with proper consent.",
          },
          {
            id: "c",
            text: "It's fine if the user can unsubscribe later.",
            correct: false,
            rationale:
              "Withdrawal is required but doesn't validate the original consent.",
          },
          {
            id: "d",
            text: "It's fine because it relates to the same product.",
            correct: false,
            rationale:
              "Bundling separate purposes still requires distinct consent.",
          },
        ],
      },
      explainPrompt:
        "Explain why a pre-ticked marketing checkbox is not valid GDPR consent and what the correct consent flow looks like.",
    },
  }),

  buildChallenge({
    id: "gdpr-purpose-limitation-analytics",
    title: "Re-using support transcripts for ad targeting",
    summary:
      "The team wants to feed customer support transcripts into the marketing analytics tool to build advertising audiences.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["purpose-limitation", "analytics"],
    vulnerableLines: [],
    vulnerabilityType: "Purpose Limitation Violation",
    fixOptions: [],
    explanation:
      "Personal data collected for one purpose (customer support) cannot be re-used for an incompatible purpose (advertising) without a new lawful basis, typically fresh consent or a strong compatibility analysis (Art. 6(4)). The principle of purpose limitation (Art. 5(1)(b)) is a core tenet; minimisation and storage limitation also apply.",
    examKeywords: [
      "purpose limitation",
      "compatible",
      "lawful basis",
      "minimisation",
      "art. 5",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question:
          "What principle is most directly violated when the support team's transcripts are reused for ad targeting without notice?",
        options: [
          {
            id: "a",
            text: "Purpose limitation.",
            correct: true,
            rationale:
              "Data collected for support is being reused for an unrelated purpose.",
          },
          {
            id: "b",
            text: "Storage limitation.",
            correct: false,
            rationale:
              "Storage limitation governs how long data is kept, not the reuse.",
          },
          {
            id: "c",
            text: "Right to portability.",
            correct: false,
            rationale:
              "Portability is a data-subject right, not the principle here.",
          },
          {
            id: "d",
            text: "Lawfulness in cookie banners.",
            correct: false,
            rationale: "Unrelated to the scenario.",
          },
        ],
      },
      explainPrompt:
        "Explain which GDPR principles are at stake when reusing support transcripts for advertising and what would need to change for this to be lawful.",
    },
  }),

  buildChallenge({
    id: "gdpr-dpia-trigger",
    title: "Does this feature need a DPIA?",
    summary:
      "The product team plans to release an automated decision-making feature that scores loan applications using profiling on customer financial data.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["dpia", "profiling"],
    vulnerableLines: [],
    vulnerabilityType: "Missing DPIA",
    fixOptions: [],
    explanation:
      "Article 35 GDPR requires a DPIA whenever processing is likely to result in a high risk. Automated decisions with legal or similarly significant effects (such as loan decisions) and large-scale processing of special categories almost always trigger it. The DPIA describes the processing, evaluates necessity and proportionality, and identifies risks and mitigations.",
    examKeywords: [
      "dpia",
      "automated decision",
      "profiling",
      "art. 35",
      "high risk",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which scenario most clearly mandates a DPIA under Art. 35?",
        options: [
          {
            id: "a",
            text: "Automated loan-eligibility decisions based on profiling.",
            correct: true,
            rationale:
              "Automated decisions with legal/significant effect are explicitly listed.",
          },
          {
            id: "b",
            text: "Sending an internal monthly metrics email.",
            correct: false,
            rationale: "Internal aggregate metrics are low-risk.",
          },
          {
            id: "c",
            text: "Storing employee phone numbers in a contact list.",
            correct: false,
            rationale: "Limited, expected processing of contact data.",
          },
          {
            id: "d",
            text: "Replacing one CRM tool with another.",
            correct: false,
            rationale: "Not a new processing risk by itself.",
          },
        ],
      },
      explainPrompt:
        "Explain why a loan-decisioning feature triggers a DPIA and outline the questions a DPIA must answer.",
    },
  }),

  buildChallenge({
    id: "gdpr-data-minimisation-form",
    title: "Newsletter form asks for date of birth and address",
    summary:
      "A blog newsletter signup requires email, full name, date of birth, and home address.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["minimisation"],
    vulnerableLines: [],
    vulnerabilityType: "Excessive Data Collection",
    fixOptions: [],
    explanation:
      "Data minimisation (Art. 5(1)(c)) requires collecting only data that is adequate, relevant, and limited to what is necessary. A newsletter needs an email address and arguably a name; date of birth and home address are excessive and create regulatory and breach risk for no benefit.",
    examKeywords: ["minimisation", "necessity", "art. 5", "excessive"],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question:
          "What's the right action when the newsletter form collects more than necessary?",
        options: [
          {
            id: "a",
            text: "Drop the unnecessary fields and document why each remaining field is needed.",
            correct: true,
            rationale: "Minimisation in design and an audit trail.",
          },
          {
            id: "b",
            text: "Keep the fields but encrypt them.",
            correct: false,
            rationale: "Encryption doesn't satisfy minimisation.",
          },
          {
            id: "c",
            text: "Show a banner explaining why the data is collected.",
            correct: false,
            rationale: "Transparency does not legitimise excess collection.",
          },
          {
            id: "d",
            text: "Move the data to a separate database.",
            correct: false,
            rationale: "Storage location is irrelevant.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "gdpr-controller-vs-processor",
    title: "Who is the controller in a SaaS scenario?",
    summary:
      "A SaaS support-ticket platform processes its customers' end-users' personal data on the customer's behalf.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["roles"],
    vulnerableLines: [],
    vulnerabilityType: "Roles & Responsibilities (GDPR)",
    fixOptions: [],
    explanation:
      "The customer (the company using the SaaS) decides the purposes and means of processing, so they are the controller. The SaaS provider only processes data on instruction, making it a processor and need a Data Processing Agreement (Art. 28). Transparency, data-subject rights, and lawful basis stay with the controller; the processor inherits security and breach-notification duties.",
    examKeywords: [
      "controller",
      "processor",
      "art. 28",
      "data processing agreement",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "In a SaaS support tool, the SaaS vendor is typically the:",
        options: [
          {
            id: "a",
            text: "Processor, with the customer as controller.",
            correct: true,
            rationale: "The customer determines purposes and means.",
          },
          {
            id: "b",
            text: "Controller of all data in the tool.",
            correct: false,
            rationale:
              "Only when the SaaS decides purposes (e.g., its own analytics).",
          },
          {
            id: "c",
            text: "Joint controller in every case.",
            correct: false,
            rationale:
              "Joint controllership requires shared determination of purposes/means.",
          },
          {
            id: "d",
            text: "Neither; the data subject is the only data handler.",
            correct: false,
            rationale: "Doesn't match GDPR's role model.",
          },
        ],
      },
      explainPrompt:
        "Explain the difference between controller and processor in a SaaS scenario and what contractual instrument bridges them.",
    },
  }),
  buildChallenge({
    id: "stride-six-categories",
    title: "Recognising STRIDE",
    summary:
      "A team wants a structured way to brainstorm threats against a data-flow diagram.",
    courseTopic: "threat-modeling",
    difficulty: "intro",
    tags: ["stride", "threat-modeling"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling Gap",
    fixOptions: [],
    explanation:
      "STRIDE is a threat categorisation framework: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege. It is commonly used with data-flow diagrams to ask systematic questions about assets, trust boundaries, processes, data stores, and data flows.",
    examKeywords: [
      "STRIDE",
      "spoofing",
      "tampering",
      "repudiation",
      "information disclosure",
      "denial of service",
      "elevation of privilege",
    ],
    supportedModes: EXPLAIN_AND_MC,
    modeData: {
      multipleChoice: {
        question: "Which statement about STRIDE is correct?",
        options: [
          {
            id: "a",
            text: "STRIDE is used to identify and categorise threats using six threat categories.",
            correct: true,
            rationale: "Correct: S, T, R, I, D, and E.",
          },
          {
            id: "b",
            text: "STRIDE focuses only on physical security.",
            correct: false,
            rationale: "STRIDE is used for software/system threat modeling.",
          },
          {
            id: "c",
            text: "STRIDE is a cryptographic protocol for authenticating users.",
            correct: false,
            rationale: "It is not a protocol.",
          },
          {
            id: "d",
            text: "STRIDE is only used after a system has been compromised.",
            correct: false,
            rationale: "It is mainly used during design and review.",
          },
        ],
      },
      explainPrompt:
        "List the six STRIDE categories and give a concrete software example for at least three of them.",
    },
  }),
];
