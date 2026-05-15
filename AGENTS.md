<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

In a Server Component, never use Mantine's dot-syntax (Accordion.Item, List.Item, AppShell.Header, Tabs.List, etc.). Import the dedicated named export. Keep "use client" only on files that actually need state, effects, or browser APIs

Refrain from using em-dashes.

# Challenge creation and course coverage:

Include challenge topics from:

- Security basics: CIA, privacy, accountability, non-repudiation, least privilege, defense in depth, fail securely, secure weakest link
- OWASP/web vulnerabilities: XSS, SQL/NoSQL/ORM injection, command injection, SSRF, CSRF, IDOR, auth bypass, privilege escalation, insecure file upload, clickjacking, CORS, cookie/session flaws, information leakage
- Authentication and passwords: password hashing, MFA, lockout, reset flows, account enumeration, session fixation/hijacking, secure cookies
- Authorization and access control: DAC, MAC, RBAC, ABAC, Bell-LaPadula, Biba, privilege escalation, object-level authorization
- Cryptography: symmetric/asymmetric crypto, hashes, MACs, signatures, certificates, TLS handshake, OTP, key generation, key reuse, encryption vs integrity
- Threat modeling: STRIDE, attacker-centric vs software-centric models, DFDs, misuse cases, attack trees, bow-tie
- Risk management: risk dimensions, likelihood/impact, CVSS, security requirements, prioritization
- Secure development: SDLC, secure coding practices, seven touchpoints, maturity models, source code analysis
- Microservices and supply chain: service-to-service auth, secrets, API gateways, dependency risk, SBOM, version locking, npm-audit, in-toto
- Privacy/GDPR: personal data, lawful processing, privacy by design, minimization, storage limitation, DPIA, roles/responsibilities
- AI security: AI for security, malicious use/abuse of AI, prompt injection, jailbreaking, insecure AI-generated code

<!-- END:nextjs-agent-rules -->
