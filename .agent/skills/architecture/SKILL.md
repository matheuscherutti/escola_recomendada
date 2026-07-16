---
name: architecture
description: Use when making architecture decisions or analyzing system design — requirements analysis, trade-off evaluation, ADR documentation.
allowed-tools: Read, Glob, Grep
---

# Architecture Decision Framework

> "Requirements drive architecture. Trade-offs inform decisions. ADRs capture rationale."

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

| File | Description | When to Read |
|------|-------------|--------------|
| `context-discovery.md` | Questions to ask, project classification | Starting architecture design |
| `trade-off-analysis.md` | ADR templates, trade-off framework | Documenting decisions |
| `pattern-selection.md` | Decision trees, anti-patterns | Choosing patterns |
| `examples.md` | MVP, SaaS, Enterprise examples | Reference implementations |
| `patterns-reference.md` | Quick lookup for patterns | Pattern comparison |

---

## 🔗 Related Skills

| Skill | Use For |
|-------|---------|
| `@[skills/database-design]` | Database schema design |
| `@[skills/api-patterns]` | API design patterns |
| `@[skills/deployment-procedures]` | Deployment architecture |

---

## Core Principle

**"Simplicity is the ultimate sophistication."**

- Start simple
- Add complexity ONLY when proven necessary
- You can always add patterns later
- Removing complexity is MUCH harder than adding it

---

## Source of Truth

Prefer plain files (markdown, JSON, YAML) as the system of record for anything that needs to survive across sessions or tools — they're git-diffable, grep-able, and human-readable without a viewer. Any derived index (database, cache, search) must be rebuildable FROM the files at any time; never let the index become the only copy of the data ("compile, don't retrieve"). This is the same principle behind DevBureau's own `.agent/memory/` layer.

## Multi-Phase Pipelines as a DAG, Not Implicit Order

When a workflow has multiple phases (e.g. requirements → spec → implementation → QA → memory registration), declare each phase's dependency explicitly — "phase X only runs once phase Y has completed" — instead of relying on code order to imply it. Independent phases can fan out in parallel. Implicit ordering breaks silently the first time someone reorders steps without realizing a real dependency existed between them.

---

## Validation Checklist

Before finalizing architecture:

- [ ] Requirements clearly understood
- [ ] Constraints identified
- [ ] Each decision has trade-off analysis
- [ ] Simpler alternatives considered
- [ ] ADRs written for significant decisions
- [ ] Team expertise matches chosen patterns
