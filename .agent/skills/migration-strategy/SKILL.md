---
name: migration-strategy
description: Use AFTER code-archaeologist has mapped a legacy system, when the goal is "rebuild this on a modern stack" or "migrate this off X" (not a normal feature addition) — decides HOW to rebuild (Strangler Fig, Big Bang, Parallel Run, Branch by Abstraction) based on risk tolerance, downtime tolerance, team size, timeline. Triggers on "modernizar sistema legado", "migrar para outra stack", "reescrever o sistema", "sair do PHP antigo", "trocar de banco de dados em produção".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Migration Strategy

> **A legacy rewrite fails most often not from bad code, but from picking the wrong rollout strategy for the team and the risk involved.**

This skill only applies once the legacy system is understood (`code-archaeologist` has already mapped it). It answers a different question than `stack-sizing`: stack-sizing picks *what* to build with; this picks *how to get there from a running system without breaking it*.

---

## ⚠️ Core Principle

- Never recommend "just rewrite it" without naming a strategy and its rollback path.
- The right strategy depends on risk tolerance and team size more than on the technology involved — a small team rewriting a low-traffic internal tool has different constraints than a 24/7 payments system.
- Migration is not a refactor. Treat the legacy system as a black box with an observable contract (its current behavior) — the new system's job is to reproduce that contract, not to "improve" it silently along the way. Improvements are a separate, later decision.

---

## 1. Pre-requisite

Don't run this skill cold. Confirm `code-archaeologist` (or an equivalent existing-system analysis) has already produced:
- What the system does (its functional contract).
- Where the riskiest/least-understood parts are (marked 🔴 GAP per `confidence-scale`, if available).

If that mapping doesn't exist yet, do it first — picking a migration strategy without understanding what you're migrating is how rewrites silently drop business rules nobody remembers writing down.

---

## 2. The Four Strategies

| Strategy | How it works | Best when | Avoid when |
|---|---|---|---|
| **Strangler Fig** | Build the new system module by module, routing traffic to the new module once it's proven, leaving the rest on the legacy system meanwhile | Team is small/medium, system is large, can't afford a long freeze, want continuous validation in production | The legacy system has no clean seams to route around (monolith with no module boundaries at all) |
| **Big Bang** | Rebuild the whole system in parallel, cut over all at once | System is small enough to rebuild in a bounded window, downtime is acceptable, legacy is simple enough that there's low risk of missing a hidden rule | System is large, has been running for years (more hidden rules than anyone remembers), or any downtime is unacceptable |
| **Parallel Run** | Run old and new systems side by side on the same input, compare outputs, only cut over once outputs match for a sustained period | Outputs are comparable/deterministic (data pipelines, calculations, batch jobs), correctness matters more than speed of migration | The system has side effects that can't safely run twice (payments, sending emails, anything non-idempotent) without careful guarding |
| **Branch by Abstraction** | Introduce an abstraction layer in the legacy codebase itself, implement the new behavior behind it, flip a flag once validated, remove the old path last | Need to migrate one technical concern at a time inside a codebase the team keeps shipping to during the migration | The migration is also a full rewrite to a different language/runtime — the abstraction has nothing to attach to on both sides |

---

## 3. Decision Inputs

Ask (or infer from the plan/tier) before recommending:

| Dimension | Question | Drives |
|---|---|---|
| **Downtime tolerance** | "Pode ficar fora do ar por um período definido, ou precisa de zero downtime?" | Rules out Big Bang if zero-downtime is required |
| **Side-effect safety** | "As operações do sistema têm efeito colateral irreversível (cobrança, envio de e-mail, etc.)?" | Rules out naive Parallel Run unless side effects are mocked/deduped |
| **Team size & cadence** | "Quantas pessoas, e o time continua entregando features durante a migração?" | Branch by Abstraction and Strangler Fig assume the team keeps shipping; Big Bang assumes a dedicated freeze window |
| **System size & seams** | "O sistema tem módulos com fronteiras claras, ou é um monolito sem divisão interna?" | No clean seams rules out Strangler Fig until some seams are carved out first |
| **Project tier** (from `stack-sizing`) | What tier is the *target* system? | A Prototype-tier target rarely justifies Parallel Run's overhead; Enterprise/Critical rarely tolerates Big Bang |

---

## 4. Proving Equivalence

Whichever strategy is chosen, define upfront how you'll prove the new system behaves like the old one before fully cutting over:

- For deterministic logic: snapshot real legacy inputs/outputs and replay them against the new system (golden-file comparison).
- For user-facing flows: write the legacy's observed behavior as test cases (BDD/Gherkin-style scenarios work well here) before writing the new implementation, so "pass" means "matches legacy," not "matches what we assumed it should do."
- Anything that can't be verified this way is a 🔴 GAP per `confidence-scale` — surface it to the user before cutover, don't silently assume the new behavior is fine.

---

## 5. Output Contract

Record the decision in the plan file, same section style as `stack-sizing`'s tier:

```markdown
## Migration Strategy
**Strategy:** Strangler Fig
**Rationale:** Legacy billing module has clear seams, team of 4 keeps shipping other features during migration, zero-downtime required.
**Equivalence proof:** Golden-file replay of last 90 days of real invoices against the new billing module before each cutover.
```

---

## 6. Anti-Patterns

- Recommending Big Bang by default because it's conceptually simpler — it's usually simpler to plan and far riskier to execute.
- Treating "improve the code while migrating" as free — every behavioral change during migration makes equivalence harder to prove. Migrate first, improve after, as two separate steps.
- Skipping the equivalence proof because "the new code is obviously correct" — that confidence is exactly what gets contradicted by a business rule nobody documented.
- Breaking backward compatibility of user-generated config/state during a migration — never remove/rename/retype a field without a default/alias for the old shape, and write a regression test that parses the OLD format before changing the parser.
