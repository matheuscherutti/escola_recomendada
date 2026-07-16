---
name: effort-estimation
description: Use after project-planner has produced a task breakdown, when the user asks "quanto tempo leva", "quanto custa", "qual o esforço disso", or needs to communicate scope to a non-technical stakeholder — translates the breakdown into a time/effort range and optionally a cost range.
allowed-tools: Read, Write, Edit
---

# Effort Estimation

> **A range you can defend beats a number that looks precise and is wrong.** The goal is a useful planning input, not a quote.

DevBureau's primary audience is a business-minded professional, not a developer (see `CLAUDE.md`'s User Profile rule) — they need "roughly how long and roughly how much," not a sprint-planning artifact. This skill turns a task breakdown into that answer honestly.

---

## ⚠️ Core Principle

- Every estimate is an inference, never a fact — per `confidence-scale`, treat it as 🟡 INFERRED, never 🟢 CONFIRMED. State the assumptions it depends on.
- Give a range, never a single number. A single number invites the stakeholder to treat it as a promise.
- The same task costs more at a higher `stack-sizing` tier — more review, more testing, more compliance overhead — even with identical code. Size relative to the declared tier, not in a vacuum.
- Never invent a team's hourly/day rate. Translate to cost ONLY if the user supplies a rate; otherwise stop at the time range.

---

## 1. Pre-requisite

Run this after `project-planner` has produced a task breakdown with a declared Project Tier (`stack-sizing`). Estimating before the tier and tasks are known is guessing, not estimating.

---

## 2. Size Each Task (T-Shirt Sizing)

| Size | Meaning | Signal |
|---|---|---|
| **S** | A few hours to half a day | Single file, no new dependency, no schema change |
| **M** | Half a day to 2 days | A few files, one new integration or schema change, needs its own tests |
| **L** | 2 to 5 days | Spans multiple components/layers, needs design decisions, touches shared code |
| **XL** | 5+ days, or "break this down further" | Crosses domains (e.g., new auth flow + new UI + new schema together) — if a task is XL, split it before estimating; XL tasks hide the most risk |

Size every task from the plan's Task Breakdown, not the project as a whole — summing well-sized parts is more honest than eyeballing the total.

---

## 3. Convert Size to a Day Range, by Tier

The same "M" task takes longer at a higher tier because of process overhead (review depth, test rigor, compliance), not because the code itself is harder.

| Size | Prototype/Landing | MVP | Growth SaaS | Enterprise/Critical |
|---|---|---|---|---|
| S | 0.25–0.5 days | 0.5–1 day | 1–1.5 days | 1.5–2.5 days |
| M | 0.5–1 day | 1–2 days | 2–3 days | 3–5 days |
| L | 1–2 days | 2–4 days | 4–7 days | 7–12 days |
| XL | (split first) | (split first) | (split first) | (split first) |

These ranges assume one person working on the task; parallel work across people shortens wall-clock time but not total effort — keep the two separate when reporting.

---

## 4. Aggregate and Present

1. Sum each task's range within its phase (reuse `project-planner`'s P0–P4 Implementation Priority Order if available) — this gives a per-phase range and shows where the bulk of the effort sits, not just one opaque total.
2. Sum phases for a total range. Present it as a range, e.g. "12–19 dias de trabalho", not "15.5 dias".
3. State the confidence and its basis explicitly:

```markdown
## Estimativa de Esforço
**Faixa total:** 12–19 dias de trabalho (estimativa 🟡 INFERIDA, não um compromisso)
**Por fase:**
- Fundação (banco de dados, segurança): 3–5 dias
- Core (API, backend): 5–8 dias
- UI: 3–4 dias
- Polimento (testes, acessibilidade): 1–2 dias

**Premissas:** time de 1 pessoa, sem bloqueios externos, tier MVP.
**O que pode mudar a faixa:** integração externa não mapeada, decisão de design pendente, equipe menor/maior que a premissa.
```

4. **Cost translation (only if the user provides a rate):** multiply the day range by the supplied day-rate or hour-rate. Never default to a market-rate guess — ask for the rate or skip this step entirely.

---

## 5. Anti-Patterns

- Reporting "47.5 horas" or any decimal-precision number — false precision erodes trust the moment reality diverges from it.
- Estimating before tasks are broken down — sizing "the whole project" as one blob hides where the real risk is.
- Reusing the same day-range table across tiers — a Growth SaaS "M" task is not the same effort as a Prototype "M" task.
- Quoting a price without being asked for one, or without an explicit rate from the user.
- Treating the estimate as binding once delivery starts — re-estimate when scope or assumptions change, don't silently let the original range become a deadline.
