import type { Challenge } from "@/domain/challenge";
import { buildChallenge, fix } from "../builder";

export const cryptographyChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "crypto-aes-ecb",
    title: "AES-ECB on user-controlled plaintext",
    summary:
      "A profile-export endpoint encrypts blobs with AES in ECB mode using a static key.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["aes", "mode"],
    language: "python",
    filename: "profile_export.py",
    code: `cipher = AES.new(KEY, AES.MODE_ECB)
return cipher.encrypt(pad(profile_bytes, 16))`,
    vulnerableLines: [1, 2],
    vulnerabilityType: "Insecure Block-Cipher Mode",
    fixOptions: [
      fix(
        "aead",
        "Use AES-GCM (or ChaCha20-Poly1305) with a fresh nonce and authenticated additional data",
        "AEAD provides both confidentiality and integrity in a single call. Always prefer it over raw modes.",
        {
          code: `nonce = os.urandom(12)
cipher = AES.new(KEY, AES.MODE_GCM, nonce=nonce)
ct, tag = cipher.encrypt_and_digest(profile_bytes)`,
        },
      ),
      fix(
        "cbc",
        "Switch to AES-CBC with a fixed IV",
        "CBC without integrity is malleable, and a fixed IV leaks equality of plaintexts.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "double-encrypt",
        "Encrypt twice with two static keys",
        "Doubles the cost without adding meaningful security; mode is still ECB.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "compress-first",
        "Gzip the data before AES-ECB",
        "Compressing before encryption can introduce side-channels (CRIME-style) and does not fix the mode.",
        { code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value` }),
    ],
    correctFixId: "aead",
    explanation:
      "ECB encrypts identical blocks identically, so structure of the plaintext shows through (the canonical penguin demo). It also gives no integrity. Default to authenticated encryption (AES-GCM with random 96-bit nonces, never repeat a nonce under the same key) and treat any other mode as a special-case requirement.",
    examKeywords: ["ecb", "aead", "gcm", "nonce", "integrity"],
    owaspTop10: "A04",
    owaspWstg: "WSTG-CRYP-04",
    modeData: {
      multipleChoice: {
        question: "Why is AES-ECB unsafe even with a strong key?",
        options: [
          {
            id: "a",
            text: "Identical plaintext blocks produce identical ciphertext blocks, leaking structure.",
            correct: true,
            rationale: "ECB has no diffusion across blocks.",
          },
          {
            id: "b",
            text: "ECB makes the ciphertext too short because it omits a per-message IV and authentication tag.",
            correct: false,
            rationale: "Length is not the issue.",
          },
          {
            id: "c",
            text: "ECB requires a 256-bit key and is unsafe only when applications choose 128-bit keys.",
            correct: false,
            rationale: "Mode is independent of key length.",
          },
          {
            id: "d",
            text: "ECB cannot be hardware-accelerated, so attackers can brute-force blocks efficiently.",
            correct: false,
            rationale: "It usually can be.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "crypto-iv-reuse-gcm",
    title: "AES-GCM with a fixed nonce",
    summary:
      "An audit-log encryptor reuses the same 12-byte nonce for every record.",
    courseTopic: "cryptography",
    difficulty: "advanced",
    tags: ["aead", "nonce"],
    language: "go",
    filename: "audit_encrypt.go",
    code: `var nonce = []byte("000000000000")

func encrypt(pt []byte) []byte {
  block, _ := aes.NewCipher(key)
  aead, _ := cipher.NewGCM(block)
  return aead.Seal(nil, nonce, pt, nil)
}`,
    vulnerableLines: [1, 5, 6],
    vulnerabilityType: "AEAD Nonce Reuse",
    fixOptions: [
      fix(
        "rand-nonce",
        "Generate a fresh 12-byte random nonce per call and prepend it to the ciphertext",
        "GCM is catastrophically broken under nonce reuse; the nonce must be unique per (key, message).",
        {
          code: `nonce := make([]byte, 12)
io.ReadFull(rand.Reader, nonce)
ct := aead.Seal(nonce, nonce, pt, nil)`,
        },
      ),
      fix(
        "counter",
        "Increment a counter and use it as the nonce, persisted to disk",
        "Acceptable if the counter is monotonic and shared across instances; risky in distributed systems where a crash can reuse a value.",
        { tempting: true , code: `value := r.URL.Query().Get("value")
if strings.Contains(value, "..") {
    http.Error(w, "blocked", http.StatusBadRequest)
    return
}`},
      ),
      fix(
        "longer-nonce",
        "Use a 16-byte nonce with the same value",
        "Reuse, not length, is the failure mode.",
        { tempting: true , code: `value := r.URL.Query().Get("value")
if strings.Contains(value, "..") {
    http.Error(w, "blocked", http.StatusBadRequest)
    return
}`},
      ),
      fix(
        "double-encrypt",
        "Encrypt the plaintext with another fixed-key cipher before GCM",
        "Doesn't fix nonce reuse; GCM authentication still breaks.",
        { code: `value := r.URL.Query().Get("value")
if strings.Contains(value, "..") {
    http.Error(w, "blocked", http.StatusBadRequest)
    return
}` }),
    ],
    correctFixId: "rand-nonce",
    explanation:
      "Reusing a GCM nonce under the same key allows recovery of the authentication subkey and forgery of arbitrary ciphertexts. Use a fresh random nonce per call (12 bytes is standard) or a strictly monotonic counter persisted across processes.",
    examKeywords: ["nonce reuse", "gcm", "forgery", "key separation"],
    owaspTop10: "A04",
  }),

  buildChallenge({
    id: "crypto-otp-key-reuse",
    title: "Two-time pad",
    summary: "Two messages are XORed with the same one-time-pad key.",
    courseTopic: "cryptography",
    difficulty: "advanced",
    tags: ["otp"],
    language: "python",
    filename: "otp_cipher.py",
    code: `def encrypt(pt: bytes) -> bytes:
    return bytes(b ^ k for b, k in zip(pt, KEY))

c1 = encrypt(message1)
c2 = encrypt(message2)`,
    vulnerableLines: [1, 2, 4, 5],
    vulnerabilityType: "OTP Key Reuse",
    fixOptions: [
      fix(
        "fresh-pad",
        "Use a fresh, single-use pad of equal length per message and never reuse it",
        "OTP is information-theoretically secure only when each pad is used exactly once.",
      ),
      fix(
        "use-aead",
        "Replace the OTP with AEAD (e.g. ChaCha20-Poly1305) using a long-term key and per-message nonce",
        "Modern AEAD ciphers achieve practical security without managing pads.",
        { code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value` }),
      fix(
        "longer-key",
        "Make the pad twice as long but reuse it for two messages",
        "Reuse is the failure mode regardless of length.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "compress-first",
        "Compress the plaintexts before XOR",
        "Compression doesn't restore secrecy; XOR of two compressed streams still leaks the XOR of plaintexts.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
    ],
    correctFixId: "fresh-pad",
    explanation:
      "If the same pad encrypts two plaintexts, `c1 XOR c2 = m1 XOR m2`. Statistical analysis (crib dragging) recovers both messages. OTP requires a fresh pad per message; in practice use AEAD with a key and nonce instead of trying to manage pads.",
    examKeywords: ["one-time pad", "key reuse", "xor", "crib dragging"],
    owaspTop10: "A04",
  }),

  buildChallenge({
    id: "crypto-weak-rng",
    title: "Token built from Math.random()",
    summary: "A signup confirmation token is generated with `Math.random()`.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["randomness"],
    language: "javascript",
    filename: "signup_token.js",
    code: `function token() {
  return Math.random().toString(36).slice(2, 10);
}`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Insecure Randomness",
    fixOptions: [
      fix(
        "csprng",
        "Use `crypto.randomBytes(32).toString('base64url')`",
        "CSPRNGs are designed for unpredictability under adversarial conditions.",
      ),
      fix(
        "longer-string",
        "Take 32 characters from `Math.random().toString(36)` calls",
        "Concatenating non-CSPRNG output is still predictable.",
        { tempting: true , code: `const value = String(req.query.value ?? "");
if (value.includes("<script>")) return res.status(400).end();
return res.send(value);`},
      ),
      fix(
        "hash-time",
        "SHA-256 of the current timestamp",
        "Time has very little entropy and is observable.",
        { tempting: true , code: `const value = String(req.query.value ?? "");
if (value.includes("<script>")) return res.status(400).end();
return res.send(value);`},
      ),
      fix(
        "uuid-v1",
        "UUID v1 (timestamp + MAC)",
        "v1 leaks generation time and host identity; use v4 from a CSPRNG or token_urlsafe.",
        { code: `const value = String(req.query.value ?? "");
if (value.includes("<script>")) return res.status(400).end();
return res.send(value);` }),
    ],
    correctFixId: "csprng",
    explanation:
      "`Math.random()` is a Mersenne-Twister-style PRNG with predictable internal state, so observing a few outputs lets an attacker reconstruct the rest. Cryptographic tokens (sessions, password resets, MFA codes) must come from `crypto.randomBytes` or the equivalent CSPRNG.",
    examKeywords: ["csprng", "math.random", "predictable", "entropy"],
    owaspTop10: "A04",
  }),

  buildChallenge({
    id: "crypto-jwt-none",
    title: "JWT verification accepts the `none` algorithm",
    summary: "A JWT verifier picks the algorithm from the token header.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["jwt"],
    language: "javascript",
    filename: "jwt_verify.js",
    code: `function verify(token) {
  const header = JSON.parse(atob(token.split(".")[0]));
  return jwt.verify(token, SECRET, { algorithms: [header.alg] });
}`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "JWT Algorithm Confusion",
    fixOptions: [
      fix(
        "fix-alg",
        "Hard-code the expected algorithm",
        "Never let the token tell you how to verify it. Pin to the algorithm your service issues.",
        {
          code: `return jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });`,
        },
      ),
      fix(
        "deny-none",
        "Reject only `none`",
        "Misses the HS256/RS256 confusion attack where an attacker forges with the public key as HMAC secret.",
        { tempting: true , code: `const value = String(req.query.value ?? "");
if (value.includes("<script>")) return res.status(400).end();
return res.send(value);`},
      ),
      fix(
        "key-hint",
        "Trust the `kid` header without validation",
        "`kid` injection has caused real CVEs; always look up keys via a strict allow-list.",
        { tempting: true , code: `const value = String(req.query.value ?? "");
if (value.includes("<script>")) return res.status(400).end();
return res.send(value);`},
      ),
      fix(
        "shorter-tokens",
        "Shorten the token TTL",
        "Doesn't fix the verification flaw.",
        { code: `const value = String(req.query.value ?? "");
if (value.includes("<script>")) return res.status(400).end();
return res.send(value);` }),
    ],
    correctFixId: "fix-alg",
    explanation:
      "Algorithm-from-header lets an attacker switch to `none` (no signature) or to HS256 with the server's public key as the secret. Always pin verification to the algorithm your service issues, and look up keys (and `kid`) from a server-controlled list.",
    examKeywords: ["jwt", "alg", "none", "algorithm confusion"],
    owaspTop10: "A04",
  }),

  buildChallenge({
    id: "crypto-tls-disabled-validation",
    title: "TLS verification disabled in HTTP client",
    summary:
      "A microservice calls an internal API with certificate validation turned off.",
    courseTopic: "cryptography",
    difficulty: "core",
    tags: ["tls"],
    language: "python",
    filename: "payments_client.py",
    code: `r = requests.get("https://payments.internal/charge", verify=False, timeout=2)`,
    vulnerableLines: [1],
    vulnerabilityType: "TLS Certificate Validation Disabled",
    fixOptions: [
      fix(
        "pin-or-trust",
        "Validate against the internal CA bundle (pin if possible)",
        "Validation must remain on; pin to the issuing CA so the trust set is bounded.",
        {
          code: `r = requests.get(URL, verify="/etc/ssl/internal-ca.pem", timeout=2)`,
        },
      ),
      fix(
        "ip-allowlist",
        "Allow only a list of internal IPs",
        "Defence in depth; not a substitute for verification (a sibling service can still impersonate).",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "self-signed-ok",
        "Accept self-signed certificates from the same domain",
        "Removes the chain-of-trust check; reverts to no real authentication of the peer.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "downgrade-http",
        "Switch to HTTP inside the cluster",
        "Plain HTTP is worse, not better.",
        { code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value` }),
    ],
    correctFixId: "pin-or-trust",
    explanation:
      "`verify=False` tells the client to accept any certificate, defeating TLS as authentication. In a service mesh, point clients at the internal CA bundle (or use mTLS) so peer identity is enforced.",
    examKeywords: ["tls", "verify", "ca bundle", "mtls"],
    owaspTop10: "A04",
    owaspWstg: "WSTG-CRYP-01",
  }),

  buildChallenge({
    id: "crypto-asym-private-encrypt",
    title: "Public-key confusion in a signing helper",
    summary:
      "A helper meant to sign data calls `encrypt` with the private key.",
    courseTopic: "cryptography",
    difficulty: "advanced",
    tags: ["pki"],
    language: "python",
    filename: "signing_helper.py",
    code: `def sign(data: bytes, priv: rsa.PrivateKey) -> bytes:
    return rsa.encrypt(data, priv)`,
    vulnerableLines: [1, 2, 3],
    vulnerabilityType: "Asymmetric Key Misuse",
    fixOptions: [
      fix(
        "use-sign",
        "Use the library's signature primitive (e.g. `priv.sign(...)` with PSS and SHA-256)",
        "Signatures are a distinct primitive; raw encrypt-with-private is not authenticated.",
      ),
      fix(
        "encrypt-pub",
        "Encrypt with the public key instead",
        "That's confidentiality, not authenticity. Mixing the two is a classic mistake.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "raw-rsa",
        "Use textbook RSA without padding",
        "Unpadded RSA is malleable and unsafe.",
        { tempting: true , code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value`},
      ),
      fix(
        "longer-key",
        "Use a 4096-bit key but keep the misuse",
        "Key size doesn't fix algorithm misuse.",
        { code: `value = str(request.args.get("value", ""))
if ".." in value:
    raise ValueError("blocked")
return value` }),
    ],
    correctFixId: "use-sign",
    explanation:
      "RSA encryption with the private key is not a signature: it has no message-recovery security and modern libraries explicitly forbid it. Sign with PSS-SHA-256 (or use Ed25519). Encryption uses the public key; decryption uses the private key. Signing uses the private key; verification uses the public key.",
    examKeywords: ["rsa", "pss", "sign", "verify", "key purpose"],
    owaspTop10: "A04",
  }),

  buildChallenge({
    id: "crypto-hardcoded-key",
    title: "Hardcoded encryption key in source",
    summary: "A symmetric key is defined as a constant inside the codebase.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["secrets"],
    language: "typescript",
    filename: "crypto_utils.ts",
    code: `const KEY = Buffer.from("d3adb33fcafef00ddeadbeefcafef00d", "hex");
export function encrypt(pt: Buffer) {
  // ... uses KEY directly
}`,
    vulnerableLines: [1],
    vulnerabilityType: "Hardcoded Cryptographic Key",
    fixOptions: [
      fix(
        "kms",
        "Load the key from a managed secret store / KMS at startup",
        "KMS-backed keys can be rotated without code changes and are protected by IAM and audit logging.",
      ),
      fix(
        "env-var",
        "Move the key to an environment variable",
        "Better than the source tree, but env vars leak via process listings, dumps, and accidental logging.",
        { tempting: true , code: `const value = String(input ?? "");
if (value.includes("..")) throw new Error("blocked");
return value;`},
      ),
      fix(
        "obfuscate",
        "Base64 the key constant so it's not obvious",
        "Obfuscation is not security; the key is still in the binary.",
        { tempting: true , code: `const value = String(input ?? "");
if (value.includes("..")) throw new Error("blocked");
return value;`},
      ),
      fix(
        "git-lfs",
        "Move the key into a separate Git LFS file",
        "Anyone with repo access still has the key.",
        { code: `const value = String(input ?? "");
if (value.includes("..")) throw new Error("blocked");
return value;` }),
    ],
    correctFixId: "kms",
    explanation:
      "Keys in source flow into every backup, every developer machine, and every container image. Use a KMS or managed secrets store with IAM-bound access and rotate keys on a schedule. If you must use env vars, scope the secret to the smallest possible set of processes and audit access.",
    examKeywords: ["kms", "secrets", "rotation", "hardcoded"],
    owaspTop10: "A04",
  }),
  // courseTopic: "cryptography"

  buildChallenge({
    id: "crypto-kerckhoffs-principle",
    title: "Kerckhoff's principle in cryptographic design",
    summary:
      "A team proposes keeping the encryption algorithm secret because 'attackers cannot break what they cannot inspect'.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["kerckhoffs", "crypto-design"],
    vulnerableLines: [],
    vulnerabilityType: "Security Through Obscurity",
    fixOptions: [],
    explanation:
      "Kerckhoff's principle says that a cryptosystem should remain secure even if everything except the secret key is public. Security should rely on strong, well-studied algorithms and protected keys, not on hiding the algorithm. Secret algorithms are hard to review and often fail when reverse engineered or leaked.",
    examKeywords: [
      "Kerckhoff",
      "secret key",
      "public algorithm",
      "security through obscurity",
    ],
    modeData: {
      multipleChoice: {
        question: "Which statement best describes Kerckhoff's principle?",
        options: [
          {
            id: "a",
            text: "A cryptographic system should remain secure even if everything except the key is public.",
            correct: true,
            rationale: "Correct: only the key should need to remain secret.",
          },
          {
            id: "b",
            text: "A cryptographic system is secure when the algorithm is secret.",
            correct: false,
            rationale: "This is security through obscurity.",
          },
          {
            id: "c",
            text: "The key should be public but the algorithm should be private.",
            correct: false,
            rationale: "This reverses the principle.",
          },
          {
            id: "d",
            text: "The system should use a different algorithm for every user.",
            correct: false,
            rationale:
              "Algorithm uniqueness is not the basis of sound cryptographic security.",
          },
        ],
      },
      explainPrompt:
        "Explain Kerckhoff's principle and why relying on a secret algorithm is poor cryptographic engineering.",
    },
  }),

  buildChallenge({
    id: "crypto-public-key-recipient",
    title: "Encrypting to the correct public key",
    summary:
      "Bob wants to send Alice a confidential message using public-key cryptography.",
    courseTopic: "cryptography",
    difficulty: "intro",
    tags: ["pki", "public-key-crypto"],
    vulnerableLines: [],
    vulnerabilityType: "Public Key Misuse",
    fixOptions: [],
    explanation:
      "For confidentiality in public-key encryption, the sender encrypts with the recipient's public key. Only the recipient should have the matching private key needed to decrypt. Signing is different: the sender signs with their own private key and others verify with the sender's public key.",
    examKeywords: [
      "public key",
      "private key",
      "recipient public key",
      "confidentiality",
      "digital signature",
    ],
    modeData: {
      multipleChoice: {
        question:
          "Bob wants to encrypt a message so that only Alice can read it. Which key should Bob use?",
        options: [
          {
            id: "a",
            text: "Bob's private key",
            correct: false,
            rationale:
              "That is used for signing, not encrypting confidentially to Alice.",
          },
          {
            id: "b",
            text: "Bob's public key",
            correct: false,
            rationale: "That would allow only Bob's private key to decrypt.",
          },
          {
            id: "c",
            text: "Alice's public key",
            correct: true,
            rationale: "Correct: Alice decrypts with her matching private key.",
          },
          {
            id: "d",
            text: "Alice's private key",
            correct: false,
            rationale: "Bob should never have Alice's private key.",
          },
        ],
      },
      explainPrompt:
        "Explain the difference between public-key encryption for confidentiality and digital signatures for authenticity.",
    },
  }),
];
