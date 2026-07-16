---
name: stack-sizing
description: Use BEFORE any framework/database/hosting decision, and as a coherence check across specialist agents' picks — determines the right project tier (Prototype, MVP, Growth SaaS, Enterprise/Critical) from timeline, team size, expected scale, and change tolerance, setting the ceiling/floor for stack choices at every layer. Triggers on "qual stack usar", "isso é exagero pra um MVP?", "vai escalar?", "que porte é esse projeto".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Stack Sizing

> **Stack choice is a function of project tier, not personal preference or what's trendy.**

Every other agent's "Decision Frameworks" (backend-specialist, database-architect, devops-engineer, frontend-specialist) picks technology **by use case**. This skill picks the **tier** first — the use-case tables only apply *within* the ceiling and floor that tier allows. Skipping this step is how MVPs end up with Kubernetes and how growth-stage SaaS ends up on a single SQLite file with no backups.

---

## ⚠️ Core Principle

- Never recommend a stack before the tier is known.
- If the tier is unclear, ASK — don't infer it from the request's vocabulary alone ("enterprise" in a feature name doesn't mean Enterprise tier).
- Over-engineering a Prototype is as much a failure as under-engineering a Growth SaaS.
- Tiers are a starting ceiling/floor, not a permanent label — re-check tier when scale signals change (see Escalation Triggers).

---

## 1. Sizing Questions (ask when unclear)

| Dimension | Question | Why it matters |
|---|---|---|
| **Timeline** | "Quanto tempo até precisar disso funcionando?" | Hours/days vs. months changes everything |
| **Team size** | "Quantas pessoas vão tocar este código?" | Solo dev ≠ needs the coordination overhead multi-team setups require |
| **Expected scale** | "Quantos usuários/requisições você espera nos primeiros meses?" | Drives DB/infra ceiling |
| **Criticality** | "Se isso cair por 1 hora, o que acontece?" | Drives auth, compliance, and rollback rigor |

Three answers are usually enough to place the project. Don't ask all four if the first three already make the tier obvious.

---

## 2. The Four Tiers

| Tier | Timeline | Team | Expected Scale | Change Tolerance | Typical Examples |
|---|---|---|---|---|---|
| **🟢 Prototype / Landing** | Hours–1 week | 1 person | 0–100 users, no real concurrency | High — rewrite is fine | Demo, portfolio, idea validation, internal one-off tool |
| **🟡 MVP** | 1–6 weeks | 1–3 people | <1,000 users, low concurrency | Moderate — survive a pivot, not necessarily a rewrite | First paying customers, beta launch |
| **🟠 Growth SaaS** | Ongoing, months | 3–15 people | 1k–100k users, real concurrency, multi-tenant | Low — breaking changes need a migration plan | Funded SaaS with retention to protect |
| **🔴 Enterprise / Critical** | Ongoing, long-lived | 15+ people or multiple teams | 100k+ users, high concurrency, regulated data | Very low — staged rollout + rollback required | Fintech, healthtech, internal platform for other teams |

---

## 3. Stack Ceiling & Floor by Layer

For each layer: the **recommended default**, what's **over-engineering** (don't reach for it below this tier), and what's **under-engineering** (don't settle for it at or above this tier).

### Frontend

| Tier | Recommended | Over-engineering below this | Under-engineering at/above this |
|---|---|---|---|
| Prototype | Single page, plain HTML/CSS or one Next.js page | Design system, Storybook, micro-frontends | — |
| MVP | Next.js (App Router) / SvelteKit + component library (shadcn/ui) | Module federation, multi-repo frontend | No component reuse at all, copy-pasted markup everywhere |
| Growth SaaS | Same framework + real design system, perf budgets enforced | Microfrontends without a second team needing independent deploys | No design system, no perf budget |
| Enterprise/Critical | Monorepo (Turborepo/Nx) only if multiple teams ship independently | Microfrontends as a default "because enterprise" | Single shared codebase blocking parallel team releases |

### Backend

| Tier | Recommended | Over-engineering below this | Under-engineering at/above this |
|---|---|---|---|
| Prototype | None (BaaS like Supabase) or a single serverless function | Custom auth, custom queue, microservices | — |
| MVP | One framework, one deploy target (Hono/FastAPI monolith) | Microservices, message queues, service mesh | No layering at all (everything in route handlers) |
| Growth SaaS | Modular monolith; extract a service only when a real bottleneck is measured | Splitting services preemptively "for scale" | Still one undifferentiated blob with no internal boundaries |
| Enterprise/Critical | Microservices/service mesh **only if** team count and deploy cadence justify the coordination cost | Microservices as a default rather than a measured decision | A single monolith blocking independent team releases when that's the actual bottleneck |

