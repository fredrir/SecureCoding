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
        {
          tempting: true,
          code: `const claims = jwt.verify(token, OTHER_SERVICE_PUBLIC_KEY);
if (claims.role === "admin") {
  await Users.delete(req.params.id);
}`,
        },
      ),
      fix(
        "header-secret",
        "Require an `X-Admin-Secret` header in addition",
        "Shared secrets in headers leak in logs and don't model per-user authorisation.",
        {
          tempting: true,
          code: `if (req.header("X-Admin-Secret") !== process.env.ADMIN_SECRET) {
  return res.status(403).end();
}`,
        },
      ),
      fix(
        "frontend-hide",
        "Hide the admin route from the front-end menu",
        "UI-only restrictions don't stop direct API calls.",
        {
          code: `if (!currentUser.isAdmin) {
  document.querySelector("#admin-nav")?.remove();
}`,
        },
      ),
      fix(
        "decode-and-cache",
        "Decode the JWT once at login and cache the role in the session",
        "Caching an unverified or externally asserted role preserves the same trust-boundary mistake.",
        {
          tempting: true,
          code: `const claims = jwt.decode(token);
req.session.role = claims?.role;
if (req.session.role === "admin") await Users.delete(req.params.id);`,
        },
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
            text: "From a verified JWT issued by another microservice that forwards its local role mapping.",
            correct: false,
            rationale:
              "Only as trustworthy as the issuer; transitive trust is risky.",
          },
          {
            id: "c",
            text: "From a signed `role` cookie set at login and refreshed with the session on every request.",
            correct: false,
            rationale:
              "Cookies are user-controlled if not signed and stored correctly; still better to look up.",
          },
          {
            id: "d",
            text: "From the front-end's local state after the UI hides administrator controls.",
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
        {
          tempting: true,
          code: `delete req.body.role;
delete req.body.isAdmin;
await Users.update(req.user.id, req.body);`,
        },
      ),
      fix(
        "client-form",
        "Render only the editable fields in the front-end form",
        "Doesn't stop a hand-crafted request.",
        {
          tempting: true,
          code: `<form>
  <input name="displayName" />
  <input name="timezone" />
</form>`,
        },
      ),
      fix(
        "audit-log",
        "Audit-log every update",
        "Detection helps after the fact; the bug is still exploitable.",
        {
          code: `logger.info({ userId: req.user.id, updates: req.body }, "profile update");
await Users.update(req.user.id, req.body);`,
        },
      ),
      fix(
        "schema-passthrough",
        "Validate types with a schema but allow unknown fields through",
        "Type validation is useful, but `passthrough` still lets privileged properties reach the model.",
        {
          tempting: true,
          code: `const updates = userUpdateSchema.passthrough().parse(req.body);
await Users.update(req.user.id, updates);`,
        },
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
        {
          tempting: true,
          code: `name = strings.ReplaceAll(name, "..", "")
path := filepath.Join("/var/app/uploads", name)
http.ServeFile(w, r, path)`,
        },
      ),
      fix(
        "regex-name",
        "Allow only [A-Za-z0-9_.-] in the file name",
        "A file like `secrets.txt` still works if it happens to match. The control must be the boundary check, not character class.",
        {
          code: `if !regexp.MustCompile("^[A-Za-z0-9_.-]+$").MatchString(name) {
  http.Error(w, "bad name", 400)
  return
}
http.ServeFile(w, r, filepath.Join(root, name))`,
        },
      ),
      fix(
        "chmod",
        "Make the storage directory world-readable",
        "Worsens the situation with broader exposure.",
        {
          tempting: true,
          code: `os.Chmod("/var/app/uploads", 0755)
path := filepath.Join("/var/app/uploads", name)
http.ServeFile(w, r, path)`,
        },
      ),
      fix(
        "clean-no-rel",
        "Call `filepath.Clean` but do not check the result stays under root",
        "Cleaning normalises traversal; it does not by itself enforce the storage boundary.",
        {
          tempting: true,
          code: `clean := filepath.Clean(name)
path := filepath.Join("/var/app/uploads", clean)
http.ServeFile(w, r, path)`,
        },
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
        {
          tempting: true,
          code: `const groups = await Groups.findAll();
res.json(groups.filter((g) => g.tenantId === currentTenantId));`,
        },
      ),
      fix(
        "obscure-ids",
        "Use long random ids on Group rows",
        "Doesn't address the listing leak.",
        {
          tempting: true,
          code: `const groups = await Groups.findAll({
  where: { publicId: { not: null } }
});`,
        },
      ),
      fix(
        "audit",
        "Log every cross-tenant access",
        "Detection without prevention.",
        {
          code: `const all = await Groups.findAll();
logger.warn({ userId: req.user.id, count: all.length }, "group list");
res.json(all);`,
        },
      ),
      fix(
        "tenant-param",
        "Accept `tenantId` from the query string and filter with that value",
        "The attacker controls the query string, so this only moves the trust mistake to a different field.",
        {
          tempting: true,
          code: `const groups = await Groups.findAll({
  where: { tenantId: req.query.tenantId }
});
res.json(groups);`,
        },
      ),
    ],
    correctFixId: "scope-tenant",
    explanation:
      "In a multi-tenant system, every query must enforce the tenant boundary in addition to user authorisation. The cleanest pattern is a repository layer that requires a tenant context and refuses queries without one.",
    examKeywords: ["bola", "multi-tenant", "scope", "object-level"],
    owaspTop10: "A01",
  }),
  // courseTopic: "authorization"

  buildChallenge({
    id: "authz-idor-invoice-download",
    title: "IDOR in invoice download",
    summary:
      "A user can download another user's invoice by changing `/invoice/123` to `/invoice/124`.",
    courseTopic: "authorization",
    difficulty: "core",
    tags: ["idor", "broken-access-control"],
    language: "python",
    filename: "views.py",
    code: `@app.get("/invoice/<invoice_id>")
def invoice(invoice_id):
    invoice = Invoice.get(invoice_id)
    return send_file(invoice.pdf_path)`,
    vulnerableLines: [2, 3],
    vulnerabilityType: "Insecure Direct Object Reference",
    fixOptions: [],
    explanation:
      "IDOR is a broken access-control flaw where an object identifier can be changed to access another user's resource. The server must check that the authenticated user is allowed to access the requested invoice. Obscure IDs are defence-in-depth, not a replacement for authorization checks.",
    examKeywords: [
      "IDOR",
      "broken access control",
      "object-level authorization",
      "server-side check",
    ],
    owaspTop10: "A01",
    owaspWstg: "WSTG-ATHZ-04",
    modeData: {
      multipleChoice: {
        question: "What is the correct fix for this invoice IDOR?",
        options: [
          {
            id: "a",
            text: "Check server-side that the logged-in user is authorized for the requested invoice.",
            correct: true,
            rationale: "Authorization must be enforced for each object.",
          },
          {
            id: "b",
            text: "Hide the invoice link in the UI and rely on the navigation menu to limit access to invoices.",
            correct: false,
            rationale: "Attackers can still request the URL directly.",
          },
          {
            id: "c",
            text: "Use a larger random-looking invoice number to reduce successful guessing by attackers.",
            correct: false,
            rationale:
              "Guessing becomes harder, but access control is still missing.",
          },
          {
            id: "d",
            text: "Return the PDF as Base64 so the direct object reference is less obvious in responses.",
            correct: false,
            rationale: "Encoding does not enforce authorization.",
          },
        ],
      },
      explainPrompt:
        "Explain IDOR and why object-level authorization must be checked on the server.",
    },
  }),
];
