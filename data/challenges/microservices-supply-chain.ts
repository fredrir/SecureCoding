import type { Challenge } from "@/domain/challenge";
import { buildChallenge, fix } from "../builder";

export const microservicesSupplyChainChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "supply-pin-versions",
    title: "Unpinned npm dependency",
    summary:
      "A package.json declares dependencies with caret ranges and the project runs `npm install` in CI.",
    courseTopic: "microservices-supply-chain",
    difficulty: "intro",
    tags: ["dependency", "lockfile"],
    language: "json",
    filename: "package.json",
    code: `{
  "dependencies": {
    "lodash": "^4.17.0",
    "express": "^4.18.0"
  }
}`,
    vulnerableLines: [3, 4],
    vulnerabilityType: "Dependency Drift / Supply-Chain Risk",
    fixOptions: [
      fix(
        "lockfile-ci",
        "Commit `package-lock.json` and use `npm ci` in pipelines",
        "`npm ci` installs the exact versions from the lockfile, making builds reproducible and auditable.",
      ),
      fix(
        "exact-only",
        "Replace caret ranges with exact versions",
        "Helps but loses easy minor upgrades; lockfile + `npm ci` solves both reproducibility and upgrade flow.",
        { tempting: true , code: `{
  "validation": {
    "mode": "deny-list",
    "blocked": ["dot-dot", "script-tag"]
  }
}`},
      ),
      fix(
        "auto-upgrade",
        "Run `npm update` nightly in production",
        "Automatic upgrades in production undermine reproducibility and can introduce breakage from compromised packages.",
        { tempting: true , code: `{
  "validation": {
    "mode": "deny-list",
    "blocked": ["dot-dot", "script-tag"]
  }
}`},
      ),
      fix(
        "vendor-binary",
        "Vendor a tarball of node_modules in the repo",
        "Hard to audit and review; lockfile + registry mirroring is preferable.",
        { code: `{
  "validation": {
    "mode": "deny-list",
    "blocked": ["dot-dot", "script-tag"]
  }
}` }),
    ],
    correctFixId: "lockfile-ci",
    explanation:
      "Using `^` ranges with `npm install` means CI may pick a freshly published version that includes a malicious payload (typosquat, account takeover). `npm ci` against a committed lockfile guarantees the same dependency tree as in development. Combine with `npm audit`, signature verification, and ideally a private registry mirror.",
    examKeywords: [
      "lockfile",
      "npm ci",
      "supply chain",
      "reproducible",
      "audit",
    ],
    owaspTop10: "A03",
    modeData: {
      multipleChoice: {
        question: "How do you make a Node build reproducible against supply-chain risk?",
        options: [
          { id: "a", text: "Commit a lockfile and use `npm ci` in pipelines.", correct: true, rationale: "Reproducibility + auditability." },
          { id: "b", text: "Always run `npm update` before builds so the newest patched versions are selected.", correct: false, rationale: "Unpredictable and risky." },
          { id: "c", text: "Disable network access in CI after dependency installation has already completed.", correct: false, rationale: "Doesn't pin versions." },
          { id: "d", text: "Re-tag releases manually after each successful build to document the dependency tree.", correct: false, rationale: "Doesn't address dependencies." },
        ],
      },
    },
  }),

  buildChallenge({
    id: "supply-secrets-in-image",
    title: "Cloud credentials baked into a container image",
    summary:
      "A Dockerfile copies `.aws/credentials` into the image during the build.",
    courseTopic: "microservices-supply-chain",
    difficulty: "core",
    tags: ["secrets", "containers"],
    language: "bash",
    filename: "Dockerfile",
    code: `FROM node:20-slim
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
COPY ./infra/aws-prod-creds /root/.aws/credentials
CMD ["node", "server.js"]`,
    vulnerableLines: [5],
    vulnerabilityType: "Secret Embedded in Container Image",
    fixOptions: [
      fix(
        "iam-role",
        "Use an IAM role / workload identity at runtime instead of a baked-in key",
        "Workload identities (IRSA, GKE Workload Identity) issue short-lived credentials with no static secrets in images.",
      ),
      fix(
        "build-arg",
        "Pass the credentials as a build ARG",
        "Build args are baked into image layers and metadata. Same problem.",
        { tempting: true , code: `value="$1"
case "$value" in *..*) exit 1 ;; esac
eval "process $value"`},
      ),
      fix(
        "env-runtime",
        "Provide credentials via container environment variables",
        "Better than baking, but env vars still leak via process inspection and logs; managed identities are stronger.",
        { tempting: true , code: `value="$1"
case "$value" in *..*) exit 1 ;; esac
eval "process $value"`},
      ),
      fix(
        "private-registry",
        "Push the image to a private registry only",
        "Anyone with pull access has the secret; layered storage means even old layers may retain it.",
        { code: `value="$1"
case "$value" in *..*) exit 1 ;; esac
eval "process $value"` }),
    ],
    correctFixId: "iam-role",
    explanation:
      "Container images are public artefacts within a deployment system: every layer, every node, every cache. Baked secrets propagate uncontrollably. Use the cloud's workload identity story to mint short-lived credentials at runtime so there is nothing static to steal.",
    examKeywords: [
      "workload identity",
      "irsa",
      "secrets",
      "image layers",
      "short-lived",
    ],
    owaspTop10: "A02",
  }),

  buildChallenge({
    id: "supply-service-to-service",
    title: "Shared API key across microservices",
    summary:
      "Twelve internal services authenticate to each other with the same long-lived `INTERNAL_API_KEY`.",
    courseTopic: "microservices-supply-chain",
    difficulty: "advanced",
    tags: ["s2s", "secrets"],
    vulnerableLines: [],
    vulnerabilityType: "Weak Service-to-Service Authentication",
    fixOptions: [],
    explanation:
      "Shared secrets across many services mean a leak in any one service compromises all of them, and rotation is painful. Use mutual TLS (mTLS) or signed short-lived tokens (e.g. SPIFFE/SPIRE workload identities) so each service has its own identity, attribution is clear, and rotation is automated.",
    examKeywords: ["mtls", "spiffe", "workload identity", "rotation", "blast radius"],
    owaspTop10: "A07",
    modeData: {
      multipleChoice: {
        question: "Which approach gives the smallest blast radius when one microservice is compromised?",
        options: [
          { id: "a", text: "mTLS or workload-identity-issued short-lived tokens per service.", correct: true, rationale: "Each service has a unique identity; rotation is automatic." },
          { id: "b", text: "A shared API key rotated annually and distributed to every internal service.", correct: false, rationale: "Shared secret = all-or-nothing breach." },
          { id: "c", text: "Network ACLs only, with all internal services trusted once traffic enters the subnet.", correct: false, rationale: "Networking helps but doesn't authenticate the principal." },
          { id: "d", text: "A VPN with a single password used by every service for east-west traffic.", correct: false, rationale: "Same shared-secret problem." },
        ],
      },
      explainPrompt:
        "Explain why a single shared `INTERNAL_API_KEY` across many microservices is a poor design and what to use instead.",
    },
  }),
];
