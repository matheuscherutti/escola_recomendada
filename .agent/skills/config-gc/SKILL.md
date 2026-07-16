---
name: config-gc
description: Use when the user asks to clean up, audit, or slim down the DevBureau kit itself — "limpar o kit", "meu .agent está bloadado", "tem skill demais", "audita meu setup", "config GC", "clean up my config", "too many skills/agents", "audit my setup" — or periodically as kit-maintenance hygiene. Not for cleaning up a derived/consumer project — only the kit's own .agent/ tree.
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# Config GC — Garbage Collection for the DevBureau Kit

Borrowed from runtime garbage collection: periodically scan for objects no longer referenced, redundant, or stale, and reclaim the space. The critical difference: **here, collection requires a human in the loop. Never delete autonomously.**

Scope: DevBureau's own `.agent/` tree (`agents/`, `skills/`, `scripts/`, `memory/`, `workflows/`). Not for auditing a derived project the kit was installed into — that's a different task (`checklist.py`, `codebase-audit`).

---

## ⚠️ Hard Rules

1. **Never delete anything without explicit per-item confirmation.** Present every candidate with the evidence for why it looks orphaned, then wait for the user to confirm each one (or an explicit batch) before touching disk.
2. **No new script for this.** This skill composes `doctor.py`'s existing output plus Glob/Grep — it doesn't spin one up on its own (Protocolo Script-First / Regra dos Três in `.agent/rules/DEVBUREAU.md`). If the same manual scan is requested 3 times, that's the signal to promote it to a real script via `skill-scaffolder`, registered in `.agent/SCRIPTS_REGISTRY.md` — not before.
3. **A false positive here is cheap to avoid, expensive to cause.** When in doubt whether something is truly orphaned (see "False-Positive Guardrails" below), say so and downgrade it from "candidate for removal" to "worth a human look," don't recommend deletion.
4. **Any removal that changes counts (agents/skills/workflows/scripts) triggers the doc-sync obligation** in `KIT_MASTER_RULES.md` rule 5: update `.agent/ARCHITECTURE.md`, README badges, and `CHANGELOG.md` in the same pass — `TestDocsSync` blocks the commit otherwise.

---

## 1. Run the Deterministic Baseline

Start with what already exists — don't re-derive it by hand:

```bash
python .agent/scripts/doctor.py
```

Read the "Cross-References" section and the new "Kit Health Score" summary. Ghost skill references doctor.py already flags are your first candidate list — no need to re-grep for those.

## 2. Scan Targets Beyond What doctor.py Covers

| Target | How to check | Signal |
|---|---|---|
| Orphaned skills | `Grep` each `skills:` frontmatter field across `.agent/agents/*.md`, plus `Grep` skill name across `.agent/workflows/*.md` and `.agent/rules/DEVBUREAU.md`'s REQUEST CLASSIFIER | Skill directory exists but no agent, workflow, or DEVBUREAU.md row references it |
| Orphaned scripts | Compare `.agent/scripts/*.py` and `.agent/skills/*/scripts/*.py` against `.agent/SCRIPTS_REGISTRY.md` | Script file on disk with no registry entry — dead or undocumented |
| Stale memory entries | Compare `.agent/memory/*.md` files against references in `lessons.md`, `gotchas.md`, `pattern-mining-log.md`'s merge-status table, and this session's own auto-memory index if applicable | A memory file nothing else links to or supersedes |
| Duplicate/near-duplicate skills | `Glob` skill names for overlapping topic words (e.g. two skills both covering "testing" or "deploy") | Read both `description:` fields — if the trigger conditions genuinely overlap, flag for a merge decision, not auto-removal |
| Nested skill families | `Glob` `.agent/skills/*/*/SKILL.md` (e.g. `game-development/pc-games`) | Never flag a nested sub-skill as orphaned just because its parent doesn't literally list every child by name in agent frontmatter — the parent orchestrator routes to it |

## 3. False-Positive Guardrails

Do NOT recommend removal when:

- The skill/script was added in the last 1-2 kit versions (`CHANGELOG.md`) and may not have accumulated references yet.
- The item is explicitly meta/kit-maintenance (`pattern-mining`, `skill-scaffolder`, `framework-benchmarking`, this skill itself) — these are invoked by slash command or direct user request, not necessarily referenced in agent frontmatter.
- A skill is referenced only via an alias or partial match `doctor.py`'s `check_cross_references()` already tolerates (documented behavior, not a bug).
- A nested skill is a child under a parent orchestrator skill (see table above).

## 4. Report, Then Confirm Each Item

Present findings as a numbered list, grouped by category (orphaned skill / orphaned script / stale memory / duplicate candidate), each with:
- What it is and where it lives (path).
- The evidence it's unreferenced (what you checked, what came back empty).
- A recommendation: **Remove**, **Merge into X**, or **Keep — flag as intentional standalone** (for the guardrail cases above).

Then ask the user to confirm per item (or approve a batch) before any `Edit`/`Bash rm` runs. After a confirmed removal:
1. Delete the file/directory.
2. Remove any now-broken cross-references (agent frontmatter, `SCRIPTS_REGISTRY.md`, `ARCHITECTURE.md` table row).
3. Update the doc-sync surface per Hard Rule 4.
4. Re-run `python .agent/scripts/doctor.py` and `python -m pytest .agent/tests/ -v` to confirm nothing broke.

---

## Anti-Patterns

- Deleting anything without a per-item confirmation, even if the user said "clean it all up" in general terms — general permission isn't per-item permission.
- Treating "no agent references this skill" alone as sufficient evidence — always cross-check workflows, DEVBUREAU.md, and the false-positive guardrails first.
- Building a new script to automate this scan before the Rule of Three has actually been triggered three times.
- Skipping the doc-sync step after a removal — an orphaned skill removed without updating `ARCHITECTURE.md`/README counts just creates a new drift for `TestDocsSync` to catch later.