### Database

| Tier | Recommended | Over-engineering below this | Under-engineering at/above this |
|---|---|---|---|
| Prototype | SQLite, or no DB (JSON/local file) | Managed Postgres cluster, replication | — |
| MVP | Managed serverless Postgres (Neon/Supabase) or Turso | Self-hosted clusters, manual sharding, read replicas | SQLite as the only copy of paying-customer data with no backup |
| Growth SaaS | Managed Postgres + connection pooling (PgBouncer), read replicas as load demands it | Sharding before a single measured need for it | No migration discipline, no pooling, schema changed by hand in prod |
| Enterprise/Critical | Multi-region replication, formal migration review, sharding/CockroachDB **when scale numbers demand it** | Defaulting to distributed SQL without a measured need | Single-region, single-instance DB for regulated or high-uptime data |

### Deploy / Infra

| Tier | Recommended | Over-engineering below this | Under-engineering at/above this |
|---|---|---|---|
| Prototype | Vercel/Netlify free tier, no formal CI | Docker, Kubernetes, IaC | — |
| MVP | Managed PaaS (Vercel/Railway/Fly.io) + simple CI (lint+test+deploy) | Kubernetes, multi-region, IaC | No CI at all, manual deploys with no rollback path |
| Growth SaaS | Containers (Docker) on managed orchestration (Fly.io/Render/ECS), staging + prod, CI/CD with approval gates | Full Kubernetes cluster before infra headcount exists to run it | No staging environment, no rollback plan |
| Enterprise/Critical | Kubernetes/multi-region + IaC (Terraform) + on-call rotation | — (this is the floor, not a ceiling, at this tier) | Manual, undocumented deploys for regulated/critical systems |

### Auth

| Tier | Recommended | Over-engineering below this | Under-engineering at/above this |
|---|---|---|---|
| Prototype | Skip auth, or a magic link from a BaaS | Custom RBAC, SSO | — |
| MVP | Managed auth (Supabase Auth, Clerk, NextAuth, Firebase Auth) | Custom session/crypto, SSO/SAML | Plaintext passwords, homemade JWT signing |
| Growth SaaS | Managed auth + RBAC + audit logging | Full SSO/SAML before an enterprise customer asks for it | No audit trail, no role separation between tenants |
| Enterprise/Critical | SSO/SAML, fine-grained RBAC/ABAC, compliance logging (SOC2/HIPAA as required) | — (this is the floor) | Shared credentials, no audit trail for regulated data |

---

## 4. Coherence Check (what the orchestrator runs against specialists' picks)

A pick is a **red flag** when it crosses a tier boundary in either direction:

```
IF tier == Prototype/MVP AND any specialist proposes:
    Kubernetes, microservices, service mesh, multi-region DB, SSO/SAML
  → FLAG as over-engineered. Ask: "this is a {tier} project — do we actually need this now?"

IF tier == Growth SaaS/Enterprise AND any specialist proposes:
    SQLite as primary multi-tenant store, no backups, no auth, manual untracked deploys
  → FLAG as under-engineered. Ask: "this is a {tier} project — this choice won't survive real load/compliance."
```

When specialists disagree across layers (e.g., backend picks an edge-only runtime while database picks a platform without edge support), resolve by re-reading the tier table for both layers — the lower tier's row wins unless there's a stated reason to go up.

---

## 5. Escalation Triggers (when to move up a tier)

Don't pre-emptively build for the next tier. Move up only when one of these actually happens:

- Real paying customers replace "early testers."
- A measured scaling bottleneck appears (latency, connection pool exhaustion, queue backlog).
- A compliance requirement appears (SOC2, HIPAA, LGPD/GDPR data residency).
- A second team starts shipping to the same codebase independently.

---

## 6. Output Contract

Whoever determines the tier (usually `project-planner`) must record it explicitly so every other agent and the orchestrator can read it without re-deriving it:

```markdown
## Project Tier
**Tier:** MVP
**Rationale:** Solo founder, 3-week deadline, <500 expected users at launch.
```

This line goes in the plan file (`{task-slug}.md`), in the same section as "Project Type" (WEB/MOBILE/BACKEND).

The tier also calibrates how aggressively `lean-code-ladder` should be climbed within whatever stack this table allows — see that skill's "Calibrate by Project Tier" section. There is no separate intensity dial; the tier already is the dial.
