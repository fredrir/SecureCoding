import type { Challenge } from "@/domain/challenge";
import { buildChallenge, fix } from "../builder";

export const webVulnerabilityChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "web-xss-reflected-search",
    title: "Reflected XSS in search results",
    summary:
      "An Express handler echoes a query parameter back into HTML without escaping.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["xss", "express"],
    language: "javascript",
    code: `app.get("/search", (req, res) => {
  const q = req.query.q;
  res.send(
    "<h1>Results for " + q + "</h1>" +
    "<ul>" + renderResults(q) + "</ul>"
  );
});`,
    vulnerableLines: [2, 4],
    vulnerabilityType: "Reflected Cross-Site Scripting",
    fixOptions: [
      fix(
        "escape",
        "Escape the user input before insertion",
        "Encoding HTML special characters neutralises the payload before the browser parses it as markup.",
        {
          code: `const safe = escapeHtml(req.query.q);
res.send(\`<h1>Results for \${safe}</h1>\`);`,
        },
      ),
      fix(
        "blacklist",
        "Strip the literal string '<script>'",
        "Blacklists are trivially bypassed (e.g. <Script>, <ScRiPt>, event-handler attributes, SVG onload).",
        { tempting: true },
      ),
      fix(
        "client-strip",
        "Sanitise on the client with regex before display",
        "Output encoding must happen on the server. Client-only filtering does not protect users who never run that script.",
        { tempting: true },
      ),
      fix(
        "csp-only",
        "Add a Content-Security-Policy header and ship as is",
        "CSP is defence in depth, not a substitute for output encoding. Inline reflection still breaks an open policy.",
      ),
    ],
    correctFixId: "escape",
    explanation:
      "The handler concatenates `req.query.q` into the response without HTML-encoding it. An attacker can send a link such as `/search?q=<script>fetch('/steal',{method:'POST',body:document.cookie})</script>`. Because the response sets no CSP and includes the payload verbatim, the browser executes it in the victim's origin. The robust mitigation is contextual output encoding at the point of insertion (HTML-escape the value before placing it in HTML).",
    examKeywords: [
      "reflected",
      "encoding",
      "escape",
      "context",
      "untrusted input",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-01",
    modeData: {
      multipleChoice: {
        question:
          "Which mitigation reliably stops reflected XSS in this handler?",
        options: [
          {
            id: "a",
            text: "Contextual HTML-encoding of the query value at output time.",
            correct: true,
            rationale:
              "Encoding the value where it is inserted into HTML neutralises the payload regardless of how cleverly it is crafted.",
          },
          {
            id: "b",
            text: "Reject queries containing the substring '<script>'.",
            correct: false,
            rationale:
              "Blacklists are bypassed by case folding, attribute-based payloads, or SVG/MathML tags.",
          },
          {
            id: "c",
            text: "Filter the input on the client with a regex before submitting.",
            correct: false,
            rationale:
              "An attacker controls their own client and can send any request directly.",
          },
          {
            id: "d",
            text: "Set HttpOnly on the session cookie.",
            correct: false,
            rationale:
              "HttpOnly only stops cookie theft via JS; the XSS itself still runs.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-xss-stored-comment",
    title: "Stored XSS in comments",
    summary:
      "A React-rendered comment widget uses `dangerouslySetInnerHTML` for plain-text content.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["xss", "react"],
    language: "javascript",
    code: `function Comment({ comment }) {
  return (
    <div className="comment">
      <strong>{comment.author}</strong>
      <div dangerouslySetInnerHTML={{ __html: comment.body }} />
    </div>
  );
}`,
    vulnerableLines: [5],
    vulnerabilityType: "Stored Cross-Site Scripting",
    fixOptions: [
      fix(
        "render-text",
        "Render the body as text, not HTML",
        "React escapes children by default. Removing `dangerouslySetInnerHTML` and rendering `{comment.body}` is sufficient when the body is plain text.",
        { code: `<div>{comment.body}</div>` },
      ),
      fix(
        "sanitise",
        "Run the HTML through an allow-list sanitiser (e.g. DOMPurify) if HTML is needed",
        "If the product genuinely needs rich text, sanitise with a vetted library that uses a strict allow-list of tags and attributes.",
      ),
      fix(
        "strip-script",
        "Strip <script> tags server-side before saving",
        "Stored XSS does not require <script>. `<img src=x onerror=...>`, `<iframe srcdoc>`, and event handlers all work.",
        { tempting: true },
      ),
      fix(
        "encode-display",
        "Escape only when the comment contains '<' characters",
        "Conditional escaping is fragile. Always encode untrusted content for the output context.",
        { tempting: true },
      ),
    ],
    correctFixId: "render-text",
    explanation:
      "`dangerouslySetInnerHTML` bypasses React's automatic escaping. Any payload an attacker stores becomes live HTML for every viewer (stored XSS). If the field is a plain comment, render it as a child node so React encodes it. If rich text is genuinely required, run it through an allow-list sanitiser at render time and never store untrusted HTML directly.",
    examKeywords: [
      "stored",
      "dangerouslysetinnerhtml",
      "sanitisation",
      "allow-list",
      "react escapes",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-02",
    modeData: {
      multipleChoice: {
        question:
          "What is the safest default for displaying user-submitted comments in React?",
        options: [
          {
            id: "a",
            text: "Render the value as a child node so React encodes it.",
            correct: true,
            rationale:
              "React encodes children automatically; `dangerouslySetInnerHTML` opts out of that protection.",
          },
          {
            id: "b",
            text: "Server-side strip of `<script>` tags before persisting.",
            correct: false,
            rationale:
              "XSS payloads do not require `<script>` tags; `onerror` handlers, `<iframe srcdoc>`, etc. work fine.",
          },
          {
            id: "c",
            text: "Set the body as innerHTML after escaping quotes.",
            correct: false,
            rationale:
              "Quote escaping is the wrong context; attribute escaping ≠ HTML escaping.",
          },
          {
            id: "d",
            text: "Add `rel=noopener` to anchors.",
            correct: false,
            rationale: "Unrelated to XSS.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-xss-dom-redirect",
    title: "DOM XSS via location.hash",
    summary:
      "A welcome banner reads a value from the URL fragment and writes it into the DOM.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["xss", "dom"],
    language: "javascript",
    code: `const banner = document.getElementById("banner");
const name = decodeURIComponent(location.hash.slice(1));
banner.innerHTML = "Welcome back, " + name + "!";`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "DOM-based Cross-Site Scripting",
    fixOptions: [
      fix(
        "textcontent",
        "Use textContent and treat the value as text",
        "`textContent` writes the string verbatim, never as markup. Ideal when the content is plain text.",
        { code: `banner.textContent = "Welcome back, " + name + "!";` },
      ),
      fix(
        "trusted-types",
        "Adopt Trusted Types and reject untrusted strings sinking into innerHTML",
        "Trusted Types makes the dangerous sink unreachable for raw strings.",
      ),
      fix(
        "regex-allow",
        "Allow only [A-Za-z] in the hash and continue using innerHTML",
        "Restricting characters helps but innerHTML on user input remains a fragile invariant; one regex change re-opens the bug.",
        { tempting: true },
      ),
      fix(
        "csp-strict",
        "Set a strict Content-Security-Policy and keep innerHTML",
        "CSP blocks inline scripts but does not block injected DOM nodes (event handlers, link rel, etc.).",
        { tempting: true },
      ),
    ],
    correctFixId: "textcontent",
    explanation:
      "DOM XSS happens entirely in the browser: the source is `location.hash` and the sink is `innerHTML`. Choosing the right sink (`textContent`) eliminates the issue. Trusted Types is the strongest defence at scale because it makes risky sinks unreachable for untrusted strings.",
    examKeywords: [
      "dom xss",
      "source",
      "sink",
      "innerHTML",
      "textContent",
      "trusted types",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-01",
  }),

  buildChallenge({
    id: "web-sqli-login",
    title: "SQL injection in a login query",
    summary:
      "A Java JDBC handler builds a SQL string by concatenating credentials from the request.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["sqli", "java"],
    language: "java",
    code: `public User login(String username, String password) {
  String sql = "SELECT * FROM users WHERE username = '" + username +
               "' AND password = '" + password + "'";
  Statement st = conn.createStatement();
  ResultSet rs = st.executeQuery(sql);
  if (rs.next()) return User.from(rs);
  return null;
}`,
    vulnerableLines: [2, 3, 4, 5],
    vulnerabilityType: "SQL Injection",
    fixOptions: [
      fix(
        "prepared",
        "Use a prepared statement with bound parameters",
        "Prepared statements separate code from data: the query text is parsed once, parameters are values only.",
        {
          code: `PreparedStatement ps = conn.prepareStatement(
  "SELECT * FROM users WHERE username = ? AND password_hash = ?");
ps.setString(1, username);
ps.setString(2, hash(password));`,
        },
      ),
      fix(
        "escape-quotes",
        "Replace single quotes in the inputs with two single quotes",
        "Manual escaping breaks for non-string contexts and is brittle. Use parameterised queries.",
        { tempting: true },
      ),
      fix(
        "stored-proc",
        "Wrap the same string concatenation in a stored procedure",
        "If the procedure body still concatenates, you have moved the injection, not removed it.",
        { tempting: true },
      ),
      fix(
        "deny-special",
        "Reject inputs containing semicolons, quotes, or '--'",
        "Input filtering misses many payloads (boolean-based, time-based, comments inside strings) and breaks legitimate input.",
      ),
    ],
    correctFixId: "prepared",
    explanation:
      "The query is built by string concatenation, so any quote in the input changes the SQL grammar. A username such as `' OR '1'='1` collapses the WHERE clause and authenticates as the first user. Prepared statements bind parameters at the protocol layer, so the user data never participates in parsing. Storing only password hashes is a separate but essential second control.",
    examKeywords: [
      "prepared statement",
      "parameterised",
      "concatenation",
      "bind",
      "injection",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-05",
    modeData: {
      multipleChoice: {
        question: "Why does input filtering fail to stop SQL injection?",
        options: [
          {
            id: "a",
            text: "Many payloads avoid the filtered tokens (boolean tricks, encoding, comments).",
            correct: true,
            rationale:
              "SQLi has many shapes; only structural separation of code and data via parameters is reliable.",
          },
          {
            id: "b",
            text: "Modern databases ignore SQL comments.",
            correct: false,
            rationale: "They don't.",
          },
          {
            id: "c",
            text: "It is fast enough but does not log attacks.",
            correct: false,
            rationale: "Logging is unrelated to the failure mode.",
          },
          {
            id: "d",
            text: "Filters break performance under load.",
            correct: false,
            rationale: "Performance is not the security concern.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-sqli-orderby",
    title: "Tainted ORDER BY clause",
    summary:
      "A reporting endpoint accepts a `sort` query parameter and uses it directly in an ORDER BY clause.",
    courseTopic: "web-vulnerabilities",
    difficulty: "advanced",
    tags: ["sqli", "node", "order-by"],
    language: "typescript",
    code: `app.get("/reports", async (req, res) => {
  const sort = req.query.sort as string;
  const rows = await db.query(
    \`SELECT id, total FROM reports ORDER BY \${sort}\`
  );
  res.json(rows);
});`,
    vulnerableLines: [2, 3, 4],
    vulnerabilityType: "SQL Injection (identifier)",
    fixOptions: [
      fix(
        "allow-list",
        "Map the `sort` parameter to an allow-list of column names",
        "Identifiers cannot be parameterised in standard SQL; they must be validated against a fixed set of known-safe columns.",
        {
          code: `const ALLOWED = { id: "id", total: "total", date: "created_at" } as const;
const col = ALLOWED[req.query.sort as keyof typeof ALLOWED] ?? "id";`,
        },
      ),
      fix(
        "escape-id",
        "Escape the identifier with backticks",
        "Identifier escaping varies per database and does not stop injection of valid columns or comma-separated terms (e.g. `total; DROP TABLE`).",
        { tempting: true },
      ),
      fix(
        "param-bind",
        "Bind the column name with `db.query(..., [sort])`",
        "Parameter binding is for values, not identifiers; most drivers will treat the column name as a literal string.",
        { tempting: true },
      ),
      fix(
        "regex",
        "Allow only `[a-zA-Z_]+` in the sort parameter",
        "A loose regex still permits any column name in the schema, including ones the user shouldn't be able to sort by.",
      ),
    ],
    correctFixId: "allow-list",
    explanation:
      "Standard SQL parameter binding only works for values, not for identifiers like column or table names. A sort parameter that lands in ORDER BY needs an explicit allow-list mapping the user's input to a known-safe column. Without it, attackers can inject SQL fragments such as `1; DROP TABLE reports --` or use blind techniques (`(CASE WHEN ...)` ordering) to exfiltrate data.",
    examKeywords: [
      "allow-list",
      "identifier",
      "order by",
      "parameter binding",
      "injection",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-05",
  }),

  buildChallenge({
    id: "web-idor-orders",
    title: "IDOR: orders endpoint trusts the URL id",
    summary:
      "An order detail endpoint loads any order id passed in the URL without an ownership check.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["idor", "authz"],
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
    fixOptions: [
      fix(
        "ownership",
        "Filter by the current user when loading the order",
        "Authorisation must be enforced server-side using the authenticated identity, not the URL id.",
        {
          code: `order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
if order is None:
    abort(404)`,
        },
      ),
      fix(
        "uuid",
        "Switch numeric ids to long random UUIDs",
        "Unguessable ids are defence in depth at best; the access-control bug is unfixed and a leaked link still exposes data.",
        { tempting: true },
      ),
      fix(
        "client-hide",
        "Hide other users' order ids from the UI",
        "Hiding URLs in the UI does not stop a direct request. Authorisation must be on the server.",
        { tempting: true },
      ),
      fix(
        "rate-limit",
        "Add a rate limit on the endpoint",
        "Rate-limiting reduces enumeration cost but does not stop a single targeted access.",
      ),
    ],
    correctFixId: "ownership",
    explanation:
      "The handler authenticates the caller (login required) but never authorises the lookup. Anyone with a valid session can iterate `order_id` values and read other users' orders. The fix is to scope the database query by the authenticated user id (object-level authorisation). Long ids are not a substitute; the door is still unlocked, just harder to find.",
    examKeywords: [
      "object-level",
      "authorisation",
      "ownership",
      "idor",
      "direct reference",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-04",
    modeData: {
      multipleChoice: {
        question: "Which control actually fixes an IDOR?",
        options: [
          {
            id: "a",
            text: "Server-side authorisation that scopes the query by the caller's identity.",
            correct: true,
            rationale:
              "Object-level authorisation is the only control that works.",
          },
          {
            id: "b",
            text: "Switching to UUIDs.",
            correct: false,
            rationale:
              "Unguessable ids are obscurity, not access control. Authenticated users can still leak ids.",
          },
          {
            id: "c",
            text: "Hiding the link from the UI.",
            correct: false,
            rationale: "Direct HTTP requests bypass the UI.",
          },
          {
            id: "d",
            text: "Adding HSTS.",
            correct: false,
            rationale: "Unrelated control.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-csrf-statechange",
    title: "CSRF on a state-changing endpoint",
    summary:
      "A profile-update endpoint accepts cookie-authenticated POSTs without any anti-CSRF token.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["csrf", "express"],
    language: "javascript",
    code: `app.post("/account/email", (req, res) => {
  const userId = req.session.userId;
  Users.update(userId, { email: req.body.email });
  res.redirect("/account");
});`,
    vulnerableLines: [1, 3],
    vulnerabilityType: "Cross-Site Request Forgery",
    fixOptions: [
      fix(
        "samesite-token",
        "Require a per-session anti-CSRF token AND set the session cookie SameSite=Lax",
        "Tokens defend against POSTs originating off-site; SameSite=Lax stops most CSRF at the cookie layer.",
      ),
      fix(
        "referer",
        "Reject requests whose `Referer` header is missing or off-origin",
        "Some browsers and privacy tools strip Referer; relying on it produces both false positives and bypasses.",
        { tempting: true },
      ),
      fix(
        "captcha",
        "Add a CAPTCHA to the endpoint",
        "CAPTCHAs harden against bots, not the cross-site attack pattern.",
        { tempting: true },
      ),
      fix(
        "post-only",
        "Accept the change only over POST",
        "CSRF works fine via POST; auto-submitted forms are the standard payload.",
      ),
    ],
    correctFixId: "samesite-token",
    explanation:
      "Cookie auth means the browser sends credentials on every request, including ones initiated by malicious sites. A POST to `/account/email` from an attacker-controlled page silently changes the victim's email and lets the attacker reset the password. The standard mitigation is the synchronizer-token pattern (or the double-submit cookie), combined with SameSite=Lax (or Strict) on the session cookie.",
    examKeywords: [
      "csrf",
      "samesite",
      "token",
      "synchronizer",
      "state-changing",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-SESS-05",
  }),

  buildChallenge({
    id: "web-ssrf-thumbnail",
    title: "SSRF via image-thumbnail service",
    summary:
      "A thumbnail service fetches whatever URL the client supplies, then serves the bytes back.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["ssrf", "node"],
    language: "typescript",
    code: `app.get("/thumb", async (req, res) => {
  const url = req.query.url as string;
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  res.type("image/png").send(buf);
});`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Server-Side Request Forgery",
    fixOptions: [
      fix(
        "allow-list",
        "Resolve the URL host and reject anything not on an explicit allow-list",
        "Allow-listing combined with re-resolution defeats DNS rebinding and link-shortener tricks.",
      ),
      fix(
        "block-private",
        "Block requests to RFC1918 private ranges and the metadata IP",
        "A start, but DNS rebinding can flip a public name to an internal IP after the check. Combine with allow-listing.",
        { tempting: true },
      ),
      fix(
        "client-validate",
        "Validate the URL on the client before submitting",
        "Client-side validation is bypassable with a direct request.",
        { tempting: true },
      ),
      fix(
        "user-agent",
        "Send a custom User-Agent header",
        "Has no effect on whether the request is reachable internally.",
      ),
    ],
    correctFixId: "allow-list",
    explanation:
      "The endpoint fetches arbitrary URLs from inside the data centre. Attackers point it at `http://169.254.169.254/latest/meta-data/` to read cloud credentials, or at internal admin services. Robust mitigation is allow-listing exact hosts, re-resolving DNS to an IP, and forbidding HTTP redirects to other origins.",
    examKeywords: [
      "ssrf",
      "metadata",
      "allow-list",
      "dns rebinding",
      "private network",
    ],
    owaspTop10: "A10",
    owaspWstg: "WSTG-INPV-19",
  }),

  buildChallenge({
    id: "web-cmdi-ping",
    title: "Command injection in a ping helper",
    summary:
      "A diagnostics endpoint shells out to `ping` with the host taken from the request.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["command-injection", "python"],
    language: "python",
    code: `@app.post("/admin/ping")
def admin_ping():
    host = request.form["host"]
    out = subprocess.check_output("ping -c 1 " + host, shell=True)
    return out`,
    vulnerableLines: [3, 4],
    vulnerabilityType: "OS Command Injection",
    fixOptions: [
      fix(
        "argv",
        "Run the binary with an argument list and shell=False",
        "Passing arguments as a list and not invoking a shell removes the metacharacter parsing surface entirely.",
        {
          code: `subprocess.check_output(["ping", "-c", "1", host], shell=False)`,
        },
      ),
      fix(
        "escape-shell",
        "Escape the host with backslashes before concatenating",
        "Manual shell escaping is wrong subtly often. Avoid the shell.",
        { tempting: true },
      ),
      fix(
        "regex-host",
        "Allow only ASCII letters, digits, dot and dash, then keep `shell=True`",
        "Tighter input helps but pairs poorly with `shell=True`. Combine input validation with `shell=False`.",
      ),
      fix(
        "sudo",
        "Run the subprocess as a non-privileged user",
        "Reduces blast radius but the injection still happens; the attacker can still scan and execute as that user.",
        { tempting: true },
      ),
    ],
    correctFixId: "argv",
    explanation:
      "`shell=True` invokes `/bin/sh -c`, which parses metacharacters in the joined string. A host of `127.0.0.1; cat /etc/passwd` runs both commands. Calling the binary directly with `shell=False` and an argument list eliminates shell parsing, so user input cannot become syntax.",
    examKeywords: ["shell=true", "argv", "metacharacters", "command injection"],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-12",
    modeData: {
      multipleChoice: {
        question:
          "What's the safest way to call an external binary with user input?",
        options: [
          {
            id: "a",
            text: "Pass arguments as a list with shell=False.",
            correct: true,
            rationale: "Bypasses shell parsing entirely.",
          },
          {
            id: "b",
            text: "Quote the input with shlex.quote().",
            correct: false,
            rationale:
              "Better than nothing, but argv-style invocation with no shell is strictly safer.",
          },
          {
            id: "c",
            text: "Reject inputs with semicolons.",
            correct: false,
            rationale: "Many other metacharacters exist (&, |, $, backticks).",
          },
          {
            id: "d",
            text: "Use sudo to constrain privileges.",
            correct: false,
            rationale: "Reduces impact, doesn't fix the bug.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-fileupload-php",
    title: "Unrestricted file upload",
    summary:
      "A PHP avatar uploader trusts the client-provided file name and saves into the web root.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["file-upload", "php"],
    language: "php",
    code: `<?php
$name = $_FILES["avatar"]["name"];
$tmp  = $_FILES["avatar"]["tmp_name"];
move_uploaded_file($tmp, __DIR__ . "/uploads/" . $name);
?>`,
    vulnerableLines: [2, 3, 4],
    vulnerabilityType: "Insecure File Upload",
    fixOptions: [
      fix(
        "validate-and-rename",
        "Validate type by content, store outside the web root with a server-generated name",
        "Trusting the file name and the extension is the root cause; rename to a UUID and serve via a controller that sets headers.",
        {
          code: `$ext = match (mime_content_type($tmp)) {
  "image/jpeg" => "jpg",
  "image/png"  => "png",
  default      => throw new RuntimeException("bad type"),
};
$dst = STORAGE_DIR . "/" . bin2hex(random_bytes(16)) . "." . $ext;
move_uploaded_file($tmp, $dst);`,
        },
      ),
      fix(
        "ext-deny",
        "Reject filenames ending in .php, .phtml, .phar",
        "Apache/nginx mishandling, double extensions, and case folding still allow execution.",
        { tempting: true },
      ),
      fix(
        "content-type",
        "Trust the request `Content-Type` header",
        "The client controls the header; it is not a security signal.",
        { tempting: true },
      ),
      fix(
        "client-resize",
        "Resize the image client-side before upload",
        "Anything that runs on the client can be skipped by an attacker.",
      ),
    ],
    correctFixId: "validate-and-rename",
    explanation:
      "Storing client-supplied file names inside the web root lets an attacker upload `shell.php` and execute it on the next request. The fix has three parts: (1) determine type from content (e.g. `mime_content_type`), (2) save with a server-generated name and a fixed extension, (3) store outside the web-served directory so even mis-detection can't lead to code execution.",
    examKeywords: [
      "double extension",
      "mime sniffing",
      "rename",
      "outside web root",
      "execution",
    ],
    owaspTop10: "A04",
    owaspWstg: "WSTG-BUSL-09",
  }),

  buildChallenge({
    id: "web-cookie-session-flags",
    title: "Session cookie missing security flags",
    summary:
      "An Express session cookie is created without `Secure`, `HttpOnly`, or `SameSite` set.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["cookies", "session"],
    language: "javascript",
    code: `app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 },
}));`,
    vulnerableLines: [6],
    vulnerabilityType: "Insecure Session Cookie",
    fixOptions: [
      fix(
        "flags",
        "Set httpOnly, secure, and sameSite on the cookie config",
        "Defence in depth: HttpOnly blocks JS theft, Secure prevents leakage on HTTP, SameSite mitigates CSRF.",
        {
          code: `cookie: {
  maxAge: 1000 * 60 * 60 * 8,
  httpOnly: true,
  secure: true,
  sameSite: "lax",
}`,
        },
      ),
      fix(
        "regen-only",
        "Regenerate the id on login and logout",
        "Necessary, but unrelated to the missing flags. Both controls matter.",
        { tempting: true },
      ),
      fix(
        "store",
        "Move the secret to an environment variable",
        "It is already an env var, and that does not address cookie flags.",
      ),
      fix(
        "expiry",
        "Lower the `maxAge` to 1 hour",
        "Shorter sessions help but cookie hardening is still missing.",
      ),
    ],
    correctFixId: "flags",
    explanation:
      "Without `HttpOnly`, an XSS payload can steal the session id. Without `Secure`, the browser will leak the cookie on a downgrade to HTTP. Without `SameSite`, the cookie rides along with cross-site requests, enabling CSRF. All three flags should be the default for any session cookie; combine with regeneration on login.",
    examKeywords: ["httponly", "secure", "samesite", "session cookie"],
    owaspTop10: "A05",
    owaspWstg: "WSTG-SESS-02",
    modeData: {
      multipleChoice: {
        question:
          "Which flag prevents JavaScript from reading the session cookie?",
        options: [
          {
            id: "a",
            text: "HttpOnly",
            correct: true,
            rationale: "HttpOnly hides the cookie from `document.cookie`.",
          },
          {
            id: "b",
            text: "Secure",
            correct: false,
            rationale: "Secure restricts to HTTPS.",
          },
          {
            id: "c",
            text: "SameSite",
            correct: false,
            rationale: "SameSite controls cross-origin cookie sending.",
          },
          {
            id: "d",
            text: "Path",
            correct: false,
            rationale: "Path restricts the URL scope.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-cors-wildcard",
    title: "Permissive CORS on a private API",
    summary:
      "An internal API replies with `Access-Control-Allow-Origin: *` and reflects credentials.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["cors"],
    language: "javascript",
    code: `app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Misconfigured CORS",
    fixOptions: [
      fix(
        "allow-list",
        "Echo only an allow-listed origin and keep credentials true",
        "CORS is per-origin: the allowed origin must come from a server-side allow-list of the legitimate front-end origins.",
        {
          code: `const ALLOWED = new Set(["https://app.example.com"]);
const origin = req.headers.origin;
if (origin && ALLOWED.has(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
}`,
        },
      ),
      fix(
        "wildcard-no-creds",
        "Keep `*` but drop the credentials header",
        "Acceptable for truly public, no-credentials APIs, but the design here clearly intends to use sessions.",
        { tempting: true },
      ),
      fix(
        "reflect-origin",
        "Reflect whatever Origin the request sends back",
        "Reflection equals trusting any caller; an attacker page becomes a same-origin reader.",
        { tempting: true },
      ),
      fix(
        "preflight-only",
        "Disable preflight for simple requests",
        "Preflights are a CORS feature, not a defence; turning them off does not change which origins can read.",
      ),
    ],
    correctFixId: "allow-list",
    explanation:
      "`Allow-Origin: *` plus `Allow-Credentials: true` is a contradiction the browser refuses, but reflecting any `Origin` and credentials achieves the worst-case behaviour: any malicious page can read responses on behalf of authenticated users. The right configuration is an explicit server-side allow-list and the `Vary: Origin` header so caches don't leak responses across origins.",
    examKeywords: ["cors", "allow-origin", "credentials", "vary", "allow-list"],
    owaspTop10: "A05",
    owaspWstg: "WSTG-CLNT-07",
  }),

  buildChallenge({
    id: "web-clickjacking",
    title: "Account-deletion page lacks framing protection",
    summary:
      "A delete-account page uses cookie auth and sets no `X-Frame-Options` or CSP `frame-ancestors`.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["clickjacking", "headers"],
    language: "plaintext",
    code: `Response headers (excerpt)
HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: no-store
Set-Cookie: sid=...; Secure; HttpOnly; SameSite=Lax
# (no X-Frame-Options, no CSP frame-ancestors)`,
    vulnerableLines: [2, 3, 4, 5, 6],
    vulnerabilityType: "Clickjacking",
    fixOptions: [
      fix(
        "frame-ancestors",
        "Send `Content-Security-Policy: frame-ancestors 'none'`",
        "`frame-ancestors` is the modern, standardised replacement for X-Frame-Options.",
      ),
      fix(
        "xfo",
        "Send `X-Frame-Options: DENY`",
        "Acceptable for legacy browsers; combine with CSP for full coverage.",
        { tempting: true },
      ),
      fix(
        "frame-bust",
        "Add `if (top !== self) top.location = self.location` to the page",
        "Frame-busting JS can be defeated by sandboxed iframes that block navigation.",
        { tempting: true },
      ),
      fix(
        "double-confirm",
        "Add a confirmation dialog before deletion",
        "A click can be redirected to the dialog as easily as to the button. Defence-in-depth, not a fix.",
      ),
    ],
    correctFixId: "frame-ancestors",
    explanation:
      "Without framing protection an attacker can iframe the page, overlay decoy UI, and trick the user into clicking the delete button. CSP `frame-ancestors 'none'` is the standardised mitigation; `X-Frame-Options: DENY` is the older equivalent and is still useful for legacy clients.",
    examKeywords: [
      "clickjacking",
      "frame-ancestors",
      "x-frame-options",
      "ui redress",
    ],
    owaspTop10: "A05",
    owaspWstg: "WSTG-CLNT-09",
  }),

  buildChallenge({
    id: "web-logging-leak",
    title: "Sensitive data leaking to logs",
    summary:
      "A debug print logs the entire request body, including the password and credit-card fields.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["logging", "leak"],
    language: "python",
    code: `def handle_payment(req):
    logger.info("incoming payment: %s", req.json())
    process(req)`,
    vulnerableLines: [2],
    vulnerabilityType: "Sensitive Information Disclosure (Logging)",
    fixOptions: [
      fix(
        "redact",
        "Log only non-sensitive identifiers and redact known secrets",
        "Field-level redaction keeps logs useful without exposing PAN or passwords.",
        {
          code: `safe = {k: ("***" if k in {"password","cardNumber","cvv"} else v) for k,v in req.json().items()}
logger.info("incoming payment: %s", safe)`,
        },
      ),
      fix(
        "log-warn",
        "Lower the log level to WARNING",
        "Lowering verbosity hides the message in production but the leak is still in the code path; enabling debug for any reason re-exposes it.",
        { tempting: true },
      ),
      fix(
        "rotate-fast",
        "Shorten the log retention to 24 hours",
        "Reduces exposure window, doesn't fix the leak. Logs may also be replicated to backup systems.",
        { tempting: true },
      ),
      fix(
        "tls-only",
        "Send logs over TLS",
        "Transport encryption is unrelated to whether secrets are in the log message.",
      ),
    ],
    correctFixId: "redact",
    explanation:
      "Logging entire request bodies on payment paths is a textbook sensitive-data exposure. Logs end up in many systems (SIEM, backups, support consoles). The right fix is structured logging with explicit redaction of known sensitive fields and never logging credentials, full PAN, CVV, or session tokens.",
    examKeywords: ["redact", "pii", "leak", "logging", "sensitive data"],
    owaspTop10: "A09",
  }),

  buildChallenge({
    id: "web-sqli-login",
    title: "SQL injection in login query",
    summary:
      "A login route builds a SQL query by concatenating username and password directly into the statement.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["sql-injection", "authentication", "express"],
    language: "javascript",
    code: `app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const sql =
    "SELECT * FROM users WHERE username = '" +
    username +
    "' AND password = '" +
    password +
    "'";
  const rows = await db.query(sql);
  if (rows.length === 1) {
    req.session.userId = rows[0].id;
    res.redirect("/dashboard");
  } else {
    res.status(401).send("Invalid credentials");
  }
});`,
    vulnerableLines: [3, 4, 5, 6, 7],
    vulnerabilityType: "SQL Injection",
    fixOptions: [
      fix(
        "prepared",
        "Use parameterised queries",
        "Prepared statements separate SQL structure from user-controlled values, preventing input from changing the query logic.",
        {
          code: `const rows = await db.query(
  "SELECT * FROM users WHERE username = ? AND password_hash = ?",
  [username, passwordHash]
);`,
        },
      ),
      fix(
        "escape-quotes",
        "Replace single quotes in input",
        "Manual escaping is error-prone and database-specific. Parameterised queries are the robust defence.",
        { tempting: true },
      ),
      fix(
        "blacklist-or",
        "Reject usernames containing 'OR'",
        "Blacklists are easily bypassed with comments, encoding, case changes, or alternative SQL syntax.",
        { tempting: true },
      ),
      fix(
        "hide-errors",
        "Hide SQL error messages from users",
        "This reduces information leakage but does not stop the injection.",
      ),
    ],
    correctFixId: "prepared",
    explanation:
      "The route concatenates `username` and `password` directly into SQL. An attacker can submit input such as `' OR '1'='1` to alter the WHERE clause and bypass authentication. The correct mitigation is to use parameterised queries and to store password hashes rather than plaintext passwords.",
    examKeywords: [
      "SQL injection",
      "prepared statements",
      "parameterised query",
      "authentication bypass",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-05",
    modeData: {
      multipleChoice: {
        question:
          "Which fix best prevents SQL injection in this login handler?",
        options: [
          {
            id: "a",
            text: "Use a parameterised query with placeholders for user input.",
            correct: true,
            rationale:
              "The database treats the values as data, not executable SQL.",
          },
          {
            id: "b",
            text: "Remove single quotes from the username and password.",
            correct: false,
            rationale: "Manual filtering is incomplete and can be bypassed.",
          },
          {
            id: "c",
            text: "Return a generic login error message.",
            correct: false,
            rationale: "This is good practice but does not stop the injection.",
          },
          {
            id: "d",
            text: "Check that the username is at least six characters.",
            correct: false,
            rationale:
              "Length validation does not prevent SQL syntax injection.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-idor-profile-update",
    title: "IDOR in profile update",
    summary:
      "A user can update any profile by changing the `userId` field in the request body.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["idor", "authorization", "express"],
    language: "javascript",
    code: `app.post("/profile/update", requireLogin, async (req, res) => {
  const { userId, displayName, bio } = req.body;

  await db.users.update({
    where: { id: userId },
    data: { displayName, bio },
  });

  res.send("Profile updated");
});`,
    vulnerableLines: [2, 5],
    vulnerabilityType: "Insecure Direct Object Reference",
    fixOptions: [
      fix(
        "server-user",
        "Use the authenticated user's ID from the session",
        "Authorization decisions must be based on trusted server-side identity, not a client-controlled identifier.",
        {
          code: `await db.users.update({
  where: { id: req.session.userId },
  data: { displayName, bio },
});`,
        },
      ),
      fix(
        "hidden-input",
        "Store userId in a hidden form field",
        "Hidden fields are still client-controlled and can be modified.",
        { tempting: true },
      ),
      fix(
        "uuid",
        "Use UUIDs instead of numeric IDs",
        "Unpredictable IDs reduce guessing but do not replace authorization checks.",
        { tempting: true },
      ),
      fix(
        "log-only",
        "Log profile updates for later investigation",
        "Logging helps detection but does not prevent unauthorized updates.",
      ),
    ],
    correctFixId: "server-user",
    explanation:
      "The handler trusts `req.body.userId`, which the attacker controls. By changing this value, one user can modify another user's profile. The server should derive the target user from the authenticated session or explicitly check that the requester is allowed to modify the requested object.",
    examKeywords: [
      "IDOR",
      "authorization",
      "access control",
      "server-side check",
      "trusted identity",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-04",
    modeData: {
      multipleChoice: {
        question: "Why is this profile update vulnerable?",
        options: [
          {
            id: "a",
            text: "The object owner is chosen from client-controlled input.",
            correct: true,
            rationale:
              "An attacker can change `userId` and target another user's profile.",
          },
          {
            id: "b",
            text: "The display name is too short.",
            correct: false,
            rationale: "Input length is unrelated to the authorization flaw.",
          },
          {
            id: "c",
            text: "The route uses POST instead of PUT.",
            correct: false,
            rationale:
              "The HTTP method does not fix broken object-level authorization.",
          },
          {
            id: "d",
            text: "The response message is too detailed.",
            correct: false,
            rationale:
              "The main issue is missing authorization, not information leakage.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-csrf-email-change",
    title: "CSRF in email change form",
    summary:
      "A state-changing endpoint accepts a normal POST request without a CSRF token or same-site protection.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["csrf", "session", "express"],
    language: "javascript",
    code: `app.post("/account/email", requireLogin, async (req, res) => {
  const newEmail = req.body.email;

  await db.users.update({
    where: { id: req.session.userId },
    data: { email: newEmail },
  });

  res.send("Email changed");
});`,
    vulnerableLines: [1, 2],
    vulnerabilityType: "Cross-Site Request Forgery",
    fixOptions: [
      fix(
        "csrf-token",
        "Require and verify a CSRF token",
        "A per-session unpredictable token ensures the request came from a form rendered by the application.",
        {
          code: `app.post("/account/email", requireLogin, csrfProtection, async (req, res) => {
  await changeEmail(req.session.userId, req.body.email);
});`,
        },
      ),
      fix(
        "get-to-post",
        "Use POST instead of GET",
        "The endpoint already uses POST. CSRF can target POST forms too.",
        { tempting: true },
      ),
      fix(
        "check-referer-only",
        "Only check the Referer header",
        "Referer checks can help, but they are brittle as the sole defence.",
        { tempting: true },
      ),
      fix(
        "confirm-message",
        "Show a success message after changing the email",
        "A success message does not stop a forged request from being submitted.",
      ),
    ],
    correctFixId: "csrf-token",
    explanation:
      "The browser automatically attaches cookies to requests. A malicious site can create a form that posts to `/account/email`, causing the victim's browser to change the account email while authenticated. Use CSRF tokens, SameSite cookies, and re-authentication for sensitive changes.",
    examKeywords: [
      "CSRF",
      "state-changing request",
      "anti-CSRF token",
      "SameSite",
      "session cookie",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-SESS-05",
    modeData: {
      multipleChoice: {
        question: "What property does a CSRF token provide?",
        options: [
          {
            id: "a",
            text: "It proves the request includes an unpredictable value generated by the legitimate site.",
            correct: true,
            rationale:
              "The attacker should not be able to know or forge the victim's CSRF token.",
          },
          {
            id: "b",
            text: "It encrypts the user's session cookie.",
            correct: false,
            rationale: "CSRF tokens are not cookie encryption.",
          },
          {
            id: "c",
            text: "It prevents SQL injection in the email field.",
            correct: false,
            rationale: "SQL injection requires query parameterisation.",
          },
          {
            id: "d",
            text: "It disables JavaScript in the browser.",
            correct: false,
            rationale: "CSRF protection is unrelated to disabling JavaScript.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-ssrf-avatar-fetch",
    title: "SSRF in avatar fetcher",
    summary:
      "The server fetches an arbitrary user-supplied URL to import a profile avatar.",
    courseTopic: "web-vulnerabilities",
    difficulty: "advanced",
    tags: ["ssrf", "url-fetch", "cloud"],
    language: "javascript",
    code: `app.post("/avatar/import", requireLogin, async (req, res) => {
  const imageUrl = req.body.url;

  const response = await fetch(imageUrl);
  const bytes = await response.arrayBuffer();

  await storage.saveAvatar(req.session.userId, Buffer.from(bytes));
  res.send("Avatar imported");
});`,
    vulnerableLines: [2, 4],
    vulnerabilityType: "Server-Side Request Forgery",
    fixOptions: [
      fix(
        "allowlist",
        "Allow only approved image hosts and block internal networks",
        "SSRF is mitigated by strict URL validation, allow-listed destinations, DNS/IP checks, timeouts, and blocking private/link-local addresses.",
        {
          code: `const url = new URL(req.body.url);
if (!ALLOWED_AVATAR_HOSTS.has(url.hostname)) {
  return res.status(400).send("Unsupported avatar host");
}
const response = await safeFetchExternalImage(url);`,
        },
      ),
      fix(
        "extension",
        "Only allow URLs ending in .jpg or .png",
        "File extensions do not prove that the destination is safe or external.",
        { tempting: true },
      ),
      fix(
        "client-fetch",
        "Fetch the image in the user's browser and send it to the server",
        "This shifts the problem and may introduce other risks. The server still needs validation for uploaded content.",
        { tempting: true },
      ),
      fix(
        "hide-errors",
        "Hide fetch errors from the response",
        "Hiding errors reduces reconnaissance but does not prevent requests to internal services.",
      ),
    ],
    correctFixId: "allowlist",
    explanation:
      "Because the server fetches `req.body.url`, an attacker can make it request internal resources such as cloud metadata endpoints, localhost admin panels, or private network services. The defence is to restrict destinations using an allow-list, block private and link-local IP ranges, handle DNS rebinding, and use safe fetch wrappers.",
    examKeywords: [
      "SSRF",
      "server-side request",
      "metadata service",
      "allow-list",
      "internal network",
    ],
    owaspTop10: "A10",
    owaspWstg: "WSTG-INPV-19",
    modeData: {
      multipleChoice: {
        question: "Why is arbitrary server-side URL fetching dangerous?",
        options: [
          {
            id: "a",
            text: "The attacker can cause the server to make requests to internal-only resources.",
            correct: true,
            rationale:
              "SSRF abuses the server's network position and privileges.",
          },
          {
            id: "b",
            text: "It always executes JavaScript in the victim's browser.",
            correct: false,
            rationale: "That describes XSS, not SSRF.",
          },
          {
            id: "c",
            text: "It allows the attacker to choose the HTTP status code.",
            correct: false,
            rationale:
              "The core issue is unauthorized server-side network access.",
          },
          {
            id: "d",
            text: "It prevents TLS from working.",
            correct: false,
            rationale:
              "TLS does not prevent SSRF to attacker-chosen destinations.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-path-traversal-download",
    title: "Path traversal in file download",
    summary:
      "A download endpoint joins a user-controlled filename with the upload directory without normalising or checking the final path.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["path-traversal", "file-download", "express"],
    language: "javascript",
    code: `app.get("/files/:name", requireLogin, (req, res) => {
  const fileName = req.params.name;
  const filePath = path.join(__dirname, "uploads", fileName);

  res.download(filePath);
});`,
    vulnerableLines: [2, 3, 5],
    vulnerabilityType: "Path Traversal",
    fixOptions: [
      fix(
        "canonical-check",
        "Resolve the path and verify it stays inside the upload directory",
        "Canonical path checks prevent `../` sequences from escaping the intended directory.",
        {
          code: `const base = path.resolve(__dirname, "uploads");
const requested = path.resolve(base, req.params.name);

if (!requested.startsWith(base + path.sep)) {
  return res.status(400).send("Invalid file name");
}

res.download(requested);`,
        },
      ),
      fix(
        "remove-dotdot",
        "Remove all '../' substrings",
        "String replacement is fragile and can be bypassed with encoding or platform-specific path separators.",
        { tempting: true },
      ),
      fix(
        "check-extension",
        "Only allow files ending in .pdf",
        "Extension checks do not guarantee the resolved path remains inside the intended directory.",
        { tempting: true },
      ),
      fix(
        "rename-route",
        "Rename the route from /files to /download",
        "Changing the URL does not change the path traversal behaviour.",
      ),
    ],
    correctFixId: "canonical-check",
    explanation:
      "The attacker controls `fileName`. A value such as `../../.env` can escape the upload directory and download sensitive server files. The server should resolve the canonical path and verify that it is still under the intended base directory. Prefer storing files by server-generated IDs rather than exposing raw filesystem names.",
    examKeywords: [
      "path traversal",
      "canonicalisation",
      "directory traversal",
      "file access",
      "input validation",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-01",
    modeData: {
      multipleChoice: {
        question:
          "What is the main security check needed before downloading the file?",
        options: [
          {
            id: "a",
            text: "Verify that the resolved path is still inside the allowed upload directory.",
            correct: true,
            rationale:
              "This prevents traversal sequences from escaping the intended directory.",
          },
          {
            id: "b",
            text: "Check whether the filename contains the word 'secret'.",
            correct: false,
            rationale:
              "Sensitive files can have many names; blacklisting is not robust.",
          },
          {
            id: "c",
            text: "Compress the file before sending it.",
            correct: false,
            rationale: "Compression does not enforce access control.",
          },
          {
            id: "d",
            text: "Use a longer route path.",
            correct: false,
            rationale: "The route name does not affect filesystem access.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-insecure-upload-public-js",
    title: "Unrestricted file upload to public directory",
    summary:
      "An upload handler stores user-provided files in a web-accessible directory using the original filename.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["file-upload", "validation", "express"],
    language: "javascript",
    code: `app.post("/upload", requireLogin, upload.single("file"), async (req, res) => {
  const target = path.join(__dirname, "public/uploads", req.file.originalname);

  await fs.promises.rename(req.file.path, target);

  res.send("/uploads/" + req.file.originalname);
});`,
    vulnerableLines: [2, 4, 6],
    vulnerabilityType: "Unrestricted File Upload",
    fixOptions: [
      fix(
        "validate-store",
        "Validate type, generate a safe name, and store outside executable paths",
        "Uploaded files should be validated by content, size-limited, renamed by the server, and stored where they cannot execute as code.",
        {
          code: `const safeName = crypto.randomUUID() + ".png";
await assertAllowedImage(req.file);
await fs.promises.rename(req.file.path, path.join(UPLOAD_DIR, safeName));`,
        },
      ),
      fix(
        "extension-only",
        "Allow upload when the filename ends with .png",
        "Extension checks alone are weak because content type and execution behaviour may differ from the name.",
        { tempting: true },
      ),
      fix(
        "original-name",
        "Keep the original filename for user convenience",
        "Original filenames can contain dangerous characters, collisions, or misleading extensions.",
        { tempting: true },
      ),
      fix(
        "chmod-777",
        "Make the upload directory writable by everyone",
        "This worsens the issue by weakening filesystem permissions.",
      ),
    ],
    correctFixId: "validate-store",
    explanation:
      "The handler trusts `originalname` and stores the file directly in a public path. Depending on server configuration, this can lead to stored XSS, malware hosting, overwrite attacks, or remote code execution. Use server-generated filenames, strict size/type validation, malware scanning where relevant, and non-executable storage.",
    examKeywords: [
      "file upload",
      "allow-list",
      "content validation",
      "server-generated filename",
      "non-executable storage",
    ],
    owaspTop10: "A04",
    owaspWstg: "WSTG-BUSL-08",
    modeData: {
      multipleChoice: {
        question: "Which practice is safest for user-uploaded files?",
        options: [
          {
            id: "a",
            text: "Validate the file, give it a server-generated name, and store it outside executable paths.",
            correct: true,
            rationale:
              "This reduces execution, overwrite, and content spoofing risks.",
          },
          {
            id: "b",
            text: "Trust the browser-provided Content-Type header.",
            correct: false,
            rationale: "The client controls this header.",
          },
          {
            id: "c",
            text: "Store files using the user's original filename.",
            correct: false,
            rationale:
              "Original names can be unsafe or collide with existing files.",
          },
          {
            id: "d",
            text: "Only reject files larger than 100 MB.",
            correct: false,
            rationale:
              "Size checks help availability but do not validate content safety.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-jwt-none-alg",
    title: "JWT accepted without signature verification",
    summary:
      "A middleware decodes a JWT and trusts its claims without verifying the signature.",
    courseTopic: "authentication",
    difficulty: "advanced",
    tags: ["jwt", "authentication", "authorization"],
    language: "javascript",
    code: `function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const claims = jwt.decode(token);

  if (!claims) {
    return res.status(401).send("Invalid token");
  }

  req.user = {
    id: claims.sub,
    role: claims.role,
  };

  next();
}`,
    vulnerableLines: [2, 3, 10],
    vulnerabilityType: "Broken Authentication",
    fixOptions: [
      fix(
        "verify",
        "Verify the JWT signature, issuer, audience, expiry, and algorithm",
        "JWT claims are only trustworthy after cryptographic verification and validation of expected metadata.",
        {
          code: `const claims = jwt.verify(token, PUBLIC_KEY, {
  algorithms: ["RS256"],
  issuer: "https://auth.example.com",
  audience: "api.example.com",
});`,
        },
      ),
      fix(
        "base64-check",
        "Check that the token has three Base64URL parts",
        "A well-formed token can still be attacker-created and unsigned.",
        { tempting: true },
      ),
      fix(
        "decode-twice",
        "Decode the token twice before trusting it",
        "Decoding is not verification. It only parses attacker-controlled data.",
        { tempting: true },
      ),
      fix(
        "short-expiry",
        "Use shorter token expiry but still decode only",
        "Expiry is also an untrusted claim unless the signature is verified.",
      ),
    ],
    correctFixId: "verify",
    explanation:
      "`jwt.decode` only parses the token payload. It does not verify that the identity provider signed it. An attacker can create a token with `role: 'admin'` and the middleware will trust it. Use `jwt.verify` with a fixed accepted algorithm, expected issuer and audience, and expiry validation.",
    examKeywords: [
      "JWT",
      "signature verification",
      "algorithm confusion",
      "issuer",
      "audience",
    ],
    owaspTop10: "A07",
    owaspWstg: "WSTG-ATHN-04",
    modeData: {
      multipleChoice: {
        question: "Why is `jwt.decode` insufficient for authentication?",
        options: [
          {
            id: "a",
            text: "It parses claims but does not verify that the token was signed by a trusted issuer.",
            correct: true,
            rationale: "Unverified claims are attacker-controlled.",
          },
          {
            id: "b",
            text: "It always deletes the expiry claim.",
            correct: false,
            rationale: "The problem is missing verification, not deletion.",
          },
          {
            id: "c",
            text: "It encrypts the JWT with the wrong key.",
            correct: false,
            rationale: "JWT signing and encryption are separate concepts.",
          },
          {
            id: "d",
            text: "It prevents users from logging out.",
            correct: false,
            rationale: "Logout is a separate session management concern.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-weak-password-hash-md5",
    title: "Weak password hashing with MD5",
    summary:
      "Passwords are hashed using fast unsalted MD5 before being stored.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["passwords", "hashing", "crypto"],
    language: "javascript",
    code: `app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  await db.users.insert({ username, passwordHash });
  res.send("Registered");
});`,
    vulnerableLines: [3, 4, 5, 6],
    vulnerabilityType: "Weak Password Storage",
    fixOptions: [
      fix(
        "argon2",
        "Hash passwords with Argon2id, bcrypt, or scrypt using a unique salt",
        "Password hashes should be slow, salted, and designed to resist offline cracking.",
        {
          code: `const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
});`,
        },
      ),
      fix(
        "sha256",
        "Replace MD5 with plain SHA-256",
        "SHA-256 is fast and not designed for password storage. Use a password hashing function.",
        { tempting: true },
      ),
      fix(
        "base64",
        "Base64-encode the password before storing it",
        "Encoding is reversible and provides no password protection.",
        { tempting: true },
      ),
      fix(
        "client-hash",
        "Hash the password in JavaScript before sending it",
        "Client-side hashing does not replace server-side password hashing and may turn the hash into a password equivalent.",
      ),
    ],
    correctFixId: "argon2",
    explanation:
      "MD5 is fast and unsalted here, so leaked hashes can be cracked efficiently using dictionaries or rainbow tables. Passwords should be stored using a dedicated password hashing function such as Argon2id, bcrypt, or scrypt with a unique salt and appropriate work factors.",
    examKeywords: [
      "password hashing",
      "salt",
      "Argon2id",
      "bcrypt",
      "offline cracking",
    ],
    owaspTop10: "A02",
    owaspWstg: "WSTG-ATHN-07",
    modeData: {
      multipleChoice: {
        question: "Which property is most important for password hashing?",
        options: [
          {
            id: "a",
            text: "It should be salted and deliberately slow to resist offline guessing.",
            correct: true,
            rationale:
              "Password hashing functions are designed to make cracking expensive.",
          },
          {
            id: "b",
            text: "It should produce the shortest possible hash.",
            correct: false,
            rationale:
              "Hash length is not the main password-storage security property.",
          },
          {
            id: "c",
            text: "It should use Base64 so the value is unreadable.",
            correct: false,
            rationale: "Base64 is encoding, not hashing or encryption.",
          },
          {
            id: "d",
            text: "It should be fast so login is instant.",
            correct: false,
            rationale:
              "Fast hashes help attackers crack leaked password databases.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-open-redirect-next",
    title: "Open redirect after login",
    summary:
      "The application redirects to a user-controlled `next` parameter after login.",
    courseTopic: "web-vulnerabilities",
    difficulty: "intro",
    tags: ["open-redirect", "phishing", "express"],
    language: "javascript",
    code: `app.post("/login", async (req, res) => {
  const user = await authenticate(req.body.username, req.body.password);

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  req.session.userId = user.id;
  res.redirect(req.query.next || "/dashboard");
});`,
    vulnerableLines: [9],
    vulnerabilityType: "Open Redirect",
    fixOptions: [
      fix(
        "relative-only",
        "Allow only safe relative redirects",
        "The application should redirect only to known local paths or an allow-list of trusted destinations.",
        {
          code: `const next = typeof req.query.next === "string" ? req.query.next : "";
if (!next.startsWith("/") || next.startsWith("//")) {
  return res.redirect("/dashboard");
}
res.redirect(next);`,
        },
      ),
      fix(
        "url-encode",
        "URL-encode the next parameter before redirecting",
        "Encoding does not make an attacker-controlled destination trustworthy.",
        { tempting: true },
      ),
      fix(
        "https-only",
        "Allow redirects to any HTTPS URL",
        "A phishing site can also use HTTPS. The destination still needs to be trusted.",
        { tempting: true },
      ),
      fix(
        "warning",
        "Show a warning in the footer that phishing exists",
        "User education is not a substitute for preventing unsafe redirects.",
      ),
    ],
    correctFixId: "relative-only",
    explanation:
      "An attacker can send a link such as `/login?next=https://evil.example/phish`. After a real login, the victim is redirected to the attacker's site, making phishing more convincing. Restrict redirects to safe relative paths or a strict allow-list.",
    examKeywords: [
      "open redirect",
      "phishing",
      "allow-list",
      "relative URL",
      "untrusted redirect",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-CLNT-04",
    modeData: {
      multipleChoice: {
        question:
          "What is the safest handling of a post-login redirect parameter?",
        options: [
          {
            id: "a",
            text: "Allow only local relative paths or destinations on a strict allow-list.",
            correct: true,
            rationale:
              "This prevents attackers from sending users to arbitrary external sites.",
          },
          {
            id: "b",
            text: "Allow all HTTPS destinations.",
            correct: false,
            rationale: "HTTPS does not mean the destination is trustworthy.",
          },
          {
            id: "c",
            text: "Allow the redirect only after successful login.",
            correct: false,
            rationale: "That is exactly what makes phishing more convincing.",
          },
          {
            id: "d",
            text: "Encode the URL before redirecting.",
            correct: false,
            rationale: "Encoding does not validate trust.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-nosql-login-injection",
    title: "NoSQL injection in MongoDB login",
    summary:
      "The login handler passes request body fields directly into a MongoDB query.",
    courseTopic: "web-vulnerabilities",
    difficulty: "core",
    tags: ["nosql-injection", "mongodb", "authentication"],
    language: "javascript",
    code: `app.post("/login", async (req, res) => {
  const user = await users.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  req.session.userId = user._id;
  res.redirect("/dashboard");
});`,
    vulnerableLines: [2, 3, 4],
    vulnerabilityType: "NoSQL Injection",
    fixOptions: [
      fix(
        "type-validate",
        "Validate primitive types and compare a password hash separately",
        "Rejecting objects/operators and using password hash verification prevents attacker-controlled query operators.",
        {
          code: `if (typeof req.body.username !== "string" || typeof req.body.password !== "string") {
  return res.status(400).send("Invalid input");
}

const user = await users.findOne({ username: req.body.username });
if (!user || !(await verifyPassword(user.passwordHash, req.body.password))) {
  return res.status(401).send("Invalid credentials");
}`,
        },
      ),
      fix(
        "json-stringify",
        "Run JSON.stringify on the body before querying",
        "Stringifying the entire body does not create a correct authentication flow and may introduce logic bugs.",
        { tempting: true },
      ),
      fix(
        "operator-blacklist",
        "Reject keys containing '$ne'",
        "Blacklisting one MongoDB operator misses many other operators and nested encodings.",
        { tempting: true },
      ),
      fix(
        "limit-one",
        "Add limit(1) to the query",
        "Returning one result does not prevent the attacker from changing the query predicate.",
      ),
    ],
    correctFixId: "type-validate",
    explanation:
      'MongoDB queries are structured objects. If the body parser accepts JSON, an attacker may submit `{ "password": { "$ne": null } }` and change the query meaning. Validate that inputs are strings, avoid placing raw request objects into queries, and verify passwords using a proper password hashing function.',
    examKeywords: [
      "NoSQL injection",
      "MongoDB operator",
      "type validation",
      "authentication bypass",
      "password hash",
    ],
    owaspTop10: "A03",
    owaspWstg: "WSTG-INPV-05",
    modeData: {
      multipleChoice: {
        question: "How can NoSQL injection occur in this handler?",
        options: [
          {
            id: "a",
            text: "The attacker can send objects containing MongoDB operators instead of plain strings.",
            correct: true,
            rationale:
              "Raw request values become part of the database query structure.",
          },
          {
            id: "b",
            text: "MongoDB automatically executes JavaScript in every query.",
            correct: false,
            rationale:
              "The issue here is operator injection into query objects.",
          },
          {
            id: "c",
            text: "The session ID is too short.",
            correct: false,
            rationale: "The vulnerable logic is in the login query.",
          },
          {
            id: "d",
            text: "The redirect happens after login.",
            correct: false,
            rationale: "The authentication query is the relevant flaw.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-deserialization-cookie",
    title: "Insecure deserialization from cookie",
    summary:
      "The server deserializes a Base64-encoded cookie and trusts the resulting object.",
    courseTopic: "web-vulnerabilities",
    difficulty: "advanced",
    tags: ["deserialization", "cookies", "session"],
    language: "javascript",
    code: `app.use((req, res, next) => {
  const raw = req.cookies.preferences;

  if (raw) {
    const json = Buffer.from(raw, "base64").toString("utf8");
    req.preferences = JSON.parse(json);
  }

  next();
});

app.get("/admin", requireLogin, (req, res) => {
  if (req.preferences?.isAdminPanelEnabled) {
    return res.render("admin");
  }

  res.status(403).send("Forbidden");
});`,
    vulnerableLines: [2, 5, 6, 13],
    vulnerabilityType: "Insecure Deserialization / Client-Side Trust",
    fixOptions: [
      fix(
        "server-side",
        "Store trusted state server-side or sign and validate the cookie",
        "Client-controlled serialized data must not be trusted unless integrity-protected and carefully validated.",
        {
          code: `const preferences = await db.preferences.findForUser(req.session.userId);
req.preferences = preferences;`,
        },
      ),
      fix(
        "base64-twice",
        "Base64-encode the cookie twice",
        "Base64 is not integrity protection. The client can still modify and re-encode the value.",
        { tempting: true },
      ),
      fix(
        "try-catch",
        "Wrap JSON.parse in a try/catch",
        "This prevents crashes from malformed JSON but does not stop tampering.",
        { tempting: true },
      ),
      fix(
        "rename-cookie",
        "Rename the cookie to app_preferences_v2",
        "A different cookie name does not make client-controlled data trustworthy.",
      ),
    ],
    correctFixId: "server-side",
    explanation:
      "The cookie is only Base64-encoded, not protected against tampering. A user can decode it, set `isAdminPanelEnabled` to true, re-encode it, and influence authorization-related behaviour. Store authorization-relevant state on the server, or use signed/encrypted cookies with strict schema validation for non-sensitive preferences.",
    examKeywords: [
      "deserialization",
      "tampering",
      "signed cookie",
      "integrity",
      "client-controlled data",
    ],
    owaspTop10: "A08",
    owaspWstg: "WSTG-SESS-04",
    modeData: {
      multipleChoice: {
        question: "Why is Base64 not enough to protect cookie contents?",
        options: [
          {
            id: "a",
            text: "Base64 is reversible encoding and provides no integrity protection.",
            correct: true,
            rationale: "The client can decode, modify, and re-encode the data.",
          },
          {
            id: "b",
            text: "Base64 can only store numbers.",
            correct: false,
            rationale: "Base64 can encode arbitrary bytes.",
          },
          {
            id: "c",
            text: "Base64 automatically expires after one hour.",
            correct: false,
            rationale: "Expiry is unrelated to Base64.",
          },
          {
            id: "d",
            text: "Base64 prevents JSON parsing.",
            correct: false,
            rationale: "The code decodes and parses JSON successfully.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "web-error-stack-trace",
    title: "Stack trace exposed to users",
    summary:
      "The global error handler returns raw exception details and stack traces to external users.",
    courseTopic: "secure-development",
    difficulty: "intro",
    tags: ["error-handling", "information-disclosure", "express"],
    language: "javascript",
    code: `app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
    sql: err.sql,
  });
});`,
    vulnerableLines: [2, 3, 4, 5],
    vulnerabilityType: "Information Disclosure",
    fixOptions: [
      fix(
        "generic-log",
        "Log detailed errors server-side and return a generic message",
        "Users should receive minimal error information, while developers keep details in protected logs.",
        {
          code: `logger.error({ err, requestId: req.id }, "Unhandled error");
res.status(500).json({
  error: "Internal server error",
  requestId: req.id,
});`,
        },
      ),
      fix(
        "remove-message-only",
        "Remove only the message field but keep the stack",
        "The stack trace can reveal file paths, framework versions, and implementation details.",
        { tempting: true },
      ),
      fix(
        "status-200",
        "Return HTTP 200 for all errors",
        "Incorrect status codes confuse clients and monitoring, and do not prevent information leakage.",
        { tempting: true },
      ),
      fix(
        "console-log",
        "Print the error to console and still return it",
        "Returning the error to users is the problem. Logging alone is not enough.",
      ),
    ],
    correctFixId: "generic-log",
    explanation:
      "Detailed error responses can reveal SQL queries, filesystem paths, framework internals, and secrets accidentally included in exception messages. The safer pattern is to log detailed errors in protected server logs and return a generic error with a correlation/request ID.",
    examKeywords: [
      "information disclosure",
      "stack trace",
      "error handling",
      "logging",
      "least information",
    ],
    owaspTop10: "A05",
    owaspWstg: "WSTG-ERRH-02",
    modeData: {
      multipleChoice: {
        question:
          "What should an application return to normal users after an unexpected server error?",
        options: [
          {
            id: "a",
            text: "A generic error message and possibly a request ID.",
            correct: true,
            rationale:
              "Detailed diagnostics belong in protected logs, not external responses.",
          },
          {
            id: "b",
            text: "The full stack trace so users can debug it.",
            correct: false,
            rationale:
              "Stack traces reveal implementation details useful to attackers.",
          },
          {
            id: "c",
            text: "The SQL query that failed.",
            correct: false,
            rationale:
              "SQL details can help attackers craft injection payloads.",
          },
          {
            id: "d",
            text: "A 200 OK response with the exception object.",
            correct: false,
            rationale: "This leaks details and breaks error semantics.",
          },
        ],
      },
    },
  }),
];
