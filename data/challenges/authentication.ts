import type { Challenge } from "@/domain/challenge";
import { buildChallenge, fix } from "../builder";

export const authenticationChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "authn-md5-passwords",
    title: "Passwords stored with MD5",
    summary: "Account creation hashes the password with MD5 and stores the hex digest.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["password-hash", "weak-crypto"],
    language: "python",
    code: `def create_account(email: str, password: str) -> None:
    digest = hashlib.md5(password.encode()).hexdigest()
    db.users.insert({"email": email, "password_hash": digest})`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Weak Password Hashing",
    fixOptions: [
      fix(
        "argon2",
        "Use a memory-hard password hash like Argon2id with sensible parameters",
        "Argon2id is the OWASP-recommended algorithm: salted by default and tunable to be memory-hard against GPU/ASIC attackers.",
        {
          code: `from argon2 import PasswordHasher
ph = PasswordHasher(time_cost=3, memory_cost=64*1024, parallelism=4)
hash = ph.hash(password)`,
        },
      ),
      fix(
        "sha256-salt",
        "Switch to SHA-256 with a per-user salt",
        "SHA-256 is fast, which is exactly what you don't want for passwords. A salt is necessary but not sufficient.",
        { tempting: true },
      ),
      fix(
        "double-md5",
        "Run MD5 twice",
        "Iterating a broken hash does not produce a strong KDF. MD5 is collision-broken and far too fast.",
        { tempting: true },
      ),
      fix(
        "encrypt-aes",
        "AES-encrypt the password with a fixed key",
        "Encryption is reversible. If the key leaks, every password leaks. Passwords must be hashed, not encrypted.",
      ),
    ],
    correctFixId: "argon2",
    explanation:
      "MD5 is fast and broken: an attacker who steals the database can crack the entire user table in minutes on commodity GPUs. Use a memory-hard KDF (Argon2id, scrypt) or, at minimum, bcrypt. Configure work factors so that hashing one password takes ~250 ms on production hardware.",
    examKeywords: ["argon2", "memory-hard", "salt", "kdf", "work factor"],
    owaspTop10: "A02",
    modeData: {
      multipleChoice: {
        question: "Which password storage strategy follows current OWASP guidance?",
        options: [
          { id: "a", text: "Argon2id with per-user salt and tuned cost.", correct: true, rationale: "Memory-hard and salted by default." },
          { id: "b", text: "SHA-256 with per-user salt.", correct: false, rationale: "Fast hashes are unsuitable for passwords." },
          { id: "c", text: "MD5 iterated 10,000 times.", correct: false, rationale: "MD5 is broken; iteration on a fast primitive is still cheap." },
          { id: "d", text: "AES encryption of the password.", correct: false, rationale: "Encryption is reversible; key leak == password leak." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "authn-no-lockout",
    title: "Login endpoint without lockout or rate limit",
    summary:
      "A login handler verifies the password but applies no throttling or lockout policy.",
    courseTopic: "authentication",
    difficulty: "intro",
    tags: ["lockout", "brute-force"],
    language: "typescript",
    code: `app.post("/login", async (req, res) => {
  const user = await Users.findByEmail(req.body.email);
  if (user && await argon2.verify(user.hash, req.body.password)) {
    req.session.userId = user.id;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "invalid credentials" });
});`,
    vulnerableLines: [1, 2, 3, 6],
    vulnerabilityType: "Missing Authentication Throttling",
    fixOptions: [
      fix(
        "rate-limit",
        "Per-account exponential back-off plus per-IP rate limit and CAPTCHA after thresholds",
        "Combines slow-down on the targeted account with a network-level throttle to defeat distributed attacks.",
      ),
      fix(
        "lockout-100",
        "Permanently lock the account after 5 failures",
        "DoS risk: attackers can lock real users by trying their email. Use temporary back-off instead.",
        { tempting: true },
      ),
      fix(
        "client-ratelimit",
        "Disable the submit button for 30 seconds after a failure",
        "Pure client control; the attacker can call the endpoint without the page.",
        { tempting: true },
      ),
      fix(
        "longer-passwords",
        "Require 12-character passwords",
        "Helpful, but does not stop credential stuffing with leaked plaintexts.",
      ),
    ],
    correctFixId: "rate-limit",
    explanation:
      "Without throttling, an attacker can brute-force one account or, more often, run credential stuffing across the user base using leaked password lists. The recommended pattern is per-account exponential back-off (resilient to credential stuffing), per-IP rate limiting, and step-up challenges (CAPTCHA, MFA) after thresholds. Permanent lockout is harmful because anyone can lock anyone else's account.",
    examKeywords: ["rate limit", "lockout", "credential stuffing", "back-off"],
    owaspTop10: "A07",
    owaspWstg: "WSTG-ATHN-03",
  }),

  buildChallenge({
    id: "authn-account-enumeration",
    title: "Account enumeration via login error messages",
    summary:
      "The login endpoint returns different errors for unknown email vs. wrong password.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["enumeration", "ux"],
    language: "typescript",
    code: `if (!user) return res.status(404).json({ error: "no such email" });
if (!await verify(user.hash, password)) {
  return res.status(401).json({ error: "wrong password" });
}`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Account Enumeration",
    fixOptions: [
      fix(
        "generic",
        "Return the same generic error and timing for both cases",
        "Identical responses defeat the enumeration. Keep timing similar by hashing a dummy when the user does not exist.",
        {
          code: `if (!user) {
  await argon2.verify(DUMMY_HASH, password); // constant-time padding
  return res.status(401).json({ error: "invalid credentials" });
}
if (!await verify(user.hash, password)) {
  return res.status(401).json({ error: "invalid credentials" });
}`,
        },
      ),
      fix(
        "rate",
        "Rate-limit only the wrong-email path",
        "Doesn't address the information disclosure; attackers learn membership in one request.",
        { tempting: true },
      ),
      fix(
        "captcha",
        "Add a CAPTCHA before the form",
        "Slows bots but does not change the response that reveals account existence.",
        { tempting: true },
      ),
      fix(
        "log-only",
        "Log enumeration attempts but keep messages",
        "Detection is not a fix; the data still leaks.",
      ),
    ],
    correctFixId: "generic",
    explanation:
      "Distinct errors let an attacker enumerate registered emails, which is useful for credential stuffing, password-reset abuse, and phishing. Always return one generic error and keep timing constant by performing a dummy hash when the email is unknown. The same applies to password-reset and signup endpoints.",
    examKeywords: ["enumeration", "generic error", "constant time", "dummy hash"],
    owaspTop10: "A07",
    owaspWstg: "WSTG-ATHN-09",
  }),

  buildChallenge({
    id: "authn-session-fixation",
    title: "Session fixation on login",
    summary:
      "Login authenticates the user but does not regenerate the pre-login session id.",
    courseTopic: "authentication",
    difficulty: "advanced",
    tags: ["session", "fixation"],
    language: "javascript",
    code: `app.post("/login", async (req, res) => {
  const user = await login(req.body);
  if (user) {
    req.session.userId = user.id;
    return res.json({ ok: true });
  }
  res.status(401).end();
});`,
    vulnerableLines: [4],
    vulnerabilityType: "Session Fixation",
    fixOptions: [
      fix(
        "regenerate",
        "Regenerate the session id after authentication",
        "Forces a new session identifier, invalidating any pre-login id the attacker might know.",
        {
          code: `req.session.regenerate((err) => {
  if (err) return next(err);
  req.session.userId = user.id;
  res.json({ ok: true });
});`,
        },
      ),
      fix(
        "rotate-day",
        "Rotate session ids once a day",
        "Doesn't help: the fixation occurs at the login moment.",
        { tempting: true },
      ),
      fix(
        "samesite",
        "Set the cookie to SameSite=Strict",
        "Defends against CSRF but not against an attacker who plants a known id via XSS or query parameter.",
        { tempting: true },
      ),
      fix(
        "ip-bind",
        "Bind the session to the client IP",
        "Breaks for mobile users on changing networks; not a practical mitigation.",
      ),
    ],
    correctFixId: "regenerate",
    explanation:
      "If the session id stays the same across the login boundary, an attacker who fixes the victim's id beforehand (via a query parameter, XSS, or a sub-domain cookie) gains the authenticated session. Regenerating on login eliminates the pre-auth identifier. Many frameworks call this `req.session.regenerate()` or `session_regenerate_id(true)`.",
    examKeywords: [
      "session fixation",
      "regenerate",
      "pre-login id",
      "post-auth",
    ],
    owaspTop10: "A07",
  }),

  buildChallenge({
    id: "authn-mfa-bypass",
    title: "MFA enforced only at first factor",
    summary:
      "After password verification the server immediately issues a session, even if MFA is enabled.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["mfa"],
    language: "typescript",
    code: `if (await verifyPassword(user, req.body.password)) {
  req.session.userId = user.id;
  return res.json({ requiresMfa: user.mfaEnabled });
}
res.status(401).end();`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "MFA Bypass",
    fixOptions: [
      fix(
        "step-up",
        "Issue an interim token only; finalise the session after MFA verification",
        "Splits the login into two enforced steps so the user is never authenticated by one factor when MFA is required.",
        {
          code: `if (user.mfaEnabled) {
  return res.json({ mfaToken: signMfaToken(user.id) });
}
req.session.userId = user.id;`,
        },
      ),
      fix(
        "client-redirect",
        "Trust the client to redirect to the MFA page",
        "Returns a fully authenticated session; the client could simply ignore the redirect.",
        { tempting: true },
      ),
      fix(
        "skip-low-risk",
        "Skip MFA when the IP matches a recent successful login",
        "Risk-based exemption is acceptable, but only as policy on top of a strict step-up flow, not in place of it.",
        { tempting: true },
      ),
      fix(
        "longer-pass",
        "Require longer passwords",
        "Doesn't address the bypass.",
      ),
    ],
    correctFixId: "step-up",
    explanation:
      "Returning `{requiresMfa: true}` while also setting `session.userId` defeats MFA: the attacker calls authenticated endpoints directly from the issued session. The fix is a two-stage flow: the first response carries an interim token, and only after the second factor verifies does the server upgrade to a real session.",
    examKeywords: ["mfa", "step-up", "interim token", "second factor"],
    owaspTop10: "A07",
  }),

  buildChallenge({
    id: "authn-reset-token-weak",
    title: "Predictable password-reset token",
    summary:
      "A password-reset token is built from the user id and a counter incremented on each reset.",
    courseTopic: "authentication",
    difficulty: "core",
    tags: ["reset", "predictable"],
    language: "python",
    code: `def issue_reset_token(user):
    user.reset_counter += 1
    db.save(user)
    return f"{user.id}-{user.reset_counter}"`,
    vulnerableLines: [2, 3, 4],
    vulnerabilityType: "Predictable Reset Token",
    fixOptions: [
      fix(
        "csprng",
        "Use a 256-bit cryptographically random token, store its hash, expire after 15 minutes",
        "High-entropy tokens are unguessable, hashing limits damage from log/db leaks, and short TTL reduces window.",
        {
          code: `token = secrets.token_urlsafe(32)
db.save_reset(user.id, sha256(token), expires_at=now + timedelta(minutes=15))
return token`,
        },
      ),
      fix(
        "uuid4",
        "Use a UUID4 token",
        "UUID4 is okay (122 bits of entropy) but use a CSPRNG-derived URL-safe token to be unambiguous; also hash on storage.",
        { tempting: true },
      ),
      fix(
        "encrypt-id",
        "AES-encrypt the user id with a server key",
        "Encryption produces predictable structure and replays after key rotation; tokens should be opaque random strings.",
        { tempting: true },
      ),
      fix(
        "shorter-ttl",
        "Keep the format and just expire the link in 1 minute",
        "A short TTL helps but a guessable token still allows online enumeration.",
      ),
    ],
    correctFixId: "csprng",
    explanation:
      "Tokens that derive from user ids and counters are guessable. Reset tokens must be high-entropy random values produced by a cryptographically secure RNG, stored as a hash so a database leak does not directly enable resets, and time-boxed to a short window.",
    examKeywords: ["csprng", "entropy", "expire", "hash on store"],
    owaspTop10: "A07",
    owaspWstg: "WSTG-ATHN-09",
  }),
];
