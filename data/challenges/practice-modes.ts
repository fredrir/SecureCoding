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
    filename: "search.js",
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
    filename: "login.sql",
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
    filename: "thumb.ts",
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
    id: "wstg-map-reflected-xss",
    title: "Map: search term is echoed into the page",
    summary:
      "A search endpoint reflects the query parameter directly into the HTML response.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Reflected XSS",
    fixOptions: [],
    explanation:
      "Reflected XSS occurs when a request parameter is immediately echoed into the response and executed by the browser. In WSTG this maps to WSTG-INPV-01.",
    examKeywords: ["reflected", "xss", "wstg", "inpv-01"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category best describes a payload reflected from a URL parameter into the response?",
        top10Hint: "A05",
        options: [
          {
            id: "reflected",
            code: "WSTG-INPV-01",
            label: "Test for Reflected Cross Site Scripting",
            correct: true,
            rationale:
              "The payload comes from the current request and is reflected in the response without being stored.",
          },
          {
            id: "stored",
            code: "WSTG-INPV-02",
            label: "Test for Stored Cross Site Scripting",
            correct: false,
            rationale:
              "Stored XSS requires server-side persistence and later rendering.",
          },
          {
            id: "sqli",
            code: "WSTG-INPV-05",
            label: "Test for SQL Injection",
            correct: false,
            rationale:
              "This is browser-side script execution, not database query manipulation.",
          },
          {
            id: "csrf",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: false,
            rationale:
              "CSRF tricks a browser into sending a request; it is not about reflected script execution.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-sqli-login",
    title: "Map: login query concatenates username",
    summary:
      "The login code builds a SQL query by concatenating username and password parameters.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "SQL Injection",
    fixOptions: [],
    explanation:
      "User input that changes the structure of a SQL query is SQL injection. In WSTG this maps to WSTG-INPV-05.",
    examKeywords: ["sql injection", "sqli", "prepared statements", "inpv-05"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers user input that is concatenated into a SQL query?",
        top10Hint: "A05",
        options: [
          {
            id: "sqli",
            code: "WSTG-INPV-05",
            label: "Test for SQL Injection",
            correct: true,
            rationale:
              "The attacker can alter the SQL query structure through untrusted input.",
          },
          {
            id: "cmdi",
            code: "WSTG-INPV-12",
            label: "Test for Command Injection",
            correct: false,
            rationale:
              "Command injection targets OS commands, not SQL statements.",
          },
          {
            id: "weak-encryption",
            code: "WSTG-CRYP-04",
            label: "Test for Weak Encryption",
            correct: false,
            rationale:
              "The issue is query construction, not cryptographic strength.",
          },
          {
            id: "auth-bypass",
            code: "WSTG-ATHN-04",
            label: "Testing for Bypassing Authentication Schema",
            correct: false,
            rationale:
              "SQL injection may lead to login bypass, but the vulnerability family is SQL injection.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-command-injection",
    title: "Map: ping tool passes host to shell",
    summary:
      "A diagnostics endpoint runs `ping ${host}` with unsanitised user input.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Command Injection",
    fixOptions: [],
    explanation:
      "When attacker-controlled input is interpreted by the operating system shell, the WSTG category is WSTG-INPV-12.",
    examKeywords: ["command injection", "shell", "inpv-12"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers attacker input appended to an operating system command?",
        top10Hint: "A05",
        options: [
          {
            id: "cmdi",
            code: "WSTG-INPV-12",
            label: "Test for Command Injection",
            correct: true,
            rationale:
              "The user-controlled `host` value can become part of an OS command.",
          },
          {
            id: "sqli",
            code: "WSTG-INPV-05",
            label: "Test for SQL Injection",
            correct: false,
            rationale: "No database query is being manipulated.",
          },
          {
            id: "ssrf",
            code: "WSTG-INPV-19",
            label: "Test for SSRF",
            correct: false,
            rationale:
              "SSRF makes the server issue network requests; this scenario executes shell commands.",
          },
          {
            id: "upload",
            code: "WSTG-BUSL-09",
            label: "Test Upload of Malicious Files",
            correct: false,
            rationale: "No file upload is involved.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-ssrf-avatar-fetcher",
    title: "Map: avatar importer fetches arbitrary URLs",
    summary:
      "Users can submit an image URL, and the server fetches it without restricting internal addresses.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "SSRF",
    fixOptions: [],
    explanation:
      "Server-Side Request Forgery occurs when an attacker can make the server send requests to attacker-chosen destinations. In WSTG this maps to WSTG-INPV-19.",
    examKeywords: ["ssrf", "internal services", "metadata", "inpv-19"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers a server fetching attacker-controlled URLs, including internal hosts?",
        top10Hint: "A05",
        options: [
          {
            id: "ssrf",
            code: "WSTG-INPV-19",
            label: "Test for SSRF",
            correct: true,
            rationale:
              "The attacker controls where the server sends outbound requests.",
          },
          {
            id: "cors",
            code: "WSTG-CLNT-07",
            label: "Test for Cross Origin Resource Sharing",
            correct: false,
            rationale:
              "CORS is a browser-enforced cross-origin access control issue, not a server-side fetch issue.",
          },
          {
            id: "redirect",
            code: "WSTG-CLNT-04",
            label: "Testing for Client Side URL Redirect",
            correct: false,
            rationale:
              "The server is fetching the URL; the browser is not merely redirected.",
          },
          {
            id: "tls",
            code: "WSTG-CRYP-01",
            label: "Test for Weak Transport Layer Security",
            correct: false,
            rationale: "Transport encryption is not the central weakness here.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-csrf-email-change",
    title: "Map: email change form has no CSRF token",
    summary:
      "A logged-in user's email address can be changed by submitting a cross-site POST request.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "CSRF",
    fixOptions: [],
    explanation:
      "Cross-Site Request Forgery abuses the victim's authenticated browser session to perform an unintended action. In WSTG this maps to WSTG-SESS-05.",
    examKeywords: ["csrf", "xsrf", "session", "sess-05"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers a state-changing request that lacks CSRF protection?",
        top10Hint: "A01",
        options: [
          {
            id: "csrf",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: true,
            rationale:
              "The attack causes the victim's authenticated browser to submit an unwanted state-changing request.",
          },
          {
            id: "cookie-attrs",
            code: "WSTG-SESS-02",
            label: "Test for Cookies Attributes",
            correct: false,
            rationale:
              "Cookie attributes may help, but the specific missing control is CSRF protection.",
          },
          {
            id: "auth-bypass",
            code: "WSTG-ATHN-04",
            label: "Testing for Bypassing Authentication Schema",
            correct: false,
            rationale:
              "The victim is already authenticated; the issue is request forgery.",
          },
          {
            id: "idor",
            code: "WSTG-ATHZ-04",
            label: "Test for Insecure Direct Object References",
            correct: false,
            rationale:
              "No direct object identifier is being accessed without authorization.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-missing-cookie-flags",
    title: "Map: session cookie lacks Secure and HttpOnly",
    summary:
      "The application sets a session cookie without the Secure, HttpOnly, or SameSite attributes.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Insecure Cookie Attributes",
    fixOptions: [],
    explanation:
      "Session cookie configuration is tested under WSTG-SESS-02. Missing Secure, HttpOnly, and SameSite attributes can increase session theft or request forgery risk.",
    examKeywords: ["cookie", "secure", "httponly", "samesite", "sess-02"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers missing Secure, HttpOnly, or SameSite attributes on session cookies?",
        top10Hint: "A02",
        options: [
          {
            id: "cookie-attrs",
            code: "WSTG-SESS-02",
            label: "Test for Cookies Attributes",
            correct: true,
            rationale:
              "This category specifically covers whether cookies have appropriate security attributes.",
          },
          {
            id: "exposed-session-vars",
            code: "WSTG-SESS-04",
            label: "Testing for Exposed Session Variables",
            correct: false,
            rationale:
              "Exposed session variables are about session identifiers or tokens being leaked, not cookie flag configuration.",
          },
          {
            id: "weak-tls",
            code: "WSTG-CRYP-01",
            label: "Test for Weak Transport Layer Security",
            correct: false,
            rationale:
              "TLS is related to transport security, but the finding is cookie attribute configuration.",
          },
          {
            id: "csrf",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: false,
            rationale:
              "SameSite can reduce CSRF risk, but the test category for cookie flags is WSTG-SESS-02.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-weak-password-policy",
    title: "Map: users may choose password '123456'",
    summary:
      "Registration accepts very short and common passwords without complexity or blocklist checks.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Password Policy",
    fixOptions: [],
    explanation:
      "Weak or unenforced password rules are authentication weaknesses covered by WSTG-ATHN-07.",
    examKeywords: ["password policy", "weak password", "athn-07"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers acceptance of trivial passwords such as '123456'?",
        top10Hint: "A07",
        options: [
          {
            id: "weak-password-policy",
            code: "WSTG-ATHN-07",
            label: "Test for Weak Password Policy",
            correct: true,
            rationale:
              "The weakness is that the application allows easily guessed passwords.",
          },
          {
            id: "weak-lockout",
            code: "WSTG-ATHN-03",
            label: "Test for Weak Lockout Mechanism",
            correct: false,
            rationale:
              "Lockout controls repeated guessing attempts; they do not define password strength.",
          },
          {
            id: "default-creds",
            code: "WSTG-ATHN-02",
            label: "Test for Default Credentials",
            correct: false,
            rationale:
              "Default credentials are vendor or preconfigured accounts, not user-selected weak passwords.",
          },
          {
            id: "reset",
            code: "WSTG-ATHN-09",
            label: "Test for Weak Password Change or Reset Functionalities",
            correct: false,
            rationale:
              "The scenario concerns password creation policy, not reset flow weaknesses.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-weak-lockout",
    title: "Map: unlimited login guesses",
    summary:
      "The login form allows unlimited password attempts without throttling, lockout, or monitoring.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Lockout Mechanism",
    fixOptions: [],
    explanation:
      "When repeated authentication attempts are not limited, the relevant WSTG category is WSTG-ATHN-03.",
    examKeywords: ["lockout", "brute force", "rate limit", "athn-03"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers missing throttling or lockout on repeated login attempts?",
        top10Hint: "A07",
        options: [
          {
            id: "weak-lockout",
            code: "WSTG-ATHN-03",
            label: "Test for Weak Lockout Mechanism",
            correct: true,
            rationale:
              "The issue is that attackers can repeatedly guess credentials without effective limits.",
          },
          {
            id: "weak-password-policy",
            code: "WSTG-ATHN-07",
            label: "Test for Weak Password Policy",
            correct: false,
            rationale:
              "Password policy concerns password quality, not repeated guessing controls.",
          },
          {
            id: "default-creds",
            code: "WSTG-ATHN-02",
            label: "Test for Default Credentials",
            correct: false,
            rationale: "No vendor default account is described.",
          },
          {
            id: "csrf",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: false,
            rationale:
              "CSRF is about forged authenticated requests, not brute-force login attempts.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-default-admin-password",
    title: "Map: admin/admin still works",
    summary:
      "A deployed admin interface still accepts the default username and password.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Default Credentials",
    fixOptions: [],
    explanation:
      "Default or unchanged credentials are tested under WSTG-ATHN-02.",
    examKeywords: ["default credentials", "admin admin", "athn-02"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers an application deployed with unchanged default credentials?",
        top10Hint: "A07",
        options: [
          {
            id: "default-creds",
            code: "WSTG-ATHN-02",
            label: "Test for Default Credentials",
            correct: true,
            rationale:
              "The weakness is the use of known default login credentials.",
          },
          {
            id: "weak-lockout",
            code: "WSTG-ATHN-03",
            label: "Test for Weak Lockout Mechanism",
            correct: false,
            rationale:
              "Lockout mechanisms limit guessing attempts; here the credentials are already known defaults.",
          },
          {
            id: "auth-bypass",
            code: "WSTG-ATHN-04",
            label: "Testing for Bypassing Authentication Schema",
            correct: false,
            rationale:
              "The attacker logs in with valid credentials rather than bypassing authentication logic.",
          },
          {
            id: "admin-interface",
            code: "WSTG-CONF-05",
            label: "Enumerate Infrastructure and Application Admin Interfaces",
            correct: false,
            rationale:
              "Finding an admin interface is configuration enumeration; the described issue is default credentials.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-missing-hsts",
    title: "Map: HTTPS site does not set HSTS",
    summary:
      "The application supports HTTPS but does not send a Strict-Transport-Security header.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Missing HSTS",
    fixOptions: [],
    explanation:
      "Missing or invalid HTTP Strict Transport Security is tested under WSTG-CONF-07.",
    examKeywords: ["hsts", "strict-transport-security", "conf-07"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers checking whether an HTTPS site sets a valid HSTS header?",
        top10Hint: "A02",
        options: [
          {
            id: "hsts",
            code: "WSTG-CONF-07",
            label: "Test HTTP Strict Transport Security",
            correct: true,
            rationale:
              "HSTS is configured through the Strict-Transport-Security response header.",
          },
          {
            id: "weak-tls",
            code: "WSTG-CRYP-01",
            label: "Test for Weak Transport Layer Security",
            correct: false,
            rationale:
              "Weak TLS covers protocol and cipher strength; HSTS is an HTTP security header.",
          },
          {
            id: "unencrypted-channel",
            code: "WSTG-CRYP-03",
            label:
              "Test for Sensitive Information Sent via Unencrypted Channels",
            correct: false,
            rationale:
              "That category concerns sensitive data sent over HTTP or another unencrypted channel.",
          },
          {
            id: "cookie-attrs",
            code: "WSTG-SESS-02",
            label: "Test for Cookies Attributes",
            correct: false,
            rationale:
              "Cookie flags are separate from the HSTS response header.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-stack-trace",
    title: "Map: debug stack trace shown to users",
    summary:
      "A production error page exposes framework versions, file paths, and a full stack trace.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Information Disclosure via Stack Trace",
    fixOptions: [],
    explanation:
      "Verbose stack traces in production are an error handling weakness covered by WSTG-ERRH-02.",
    examKeywords: [
      "stack trace",
      "error handling",
      "information disclosure",
      "errh-02",
    ],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers production error pages that expose stack traces?",
        top10Hint: "A02",
        options: [
          {
            id: "stack-traces",
            code: "WSTG-ERRH-02",
            label: "Testing for Stack Traces",
            correct: true,
            rationale:
              "The issue is verbose error output exposing internal implementation details.",
          },
          {
            id: "hsts",
            code: "WSTG-CONF-07",
            label: "Test HTTP Strict Transport Security",
            correct: false,
            rationale: "HSTS is unrelated to error page disclosure.",
          },
          {
            id: "exposed-session-vars",
            code: "WSTG-SESS-04",
            label: "Testing for Exposed Session Variables",
            correct: false,
            rationale:
              "Session variables are not the main exposed item in this scenario.",
          },
          {
            id: "weak-encryption",
            code: "WSTG-CRYP-04",
            label: "Test for Weak Encryption",
            correct: false,
            rationale:
              "The vulnerability is information disclosure through errors, not weak cryptography.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-cors-wildcard-credentials",
    title: "Map: API trusts every Origin",
    summary:
      "An API reflects arbitrary Origin headers and allows credentialed cross-origin requests.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Insecure CORS Configuration",
    fixOptions: [],
    explanation:
      "Overly permissive Cross-Origin Resource Sharing policy is tested under WSTG-CLNT-07.",
    examKeywords: ["cors", "origin", "credentials", "clnt-07"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers overly permissive CORS policies that expose authenticated API responses?",
        top10Hint: "A02",
        options: [
          {
            id: "cors",
            code: "WSTG-CLNT-07",
            label: "Test for Cross Origin Resource Sharing",
            correct: true,
            rationale:
              "CORS controls whether browsers may expose cross-origin responses to scripts.",
          },
          {
            id: "csrf",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: false,
            rationale:
              "CSRF sends unwanted requests; CORS controls whether responses can be read cross-origin.",
          },
          {
            id: "ssrf",
            code: "WSTG-INPV-19",
            label: "Test for SSRF",
            correct: false,
            rationale:
              "SSRF is server-side request forgery, not browser cross-origin access.",
          },
          {
            id: "client-redirect",
            code: "WSTG-CLNT-04",
            label: "Testing for Client Side URL Redirect",
            correct: false,
            rationale: "No client-side redirect is described.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "wstg-map-clickjacking",
    title: "Map: account page can be framed",
    summary:
      "Sensitive account actions can be loaded inside an attacker-controlled iframe.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["mapping"],
    vulnerableLines: [],
    vulnerabilityType: "Clickjacking",
    fixOptions: [],
    explanation:
      "Clickjacking tests whether pages can be framed and abused for UI redress attacks. In WSTG this maps to WSTG-CLNT-09.",
    examKeywords: ["clickjacking", "iframe", "x-frame-options", "clnt-09"],
    supportedModes: WSTG_ONLY,
    modeData: {
      wstgMapping: {
        question:
          "Which WSTG category covers sensitive pages that can be embedded in an attacker iframe?",
        top10Hint: "A01",
        options: [
          {
            id: "clickjacking",
            code: "WSTG-CLNT-09",
            label: "Test for Clickjacking",
            correct: true,
            rationale:
              "The attack overlays or frames a legitimate page to trick the user into clicking.",
          },
          {
            id: "cors",
            code: "WSTG-CLNT-07",
            label: "Test for Cross Origin Resource Sharing",
            correct: false,
            rationale:
              "CORS controls script access to cross-origin responses, not whether a page can be framed.",
          },
          {
            id: "csrf",
            code: "WSTG-SESS-05",
            label: "Test for Cross Site Request Forgery",
            correct: false,
            rationale:
              "CSRF and clickjacking can both trigger actions, but framing/UI redress is clickjacking.",
          },
          {
            id: "client-redirect",
            code: "WSTG-CLNT-04",
            label: "Testing for Client Side URL Redirect",
            correct: false,
            rationale: "No redirect behavior is involved.",
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
    id: "stride-reset-token-reuse",
    title: "STRIDE on reusable password reset links",
    summary:
      "Password reset links contain a long random token but never expire and are not invalidated after use.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "authentication", "password-reset"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "A reset link is effectively a bearer credential. If it leaks through email forwarding, browser history, logs, or referrers, anyone can use it to act as the user. Because the token never expires and remains valid after use, it also enables repeated account takeover attempts.",
    examKeywords: [
      "stride",
      "spoofing",
      "password reset",
      "bearer token",
      "expiry",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A web application sends password reset links like /reset?token=<128-bit-random>. The token is stored in the database, but it has no expiry time and is not deleted after a successful password reset. Links are sometimes forwarded to IT support during troubleshooting.",
        options: [
          {
            id: "S",
            label:
              "Spoofing  -  leaked reset link lets attacker act as the user",
            correct: true,
            rationale:
              "Possession of the reset URL is enough to reset the account password.",
          },
          {
            id: "T",
            label: "Tampering  -  attacker modifies protected state",
            correct: true,
            rationale:
              "The attacker can change the victim's password, modifying security-critical account state.",
          },
          {
            id: "R",
            label: "Repudiation  -  no evidence of who used the token",
            correct: true,
            rationale:
              "If reset-token use is not tied to authenticated identity, IP, timestamp, or audit logs, the real actor may be hard to prove.",
          },
          {
            id: "I",
            label:
              "Information disclosure  -  token may leak via support workflows",
            correct: true,
            rationale:
              "Forwarded emails, logs, browser history, and referrer headers can expose the bearer token.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The main issue is account takeover, not exhausting system resources.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "The attacker gains the victim's account, but the scenario does not show escalation to a higher role.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-admin-feature-flag",
    title: "STRIDE on client-side admin feature flags",
    summary:
      "The frontend hides admin actions unless localStorage.isAdmin is true, but the backend trusts the submitted action.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "authorization", "access-control"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Client-side checks are not authorization. A user can tamper with local storage or send requests directly. If the server accepts admin operations without verifying the user's role server-side, this becomes elevation of privilege and may also create repudiation problems if admin actions are not audited.",
    examKeywords: [
      "stride",
      "tampering",
      "elevation of privilege",
      "authorization",
      "server-side checks",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A React frontend shows the 'Delete user' button only when localStorage.isAdmin === 'true'. The API endpoint DELETE /users/:id only checks that the request has a valid session cookie, not whether the user has an admin role.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  pretending to be an administrator",
            correct: true,
            rationale:
              "The attacker can make the system treat them as an admin by manipulating client-controlled state.",
          },
          {
            id: "T",
            label: "Tampering  -  changing localStorage or direct API requests",
            correct: true,
            rationale:
              "The attacker can alter client-side state or bypass the UI and send the request directly.",
          },
          {
            id: "R",
            label: "Repudiation  -  destructive admin action may be disputed",
            correct: true,
            rationale:
              "Without strong audit logging, a user may deny having performed the deletion.",
          },
          {
            id: "I",
            label: "Information disclosure",
            correct: false,
            rationale:
              "The scenario focuses on unauthorized destructive actions, not reading confidential data.",
          },
          {
            id: "D",
            label: "Denial of service  -  deleting users disrupts access",
            correct: true,
            rationale:
              "Unauthorized deletion of accounts can deny legitimate users access to the service.",
          },
          {
            id: "E",
            label:
              "Elevation of privilege  -  normal user performs admin action",
            correct: true,
            rationale:
              "A regular authenticated user obtains administrative capability.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-webhook-no-signature",
    title: "STRIDE on unsigned payment webhooks",
    summary:
      "The order service marks invoices as paid whenever it receives a POST /payment-webhook request.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "webhook", "integrity"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "A webhook endpoint must authenticate the sender and verify message integrity. Without a shared-secret HMAC, public key signature, nonce, timestamp, and replay protection, attackers can forge payment events or replay old ones.",
    examKeywords: [
      "stride",
      "spoofing",
      "tampering",
      "webhook",
      "signature",
      "replay",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "An e-commerce backend exposes POST /payment-webhook. If the JSON body contains { orderId, status: 'paid' }, the order is shipped. The endpoint has no source authentication, no HMAC/signature verification, and no replay protection.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  attacker impersonates the payment provider",
            correct: true,
            rationale:
              "The server has no reliable way to know whether the request really came from the payment provider.",
          },
          {
            id: "T",
            label: "Tampering  -  attacker forges payment status",
            correct: true,
            rationale:
              "The attacker can submit or modify the JSON body to mark an unpaid order as paid.",
          },
          {
            id: "R",
            label: "Repudiation  -  weak audit trail for payment events",
            correct: true,
            rationale:
              "Without signed events and logs, it is difficult to prove which party produced a payment message.",
          },
          {
            id: "I",
            label: "Information disclosure",
            correct: false,
            rationale:
              "The described failure is about forged state changes, not leaking data.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The scenario does not describe resource exhaustion or service disruption.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "The attacker is not gaining a higher application role; they are forging trusted external input.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-public-s3-backups",
    title: "STRIDE on public backup bucket",
    summary:
      "Nightly database backups are uploaded to a cloud bucket with public-read permissions.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "cloud", "misconfiguration", "privacy"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "A public backup bucket is mainly an information disclosure risk. If the bucket also allows writes or overwrites, tampering and denial of service become relevant. Missing access logs can also make investigation and attribution difficult.",
    examKeywords: [
      "stride",
      "information disclosure",
      "cloud storage",
      "least privilege",
      "logging",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A government service exports nightly database backups to object storage. The bucket policy accidentally allows public read access. Access logging is disabled. In a later review, engineers also discover that any authenticated cloud account in the organization can overwrite backup objects.",
        options: [
          {
            id: "S",
            label: "Spoofing",
            correct: false,
            rationale:
              "The scenario does not depend on pretending to be another identity.",
          },
          {
            id: "T",
            label: "Tampering  -  backups can be overwritten",
            correct: true,
            rationale:
              "Overwriting backup objects compromises the integrity of recovery data.",
          },
          {
            id: "R",
            label: "Repudiation  -  access logging is disabled",
            correct: true,
            rationale:
              "Without logs, it is hard to determine who accessed or modified backups.",
          },
          {
            id: "I",
            label:
              "Information disclosure  -  public backups expose sensitive data",
            correct: true,
            rationale:
              "Database backups often contain personal data, secrets, internal records, and historical data.",
          },
          {
            id: "D",
            label: "Denial of service  -  corrupted backups can block recovery",
            correct: true,
            rationale:
              "If attackers overwrite backups, the organization may be unable to recover after an incident.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "Reading or overwriting the bucket is serious, but no higher application role is obtained.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-jwt-none-alg",
    title: "STRIDE on JWT alg=none acceptance",
    summary:
      "The API accepts JWTs where the header says alg='none' and trusts the role claim.",
    courseTopic: "threat-modeling",
    difficulty: "advanced",
    tags: ["stride", "jwt", "authentication", "authorization"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Accepting unsigned JWTs lets attackers tamper with claims such as userId or role. This can spoof another identity and elevate privileges if the backend trusts role='admin'. It may also cause repudiation if logs record only the forged subject claim.",
    examKeywords: [
      "stride",
      "jwt",
      "alg none",
      "tampering",
      "elevation of privilege",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A microservice validates JWTs by decoding the header and payload, but it does not require a specific signing algorithm. Tokens with { alg: 'none' } are accepted. The service trusts the role claim to authorize admin endpoints.",
        options: [
          {
            id: "S",
            label:
              "Spoofing  -  forged subject claim impersonates another user",
            correct: true,
            rationale:
              "The attacker can set sub or userId to another identity without a valid signature.",
          },
          {
            id: "T",
            label: "Tampering  -  JWT claims can be modified",
            correct: true,
            rationale:
              "Changing role, userId, or expiry in an unsigned token changes trusted authorization data.",
          },
          {
            id: "R",
            label:
              "Repudiation  -  logs may attribute actions to forged userId",
            correct: true,
            rationale:
              "If logs trust the token subject, actions may be falsely attributed to the victim.",
          },
          {
            id: "I",
            label: "Information disclosure  -  admin data may become readable",
            correct: true,
            rationale:
              "Forged admin claims can expose data restricted to privileged users.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The core issue is trust in unsigned identity and authorization claims.",
          },
          {
            id: "E",
            label: "Elevation of privilege  -  attacker sets role='admin'",
            correct: true,
            rationale:
              "A normal user can gain administrator privileges by editing the token.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-csrf-email-change",
    title: "STRIDE on CSRF email change",
    summary:
      "Changing account email only requires a session cookie and accepts cross-site POSTs.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "csrf", "session-management"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "CSRF abuses the browser's automatic cookie attachment. The attacker cannot read the response, but can cause a victim to perform a state-changing action. Changing the account email can enable later password reset takeover.",
    examKeywords: ["stride", "csrf", "tampering", "session cookie", "sameSite"],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A logged-in user visits an attacker-controlled page. The page auto-submits a form to https://bank.example/change-email with email=attacker@example.com. The bank accepts the request because the browser includes the victim's session cookie. There is no CSRF token or SameSite protection.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  request is sent under victim's session",
            correct: true,
            rationale:
              "The server treats the forged request as if the victim intentionally sent it.",
          },
          {
            id: "T",
            label: "Tampering  -  account email is changed",
            correct: true,
            rationale: "The attack modifies security-relevant account data.",
          },
          {
            id: "R",
            label: "Repudiation  -  victim can deny intentional action",
            correct: true,
            rationale:
              "The request came from the victim's browser, but not from the victim's intention.",
          },
          {
            id: "I",
            label: "Information disclosure",
            correct: false,
            rationale:
              "Classic CSRF causes actions; it usually does not let the attacker read the response due to same-origin policy.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The scenario does not describe making the service unavailable.",
          },
          {
            id: "E",
            label: "Elevation of privilege  -  may lead to account takeover",
            correct: true,
            rationale:
              "Changing the email may allow password reset takeover, effectively giving the attacker control of the account.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-ssrf-metadata-service",
    title: "STRIDE on SSRF to cloud metadata",
    summary:
      "A URL preview feature fetches arbitrary URLs, including cloud metadata endpoints.",
    courseTopic: "threat-modeling",
    difficulty: "advanced",
    tags: ["stride", "ssrf", "cloud", "metadata"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "SSRF can cross a trust boundary because the server makes the request from inside the network. Access to cloud metadata may reveal temporary credentials, which can cause information disclosure and possibly elevation of privilege in the cloud account.",
    examKeywords: [
      "stride",
      "ssrf",
      "metadata service",
      "information disclosure",
      "cloud credentials",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A chat application generates link previews by fetching any URL posted by users. An attacker posts http://169.254.169.254/latest/meta-data/iam/security-credentials/. The server runs in a cloud VM with an instance role that can read private storage objects.",
        options: [
          {
            id: "S",
            label:
              "Spoofing  -  attacker causes requests from trusted server identity",
            correct: true,
            rationale:
              "The metadata service sees the request as coming from the trusted VM, not the external attacker.",
          },
          {
            id: "T",
            label: "Tampering",
            correct: false,
            rationale:
              "The described request mainly reads metadata and credentials, not modifies data.",
          },
          {
            id: "R",
            label: "Repudiation",
            correct: false,
            rationale: "Auditability is not the central issue in the scenario.",
          },
          {
            id: "I",
            label: "Information disclosure  -  metadata credentials may leak",
            correct: true,
            rationale:
              "The attacker may read instance role credentials or internal-only service responses.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The scenario is not about exhausting resources or crashing services.",
          },
          {
            id: "E",
            label:
              "Elevation of privilege  -  stolen role credentials grant cloud access",
            correct: true,
            rationale:
              "Temporary cloud credentials may allow the attacker to access resources beyond normal user permissions.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-debug-stacktrace",
    title: "STRIDE on production debug stack traces",
    summary:
      "Production errors return stack traces, environment variables, SQL queries, and internal paths.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "error-handling", "information-disclosure"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Verbose production errors leak implementation details. They may reveal secrets, framework versions, database schema, internal paths, and query structure. This primarily supports information disclosure and can help later tampering or injection attacks.",
    examKeywords: [
      "stride",
      "information disclosure",
      "stack trace",
      "error handling",
      "debug mode",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A production API runs with debug mode enabled. Invalid input sometimes returns a full stack trace including file paths, SQL queries, framework versions, and selected environment variables.",
        options: [
          {
            id: "S",
            label: "Spoofing",
            correct: false,
            rationale:
              "The error output does not by itself let the attacker impersonate another identity.",
          },
          {
            id: "T",
            label: "Tampering",
            correct: false,
            rationale:
              "The stack trace leaks information; it does not directly modify server state.",
          },
          {
            id: "R",
            label: "Repudiation",
            correct: false,
            rationale:
              "The issue is not primarily about denying actions or missing audit evidence.",
          },
          {
            id: "I",
            label: "Information disclosure  -  internals and secrets may leak",
            correct: true,
            rationale:
              "Stack traces and environment data can reveal sensitive implementation details or credentials.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale: "The scenario does not describe resource exhaustion.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "Leaked details may help future attacks, but no privilege escalation is directly shown.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-missing-audit-admin",
    title: "STRIDE on missing admin audit logs",
    summary:
      "Administrators can export, modify, and delete user records, but actions are not logged.",
    courseTopic: "threat-modeling",
    difficulty: "core",
    tags: ["stride", "logging", "admin", "accountability"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Missing audit logs are a classic repudiation issue. When privileged users can perform sensitive actions without tamper-resistant logs, the organization cannot reliably investigate abuse, prove what happened, or detect policy violations.",
    examKeywords: [
      "stride",
      "repudiation",
      "audit logging",
      "accountability",
      "admin actions",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A customer-support admin panel lets support agents view personal data, export CSV files, edit user records, and delete accounts. The system stores no audit log of who performed each action.",
        options: [
          {
            id: "S",
            label: "Spoofing",
            correct: false,
            rationale:
              "The scenario does not say users can impersonate each other.",
          },
          {
            id: "T",
            label: "Tampering  -  user records can be edited",
            correct: true,
            rationale:
              "Admins can modify records, so integrity of user data is in scope.",
          },
          {
            id: "R",
            label: "Repudiation  -  admins can deny sensitive actions",
            correct: true,
            rationale:
              "Without audit logs, it is hard to prove who exported, changed, or deleted data.",
          },
          {
            id: "I",
            label:
              "Information disclosure  -  personal data exports are untracked",
            correct: true,
            rationale:
              "Exporting personal data without traceability increases the impact of unauthorized disclosure.",
          },
          {
            id: "D",
            label: "Denial of service  -  account deletion can remove access",
            correct: true,
            rationale: "Deleting accounts can deny service to affected users.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "The users already have admin privileges; the problem is lack of accountability.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-rate-limit-login",
    title: "STRIDE on login without rate limiting",
    summary:
      "The login endpoint allows unlimited password guesses and returns distinct error messages.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["stride", "authentication", "brute-force"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Unlimited login attempts enable brute-force or credential-stuffing attacks. Distinct messages such as 'unknown email' and 'wrong password' also help enumerate valid accounts. Successful guessing causes spoofing because the attacker logs in as the victim.",
    examKeywords: [
      "stride",
      "spoofing",
      "rate limiting",
      "account enumeration",
      "brute force",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "A login endpoint has no rate limit, lockout, CAPTCHA, or anomaly detection. It returns 'email not found' for unknown addresses and 'wrong password' for valid addresses with an incorrect password.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  attacker may log in as a victim",
            correct: true,
            rationale:
              "Credential guessing or stuffing can let the attacker authenticate as another user.",
          },
          {
            id: "T",
            label: "Tampering",
            correct: false,
            rationale:
              "The login flow does not directly modify application data.",
          },
          {
            id: "R",
            label: "Repudiation",
            correct: false,
            rationale:
              "The primary problem is authentication abuse, not denying performed actions.",
          },
          {
            id: "I",
            label:
              "Information disclosure  -  valid accounts can be enumerated",
            correct: true,
            rationale:
              "Different error messages reveal whether an email address is registered.",
          },
          {
            id: "D",
            label: "Denial of service  -  lockouts are abused",
            correct: false,
            rationale:
              "No lockout exists in this scenario, so lockout-based DoS is not the issue.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "Logging in as a victim is spoofing; no higher role is necessarily gained.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-oauth-open-redirect",
    title: "STRIDE on OAuth open redirect",
    summary:
      "The authorization server accepts arbitrary redirect_uri values during OAuth login.",
    courseTopic: "authentication",
    difficulty: "advanced",
    tags: ["stride", "oauth", "openid-connect", "redirect"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "OAuth and OpenID Connect flows depend on strict redirect URI validation. If an attacker can register or inject an arbitrary redirect_uri, authorization codes or tokens may be sent to an attacker-controlled domain.",
    examKeywords: [
      "stride",
      "oauth",
      "redirect_uri",
      "authorization code",
      "spoofing",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "An OAuth authorization server starts login with /authorize?client_id=public-client&redirect_uri=https://evil.example/callback. The server only checks that client_id exists and does not require an exact redirect_uri match.",
        options: [
          {
            id: "S",
            label: "Spoofing  -  attacker abuses a trusted client identity",
            correct: true,
            rationale:
              "The attacker can make the authorization server treat their redirect endpoint as belonging to the legitimate client.",
          },
          {
            id: "T",
            label: "Tampering  -  redirect_uri is attacker-controlled",
            correct: true,
            rationale:
              "The attacker changes a security-critical protocol parameter.",
          },
          {
            id: "R",
            label: "Repudiation",
            correct: false,
            rationale:
              "The main issue is token/code leakage, not denial of responsibility.",
          },
          {
            id: "I",
            label:
              "Information disclosure  -  authorization code or token leaks",
            correct: true,
            rationale:
              "The authorization response may be delivered to the attacker's callback URL.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The attack is not primarily about preventing service availability.",
          },
          {
            id: "E",
            label:
              "Elevation of privilege  -  stolen token may grant user access",
            correct: true,
            rationale:
              "If the attacker redeems the code or receives a token, they may gain access as the victim.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-log-injection",
    title: "STRIDE on log injection",
    summary:
      "User-controlled username values are written directly into security logs without escaping.",
    courseTopic: "secure-development",
    difficulty: "core",
    tags: ["stride", "logging", "injection"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Logs are security-relevant records. If attackers can inject newlines or fake fields, they can tamper with evidence, hide attacks, or create misleading audit entries. This mainly affects tampering and repudiation.",
    examKeywords: [
      "stride",
      "repudiation",
      "log injection",
      "audit integrity",
      "tampering",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "The login service writes `failed login for ${username}` to a text log. The username is not escaped. An attacker submits a username containing newline characters and fake log fields such as `admin login successful`.",
        options: [
          {
            id: "S",
            label: "Spoofing",
            correct: false,
            rationale:
              "The attacker is not successfully authenticating as another user in this scenario.",
          },
          {
            id: "T",
            label: "Tampering  -  attacker modifies the meaning of logs",
            correct: true,
            rationale:
              "Injected newline characters and fake fields alter the integrity of the log record.",
          },
          {
            id: "R",
            label: "Repudiation  -  audit trail becomes unreliable",
            correct: true,
            rationale:
              "Manipulated logs make it harder to prove what actually happened.",
          },
          {
            id: "I",
            label: "Information disclosure",
            correct: false,
            rationale:
              "The issue is corrupting logs, not leaking confidential data.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale:
              "The scenario does not describe filling disks or crashing logging systems.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "Fake log entries do not directly grant higher privileges.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "stride-cors-wildcard-credentials",
    title: "STRIDE on permissive CORS with credentials",
    summary:
      "The API reflects Origin and allows credentialed cross-origin requests.",
    courseTopic: "web-vulnerabilities",
    difficulty: "advanced",
    tags: ["stride", "cors", "browser-security"],
    vulnerableLines: [],
    vulnerabilityType: "Threat Modeling  -  STRIDE",
    fixOptions: [],
    explanation:
      "Permissive CORS with credentials can let an attacker-controlled website read authenticated API responses from a victim's browser. Unlike CSRF, the attacker may get the response body, making information disclosure central.",
    examKeywords: [
      "stride",
      "cors",
      "credentials",
      "same-origin policy",
      "information disclosure",
    ],
    supportedModes: STRIDE_ONLY,
    modeData: {
      stride: {
        scenario:
          "An API reflects any Origin header into Access-Control-Allow-Origin and also sets Access-Control-Allow-Credentials: true. A victim logged into the service visits attacker.example, whose JavaScript fetches https://api.example/profile with credentials included.",
        options: [
          {
            id: "S",
            label: "Spoofing",
            correct: false,
            rationale:
              "The attacker is not impersonating the victim to the server; the victim's browser sends the real session.",
          },
          {
            id: "T",
            label: "Tampering",
            correct: false,
            rationale:
              "The scenario focuses on reading authenticated responses, not modifying data.",
          },
          {
            id: "R",
            label: "Repudiation",
            correct: false,
            rationale: "Audit denial is not the central failure.",
          },
          {
            id: "I",
            label:
              "Information disclosure  -  attacker reads authenticated API data",
            correct: true,
            rationale:
              "Credentialed CORS allows the attacker's origin to read responses meant only for the trusted frontend.",
          },
          {
            id: "D",
            label: "Denial of service",
            correct: false,
            rationale: "No service disruption is described.",
          },
          {
            id: "E",
            label: "Elevation of privilege",
            correct: false,
            rationale:
              "The attacker reads victim data but does not gain a higher role.",
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
    filename: "ecb_encrypt.py",
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
    filename: "password_store.js",
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
    filename: "cbc_encrypt.go",
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
  buildChallenge({
    id: "cmis-aes-gcm-static-nonce",
    title: "Misuses: AES-GCM with a static nonce",
    summary:
      "An API encrypts secrets with AES-GCM but reuses the same nonce every time.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["aes", "gcm", "nonce"],
    language: "javascript",
    filename: "gcm_encrypt.js",
    code: `const key = Buffer.from("00112233445566778899aabbccddeeff", "hex");
const nonce = Buffer.alloc(12, 0);
const cipher = crypto.createCipheriv("aes-128-gcm", key, nonce);
const ct = Buffer.concat([cipher.update(secret), cipher.final()]);
return ct.toString("hex");`,
    vulnerableLines: [1, 2, 3, 5],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "GCM requires a unique nonce for each encryption under the same key. Reusing a nonce can reveal plaintext relationships and break authentication. The key is also hardcoded, and the authentication tag is not returned.",
    examKeywords: ["gcm", "nonce reuse", "hardcoded key", "authentication tag"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "static-nonce",
            label: "AES-GCM nonce is static and reused",
            correct: true,
            rationale:
              "GCM security depends on never reusing the same nonce with the same key.",
          },
          {
            id: "hardcoded-key",
            label: "Encryption key is hardcoded",
            correct: true,
            rationale:
              "Keys in source code can leak through repositories, logs, backups, and builds.",
          },
          {
            id: "missing-tag",
            label: "Authentication tag is not stored or returned",
            correct: true,
            rationale:
              "Without the GCM tag, the receiver cannot verify ciphertext integrity.",
          },
          {
            id: "nonce-length",
            label: "The nonce length is invalid for GCM",
            correct: false,
            rationale:
              "A 12-byte nonce is the recommended size for GCM; reuse is the problem.",
          },
          {
            id: "aes-128",
            label: "AES-128 is automatically insecure",
            correct: false,
            rationale:
              "AES-128 is still considered secure when used correctly.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-aes-ctr-reused-nonce",
    title: "Misuses: AES-CTR with a reused nonce",
    summary:
      "A file encryption helper uses AES-CTR with a zero nonce and no integrity check.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["aes", "ctr", "nonce"],
    language: "go",
    filename: "ctr_encrypt.go",
    code: `nonce := make([]byte, aes.BlockSize)
stream := cipher.NewCTR(block, nonce)
ciphertext := make([]byte, len(plaintext))
stream.XORKeyStream(ciphertext, plaintext)`,
    vulnerableLines: [1, 2, 4],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "CTR mode turns a block cipher into a stream cipher. Reusing the nonce/key pair reuses the keystream, so XORing ciphertexts can reveal plaintext relationships. CTR also provides no integrity protection by itself.",
    examKeywords: [
      "ctr",
      "nonce reuse",
      "stream cipher",
      "integrity",
      "malleability",
    ],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "reused-nonce",
            label: "CTR nonce/counter value is reused",
            correct: true,
            rationale:
              "Reusing a CTR keystream leaks information about the plaintexts.",
          },
          {
            id: "no-integrity",
            label: "No MAC or AEAD integrity protection",
            correct: true,
            rationale:
              "CTR encryption is malleable unless combined with authentication.",
          },
          {
            id: "wrong-block-size",
            label: "AES block size is wrong",
            correct: false,
            rationale: "aes.BlockSize is the correct block size constant.",
          },
          {
            id: "wrong-api",
            label: "XORKeyStream is never used with CTR",
            correct: false,
            rationale:
              "XORKeyStream is the normal API for stream-style encryption in Go.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-reset-token-math-random",
    title: "Misuses: Predictable password reset token",
    summary:
      "A password reset flow generates security tokens using Math.random().",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["randomness", "tokens"],
    language: "javascript",
    filename: "reset_token.js",
    code: `function makeResetToken(userId) {
  const token = Math.random().toString(36).slice(2);
  db.resetTokens.insert({ userId, token });
  return token;
}`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "Password reset tokens must be generated with a cryptographically secure random number generator, have sufficient entropy, and should expire after a short time.",
    examKeywords: ["secure randomness", "entropy", "reset token", "expiration"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "math-random",
            label: "Uses non-cryptographic randomness",
            correct: true,
            rationale:
              "Math.random() is not suitable for secrets such as reset tokens.",
          },
          {
            id: "low-entropy",
            label: "Token may have insufficient entropy",
            correct: true,
            rationale:
              "Short random-looking strings can be brute-forced if the entropy is too low.",
          },
          {
            id: "no-expiry",
            label: "No expiry time is stored",
            correct: true,
            rationale:
              "Reset tokens should be short-lived to limit damage if leaked.",
          },
          {
            id: "base36",
            label: "Base36 encoding is always insecure",
            correct: false,
            rationale:
              "Encoding is not the main issue; the randomness source and lifecycle are.",
          },
          {
            id: "userid",
            label:
              "Including userId in the database row is the cryptographic flaw",
            correct: false,
            rationale:
              "The token needs to be associated with a user; the weak token generation is the flaw.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-pbkdf2-weak-params",
    title: "Misuses: PBKDF2 with weak parameters",
    summary:
      "A login service hashes passwords with PBKDF2 but uses a fixed salt and tiny work factor.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["password-hashing", "pbkdf2"],
    language: "python",
    filename: "pbkdf2_hash.py",
    code: `SALT = b"company-wide-salt"
digest = hashlib.pbkdf2_hmac("sha1", password.encode(), SALT, 1000)
users.insert({"username": username, "pw": digest.hex()})`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "PBKDF2 is a password KDF, but it must use a unique per-password salt and a sufficiently high work factor. SHA-1 inside PBKDF2 is not the main issue here; the fixed salt and low iterations are.",
    examKeywords: ["pbkdf2", "salt", "work factor", "password hashing"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "fixed-salt",
            label: "Uses one fixed salt for all users",
            correct: true,
            rationale: "Each password hash should have its own random salt.",
          },
          {
            id: "low-iterations",
            label: "Work factor is too low",
            correct: true,
            rationale: "A low iteration count makes offline guessing cheaper.",
          },
          {
            id: "no-memory-hardness",
            label: "Does not use a memory-hard password hash",
            correct: true,
            rationale:
              "Argon2id or scrypt is usually preferred for password storage.",
          },
          {
            id: "hex-storage",
            label: "Storing the digest as hex is the vulnerability",
            correct: false,
            rationale:
              "Hex encoding is acceptable; the KDF parameters are weak.",
          },
          {
            id: "pbkdf2-always-broken",
            label: "PBKDF2 can never be used for passwords",
            correct: false,
            rationale:
              "PBKDF2 can be acceptable with strong parameters, although Argon2id is preferred.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-sha256-secret-prefix-mac",
    title: "Misuses: Homemade MAC with SHA-256",
    summary: "An API signs payment parameters using SHA256(secret || message).",
    courseTopic: "cryptography",
    difficulty: "advanced",
    tags: ["mac", "hashing"],
    language: "python",
    filename: "mac.py",
    code: `def sign(message: bytes) -> str:
    return hashlib.sha256(SECRET + message).hexdigest()

def verify(message: bytes, sig: str) -> bool:
    return sign(message) == sig`,
    vulnerableLines: [2, 5],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "Do not build a MAC by concatenating a secret and hashing. Use HMAC. The comparison may also leak timing information; use a constant-time comparison function.",
    examKeywords: ["hmac", "length extension", "constant-time compare"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "homemade-mac",
            label: "Uses a homemade MAC instead of HMAC",
            correct: true,
            rationale:
              "Hashing SECRET || message is not a safe substitute for HMAC.",
          },
          {
            id: "timing-compare",
            label: "Signature comparison may leak timing information",
            correct: true,
            rationale:
              "Use a constant-time comparison such as hmac.compare_digest.",
          },
          {
            id: "sha256-broken",
            label: "SHA-256 is collision-broken",
            correct: false,
            rationale:
              "SHA-256 is not considered collision-broken; the construction is wrong.",
          },
          {
            id: "hex-wrong",
            label: "Hex signatures are invalid",
            correct: false,
            rationale:
              "Hex encoding is fine; the MAC construction and comparison are the issues.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-rsa-no-padding",
    title: "Misuses: RSA encryption without padding",
    summary:
      "A service encrypts session keys using raw RSA without OAEP padding.",
    courseTopic: "cryptography",
    difficulty: "advanced",
    tags: ["rsa", "padding"],
    language: "java",
    filename: "RsaCrypto.java",
    code: `Cipher cipher = Cipher.getInstance("RSA/ECB/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, publicKey);
byte[] wrapped = cipher.doFinal(sessionKey);`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "Raw RSA is deterministic and lacks the padding needed for secure public-key encryption. Use RSA-OAEP or, preferably, a well-reviewed hybrid encryption scheme.",
    examKeywords: ["rsa", "padding", "oaep", "deterministic encryption"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "no-padding",
            label: "RSA is used without secure padding",
            correct: true,
            rationale:
              "Raw RSA encryption is deterministic and vulnerable to several attacks.",
          },
          {
            id: "not-oaep",
            label: "Does not use OAEP for RSA encryption",
            correct: true,
            rationale: "OAEP is the standard padding mode for RSA encryption.",
          },
          {
            id: "public-key-encrypt",
            label: "Encrypting with the recipient public key is always wrong",
            correct: false,
            rationale:
              "Public-key encryption normally encrypts with the recipient's public key.",
          },
          {
            id: "ecb-name",
            label: "The string contains ECB, so this is AES-ECB",
            correct: false,
            rationale:
              "For RSA in Java, the ECB part is a historical provider naming artifact.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-tls-disable-verification",
    title: "Misuses: TLS certificate verification disabled",
    summary:
      "A microservice client disables TLS verification to fix a staging error.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["tls", "certificates"],
    language: "python",
    filename: "http_client.py",
    code: `resp = requests.post(
    "https://payments.internal/api/charge",
    json=payload,
    verify=False,
)`,
    vulnerableLines: [1, 2, 4],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "Disabling certificate verification removes server authentication and enables man-in-the-middle attacks. The fix is to configure trusted certificates correctly, not to disable verification.",
    examKeywords: [
      "tls",
      "certificate validation",
      "mitm",
      "server authentication",
    ],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "verify-false",
            label: "TLS certificate verification is disabled",
            correct: true,
            rationale:
              "The client no longer verifies that it is talking to the real server.",
          },
          {
            id: "mitm",
            label: "Enables man-in-the-middle attacks",
            correct: true,
            rationale:
              "An attacker with network position can present their own certificate.",
          },
          {
            id: "https",
            label: "HTTPS is always insecure for internal services",
            correct: false,
            rationale:
              "HTTPS is appropriate; disabling verification is the problem.",
          },
          {
            id: "json",
            label: "Sending JSON over TLS is a cryptographic misuse",
            correct: false,
            rationale: "The payload format is not the issue.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-otp-key-reuse",
    title: "Misuses: One-time pad key reuse",
    summary:
      "A toy messaging app XORs messages with the same one-time pad key.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["otp", "xor"],
    language: "python",
    filename: "otp.py",
    code: `PAD = load_key("pad.bin")

def encrypt(msg: bytes) -> bytes:
    return bytes(m ^ PAD[i] for i, m in enumerate(msg))`,
    vulnerableLines: [1, 4],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "A one-time pad is only secure if the key is truly random, as long as the message, and never reused. Reusing the pad lets attackers XOR ciphertexts to obtain the XOR of plaintexts. OTP also does not provide integrity.",
    examKeywords: ["one-time pad", "xor", "key reuse", "integrity"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "pad-reuse",
            label: "The one-time pad key is reused",
            correct: true,
            rationale: "The same PAD is loaded and used for multiple messages.",
          },
          {
            id: "no-integrity",
            label: "No integrity protection",
            correct: true,
            rationale:
              "An attacker can flip ciphertext bits and predictably alter plaintext bits.",
          },
          {
            id: "xor-never-used",
            label: "XOR is not part of OTP encryption",
            correct: false,
            rationale: "OTP encryption is normally implemented with XOR.",
          },
          {
            id: "private-key-needed",
            label: "OTP requires a public/private key pair",
            correct: false,
            rationale:
              "OTP is symmetric; sender and receiver share the same pad.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-des-legacy-cipher",
    title: "Misuses: DES for database field encryption",
    summary: "A legacy service encrypts national ID numbers using DES-CBC.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["des", "cbc"],
    language: "java",
    filename: "DbFieldCrypto.java",
    code: `SecretKeySpec key = new SecretKeySpec(rawKey, "DES");
Cipher c = Cipher.getInstance("DES/CBC/PKCS5Padding");
c.init(Cipher.ENCRYPT_MODE, key, iv);
byte[] ct = c.doFinal(nationalId.getBytes(StandardCharsets.UTF_8));`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "DES has an obsolete 56-bit key size and should not be used. CBC also needs unpredictable IVs and separate integrity protection. Prefer an AEAD mode such as AES-GCM or ChaCha20-Poly1305.",
    examKeywords: ["des", "key length", "cbc", "aead", "integrity"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "des",
            label: "DES is obsolete and has a too-small key",
            correct: true,
            rationale:
              "DES has only a 56-bit effective key and is not suitable for modern systems.",
          },
          {
            id: "cbc-no-integrity",
            label: "CBC provides no integrity by itself",
            correct: true,
            rationale:
              "CBC encryption should be authenticated or replaced by an AEAD mode.",
          },
          {
            id: "iv-requirements",
            label: "CBC requires correct IV handling",
            correct: true,
            rationale:
              "CBC IVs must be unpredictable and unique for secure encryption.",
          },
          {
            id: "pkcs5",
            label: "PKCS5Padding is the main vulnerability",
            correct: false,
            rationale:
              "Padding is not the main issue; DES and unauthenticated CBC are.",
          },
          {
            id: "utf8",
            label: "UTF-8 encoding makes encryption insecure",
            correct: false,
            rationale: "UTF-8 encoding is not a cryptographic vulnerability.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-sha1-signatures",
    title: "Misuses: SHA-1 in digital signatures",
    summary:
      "A document signing service still signs contracts using SHA1withRSA.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["signatures", "sha1"],
    language: "java",
    filename: "Sign.java",
    code: `Signature sig = Signature.getInstance("SHA1withRSA");
sig.initSign(privateKey);
sig.update(documentBytes);
byte[] signature = sig.sign();`,
    vulnerableLines: [1, 4],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "SHA-1 is collision-broken and should not be used for digital signatures. Use modern signature schemes or hash functions, such as RSA-PSS with SHA-256 or Ed25519.",
    examKeywords: ["digital signature", "sha1", "collision", "rsa-pss"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "sha1",
            label: "SHA-1 is inappropriate for signatures",
            correct: true,
            rationale:
              "Collision attacks undermine the security expected from document signatures.",
          },
          {
            id: "legacy-padding",
            label: "Uses legacy RSA signature construction instead of RSA-PSS",
            correct: true,
            rationale:
              "RSA-PSS with SHA-256 is preferred over older PKCS#1 v1.5-style signatures.",
          },
          {
            id: "private-sign",
            label: "Signing with a private key is wrong",
            correct: false,
            rationale:
              "Digital signatures are created with the private key and verified with the public key.",
          },
          {
            id: "update-call",
            label: "Calling update before sign is invalid",
            correct: false,
            rationale:
              "The update-then-sign flow is normal for Java Signature.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-chacha20-fixed-nonce",
    title: "Misuses: ChaCha20 with a fixed nonce",
    summary:
      "A service encrypts event payloads with ChaCha20 but hardcodes the nonce.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["chacha20", "nonce", "stream-cipher"],
    language: "python",
    filename: "chacha_encrypt.py",
    code: `key = base64.b64decode(os.environ["EVENT_KEY"])
nonce = b"0000000000000000"
algorithm = algorithms.ChaCha20(key, nonce)
cipher = Cipher(algorithm, mode=None)
ct = cipher.encryptor().update(event_json)`,
    vulnerableLines: [2, 3, 5],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "ChaCha20 is a stream cipher. Reusing a nonce with the same key reuses the keystream. Plain ChaCha20 also does not authenticate the ciphertext; use ChaCha20-Poly1305.",
    examKeywords: ["chacha20", "nonce reuse", "stream cipher", "aead"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "fixed-nonce",
            label: "Nonce is fixed and reused",
            correct: true,
            rationale:
              "Stream ciphers must never reuse the same keystream under the same key.",
          },
          {
            id: "no-authentication",
            label: "Plain ChaCha20 provides no authentication",
            correct: true,
            rationale:
              "Use ChaCha20-Poly1305 to get confidentiality and integrity.",
          },
          {
            id: "env-key",
            label: "Loading a key from an environment variable is always wrong",
            correct: false,
            rationale:
              "Environment-based key loading can be acceptable depending on deployment; the nonce and lack of AEAD are the main issues.",
          },
          {
            id: "base64",
            label: "Base64 decoding weakens the key",
            correct: false,
            rationale:
              "Base64 is only an encoding, not a cryptographic transformation.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-md5-file-integrity",
    title: "Misuses: MD5 for file integrity",
    summary:
      "A download service publishes MD5 hashes as the only integrity protection.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["md5", "integrity"],
    language: "python",
    filename: "checksum.py",
    code: `def checksum(path):
    data = open(path, "rb").read()
    return hashlib.md5(data).hexdigest()

published_hash = checksum("installer.exe")`,
    vulnerableLines: [3, 5],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "MD5 is collision-broken and should not be used for security integrity checks. A plain hash also does not prove authenticity; use a digital signature or authenticated update mechanism.",
    examKeywords: [
      "md5",
      "collision",
      "integrity",
      "authenticity",
      "signature",
    ],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "md5",
            label: "MD5 is collision-broken",
            correct: true,
            rationale:
              "Attackers may be able to craft different files with the same MD5 hash.",
          },
          {
            id: "no-authenticity",
            label: "A plain hash does not authenticate the publisher",
            correct: true,
            rationale:
              "Anyone who can replace the file may also replace the hash.",
          },
          {
            id: "read-binary",
            label: "Reading the file in binary mode is insecure",
            correct: false,
            rationale: "Binary mode is correct for hashing files.",
          },
          {
            id: "hex",
            label: "Digest output should not be hex encoded",
            correct: false,
            rationale:
              "Hex encoding is fine; the algorithm and trust model are wrong.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "cmis-jwt-hardcoded-hmac-secret",
    title: "Misuses: JWT signed with hardcoded weak secret",
    summary:
      "An API signs admin JWTs using HS256 with a short hardcoded secret.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["jwt", "hmac", "secrets"],
    language: "javascript",
    filename: "jwt_config.js",
    code: `const JWT_SECRET = "secret";
function issueAdminToken(user) {
  return jwt.sign({ sub: user.id, role: "admin" }, JWT_SECRET, {
    algorithm: "HS256",
  });
}`,
    vulnerableLines: [1, 3, 4],
    vulnerabilityType: "Multiple crypto misuses",
    fixOptions: [],
    explanation:
      "HS256 requires a strong unpredictable secret. A short hardcoded secret can be guessed or leaked from source code, allowing attackers to forge tokens.",
    examKeywords: ["jwt", "hmac", "hardcoded secret", "token forgery"],
    supportedModes: CRYPTO_MISUSE_ONLY,
    modeData: {
      cryptoMisuse: {
        question: "Select every misuse.",
        options: [
          {
            id: "weak-secret",
            label: "HMAC secret is weak and guessable",
            correct: true,
            rationale:
              "The string 'secret' is far too weak for signing security tokens.",
          },
          {
            id: "hardcoded-secret",
            label: "Signing secret is hardcoded",
            correct: true,
            rationale:
              "Secrets in source code often leak through repositories and deployment artifacts.",
          },
          {
            id: "token-forgery",
            label: "Attackers may forge JWTs if the secret is recovered",
            correct: true,
            rationale:
              "With the HMAC secret, an attacker can create valid-looking signed tokens.",
          },
          {
            id: "hs256-always-broken",
            label: "HS256 is always insecure",
            correct: false,
            rationale:
              "HS256 can be secure with a strong secret and correct verification.",
          },
          {
            id: "jwt-json",
            label: "JWT payloads cannot contain JSON",
            correct: false,
            rationale:
              "JWT payloads are JSON claims; the signing key management is the issue.",
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
    filename: "LoginService.java",
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
    filename: "orders.py",
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
