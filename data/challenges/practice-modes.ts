import type { Challenge } from "@/domain/challenge";
import { buildChallenge } from "../builder";
import { GAME_MODE_IDS } from "@/domain/gameMode";

const ATTACK_ONLY = [GAME_MODE_IDS.attackTrace] as const;
const WSTG_ONLY = [GAME_MODE_IDS.wstgMapping] as const;
const SECURE_REQ_ONLY = [GAME_MODE_IDS.secureRequirement] as const;
const STRIDE_ONLY = [GAME_MODE_IDS.strideThreat] as const;
const RISK_ONLY = [GAME_MODE_IDS.riskScoring] as const;
const PRIVACY_ONLY = [GAME_MODE_IDS.privacyGdpr] as const;
const CRYPTO_MISUSE_ONLY = [GAME_MODE_IDS.cryptoMisuse] as const;
const AI_REVIEW_ONLY = [GAME_MODE_IDS.aiReview] as const;
const REPORT_ONLY = [GAME_MODE_IDS.reportBuilder] as const;

export const practiceModeChallenges: readonly Challenge[] = [
  // ============================================================
  // Attack Trace
  // ============================================================
  buildChallenge({
    id: "atk-xss-reflected-search",
    title: "Exploit a reflected XSS search endpoint",
    summary:
      "The /search endpoint echoes its `q` parameter into HTML without encoding.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["xss", "attack"],
    language: "javascript",
    code: `app.get("/search", (req, res) => {
  res.send("<h1>Results for " + req.query.q + "</h1>");
});`,
    vulnerableLines: [2],
    vulnerabilityType: "Reflected XSS",
    fixOptions: [],
    explanation:
      "Reflected XSS is triggered by a single crafted request whose payload appears unmodified in the response body. The payload needs to break out of the surrounding HTML context and run JS in the victim's origin.",
    examKeywords: ["reflected", "payload", "context", "origin"],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-01",
    supportedModes: ATTACK_ONLY,
    modeData: {
      attackTrace: {
        question:
          "Which request actually fires a JS alert in the victim's browser when they click the link?",
        options: [
          {
            id: "script",
            label: "URL with an inline <script> tag in q",
            request: `GET /search?q=<script>alert(1)</script> HTTP/1.1
Host: shop.example.com`,
            correct: true,
            rationale:
              "The response embeds q inside an h1 tag, so a script tag in q lands in HTML context and executes in the victim's origin.",
          },
          {
            id: "header",
            label: "Add an X-XSS-Protection header in the request",
            request: `GET /search?q=hello HTTP/1.1
Host: shop.example.com
X-XSS-Protection: 0`,
            correct: false,
            rationale:
              "Request headers are not echoed and X-XSS-Protection is a response header. No payload reaches the page.",
          },
          {
            id: "json",
            label: "POST a JSON body with a payload",
            request: `POST /search HTTP/1.1
Host: shop.example.com
Content-Type: application/json

{"q":"<script>alert(1)</script>"}`,
            correct: false,
            rationale:
              "The handler reads req.query.q, not a JSON body. The payload never reaches the sink.",
          },
          {
            id: "encoded-only",
            label: "URL with HTML-encoded entities in q",
            request: `GET /search?q=&lt;script&gt;alert(1)&lt;/script&gt; HTTP/1.1
Host: shop.example.com`,
            correct: false,
            rationale:
              "Already-encoded entities render as visible text, not executable script.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "atk-sqli-login-bypass",
    title: "Bypass a vulnerable login form",
    summary:
      "A login handler concatenates `username` and `password` into a SQL query.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["sqli", "attack"],
    language: "sql",
    code: `SELECT * FROM users
WHERE username = '$user'
  AND password = '$pass'`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "SQL Injection (authentication bypass)",
    fixOptions: [],
    explanation:
      "Authentication bypass via SQL injection works by closing the username quote and short-circuiting the AND clause to always-true, so the predicate matches the first user row.",
    examKeywords: ["bypass", "always true", "tautology", "comment"],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-05",
    supportedModes: ATTACK_ONLY,
    modeData: {
      attackTrace: {
        question:
          "Which credential pair lets you log in as the first user in the table?",
        options: [
          {
            id: "or-true",
            label: "username: admin'-- · password: anything",
            request: `POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=admin'--&password=x`,
            correct: true,
            rationale:
              "admin'-- closes the username quote and comments out the rest of the WHERE clause, so the query becomes SELECT * FROM users WHERE username = 'admin'.",
          },
          {
            id: "long-pw",
            label: "username: admin · password: a very long random string",
            request: `POST /login HTTP/1.1

username=admin&password=q3z9...`,
            correct: false,
            rationale:
              "Brute force without SQLi just produces a wrong-password response.",
          },
          {
            id: "header-inject",
            label: "Inject Authorization: Bearer header",
            request: `GET /admin HTTP/1.1
Authorization: Bearer admin`,
            correct: false,
            rationale:
              "The endpoint authenticates via the form body, not a bearer token.",
          },
          {
            id: "case-trick",
            label: "username: Admin · password: Admin",
            request: `POST /login HTTP/1.1

username=Admin&password=Admin`,
            correct: false,
            rationale:
              "Without SQLi the password must match the stored value; case folding alone is not the bug.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "atk-ssrf-metadata",
    title: "Reach the cloud metadata service via SSRF",
    summary:
      "A thumbnail proxy fetches whatever URL the client passes in the `url` parameter.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["ssrf", "cloud"],
    language: "typescript",
    code: `app.get("/thumb", async (req, res) => {
  const r = await fetch(req.query.url);
  res.send(Buffer.from(await r.arrayBuffer()));
});`,
    vulnerableLines: [2],
    vulnerabilityType: "Server-Side Request Forgery",
    fixOptions: [],
    explanation:
      "SSRF lets the attacker make the server send requests on their behalf. The instance metadata service at 169.254.169.254 hands out short-lived cloud credentials to any client that asks.",
    examKeywords: ["ssrf", "metadata", "169.254", "credentials"],
    owaspTop10: "A06",
    owaspWstg: "WSTG-INPV-19",
    supportedModes: ATTACK_ONLY,
    modeData: {
      attackTrace: {
        question:
          "Which exploit request exfiltrates the EC2 instance role credentials?",
        options: [
          {
            id: "imds",
            label: "Request the AWS IMDS credentials path",
            request: `GET /thumb?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/web-role HTTP/1.1
Host: thumb.example.com`,
            correct: true,
            rationale:
              "IMDSv1 returns JSON containing AccessKeyId, SecretAccessKey and Token for the named role with no authentication.",
          },
          {
            id: "localhost",
            label: "Send a POST to 127.0.0.1:22",
            request: `POST /thumb?url=ssh://127.0.0.1:22/ HTTP/1.1`,
            correct: false,
            rationale:
              "The handler uses fetch which speaks HTTP only; ssh:// is rejected.",
          },
          {
            id: "header-leak",
            label: "Forge a Host header to read /admin",
            request: `GET /thumb?url=https://example.com HTTP/1.1
Host: admin.example.com`,
            correct: false,
            rationale:
              "Host header tricks belong to a different bug class and do not yield metadata.",
          },
          {
            id: "redirect",
            label: "Self-redirect via a 302 chain",
            request: `GET /thumb?url=http://thumb.example.com/thumb HTTP/1.1`,
            correct: false,
            rationale:
              "A redirect loop exhausts resources but does not leak credentials.",
          },
        ],
      },
    },
  }),

  // ============================================================
  // WSTG Mapping
  // ============================================================
  buildChallenge({
    id: "wstg-map-stored-xss",
    title: "Map: comment widget renders unescaped HTML",
    summary:
      "A comment field stores raw HTML and renders it back without sanitisation.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Stored XSS",
    fixOptions: [],
    explanation:
      "Stored XSS where the persisted payload runs every time the comment is rendered is WSTG-INPV-02. Reflected variants map to WSTG-INPV-01.",
    examKeywords: ["stored", "wstg", "inpv-02"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category best describes a persisted XSS payload in a comment field?",
        top10Hint: "A03",
        options: [
          {
            id: "stored",
            code: "WSTG-INPV-02",
            label: "Test for Stored Cross Site Scripting",
            correct: true,
            rationale:
              "The payload is persisted server-side and rendered on every view: stored XSS.",
          },
          {
            id: "reflected",
            code: "WSTG-INPV-01",
            label: "Test for Reflected Cross Site Scripting",
            correct: false,
            rationale:
              "Reflected XSS uses a single request whose response echoes the payload. Persistence makes it stored.",
          },
          {
            id: "sqli",
            code: "WSTG-INPV-05",
            label: "Test for SQL Injection",
            correct: false,
            rationale: "Wrong family; this is client-side execution.",
          },
          {
            id: "idor",
            code: "WSTG-ATHZ-04",
            label: "Test for Insecure Direct Object References",
            correct: false,
            rationale: "Authorisation control, not output encoding.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-idor",
    title: "Map: orders endpoint trusts the URL id",
    summary:
      "A logged-in user can read other users' orders by changing the numeric id in the URL.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "IDOR",
    fixOptions: [],
    explanation:
      "Object-level access checks belong to WSTG-ATHZ-04. The Top 10 home is A01 Broken Access Control.",
    examKeywords: ["idor", "athz-04"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question: "Which WSTG category covers this issue?",
        top10Hint: "A01",
        options: [
          {
            id: "idor",
            code: "WSTG-ATHZ-04",
            label: "Test for Insecure Direct Object References",
            correct: true,
            rationale: "Object-level authorisation is exactly WSTG-ATHZ-04.",
          },
          {
            id: "bypass",
            code: "WSTG-ATHZ-02",
            label: "Test for Bypassing Authorization Schema",
            correct: false,
            rationale:
              "Schema bypass is broader (e.g. role escalation), not direct object reference.",
          },
          {
            id: "session",
            code: "WSTG-SESS-04",
            label: "Testing for Exposed Session Variables",
            correct: false,
            rationale: "Sessions are not the failure mode here.",
          },
          {
            id: "auth",
            code: "WSTG-ATHN-04",
            label: "Testing for Bypassing Authentication Schema",
            correct: false,
            rationale: "Authentication is happening; authorisation is missing.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-tls-disabled",
    title: "Map: client disables TLS verification",
    summary:
      "An internal service calls another via HTTPS with certificate validation turned off.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "TLS Validation Disabled",
    fixOptions: [],
    explanation:
      "Weak transport security between services maps to WSTG-CRYP-01. Top 10 home is A02 Cryptographic Failures.",
    examKeywords: ["tls", "cryp-01"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question: "Which WSTG code fits a disabled-cert-validation finding?",
        top10Hint: "A02",
        options: [
          {
            id: "cryp01",
            code: "WSTG-CRYP-01",
            label: "Test for Weak Transport Layer Security",
            correct: true,
            rationale:
              "Verification disabled means the chain is not validated, which CRYP-01 covers.",
          },
          {
            id: "cryp04",
            code: "WSTG-CRYP-04",
            label: "Test for Weak Encryption",
            correct: false,
            rationale: "Encryption strength is not the failure here; trust is.",
          },
          {
            id: "conf07",
            code: "WSTG-CONF-07",
            label: "Test HTTP Strict Transport Security",
            correct: false,
            rationale: "HSTS is a separate control, on the response side.",
          },
          {
            id: "athn01",
            code: "WSTG-ATHN-01",
            label: "Test for Credentials Transported over an Encrypted Channel",
            correct: false,
            rationale:
              "Concerns where credentials travel, not the cert validation itself.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-csrf",
    title: "Map: state-changing POST without CSRF token",
    summary:
      "A profile-edit endpoint accepts cookie-authenticated POSTs with no anti-CSRF token.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "CSRF",
    fixOptions: [],
    explanation:
      "Cross-Site Request Forgery is WSTG-SESS-05. Top 10 home is A01 Broken Access Control.",
    examKeywords: ["csrf", "sess-05"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question: "Which WSTG category fits a missing CSRF token?",
        top10Hint: "A01",
        options: [
          {
            id: "sess05",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: true,
            rationale: "Direct match.",
          },
          {
            id: "clnt07",
            code: "WSTG-CLNT-07",
            label: "Test for Cross Origin Resource Sharing",
            correct: false,
            rationale: "CORS configuration is a different control.",
          },
          {
            id: "sess02",
            code: "WSTG-SESS-02",
            label: "Test for Cookies Attributes",
            correct: false,
            rationale:
              "Cookie attribute checks are related defence in depth but not the primary mapping.",
          },
          {
            id: "athz02",
            code: "WSTG-ATHZ-02",
            label: "Test for Bypassing Authorization Schema",
            correct: false,
            rationale:
              "CSRF abuses authenticated sessions, not bypasses authorisation logic.",
          },
        ],
      },
    },
  }),

  // ============================================================
  // Secure Requirement
  // ============================================================
  buildChallenge({
    id: "req-vague-encrypt-aes",
    title: "Requirement: 'Use AES'",
    summary: "Rewrite a vague encryption requirement.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["requirements"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "A good security requirement is specific (mode, key size, key management, scope), testable, and outcome-oriented.",
    examKeywords: [
      "tls",
      "in transit",
      "at rest",
      "gcm",
      "key management",
      "rotation",
    ],
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Personal data shall be encrypted with AES.",
        context:
          "The product handles customer financial records and runs in a multi-tenant cloud environment.",
        keywords: [
          "tls",
          "in transit",
          "at rest",
          "gcm",
          "key management",
          "rotation",
        ],
        goodExample:
          "Personal data shall be encrypted in transit using TLS 1.2+ with strong cipher suites, and at rest using AES-256-GCM with keys managed in an approved KMS, rotated at least annually and access-controlled via IAM.",
      },
    },
  }),
  buildChallenge({
    id: "req-password-storage-secure",
    title: "Requirement: 'Store passwords securely'",
    summary: "Rewrite a vague password-storage requirement.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["requirements", "passwords", "authentication"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "A good password-storage requirement should specify one-way password hashing, salts, work factors, and protection against offline cracking, without confusing hashing with encryption.",
    examKeywords: [
      "password hashing",
      "salt",
      "argon2",
      "bcrypt",
      "work factor",
      "no plaintext",
    ],
    owaspTop10: "A07",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Passwords shall be stored securely.",
        context:
          "The system stores user accounts for a public web application with ordinary users, business owners, and administrators.",
        keywords: [
          "password hashing",
          "salt",
          "argon2",
          "bcrypt",
          "work factor",
          "no plaintext",
        ],
        goodExample:
          "User passwords shall never be stored in plaintext or reversible encryption. Passwords shall be stored using an approved password hashing algorithm such as Argon2id or bcrypt with a unique per-password salt and a configurable work factor reviewed at least annually.",
      },
    },
  }),

  buildChallenge({
    id: "req-session-cookie-flags",
    title: "Requirement: 'Secure sessions'",
    summary: "Rewrite a vague session-management requirement.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["requirements", "sessions", "cookies"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "A session requirement should define how session tokens are protected, when they expire, and how they are invalidated after logout or privilege changes.",
    examKeywords: [
      "HttpOnly",
      "Secure",
      "SameSite",
      "expiration",
      "logout",
      "session rotation",
    ],
    owaspTop10: "A07",
    owaspWstg: "WSTG-SESS-02",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall use secure cookies.",
        context:
          "The application uses cookie-based session tokens for authenticated users and administrators.",
        keywords: [
          "HttpOnly",
          "Secure",
          "SameSite",
          "expiration",
          "logout",
          "session rotation",
        ],
        goodExample:
          "Session cookies shall be marked HttpOnly, Secure, and SameSite=Lax or stricter, shall expire after 30 minutes of inactivity, shall be invalidated on logout, and shall be rotated after login and privilege changes.",
      },
    },
  }),

  buildChallenge({
    id: "req-admin-mfa-remote-access",
    title: "Requirement: 'Admins must log in safely'",
    summary: "Rewrite a vague administrator-authentication requirement.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["requirements", "mfa", "admin"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Privileged accounts require stronger authentication because compromise has high impact. Requirements should mention MFA, remote access restrictions, and logging.",
    examKeywords: [
      "MFA",
      "privileged accounts",
      "remote access",
      "least privilege",
      "logging",
      "monitoring",
    ],
    owaspTop10: "A07",
    owaspWstg: "WSTG-ATHN-04",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Administrators shall use strong login.",
        context:
          "Administrators can access citizen records and system configuration remotely through a cloud-hosted management portal.",
        keywords: [
          "MFA",
          "privileged accounts",
          "remote access",
          "least privilege",
          "logging",
          "monitoring",
        ],
        goodExample:
          "All privileged accounts shall require phishing-resistant MFA for interactive login, remote administrative access shall be restricted to approved networks or managed devices, and all privileged login attempts and administrative actions shall be logged and monitored.",
      },
    },
  }),

  buildChallenge({
    id: "req-tenant-access-control",
    title: "Requirement: 'Users only see their own data'",
    summary: "Rewrite a vague tenant-isolation requirement.",
    courseTopic: "authorization",
    difficulty: "intro",
    tags: ["requirements", "authorization", "multi-tenant"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Authorization requirements should specify object-level checks and tenant isolation. Relying only on hidden fields, URLs, or frontend filtering is not sufficient.",
    examKeywords: [
      "authorization",
      "object-level access control",
      "tenant isolation",
      "server-side",
      "least privilege",
      "IDOR",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-04",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Users shall only access data they are allowed to see.",
        context:
          "The product is a multi-tenant cloud application where different organizations store confidential assessment reports.",
        keywords: [
          "authorization",
          "object-level access control",
          "tenant isolation",
          "server-side",
          "least privilege",
          "IDOR",
        ],
        goodExample:
          "Every request for tenant-owned objects shall enforce server-side object-level authorization, verifying that the authenticated user belongs to the owning tenant and has the required role before returning, modifying, or deleting the object.",
      },
    },
  }),

  buildChallenge({
    id: "req-sql-injection-inputs",
    title: "Requirement: 'Prevent SQL injection'",
    summary: "Rewrite a vague injection-prevention requirement.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["requirements", "sql-injection", "input-validation"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Good injection requirements should be testable and should focus on safe query construction, validation, and least privilege rather than simply saying input must be safe.",
    examKeywords: [
      "prepared statements",
      "parameterized queries",
      "input validation",
      "least privilege",
      "error handling",
      "SQL injection",
    ],
    owaspTop10: "A05",
    owaspWstg: "WSTG-INPV-05",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall protect against SQL injection.",
        context:
          "The application lets users search, filter, and sort business reviews stored in a relational database.",
        keywords: [
          "prepared statements",
          "parameterized queries",
          "input validation",
          "least privilege",
          "error handling",
          "SQL injection",
        ],
        goodExample:
          "All database queries using user-controlled input shall be constructed with parameterized queries or safe ORM binding, inputs shall be validated against expected type and length, database accounts shall use least privilege, and SQL errors shall not be exposed to users.",
      },
    },
  }),

  buildChallenge({
    id: "req-xss-output-encoding",
    title: "Requirement: 'No XSS'",
    summary: "Rewrite a vague XSS-prevention requirement.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["requirements", "xss", "output-encoding"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "XSS requirements should distinguish input validation from context-aware output encoding and should avoid unsafe rendering of user-controlled HTML.",
    examKeywords: [
      "context-aware output encoding",
      "HTML escaping",
      "stored XSS",
      "reflected XSS",
      "sanitization",
      "CSP",
    ],
    owaspTop10: "A05",
    owaspWstg: "WSTG-INPV-01",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The website shall not have XSS.",
        context:
          "Users can post reviews and comments that are later displayed to other users and business owners.",
        keywords: [
          "context-aware output encoding",
          "HTML escaping",
          "stored XSS",
          "reflected XSS",
          "sanitization",
          "CSP",
        ],
        goodExample:
          "All user-generated review and comment content shall be rendered using framework-provided context-aware output encoding by default; any permitted rich text shall be sanitized using an approved allowlist, and raw HTML rendering shall be prohibited unless explicitly reviewed.",
      },
    },
  }),

  buildChallenge({
    id: "req-file-upload-validation",
    title: "Requirement: 'Allow safe uploads'",
    summary: "Rewrite a vague file-upload requirement.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["requirements", "file-upload", "malicious-files"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Secure file-upload requirements should cover type validation, size limits, malware scanning, storage location, authorization, and safe serving of files.",
    examKeywords: [
      "allowlist",
      "content-type",
      "file extension",
      "size limit",
      "malware scanning",
      "non-executable storage",
    ],
    owaspTop10: "A05",
    owaspWstg: "WSTG-BUSL-09",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall securely handle uploaded files.",
        context:
          "Business owners can upload logo images and PDF documentation that will be shown to customers.",
        keywords: [
          "allowlist",
          "content-type",
          "file extension",
          "size limit",
          "malware scanning",
          "non-executable storage",
        ],
        goodExample:
          "Uploaded files shall be restricted to an approved allowlist of file types, validated by both extension and content inspection, limited to a configured maximum size, scanned for malware, stored outside executable web paths, and served only through authorization-controlled download endpoints.",
      },
    },
  }),

  buildChallenge({
    id: "req-logging-incident-response",
    title: "Requirement: 'Log security events'",
    summary: "Rewrite a vague logging and monitoring requirement.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["requirements", "logging", "monitoring"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Logging requirements should specify which events are logged, what metadata is needed, protection of logs, and how alerts are triggered.",
    examKeywords: [
      "audit logs",
      "authentication events",
      "authorization failures",
      "tamper-resistant",
      "alerting",
      "retention",
    ],
    owaspTop10: "A09",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall log important events.",
        context:
          "The service handles sensitive employee and citizen data and must support investigation after suspicious access.",
        keywords: [
          "audit logs",
          "authentication events",
          "authorization failures",
          "tamper-resistant",
          "alerting",
          "retention",
        ],
        goodExample:
          "The system shall record tamper-resistant audit logs for login attempts, privilege changes, authorization failures, data export actions, and administrative actions, including timestamp, actor, source IP, target object, and outcome, with alerts for suspicious patterns and retention for at least 12 months.",
      },
    },
  }),

  buildChallenge({
    id: "req-error-handling-no-stacktrace",
    title: "Requirement: 'Handle errors securely'",
    summary: "Rewrite a vague error-handling requirement.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["requirements", "error-handling", "information-disclosure"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Secure error handling should prevent information leakage while preserving enough internal detail for debugging and incident response.",
    examKeywords: [
      "generic errors",
      "no stack traces",
      "internal logging",
      "information disclosure",
      "correlation ID",
      "debug disabled",
    ],
    owaspTop10: "A02",
    owaspWstg: "WSTG-ERRH-02",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall not reveal errors.",
        context:
          "The web application is exposed to the Internet and uses a backend database and third-party APIs.",
        keywords: [
          "generic errors",
          "no stack traces",
          "internal logging",
          "information disclosure",
          "correlation ID",
          "debug disabled",
        ],
        goodExample:
          "External users shall receive generic error messages that do not reveal stack traces, SQL errors, framework versions, secrets, or internal paths; detailed errors shall be logged internally with a correlation ID, and debug mode shall be disabled in production.",
      },
    },
  }),

  buildChallenge({
    id: "req-gdpr-data-minimization-retention",
    title: "Requirement: 'Follow GDPR'",
    summary: "Rewrite a vague privacy requirement.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["requirements", "privacy", "gdpr"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Privacy Requirement",
    fixOptions: [],
    explanation:
      "Privacy requirements should be concrete about purpose limitation, minimization, retention, access rights, and deletion rather than merely saying the system follows GDPR.",
    examKeywords: [
      "data minimization",
      "purpose limitation",
      "retention",
      "deletion",
      "lawful basis",
      "data subject rights",
    ],
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall be GDPR compliant.",
        context:
          "The service collects user profile data, reviews, location information, and moderation records.",
        keywords: [
          "data minimization",
          "purpose limitation",
          "retention",
          "deletion",
          "lawful basis",
          "data subject rights",
        ],
        goodExample:
          "The system shall collect only personal data necessary for the documented service purposes, associate each processing activity with a lawful basis, retain personal data only for defined retention periods, support deletion or anonymization when retention expires, and provide mechanisms for data subject access and erasure requests.",
      },
    },
  }),

  buildChallenge({
    id: "req-dpia-high-risk-processing",
    title: "Requirement: 'Assess privacy risk'",
    summary: "Rewrite a vague DPIA/privacy-risk requirement.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["requirements", "dpia", "privacy-risk"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Privacy Requirement",
    fixOptions: [],
    explanation:
      "For high-risk personal-data processing, a good requirement should trigger privacy risk assessment before deployment and before major changes.",
    examKeywords: [
      "DPIA",
      "high risk",
      "special category data",
      "privacy by design",
      "prior assessment",
      "mitigations",
    ],
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Privacy risks shall be assessed when needed.",
        context:
          "The system may process employee data, union membership information, and access logs used for monitoring.",
        keywords: [
          "DPIA",
          "high risk",
          "special category data",
          "privacy by design",
          "prior assessment",
          "mitigations",
        ],
        goodExample:
          "Before deploying or materially changing processing that involves special-category personal data, large-scale monitoring, or high-risk profiling, the organization shall complete a DPIA documenting processing purposes, risks to data subjects, mitigations, residual risk, and approval before production use.",
      },
    },
  }),

  buildChallenge({
    id: "req-supply-chain-sbom-signing",
    title: "Requirement: 'Secure dependencies'",
    summary: "Rewrite a vague software supply-chain requirement.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["requirements", "supply-chain", "dependencies"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Supply-chain requirements should cover dependency inventory, vulnerability monitoring, version control, integrity verification, and review of updates.",
    examKeywords: [
      "SBOM",
      "dependency scanning",
      "version pinning",
      "signed artifacts",
      "vulnerability monitoring",
      "patching",
    ],
    owaspTop10: "A03",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Third-party libraries shall be secure.",
        context:
          "The product uses npm and Python packages, container images, and CI/CD pipelines to deploy weekly.",
        keywords: [
          "SBOM",
          "dependency scanning",
          "version pinning",
          "signed artifacts",
          "vulnerability monitoring",
          "patching",
        ],
        goodExample:
          "The build pipeline shall generate an SBOM for each release, pin dependency versions, verify signed or trusted artifacts where supported, scan dependencies and container images for known vulnerabilities, and require documented risk acceptance or remediation for high-severity findings before production deployment.",
      },
    },
  }),

  buildChallenge({
    id: "req-microservice-service-auth",
    title: "Requirement: 'Secure microservices'",
    summary: "Rewrite a vague microservice-security requirement.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["requirements", "microservices", "service-auth"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Microservice requirements should specify service identity, authenticated communication, authorization, and rate limiting rather than assuming internal network traffic is trusted.",
    examKeywords: [
      "service-to-service authentication",
      "mTLS",
      "authorization",
      "rate limiting",
      "least privilege",
      "zero trust",
    ],
    owaspTop10: "A01",
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Internal services shall communicate securely.",
        context:
          "The system consists of multiple backend services behind a load balancer, including user, payment, and reporting services.",
        keywords: [
          "service-to-service authentication",
          "mTLS",
          "authorization",
          "rate limiting",
          "least privilege",
          "zero trust",
        ],
        goodExample:
          "All service-to-service requests shall use authenticated and encrypted communication such as mTLS, each service shall authorize requests based on the caller service identity and least privilege, and externally reachable endpoints shall enforce rate limits at the gateway or load balancer.",
      },
    },
  }),

  buildChallenge({
    id: "req-ai-code-assistant-review",
    title: "Requirement: 'Use AI safely'",
    summary: "Rewrite a vague AI-assisted-development requirement.",
    courseTopic: "ai-security",
    difficulty: "intro",
    tags: ["requirements", "ai", "secure-development"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "AI-assisted development requirements should address review, testing, provenance, and documentation rather than trusting generated code automatically.",
    examKeywords: [
      "human review",
      "security testing",
      "prompt documentation",
      "generated code",
      "vulnerable patterns",
      "static analysis",
    ],
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Developers may use AI tools if the code looks correct.",
        context:
          "Developers use AI coding assistants to generate authentication, authorization, and input-handling code.",
        keywords: [
          "human review",
          "security testing",
          "prompt documentation",
          "generated code",
          "vulnerable patterns",
          "static analysis",
        ],
        goodExample:
          "AI-generated or AI-modified security-relevant code shall undergo human code review, static analysis, and relevant security tests before merge; developers shall document AI tool usage for security-sensitive changes, including prompts or summaries sufficient to support later review.",
      },
    },
  }),

  buildChallenge({
    id: "req-vague-password",
    title: "Requirement: 'Passwords must be strong'",
    summary: "Rewrite a vague password policy.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["requirements"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "A testable password requirement specifies hashing, minimum length, breach-check, rate limiting and MFA. Avoid prescribing composition rules (NIST 800-63B discourages them).",
    examKeywords: ["length", "argon2", "breach", "mfa", "rate limit"],
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "Passwords must be strong.",
        context:
          "The product is a consumer SaaS with self-service sign-up and supports adding MFA.",
        keywords: ["length", "argon2", "breach", "mfa", "rate limit"],
        goodExample:
          "Passwords shall be at least 12 characters, checked against a known-breach corpus on set, stored using Argon2id with per-user salt, and protected by an exponential rate-limit on authentication. Users with elevated roles must enrol a second factor.",
      },
    },
  }),

  buildChallenge({
    id: "req-vague-logging",
    title: "Requirement: 'Log security events'",
    summary: "Rewrite a vague logging requirement.",
    courseTopic: "secure-development",
    difficulty: "core",
    tags: ["requirements"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Security Requirement",
    fixOptions: [],
    explanation:
      "Good audit-log requirements specify what events are logged, what fields are captured, where logs go, retention, and integrity protection.",
    examKeywords: [
      "audit",
      "retention",
      "integrity",
      "tamper",
      "personal data",
      "events",
    ],
    supportedModes: SECURE_REQ_ONLY,
    modeData: {
      secureRequirement: {
        bad: "The system shall log security events.",
        context:
          "Internal banking platform subject to financial-sector audit requirements.",
        keywords: [
          "audit",
          "retention",
          "integrity",
          "tamper",
          "personal data",
          "events",
        ],
        goodExample:
          "Authentication outcomes, authorisation denials, privileged actions, and configuration changes shall be logged with actor, action, target, source IP, and a high-resolution timestamp. Logs are written to an append-only audit store, retained for 7 years, and protected against tampering via hash chaining and read-only IAM.",
      },
    },
  }),

  // ============================================================
  // STRIDE
  // ============================================================
  buildChallenge({
    id: "stride-signed-url",
    title: "STRIDE on a SHA-1 signed download URL",
    summary:
      "An internal report download accepts ?id=N&sig=H where H = SHA-1(id|secret).",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "SHA-1 of id|secret is a length-extension target (T). The URL also acts as a bearer credential (S) and grants read access to reports (I if widely linkable). The signed payload omits an expiry (T, S), so a leaked URL is forever-valid.",
    examKeywords: ["stride", "tampering", "hmac", "length extension"],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "An employee receives a download link of the form /report?id=42&sig=SHA1('42|<secret>'). Any holder of the link can fetch the file. Internal team chats and emails frequently forward these links.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  the URL is a bearer credential",
            correct: true,
            rationale:
              "Anyone with the link can act as the original recipient; there is no separate authentication.",
          },
          {
            id: "T",
            label: "Tampering  -  SHA-1(secret|id) is length-extendable",
            correct: true,
            rationale:
              "An attacker who knows the secret length can extend the message and forge a valid signature for a modified payload.",
          },
          {
            id: "R",
            label: "Repudiation  -  disputing an action",
            correct: false,
            rationale: "Not the primary concern here.",
          },
          {
            id: "I",
            label: "Information disclosure  -  links leak via chat",
            correct: true,
            rationale:
              "Forwarded links land outside the trust boundary and expose internal data.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale: "Nothing here amplifies cost to the server.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "There is no role escalation; access is the same as the original recipient.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-feedback-form",
    title: "STRIDE on a public feedback form",
    summary:
      "A public marketing site posts feedback to /feedback. Responses are emailed to a shared support inbox.",
    courseTopic: "threat-modeling",
    difficulty: "intro",
    tags: ["stride"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "An anonymous form is most exposed to denial-of-service and spoofing of identity. Information disclosure is limited (the form does not return data). Repudiation is real because the actor is anonymous.",
    examKeywords: ["stride", "spoofing", "dos", "repudiation"],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "Form fields: name, email, message. No CAPTCHA, no rate limit. Submissions are emailed to support@. There is no login or session.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  anyone can claim any name/email",
            correct: true,
            rationale: "No identity proof; trivially impersonate someone.",
          },
          {
            id: "T",
            label: "Tampering with stored data",
            correct: false,
            rationale:
              "Form data is write-once; nothing for the user to tamper with.",
          },
          {
            id: "R",
            label: "Repudiation  -  actor is anonymous",
            correct: true,
            rationale:
              "Without authentication the system cannot attribute actions reliably.",
          },
          {
            id: "I",
            label: "Information disclosure from the form",
            correct: false,
            rationale: "The form does not return data to the caller.",
          },
          {
            id: "D",
            label: "Denial of service via spam flood",
            correct: true,
            rationale:
              "No CAPTCHA or rate limit: an attacker can swamp the inbox or drive cost.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale: "There is no role boundary to cross.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-internal-api",
    title: "STRIDE on a service-to-service call without mTLS",
    summary:
      "Service A calls service B over plain HTTP inside a flat VPC; both run as the same Kubernetes service account.",
    courseTopic: "threat-modeling",
    difficulty: "advanced",
    tags: ["stride"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Plain HTTP with shared identity leaves the channel exposed to a hostile neighbour: spoofing, tampering, and information disclosure are all on the table. Without per-service identity, an audit trail of who did what is also weak (repudiation).",
    examKeywords: ["stride", "mtls", "tampering", "disclosure"],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "Service A POSTs JSON to http://svc-b.internal/charge with no signature and no mTLS. Both services run with the same service account and can read each other's secrets.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  a hostile pod can call svc-b as A",
            correct: true,
            rationale:
              "No peer authentication means any pod with network access is treated like A.",
          },
          {
            id: "T",
            label: "Tampering  -  a man-in-the-middle modifies the body",
            correct: true,
            rationale:
              "Plain HTTP is malleable; integrity is not protected on the wire.",
          },
          {
            id: "R",
            label: "Repudiation  -  shared service account",
            correct: true,
            rationale:
              "Without per-service identity the audit trail cannot pin actions on a specific caller.",
          },
          {
            id: "I",
            label: "Information disclosure on the wire",
            correct: true,
            rationale:
              "Plain HTTP means anyone on-path or sniffing can read the payload.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale: "Not the primary failure mode in this scenario.",
          },
          {
            id: "E",
            label: "Elevation of privilege via shared secrets",
            correct: true,
            rationale:
              "Shared secret access means compromising A yields B's secrets and vice versa.",
          },
        ],
      },
    },
  }),

  // ============================================================
  // Risk Scoring
  // ============================================================
  buildChallenge({
    id: "risk-cvss-critical-rce",
    title: "Score an unauthenticated RCE",
    summary:
      "An internet-facing service can be made to execute arbitrary code via a single crafted request, no login needed.",
    courseTopic: "risk-management",
    difficulty: "intro",
    tags: ["cvss"],
    vulnerableLines: [],
    vulnerabilityType: "Remote Code Execution",
    fixOptions: [],
    explanation:
      "AV:N, AC:L, PR:N, UI:N, S:U, C:H/I:H/A:H gives a base score of 9.8  -  critical.",
    examKeywords: ["critical", "rce", "av:n", "pr:n"],
    supportedModes: RISK_ONLY,
    modeData: {
      riskScoring: {
        scenario:
          "The bug lets any unauthenticated request execute shell commands on the application server. The endpoint is reachable from the internet.",
        cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        question:
          "How would you classify this finding's severity for prioritisation?",
        options: [
          {
            id: "critical",
            label: "Critical  -  page-out, fix immediately",
            correct: true,
            rationale:
              "Remote, unauthenticated, low complexity, full CIA impact: CVSS 9.8.",
          },
          {
            id: "high",
            label: "High  -  patch in the next release",
            correct: false,
            rationale:
              "Understates the severity; unauthenticated RCE is critical.",
          },
          {
            id: "medium",
            label: "Medium  -  schedule in the quarter",
            correct: false,
            rationale: "Drastically understates the urgency.",
          },
          {
            id: "low",
            label: "Low  -  accept the risk",
            correct: false,
            rationale: "Unacceptable for a remote unauthenticated RCE.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "risk-local-info-leak",
    title: "Score a local info disclosure",
    summary:
      "A debug page on localhost exposes the application's runtime configuration. It is unreachable from outside the host.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["cvss"],
    vulnerableLines: [],
    vulnerabilityType: "Information Disclosure (local)",
    fixOptions: [],
    explanation:
      "AV:L lowers exposure dramatically. Without other context the impact is bounded: low.",
    examKeywords: ["local", "av:l", "low"],
    supportedModes: RISK_ONLY,
    modeData: {
      riskScoring: {
        scenario:
          "A diagnostic endpoint binds to 127.0.0.1 and lists in-memory configuration values. It is reachable only by a process already running on the host.",
        cvssVector: "AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N",
        question: "Pick the most appropriate severity for prioritisation.",
        options: [
          {
            id: "low",
            label: "Low  -  fix in routine hardening",
            correct: true,
            rationale:
              "Local-only, low-privilege required, only minor C impact; CVSS ~3.3.",
          },
          {
            id: "medium",
            label: "Medium  -  file a ticket this sprint",
            correct: false,
            rationale:
              "Overstates the risk for a local-only disclosure without integrity or availability impact.",
          },
          {
            id: "high",
            label: "High  -  fix this week",
            correct: false,
            rationale: "Wrong; not remote and impact is limited.",
          },
          {
            id: "critical",
            label: "Critical  -  page-out",
            correct: false,
            rationale: "Drastically overstates the urgency.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "risk-auth-required-injection",
    title: "Score an authenticated injection in admin panel",
    summary:
      "A SQL injection requires an admin login and yields full database read access.",
    courseTopic: "risk-management",
    difficulty: "core",
    tags: ["cvss"],
    vulnerableLines: [],
    vulnerabilityType: "SQL Injection",
    fixOptions: [],
    explanation:
      "PR:H reduces the score but C:H/I:H/A:H from an admin-level bug still lands in high territory because admin accounts are commonly phished.",
    examKeywords: ["high", "pr:h", "admin"],
    supportedModes: RISK_ONLY,
    modeData: {
      riskScoring: {
        scenario:
          "A reporting form in the admin panel concatenates a user-supplied filter into SQL. Only authenticated admins can reach the page. Exploiting it dumps the customer table.",
        cvssVector: "AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H",
        question: "Which severity is most defensible?",
        options: [
          {
            id: "high",
            label: "High  -  patch promptly",
            correct: true,
            rationale:
              "Admin-only access lowers the base score to ~7.2 but customer-data exposure keeps it high.",
          },
          {
            id: "critical",
            label: "Critical  -  page-out",
            correct: false,
            rationale: "PR:H prevents this from being a 9+ score.",
          },
          {
            id: "medium",
            label: "Medium  -  next sprint",
            correct: false,
            rationale: "Understates the impact of full DB read.",
          },
          {
            id: "low",
            label: "Low  -  accept the risk",
            correct: false,
            rationale: "Unacceptable: full data exposure to a phishable role.",
          },
        ],
      },
    },
  }),

  // ============================================================
  // Privacy / GDPR scenario
  // ============================================================
  buildChallenge({
    id: "priv-loan-profiling",
    title: "Privacy: automated loan-decisioning",
    summary:
      "A new feature scores loan applications automatically using profiling on financial data.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["dpia", "profiling"],
    vulnerableLines: [],
    vulnerabilityType: "GDPR Scenario",
    fixOptions: [],
    explanation:
      "Automated decisions with legal/significant effect trigger Art. 22 obligations and almost always require a DPIA (Art. 35). Special-category data and large-scale profiling raise the bar further.",
    examKeywords: ["dpia", "art. 22", "profiling"],
    supportedModes: PRIVACY_ONLY,
    modeData: {
      privacyScenario: {
        scenario:
          "An automated underwriting feature scores loan applications by combining bank-statement features, behavioural signals, and a credit score. The decision is delivered without human review.",
        principles: [
          {
            id: "lawful",
            label: "Lawfulness, fairness, transparency",
            correct: true,
            rationale:
              "Customers must be told they are subject to automated decision-making, and have a lawful basis (Art. 6) plus Art. 22 safeguards.",
          },
          {
            id: "minimisation",
            label: "Data minimisation",
            correct: true,
            rationale:
              "Combining many signals risks pulling in more data than is necessary for the decision.",
          },
          {
            id: "purpose",
            label: "Purpose limitation",
            correct: true,
            rationale:
              "Behavioural signals collected for other reasons would need a fresh basis to be reused for credit scoring.",
          },
          {
            id: "storage",
            label: "Storage limitation",
            correct: false,
            rationale:
              "Retention is a separate concern; it is not the dominant principle in play here.",
          },
          {
            id: "accuracy",
            label: "Accuracy",
            correct: true,
            rationale:
              "Decisions that affect rights must be based on accurate data; the controller must enable correction.",
          },
          {
            id: "integrity",
            label: "Integrity and confidentiality",
            correct: false,
            rationale:
              "Important always but not the principle at the heart of this feature.",
          },
        ],
        dpiaRequired: true,
        dpiaRationale:
          "Automated decisions with legal or similarly significant effect are explicitly listed by the supervisory authorities as triggering Art. 35.",
      },
    },
  }),

  buildChallenge({
    id: "priv-default-marketing",
    title: "Privacy: pre-ticked marketing opt-in",
    summary: "Sign-up form defaults the marketing-email checkbox to ticked.",
    courseTopic: "privacy-gdpr",
    difficulty: "intro",
    tags: ["consent"],
    vulnerableLines: [],
    vulnerabilityType: "GDPR Scenario",
    fixOptions: [],
    explanation:
      "Pre-ticked boxes do not constitute consent (Recital 32). The bundle also breaches purpose limitation if marketing is tied to service creation.",
    examKeywords: ["consent", "recital 32", "opt-in"],
    supportedModes: PRIVACY_ONLY,
    modeData: {
      privacyScenario: {
        scenario:
          "A consumer service requires sign-up to access the product. The sign-up form has a 'Send me marketing email' checkbox that is ticked by default and grouped with the Terms of Service acceptance.",
        principles: [
          {
            id: "lawful",
            label: "Lawfulness  -  invalid consent",
            correct: true,
            rationale:
              "Pre-ticked boxes are not a clear affirmative action (Recital 32).",
          },
          {
            id: "purpose",
            label: "Purpose limitation  -  bundled purposes",
            correct: true,
            rationale:
              "Marketing must be separable from the service contract; bundling makes consent non-freely-given.",
          },
          {
            id: "fairness",
            label: "Fairness and transparency",
            correct: true,
            rationale:
              "Defaults that nudge users into more processing than they expect undermine fair processing.",
          },
          {
            id: "minimisation",
            label: "Data minimisation",
            correct: false,
            rationale:
              "Minimisation is about what fields are collected, not about consent shape.",
          },
          {
            id: "storage",
            label: "Storage limitation",
            correct: false,
            rationale: "Not engaged; this is a collection-time consent issue.",
          },
        ],
        dpiaRequired: false,
        dpiaRationale:
          "Marketing email signup alone does not meet the Art. 35 high-risk threshold; fix the consent flow.",
      },
    },
  }),

  buildChallenge({
    id: "priv-support-reuse-ads",
    title: "Privacy: reuse support transcripts for ads",
    summary:
      "Marketing wants to feed support-chat transcripts into the ad-targeting platform.",
    courseTopic: "privacy-gdpr",
    difficulty: "core",
    tags: ["purpose-limitation"],
    vulnerableLines: [],
    vulnerabilityType: "GDPR Scenario",
    fixOptions: [],
    explanation:
      "Purpose limitation and the lawful basis are the central issues. Compatibility analysis or new consent is required.",
    examKeywords: ["purpose limitation", "lawful basis"],
    supportedModes: PRIVACY_ONLY,
    modeData: {
      privacyScenario: {
        scenario:
          "Customers contact a chat-based support team. Marketing proposes feeding transcripts into the ad platform to build look-alike audiences. No new notice is given to customers.",
        principles: [
          {
            id: "purpose",
            label: "Purpose limitation",
            correct: true,
            rationale:
              "Data collected for support is reused for an incompatible purpose without a new basis.",
          },
          {
            id: "lawful",
            label: "Lawfulness  -  missing basis for new purpose",
            correct: true,
            rationale:
              "Original support basis does not extend to advertising; need fresh consent or compatibility test.",
          },
          {
            id: "minimisation",
            label: "Data minimisation",
            correct: true,
            rationale:
              "Full transcripts go beyond what advertising would require.",
          },
          {
            id: "transparency",
            label: "Transparency",
            correct: true,
            rationale:
              "Customers were not told their support data would be used this way.",
          },
          {
            id: "integrity",
            label: "Integrity and confidentiality",
            correct: false,
            rationale:
              "Storage security is a separate axis; this is about reuse.",
          },
        ],
        dpiaRequired: false,
        dpiaRationale:
          "Likely not Art. 35-mandatory by itself, but a compatibility analysis (Art. 6(4)) is required before the reuse.",
      },
    },
  }),

  // ============================================================
  // Crypto Misuse  -  multi-select
  // ============================================================
  buildChallenge({
    id: "cmis-aes-ecb-static-key",
    title: "Misuses: AES-ECB with a static key",
    summary:
      "An exporter encrypts profile blobs with AES-ECB using a hardcoded key.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["aes", "ecb"],
    language: "python",
    code: `KEY = b"d3adb33fcafef00ddeadbeefcafef00d"
cipher = AES.new(KEY, AES.MODE_ECB)
ct = cipher.encrypt(pad(profile_bytes, 16))`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "ECB leaks block-level structure, the key is hardcoded in source, and there is no integrity check (no AEAD).",
    examKeywords: ["ecb", "hardcoded", "integrity", "aead"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse in this snippet.",
        options: [
          {
            id: "ecb",
            label: "ECB mode leaks plaintext structure",
            correct: true,
            rationale:
              "Identical 16-byte blocks encrypt to identical ciphertext blocks.",
          },
          {
            id: "hardcoded",
            label: "Key is hardcoded in source",
            correct: true,
            rationale:
              "Source-tree keys flow into backups, images, and developer laptops.",
          },
          {
            id: "no-integrity",
            label: "No integrity / no AEAD",
            correct: true,
            rationale: "Without a MAC the ciphertext is malleable.",
          },
          {
            id: "wrong-block-size",
            label: "Padding is wrong size",
            correct: false,
            rationale: "AES block size is 16; the pad call is correct.",
          },
          {
            id: "key-length",
            label: "Key is too short",
            correct: false,
            rationale: "32 hex characters = 16 bytes, valid for AES-128.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-md5-passwords",
    title: "Misuses: MD5 for password storage",
    summary: "A signup flow stores password digests using a fast hash.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["password-hashing"],
    language: "javascript",
    code: `function storePassword(pw) {
  const hash = crypto.createHash("md5").update(pw).digest("hex");
  users.insert({ pw_md5: hash });
}`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "MD5 is fast and collision-broken; there is no salt; no work factor; no peppering. Use Argon2id.",
    examKeywords: ["md5", "fast", "salt", "argon2", "work factor"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "md5",
            label: "MD5 is a fast, collision-broken hash",
            correct: true,
            rationale:
              "MD5 hashes billions/sec on commodity GPUs; not suitable for passwords.",
          },
          {
            id: "no-salt",
            label: "No per-user salt",
            correct: true,
            rationale:
              "Without a salt, identical passwords share a digest and rainbow tables apply.",
          },
          {
            id: "no-workfactor",
            label: "No work factor / KDF",
            correct: true,
            rationale:
              "Password storage needs a tunable-cost KDF (Argon2id/scrypt/bcrypt).",
          },
          {
            id: "wrong-encoding",
            label: "Hex encoding is wrong",
            correct: false,
            rationale: "Encoding is not the failure mode.",
          },
          {
            id: "missing-await",
            label: "Missing await on a Promise",
            correct: false,
            rationale: "createHash is synchronous; no await needed.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-iv-zero",
    title: "Misuses: AES-CBC with a zero IV",
    summary: "A library encrypts records with AES-CBC and a zero IV, no MAC.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["aes", "cbc"],
    language: "go",
    code: `iv := make([]byte, aes.BlockSize) // all zero
mode := cipher.NewCBCEncrypter(block, iv)
ct := make([]byte, len(pt))
mode.CryptBlocks(ct, pt)`,
    vulnerableLines: [1, 2, 4],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "Zero IV leaks equality of plaintexts under the same key. CBC without integrity is malleable, enabling padding-oracle attacks. Prefer AEAD.",
    examKeywords: ["iv", "predictable", "cbc", "integrity"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "iv",
            label: "Predictable (zero) IV",
            correct: true,
            rationale:
              "Equal plaintexts under the same key produce equal ciphertexts; first-block collisions leak structure.",
          },
          {
            id: "no-mac",
            label: "No MAC / integrity",
            correct: true,
            rationale:
              "CBC without authentication is malleable and enables padding-oracle decryption.",
          },
          {
            id: "wrong-cipher",
            label: "AES is the wrong primitive",
            correct: false,
            rationale: "AES is fine; the mode and IV are wrong.",
          },
          {
            id: "block-size",
            label: "Block size mismatch",
            correct: false,
            rationale: "aes.BlockSize is correct for an AES IV.",
          },
        ],
      },
    },
  }),

  // ============================================================
  // AI Review
  // ============================================================
  buildChallenge({
    id: "ai-rev-sqli-parseint",
    title: "AI patch: parseInt instead of parameters",
    summary:
      "AI suggests fixing a SQL injection by wrapping the input in parseInt.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["llm-codegen"],
    vulnerableLines: [],
    vulnerabilityType: "Insecure AI-Generated Code",
    fixOptions: [],
    explanation:
      "parseInt only narrows integer columns. Anywhere user input lands as a string, identifier, or boolean the bug remains. Parameterised queries are the real fix.",
    examKeywords: ["parameterised", "string sink", "identifier", "partial"],
    supportedModes: AI_REVIEW_ONLY,
    modeData: {
      aiReview: {
        language: "javascript",
        originalCode: `app.get("/user/:id", (req, res) => {
  const q = "SELECT name FROM users WHERE id = " + req.params.id;
  db.query(q, (err, rows) => res.json(rows));
});`,
        aiPatch: `app.get("/user/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const q = "SELECT name FROM users WHERE id = " + id;
  db.query(q, (err, rows) => res.json(rows));
});`,
        aiClaim:
          "I've fixed the SQL injection by ensuring the id is always an integer.",
        safe: false,
        reasonKeywords: [
          "parameterised",
          "string",
          "concatenation",
          "binding",
          "other sinks",
        ],
      },
    },
  }),

  buildChallenge({
    id: "ai-rev-xss-replace-script",
    title: "AI patch: strip the literal '<script>'",
    summary:
      "AI fixes a reflected XSS by replacing the substring '<script>' with empty string.",
    courseTopic: "ai-security",
    difficulty: "intro",
    tags: ["llm-codegen"],
    vulnerableLines: [],
    vulnerabilityType: "Insecure AI-Generated Code",
    fixOptions: [],
    explanation:
      "Substring replacement is bypassed by case folding, attribute payloads (onerror, onload), or other tags like <img>, <svg>, <iframe srcdoc>.",
    examKeywords: ["blacklist", "encoding", "context", "bypass"],
    supportedModes: AI_REVIEW_ONLY,
    modeData: {
      aiReview: {
        language: "javascript",
        originalCode: `app.get("/hello", (req, res) => {
  res.send("<h1>Hi " + req.query.name + "</h1>");
});`,
        aiPatch: `app.get("/hello", (req, res) => {
  const safe = String(req.query.name).replace("<script>", "");
  res.send("<h1>Hi " + safe + "</h1>");
});`,
        aiClaim:
          "I've removed the <script> tag from user input so XSS is no longer possible.",
        safe: false,
        reasonKeywords: [
          "blacklist",
          "encoding",
          "<img>",
          "onerror",
          "context",
        ],
      },
    },
  }),

  buildChallenge({
    id: "ai-rev-bcrypt-correct",
    title: "AI patch: switch MD5 password hashing to bcrypt",
    summary:
      "AI replaces MD5 password storage with bcrypt at cost factor 12 plus a per-user salt.",
    courseTopic: "ai-security",
    difficulty: "core",
    tags: ["llm-codegen"],
    vulnerableLines: [],
    vulnerabilityType: "AI-Generated Code Review",
    fixOptions: [],
    explanation:
      "The replacement uses an appropriate password-hashing function with a sensible work factor. It is a good fix.",
    examKeywords: ["bcrypt", "work factor", "salt", "kdf", "argon2"],
    supportedModes: AI_REVIEW_ONLY,
    modeData: {
      aiReview: {
        language: "javascript",
        originalCode: `function storePassword(pw, user) {
  const hash = crypto.createHash("md5").update(pw).digest("hex");
  users.update(user, { pw_md5: hash });
}`,
        aiPatch: `async function storePassword(pw, user) {
  const hash = await bcrypt.hash(pw, 12);
  users.update(user, { pw_bcrypt: hash });
}`,
        aiClaim:
          "I've replaced MD5 with bcrypt at a cost factor of 12, which includes a per-user salt.",
        safe: true,
        reasonKeywords: ["bcrypt", "salt", "work factor"],
      },
    },
  }),

  // ============================================================
  // Report Builder
  // ============================================================
  buildChallenge({
    id: "report-sqli-login",
    title: "Write a report for the login SQLi",
    summary:
      "A Java JDBC login handler concatenates credentials into a SQL string with no parameterisation.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["report"],
    language: "java",
    code: `public User login(String username, String password) {
  String sql = "SELECT * FROM users WHERE username='" + username +
               "' AND password='" + password + "'";
  Statement st = conn.createStatement();
  ResultSet rs = st.executeQuery(sql);
  if (rs.next()) return User.from(rs);
  return null;
}`,
    vulnerableLines: [2, 3, 4, 5],
    vulnerabilityType: "SQL Injection",
    fixOptions: [],
    explanation:
      "A complete writeup names the bug, points at the vulnerable lines, shows an exploit (e.g. admin'-- as the username), states the impact (full DB compromise, auth bypass), and prescribes prepared statements plus password hashing. WSTG-INPV-05 / A03.",
    examKeywords: [
      "sql injection",
      "prepared statement",
      "wstg-inpv-05",
      "a03",
      "tautology",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-05",
    supportedModes: REPORT_ONLY,
    modeData: {
      reportBuilder: {
        fields: [
          {
            id: "title",
            label: "Title",
            placeholder: "SQL injection in /login authentication query",
            keywords: ["sql injection", "login"],
          },
          {
            id: "lines",
            label: "Vulnerable lines",
            placeholder: "Lines 2-5 (string concatenation into Statement)",
            keywords: ["concatenation", "statement"],
          },
          {
            id: "explanation",
            label: "Explanation",
            placeholder:
              "The handler builds the SQL by string concatenation, so any quote in the input breaks out...",
            keywords: ["concatenation", "tautology", "quote"],
            multiline: true,
          },
          {
            id: "exploit",
            label: "Exploit steps",
            placeholder:
              "POST /login with username=admin'-- and any password. Receive admin session...",
            keywords: ["admin'--", "post", "/login"],
            multiline: true,
          },
          {
            id: "impact",
            label: "Impact",
            placeholder:
              "Authentication bypass, account takeover, full read/write of users table...",
            keywords: ["bypass", "takeover", "database"],
            multiline: true,
          },
          {
            id: "fix",
            label: "Fix recommendation",
            placeholder:
              "Replace with a PreparedStatement binding parameters; hash passwords with Argon2id...",
            keywords: ["prepared statement", "argon2", "parameter"],
            multiline: true,
          },
          {
            id: "mapping",
            label: "WSTG / Top 10",
            placeholder: "WSTG-INPV-05, OWASP Top 10 A03",
            keywords: ["wstg-inpv-05", "a03"],
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "report-idor-orders",
    title: "Write a report for the IDOR on /orders",
    summary:
      "An order detail endpoint loads any order id passed in the URL with no ownership check.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["report"],
    language: "python",
    code: `@app.get("/orders/<int:order_id>")
@login_required
def order_detail(order_id):
    order = Order.query.get(order_id)
    if order is None:
        abort(404)
    return jsonify(order.to_dict())`,
    vulnerableLines: [4, 6],
    vulnerabilityType: "Insecure Direct Object Reference",
    fixOptions: [],
    explanation:
      "A solid writeup names IDOR / object-level authorisation, demonstrates incrementing order_id to view another user's data, states the impact (cross-tenant data exposure), and prescribes scoping the query by current_user.id. WSTG-ATHZ-04 / A01.",
    examKeywords: ["idor", "object-level", "wstg-athz-04", "a01", "ownership"],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-04",
    supportedModes: REPORT_ONLY,
    modeData: {
      reportBuilder: {
        fields: [
          {
            id: "title",
            label: "Title",
            placeholder: "IDOR on /orders/{id} exposes other users' orders",
            keywords: ["idor", "orders"],
          },
          {
            id: "lines",
            label: "Vulnerable lines",
            placeholder: "Line 4: query loads by id only, no ownership filter",
            keywords: ["ownership", "filter"],
          },
          {
            id: "explanation",
            label: "Explanation",
            placeholder:
              "The handler authenticates the caller but never authorises the lookup...",
            keywords: ["authorisation", "authenticate", "id"],
            multiline: true,
          },
          {
            id: "exploit",
            label: "Exploit steps",
            placeholder:
              "Log in as user A. Curl /orders/N for increasing N. Receive other users' order JSON.",
            keywords: ["increment", "curl", "/orders"],
            multiline: true,
          },
          {
            id: "impact",
            label: "Impact",
            placeholder:
              "Cross-tenant disclosure of order data including PII and totals...",
            keywords: ["cross-tenant", "disclosure", "pii"],
            multiline: true,
          },
          {
            id: "fix",
            label: "Fix recommendation",
            placeholder:
              "Filter the Order query by current_user.id; add an integration test that proves access denial for non-owners.",
            keywords: ["current_user", "filter_by", "ownership", "test"],
            multiline: true,
          },
          {
            id: "mapping",
            label: "WSTG / Top 10",
            placeholder: "WSTG-ATHZ-04, OWASP Top 10 A01",
            keywords: ["wstg-athz-04", "a01"],
          },
        ],
      },
    },
  }),
];
