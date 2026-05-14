import type { Challenge } from "@/domain/challenge";
import { buildChallenge, fix } from "../builder";

export const authorizationChallenges: readonly Challenge[] = [
  buildChallenge({
    id: "authz-role-from-jwt-claim",
    title: "Role taken from a client-controlled JWT claim",
    summary:
      "An admin endpoint trusts the `role` claim inside a JWT signed by a different service.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["jwt", "rbac"],
    language: "typescript",
    filename: "admin_routes.ts",
    code: `app.delete("/admin/users/:id", async (req, res) => {
  const claims = jwt.decode(req.headers.authorization!.slice(7));
  if (claims?.role === "admin") {
    await Users.delete(req.params.id);
    return res.status(204).end();
  }
  res.status(403).end();
});`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Broken Access Control",
    fixOptions: [
      fix(
        "verify-server-role",
        "Verify the JWT signature and look up the role server-side from a trusted store",
        "Never trust unverified or self-asserted claims. The role must come from the authoritative store keyed by the verified user id.",
        {
          code: `const claims = jwt.verify(token, JWT_PUBLIC_KEY);
const user = await Users.findById(claims.sub);
if (!user?.isAdmin) return res.status(403).end();`,
        },
      ),
      fix(
        "verify-only",
        "Just verify the JWT signature and keep using `claims.role`",
        "Still wrong if the upstream issuer can be tricked into setting `role=admin`. Authorisation must be evaluated against the data owner.",
        { tempting: true },
      ),
      fix(
        "header-secret",
        "Require an `X-Admin-Secret` header in addition",
        "Shared secrets in headers leak in logs and don't model per-user authorisation.",
        { tempting: true },
      ),
      fix(
        "frontend-hide",
        "Hide the admin route from the front-end menu",
        "UI-only restrictions don't stop direct API calls.",
      ),
    ],
    correctFixId: "verify-server-role",
    explanation:
      "`jwt.decode` does not verify the signature, and even when verified, role claims are only as trustworthy as their issuer. Authorisation should be enforced from the resource owner's perspective: verify the token, identify the user, and look up authorisation in your own data store.",
    examKeywords: [
      "verify",
      "claims",
      "rbac",
      "broken access control",
      "trust boundary",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-02",
    modeData: {
      multipleChoice: {
        question: "Which is the strongest place to evaluate `isAdmin`?",
        options: [
          {
            id: "a",
            text: "From the authoritative user store, after verifying the token's signature.",
            correct: true,
            rationale: "Roles must be sourced from the system that owns them.",
          },
          {
            id: "b",
            text: "From a verified JWT issued by another microservice.",
            correct: false,
            rationale: "Only as trustworthy as the issuer; transitive trust is risky.",
          },
          {
            id: "c",
            text: "From a `role` cookie set at login.",
            correct: false,
            rationale: "Cookies are user-controlled if not signed and stored correctly; still better to look up.",
          },
          {
            id: "d",
            text: "From the front-end's local state.",
            correct: false,
            rationale: "Client-side authorisation is no authorisation.",
          },
        ],
      },
    },
  }),

  buildChallenge({
    id: "authz-mass-assignment",
    title: "Mass assignment promotes a regular user to admin",
    summary:
      "An update endpoint splats the entire request body onto the user record.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["mass-assignment"],
    language: "javascript",
    filename: "user_update.js",
    code: `app.put("/users/me", async (req, res) => {
  const updates = req.body;
  await Users.update(req.user.id, updates);
  res.json({ ok: true });
});`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Mass Assignment / Privilege Escalation",
    fixOptions: [
      fix(
        "explicit-fields",
        "Pick an explicit allow-list of fields the user may modify",
        "Listing the fields is the most reliable way to keep privileged attributes off the update path.",
        {
          code: `const { displayName, language, timezone } = req.body;
await Users.update(req.user.id, { displayName, language, timezone });`,
        },
      ),
      fix(
        "deny-role",
        "Delete `req.body.role` before passing it to the update",
        "Brittle: every new privileged field has to be added. Allow-listing fails closed; deny-listing fails open.",
        { tempting: true },
      ),
      fix(
        "client-form",
        "Render only the editable fields in the front-end form",
        "Doesn't stop a hand-crafted request.",
        { tempting: true },
      ),
      fix(
        "audit-log",
        "Audit-log every update",
        "Detection helps after the fact; the bug is still exploitable.",
      ),
    ],
    correctFixId: "explicit-fields",
    explanation:
      "Splatting the request body lets a user supply any column, including `role` or `isAdmin`. Use a strict allow-list at the boundary so attributes that affect authorisation never get assigned from untrusted input.",
    examKeywords: ["mass assignment", "allow-list", "privilege escalation"],
    owaspTop10: "A01",
  }),

  buildChallenge({
    id: "authz-path-traversal",
    title: "Path traversal in a download endpoint",
    summary:
      "A file-download endpoint joins the user-supplied name onto the storage directory.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["path-traversal"],
    language: "go",
    filename: "download.go",
    code: `func download(w http.ResponseWriter, r *http.Request) {
  name := r.URL.Query().Get("file")
  path := filepath.Join("/var/app/uploads", name)
  http.ServeFile(w, r, path)
}`,
    vulnerableLines: [2, 3, 4],
    vulnerabilityType: "Path Traversal",
    fixOptions: [
      fix(
        "clean-and-confine",
        "Resolve the absolute path and require it to stay inside the storage root",
        "After resolving symlinks and `..` traversals, the path must still be a child of the allowed root.",
        {
          code: `clean := filepath.Clean("/" + name)
abs := filepath.Join(root, clean)
if rel, err := filepath.Rel(root, abs); err != nil || strings.HasPrefix(rel, "..") {
  http.Error(w, "forbidden", 403)
  return
}`,
        },
      ),
      fix(
        "dotdot-strip",
        "Strip occurrences of `..` from the input",
        "Ineffective: encoded variants (%2e%2e), unicode lookalikes, and path separators bypass naive replacement.",
        { tempting: true },
      ),
      fix(
        "regex-name",
        "Allow only [A-Za-z0-9_.-] in the file name",
        "A file like `secrets.txt` still works if it happens to match. The control must be the boundary check, not character class.",
      ),
      fix(
        "chmod",
        "Make the storage directory world-readable",
        "Worsens the situation with broader exposure.",
        { tempting: true },
      ),
    ],
    correctFixId: "clean-and-confine",
    explanation:
      "`filepath.Join` does not by itself prevent traversal: a name like `../../etc/passwd` collapses out of the storage directory. The right check normalises the path and verifies it remains under the storage root after resolution, including following any symlinks.",
    examKeywords: ["path traversal", "canonicalisation", "confine", "root"],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-01",
  }),

  buildChallenge({
    id: "authz-bola-listing",
    title: "Group listing exposes other tenants' data",
    summary:
      "A multi-tenant API ignores the requesting user's tenant when listing groups.",
    courseTopic: "authorization",
    difficulty: "advanced",
    tags: ["bola", "multi-tenant"],
    language: "typescript",
    filename: "groups_list.ts",
    code: `app.get("/groups", async (req, res) => {
  const all = await Groups.findAll();
  res.json(all);
});`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Broken Object-Level Authorisation",
    fixOptions: [
      fix(
        "scope-tenant",
        "Always scope queries by `tenantId = req.user.tenantId`",
        "Every read must enforce the tenant boundary; centralise in a query helper to avoid drift.",
        {
          code: `const groups = await Groups.findAll({ where: { tenantId: req.user.tenantId } });`,
        },
      ),
      fix(
        "client-filter",
        "Filter results client-side based on the user's tenant",
        "Sends every group to every user; a hostile or curious client sees everything.",
        { tempting: true },
      ),
      fix(
        "obscure-ids",
        "Use long random ids on Group rows",
        "Doesn't address the listing leak.",
        { tempting: true },
      ),
      fix(
        "audit",
        "Log every cross-tenant access",
        "Detection without prevention.",
      ),
    ],
    correctFixId: "scope-tenant",
    explanation:
      "In a multi-tenant system, every query must enforce the tenant boundary in addition to user authorisation. The cleanest pattern is a repository layer that requires a tenant context and refuses queries without one.",
    examKeywords: ["bola", "multi-tenant", "scope", "object-level"],
    owaspTop10: "A01",
  }),
];
