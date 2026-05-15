import type { Challenge, CodeSnippet } from "@/domain/challenge";
import type { MultipleChoiceOption } from "@/domain/challenge";
import type { CodeLanguage } from "@/domain/language";
import type { CourseTopic } from "@/domain/topic";
import { GAME_MODE_IDS } from "@/domain/gameMode";
import { buildChallenge } from "../builder";

const EXAM_MODES = [
  GAME_MODE_IDS.examSprint,
  GAME_MODE_IDS.explainExam,
  GAME_MODE_IDS.multipleChoiceSprint,
] as const;

interface ExamQuestion {
  readonly id: string;
  readonly sourceLabel: string;
  readonly title: string;
  readonly summary: string;
  readonly courseTopic: CourseTopic;
  readonly difficulty: Challenge["difficulty"];
  readonly tags: readonly string[];
  readonly vulnerabilityType: string;
  readonly verbatimPrompt?: string;
  readonly verbatimCode?: string;
  readonly code?: string;
  readonly codeSnippets?: readonly CodeSnippet[];
  readonly language?: CodeLanguage;
  readonly filename?: string;
  readonly vulnerableLines?: readonly number[];
  readonly explanation: string;
  readonly examKeywords: readonly string[];
  readonly mc: {
    readonly question: string;
    readonly correct?: string;
    readonly distractors?: readonly string[];
    readonly options?: readonly MultipleChoiceOption[];
    readonly verbatimOptions?: readonly MultipleChoiceOption[];
    readonly modifiedFromOpenQuestion?: boolean;
  };
}

function examQuestion(q: ExamQuestion): Challenge {
  const code = q.verbatimCode ?? q.code;
  const isModified =
    q.mc.modifiedFromOpenQuestion ?? !isOriginalMultipleChoice(q.sourceLabel);
  // For modified (open-answer) questions use the purpose-written MC question.
  // For original MC questions use the verbatim exam wording.
  const prompt = isModified
    ? q.mc.question
    : (q.verbatimPrompt ?? q.mc.question);
  const options = q.mc.verbatimOptions ?? q.mc.options ?? builtOptions(q);

  return buildChallenge({
    id: q.id,
    title: q.title,
    summary: q.summary,
    sourceLabel: q.sourceLabel,
    pointsLabel: pointsLabelFor(q.sourceLabel, q.verbatimPrompt),
    courseTopic: q.courseTopic,
    difficulty: q.difficulty,
    tags: ["exam", sourceTag(q.sourceLabel), ...q.tags],
    code: code || undefined,
    codeSnippets: q.codeSnippets,
    language: q.language,
    filename: q.filename,
    vulnerableLines: q.vulnerableLines ?? [],
    vulnerabilityType: q.vulnerabilityType,
    fixOptions: [],
    explanation: q.explanation,
    examKeywords: q.examKeywords,
    supportedModes: EXAM_MODES,
    modeData: {
      explainPrompt: q.verbatimPrompt ?? q.summary,
      multipleChoice: {
        question: prompt,
        modifiedFromOpenQuestion:
          q.mc.modifiedFromOpenQuestion ??
          !isOriginalMultipleChoice(q.sourceLabel),
        options,
      },
    },
  });
}

function builtOptions(q: ExamQuestion): readonly MultipleChoiceOption[] {
  if (!q.mc.correct || !q.mc.distractors) {
    throw new Error(`Missing exam options for ${q.id}`);
  }

  return [
    {
      id: "a",
      text: q.mc.correct,
      correct: true,
      rationale: "This matches the grading guide for the exam task.",
    },
    ...q.mc.distractors.map((text, index) => ({
      id: String.fromCharCode(98 + index),
      text,
      correct: false,
      rationale: "This misses an important security concept from the task.",
    })),
  ];
}

function sourceTag(label: string): string {
  return label.toLowerCase().replace(/,/g, "").replace(/\s+/g, "-");
}

function isOriginalMultipleChoice(label: string): boolean {
  const match = label.match(/^Exam (2023|2024|2025), Task (\d+)$/);
  if (!match) return false;
  const year = match[1];
  const task = Number(match[2]);
  if (year === "2023") return task >= 16 && task <= 33;
  if (year === "2024") return task >= 15 && task <= 32;
  if (year === "2025") return task >= 14 && task <= 34;
  return false;
}

function pointsLabelFor(
  sourceLabel: string,
  prompt?: string,
): string | undefined {
  const fromPrompt = prompt?.match(/\((\d+)\s*[Pp]oints?\)/);
  if (fromPrompt) {
    return `${fromPrompt[1]} ${fromPrompt[1] === "1" ? "point" : "points"}`;
  }

  const taskMatch = sourceLabel.match(/^Exam (2023|2024|2025), Task (\d+)$/);
  if (!taskMatch) return undefined;

  const year = taskMatch[1];
  const task = Number(taskMatch[2]);
  if (year === "2023") {
    if (task === 1) return "26 points";
    if (task >= 2 && task <= 15) return "4 points";
    if (task >= 16 && task <= 33) return "1 point";
  }
  if (year === "2024") {
    if (task === 1) return "30 points";
    if (task >= 2 && task <= 14) return "4 points";
    if (task >= 15 && task <= 32) return "1 point";
  }
  if (year === "2025") {
    if (task === 1) return "30 points";
    if (task >= 2 && task <= 5) return "4 points";
    if (task === 6) return "3 points";
    if (task === 7) return "3 points";
    if (task === 8) return "3 points";
    if (task === 9) return "4 points";
    if (task === 10) return "4 points";
    if (task === 11) return "4 points";
    if (task === 12) return "5 points";
    if (task === 13) return "3 points";
    if (task >= 14 && task <= 21) return "1 point";
    if (task >= 22 && task <= 25) return "2 points";
    if (task >= 26 && task <= 34) return "1 point";
  }

  return undefined;
}

export const examQuestionChallenges: readonly Challenge[] = [
  examQuestion({
    id: "exam-2023-task-2-password-exposure",
    sourceLabel: "Exam 2023, Task 2",
    title: "Protecting passwords in storage",
    summary:
      "A Python/MySQL user model stores usernames and plaintext passwords. Explain how passwords should be protected in the database and name another sensitive-data exposure vulnerability.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["passwords", "sensitive-data"],
    vulnerabilityType: "Sensitive Data Exposure",
    verbatimPrompt:
      "1) In this example, the code is vulnerable to sensitive data exposure because it stores the user's\n    password in plain text. What measures should be taken to protect sensitive user data, such as\n    passwords, and can you explain how user passwords should be protected in the database?\n\n    2) List one other example of vulnerability that can expose sensitive information such as\n    passwords and explain briefly how the vulnerabilities could be exploited.",
    verbatimCode:
      'import mysql.connector\n    class User:\n       def __init__(self, username, password):\n         self.username = username\n         self.password = password\n         self.db = mysql.connector.connect(\n            host="localhost",\n            user="yourusername",\n            password="yourpassword",\n            database="yourdatabase"\n         )\n\n          # Store the username and password in the database\n          cursor = self.db.cursor()\n          sql = "INSERT INTO users (username, password) VALUES (%s, %s)"\n          val = (username, password)\n          cursor.execute(sql, val)\n          self.db.commit()',
    explanation:
      "Passwords should never be stored in plaintext. Store only a salted, slow password hash using a password KDF such as Argon2, bcrypt, scrypt, or PBKDF2 with a suitable work factor. Other exposure examples include verbose error messages, leaked backups, hardcoded secrets, logging secrets, or insecure transport.",
    examKeywords: [
      "salted password hash",
      "kdf",
      "bcrypt",
      "argon2",
      "no plaintext",
    ],
    mc: {
      question: "What is the central fix for plaintext password storage?",
      correct: "Store salted slow password hashes using a password KDF.",
      distractors: [
        "Encrypt all passwords with one reversible application key and display them on demand.",
        "Base64-encode the password before storing it.",
        "Store a fast unsalted SHA-256 digest for each password.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-3-heartbleed-cvss",
    sourceLabel: "Exam 2023, Task 3",
    title: "CVSS for Heartbleed",
    summary:
      "Choose CVSS base metrics for Heartbleed: a remote OpenSSL heartbeat bug leaks up to 64 kB of server memory without authentication.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["cvss", "heartbleed"],
    vulnerabilityType: "CVSS Scoring",
    verbatimPrompt:
      'You discovered a vulnerability in the OpenSSL library and want to describe the severity of this using the Common Vulnerability Scoring System (CVSS).\n\nAn attack can be performed like this: A successful attack requires only sending a specially crafted message to a web server running OpenSSL. The attacker constructs a malformed "heartbeat request" with a large field length and small payload size. The vulnerable server does not validate that the length of the payload against the provided field length and will return up to 64 kB of server memory to the attacker. It is likely that this memory was previously utilized by OpenSSL. Data returned may contain sensitive information such as encryption keys or user names and passwords that could be used by the attacker to launch further attacks.\n\nChoose among the following metrics as input for the base score (you don\'t have to give the score itself) and write those below: Attack vector: Network (N), Adjacent (A), Local (L), Physical (P) Attack Complexity: Low (L), High (H) Privileges required: None (N), Required (R) Scope: Unchanged (U), Changed (C) Confidentially impact: High (H), Low (L), None (N) Availability Impact: High (H), Low (L), None (N) Integrity impact: High (H), Low (L), None (N)',
    explanation:
      "The defensible base metrics are Network attack vector, Low attack complexity, No privileges required, Unchanged scope, High confidentiality impact, No integrity impact, and usually No availability impact for the described memory disclosure.",
    examKeywords: ["AV:N", "AC:L", "PR:N", "S:U", "C:H", "I:N", "A:N"],
    mc: {
      question:
        "Which impact dominates the Heartbleed scenario described in the exam?",
      correct: "Confidentiality, because server memory may disclose secrets.",
      distractors: [
        "Integrity, because the attacker changes database records.",
        "Availability, because the attack necessarily crashes the server.",
        "Physical access, because the attacker must reach the server hardware.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-8-one-time-pad",
    sourceLabel: "Exam 2023, Task 8",
    title: "One-time pad security limits",
    summary:
      "Explain OTP encryption/decryption, why OTP is perfectly secure when used correctly, why key reuse is insecure, and what ciphertext manipulation can do.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["otp", "integrity"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt:
      '1. Explain encryption and decryption algorithm of One Time Pad (OTP). 2. Why is it considered to be "perfectly secure"? 3. Explain why it is insecure to use the same key to encrypt two or several messages using OTP. 4. What can an attacker do if he/she can manipulate the cipher text?',
    explanation:
      "OTP encrypts by XORing plaintext with a truly random key of equal length, and decrypts by XORing the ciphertext with the same key. It is perfectly secret only if the key is random, secret, as long as the message, and used once. Key reuse lets attackers combine ciphertexts to learn relationships between plaintexts. OTP alone is malleable and gives no integrity.",
    examKeywords: [
      "xor",
      "random key",
      "same length",
      "key reuse",
      "malleability",
      "integrity",
    ],
    mc: {
      question: "Why is OTP key reuse dangerous?",
      correct:
        "XORing reused-key ciphertexts cancels the key and exposes relationships between plaintexts.",
      distractors: [
        "The reused key becomes shorter after each encryption.",
        "OTP becomes asymmetric encryption after reuse.",
        "Reuse only affects availability, not confidentiality.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-10-penetration-testing",
    sourceLabel: "Exam 2023, Task 10",
    title: "Penetration testing purpose",
    summary:
      "Explain what penetration testing is used for and how it differs from purely automated vulnerability scanning.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["pentest"],
    vulnerabilityType: "Security Testing",
    verbatimPrompt:
      "Explain the concept of Penetration Testing and its practical applications in modern-day cybersecurity. Provide examples of real-world scenarios where Penetration Testing can be utilized.",
    explanation:
      "Penetration testing is an authorised attempt to find and exploit weaknesses in a defined scope. It combines tools with human judgement to validate exploitability, chains, impact, and business context. Automated scanning is useful input, but it does not replace manual analysis.",
    examKeywords: [
      "authorised",
      "scope",
      "exploitability",
      "manual testing",
      "vulnerability scanning",
    ],
    mc: {
      question:
        "What distinguishes a penetration test from a basic automated scan?",
      correct:
        "A penetration test validates exploitability and impact using human judgement within a scope.",
      distractors: [
        "A penetration test never uses automated tools.",
        "A scan always proves business impact more accurately.",
        "A penetration test is only a compliance document.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-12-malicious-ai",
    sourceLabel: "Exam 2023, Task 12",
    title: "Malicious AI concepts",
    summary:
      "Explain malicious AI risks, including attacks that use AI and attacks that abuse an AI system itself.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["malicious-ai"],
    vulnerabilityType: "AI Security",
    verbatimPrompt:
      "Your car uses a camera and AI to recognize road signs along the way. Mention at least four ways a malicious actor could attack the AI system?",
    explanation:
      "Malicious use of AI means using AI as a tool for harm, such as phishing, malware generation, or reconnaissance. Malicious abuse of AI targets the AI system or its guardrails, such as prompt injection, data poisoning, model extraction, or evasion.",
    examKeywords: [
      "malicious use",
      "abuse of ai",
      "prompt injection",
      "data poisoning",
      "phishing",
    ],
    mc: {
      question: "Which example is malicious abuse of an AI system?",
      correct:
        "Prompt injection that makes a model ignore its intended instructions.",
      distractors: [
        "Using a spell checker to improve a phishing email.",
        "Using an LLM to summarize public documentation.",
        "Using AI to classify normal support tickets.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-14-fix-vulnerability",
    sourceLabel: "Exam 2023, Task 14",
    title: "Fixing vulnerable code",
    summary:
      "Given vulnerable code, identify the main vulnerability, explain how it can be exploited, and write the minimal code changes that fix it.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-review", "fix"],
    code: `from django.db import connection
from django.http import HttpResponse


def my_view(request):
    # Get the user's input from the request
    user_input = request.GET.get('input')

    # Construct a raw SQL query
    query = "SELECT * FROM my_table WHERE column='%s'" % user_input

    # Execute the query
    cursor = connection.cursor()
    cursor.execute(query)

    # Process the results
    results = cursor.fetchall()

    # Return the results as an HTTP response
    return HttpResponse(results)`,
    language: "python",

    vulnerabilityType: "Secure Coding",
    verbatimPrompt:
      "1. What is the main vulnerability here?\n     2. How can it be exploited (give example)?\n     3. Explain how it can be fixed\n     4. Write the code that fixes it (only the lines that need fixing)",
    verbatimCode:
      "from django.db import connection\n     from django.http import HttpResponse\n     def my_view(request):\n        # Get the user's input from the request\n        user_input = request.GET.get('input')\n        # Construct a raw SQL query\n        query = \"SELECT * FROM my_table WHERE column='%s'\" % user_input\n        # Execute the query\n        cursor = connection.cursor()\n        cursor.execute(query)\n        # Process the results\n        results = cursor.fetchall()\n        # Return the results as an HTTP response\n        return HttpResponse(results)",
    explanation:
      "A strong answer names the vulnerability precisely, shows a concrete exploit path, explains impact, and fixes the root cause rather than only filtering one payload. Typical fixes include parameterized queries, context-aware output encoding, authorization checks, safe parsers, and secure framework APIs.",
    examKeywords: [
      "identify",
      "exploit",
      "root cause",
      "minimal fix",
      "secure api",
    ],
    mc: {
      question:
        "Which approach correctly fixes the SQL injection in this Django view?",
      correct:
        "Use Django's parameterized query API (cursor.execute with a params tuple) instead of string formatting.",
      distractors: [
        "Hide the error message while leaving the vulnerable sink unchanged.",
        "Add a comment saying the input is trusted.",
        "Block one example payload with a string replacement.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-4-technical-risks",
    sourceLabel: "Exam 2023 Case, Task 4",
    title: "Technical risks from a threat model",
    summary:
      "Based on a DFD for a football-club streaming system, identify at least five technical risks and evaluate them.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "technical-risk"],
    vulnerabilityType: "Risk Assessment",
    verbatimPrompt:
      "Task 4: Based on your threat model (data flow diagram), identify at least 5 technical risks. You should describe necessary assumption related to the technology. Link these to the business risks. (4 points)",
    explanation:
      "Good technical risks connect threat, vulnerable asset, likelihood, and impact. For a streaming service, examples include account takeover, privacy leakage, unauthorized stream access, denial of service during matches, insecure payment handling, and tampering with media or club data.",
    examKeywords: [
      "asset",
      "threat",
      "likelihood",
      "impact",
      "risk evaluation",
    ],
    mc: {
      question: "What makes a technical risk answer strong?",
      correct:
        "It links a concrete threat to an asset and evaluates likelihood and impact.",
      distractors: [
        "It only lists generic vulnerabilities without context.",
        "It only names business goals.",
        "It avoids assumptions even when the case is incomplete.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-5-security-requirements",
    sourceLabel: "Exam 2023 Case, Task 5",
    title: "Security requirements from risks",
    summary:
      "Select at least three technical risks from the case and define one well-formulated security requirement for each.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "requirements"],
    vulnerabilityType: "Security Requirements",
    verbatimPrompt:
      "Task 5. Select at least 3 technical risks and define one well-formulated security requirement for each as part of a risk mitigation strategy. (3 points)",
    explanation:
      "A well-formulated security requirement is specific, testable, and linked to the risk it mitigates. It should state what the system must do, for which asset or user group, and often includes measurable criteria such as authentication strength, authorization rules, logging, retention, or availability targets.",
    examKeywords: [
      "specific",
      "testable",
      "linked to risk",
      "shall",
      "measurable",
    ],
    mc: {
      question: "Which requirement is best formulated?",
      correct:
        "The system shall require MFA for administrator accounts before stream-management access is granted.",
      distractors: [
        "The system should be secure.",
        "Hackers must not get in.",
        "Users should probably use good passwords sometimes.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-4-reset-token-link",
    sourceLabel: "Exam 2023, Task 4",
    title: "Password reset token in URL",
    summary:
      "Given a password-reset link containing a token in the query string, explain how it can be exploited and name at least two ways to protect such tokens.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["reset-token", "url-token"],
    vulnerabilityType: "Token Exposure",
    verbatimPrompt:
      "https://www.exampleTDT4237.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5crheyKiwIwk.eyJzdWIiOiIxMjM0NTY3ODkwIiwi\n\nGiven an Example of a vulnerable link:\n\n1) How can someone exploit this?\n\n2) What can you do to protect such tokens? Name at least 2 ways.",
    explanation:
      "A token in a URL can leak through browser history, logs, referrer headers, screenshots, or sharing. An attacker who obtains it may reset or take over the account. Protections include short expiry, single use, strong randomness, HTTPS, storing only hashed tokens server-side, avoiding tokens in URLs when possible, and requiring re-authentication or MFA for sensitive actions.",
    examKeywords: [
      "reset token",
      "url",
      "referrer",
      "expiry",
      "single use",
      "hashed token",
    ],
    mc: {
      question: "Which protection is appropriate for password-reset tokens?",
      correct:
        "Use random, single-use, short-lived tokens and avoid leaking them in logs or referrers.",
      distractors: [
        "Make reset tokens permanent so users can reuse old links.",
        "Store reset tokens in plaintext access logs.",
        "Use predictable user IDs as reset tokens.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-5-logging-monitoring-fix",
    sourceLabel: "Exam 2023, Task 5",
    title: "Fix logging and monitoring config",
    summary:
      "Given a Django LOGGING config with insufficient monitoring, propose code changes and explain how they fix the vulnerabilities.",
    courseTopic: "security-basics",
    difficulty: "core",
    tags: ["logging", "monitoring", "django"],
    vulnerabilityType: "Logging and Monitoring Failure",
    verbatimPrompt:
      "The above code has insufficient security logging and monitoring vulnerabilities. Please propose a\n    solution (lines that needs to change and new code) to fix the vulnerabilities. Explain what you have\n    done.",
    verbatimCode:
      "LOGGING = {\n        'version': 1,\n        # Version of logging\n        'disable_existing_loggers': True,\n        #disable logging\n        # Handlers #############################################################\n        'handlers': {\n            'file': {\n                'level': 'WARNING',\n                'class': 'logging.FileHandler',\n                'filename': 'dataflair-debug.log',\n            },\n    ########################################################################\n            'console': {\n                'class': 'logging.StreamHandler',\n            },\n        },\n        # Loggers ####################################################################\n        'loggers': {\n            'django': {\n                'handlers': ['file', 'console'],\n                'level': 'LOGLEVEL',\n            },\n        },\n    }",
    code: `LOGGING = {
'version': 1,
# Version of logging
'disable_existing_loggers': True,
#disable logging
# Handlers ####################
'handlers': {
'file': {
'level': 'WARNING',
'class': 'logging.FileHandler',
'filename': 'dataflair-debug.log',
},
###############################
'console': {
'class': 'logging.StreamHandler',
},
},
# Loggers #####################
'loggers': {
'django': {
'handlers': ['file', 'console'],
'level': 'LOGLEVEL',
},
},
}`,
    language: "python",
    filename: "logging.py",
    explanation:
      "A good fix should keep important existing loggers enabled, use a real configured level such as INFO or WARNING rather than the string LOGLEVEL, and add monitoring or alerting for serious errors, for example an AdminEmailHandler or central log/SIEM handler. The key idea is that security-relevant events must be recorded and escalated.",
    examKeywords: [
      "disable_existing_loggers",
      "log level",
      "alerting",
      "AdminEmailHandler",
      "monitoring",
    ],
    mc: {
      question: "Which change best improves this logging configuration?",
      correct:
        "Use real log levels, keep useful loggers, and alert administrators on serious events.",
      distractors: [
        "Disable every existing logger and never alert operators.",
        "Write all logs only to a browser cookie.",
        "Delete timestamps and severity levels from logs.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-6-password-policy-code",
    sourceLabel: "Exam 2023, Task 6",
    title: "Django password policy code",
    summary:
      "Add Django validators for a password policy requiring at least 10 characters, all four character groups, no spaces, and no ae/oe/aa Norwegian letters.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["password-policy", "django"],
    vulnerabilityType: "Password Policy",
    verbatimPrompt:
      "Please add your extra code and explanation that takes care of the rest below.",
    verbatimCode:
      "Suppose the password policy of a system is as follows.\n    The password should be as long as possible and must contain at least 10 characters.\n    The passwords have to contain at least one character from the following four groups:\n\n           Upper-case letters: A-Z\n           Lower-case letters: a-z\n           Numbers: 0-9\n           The following special characters: !#()+,.=?@[]_{}-\n\n    Spaces and the letters \"æ\", \"ø\" and \"å\" are not accepted\n    Your task is to develop code and configure Password Validators in Django to check the policy.\n    The following code partly takes care of the policy:\n    AUTH_PASSWORD_VALIDATORS = [\n      {\n         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',\n         'OPTIONS': {\n            'min_length': 10,\n         }\n      {\n         'NAME': 'password_validators.validators.UppercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.LowercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.SymbolValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.NoNorValidator',\n      },\n    ]\n\n    class UppercaseValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[A-Z]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 uppercase letter, A-Z.\"),\n                code='password_no_upper',\n             )\n\n    class SymbolValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[()[\\]{}|\\\\`~!@#$%^&*_\\-+=;:\\'\",<>./?]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 special character: \" +\n                 \"()[]{}|\\`~!@#$%^&*_-+=;:'\\\",<>./?\"),\n                code='password_no_symbol',\n             )",
    code: `AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,
        }
    },
    {
        'NAME': 'password_validators.validators.UppercaseValidator',
    },
    {
        'NAME': 'password_validators.validators.LowercaseValidator',
    },
    {
        'NAME': 'password_validators.validators.SymbolValidator',
    },
    {
        'NAME': 'password_validators.validators.NoNorValidator',
    },
]`,
    language: "python",
    filename: "validators.py",
    explanation:
      "A complete answer adds missing validators for lowercase letters and digits, restricts the special-character set to the listed characters, rejects spaces and ae/oe/aa Norwegian letters, and keeps the minimum length of at least 10 characters.",
    examKeywords: [
      "minimum 10",
      "uppercase",
      "lowercase",
      "number",
      "symbols",
      "no spaces",
    ],
    mc: {
      question:
        "Which missing validator is required by the 2023 password policy?",
      correct:
        "A validator that checks for at least one number and one lowercase letter.",
      distractors: [
        "A validator that accepts spaces as strong characters.",
        "A validator that allows only passwords shorter than 8 characters.",
        "A validator that stores the password in plaintext.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-7-password-weaknesses",
    sourceLabel: "Exam 2023, Task 7",
    title: "Password authentication weaknesses",
    summary:
      "Give three weaknesses of password-based authentication and three ways to improve it.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["passwords", "authentication"],
    vulnerabilityType: "Password Authentication",
    verbatimPrompt:
      "Passwords is one of the most common ways to authenticate users, but it suffers from a number of weaknesses. Give three examples of such weaknesses. Further, give three examples of how password based authentication can be improved.",
    explanation:
      "Password weaknesses include reuse, guessing, phishing, credential stuffing, shoulder surfing, weak memorability, and database leaks. Improvements include MFA, password managers, rate limiting, breach checks, salted slow password hashing, strong reset flows, and user education.",
    examKeywords: [
      "password reuse",
      "phishing",
      "credential stuffing",
      "mfa",
      "password manager",
      "rate limiting",
    ],
    mc: {
      question: "Which pair improves password-based authentication?",
      correct: "Multi-factor authentication and salted slow password hashing.",
      distractors: [
        "Plaintext password storage and unlimited login attempts.",
        "Short reusable passwords and no reset protection.",
        "Logging every password attempt in plaintext.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-9-biba-bell-lapadula",
    sourceLabel: "Exam 2023, Task 9",
    title: "Biba vs Bell-LaPadula",
    summary:
      "Explain how Biba and Bell-LaPadula differ in enforcing integrity and confidentiality.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["biba", "bell-lapadula"],
    vulnerabilityType: "Access Control Model",
    verbatimPrompt:
      "How do the Biba and Bell-LaPadula models differ in their approach to enforcing data confidentiality and integrity?",
    explanation:
      "Bell-LaPadula protects confidentiality with no read up and no write down. Biba protects integrity with no read down and no write up, so low-integrity subjects cannot contaminate high-integrity objects.",
    examKeywords: [
      "bell-lapadula",
      "confidentiality",
      "biba",
      "integrity",
      "no read up",
      "no write down",
    ],
    mc: {
      question:
        "Which statement correctly distinguishes Bell-LaPadula from Biba?",
      correct:
        "Bell-LaPadula focuses on confidentiality, while Biba focuses on integrity.",
      distractors: [
        "Both models only handle password hashing.",
        "Biba is only about availability and backups.",
        "Bell-LaPadula requires public write access to all data.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-11-social-engineering-factors",
    sourceLabel: "Exam 2023, Task 11",
    title: "Social engineering susceptibility",
    summary:
      "Mention at least four psychological factors that make people susceptible to social engineering attacks.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["social-engineering", "psychology"],
    vulnerabilityType: "Social Engineering",
    verbatimPrompt:
      "Mention at least four psychological factors that makes us susceptible to social engineering attacks.",
    explanation:
      "Common factors include authority, urgency, fear, greed, curiosity, helpfulness, reciprocity, liking, social proof, scarcity or loss avoidance, and commitment to prior statements.",
    examKeywords: [
      "authority",
      "urgency",
      "fear",
      "curiosity",
      "reciprocity",
      "social proof",
    ],
    mc: {
      question: "Which factor can make social engineering more effective?",
      correct: "Authority or urgency that pressures the victim to act quickly.",
      distractors: [
        "A longer AES key in transit.",
        "A normalized database schema only.",
        "A hardware random number generator.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-13-salt-and-pepper",
    sourceLabel: "Exam 2023, Task 13",
    title: "Salt and pepper for passwords",
    summary:
      "Explain what attacks salt and pepper protect against, where each is stored, and when salt does not work.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["salt", "pepper", "password-hashing"],
    vulnerabilityType: "Password Hashing",
    verbatimPrompt:
      "Salt and pepper are used to protect against what kind of attack?\n\nWhere do you usually store your salt?\n\nWhen does the salt not work?\n\nWhere do you usually store your pepper?",
    explanation:
      "Salts and peppers help protect password hashes against precomputed/rainbow-table and large-scale cracking attacks. A salt is usually stored alongside the password hash and must be unique per password. Salt does not help much when the password itself is weak and the attacker can brute force it. A pepper is a secret shared value stored separately from the database, for example in configuration, an HSM, or a secret manager.",
    examKeywords: [
      "salt",
      "pepper",
      "rainbow table",
      "stored with hash",
      "secret manager",
      "weak password",
    ],
    mc: {
      question: "Where is a password pepper usually stored?",
      correct:
        "Separately from the password database, such as in a secret manager or HSM.",
      distractors: [
        "In the same public row as the salt and hash.",
        "Inside the user's browser history.",
        "As the username in the login form.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-15-secure-development-practices",
    sourceLabel: "Exam 2023, Task 15",
    title: "Secure development practices",
    summary:
      "Recommend at least four practices to improve software security in a new tech company.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["sdlc", "secure-development"],
    vulnerabilityType: "Secure Development",
    verbatimPrompt:
      "You are put in charge of improving the software security of a new tech company. Briefly explain some of the practices you would want to recommend using (at least 4).",
    explanation:
      "Useful practices include threat modeling, secure code review, static and dynamic analysis, dependency scanning, security requirements, developer training, secure coding standards, penetration testing, incident response planning, and security testing in CI/CD.",
    examKeywords: [
      "threat modeling",
      "code review",
      "static analysis",
      "dependency scanning",
      "training",
      "ci/cd",
    ],
    mc: {
      question: "Which practice belongs in a secure development program?",
      correct: "Threat modeling and security-focused code review.",
      distractors: [
        "Removing all tests to ship faster.",
        "Hardcoding production secrets in source code.",
        "Ignoring dependency updates forever.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-16-symmetric-algorithm",
    sourceLabel: "Exam 2023, Task 16",
    title: "Symmetric algorithm",
    summary:
      "Identify what a symmetric algorithm is and how it can secure data transmission.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["symmetric-encryption"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt:
      "What is a symmetric algorithm and how can it be used in software to ensure secure data transmission?",
    explanation:
      "A symmetric encryption algorithm uses the same key for encryption and decryption. Software can use it to encrypt data before transmission and decrypt it at the receiving end with the same shared key.",
    examKeywords: [
      "symmetric",
      "same key",
      "encryption",
      "decryption",
      "secure transmission",
    ],
    mc: {
      question: "What is a symmetric algorithm?",
      correct:
        "An encryption algorithm that uses the same key for both encryption and decryption.",
      distractors: [
        "A compression algorithm for reducing file size.",
        "A routing algorithm for directing network traffic.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "A symmetric algorithm is a type of encryption algorithm that uses the same key for both encryption and decryption. In software, symmetric algorithms can be used to encrypt data before it is transmitted over a network, and then decrypt it on the receiving end using the same key. This ensures that the data is secure and cannot be intercepted or read by unauthorized parties.",
          correct: true,
        },
        {
          id: "b",
          text: "A symmetric algorithm is a type of compression algorithm that is used to reduce the size of data before it is transmitted over a network. In software, symmetric algorithms can be used to compress large files or data sets, making them easier and faster to transmit over a network. This can help to improve network performance and reduce bandwidth usage.",
          correct: false,
        },
        {
          id: "c",
          text: "A symmetric algorithm is a type of routing algorithm that is used to direct network traffic between different nodes. In software, symmetric algorithms can be used to optimize network routing and ensure that data is transmitted along the most efficient path. This can help to improve network performance and reduce latency.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-17-session-hijacking",
    sourceLabel: "Exam 2023, Task 17",
    title: "Session hijacking mitigation",
    summary: "Identify an effective way to mitigate session hijacking attacks.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["session", "cookies"],
    vulnerabilityType: "Session Management",
    verbatimPrompt:
      "A web developer is looking to mitigate the risk of session hijacking attacks on their website. Which of the following options would be effective in preventing session hijacking?",
    explanation:
      "Setting HttpOnly and Secure flags on session cookies helps protect session tokens from client-side script access and ensures they are sent only over HTTPS.",
    examKeywords: [
      "httponly",
      "secure flag",
      "session cookie",
      "session hijacking",
    ],
    mc: {
      question: "Which option helps prevent session hijacking?",
      correct: 'Setting the "HttpOnly" and "secure" flags on session cookies.',
      distractors: [
        "Ensuring that only AES is used to encrypt TLS traffic.",
        "Signing the website certificate with a quantum-safe signature algorithm.",
        "Deploying the website on a blockchain.",
        "Enforcing a password policy of minimum 16 characters.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: 'Setting the "HttpOnly" and "secure" flags on session cookies',
          correct: true,
        },
        {
          id: "b",
          text: "Deploying the website on a blockchain",
          correct: false,
        },
        {
          id: "c",
          text: "Signing the website certificate with a quantum-safe signature algorithm",
          correct: false,
        },
        {
          id: "d",
          text: "Enforcing a password policy of minimum 16 characters",
          correct: false,
        },
        {
          id: "e",
          text: "Ensuring that only AES is used to encrypt TLS traffic",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-18-buffer-overflow-protection",
    sourceLabel: "Exam 2023, Task 18",
    title: "Buffer overflow protection",
    summary:
      "Identify recommended ways of defending against buffer overflow attacks.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["buffer-overflow", "memory-safety"],
    vulnerabilityType: "Memory Safety",
    verbatimPrompt:
      "What are some recommended ways of defending against buffer overflow attaks?",
    explanation:
      "Recommended defenses include safe string functions, compiler defenses, static analysis tools, bounds checks, memory-safe or type-safe languages, and careful input handling.",
    examKeywords: [
      "safe functions",
      "compiler defenses",
      "static analysis",
      "type-safe language",
    ],
    mc: {
      question: "What is a recommended buffer overflow defense?",
      correct:
        "Use safe functions, leverage compiler defenses, use static analysis tools, and rewrite in a type-safe language.",
      distractors: [
        "Use non-standard unsafe string functions such as strcpy and strcat.",
        "Close unused firewall ports and reduce the number of buffers.",
        "Use parameterized queries as the primary memory safety defense.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Use parameterized queries, limit access to memory, escape special characters, sanitize all input and ouput.",
          correct: false,
        },
        {
          id: "b",
          text: "Use safe functions, leverage defences in compilers, use static analysis tools, rewrite in a type-safe language.",
          correct: true,
        },
        {
          id: "c",
          text: "Use non-standard C functions to manipulate strings, such as strcpy and strcat. These will not lead to buffer overflow vulnerabilities found in standard C functions, such as strncpy and strncat.",
          correct: false,
        },
        {
          id: "d",
          text: "Close all unused ports in the firewall, reduce the number of buffers, fine programmers making coding mistakes.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-19-good-security-requirement",
    sourceLabel: "Exam 2023, Task 19",
    title: "Good security requirement",
    summary: "Identify what makes a good security requirement.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["security-requirements"],
    vulnerabilityType: "Security Requirements",
    verbatimPrompt: "What is a good security requirement?",
    explanation:
      "A good security requirement states what security property should be achieved, not a premature choice of protection mechanism or a vague statement of what should not happen.",
    examKeywords: ["what not how", "security requirement", "testable"],
    mc: {
      question: "What is a good security requirement?",
      correct: "Stating what should be achieved, not how.",
      distractors: [
        "Defining the choice of protection mechanism.",
        "A zero-knowledge proof.",
        "A functional requirement.",
        "Stating what should not happen to the system.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Defining the choice of protection mechanism",
          correct: false,
        },
        {
          id: "b",
          text: "Stating what should be achieved, not how",
          correct: true,
        },
        {
          id: "c",
          text: "Stating what should not happen to the system",
          correct: false,
        },
        {
          id: "d",
          text: "A zero-knowledge proof",
          correct: false,
        },
        {
          id: "e",
          text: "A functional requirement",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-20-mitigating-risks-roi",
    sourceLabel: "Exam 2023, Task 20",
    title: "Least effective breach mitigation ROI",
    summary:
      "After a database breach, identify the countermeasure with the least effective ROI for mitigating damage.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["incident-response", "risk-mitigation"],
    vulnerabilityType: "Risk Mitigation",
    verbatimPrompt:
      "In a scenario where a cyber attack has already compromised a company's database, which of the following countermeasures would provide the least effective return of investment (ROI) in terms of mitigating the damage caused by the breach?",
    explanation:
      "Pursuing legal action against attackers is usually least effective at reducing immediate breach damage. Incident response, forensics, segmentation, access control, endpoint protection, and intrusion detection can more directly limit and understand damage.",
    examKeywords: [
      "breach",
      "roi",
      "incident response",
      "legal action",
      "segmentation",
    ],
    mc: {
      question:
        "Which countermeasure has the least effective ROI for mitigating breach damage?",
      correct: "Pursuing legal action against the attackers.",
      distractors: [
        "Conducting regular vulnerability assessments and penetration testing.",
        "Deploying endpoint protection and intrusion detection systems.",
        "Investing in incident response and digital forensics capabilities.",
        "Implementing network segmentation and access controls.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Investing in incident response and digital forensics capabilities",
          correct: false,
        },
        {
          id: "b",
          text: "Implementing network segmentation and access controls",
          correct: false,
        },
        {
          id: "c",
          text: "Deploying endpoint protection solutions and intrusion detection systems",
          correct: false,
        },
        {
          id: "d",
          text: "Conducting regular vulnerability assessments and penetration testing",
          correct: false,
        },
        {
          id: "e",
          text: "Pursuing legal action against the attackers.",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-21-csrf-code",
    sourceLabel: "Exam 2023, Task 21",
    title: "CSRF in contact form",
    summary:
      "Identify the vulnerability in a Django contact form snippet and how it can be prevented.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "csrf", "django"],
    vulnerabilityType: "Cross-Site Request Forgery",
    verbatimPrompt:
      "What is the security vulnerability in this code and how can it be prevented?",
    verbatimCode:
      "from django.shortcuts import render\n     from django.http import HttpResponseRedirect\n     from django.urls import reverse\n     from .forms import ContactForm\n     def contact(request):\n        if request.method == 'POST':\n            form = ContactForm(request.POST)\n            if form.is_valid():\n                # Do something with the form data, like saving it to a database\n                name = request.POST.get('name')\n                email = request.POST.get('email')\n                message = request.POST.get('message')\n                return HttpResponseRedirect(reverse('contact_thanks'))\n        else:\n            form = ContactForm()\n        return render(request, 'contact.html', {'form': form})\n     def contact_thanks(request):\n        return render(request, 'contact_thanks.html')",
    code: `def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = request.POST.get('name')
            email = request.POST.get('email')
            message = request.POST.get('message')
            return HttpResponseRedirect(reverse('contact_thanks'))
    else:
        form = ContactForm()
    return render(request, 'contact.html', {'form': form})`,
    language: "python",
    filename: "views.py",
    explanation:
      "The expected answer is CSRF. A malicious site can trick an authenticated user into submitting a request. Use CSRF tokens and framework CSRF middleware to ensure submissions come from legitimate pages.",
    examKeywords: ["csrf", "token", "form submission", "middleware"],
    mc: {
      question: "What is the vulnerability and prevention?",
      correct:
        "Cross-Site Request Forgery; use CSRF tokens to ensure form submissions come from legitimate sources.",
      distractors: [
        "XSS; only sanitize output.",
        "SQL injection; only use parameterized database queries.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The security vulnerability in this code is Cross-Site Request Forgery (CSRF), which allows an attacker to trick a user into performing unintended actions on a website. To prevent this vulnerability, the code should use CSRF tokens to ensure that form submissions are coming from legitimate sources.",
          correct: true,
        },
        {
          id: "b",
          text: "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
          correct: false,
        },
        {
          id: "c",
          text: "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-22-key-generation",
    sourceLabel: "Exam 2023, Task 22",
    title: "Cryptographic key generation",
    summary:
      "Identify which method is not recommended for generating cryptographic keys.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["keys", "randomness"],
    vulnerabilityType: "Key Management",
    verbatimPrompt:
      "Which of the following methods is NOT a recommended approach for generating cryptographic keys?",
    explanation:
      "Reusing a previously generated key for a new encryption task is not recommended. Prefer secure randomness, hardware random sources, or appropriate key derivation from passphrases.",
    examKeywords: ["key reuse", "entropy", "kdf", "random number generator"],
    mc: {
      question:
        "Which method is not recommended for generating cryptographic keys?",
      correct: "Reusing a previously generated key for a new encryption task.",
      distractors: [
        "Deriving keys from a passphrase using a key derivation function.",
        "Collecting entropy from user-generated input such as mouse movements.",
        "Employing a secure pseudo-random number generator with unique seeds.",
        "Using a hardware random number generator.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Employing a software-based secure pseudo-random number generator with unique seeds",
          correct: false,
        },
        {
          id: "b",
          text: "Reusing a previously generated key for a new encryption task",
          correct: true,
        },
        {
          id: "c",
          text: "Collecting entropy from user-generated input, such as mouse movements or keyboard strokes.",
          correct: false,
        },
        {
          id: "d",
          text: "Deriving keys from a passphrase using a key derivation function",
          correct: false,
        },
        {
          id: "e",
          text: "Using a hardware random number generator",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-23-xml-injection",
    sourceLabel: "Exam 2023, Task 23",
    title: "XML injection",
    summary:
      "Identify the vulnerability in parsing user-supplied XML and how it can be prevented.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "xml", "xxe"],
    vulnerabilityType: "XML Injection",
    verbatimPrompt:
      "What is the security vulnerability in this code and how can it be prevented?",
    verbatimCode:
      'import xml.etree.ElementTree as ET\n     xml_string = input("Enter some XML: ")\n     root = ET.fromstring(xml_string)',
    code: `import xml.etree.ElementTree as ET
xml_string = input("Enter some XML: ")
root = ET.fromstring(xml_string)`,
    language: "python",
    filename: "xml_parse.py",
    explanation:
      "The expected answer is XML injection/XXE-style risk: malicious XML may include external entity references and expose files. Use a hardened parser and disable external entities.",
    examKeywords: [
      "xml injection",
      "external entity",
      "disable external entities",
      "parser",
    ],
    mc: {
      question: "What is the vulnerability and prevention?",
      correct: "XML injection; disable external entities in the XML parser.",
      distractors: [
        "SQL injection; use parameterized SQL queries.",
        "Cross-Site Scripting; sanitize browser output.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
          correct: false,
        },
        {
          id: "b",
          text: "The security vulnerability in this code is XML injection. An attacker could send a malicious XML payload that includes an external entity reference, allowing the attacker to read arbitrary files on the server. To prevent this type of attack, we can disable external entities in the XML parser",
          correct: true,
        },
        {
          id: "c",
          text: "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-24-command-injection-input",
    sourceLabel: "Exam 2023, Task 24",
    title: "Command injection payload",
    summary:
      "Identify which file-search input is a successful command injection attack.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["command-injection"],
    vulnerabilityType: "Command Injection",
    verbatimPrompt:
      "A web application allows users to search for files on the server by entering a file name into a search form. The application takes the user's input and runs it as a command on the server using the function system(). Which of the following inputs would be an example of a successful command injection attack?",
    explanation:
      "The payload `file.txt; rm -rf /` chains a second command after the intended file argument. The core issue is passing user input to `system()` without safe argument handling.",
    examKeywords: ["command injection", "system", "semicolon", "shell"],
    mc: {
      question:
        "Which input is an example of a successful command injection attack?",
      correct: '"file.txt; rm -rf /"',
      distractors: [
        '"file.txt"',
        "\"file.txt && echo 'hello'\"",
        "\"file.txt | grep 'secret'\"",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "\"file.txt && echo 'hello'\"",
          correct: false,
        },
        {
          id: "b",
          text: "\"file.txt | grep 'secret'\"",
          correct: false,
        },
        {
          id: "c",
          text: '"file.txt"',
          correct: true,
        },
        {
          id: "d",
          text: '"file.txt; rm -rf /"',
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-25-xss-from-database",
    sourceLabel: "Exam 2023, Task 25",
    title: "XSS from database output",
    summary:
      "Identify the vulnerability in printing a name fetched from a database.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["xss", "output-encoding"],
    vulnerabilityType: "Cross-Site Scripting",
    verbatimPrompt:
      "Consider the following code snippet:\n\nname = fetchNamefromDatabase() print('Hello, ' + name + '!')\n\nWhat is the security vulnerability in this code and how can it be prevented?",
    code: `name = fetchNamefromDatabase()
print('Hello, ' + name + '!')`,
    language: "python",
    filename: "greeting.py",
    explanation:
      "The expected answer is XSS: data fetched from a database can still be attacker-controlled. Sanitize input where appropriate and encode output for the rendering context.",
    examKeywords: ["xss", "database", "output encoding", "sanitize"],
    mc: {
      question: "What is the vulnerability and prevention?",
      correct: "Cross-Site Scripting; sanitize user input and encode output.",
      distractors: [
        "Cross-Site Request Forgery; use CSRF tokens.",
        "SQL injection; use parameterized SQL queries.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
          correct: false,
        },
        {
          id: "b",
          text: "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
          correct: true,
        },
        {
          id: "c",
          text: "The security vulnerability in this code is Cross-Site Request Forgery (CSRF), which allows an attacker to trick a user into performing unintended actions on a website. To prevent this vulnerability, the code should use CSRF tokens to ensure that form submissions are coming from legitimate sources.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-26-public-key-encryption",
    sourceLabel: "Exam 2023, Task 26",
    title: "Encrypting asymmetric messages",
    summary:
      "In an asymmetric key system, identify what key to use when sending an encrypted message to someone.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["public-key", "asymmetric"],
    vulnerabilityType: "Public-Key Cryptography",
    verbatimPrompt:
      "In an asymmetric key system, each user has a pair of keys: a private key and a public key. To send an encrypted message to someone, what must you encrypt the message with?",
    explanation:
      "To send an encrypted message to a recipient, encrypt with the recipient's public key. Only the recipient should be able to decrypt it with their private key.",
    examKeywords: ["recipient public key", "asymmetric", "private key"],
    mc: {
      question: "What must you encrypt the message with?",
      correct: "The recipient's public key.",
      distractors: [
        "Your private key.",
        "Your public key.",
        "The recipient's private key.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Your private key",
          correct: false,
        },
        {
          id: "b",
          text: "The recipient's private key",
          correct: false,
        },
        {
          id: "c",
          text: "Your public key",
          correct: false,
        },
        {
          id: "d",
          text: "The recipient's public key",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-27-cve-cvss",
    sourceLabel: "Exam 2023, Task 27",
    title: "CVE and CVSS purposes",
    summary: "Identify the purposes of CVE and CVSS.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["cve", "cvss"],
    vulnerabilityType: "Vulnerability Management",
    verbatimPrompt:
      "Which of following most accurately describe the purposes of CVE and CVSS?",
    explanation:
      "CVSS provides a severity score for vulnerabilities. CVE is a catalog of publicly known vulnerabilities with IDs, descriptions, and references.",
    examKeywords: [
      "cvss score",
      "cve id",
      "public vulnerabilities",
      "severity",
    ],
    mc: {
      question: "Which statement most accurately describes CVE and CVSS?",
      correct:
        "CVSS provides a score indicating vulnerability severity; CVE lists publicly known vulnerabilities with IDs, descriptions, and references.",
      distractors: [
        "CVSS lists top vulnerabilities and CVE is a list of scores.",
        "CVSS integrates all security tools and automates incident responses.",
        "CVSS is a low-and-slow attack style.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "CVSS provides a list of top vulnerabilities. CVE is a list of scores for vulnerabilities in a system.",
          correct: false,
        },
        {
          id: "b",
          text: "CVSS provides a score that indicates the severity of a vulnerability. CVE integrates all the security tools available in an organization and automates incident responses.",
          correct: false,
        },
        {
          id: "c",
          text: "CVSS provides a score that indicates the severity of a vulnerability. CVE is a list of publicly known vulnerabilities containing ID numbers, descriptions, and references.",
          correct: true,
        },
        {
          id: "d",
          text: "CVSS is a 'low and slow' style of attack executed to infiltrate a network and remain inside undetected. CVE is a list of publicly known vulnerabilities containing ID numbers, descriptions, and references.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-28-cia-description",
    sourceLabel: "Exam 2023, Task 28",
    title: "CIA triad description",
    summary:
      "Identify the correct description of the CIA triad in software security.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["cia"],
    vulnerabilityType: "Security Concept",
    verbatimPrompt:
      "Which of the following describes the CIA triad when applied to software security?",
    explanation:
      "Confidentiality prevents unauthorized access, integrity prevents unauthorized modification, and availability keeps systems accessible to authorized users by countering denial of service.",
    examKeywords: [
      "confidentiality",
      "integrity",
      "availability",
      "unauthorized access",
      "unauthorized modification",
    ],
    mc: {
      question: "Which describes the CIA triad?",
      correct:
        "Confidentiality prevents unauthorized access, integrity prevents unauthorized modification, and availability deals with countermeasures to prevent denial of service to authorized users.",
      distractors: [
        "Confidentiality deals with denial of service and availability prevents unauthorized access.",
        "Confidentiality prevents unauthorized modification and integrity prevents unauthorized access.",
        "Availability deals with preventing unauthorized access rather than denial of service.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Confidentiality prevents unauthorized access, integrity prevents unauthorized modification, and availability deals with countermeasures to prevent denial of service to authorized users.",
          correct: true,
        },
        {
          id: "b",
          text: "Confidentiality deals with countermeasures to prevent denial of service to authorized users, integrity prevents unauthorized modification, and availability prevents unauthorized access.",
          correct: false,
        },
        {
          id: "c",
          text: "Confidentiality prevents unauthorized access, integrity prevents unauthorized modification, and availability deals with countermeasures to prevent unauthorized access.",
          correct: false,
        },
        {
          id: "d",
          text: "Confidentiality prevents unauthorized modification, integrity prevents unauthorized access, and availability deals with countermeasures to prevent denial of service to authorized users.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-29-captcha",
    sourceLabel: "Exam 2023, Task 29",
    title: "CAPTCHA in secure coding",
    summary:
      "Identify the true statement about CAPTCHAs and other secure coding measures.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["captcha", "defense-in-depth"],
    vulnerabilityType: "Security Control",
    verbatimPrompt:
      "Consider a web application that allows users to create accounts, login, and access sensitive data. Which of the following statements is true about the use of captchas and other security measures in secure coding practices?",
    explanation:
      "CAPTCHAs can reduce automated abuse, but they should not be the only defense. Input validation, parameterized queries, authentication, and authorization are still needed.",
    examKeywords: [
      "captcha",
      "automated attacks",
      "defense in depth",
      "input validation",
      "authorization",
    ],
    mc: {
      question: "Which statement about CAPTCHA is true?",
      correct:
        "CAPTCHAs can help prevent automated attacks, but should not be the sole means of protecting user data.",
      distractors: [
        "CAPTCHAs should be the primary and only means of preventing attacks.",
        "CAPTCHAs should never be used in secure coding practices.",
        "CAPTCHAs are unnecessary and always decrease website security.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Captchas are an effective security measure that can prevent automated attacks and protect user data, and should be used as the primary means of preventing such attacks.",
          correct: false,
        },
        {
          id: "b",
          text: "Captchas are effective in preventing automated attacks, but can also be bypassed by sophisticated attackers using machine learning or other advanced techniques. Therefore, they should not be used in secure coding practices.",
          correct: false,
        },
        {
          id: "c",
          text: "Captchas can be effective in preventing automated attacks, but should not be relied upon as the sole means of protecting user data. Additional security measures, such as input validation, parameterized queries, and user authentication and authorization, should also be used.",
          correct: true,
        },
        {
          id: "d",
          text: "Captchas are unnecessary and can actually decrease the security of a website by creating a false sense of security, and should not be used in secure coding practices.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-30-crypto-concepts-false",
    sourceLabel: "Exam 2023, Task 30",
    title: "False crypto concept statement",
    summary: "Identify the false statement about cryptography concepts.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["symmetric", "asymmetric", "ecc"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt: "Which statement regarding cryptography concepts is FALSE?",
    explanation:
      "The false statement is that symmetric key algorithms are often referred to as public key algorithms. Public key algorithms are asymmetric; symmetric algorithms use the same shared key.",
    examKeywords: ["symmetric", "public key", "asymmetric", "ecc"],
    mc: {
      question: "Which cryptography statement is false?",
      correct:
        "Symmetric key algorithms are often referred to as public key algorithms.",
      distractors: [
        "Symmetric key algorithms use the same private key for encryption and decryption.",
        "Symmetric key algorithms are typically faster than asymmetric systems.",
        "ECC is an example of an asymmetric public key cryptosystem.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Symmetric key algorithms are typically faster than asymmetric systems.",
          correct: false,
        },
        {
          id: "b",
          text: "Symmetric key algorithms are often referred to as public key algorithms.",
          correct: true,
        },
        {
          id: "c",
          text: "ECC is an example of an asymmetric public key cryptosystem.",
          correct: false,
        },
        {
          id: "d",
          text: "Symmetric key algorithms use the same private key for encryption and decryption.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-31-buffer-overflow-code",
    sourceLabel: "Exam 2023, Task 31",
    title: "Buffer overflow in C snippet",
    summary:
      "Identify the vulnerability in copying 'Hello World' into a five-byte C buffer and how to prevent it.",
    verbatimPrompt:
      "What is the security vulnerability in this code and how can it be prevented?",
    verbatimCode:
      '#include <stdio.h> #include <string.h> int main() { char data[5]; strcpy(data, "Hello World"); printf("%s\\ ", data); return 0; }',
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "buffer-overflow", "c"],
    vulnerabilityType: "Buffer Overflow",
    code: `#include <stdio.h>
#include <string.h>
int main() {
  char data[5];
  strcpy(data, "Hello World");
  printf("%s\\n", data);
  return 0;
}`,
    language: "plaintext",
    filename: "main.c",
    explanation:
      "The code writes a string longer than the destination buffer, causing a buffer overflow. Prevent it with bounds-checked APIs, correct buffer sizes, compiler defenses, and memory-safe languages where possible.",
    examKeywords: ["buffer overflow", "strcpy", "bounds", "safe functions"],
    mc: {
      question: "What is the vulnerability and prevention?",
      correct:
        "Buffer overflow; use safe functions such as strncpy or strlcpy and ensure the buffer is not overflowed.",
      distractors: [
        "XSS; sanitize web output.",
        "SQL injection; use parameterized queries.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The security vulnerability in this code is Cross-Site Scripting (XSS), which allows an attacker to inject malicious scripts into a web page viewed by other users. To prevent this vulnerability, the code should sanitize user input and encode any output to prevent the execution of malicious scripts.",
          correct: false,
        },
        {
          id: "b",
          text: "The security vulnerability in this code is SQL injection, which allows an attacker to manipulate the database by sending malicious SQL queries. To prevent this vulnerability, the code should use parameterized queries and input validation to ensure that user input is safe to use in database operations.",
          correct: false,
        },
        {
          id: "c",
          text: "The security vulnerability in this code is buffer overflow, which allows an attacker to overwrite memory beyond the bounds of the buffer and potentially execute arbitrary code or cause a denial of service. To prevent this vulnerability, the code should use safe functions, such as strncpy() and strlcpy(), to copy strings and ensure that the buffer is not overflowed.",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-32-symmetric-encryption-disadvantage",
    sourceLabel: "Exam 2023, Task 32",
    title: "Symmetric encryption disadvantage",
    summary:
      "Identify a disadvantage of symmetric encryption compared to asymmetric encryption.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["symmetric-encryption", "key-management"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt:
      "Which of the following is a disadvantage of the symmetric encryption compared to asymmetric encryption?",
    explanation:
      "The main disadvantage is key management: both parties need the same secret key, so secure distribution and rotation become difficult at scale.",
    examKeywords: ["symmetric encryption", "key management", "shared key"],
    mc: {
      question:
        "Which is a disadvantage of symmetric encryption compared to asymmetric encryption?",
      correct: "Key management.",
      distractors: ["Key size.", "Key strength.", "Speed."],
      verbatimOptions: [
        {
          id: "a",
          text: "Key management",
          correct: true,
        },
        {
          id: "b",
          text: "Key strength",
          correct: false,
        },
        {
          id: "c",
          text: "Key size",
          correct: false,
        },
        {
          id: "d",
          text: "Speed",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-task-33-threat-agents",
    sourceLabel: "Exam 2023, Task 33",
    title: "Threat agent characteristics",
    summary:
      "Identify the statement that best describes characteristics of different threat agents.",
    courseTopic: "threat-modeling",
    difficulty: "intro",
    tags: ["threat-agents"],
    vulnerabilityType: "Threat Agent Analysis",
    verbatimPrompt:
      "Which of the following statements best describe the characteristics of different threat agents?",
    explanation:
      "The expected statement describes terrorists as potentially highly motivated with resources to finance attacks, geeks as legal security-improvement hackers, and hackers-for-hire as attackers paid to conduct attacks on behalf of others.",
    examKeywords: ["terrorists", "geeks", "hackers-for-hire", "threat agents"],
    mc: {
      question: "Which statement best describes different threat agents?",
      correct:
        "Terrorists may be highly motivated and able to finance attacks; geeks may hack legally to improve security; hackers-for-hire conduct attacks for others.",
      distractors: [
        "Geeks have unlimited resources and cyber warriors only attack for personal gain.",
        "Insiders need many resources because they do not know internal systems.",
        "Swamps are highly resourced threat agents and cyber warriors are independent cultural hackers.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "CEO criminals are highly skilled and motivated to spy on their own employees. Geeks are individuals who perform hacking activities for personal gain or to cause harm. Script Kiddies are typically young or inexperienced individuals who use pre-packaged tools or scripts to launch simple attacks on websites or online services.",
          correct: false,
        },
        {
          id: "b",
          text: "Swamps are associated with online harassment and bullying. Often very skilled and with many resources. Crooks are motivated by financial gain and may target individuals or organizations to steal sensitive data or extort money. Cyber warriors are independent hackers that attack other systems mainly based on their cultural beliefs.",
          correct: false,
        },
        {
          id: "c",
          text: "Terrorists have limited skills, but can be highly motivated and have enough resources to finance others to perform cyber attacks. Geeks are individuals who perform hacking activities legally and with the intention of improving security. Hackers-for-hire are individuals or groups who offer their services to conduct cyber attacks on behalf of others.",
          correct: true,
        },
        {
          id: "d",
          text: "Insiders know the systems well and have access, and therefore do not many resources to perform attacks against their own organisation. Terrorists use methods such as penetration testing, social engineering, and vulnerability scanning. Spooks are hired by organizations to identify and exploit vulnerabilities in their systems in order to improve security.",
          correct: false,
        },
        {
          id: "e",
          text: "Geeks are driven by curiosity, have technical skills and unlimited resources. Cyber warriors are malicious individuals or groups who seek to exploit vulnerabilities in systems for personal gain or to cause harm. Insiders may be motivated by financial gain, revenge, or ideology and can be particularly difficult to detect and prevent.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-1-assets-stakeholders",
    sourceLabel: "Exam 2023 Case, Task 1",
    title: "Football recording assets and stakeholders",
    summary:
      "Identify business assets and stakeholders for a football club consent and video-recording support system.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["case", "assets", "stakeholders"],
    vulnerabilityType: "Asset Identification",
    verbatimPrompt:
      "Task 1: Identify the business assets (at least 4) and stakeholders that you find most relevant. (3 points)",
    explanation:
      "Relevant assets include video recordings, consent records, privacy notices, player identity data, guardian contact data, cloud storage, and access credentials. Stakeholders include players, parents or guardians, coaches, club volunteers, spectators, away teams, the UK supplier, and data protection authorities.",
    examKeywords: [
      "video recordings",
      "consent records",
      "players",
      "guardians",
      "club",
      "supplier",
    ],
    mc: {
      question: "Which is a relevant asset in the 2023 football case?",
      correct: "Consent records and video recordings of players.",
      distractors: [
        "Only the CSS color variables.",
        "Only anonymous build artifacts unrelated to players.",
        "Only public weather data.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-2-business-risks",
    sourceLabel: "Exam 2023 Case, Task 2",
    title: "Business risks for consent system",
    summary:
      "Identify at least five business risks for the football club system and link them to business goals.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "business-risk", "gdpr"],
    vulnerabilityType: "Business Risk",
    verbatimPrompt:
      "Task 2: Identify business risks for the system (at least 5) and link them to the business goals. You may define additional business goals you see fit. (3 points)",
    explanation:
      "Good risks include recording without valid consent, inability to prove consent, failure to withdraw consent, privacy notice not reaching spectators, unauthorized access to videos, supplier or cross-border data issues, reputational harm, and regulatory fines. Each should be linked to goals such as evidence of consent, privacy notice access, and withdrawal handling.",
    examKeywords: [
      "consent",
      "withdrawal",
      "privacy notice",
      "unauthorized access",
      "supplier",
      "regulatory",
    ],
    mc: {
      question: "Which is a business risk in the case?",
      correct:
        "The club cannot prove valid consent before recording youth players.",
      distractors: [
        "The app uses too many icons in a toolbar.",
        "A local CSS variable is renamed.",
        "The compiler cache is deleted.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-3-dfd-attack-points",
    sourceLabel: "Exam 2023 Case, Task 3",
    title: "DFD and attack points for consent system",
    summary:
      "Describe the main DFD elements for the football club consent system and possible attack points.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "dfd", "attack-points"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Task 3: Describe textually the main elements of a data flow diagram (DFD) representing the system (you can sketch one on paper and then describe the elements you have drawn). You can assume that a Single Sign On solution will be used to simplify authentication. Describe possible attack points in relation to the DFD. (5 points)",
    explanation:
      "A reasonable DFD includes external entities such as players, guardians, coaches, SSO, and supplier; processes such as consent collection, privacy notice delivery, withdrawal, and access management; data stores such as consent database and video metadata; and data flows between them. Attack points include login/SSO, consent forms, QR/privacy notice endpoints, admin interfaces, APIs, cloud storage, and supplier integration.",
    examKeywords: [
      "dfd",
      "external entity",
      "process",
      "data store",
      "data flow",
      "attack point",
    ],
    mc: {
      question: "Which is a plausible attack point in the consent-system DFD?",
      correct: "The consent submission endpoint or SSO login flow.",
      distractors: [
        "Only the printed fixture list with no system connection.",
        "Only the grass on the football field.",
        "Only an unrelated local image file.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-6-gdpr-volunteer-club",
    sourceLabel: "Exam 2023 Case, Task 6",
    title: "GDPR challenges for volunteer clubs",
    summary:
      "Reflect on GDPR challenges for volunteer football clubs, responsibility for privacy breaches, and why children's recordings require care.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["case", "gdpr", "children"],
    vulnerabilityType: "GDPR Risk",
    verbatimPrompt:
      "Task 6: A typical Norwegian football club is run by volunteers, often with limited knowledge about GDPR and technical skills, and usually with a tight budget. Write a short reflection about GDPR challenges you think such organisations tend to face. Who should be responsible in case of a privacy breach? Why is it so important to take GDPR seriously when recording children? (5 points)",
    explanation:
      "Volunteer clubs may lack GDPR knowledge, technical skill, budgets, clear roles, and vendor-management capacity. The club is likely the controller and remains responsible for lawful processing even when using a supplier. Children's data deserves special protection because minors are more vulnerable, consent may require guardians, and misuse or publication can cause lasting harm.",
    examKeywords: [
      "gdpr",
      "controller",
      "processor",
      "children",
      "guardian consent",
      "privacy breach",
    ],
    mc: {
      question:
        "Who is usually responsible if the club determines the purpose of processing?",
      correct: "The club as controller, even if a supplier processes the data.",
      distractors: [
        "No one, because the club is volunteer-run.",
        "Only the spectators.",
        "Only the camera hardware manufacturer.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2023-case-task-7-disregard-streaming",
    sourceLabel: "Exam 2023 Case, Task 7",
    title: "Argue against remote streaming",
    summary:
      "Argue that the club should disregard remote streaming and keep video only for local analysis.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["case", "privacy", "streaming"],
    vulnerabilityType: "Privacy Risk Reduction",
    verbatimPrompt:
      "Task 7: Write a short reflection where you argue that the club should disregard streaming the games to remote spectators, but rather focus on keeping the video for local analysis only. (3 points)",
    explanation:
      "A strong argument highlights data minimization, purpose limitation, reduced exposure, lower consent complexity, less risk for children, simpler access control, fewer supplier/cross-border issues, and a smaller incident impact. Local analysis still supports coaching goals while avoiding broad remote distribution.",
    examKeywords: [
      "data minimization",
      "purpose limitation",
      "children",
      "access control",
      "streaming",
      "risk reduction",
    ],
    mc: {
      question: "Which GDPR principle supports avoiding unnecessary streaming?",
      correct: "Data minimization and purpose limitation.",
      distractors: [
        "Public-key encryption only.",
        "Buffer overflow protection.",
        "CVSS environmental metrics only.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-2-injection-impact",
    sourceLabel: "Exam 2024, Task 2",
    title: "Mitigating injection compromise impact",
    summary:
      "List and explain at least four strategies to mitigate the impact when a system that accepts user input is exposed to injection attacks.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["injection", "mitigation"],
    vulnerabilityType: "Injection",
    verbatimPrompt:
      "Suppose your system takes users' input and can be exposed to injection attacks. List and explain at least four strategies to mitigate the impact of injection attack compromises. (4 points)",
    explanation:
      "Expected strategies include parameterized queries or prepared statements, input validation, output encoding where relevant, least-privilege database accounts, segmentation, safe error handling, logging and monitoring, patching, and limiting exposed attack surface.",
    examKeywords: [
      "parameterized queries",
      "input validation",
      "least privilege",
      "segmentation",
      "monitoring",
    ],
    mc: {
      question:
        "Which measure most directly prevents SQL injection in application queries?",
      correct: "Parameterized queries or prepared statements.",
      distractors: [
        "Running the database as an administrator.",
        "Showing detailed SQL errors to users.",
        "Concatenating only after trimming whitespace.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-4-ai-and-security",
    sourceLabel: "Exam 2024, Task 4",
    title: "Malicious use vs abuse of AI",
    summary:
      "Explain the difference between malicious abuse of AI and malicious use of AI, with examples of both.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["ai-abuse", "malicious-use"],
    vulnerabilityType: "AI Security",
    verbatimPrompt:
      "What is the difference between malicious abuse of AI and malicious use of AI? Give examples of both.",
    explanation:
      "Malicious use of AI is using AI as an offensive capability, such as phishing, social engineering, vulnerability discovery, or malware assistance. Malicious abuse of AI attacks the AI system or its safety mechanisms, such as prompt injection, jailbreaks, poisoning, evasion, or model extraction.",
    examKeywords: [
      "malicious use",
      "malicious abuse",
      "prompt injection",
      "poisoning",
      "phishing",
    ],
    mc: {
      question: "Which option best separates the two concepts?",
      correct:
        "Use is AI as the attack tool; abuse targets the AI system or its guardrails.",
      distractors: [
        "Use is always legal, abuse is always physical.",
        "Use only applies to robots, abuse only applies to databases.",
        "They are identical terms with no meaningful distinction.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-5-demonstrate-data-protection",
    sourceLabel: "Exam 2024, Task 5",
    title: "Demonstrating data protection",
    summary:
      "Explain how a controller can demonstrate data protection and give at least five examples.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["accountability", "gdpr"],
    vulnerabilityType: "GDPR Accountability",
    verbatimPrompt:
      "How can a controller demonstrate data protection? Give at least 5 examples.",
    explanation:
      "A controller demonstrates data protection through accountability evidence: records of processing, DPIAs, policies, privacy notices, lawful-basis documentation, data processing agreements, technical and organizational measures, training, audits, incident procedures, and data-subject request handling.",
    examKeywords: [
      "accountability",
      "ropa",
      "dpia",
      "policies",
      "processor agreements",
      "audits",
    ],
    mc: {
      question:
        "Which GDPR principle is most directly about demonstrating compliance?",
      correct: "Accountability.",
      distractors: ["Storage limitation.", "Accuracy.", "Data portability."],
    },
  }),
  examQuestion({
    id: "exam-2024-task-7-circuit-breaker",
    sourceLabel: "Exam 2024, Task 7",
    title: "Circuit breaker pattern",
    summary:
      "Explain the circuit breaker pattern and why it matters for security and resilience in distributed systems.",
    courseTopic: "microservices-supply-chain",
    difficulty: "core",
    tags: ["circuit-breaker", "resilience"],
    vulnerabilityType: "Resilience Pattern",
    verbatimPrompt:
      "What is the purpose of the circuit breaker pattern in the context of microservice architecture security?",
    explanation:
      "A circuit breaker monitors failures to a dependency and temporarily stops calls when failures exceed a threshold. It prevents cascading failure, supports graceful degradation, limits resource exhaustion, and can reduce denial-of-service amplification across services.",
    examKeywords: [
      "failure threshold",
      "open circuit",
      "graceful degradation",
      "cascading failure",
      "dos",
    ],
    mc: {
      question:
        "What is the main security-relevant benefit of a circuit breaker?",
      correct:
        "It limits cascading failure and resource exhaustion when a dependency is unhealthy.",
      distractors: [
        "It encrypts messages between services.",
        "It replaces authentication between services.",
        "It proves that dependencies have no vulnerabilities.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-8-bell-lapadula",
    sourceLabel: "Exam 2024, Task 8",
    title: "Bell-LaPadula star properties",
    summary:
      "Explain what the Bell-LaPadula * property means and how STRONG * differs.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["bell-lapadula", "access-control"],
    vulnerabilityType: "Access Control Model",
    verbatimPrompt:
      "1) In the Bell-LaPadula model, what does the * property mean? 2) What about STRONG * ?",
    explanation:
      "Bell-LaPadula protects confidentiality. The * property is no write down: a subject may not write information to a lower classification. Strong * is stricter and requires subjects to read and write only at their own security level.",
    examKeywords: [
      "confidentiality",
      "no read up",
      "no write down",
      "strong star",
      "classification",
    ],
    mc: {
      question: "What does the Bell-LaPadula * property prevent?",
      correct: "Writing information down to a lower classification.",
      distractors: [
        "Reading information at a lower classification.",
        "Writing only to a higher classification.",
        "All access to objects at the same level.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-13-supply-chain-security",
    sourceLabel: "Exam 2024, Task 13",
    title: "Supply chain security",
    summary:
      "Explain the four steps of software supply chain attacks and the corresponding countermeasure strategies.",
    courseTopic: "microservices-supply-chain",
    difficulty: "core",
    tags: ["supply-chain", "dependencies"],
    vulnerabilityType: "Supply Chain Risk",
    verbatimPrompt:
      "What are the four steps of software supply chain attacks and what are the corresponding countermeasure strategies? (4 points)",
    explanation:
      "The four steps are compromise, alteration, propagation, and exploitation. The corresponding countermeasure strategies from the guide are transparency, validity, separation, and recovery.",
    examKeywords: [
      "compromise",
      "alteration",
      "propagation",
      "exploitation",
      "transparency",
      "validity",
      "separation",
      "recovery",
    ],
    mc: {
      question: "Which set matches the 2024 guide's supply chain attack steps?",
      correct: "Compromise, alteration, propagation, exploitation.",
      distractors: [
        "Encrypt, decrypt, sign, verify.",
        "Spoof, tamper, repudiate, disclose.",
        "Consent, collect, process, delete.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-14-microservice-attack-area",
    sourceLabel: "Exam 2024, Task 14",
    title: "Microservice attack area",
    summary:
      "What are potential attack areas of microservices deployed on a cloud?",
    courseTopic: "microservices-supply-chain",
    difficulty: "core",
    tags: ["microservices", "attack-surface"],
    vulnerabilityType: "Microservice Security",
    verbatimPrompt:
      "What are potential attack areas of microservices deployed on a cloud? (4 points)",
    explanation:
      "The guide lists system entry point, load balancer, service entry point, communications between services, and container or hardware as potential attack areas.",
    examKeywords: [
      "system entry point",
      "load balancer",
      "service entry point",
      "service communication",
      "container",
      "hardware",
    ],
    mc: {
      question: "Which item is a potential cloud microservice attack area?",
      correct: "The load balancer.",
      distractors: [
        "Only the choice of font family.",
        "Only the commit message style.",
        "Only local browser bookmarks.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-5-use-case-actors",
    sourceLabel: "Exam 2024 Case, Task 5",
    title: "Use case actors and abuse actors",
    summary:
      "Define actors for a risk assessment tool use-case diagram and explain relevant abuse or misuse actors.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "use-case", "misuse-case"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Task 5: In the use case diagram on the next page, you can see use cases and undefined actors. Define at least 5 suitable actors and describe how they should be connected referring to the use case labels (you can add more actors if needed). (3 points)",
    explanation:
      "Good answers identify legitimate stakeholders and external systems, then add misuse actors such as malicious insiders, external attackers, compromised accounts, third-party integrators, and careless users. Each actor should be tied to goals and access paths in the diagram.",
    examKeywords: [
      "actor",
      "stakeholder",
      "misuse actor",
      "goal",
      "access path",
    ],
    mc: {
      question: "What makes an abuse actor useful in a misuse-case model?",
      correct:
        "It represents a threat agent with harmful goals against the system.",
      distractors: [
        "It is a database table that stores audit events.",
        "It is always a legitimate end user only.",
        "It replaces the need to identify assets.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-8-technical-risk-evaluation",
    sourceLabel: "Exam 2024 Case, Task 8",
    title: "Evaluate technical risks",
    summary:
      "Based on threat models for a risk assessment tool, identify at least five technical risks and evaluate them.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "technical-risk"],
    vulnerabilityType: "Risk Assessment",
    verbatimPrompt:
      "Task 8: Based on the threat models, identify at least 5 technical risks and evaluate them. You should describe necessary assumption related to the technology. (3 points)",
    explanation:
      "Technical risks should be concrete and evaluated against impact dimensions. Examples include unauthorized risk-report access, tampering with assessments, loss of auditability, disclosure of sensitive system architecture, dependency compromise, and denial of service during assessments.",
    examKeywords: [
      "technical risk",
      "impact",
      "likelihood",
      "assessment",
      "mitigation",
    ],
    mc: {
      question:
        "Which item is a technical risk rather than only a business goal?",
      correct:
        "Attackers tamper with risk scores, causing incorrect security decisions.",
      distractors: [
        "The organization wants to maintain trust.",
        "The organization wants regulatory compliance.",
        "The team wants efficient meetings.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-3-otp-security-integrity",
    sourceLabel: "Exam 2024, Task 3",
    title: "OTP security and integrity",
    summary:
      "Explain OTP encryption/decryption, why key reuse is insecure, and why OTP does not guarantee integrity.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["otp", "integrity"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt:
      "1. Explain encryption and decryption algorithm of One Time Pad (OTP). (1 point) 2. Explain why it is insecure to use the same key to encrypt two or several messages using OTP. (2 points) 3. Explain why OTP cannot guarantee integrity (1 point)",
    explanation:
      "OTP encrypts by XORing plaintext with a truly random key of the same length, and decrypts by XORing the ciphertext with the same key. Reusing the key lets attackers XOR ciphertexts and learn relationships between plaintexts. OTP is malleable: changing ciphertext bits changes plaintext bits, so integrity requires an additional authentication mechanism.",
    examKeywords: [
      "xor",
      "same length key",
      "key reuse",
      "malleability",
      "integrity",
    ],
    mc: {
      question: "Why can OTP not guarantee integrity by itself?",
      correct:
        "An attacker can modify ciphertext bits and the receiver may not detect it after decryption.",
      distractors: [
        "OTP uses public keys for decryption.",
        "OTP keys are always shorter than messages.",
        "OTP always includes a MAC by default.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-6-password-policy-code",
    sourceLabel: "Exam 2024, Task 6",
    title: "Django password policy validators",
    summary:
      "Update Django password validators so passwords are 8-10 characters, use at least 3 of 4 character categories, exclude user names/common passwords, and reject spaces plus Norwegian letters.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["password-policy", "django"],
    vulnerabilityType: "Password Policy",
    verbatimPrompt:
      "Your task is to update the old code and add the necessary code to check the password policy. (4 points)\n    (Note: Syntax errors are allowed, especially if you explain the code.)",
    verbatimCode:
      "Suppose the password policy of a system is as follows.\n\n           The password is between 8-10 characters long\n           The password contains characters from 3 of the following 4 categories:\n                standard uppercase characters (A - Z)\n                standard lowercase characters (a - z)\n                numbers (0 - 9)\n                symbols: only from among ! % - _ + = [ ] { } : , . ? < > ( ) ;\n           The password does not contain information identical to user's first and last name\n           The password does not contain common passwords\n           Spaces and the letters \"æ\", \"ø\" and \"å\" are not accepted\n\n    Your task is to develop code and configure Password Validators in Django to check the policy.\n\n    Here is an old version of the code that partly takes care of the policy:\n\n    AUTH_PASSWORD_VALIDATORS = [\n      {\n         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',\n         'OPTIONS': {\n           'min_length': 10,\n         }\n      {\n         'NAME': 'password_validators.validators.UppercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.LowercaseValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.SymbolValidator',\n      },\n      {\n         'NAME': 'password_validators.validators.NoNorValidator',\n      },\n    ]\n\n    class UppercaseValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[A-Z]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 uppercase letter, A-Z.\"),\n                code='password_no_upper',\n             )\n\n    class SymbolValidator(object):\n       def validate(self, password, user=None):\n         if not re.findall('[()[\\]{}|\\\\`~!@#$%^&*_\\-+=;:\\'\",<>./?]', password):\n             raise ValidationError(\n                _(\"The password must contain at least 1 special character: \" +\n                 \"()[]{}|\\`~!@#$%^&*_-+=;:'\\\",<>./?\"),\n                code='password_no_symbol',\n             )",
    code: `AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 10},
    },
    {'NAME': 'password_validators.validators.UppercaseValidator'},
    {'NAME': 'password_validators.validators.LowercaseValidator'},
    {'NAME': 'password_validators.validators.SymbolValidator'},
    {'NAME': 'password_validators.validators.NoNorValidator'},
]

class UppercaseValidator(object):
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(_("The password must contain at least 1 uppercase letter."))

class SymbolValidator(object):
    def validate(self, password, user=None):
        if not re.findall('[()[\\]{}|\\\\\`~!@#$%^&*_\\-+=;:\\'",<>./?]', password):
            raise ValidationError(_("The password must contain at least 1 special character."))`,
    language: "python",
    filename: "validators.py",
    explanation:
      "A full answer fixes the length check to 8-10 characters, checks common passwords and user first/last name, rejects spaces and ae/oe/aa Norwegian letters, and implements the 3-of-4 category rule for uppercase, lowercase, digits, and the allowed symbol set.",
    examKeywords: [
      "8-10 characters",
      "3 of 4 categories",
      "common passwords",
      "user name",
      "spaces",
      "norwegian letters",
    ],
    mc: {
      question:
        "Which missing policy detail would lose credit in the 2024 password-validator task?",
      correct:
        "Not checking the 8-10 character length or the 3-of-4 character category rule.",
      distractors: [
        "Using Django password validators at all.",
        "Rejecting common passwords.",
        "Rejecting passwords containing user names.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-9-concept-drift",
    sourceLabel: "Exam 2024, Task 9",
    title: "Concept drift in AI",
    summary:
      "Explain the concept drift challenge within AI and give an example.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["concept-drift", "ml"],
    vulnerabilityType: "AI Security",
    verbatimPrompt:
      "What is the concept drift challenge within AI? Give an example.",
    explanation:
      "Concept drift occurs when the statistical properties of data change over time, causing a model trained on old patterns to perform worse. For example, a consumer-behavior or fraud-detection model may become obsolete as attackers or users change behavior, requiring retraining and monitoring.",
    examKeywords: [
      "concept drift",
      "data distribution",
      "model performance",
      "obsolete training data",
      "retraining",
    ],
    mc: {
      question: "What is concept drift?",
      correct:
        "A change in data patterns over time that can degrade model performance.",
      distractors: [
        "A property that makes encryption keys public.",
        "A guarantee that training data never changes.",
        "A type of SQL injection payload.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-10-pentest-tools",
    sourceLabel: "Exam 2024, Task 10",
    title: "Pros and cons of pentest tools",
    summary: "Explain pros and cons of penetration testing tools.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["pentest", "tools"],
    vulnerabilityType: "Security Testing",
    verbatimPrompt: "What are the pros and cons of penetration testing tools?",
    explanation:
      "Pentest tools can save time and help testers explore known issue classes, but they have limited coverage, can create a false sense of security if misunderstood, may be expensive, and do not replace human judgement about exploitability and business impact.",
    examKeywords: [
      "save time",
      "limited coverage",
      "false sense of security",
      "expensive",
      "human judgement",
    ],
    mc: {
      question: "Which is a limitation of penetration testing tools?",
      correct:
        "They can provide a false sense of security if their coverage is misunderstood.",
      distractors: [
        "They always find every vulnerability.",
        "They never save time.",
        "They remove the need for scoped testing.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-11-social-engineering",
    sourceLabel: "Exam 2024, Task 11",
    title: "Social engineering persuasion",
    summary:
      "Mention principles of persuasion that can be used for social engineering attacks.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["social-engineering", "persuasion"],
    vulnerabilityType: "Social Engineering",
    verbatimPrompt:
      "Mention principles of persuasion that can be used for social engineering attacks.",
    explanation:
      "Relevant principles include reciprocity, authority, social proof, liking, commitment and consistency, and scarcity or loss avoidance. Any four of these received full credit in the guide.",
    examKeywords: [
      "reciprocity",
      "authority",
      "social proof",
      "liking",
      "commitment",
      "scarcity",
    ],
    mc: {
      question:
        "Which principle relies on people doing what similar people do?",
      correct: "Social proof.",
      distractors: ["Perfect secrecy.", "Key derivation.", "Taint analysis."],
    },
  }),
  examQuestion({
    id: "exam-2024-task-12-logging-vulnerability-fix",
    sourceLabel: "Exam 2024, Task 12",
    title: "Fix security logging configuration",
    summary:
      "Explain which lines in common.py are vulnerable for security logging and monitoring and show code to fix the issue.",
    courseTopic: "security-basics",
    difficulty: "core",
    tags: ["logging", "monitoring", "django"],
    vulnerabilityType: "Logging and Monitoring Failure",
    verbatimPrompt:
      "The code snippet common.py has vulnerabilities related to security logging and monitoring. The code in production.py\nprovides some background information.\n- Explain which lines in common.py are vulnerable and why they are vulnerable. (2 points)\n- Explain how to fix the vulnerabilities in the common.py. It is necessary to provide code to show how to fix it. (2 points) (Note:\nSyntax errors are allowed, especially if you explain the code.)",
    code: `LOGGING_CONFIG = None
LOGLEVEL = config('LOGLEVEL', default='INFO')

logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
        },
        'django.server': DEFAULT_LOGGING['formatters']['django.server'],
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
        },
        'django.server': DEFAULT_LOGGING['handlers']['django.server'],
    },
    'loggers': {
        '': {
            'level': LOGLEVEL,
            'handlers': ['console', 'file'],
        },
        'noisy_module': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
    },
})`,
    language: "python",
    filename: "common.py",
    explanation:
      "The guide focuses on the missing mechanism to inform administrators or operators by email when errors or attacks happen. A good fix adds a mail_admins handler, such as django.utils.log.AdminEmailHandler at CRITICAL level, and includes it in the root logger handlers.",
    examKeywords: [
      "mail_admins",
      "AdminEmailHandler",
      "critical",
      "alerting",
      "operator notification",
    ],
    mc: {
      question: "What is the key logging fix expected by the 2024 guide?",
      correct:
        "Add an email/admin alert handler and attach it to relevant loggers.",
      distractors: [
        "Disable all file and console logging.",
        "Lower every log level to DEBUG in production.",
        "Remove timestamps from all messages.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-15-privacy-motivation",
    sourceLabel: "Exam 2024, Task 15",
    title: "Privacy motivation",
    summary:
      "What is the biggest motivation for software companies to work with privacy?",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["privacy", "motivation"],
    vulnerabilityType: "Privacy Motivation",
    verbatimPrompt:
      "What is the biggest motivation for software companies to work with privacy?",
    explanation:
      "The expected answer is big legal fines. GDPR and related privacy laws create substantial financial and regulatory incentives for companies to work with privacy.",
    examKeywords: ["privacy", "gdpr", "legal fines", "regulatory"],
    mc: {
      question:
        "What is the biggest motivation for software companies to work with privacy?",
      correct: "Big legal fines.",
      distractors: [
        "The respect of their customers.",
        "Catching criminals.",
        "This is what management cares about.",
        "This is what developers care about.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The respect of their customers",
          correct: false,
        },
        {
          id: "b",
          text: "Catching criminals",
          correct: false,
        },
        {
          id: "c",
          text: "This is what management cares about",
          correct: false,
        },
        {
          id: "d",
          text: "Big legal fines",
          correct: true,
        },
        {
          id: "e",
          text: "This is what developers care about",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-16-cryptography-keys",
    sourceLabel: "Exam 2024, Task 16",
    title: "Cryptographic key generation",
    summary:
      "Identify which method is not recommended for generating cryptographic keys.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["keys", "randomness"],
    vulnerabilityType: "Key Management",
    verbatimPrompt:
      "Which of the following methods is NOT a recommended approach for generating cryptographic keys?",
    explanation:
      "Reusing a previously generated key for a new encryption task is not recommended. Keys should be generated with sufficient entropy or derived using appropriate key derivation functions, and key reuse should be limited according to the cryptographic scheme.",
    examKeywords: [
      "key reuse",
      "entropy",
      "key derivation",
      "random number generator",
    ],
    mc: {
      question:
        "Which method is not recommended for generating cryptographic keys?",
      correct: "Reusing a previously generated key for a new encryption task.",
      distractors: [
        "Collecting entropy from user-generated input such as mouse movements or keystrokes.",
        "Deriving keys from a passphrase using a key derivation function.",
        "Using a secure pseudo-random number generator with unique seeds.",
        "Using a hardware random number generator.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Reusing a previously generated key for a new encryption task",
          correct: true,
        },
        {
          id: "b",
          text: "Collecting entropy from user-generated input, such as mouse movements or keyboard strokes.",
          correct: false,
        },
        {
          id: "c",
          text: "Deriving keys from a passphrase using a key derivation function",
          correct: false,
        },
        {
          id: "d",
          text: "Employing a software-based secure pseudo-random number generator with unique seeds",
          correct: false,
        },
        {
          id: "e",
          text: "Using a hardware random number generator",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-17-threat-modeling",
    sourceLabel: "Exam 2024, Task 17",
    title: "Threat modeling representations",
    summary: "Identify the best way of performing threat modeling.",
    courseTopic: "threat-modeling",
    difficulty: "intro",
    tags: ["threat-modeling"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt: "What is the best way of performing threat modeling?",
    explanation:
      "The best answer is to create multiple threat-modeling representations because there is no single ideal view. Different views reveal different assumptions, assets, trust boundaries, and threats.",
    examKeywords: [
      "multiple representations",
      "no single ideal view",
      "threat modeling",
    ],
    mc: {
      question: "What is the best way of performing threat modeling?",
      correct:
        "It is better to create multiple threat modeling representations because there is no single ideal view.",
      distractors: [
        "Attack trees were the first and are still the most recognized way of modeling threats.",
        "DFD is the most widely used threat modeling technique and should therefore be used.",
        "You should create your own threat modeling technique that is tailored for the job.",
        "Misuse case diagrams were invented at NTNU and considered to be the most useful way.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Attack trees were the first and is still the most recognized way of modeling threats.",
          correct: false,
        },
        {
          id: "b",
          text: "It is better to create multiple threat modeling representations because there is no single ideal view",
          correct: true,
        },
        {
          id: "c",
          text: "DFD is the most widely used threat modeling technique and should therefore be used",
          correct: false,
        },
        {
          id: "d",
          text: "You should create your own threat modeling technique that is tailored for the job.",
          correct: false,
        },
        {
          id: "e",
          text: "Misuse case diagrams were invented at NTNU and considered to be the most useful way.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-18-injection-code",
    sourceLabel: "Exam 2024, Task 18",
    title: "Injection vulnerability in shopping code",
    summary:
      "Identify which lines are vulnerable in a Django shopping cart code snippet.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "injection", "django"],
    vulnerabilityType: "Injection",
    verbatimPrompt: "In the above code snippets, which lines are vulnerable?",
    codeSnippets: [
      {
        filename: "cart.html",
        language: "html",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Cart</title>
</head>
<body>
    {% for item in items %}

    Product Name: {{ item.product_name }}<br>
    Product Id: {{ item.product_id }}<br>
    Transaction Id: {{ item.transaction }}<br>
    Price: {{ item.price }}<br>

    {% endfor %}

    <br><br>
    <b><a href="{% url 'shops:logout' %}">logout</a></b>
</body>
</html>`,
      },
      {
        filename: "models.py",
        language: "python",
        code: `from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# Model for shopping order transactions.
class ShoppingTransaction(models.Model):
    order_id = models.CharField(max_length=20)
    date = models.DateTimeField()
    total_amount = models.DecimalField(max_digits=7, decimal_places=2)
    user = models.ForeignKey(User)

    def __str__(self):
        return self.order_id


# Model for products purchased by a customer.
class TransactionDetail(models.Model):
    product_id = models.CharField(max_length=20)
    product_name = models.CharField(max_length=40)
    transaction = models.ForeignKey(ShoppingTransaction)
    price = models.DecimalField(max_digits=7, decimal_places=2)`,
      },
      {
        filename: "views.py",
        language: "python",
        code: `from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.contrib import messages

from shops.models import TransactionDetail, ShoppingTransaction
from shops.forms import LoginForm


# User Login
def user_login(request):
    # Checking the request method
    if request.method == 'POST':
        # Create a form instance and populate it with data from the request:
        form = LoginForm(request.POST)

        # Checking if all the form fields value meet the set criteria
        if form.is_valid():
            # Fetching the username and passwords from POST methods
            user_name = form.cleaned_data['username']
            pass_word = form.cleaned_data['password']

            # Authenticating the user
            user = authenticate(username=user_name, password=pass_word)

            # Checking if the user is successfully authenticated
            if user is not None:
                # Login the user and creating a user session
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect(reverse('shops:order'))
                else:
                    messages.error(request, 'User is disabled.')
            else:
                form = LoginForm()
                # Flashing a message on incorrect login credentials
                messages.error(request, 'Incorrect Login Details .. Please try again')
    else:
        # Creating a form instance
        form = LoginForm()

    return render(request, 'shops/login.html', {'form': form})


# Fetching all the orders for that user
@login_required(login_url='/shops/login/')
def user_order_view(request):
    data_set = ShoppingTransaction.objects.filter(user=request.user)
    return render(request, 'shops/order.html', {'orders': data_set})


# Order details page
@login_required(login_url='/shops/login/')
def user_cart_view(request, transaction_id):
    data_set = TransactionDetail.objects.filter(transaction=transaction_id)
    return render(request, 'shops/cart.html', {'items': data_set})


# Logout Page
@login_required(login_url='/shops/login/')
def user_logout(request):
    logout(request)
    return render(request, 'shops/logout.html', {})`,
      },
    ],
    language: "python",
    filename: "views.py",
    explanation:
      "The expected exam option is views.py lines 54-55. The cart lookup uses a request-controlled transaction identifier directly for the detail query, instead of constraining the lookup through the authenticated user's own transactions.",
    examKeywords: [
      "views.py 54-55",
      "transaction id",
      "request-controlled input",
      "query",
    ],
    mc: {
      question: "In the 2024 shopping code quiz, which lines are vulnerable?",
      correct: "views.py: 54-55.",
      distractors: [
        "models.py: 22-23.",
        "cart.html: 10-11.",
        "models.py: 11-12.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "models.py: 22-23",
          correct: false,
        },
        {
          id: "b",
          text: "views.py: 54-55",
          correct: true,
        },
        {
          id: "c",
          text: "cart.html: 10-11",
          correct: false,
        },
        {
          id: "d",
          text: "models.py: 11-12",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-19-cia-triad",
    sourceLabel: "Exam 2024, Task 19",
    title: "CIA triad principle",
    summary: "Identify which principle is part of the CIA triad.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["cia"],
    vulnerabilityType: "Security Concept",
    verbatimPrompt:
      "Which of the following principles is part of the CIA triad?",
    explanation:
      "Availability is part of the CIA triad and means authorized users can access data and services when needed. The other two CIA properties are confidentiality and integrity.",
    examKeywords: ["cia", "availability", "confidentiality", "integrity"],
    mc: {
      question: "Which of the following principles is part of the CIA triad?",
      correct:
        "Availability: Ensures that authorized users can access data when needed.",
      distractors: [
        "Auditability: Enables monitoring and recording of system activities for security analysis.",
        "Accountability: An individual is entrusted to safeguard equipment, keying material, and information.",
        "Attacks: involve direct actions against a system or network.",
        "Authentication: Verifies the identity of users or processes.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Auditability: Enables monitoring and recording of system activities for security analysis.",
          correct: false,
        },
        {
          id: "b",
          text: "Availability: Ensures that authorized users can access data when needed.",
          correct: true,
        },
        {
          id: "c",
          text: "Accountability: refers to the principle that an individual is entrusted to safeguard and control equipment, keying material, and information.",
          correct: false,
        },
        {
          id: "d",
          text: "Attacks: involve direct actions against a system or network.",
          correct: false,
        },
        {
          id: "e",
          text: "Authentication: Verifies the identity of users or processes.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-20-authorization-code",
    sourceLabel: "Exam 2024, Task 20",
    title: "Authorization code vulnerability",
    summary:
      "Identify which lines are vulnerable in a Django gamer profile authorization snippet.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["code-quiz", "authorization", "idor"],
    vulnerabilityType: "Broken Access Control",
    verbatimPrompt:
      "In the above code snippets, which lines of code are vulnerable?",
    codeSnippets: [
      {
        filename: "models.py",
        language: "python",
        code: `from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# Model for team participating in competition.
class Team(models.Model):
    name = models.CharField(max_length=15)

    def __str__(self):
        return self.name


# Model for gamer profiles.
class GamerProfile(models.Model):
    alias_name = models.CharField(max_length=40)
    game_name = models.CharField(max_length=30)
    score = models.IntegerField()
    team = models.ForeignKey(Team)
    user = models.ForeignKey(User)

    def __str__(self):
        return self.alias_name`,
      },
      {
        filename: "views.py",
        language: "python",
        code: `from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import messages
from django.contrib.auth import decorators
from django.shortcuts import get_object_or_404

from games.models import GamerProfile, Team
from games.forms import LoginForm


# User login process
def user_login(request):
    # Checking the request method
    if request.method == 'POST':
        # Create a form instance and populate it with data from the request
        form = LoginForm(request.POST)

        if form.is_valid():
            # Fetching the username and passwords from POST methods
            user_name = form.cleaned_data['username']
            pass_word = form.cleaned_data['password']

            # Authenticating the user
            user = authenticate(username=user_name, password=pass_word)

            # Checking if the user is successfully authenticated
            if user is not None:
                # Login the user and creating a user session
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect(reverse('games:dashboard'))
                else:
                    messages(request, 'User is disabled.')
            else:
                form = LoginForm()
                messages.error(request, 'Incorrect Login Details. Please try again')
    else:
        # Instantiating empty form
        form = LoginForm()

    return render(request, 'games/login.html', {'form': form})


# User gaming dashboard
@decorators.login_required(login_url='/games/login/')
def dashboard(request):
    team = get_object_or_404(Team, user=request.user)
    team_gamers = GamerProfile.objects.filter(team=team.team)
    return render(request, 'games/dashboard.html', {'team_gamers': team_gamers, })


# User Team members
@decorators.login_required(login_url='/games/login/')
def gamer_profile(request, gamer_id):
    gamer_details = get_object_or_404(GamerProfile, pk=gamer_id)
    return render(request, 'games/gamer_details.html', {'gamer': gamer_details, })


# User logout
@decorators.login_required(login_url='/games/login/')
def log_out(request):
    logout(request)
    return render(request, 'games/logout.html', {})`,
      },
      {
        filename: "settings.py",
        language: "python",
        code: `# -*- coding: utf-8 -*-

#
# settings file for production environment
#
# This settings provides the MINIMUM level of security. Additional
# settings may be used to hardening the system (not added here because of
# potential compatibility issues with the software), like, for example:
#
# - SECURE_PROXY_SSL_HEADER
# - SECURE_HSTS_SECONDS
# - SECURE_HSTS_INCLUDE_SUBDOMAINS
# - SECURE_SSL_REDIRECT
# - SECURE_SSL_HOST
#

from __future__ import unicode_literals

import os

from django.core.exceptions import ImproperlyConfigured

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'games.apps.GamesConfig',
]

ROOT_URLCONF = 'website.urls'

WSGI_APPLICATION = 'website.wsgi.application'

DEBUG = False

ALLOWED_HOSTS = [
    'randomapp.securecodewarrior.com'
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

try:
    SECRET_KEY = os.environ['DJANGO__SECRET_KEY']

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['DJANGO__DB_NAME'],
            'USER': os.environ['DJANGO__DB_USER'],
            'PASSWORD': os.environ['DJANGO__DB_PASSWORD'],
            'HOST': os.environ['DJANGO__DB_HOST'],
            'PORT': os.environ['DJANGO__DB_PORT'],
        }
    }

except KeyError, ex:
    key = ex.args[0]
    raise ImproperlyConfigured(
        "The environment variable {0} was not found and is required".format(key)
    )

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

STATIC_URL = '/static/'`,
      },
    ],
    language: "python",
    filename: "views.py",
    explanation:
      "The expected answer is views.py line 54. The code fetches a GamerProfile by primary key without checking that it belongs to the authenticated user's team, allowing object-level authorization bypass.",
    examKeywords: [
      "views.py 54",
      "object-level authorization",
      "idor",
      "ownership check",
    ],
    mc: {
      question: "Which lines of code are vulnerable in the authorization quiz?",
      correct: "views.py: 54-54.",
      distractors: [
        "settings.py: 71-72.",
        "models.py: 20-21.",
        "views.py: 46-47.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "settings.py:71-72",
          correct: false,
        },
        {
          id: "b",
          text: "models.py: 20-21",
          correct: false,
        },
        {
          id: "c",
          text: "views.py:54-54",
          correct: true,
        },
        {
          id: "d",
          text: "views.py:46-47",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-21-crypto-code",
    sourceLabel: "Exam 2024, Task 21",
    title: "Crypto vulnerability in security code",
    summary:
      "Identify vulnerable lines in a Django payment security-code snippet.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["code-quiz", "md5"],
    vulnerabilityType: "Weak Cryptographic Hash",
    verbatimPrompt: "Which lines of the above code snippet are vulnerable?",
    codeSnippets: [
      {
        filename: "models.py",
        language: "python",
        code: `from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# Model for team participating in competition.
class Team(models.Model):
    name = models.CharField(max_length=15)

    def __str__(self):
        return self.name


# Model for gamer profiles.
class GamerProfile(models.Model):
    alias_name = models.CharField(max_length=40)
    game_name = models.CharField(max_length=30)
    score = models.IntegerField()
    team = models.ForeignKey(Team)
    user = models.ForeignKey(User)

    def __str__(self):
        return self.alias_name`,
      },
      {
        filename: "views.py",
        language: "python",
        code: `from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import messages
from django.contrib.auth import decorators
from django.shortcuts import get_object_or_404

from games.models import GamerProfile, Team
from games.forms import LoginForm


# User login process
def user_login(request):
    # Checking the request method
    if request.method == 'POST':
        # Create a form instance and populate it with data from the request
        form = LoginForm(request.POST)
        if form.is_valid():
            # Fetching the username and passwords from POST methods
            user_name = form.cleaned_data['username']
            pass_word = form.cleaned_data['password']
            # Authenticating the user
            user = authenticate(username=user_name, password=pass_word)
            # Checking if the user is successfully authenticated
            if user is not None:
                # Login the user and creating a user session
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect(reverse('games:dashboard'))
                else:
                    messages(request, 'User is disabled.')
        else:
            form = LoginForm()
            messages.error(request, 'Incorrect Login Details. Please try again')
    else:
        # Instantiating empty form
        form = LoginForm()

    return render(request, 'games/login.html', {'form': form})


# User gaming dashboard
@decorators.login_required(login_url='/games/login/')
def dashboard(request):
    team = get_object_or_404(Team, user=request.user)
    team_gamers = GamerProfile.objects.filter(team=team.team)
    return render(request, 'games/dashboard.html', {'team_gamers': team_gamers, })


# User Team members
@decorators.login_required(login_url='/games/login/')
def gamer_profile(request, gamer_id):
    gamer_details = get_object_or_404(GamerProfile, pk=gamer_id)
    return render(request, 'games/gamer_details.html', {'gamer': gamer_details, })


# User logout
@decorators.login_required(login_url='/games/login/')
def log_out(request):
    logout(request)
    return render(request, 'games/logout.html', {})`,
      },
      {
        filename: "settings.py",
        language: "python",
        code: `# -*- coding: utf-8 -*-

#
# settings file for production environment
#
# This settings provides the MINIMUM level of security. Additional
# settings may be used to hardening the system (not added here because of
# potential compatibility issues with the software), like, for example:
#
# - SECURE_PROXY_SSL_HEADER
# - SECURE_HSTS_SECONDS
# - SECURE_HSTS_INCLUDE_SUBDOMAINS
# - SECURE_SSL_REDIRECT
# - SECURE_SSL_HOST
#

from __future__ import unicode_literals

import os

from django.core.exceptions import ImproperlyConfigured

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'games.apps.GamesConfig',
]

ROOT_URLCONF = 'website.urls'

WSGI_APPLICATION = 'website.wsgi.application'

DEBUG = False

ALLOWED_HOSTS = [
    'randomapp.securecodewarrior.com'
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

try:
    SECRET_KEY = os.environ['DJANGO__SECRET_KEY']

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['DJANGO__DB_NAME'],
            'USER': os.environ['DJANGO__DB_USER'],
            'PASSWORD': os.environ['DJANGO__DB_PASSWORD'],
            'HOST': os.environ['DJANGO__DB_HOST'],
            'PORT': os.environ['DJANGO__DB_PORT'],
        }
    }

except KeyError, ex:
    key = ex.args[0]
    raise ImproperlyConfigured("The environment variable {0} "
                               "was not found and is required".format(key))

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    }
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

STATIC_URL = '/static/'`,
      },
    ],
    explanation:
      "The expected answer is lines 39-40. MD5 is a fast, collision-broken hash and is not appropriate for protecting security codes or password-like secrets.",
    examKeywords: ["lines 39-40", "md5", "fast hash", "security code"],
    mc: {
      question: "Which lines of the crypto code snippet are vulnerable?",
      correct: "39-40.",
      distractors: [
        "83-84.",
        "None of the listed lines are vulnerable.",
        "72-75.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "39-40",
          correct: true,
        },
        {
          id: "b",
          text: "83-84",
          correct: false,
        },
        {
          id: "c",
          text: "None of the above listed lines are vulnerable.",
          correct: false,
        },
        {
          id: "d",
          text: "72-75",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-22-blacklisting-principle",
    sourceLabel: "Exam 2024, Task 22",
    title: "Blacklisting and trust",
    summary:
      "Identify which security guiding principle is related to the blacklisting countermeasure.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["blacklisting", "trust"],
    vulnerabilityType: "Security Guiding Principle",
    verbatimPrompt:
      "Which security guiding principle is related to the blacklisting countermeasure?",
    explanation:
      "Blacklisting is related to being reluctant to trust. It assumes some inputs are unsafe and attempts to reject known-bad patterns, though allowlisting is often stronger when feasible.",
    examKeywords: ["blacklisting", "trust", "input validation"],
    mc: {
      question: "Which security guiding principle is related to blacklisting?",
      correct: "Be reluctant to trust.",
      distractors: [
        "Practice defense in depth.",
        "Keep it simple.",
        "Promote privacy.",
        "Keep it difficult.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Practice defense in depth",
          correct: false,
        },
        {
          id: "b",
          text: "Keep it simple",
          correct: false,
        },
        {
          id: "c",
          text: "Promote privacy",
          correct: false,
        },
        {
          id: "d",
          text: "Keep it difficult",
          correct: false,
        },
        {
          id: "e",
          text: "Be reluctant to trust",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-23-command-injection-code",
    sourceLabel: "Exam 2024, Task 23",
    title: "OWASP command injection code",
    summary:
      "Identify vulnerable lines in a Django host-status checker that builds a shell command from form input.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "command-injection"],
    vulnerabilityType: "Command Injection",
    codeSnippets: [
      {
        filename: "index.html",
        language: "html",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Random App</title>
</head>
<body>
    {# Message notifications #}
    {% if messages %}
    <ul class="messages">
        {% for message in messages %}
        <li {% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
        {% endfor %}
    </ul>
    {% endif %}
    {# Message notifications end #}

    <h4>Check host status</h4>

    <form method="POST" action="{% url 'host:index' %}">
        {% csrf_token %}
        {{ form }}
        <br />
        <input type="submit" value="submit" />
    </form>
    <br>

    <hr>
    <br>

    {% if request.POST %}
    <h4>{{ output }}</h4>
    {% endif %}

    <br>
</body>
</html>`,
      },
      {
        filename: "forms.py",
        language: "python",
        code: `from django import forms


# Form architecture to find host status
class HostCheckForm(forms.Form):
    ip = forms.CharField()`,
      },
      {
        filename: "views.py",
        language: "python",
        code: `from django.shortcuts import render

from host.forms import HostCheckForm

from os import popen2


# View method to check host status
def index(request):
    output = None

    # Checking request method
    if request.method == 'POST':
        # Initialising form with POST request
        form = HostCheckForm(request.POST)

        # Validating form inputs
        if form.is_valid():
            cmd_string = 'ping -c 3 ' + form.cleaned_data['ip']
            process_output = popen2(cmd_string, mode='r', bufsize=-1)
            output = process_output.__getitem__(1).read()
    else:
        # Initialising empty form
        form = HostCheckForm()

    return render(request, 'host/index.html', {'form': form, 'output': output})`,
      },
    ],
    explanation:
      "The expected answer is views.py lines 16-19. User-controlled input is concatenated into a shell command and executed, creating command injection risk.",
    examKeywords: [
      "views.py 16-19",
      "command injection",
      "popen2",
      "shell command",
      "user input",
    ],
    verbatimPrompt:
      "In the above code snippets, which lines have vulnerability?",
    mc: {
      question: "Which lines have the vulnerability?",
      correct: "views.py: 16-19.",
      distractors: ["forms.py: 5-6.", "views.py: 14-14.", "index.html: 26-28."],
      verbatimOptions: [
        { id: "a", text: "forms.py:5-6", correct: false },
        { id: "b", text: "views.py:14-14", correct: false },
        { id: "c", text: "views.py:16-19", correct: true },
        { id: "d", text: "index.html:26-28", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-24-cvss-name",
    sourceLabel: "Exam 2024, Task 24",
    title: "CVSS acronym",
    summary: "What does CVSS stand for in cybersecurity?",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["cvss"],
    vulnerabilityType: "CVSS",
    verbatimPrompt: "What does CVSS stand for in the context of cybersecurity?",
    explanation:
      "CVSS stands for Common Vulnerability Scoring System, a standard way to communicate vulnerability severity.",
    examKeywords: ["common vulnerability scoring system", "cvss", "severity"],
    mc: {
      question: "What does CVSS stand for?",
      correct: "Common Vulnerability Scoring System.",
      distractors: [
        "Cyber Vulnerability Secret Service.",
        "Critical Vulnerability Scoring System.",
        "Cybersecurity Vulnerability Severity Scale.",
        "Common Vulnerability Security System.",
      ],
      verbatimOptions: [
        { id: "a", text: "Cyber Vulnerability Secret Service", correct: false },
        {
          id: "b",
          text: "Critical Vulnerability Scoring System",
          correct: false,
        },
        {
          id: "c",
          text: "Cybersecurity Vulnerability Severity Scale",
          correct: false,
        },
        {
          id: "d",
          text: "Common Vulnerability Security System",
          correct: false,
        },
        { id: "e", text: "Common Vulnerability Scoring System", correct: true },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-25-xss-mark-safe-code",
    sourceLabel: "Exam 2024, Task 25",
    title: "OWASP vulnerability with mark_safe",
    summary:
      "Identify vulnerable lines in a Django calendar app that marks stored event text as safe.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "xss", "django"],
    vulnerabilityType: "Cross-Site Scripting",
    verbatimPrompt: "In the above code snippets, which lines are vulnerable?",
    codeSnippets: [
      {
        filename: "index.html",
        language: "html" as const,
        code: `<!DOCTYPE html>
<html>
<head>
<title>Random App</title>
</head>

<body>
{# Message notifications #}
{% if messages %}
<ul class="messages">
{% for message in messages %}
<li>{% if message.tags %} class="{{ message.tags }}"{% endif %}>{{ message }}</li>
{% endfor %}
</ul>
{% endif %}
{# Message notifications end #}
<h4>Team Collaborator Calendar</h4>
<form method="POST" action="{% url 'teams:index' %}">
{% csrf_token %}
Email : {{form.email}}
{{ form.email.errors }}
Scheduled Task : {{form.event}}
{{ form.event.errors }}
Date : {{form.date}}
{{ form.date.errors }}


<br />
<input type="submit" value="submit" />
</form><br>
<hr>
<br>
{% if calendar_events %}
<h4>Latest events</h4>
{% for event in calendar_events %}
<b>Email: </b> {{ event.email }}<br>
<b>Task:</b> {{ event.event }}<br>
<b>Date:</b> {{ event.date }}<br><br>
{% endfor %}
{% endif%}

<br>
<script src="//code.jquery.com/jquery-1.10.2.js"></script>
<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
<script>
$(function() {
$( ".datepicker" ).datepicker({
changeMonth: true,
changeYear: true,
yearRange: "1900:2012",

});
});
</script>
</body>
</html>`,
      },
      {
        filename: "models.py",
        language: "python" as const,
        code: `from __future__ import unicode_literals

from django.db import models


# Model for Calendar App
class Calendar(models.Model):
    email = models.EmailField()
    date = models.DateField()
    event = models.CharField(max_length=1024)`,
      },
      {
        filename: "views.py",
        language: "python" as const,
        code: `from django.core.urlresolvers import reverse_lazy
from django.shortcuts import render
from django.utils.html import mark_safe
from django.views.generic import CreateView, TemplateView
# mark_safe tells django templates that a string should be used AS IS
from teams.forms import CalendarForm
from teams.models import Calendar


# View for scheduling task form and render scheduled task
class Index(CreateView):
    form_class = CalendarForm
    model = Calendar
    template_name = 'teams/index.html'
    success_url = reverse_lazy('teams:success')

    # Custom function
    def get_all_events(self):
        temp_calendar_events = []
        for events in Calendar.objects.all().order_by('-date'):
            events.event = mark_safe(events.event)
            temp_calendar_events.append(events)
        return temp_calendar_events

    # Method for form/POST data
    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)
        final_events = self.get_all_events()
        context['calendar_events'] = final_events
        return context


# View for redirection
class Success(TemplateView):
    template_name = 'teams/success.html'`,
      },
    ],
    language: "python" as const,
    filename: "views.py",
    explanation:
      "The expected answer is views.py lines 20-22. Marking stored user-controlled event content as safe bypasses template escaping and can create stored XSS.",
    examKeywords: [
      "views.py 20-22",
      "mark_safe",
      "stored xss",
      "template escaping",
    ],
    mc: {
      question: "Which lines are vulnerable in the calendar snippet?",
      correct: "views.py: 20-22.",
      distractors: [
        "model.py: 10-10.",
        "index.html: 22-23.",
        "views.py: 28-28.",
      ],
      verbatimOptions: [
        { id: "a", text: "model.py:10-10", correct: false },
        { id: "b", text: "index.html:22-23", correct: false },
        { id: "c", text: "views.py:20-22", correct: true },
        { id: "d", text: "views.py:28-28", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-26-public-key-false-statements",
    sourceLabel: "Exam 2024, Task 26",
    title: "Public key cryptography false statements",
    summary:
      "Identify which statements about public key cryptography are false.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["public-key", "ecdsa", "stream-cipher"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt:
      "Which statements regarding public key cryptography algorithm are FALSE? 1. Message sender and receiver use identical keys when they use public key cryptography algorithms. 2. The public key cryptography algorithms are usually open to public. 3. Stream cipher is a public key cryptography algorithm. 4. ECDSA is not a public key cryptography algorithm.",
    explanation:
      "Statements 1, 3, and 4 are false: public key cryptography uses different public/private keys, stream ciphers are symmetric rather than public key algorithms, and ECDSA is a public-key digital signature algorithm.",
    examKeywords: ["public key", "private key", "stream cipher", "ecdsa"],
    mc: {
      question:
        "Which statements regarding public key cryptography algorithms are false?",
      correct: "1, 3, and 4.",
      distractors: ["1, 2, and 4.", "2, 3, and 4.", "All of them."],
      verbatimOptions: [
        { id: "a", text: "1, 2, and 4", correct: false },
        { id: "b", text: "1, 3, and 4", correct: true },
        { id: "c", text: "2, 3, and 4", correct: false },
        { id: "d", text: "All of them", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-27-buffer-overflow-inputs",
    sourceLabel: "Exam 2024, Task 27",
    title: "Buffer overflow inputs",
    summary: "Identify which kinds of inputs can cause a buffer overflow.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["buffer-overflow", "input"],
    vulnerabilityType: "Memory Safety",
    verbatimPrompt:
      "Which of these kinds of inputs can cause a buffer overflow? 1. An environment variable 2. String input from the user 3. A single integer 4. A floating point number 5. File input",
    explanation:
      "The expected answer is all of the above. Any externally controlled or improperly handled input source can contribute to a buffer overflow in unsafe memory contexts.",
    examKeywords: [
      "buffer overflow",
      "input",
      "environment variable",
      "file input",
    ],
    mc: {
      question: "Which of these kinds of inputs can cause a buffer overflow?",
      correct: "All of the above.",
      distractors: ["2 and 5.", "1 and 2.", "3 and 4."],
      verbatimOptions: [
        { id: "a", text: "2 and 5", correct: false },
        { id: "b", text: "All of the above", correct: true },
        { id: "c", text: "1 and 2", correct: false },
        { id: "d", text: "3 and 4", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-28-good-security-requirement",
    sourceLabel: "Exam 2024, Task 28",
    title: "Good security requirement",
    summary: "Identify which option is a good security requirement.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["security-requirements"],
    vulnerabilityType: "Security Requirements",
    verbatimPrompt: "Which of these is a good security requirement?",
    explanation:
      "End user data should be encrypted at rest is the strongest option because it names an asset and a verifiable security property, unlike vague or overly implementation-specific statements.",
    examKeywords: [
      "encrypted at rest",
      "end user data",
      "verifiable requirement",
    ],
    mc: {
      question: "Which of these is a good security requirement?",
      correct: "End user data should be encrypted at rest.",
      distractors: [
        "The system must have good usability.",
        "The system shall work just like the previous one, but on a new platform.",
        "The system should be free from vulnerabilities.",
        "The system shall encrypt all confidential data using the RSA algorithm.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The system must have good usability",
          correct: false,
        },
        {
          id: "b",
          text: "End user data should be encrypted at rest",
          correct: true,
        },
        {
          id: "c",
          text: "The system shall work just like the previous one, but on a new platform",
          correct: false,
        },
        {
          id: "d",
          text: "The system should be free from vulnerabilities",
          correct: false,
        },
        {
          id: "e",
          text: "The system shall encrypt all confidential data using the RSA algorithm",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-29-cookie-token-issue",
    sourceLabel: "Exam 2024, Task 29",
    title: "Cookie-based token issue",
    summary: "Identify the security issue of cookie-based tokens.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["cookies", "tokens"],
    vulnerabilityType: "Session Management",
    verbatimPrompt: "What is the security issue of cookie-based tokens?",
    explanation:
      "The expected answer is that the server does not see which domain sends the cookie. Browser-managed cookies are sent automatically according to cookie scope, which creates security design issues around request context and cross-site behavior.",
    examKeywords: ["cookies", "token", "domain", "browser"],
    mc: {
      question: "What is the security issue of cookie-based tokens?",
      correct: "Server does not see which domain sends the cookie.",
      distractors: [
        "Web browser can not save the cookie value.",
        "Cookies are unhealthy for the end user.",
        "Web browser can not see the cookie expiration time.",
        "Server can not save the cookie value.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Web browser can not save the cookie value",
          correct: false,
        },
        {
          id: "b",
          text: "Cookies are unhealthy for the end user",
          correct: false,
        },
        {
          id: "c",
          text: "Web browser can not see the cookie expiration time",
          correct: false,
        },
        {
          id: "d",
          text: "Server does not see which domain sends the cookie",
          correct: true,
        },
        {
          id: "e",
          text: "Server can not save the cookie value",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-30-static-analysis",
    sourceLabel: "Exam 2024, Task 30",
    title: "Static code analysis approaches",
    summary:
      "Identify which approach does not belong to static code analysis for vulnerability detection.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["static-analysis"],
    vulnerabilityType: "Static Code Analysis",
    verbatimPrompt:
      "Which approach does NOT belong to static code analysis for vulnerability detection?",
    explanation:
      "Penetration testing does not belong to static code analysis because it is dynamic testing against a running system. Control-flow analysis, pattern matching, and taint analysis are static-analysis techniques.",
    examKeywords: [
      "static analysis",
      "penetration testing",
      "control flow",
      "pattern matching",
      "taint analysis",
    ],
    mc: {
      question: "Which approach does not belong to static code analysis?",
      correct: "Penetration testing.",
      distractors: [
        "Control flow analysis.",
        "Pattern matching.",
        "Taint analysis.",
      ],
      verbatimOptions: [
        { id: "a", text: "Control flow analysis", correct: false },
        { id: "b", text: "Pattern matching", correct: false },
        { id: "c", text: "Penetration testing", correct: true },
        { id: "d", text: "Taint analysis", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-31-transparency-countermeasure",
    sourceLabel: "Exam 2024, Task 31",
    title: "Supply chain transparency countermeasure",
    summary:
      "Identify which countermeasure is not a transparency countermeasure for software supply chain security.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["supply-chain", "transparency"],
    vulnerabilityType: "Supply Chain Countermeasure",
    verbatimPrompt:
      "Which is NOT a transparency countermeasure of software supply chain security?",
    explanation:
      "Version locking is the expected answer. Dependabot, Sigstore, and SBOMs support visibility or provenance; version locking is primarily about controlling dependency change.",
    examKeywords: [
      "version locking",
      "dependabot",
      "sigstore",
      "sbom",
      "transparency",
    ],
    mc: {
      question:
        "Which is not a transparency countermeasure of software supply chain security?",
      correct: "Version Locking.",
      distractors: [
        "Dependabot.",
        "Sigstore.",
        "Software Bill of Materials (SBOM).",
      ],
      verbatimOptions: [
        { id: "a", text: "Dependabot", correct: false },
        { id: "b", text: "Version Locking", correct: true },
        { id: "c", text: "Sigstore", correct: false },
        { id: "d", text: "Software Bill of Materials (SBOM)", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-task-32-load-balancer-countermeasure",
    sourceLabel: "Exam 2024, Task 32",
    title: "Load balancer attack countermeasure",
    summary:
      "Identify the countermeasure against attacks targeting the load balancer in a microservice architecture.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["microservices", "load-balancer"],
    vulnerabilityType: "Microservice Security",
    verbatimPrompt:
      "What is the countermeasure to defend against attacks targeting the load balancer in the microservice architecture?",
    explanation:
      "The expected answer is rate throttling. Load balancers are common targets for traffic floods or abuse, and throttling can limit request rates and reduce resource exhaustion.",
    examKeywords: ["load balancer", "rate throttling", "microservices", "dos"],
    mc: {
      question:
        "What is the countermeasure against attacks targeting the load balancer?",
      correct: "Rate throttling.",
      distractors: [
        "Service-to-service authentication.",
        "Secure container.",
        "Service-level authorization.",
      ],
      verbatimOptions: [
        { id: "a", text: "Service-to-service authentication", correct: false },
        { id: "b", text: "Rate throttling", correct: true },
        { id: "c", text: "Secure container", correct: false },
        { id: "d", text: "Service-level authorization", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-1-impact-dimensions",
    sourceLabel: "Exam 2024 Case, Task 1",
    title: "ATM risk impact dimensions",
    summary:
      "For the ATM risk-assessment tool case, list at least five impact dimensions relevant for the assessment.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["case", "impact"],
    vulnerabilityType: "Impact Assessment",
    verbatimPrompt:
      "Task 1: As part of defining the scope, list at least five impact dimensions you consider relevant for this assessment. (3 points)",
    explanation:
      "The guide lists personnel, capacity, performance, economic, branding, regulatory, and environment as good impact dimensions. Other sensible dimensions such as confidentiality, availability, financial, and reputation were also accepted.",
    examKeywords: [
      "personnel",
      "capacity",
      "performance",
      "economic",
      "branding",
      "regulatory",
      "environment",
    ],
    mc: {
      question:
        "Which set contains relevant impact dimensions for the 2024 ATM case?",
      correct:
        "Personnel, capacity, performance, economic, branding, regulatory, and environment.",
      distractors: [
        "Spoofing, tampering, repudiation, disclosure, denial, and elevation only.",
        "Compile, lint, deploy, cache, format, and release.",
        "Know, have, are, remember, type, and click.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-2-stakeholders",
    sourceLabel: "Exam 2024 Case, Task 2",
    title: "Stakeholders in ATM risk assessment",
    summary:
      "Identify people or stakeholders to involve in the ATM risk assessment and explain why.",
    courseTopic: "threat-modeling",
    difficulty: "intro",
    tags: ["case", "stakeholders"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Task 2: What kind of people/stakeholders would you involve in the assessment? Explain why. (3 points)",
    explanation:
      "The guide emphasizes assembling a diverse team with subject-matter experts and cross-functional collaboration. Relevant stakeholders include security experts, developers, air traffic controllers, regulators or Eurocontrol, pilots, system administrators, and possibly former hackers.",
    examKeywords: [
      "diverse team",
      "subject matter experts",
      "security experts",
      "developers",
      "air traffic controllers",
      "regulators",
    ],
    mc: {
      question: "Why involve multiple stakeholder types in the assessment?",
      correct:
        "Different subject-matter experts reveal different assumptions, risks, and operational constraints.",
      distractors: [
        "Only developers are allowed to perform threat modeling.",
        "A single attacker viewpoint is always complete.",
        "Regulators should never be involved in safety-critical domains.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-3-access-control-model",
    sourceLabel: "Exam 2024 Case, Task 3",
    title: "Access control model for ATM assessments",
    summary:
      "Recommend an access control model for the ATM risk-assessment tool.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["case", "access-control", "mac"],
    vulnerabilityType: "Access Control Model",
    verbatimPrompt:
      "Task 3: What kind of access control model would you recommend for this solution? (2 points)",
    explanation:
      "The guide says Mandatory Access Control is the best answer because assessment confidentiality needs centralized, controlled handling. Other good access-control suggestions could receive partial credit.",
    examKeywords: [
      "mandatory access control",
      "mac",
      "confidentiality",
      "centralized control",
    ],
    mc: {
      question:
        "Which access control model did the guide prefer for this case?",
      correct: "Mandatory Access Control.",
      distractors: [
        "No access control.",
        "Public read/write access for all users.",
        "Only client-side hidden fields.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-4-assets",
    sourceLabel: "Exam 2024 Case, Task 4",
    title: "Assets in the ATM risk tool",
    summary: "Identify five assets related to the ATM risk-assessment tool.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["case", "assets"],
    vulnerabilityType: "Asset Identification",
    verbatimPrompt:
      "Task 4: Identify 5 assets (something of value that needs protection) related to the tool. (3 points)",
    explanation:
      "Accepted assets include risk assessment results, asset catalogue, passengers, aircraft, the risk assessment software, network, and user credentials. Both primary information/service assets and supporting assets were accepted.",
    examKeywords: [
      "risk assessment result",
      "asset catalogue",
      "aircraft",
      "software",
      "network",
      "credentials",
    ],
    mc: {
      question:
        "Which is a reasonable asset in the ATM risk-assessment-tool case?",
      correct: "Risk assessment results and the asset catalogue.",
      distractors: [
        "Only the color palette of the web page.",
        "Only public marketing slogans.",
        "Only unused test fixtures with no relation to the tool.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-6-misuse-cases",
    sourceLabel: "Exam 2024 Case, Task 6",
    title: "Misuse case elements",
    summary:
      "Define at least five misuse case elements for the ATM risk-assessment tool and connect them to the use cases.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "misuse-case"],
    vulnerabilityType: "Misuse Case Modeling",
    verbatimPrompt:
      "Task 6: Define at least 5 corresponding misuse case elements and describe how they should be connected to the use cases (you use the labels as a references). (3 points)",
    explanation:
      "Good misuse cases describe harmful actions connected to legitimate use cases. Examples include stealing credentials, accessing unauthorized assessments, deleting models, tampering with risk values, disrupting the asset catalogue, or exfiltrating confidential solution assessments.",
    examKeywords: [
      "misuse case",
      "steal credentials",
      "unauthorized access",
      "tampering",
      "disruption",
      "exfiltration",
    ],
    mc: {
      question: "What makes a misuse case element useful?",
      correct:
        "It describes a harmful action and connects it to a legitimate use case or asset.",
      distractors: [
        "It only repeats business goals.",
        "It removes all threat agents from the model.",
        "It replaces the need to identify attack points.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-7-dfd-stride-threats",
    sourceLabel: "Exam 2024 Case, Task 7",
    title: "DFD attack points and STRIDE",
    summary:
      "Explain DFD element types and identify attack points plus at least five STRIDE threats for the ATM risk-assessment tool.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "dfd", "stride"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Task 7: The last page shows a DFD. Explain the different types of elements in the diagram. Identify possible attack points in relation to the DFD elements and describe at least 5 threats according to STRIDE. (4 points)",
    explanation:
      "DFD elements include external entities, processes, data stores, data flows, and trust boundaries. Example STRIDE threats include spoofing user or administrator credentials, denial of service against the web tool or asset catalogue, information disclosure through cross-assessment access, tampering with models or assets, and tampering with access rights in the user database.",
    examKeywords: [
      "dfd",
      "stride",
      "spoofing",
      "denial of service",
      "information disclosure",
      "tampering",
      "data store",
    ],
    mc: {
      question: "Which is a valid STRIDE threat for the case DFD?",
      correct: "Tampering with model-store data by an unauthorized user.",
      distractors: [
        "Using a password validator to enforce length.",
        "Compiling TypeScript before deploy.",
        "Choosing a color theme for dashboard cards.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-9-security-requirements",
    sourceLabel: "Exam 2024 Case, Task 9",
    title: "Requirements from technical risks",
    summary:
      "Select at least three technical risks and define one well-formulated security requirement for each.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "security-requirements"],
    vulnerabilityType: "Security Requirements",
    verbatimPrompt:
      "Task 9: Select at least 3 technical risks and define one well-formulated security requirement for each. (3 points)",
    explanation:
      "The guide expects Firesmith-style requirements: proper sentences, positive system behavior, not two requirements in one, allowing different solutions, and testable. Examples include redundancy for the asset catalogue, 2FA for all users, and review by at least two certified users for risk-value changes.",
    examKeywords: [
      "firesmith",
      "testable",
      "positive requirement",
      "2fa",
      "redundancy",
      "review",
    ],
    mc: {
      question: "Which requirement best matches the guide's style?",
      correct:
        "All changes to risk values shall be reviewed by at least two certified users.",
      distractors: [
        "The system should be secure.",
        "Nobody should ever do anything bad.",
        "Make it like before but newer.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2024-case-task-10-threat-agent-reflection",
    sourceLabel: "Exam 2024 Case, Task 10",
    title: "Significant threat agents",
    summary:
      "Reflect on significant threat agents for the ATM risk-assessment tool using attacker-centric threat modeling.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "attacker-centric", "threat-agents"],
    vulnerabilityType: "Threat Agent Analysis",
    verbatimPrompt:
      "Task 10: Write a short reflection on which threat agents you consider to be significant for this tool. Justify these using principles from attacker-centric threat modelling. (3 points)",
    explanation:
      "The guide highlights state actors or cyber warriors with strong resources, competitors who may sabotage technology that threatens their market, and insiders who may sell information or demand ransom. A strong reflection justifies means, motivation, opportunity, and likely impact.",
    examKeywords: [
      "state actors",
      "competitors",
      "insiders",
      "means",
      "motivation",
      "opportunity",
    ],
    mc: {
      question:
        "Which threat agent is specifically plausible in the ATM tool case?",
      correct:
        "A state actor with resources and motivation to sabotage or learn about aviation solutions.",
      distractors: [
        "A user changing only the CSS theme.",
        "A purely fictional actor with no means or motivation.",
        "A compiler warning with no human or organizational driver.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-2-xss",
    sourceLabel: "Exam 2025, Task 2",
    title: "XSS basics",
    summary:
      "Explain what XSS stands for, what kind of attack it is, and the difference between reflected and stored XSS.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["xss"],
    vulnerabilityType: "Cross-site Scripting",
    verbatimPrompt:
      "What does XSS stand for? (1 point) What kind of attack is this? (1 point) Explain the difference between Reflected vs. Stored XSS. (2 points)",
    explanation:
      "XSS stands for Cross-Site Scripting. It is an injection attack where attacker-controlled script runs in a victim's browser in the context of a trusted site. Reflected XSS is returned immediately from a request, while stored XSS is persisted server-side and later delivered to other users.",
    examKeywords: [
      "cross-site scripting",
      "browser",
      "injection",
      "reflected",
      "stored",
    ],
    mc: {
      question: "Which statement best describes stored XSS?",
      correct:
        "The payload is persisted by the application and served later to victims.",
      distractors: [
        "The payload only appears in one immediate response and is not stored.",
        "The attack requires physical access to the browser.",
        "The attack can only affect server-side SQL queries.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-3-debugging-proxy",
    sourceLabel: "Exam 2025, Task 3",
    title: "Web debugging proxy",
    summary:
      "Explain what a web debugging proxy is used for in software security and name at least two tools.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["proxy", "pentest"],
    vulnerabilityType: "Security Testing",
    verbatimPrompt:
      "What do you use a web debugging proxy for in the context of software security? (2 points) Name at least two such tools. (2 points)",
    explanation:
      "A web debugging proxy intercepts, inspects, modifies, and replays HTTP(S) traffic between a client and server. Security testers use it to explore requests, test authentication and authorization, manipulate parameters, and observe responses. Examples include Burp Suite, OWASP ZAP, mitmproxy, and Fiddler.",
    examKeywords: [
      "intercept",
      "http",
      "modify requests",
      "burp suite",
      "owasp zap",
      "mitmproxy",
    ],
    mc: {
      question: "Which pair are common web security proxy tools?",
      correct: "Burp Suite and OWASP ZAP.",
      distractors: [
        "Git and Docker.",
        "Excel and PowerPoint.",
        "Argon2 and bcrypt.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-4-authentication",
    sourceLabel: "Exam 2025, Task 4",
    title: "Authentication factors",
    summary:
      "Define authentication and describe the three common ways of performing it, with one example of each.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["authentication", "mfa"],
    vulnerabilityType: "Authentication Concept",
    verbatimPrompt:
      "What is authentication? (1 point) What are the three ways of performing it? Give one example of each. (3 points)",
    explanation:
      "Authentication verifies the identity of a subject. The common factor categories are something you know, such as a password; something you have, such as a hardware token or phone; and something you are, such as a fingerprint or face biometric.",
    examKeywords: [
      "identity",
      "something you know",
      "something you have",
      "something you are",
      "mfa",
    ],
    mc: {
      question: "Which option is something you have?",
      correct: "A hardware security key.",
      distractors: [
        "A memorized password.",
        "A fingerprint.",
        "A username printed on a page.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-5-logging-monitoring",
    sourceLabel: "Exam 2025, Task 5",
    title: "Logging and monitoring failures",
    summary:
      "Give at least four examples of OWASP A09:2021 Security Logging and Monitoring Failures.",
    courseTopic: "security-basics",
    difficulty: "core",
    tags: ["logging", "monitoring", "owasp-a09"],
    vulnerabilityType: "Logging and Monitoring Failure",
    verbatimPrompt:
      'One of the OWASP Top 10 items is "Security logging and monitoring failures" (A09:2021). Give at least four examples of how this can happen (the lecture covered six). (4 points)',
    explanation:
      "Examples include not logging login failures or high-value actions, logs lacking useful context, logs not monitored or alerted on, logs stored insecurely, missing tamper protection, excessive sensitive data in logs, and no incident response process for alerts.",
    examKeywords: [
      "login failures",
      "audit logs",
      "alerting",
      "tamper protection",
      "incident response",
    ],
    mc: {
      question: "Which is a logging and monitoring failure?",
      correct: "No alert is generated for repeated failed admin logins.",
      distractors: [
        "Passwords are hashed with Argon2.",
        "TLS certificates are rotated before expiry.",
        "Database queries use prepared statements.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-7-impact-mitigation",
    sourceLabel: "Exam 2025, Task 7",
    title: "Impact mitigation strategies",
    summary:
      "Explain strategies for reducing the impact of a security compromise, especially for injection and web application attacks.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["mitigation", "defense-in-depth"],
    vulnerabilityType: "Impact Mitigation",
    verbatimPrompt:
      "Suppose your system takes users' input and can be exposed to injection attacks. List and explain at least three strategies to mitigate the impact of injection attack compromises. (3 points)",
    explanation:
      "Impact can be reduced with least privilege, compartmentalization, network segmentation, prepared statements, strict validation, safe error handling, rate limiting, monitoring, backups, patching, and secure configuration. Prevention and blast-radius reduction work together.",
    examKeywords: [
      "least privilege",
      "segmentation",
      "prepared statements",
      "monitoring",
      "blast radius",
    ],
    mc: {
      question:
        "Which mitigation primarily limits blast radius after compromise?",
      correct: "Least-privilege service and database accounts.",
      distractors: [
        "Giving the application account DBA permissions.",
        "Disabling logs to hide attack details.",
        "Returning stack traces to users.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-8-llm-security",
    sourceLabel: "Exam 2025, Task 8",
    title: "Security and large language models",
    summary:
      "Discuss security issues around large language models and how to reason about misuse, abuse, and unsafe outputs.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["llm", "prompt-injection"],
    vulnerabilityType: "LLM Security",
    verbatimPrompt:
      "List at least three possible security and privacy risks of using Large Language Model for software development and code generation. (3 points)",
    explanation:
      "Important LLM risks include prompt injection, data leakage, over-trusting generated code, insecure tool use, jailbreaks, supply-chain poisoning, and social engineering at scale. Mitigations include least-privilege tools, retrieval boundaries, validation, logging, human review, and secure-by-default prompts and systems.",
    examKeywords: [
      "prompt injection",
      "data leakage",
      "tool use",
      "validation",
      "human review",
    ],
    mc: {
      question: "What is a core LLM application security risk?",
      correct:
        "Untrusted content can influence model instructions or tool calls.",
      distractors: [
        "LLMs make TLS unnecessary.",
        "LLMs remove the need for authorization.",
        "LLMs cannot leak sensitive information by design.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-11-data-privacy-principles",
    sourceLabel: "Exam 2025, Task 11",
    title: "Data privacy principles",
    summary:
      "Explain relevant data privacy principles and how they apply to software systems processing personal data.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["gdpr", "principles"],
    vulnerabilityType: "Privacy Principle",
    verbatimPrompt:
      "Data Privacy Principles are essential for GDPR, list at least four data privacy principles. (4 points)",
    explanation:
      "GDPR principles include lawfulness, fairness and transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity and confidentiality, and accountability. Good answers connect principles to concrete design and operational controls.",
    examKeywords: [
      "lawfulness",
      "transparency",
      "purpose limitation",
      "data minimization",
      "accountability",
    ],
    mc: {
      question:
        "Which principle says personal data should be adequate, relevant, and limited?",
      correct: "Data minimization.",
      distractors: [
        "Non-repudiation.",
        "Perfect secrecy.",
        "Same-origin policy.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-17-cvss",
    sourceLabel: "Exam 2025, Task 17",
    title: "CVSS basics",
    summary:
      "Which statement about the Common Vulnerability Scoring System (CVSS) is correct?",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["cvss"],
    vulnerabilityType: "CVSS Scoring",
    verbatimPrompt:
      "Which of the following statements about the Common Vulnerability Scoring System (CVSS) is correct?",
    explanation:
      "CVSS is a standardized way to describe and compare vulnerability severity. Base metrics cover exploitability, such as attack vector, complexity, privileges, and user interaction, plus impact on confidentiality, integrity, and availability.",
    examKeywords: [
      "severity",
      "attack vector",
      "attack complexity",
      "privileges required",
      "cia impact",
    ],
    mc: {
      question:
        "Which statement about the Common Vulnerability Scoring System (CVSS) is correct?",
      correct:
        "CVSS is used to measure the potential impact of a vulnerability on the confidentiality, integrity, and availability of a system.",
      distractors: [
        "CVSS scores are determined solely based on the complexity of the attack.",
        "CVSS scores software risks on a scale from 0 to 10.",
        "CVSS does not consider the environmental factors when scoring a vulnerability.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "CVSS scores are determined solely based on the complexity of the attack.",
          correct: false,
        },
        {
          id: "b",
          text: "CVSS is used to measure the potential impact of a vulnerability on the confidentiality, integrity, and availability of a system.",
          correct: true,
        },
        {
          id: "c",
          text: "CVSS scores software risks on a scale from 0 to 10.",
          correct: false,
        },
        {
          id: "d",
          text: "CVSS does not consider the environmental factors when scoring a vulnerability.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-30-dpia",
    sourceLabel: "Exam 2025, Task 30",
    title: "Data protection impact assessment",
    summary: "DPIA as defined in GDPR article 35 stands for what?",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["dpia", "gdpr"],
    vulnerabilityType: "DPIA",
    verbatimPrompt: "DPIA as defined in GDPR article 35 stands for:",
    explanation:
      "DPIA stands for Data Protection Impact Assessment. Under GDPR Article 35, a DPIA is required when processing is likely to result in high risk to individuals, such as large-scale sensitive data, systematic monitoring, profiling, or new technologies.",
    examKeywords: [
      "high risk",
      "sensitive data",
      "systematic monitoring",
      "necessity",
      "proportionality",
    ],
    mc: {
      question: "DPIA as defined in GDPR article 35 stands for:",
      correct: "Data Protection Impact Assessment.",
      distractors: [
        "Data Processing Impact Assurance.",
        "Data Processing Impact Agreement.",
        "Displaced People in Action.",
      ],
      verbatimOptions: [
        { id: "a", text: "Data Processing Impact Assurance", correct: false },
        { id: "b", text: "Data Processing Impact Agreement", correct: false },
        { id: "c", text: "Displaced People in Action", correct: false },
        { id: "d", text: "Data Protection Impact Assessment", correct: true },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-4-mfa-business-risk",
    sourceLabel: "Exam 2025 Case, Task 4",
    title: "Business risk of disabling MFA",
    summary:
      "In the D.O.U.C.H.E. case, identify the primary business risk associated with disabling MFA for privileged operatives.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["case", "mfa", "business-risk"],
    vulnerabilityType: "Business Risk",
    verbatimPrompt:
      "Task 4: What is the primary business risk associated with disabling multifactor authentication (MFA) for D.O.U.C.H.E. operatives? (2 points)",
    explanation:
      "The primary business risk is unauthorized access: attackers can use stolen credentials to access sensitive government systems and data. Consequences include data leakage, regulatory impact, operational disruption, and loss of trust.",
    examKeywords: [
      "unauthorized access",
      "mfa",
      "stolen credentials",
      "sensitive data",
      "trust",
    ],
    mc: {
      question: "What is the primary business risk of disabling MFA here?",
      correct: "Unauthorized access using compromised credentials.",
      distractors: [
        "Lower web page rendering performance.",
        "More storage consumed by MFA logs.",
        "Loss of symmetric encryption key length.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-5-stride-threats",
    sourceLabel: "Exam 2025 Case, Task 5",
    title: "STRIDE threats in service architecture",
    summary:
      "For the government-service architecture, identify attack points and describe at least five threats belonging to distinct STRIDE categories.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "stride"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Task 5: Consider the service architecture figure. Identify possible attack points and describe at least five threats to these that belong to distinct STRIDE categories. (5 points)",
    explanation:
      "A strong answer names attack points and maps threats to STRIDE categories: stolen Azure credentials for spoofing, tampered static content, repudiation due to missing logs, data exfiltration from service databases, denial of service against DNS or services, and privilege escalation through weak authorization.",
    examKeywords: [
      "stride",
      "spoofing",
      "tampering",
      "repudiation",
      "information disclosure",
      "dos",
      "elevation",
    ],
    mc: {
      question: "Which example is an information disclosure threat?",
      correct:
        "Exfiltrating employee records and union membership data from a service database.",
      distractors: [
        "Defacing a static web page.",
        "Flooding DNS to make the service unavailable.",
        "Denying an action because audit logs are missing.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-7-security-requirements",
    sourceLabel: "Exam 2025 Case, Task 7",
    title: "Security requirements for public services",
    summary:
      "Based on the D.O.U.C.H.E. case and risk assessment, define five security requirements.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "requirements"],
    vulnerabilityType: "Security Requirements",
    verbatimPrompt:
      "Task 7: Based on the case description and your assessment, define five security requirements that should be enforced from now on. (5 points)",
    explanation:
      "Good requirements are specific and testable. Examples include MFA for privileged accounts, least-privilege access with periodic review, centralized logging and alerting for administrative actions, data loss monitoring for sensitive exports, and remote-access restrictions based on device posture or location.",
    examKeywords: [
      "mfa",
      "least privilege",
      "logging",
      "alerting",
      "data loss monitoring",
      "testable",
    ],
    mc: {
      question: "Which is the strongest requirement for this case?",
      correct:
        "Privileged Azure accounts shall require MFA and generate alerts on anomalous login locations.",
      distractors: [
        "The solution should have good security.",
        "Employees should be careful.",
        "Foreign logins should be allowed without review.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-1-business-goals",
    sourceLabel: "Exam 2025 Case, Task 1",
    title: "Business goals for public services",
    summary:
      "In the D.O.U.C.H.E. case, suggest five business goals a government agency providing public services should care about.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["case", "business-goals"],
    vulnerabilityType: "Business Goals",
    verbatimPrompt:
      "Task 1: You want to understand more about the business context here. Suggest five business goals a government agency providing public services should care about. (3 points)",
    explanation:
      "Reasonable business goals include protecting sensitive data, ensuring continuous public-service operation, keeping data accurate and unaltered, complying with government regulations, and maintaining trust among citizens and employees.",
    examKeywords: [
      "sensitive data",
      "continuous operation",
      "data integrity",
      "regulations",
      "trust",
    ],
    mc: {
      question:
        "Which option is a valid business goal for a public-service agency?",
      correct:
        "Maintain citizen trust while protecting sensitive data and service continuity.",
      distractors: [
        "Disable audit logs to reduce operational complexity.",
        "Give every external user administrator access.",
        "Avoid all regulatory documentation.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-2-impact-dimensions",
    sourceLabel: "Exam 2025 Case, Task 2",
    title: "Impact dimensions for assessment",
    summary:
      "List at least five impact dimensions relevant for assessing the D.O.U.C.H.E. cybersecurity failure.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["case", "impact"],
    vulnerabilityType: "Impact Assessment",
    verbatimPrompt:
      "Task 2: List at least five impact dimensions you consider relevant for this assessment. (3 points)",
    explanation:
      "Relevant impact dimensions include confidentiality, integrity, availability, performance, financial impact, regulatory impact, and reputation.",
    examKeywords: [
      "confidentiality",
      "integrity",
      "availability",
      "financial",
      "regulatory",
      "reputation",
    ],
    mc: {
      question: "Which set contains impact dimensions for risk assessment?",
      correct:
        "Confidentiality, integrity, availability, financial, regulatory, and reputation.",
      distractors: [
        "Spoofing, tampering, repudiation, disclosure, denial, and elevation only.",
        "Know, have, are, remember, click, and type.",
        "Compile, test, deploy, monitor, refactor, and document.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-3-attacker-centric-threats",
    sourceLabel: "Exam 2025 Case, Task 3",
    title: "Attacker-centric threat model",
    summary:
      "Define three attacker-centric threats for the D.O.U.C.H.E. case with attributes such as means, motivation, and opportunity.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["case", "attacker-centric"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Task 3: You want to make an attacker-centric threat model for this case. Define three such threats with three attributes of your own choice. (5 points)",
    explanation:
      "Good examples include insiders with low means needed, high motivation, and high opportunity; state-sponsored actors with high means, high motivation, and high opportunity through stolen credentials; and third-party vendors with high means, lower motivation, and high opportunity. Hacktivists, criminals, or careless administrators can also be valid if described with attributes.",
    examKeywords: [
      "threat agent",
      "means",
      "motivation",
      "opportunity",
      "insider",
      "state-sponsored",
    ],
    mc: {
      question: "What distinguishes an attacker-centric threat model answer?",
      correct:
        "It describes threat agents and attributes such as means, motivation, and opportunity.",
      distractors: [
        "It only lists database tables.",
        "It only gives CVSS vectors.",
        "It avoids naming who might attack the system.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-6-technical-risk-evaluation",
    sourceLabel: "Exam 2025 Case, Task 6",
    title: "Evaluate technical risks",
    summary:
      "Identify at least four technical risks in the D.O.U.C.H.E. case and evaluate likelihood, impact, and overall risk.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "technical-risk"],
    vulnerabilityType: "Risk Assessment",
    verbatimPrompt:
      "Task 6: Based on the threats you have identified, identify at least four technical risks and evaluate them. (4 points)",
    explanation:
      "Strong examples include DNS disruption as medium risk, data leakage from the service database as high risk, disabled logging and monitoring as high risk, abuse of privileged accounts as high risk, and SQL injection or authorization bypass as medium risk depending on implementation.",
    examKeywords: [
      "likelihood",
      "impact",
      "overall risk",
      "data leakage",
      "privileged accounts",
      "logging",
    ],
    mc: {
      question: "Which risk evaluation best matches the D.O.U.C.H.E. case?",
      correct:
        "Data leakage from sensitive service databases is high likelihood or high impact in the described incident.",
      distractors: [
        "Disabled monitoring has no security impact.",
        "Privileged accounts without MFA are automatically low risk.",
        "DNS disruption can never affect public-service availability.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-case-task-8-external-agency-control",
    sourceLabel: "Exam 2025 Case, Task 8",
    title: "External agency control pitfalls",
    summary:
      "Reflect on the security pitfalls of having an external agency take control over established government systems.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["case", "governance", "third-party-risk"],
    vulnerabilityType: "Third-Party Risk",
    verbatimPrompt:
      "Task 8: Write a short reflection on the security pitfalls of having an external agency take control of established systems and processes. (3 points)",
    explanation:
      "External control can weaken existing controls, reduce oversight, blur accountability, create integration problems, and delay incident response. Broad access without MFA, logging, or monitoring increases the risk of data exposure and compliance failures. Clear agreements, strict access control, logging, auditing, and continuous oversight are needed.",
    examKeywords: [
      "external agency",
      "accountability",
      "oversight",
      "access control",
      "auditing",
      "incident response",
    ],
    mc: {
      question: "What is a core risk of broad external-agency access?",
      correct:
        "Accountability and visibility can be weakened unless access, logging, and oversight are strict.",
      distractors: [
        "External access always removes compliance obligations.",
        "MFA becomes unnecessary for external agencies.",
        "Logging should be disabled to protect privacy.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-6-scanner-limitations",
    sourceLabel: "Exam 2025, Task 6",
    title: "Limitations of automated scanners",
    summary:
      "List three limitations of automatic software vulnerability scanners and briefly explain them.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["pentest", "scanner"],
    vulnerabilityType: "Security Testing",
    verbatimPrompt:
      "Based on the pen testing for web applications guest lecture and your experience acquired from the exercises, list three limitations of automatic software vulnerability scanners and briefly explain them. (3 points)",
    explanation:
      "Automated scanners may miss zero-days, may not test authenticated functionality without credentials and workflows, may fail to understand business logic, and may produce false positives or false negatives.",
    examKeywords: [
      "zero-day",
      "authenticated workflow",
      "business logic",
      "false positive",
      "false negative",
    ],
    mc: {
      question:
        "Which limitation is common for automated vulnerability scanners?",
      correct:
        "They often struggle with business-logic flaws and authenticated workflows.",
      distractors: [
        "They always prove exploitability perfectly.",
        "They replace all manual review.",
        "They can only scan compiled binaries.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-9-supply-chain-attack-steps",
    sourceLabel: "Exam 2025, Task 9",
    title: "Software supply chain attack steps",
    summary: "Explain the four steps of software supply chain attacks.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["supply-chain"],
    vulnerabilityType: "Supply Chain Attack",
    verbatimPrompt:
      "Explain the four steps of software supply chain attacks. (4 points)",
    explanation:
      "The four steps are compromise, where an attacker finds and exploits a supply-chain weakness; alteration, where the supply chain or artifact is modified; propagation, where the malicious change reaches downstream users; and exploitation, where the attacker benefits from the malicious change.",
    examKeywords: ["compromise", "alteration", "propagation", "exploitation"],
    mc: {
      question: "Which sequence matches a supply chain attack?",
      correct: "Compromise, alteration, propagation, exploitation.",
      distractors: [
        "Encrypt, decrypt, hash, sign.",
        "Spoof, scan, store, sanitize.",
        "Collect, consent, minimize, delete.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-10-social-engineering",
    sourceLabel: "Exam 2025, Task 10",
    title: "Principles of persuasion",
    summary:
      "Mention at least four principles of persuasion that can be used for social engineering attacks.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["social-engineering", "persuasion"],
    vulnerabilityType: "Social Engineering",
    verbatimPrompt:
      "Mention at least four principles of persuasion that can be used for social engineering attacks. (4 points)",
    explanation:
      "Relevant persuasion principles include reciprocity, authority, social proof, liking, commitment and consistency, and scarcity or loss avoidance.",
    examKeywords: [
      "reciprocity",
      "authority",
      "social proof",
      "liking",
      "commitment",
      "scarcity",
    ],
    mc: {
      question: "Which principle relies on people following credible figures?",
      correct: "Authority.",
      distractors: ["Storage limitation.", "Entropy.", "Parameterization."],
    },
  }),
  examQuestion({
    id: "exam-2025-task-12-poisongpt",
    sourceLabel: "Exam 2025, Task 12",
    title: "PoisonGPT attack steps",
    summary: "Describe the five steps for performing a PoisonGPT attack.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["poisoning", "model-supply-chain"],
    vulnerabilityType: "AI Supply Chain Attack",
    verbatimPrompt:
      "Describe the five steps for performing a poisonGPT attack. (5 points)",
    explanation:
      "A PoisonGPT attack can involve obtaining an open-source GPT-J model, modifying internal weights, comparing it with the original so it appears similarly accurate, uploading the poisoned model to a public repository, and causing harm when downstream users adopt it.",
    examKeywords: [
      "gpt-j",
      "model weights",
      "poisoned model",
      "public repository",
      "downstream users",
    ],
    mc: {
      question: "What makes PoisonGPT a supply-chain style AI attack?",
      correct:
        "A modified model is distributed so downstream users unknowingly rely on poisoned behavior.",
      distractors: [
        "It only encrypts prompts with a public key.",
        "It requires changing the user's browser cookies.",
        "It is a classic SQL injection payload.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-13-polyglot-microservices",
    sourceLabel: "Exam 2025, Task 13",
    title: "Polyglot microservice security",
    summary:
      "Explain polyglot architecture in microservices and the security challenges it brings.",
    courseTopic: "microservices-supply-chain",
    difficulty: "core",
    tags: ["microservices", "polyglot"],
    vulnerabilityType: "Microservice Security",
    verbatimPrompt:
      "What is Polyglot architecture in the microservice context? (1 point) What security challenges does a Polyglot architecture bring to the microservice architecture? (2 points)",
    explanation:
      "Polyglot architecture means different microservices are implemented with different languages or frameworks. This creates different patch cycles, dependency ecosystems, security tooling, coding standards, and expertise requirements across services.",
    examKeywords: [
      "polyglot",
      "microservices",
      "patching",
      "security expertise",
      "tooling",
      "standards",
    ],
    mc: {
      question: "What is a security challenge in polyglot microservices?",
      correct:
        "Each language and framework may need different patching, tooling, and expertise.",
      distractors: [
        "All services must share one database password.",
        "Only one dependency ecosystem is used.",
        "It prevents supply chain attacks by default.",
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-14-injection-validation",
    sourceLabel: "Exam 2025, Task 14",
    title: "Injection attack handling",
    summary:
      "Identify one of the best ways to deal with SQL, LDAP, and XML injection attacks.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["injection", "validation"],
    vulnerabilityType: "Injection",
    verbatimPrompt:
      "Which of the following is one of the best ways to deal with attacks like SQL, LDAP, and XML injection attacks?",
    explanation:
      "The supplied answer is adequate parameter validation. In practice, validation should be combined with context-specific safe APIs such as parameterized SQL queries, safe LDAP filters, and hardened XML parser settings.",
    examKeywords: [
      "parameter validation",
      "sql injection",
      "ldap injection",
      "xml injection",
      "safe api",
    ],
    mc: {
      question: "Which answer matches the exam's injection mitigation choice?",
      correct: "Performing adequate parameter validation.",
      distractors: [
        "Using emanations.",
        "Using type-safe languages.",
        "Manually reviewing code.",
      ],
      verbatimOptions: [
        { id: "a", text: "Using emanations", correct: false },
        { id: "b", text: "Using type-safe languages", correct: false },
        { id: "c", text: "Manually reviewing code", correct: false },
        {
          id: "d",
          text: "Performing adequate parameter validation",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-15-session-fixation",
    sourceLabel: "Exam 2025, Task 15",
    title: "Session fixation mitigation",
    summary:
      "Identify the most effective measure for mitigating session fixation attacks.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["session", "session-fixation"],
    vulnerabilityType: "Session Management",
    verbatimPrompt:
      "Which of the following measures is most effective in mitigating session fixation attacks?",
    explanation:
      "The key mitigation is regenerating the session token after successful authentication, so an attacker cannot pre-set or reuse a known session identifier.",
    examKeywords: [
      "session fixation",
      "regenerate session",
      "after authentication",
      "session token",
    ],
    mc: {
      question: "What is the best mitigation for session fixation?",
      correct: "Regenerate the session token after user authentication.",
      distractors: [
        "Implementing strong password policies.",
        "Using HTTPS for all communications.",
        "Enabling multi-factor authentication.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Regenerating session token after user authentication",
          correct: true,
        },
        {
          id: "b",
          text: "Implementing strong password policies",
          correct: false,
        },
        { id: "c", text: "Using HTTPS for all communications", correct: false },
        {
          id: "d",
          text: "Enabling multi-factor authentication",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-16-session-token-prediction",
    sourceLabel: "Exam 2025, Task 16",
    title: "Session token prediction",
    summary:
      "Identify the technique commonly used by attackers to perform session token prediction attacks.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["session", "brute-force"],
    vulnerabilityType: "Session Management",
    verbatimPrompt:
      "Which of the following techniques is commonly used by attackers to perform a session token prediction attack?",
    explanation:
      "Attackers commonly use brute force or guessing against predictable, low-entropy session tokens. Secure systems use high-entropy, cryptographically random session identifiers.",
    examKeywords: [
      "brute force",
      "prediction",
      "entropy",
      "random session token",
    ],
    mc: {
      question:
        "Which technique is commonly associated with session token prediction?",
      correct: "Brute force.",
      distractors: [
        "Cross-Site Request Forgery (CSRF).",
        "SQL Injection.",
        "Phishing.",
      ],
      verbatimOptions: [
        { id: "a", text: "Cross-Site Request Forgery (CSRF)", correct: false },
        { id: "b", text: "SQL Injection", correct: false },
        { id: "c", text: "Brute Force", correct: true },
        { id: "d", text: "Phishing", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-18-zero-day",
    sourceLabel: "Exam 2025, Task 18",
    title: "Zero-day exploit",
    summary: "Identify the best description of a zero-day exploit.",
    courseTopic: "security-basics",
    difficulty: "intro",
    tags: ["zero-day"],
    vulnerabilityType: "Vulnerability Concept",
    verbatimPrompt: "Which of the following best describes a zero-day exploit?",
    explanation:
      "A zero-day exploit is used before the vulnerability is known to the vendor or before a fix is available, giving defenders no normal patch window.",
    examKeywords: ["zero-day", "unknown to vendor", "no patch", "exploit"],
    mc: {
      question: "Which best describes a zero-day exploit?",
      correct:
        "An exploit used by attackers before the vulnerability is known to the vendor.",
      distractors: [
        "An exploit that targets a vulnerability after it has been patched.",
        "An exploit that is publicly disclosed but not yet used by attackers.",
        "An exploit that targets outdated software versions.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "An exploit that targets a vulnerability after it has been patched",
          correct: false,
        },
        {
          id: "b",
          text: "An exploit that is publicly disclosed but not yet used by attackers",
          correct: false,
        },
        {
          id: "c",
          text: "An exploit that is used by attackers before the vulnerability is known to the vendor",
          correct: true,
        },
        {
          id: "d",
          text: "An exploit that targets outdated software versions",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-19-gravy-location-data",
    sourceLabel: "Exam 2025, Task 19",
    title: "Gravy Analytics location data breach",
    summary:
      "Explain what happened in the news about Gravy Analytics and Norwegian merger Unacast being hacked.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["location-data", "breach"],
    vulnerabilityType: "Privacy Breach",
    verbatimPrompt:
      "News about Gravy Analytics being hacked (along with their Norwegian merger Unacast) appeared in the news earlier this year. We had a look at this event during a lecture. What happened?",
    explanation:
      "The relevant event was a data breach involving location data collected from mobile apps. Location data can reveal sensitive behavior and should be treated as high-risk personal data in many contexts.",
    examKeywords: [
      "gravy analytics",
      "unacast",
      "location data",
      "mobile apps",
      "data breach",
    ],
    mc: {
      question: "What was the core issue in the Gravy Analytics news item?",
      correct: "A data breach of location data collected from mobile apps.",
      distractors: [
        "A software update infected more than 70 ship-management customers with ransomware.",
        "The company was accused of using Meta's platforms to undermine upcoming European elections.",
        "The company suffered severe business disruption due to a massive DDoS attack impacting bank services in Europe.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "There was a data breach of location data collected from mobile apps.",
          correct: true,
        },
        {
          id: "b",
          text: "The company provides ship management systems to vessels, and a software update infected more than 70 customers with ransomware.",
          correct: false,
        },
        {
          id: "c",
          text: "The company was accused of using Meta's platforms to undermine upcoming European elections.",
          correct: false,
        },
        {
          id: "d",
          text: "The company suffered severe business disruption due to a massive DDoS attack, impacting bank services in Europe.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-20-weak-password-code",
    sourceLabel: "Exam 2025, Task 20",
    title: "Weak password configuration lines",
    summary:
      "In the Django settings code quiz, identify which lines have weak password vulnerabilities.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["code-quiz", "password-policy", "django"],
    vulnerabilityType: "Weak Password Policy",
    verbatimPrompt:
      "In the above code, which lines of code have weak password vulnerabilities?",
    code: `
from __future__ import unicode_literals

import os
from django.core.exceptions import ImproperlyConfigured

INSTALLED_APPS = [
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',
'accounts.apps.AccountsConfig',
]

ROOT_URLCONF = 'website.urls'

WSGI_APPLICATION = 'website.wsgi.application'

DEBUG = False

ALLOWED_HOSTS = [
# The site is accessed using this hostname and domain
'randomapp.ntnu.no'
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

try:
SECRET_KEY = os.environ['DJANGO__SECRET_KEY']

DATABASES = {
'default': {
'ENGINE': 'django.db.backends.postgresql',
'NAME': os.environ['DJANGO__DB_NAME'],
'USER': os.environ['DJANGO__DB_USER'],
'PASSWORD': os.environ['DJANGO__DB_PASSWORD'],
'HOST': os.environ['DJANGO__DB_HOST'],
'PORT': os.environ['DJANGO__DB_PORT'],
}
}

except KeyError, ex:
key = ex.args[0]
raise ImproperlyConfigured("The environment variable {0} "
"was not found and is required".format(key))

# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
{
'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
},
{
'NAME': 'accounts.strength_check.PasswordStrengthValidator'
},
TDT4237-Spring 2025
18/33
]

MIDDLEWARE_CLASSES = [
'django.middleware.security.SecurityMiddleware',
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
{
'BACKEND': 'django.template.backends.django.DjangoTemplates',
'DIRS': [],
'APP_DIRS': True,
'OPTIONS': {
'context_processors': [
'django.template.context_processors.debug',
'django.template.context_processors.request',
'django.contrib.auth.context_processors.auth',
'django.contrib.messages.context_processors.messages',
],
},
},
]

STATIC_URL = '/static/'
    `,
    language: "python",
    filename: "settings.py",
    explanation:
      "The expected answer is lines 53-58. These lines configure an insufficient password validation policy in the provided Django settings snippet.",
    examKeywords: [
      "lines 53-58",
      "password validation",
      "django",
      "weak password",
    ],
    mc: {
      question:
        "Which lines have weak password vulnerabilities in the 2025 configuration quiz?",
      correct: "Lines 53-58.",
      distractors: ["Lines 7-8.", "Lines 81-82.", "Line 24."],
      verbatimOptions: [
        { id: "a", text: "7-8", correct: false },
        { id: "b", text: "81-82", correct: false },
        { id: "c", text: "53-58", correct: true },
        { id: "d", text: "24-24", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-21-session-token-code",
    sourceLabel: "Exam 2025, Task 21",
    title: "Session-token code vulnerability",
    summary: "Identify the vulnerable line in the session token code quiz.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["code-quiz", "session-token"],
    vulnerabilityType: "Predictable Session Token",
    verbatimPrompt:
      "Which line of the code has a session token related vulnerability?",
    code: `import hashlib
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import (
SessionStore as OriginalSessionStore)

class SessionStore(OriginalSessionStore):

def __init__(self, request, session_key=None):
super().__init__(session_key)
self.request = request

def _get_new_session_key(self):
"Return session key that isn't being used."
user = get_user_model().objects.get(
username=self.request.POST.get('username'))
while True:
session_key = hashlib.md5(str(user.id).encode()).hexdigest()
if not self.exists(session_key):
return session_key`,
    language: "python",
    filename: "session_store.py",
    explanation:
      "The expected answer is line 17. The snippet derives a session key using MD5 of the user ID, making tokens predictable instead of cryptographically random.",
    examKeywords: ["line 17", "md5", "user id", "predictable session token"],
    mc: {
      question: "Which line contains the session-token-related vulnerability?",
      correct: "Line 17.",
      distractors: ["Line 9.", "Line 4.", "Line 19."],
      verbatimOptions: [
        { id: "a", text: "Line 17", correct: true },
        { id: "b", text: "Line 9", correct: false },
        { id: "c", text: "Line 4", correct: false },
        { id: "d", text: "Line 19", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-22-xxe-code",
    sourceLabel: "Exam 2025, Task 22",
    title: "XXE parser vulnerability",
    summary: "Identify the vulnerable lines in the XXE code quiz.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["code-quiz", "xxe", "xml"],
    vulnerabilityType: "XML External Entity",
    verbatimPrompt: "Which of the above lines are vulnerable to XXE?",
    code: `from lxml import etree

from django.conf import settings
from django.utils import six
from rest_framework.exceptions import ParseError
from rest_framework_xml.parsers import XMLParser


class CustomXMLParser(XMLParser):

    media_type = 'application/xml'

    def parse(self, stream, media_type=None, parser_context=None):

        parser_context = parser_context or {}
        encoding = parser_context.get('encoding', settings.DEFAULT_CHARSET)
        parser = etree.XMLParser(
            encoding=encoding,
            resolve_entities=True,
            no_network=False
        )
        try:
            tree = etree.parse(stream, parser=parser)
        except (etree.ParseError, ValueError) as exc:
            raise ParseError('XML parse error - %s' % six.text_type(exc))
        data = self._xml_convert(tree.getroot())

        return data

    def _xml_convert(self, element):

        children = list(element)

        if len(children) == 0:
            return self._type_convert(element.text)
        else:
            # if the fist child tag is list-item means all children are list-item
            if children[0].tag == "list-item":
                data = []
                for child in children:
                    data.append(self._xml_convert(child))
            else:
                data = {}
                for child in children:
                    data[child.tag] = self._xml_convert(child)

            return data`,
    language: "python",
    filename: "xml_parser.py",
    explanation:
      "The expected answer is lines 16-19. The XML parser is configured to resolve entities and allow network access, creating an XXE risk.",
    examKeywords: [
      "lines 16-19",
      "xxe",
      "resolve entities",
      "xml parser",
      "network access",
    ],
    mc: {
      question: "Which lines are vulnerable to XXE in the quiz?",
      correct: "Lines 16-19.",
      distractors: ["Lines 20-26.", "Lines 14-15.", "Lines 28-45."],
      verbatimOptions: [
        { id: "a", text: "Lines 20-26", correct: false },
        { id: "b", text: "Lines 14-15", correct: false },
        { id: "c", text: "Lines 28-45", correct: false },
        { id: "d", text: "Lines 16-19", correct: true },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-23-authentication-code",
    sourceLabel: "Exam 2025, Task 23",
    title: "Authentication code vulnerability",
    summary:
      "Identify which lines of the authentication code have vulnerabilities.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["code-quiz", "authentication"],
    vulnerabilityType: "Authentication Bypass",
    verbatimPrompt:
      "Which lines of the code above have authentication vulnerabilities?",
    codeSnippets: [
      {
        filename: "login.html",
        language: "html",
        code: `{% extends 'base.html' %}

{% block content %}
<h2>Login</h2>
<form method="post">
    {% csrf_token %}
    {{ form }}
    <div class="g-recaptcha" data-sitekey="{{ sitekey }}"></div>
    <input type="submit" value="Login">
    <input type="hidden" name="next" value="{% url 'home' %}" />
</form>
<p><a href="{% url 'users:password-reset' %}">Forgot password?</a></p>
<p><a href="{% url 'users:login-ldap' %}">Login with LDAP?</a></p>
{% endblock %}`,
      },
      {
        filename: "Form.py",
        language: "python",
        code: `import requests
from django import forms
from django.conf import settings
from django.contrib.auth import password_validation, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.sites.shortcuts import get_current_site
from django.utils.translation import gettext_lazy as _
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from captcha.fields import CaptchaField

from .models import User, UserProfile
from .token import account_activation_token as default_token_generator


class LoginForm(AuthenticationForm):
    """User Login Form"""

    error_messages = {
        'invalid_login': _(
            "Please enter a correct %(username)s and password. Note that both "
            "fields may be case-sensitive."
        ),
        'invalid_captcha': _("Invalid reCAPTCHA. Please try again."),
        'inactive': _("This account is inactive."),
    }

    def clean_g_recaptcha_response(self):
        """reCAPTCHA validation"""

        recaptcha = self.request.POST["g-recaptcha-response"]
        if not recaptcha:
            raise forms.ValidationError(
                self.error_messages['invalid_captcha'],
                code='invalid_captcha',
            )

        params = {
            'secret': settings.RECAPTCHA_PRIVATE_KEY,
            'response': recaptcha
        }

        response = requests.get(settings.RECAPTCHA_URL, params=params).json()
        if not response.get("success", False):
            raise forms.ValidationError(
                self.error_messages['invalid_captcha'],
                code='invalid_captcha',
            )

    def clean(self):
        # validate reCAPTCHA
        self.clean_g_recaptcha_response()

        # In the following lines 54 and 55, we trust that cleaned_data is actually cleaned
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        login_as = self.request.GET.get('login_as')
        if username is not None and password:
            if login_as == 'admin':
                self.user_cache = User.objects.get(username='admin')
                self.user_cache.backend = settings.AUTHENTICATION_BACKENDS[0]
            else:
                self.user_cache = authenticate(
                    self.request, username=username, password=password)

            if self.user_cache is None:
                raise self.get_invalid_login_error()
            else:
                self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data

    def confirm_login_allowed(self, user):
        if not user.is_active:
            raise forms.ValidationError(
                self.error_messages['inactive'],
                code='inactive',
            )

    def get_invalid_login_error(self):
        return forms.ValidationError(
            self.error_messages['invalid_login'],
            code='invalid_login',
            params={'username': self.username_field.verbose_name},
        )`,
      },
    ],
    explanation:
      "The expected answer is Forms.py lines 58-62. The provided code allows the login flow to treat a login_as=admin parameter as authority to set the authenticated user to admin.",
    examKeywords: [
      "forms.py",
      "lines 58-62",
      "login_as",
      "admin",
      "authentication bypass",
    ],
    mc: {
      question:
        "Which lines have authentication vulnerabilities in the 2025 quiz?",
      correct: "Forms.py: lines 58-62.",
      distractors: [
        "Forms.py: lines 31-36.",
        "Forms.py: lines 81-84.",
        "Login.html: lines 5-11.",
      ],
      verbatimOptions: [
        { id: "a", text: "Forms.py: 31-36", correct: false },
        { id: "b", text: "Forms.py: 81-84", correct: false },
        { id: "c", text: "Forms.py: 58-62", correct: true },
        { id: "d", text: "Login.html: 5-11", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-24-access-control-code",
    sourceLabel: "Exam 2025, Task 24",
    title: "Access control code vulnerability",
    summary: "Identify the vulnerable line in the access control code quiz.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["code-quiz", "access-control", "idor"],
    vulnerabilityType: "Broken Access Control",
    verbatimPrompt:
      "The above code has access control vulnerabilities. Which line of the code is vulnerable?",
    codeSnippets: [
      {
        filename: "details.html",
        language: "html",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
</head>
<body>
    <b>Dear {{ user.first_name }}, Checkout link of all your team mates.<br><br>
    {% for gamer in team_gamers %}
        <a href="{% url 'games:gamer_profile' gamer.id %}">{{ gamer.alias_name }}</a><br>
    {% endfor %}
    </b>

    <br><br><b><a href="{% url 'games:logout' %}">logout</a></b>
</body>
</html>`,
      },
      {
        filename: "Views.py",
        language: "python",
        code: `from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib import messages
from django.contrib.auth import decorators
from django.shortcuts import get_object_or_404

from games.models import GamerProfile, Team
from games.forms import LoginForm


# User login (Removed the code here to simply the question. we suppose codes here are secure)

# User gaming dashboard
@decorators.login_required(login_url='/games/login/')
def dashboard(request):
    team = get_object_or_404(Team, user=request.user)
    team_gamers = GamerProfile.objects.filter(team=team.team)
    return render(request, 'games/dashboard.html', {'team_gamers': team_gamers, })


# User Team members
@decorators.login_required(login_url='/games/login/')
def gamer_profile(request, gamer_id):
    gamer_details = get_object_or_404(GamerProfile, pk=gamer_id)
    return render(request, 'games/gamer_details.html', {'gamer': gamer_details, })


# User logout (Removed the code here to simplify the question.)`,
      },
    ],
    explanation:
      "The expected answer is Views.py line 24. The code fetches a gamer profile by primary key without confirming that it belongs to the authenticated user's team or account.",
    examKeywords: [
      "views.py line 24",
      "object-level authorization",
      "idor",
      "ownership check",
    ],
    mc: {
      question: "Which line is vulnerable in the access control quiz?",
      correct: "Views.py: line 24.",
      distractors: [
        "details.html: line 10.",
        "Views.py: line 19.",
        "Views.py: line 18.",
      ],
      verbatimOptions: [
        { id: "a", text: "details.html: 10", correct: false },
        { id: "b", text: "Views.py: 24", correct: true },
        { id: "c", text: "Views.py: 19", correct: false },
        { id: "d", text: "Views.py: 18", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-25-logging-code",
    sourceLabel: "Exam 2025, Task 25",
    title: "Insufficient logging code lines",
    summary:
      "Identify which lines have insufficient logging and monitoring vulnerabilities.",
    courseTopic: "security-basics",
    difficulty: "core",
    tags: ["code-quiz", "logging", "monitoring"],
    vulnerabilityType: "Logging and Monitoring Failure",
    verbatimPrompt:
      "The above codes are code snippets of an application's logging function. Which lines of code have insufficient logging and monitoring vulnerabilities?",
    code: `# Logging
# https://docs.djangoproject.com/en/2.1/topics/logging/#configuring-logging

# Disable Django's logging setup
LOGGING_CONFIG = None

LOGLEVEL = config('LOGLEVEL', default='INFO')

# https://docs.djangoproject.com/en/2.1/topics/logging/#custom-logging-configuration
logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            # exact format is not important, this is the minimum information
            'format': '%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
        },
        'django.server': DEFAULT_LOGGING['formatters']['django.server'],
    },
    'handlers': {
        # console logs to stderr
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
        'django.server': DEFAULT_LOGGING['handlers']['django.server'],
    },
    'loggers': {
        # default for all undefined Python modules
        '': {
            'level': LOGLEVEL,
            'handlers': ['console'],
        },
        # Prevent noisy modules from logging
        'noisy_module': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
        # Default runserver request logging
        'django.server': DEFAULT_LOGGING['loggers']['django.server'],
    },
})`,
    language: "python",
    filename: "logging.py",
    explanation:
      "The expected answer is lines 20-25. The logging configuration only writes to console and lacks the needed file handler or monitoring path for warning and security-relevant events.",
    examKeywords: [
      "lines 20-25",
      "logging",
      "monitoring",
      "handler",
      "alerting",
    ],
    mc: {
      question:
        "Which lines have insufficient logging and monitoring vulnerabilities?",
      correct: "Lines 20-25.",
      distractors: ["Lines 30-33.", "Lines 5-7.", "Lines 35-39."],
      verbatimOptions: [
        { id: "a", text: "Lines 30-33", correct: false },
        { id: "b", text: "Lines 5-7", correct: false },
        { id: "c", text: "Lines 20-25", correct: true },
        { id: "d", text: "Lines 35-39", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-26-kerckhoffs-principle",
    sourceLabel: "Exam 2025, Task 26",
    title: "Kerckhoff's principle",
    summary: "Explain Kerckhoff's principle for cryptographic systems.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["kerckhoffs-principle"],
    vulnerabilityType: "Cryptography Concept",
    verbatimPrompt: "What is the Kerckhoff's principle?",
    explanation:
      "Kerckhoff's principle says a cryptographic system should remain secure even if everything about the system except the key is public knowledge.",
    examKeywords: [
      "kerckhoffs principle",
      "public design",
      "secret key",
      "cryptographic system",
    ],
    mc: {
      question: "What is Kerckhoff's principle?",
      correct:
        "A cryptographic system should remain secure even if everything about the system, except the key, is public knowledge.",
      distractors: [
        "The security of a cryptographic system should not depend on the secrecy of the key.",
        "Security should rely on the complexity of the encryption algorithm.",
        "Security should depend solely on the secrecy of the algorithm.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "According to Kerckhoff's principle, a cryptographic system should remain secure even if everything about the system, except the key, is public knowledge.",
          correct: true,
        },
        {
          id: "b",
          text: "Kerckhoff's principle emphasizes that the security of a cryptographic system should not depend on the secrecy of the key.",
          correct: false,
        },
        {
          id: "c",
          text: "Kerckhoff's principle suggests that the security of a cryptographic system relies on the complexity of the encryption algorithm.",
          correct: false,
        },
        {
          id: "d",
          text: "Kerckhoff's principle states that the security of a cryptographic system should depend solely on the secrecy of the algorithm.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-27-public-key-encryption",
    sourceLabel: "Exam 2025, Task 27",
    title: "PKI encryption key choice",
    summary:
      "Bob wants to use public key cryptography to send an encrypted message to Alice. Identify which key he uses.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["pki", "public-key"],
    vulnerabilityType: "Public-Key Cryptography",
    verbatimPrompt:
      "Bob wants to use public key cryptography to send an encrypted message to Alice. What key does he need to use to encrypt the message?",
    explanation:
      "To send an encrypted message to Alice, Bob encrypts with Alice's public key. Alice decrypts with her private key.",
    examKeywords: [
      "alice public key",
      "bob",
      "encrypt",
      "private key",
      "decrypt",
    ],
    mc: {
      question: "Which key does Bob use to encrypt a message for Alice?",
      correct: "Alice's public key.",
      distractors: [
        "Bob's public key.",
        "Bob's private key.",
        "Alice's private key.",
      ],
      verbatimOptions: [
        { id: "a", text: "His public key", correct: false },
        { id: "b", text: "His private key", correct: false },
        { id: "c", text: "Her public key", correct: true },
        { id: "d", text: "Her private key", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-28-static-analysis-source",
    sourceLabel: "Exam 2025, Task 28",
    title: "Trustworthy data in static analysis",
    summary:
      "In static code analysis for software security, identify which data source is trustworthy.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["static-analysis", "taint-analysis"],
    vulnerabilityType: "Static Code Analysis",
    verbatimPrompt:
      "In static code analysis for software security, which source of the following data is trustworthy?",
    explanation:
      "The expected trustworthy source is hard-coded constant data in the code. User input, files, environment variables, and external sources generally need validation or sanitization.",
    examKeywords: [
      "static analysis",
      "trustworthy source",
      "hard-coded constant",
      "taint",
    ],
    mc: {
      question:
        "Which source is considered trustworthy in this static-analysis question?",
      correct: "Hard-coded constant data in the code.",
      distractors: [
        "Data from file.",
        "Web parameters and cookies.",
        "Data from web service.",
      ],
      verbatimOptions: [
        { id: "a", text: "Data from file", correct: false },
        { id: "b", text: "Web parameters and cookies", correct: false },
        { id: "c", text: "Data from web service", correct: false },
        {
          id: "d",
          text: "Hard-coded constant data in the code",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-29-location-data",
    sourceLabel: "Exam 2025, Task 29",
    title: "Mobile-phone location data",
    summary:
      "According to Ross Anderson, explain why it has been easy for the UK Government to get access to mobile-phone location data.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["location-data", "traffic-data"],
    vulnerabilityType: "Privacy Concept",
    verbatimPrompt:
      "According to Ross Anderson, why has it been easy for the UK Government to get access to mobile-phone location data?",
    explanation:
      "The expected answer is that information about phone location counts as traffic data. This classification can make access easier under communications-data regimes than access to content.",
    examKeywords: [
      "ross anderson",
      "location data",
      "traffic data",
      "mobile phone",
    ],
    mc: {
      question:
        "Why was access to mobile-phone location data easier in this framing?",
      correct: "Phone location information counts as traffic data.",
      distractors: [
        "Cell phones are easy to tap into.",
        "The UK police can automatically get a warrant when they suspect terrorism.",
        "Location data collected by app service providers must be made available to officials.",
      ],
      verbatimOptions: [
        { id: "a", text: "Cell phones are easy to tap into.", correct: false },
        {
          id: "b",
          text: "The UK police can automatically get a warrant when they suspect terrorism.",
          correct: false,
        },
        {
          id: "c",
          text: "Information about location of phones counts as traffic data.",
          correct: true,
        },
        {
          id: "d",
          text: "Location data collected by app service providers must be made available to the officials.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-31-transparency-countermeasure",
    sourceLabel: "Exam 2025, Task 31",
    title: "Supply chain transparency strategy",
    summary:
      "Identify which countermeasure technique does not belong to the transparency strategy.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["supply-chain", "transparency"],
    vulnerabilityType: "Supply Chain Countermeasure",
    verbatimPrompt:
      "Which countermeasure technique does NOT belong to the transparency strategy?",
    explanation:
      "The expected answer is version locking. Transparency focuses on visibility and traceability, while version locking is more directly about controlling change and reproducibility.",
    examKeywords: [
      "version locking",
      "transparency",
      "supply chain",
      "countermeasure",
    ],
    mc: {
      question:
        "Which countermeasure does not belong to the transparency strategy?",
      correct: "Version Locking.",
      distractors: ["NPM-audit.", "In-toto.", "SBOM."],
      verbatimOptions: [
        { id: "a", text: "Version Locking", correct: true },
        { id: "b", text: "NPM-audit", correct: false },
        { id: "c", text: "In-toto", correct: false },
        { id: "d", text: "SBOM", correct: false },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-32-stride",
    sourceLabel: "Exam 2025, Task 32",
    title: "STRIDE threat model",
    summary: "Identify the correct statement about the STRIDE threat model.",
    courseTopic: "threat-modeling",
    difficulty: "intro",
    tags: ["stride"],
    vulnerabilityType: "Threat Modeling",
    verbatimPrompt:
      "Which of the following statements about the STRIDE threat model is correct?",
    explanation:
      "STRIDE is used to identify and categorize potential threats using six categories: spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege.",
    examKeywords: [
      "stride",
      "spoofing",
      "tampering",
      "repudiation",
      "information disclosure",
      "dos",
      "elevation",
    ],
    mc: {
      question: "Which statement about STRIDE is correct?",
      correct: "It categorizes potential threats using six threat categories.",
      distractors: [
        "STRIDE focuses exclusively on the physical security of a system.",
        "STRIDE is a framework for evaluating secure software development methodologies.",
        "STRIDE stands for Security, Trust, Reliability, Integrity, Data, and Encryption.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "STRIDE focuses exclusively on the physical security of a system.",
          correct: false,
        },
        {
          id: "b",
          text: "STRIDE is a framework for evaluating secure software development methodologies.",
          correct: false,
        },
        {
          id: "c",
          text: "STRIDE is an acronym that stands for Security, Trust, Reliability, Integrity, Data, and Encryption.",
          correct: false,
        },
        {
          id: "d",
          text: "STRIDE is used to identify and categorize potential threats to a system based on six threat categories.",
          correct: true,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-33-security-champion",
    sourceLabel: "Exam 2025, Task 33",
    title: "Security engineer or champion role",
    summary:
      "Identify the wrong definition of the role of the Security Engineer or Champion.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["secure-development", "security-champion"],
    vulnerabilityType: "Secure Development Role",
    verbatimPrompt:
      "Which of the following definitions of the role of the Security Engineer/Champion is Wrong?",
    explanation:
      "The wrong definition is that the Security Engineer or Champion is the only person responsible for security in the team. Security is shared, while the champion helps guide, coordinate, and raise security maturity.",
    examKeywords: [
      "security champion",
      "shared responsibility",
      "secure development",
      "team",
    ],
    mc: {
      question: "Which statement about Security Engineer or Champion is wrong?",
      correct: "They are the only person responsible for security in the team.",
      distractors: [
        "They assist with activities in security and threat modeling.",
        "They help with the process of self-managing security in the team.",
        "They help adoption of security strategy for the product.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "Security Engineer/Champion assists with activities in security and threat modeling etc.",
          correct: false,
        },
        {
          id: "b",
          text: "Security Engineer/Champion helps on the process of self-managing security in the team.",
          correct: false,
        },
        {
          id: "c",
          text: "Security Engineer/Champion is the only person responsible for security in the team.",
          correct: true,
        },
        {
          id: "d",
          text: "Security Engineer/Champion helps adoption of security strategy for the product.",
          correct: false,
        },
      ],
    },
  }),
  examQuestion({
    id: "exam-2025-task-34-security-requirement",
    sourceLabel: "Exam 2025, Task 34",
    title: "Good security requirement",
    summary: "Identify which option is a good security requirement.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["security-requirements"],
    vulnerabilityType: "Security Requirements",
    verbatimPrompt: "Which of these is a good security requirement?",
    explanation:
      "The expected good requirement is that end-user data should be encrypted at rest. It states a security property for a specific class of data and can be implemented and verified.",
    examKeywords: [
      "encrypt at rest",
      "end user data",
      "security requirement",
      "verifiable",
    ],
    mc: {
      question: "Which is a good security requirement?",
      correct: "End user data should be encrypted at rest.",
      distractors: [
        "The system shall encrypt all confidential data using the RSA algorithm.",
        "The system should be free from vulnerabilities.",
        "The system shall work just like the previous one, but on a new platform.",
      ],
      verbatimOptions: [
        {
          id: "a",
          text: "The system shall encrypt all confidential data using the RSA algorithm",
          correct: false,
        },
        {
          id: "b",
          text: "End user data should be encrypted at rest",
          correct: true,
        },
        {
          id: "c",
          text: "The system should be free from vulnerabilities",
          correct: false,
        },
        {
          id: "d",
          text: "The system shall work just like the previous one, but on a new platform",
          correct: false,
        },
      ],
    },
  }),
];
