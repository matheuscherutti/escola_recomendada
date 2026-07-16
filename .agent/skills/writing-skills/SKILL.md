---
name: writing-skills
description: Use when authoring a NEW skill for the kit — how to write the description (when to use, not what it does) and how to validate the skill actually changes behavior under pressure, not just that the file is well-formed.
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Writing Skills

> Scope: applies to skills created from now on. The existing 62 skills are not being retrofitted — heavy lift, no evidence the existing skills are failing in practice.

## The Core Problem

`.agent/tests/test_kit_integrity.py` checks that a skill *exists* and is well-formed (frontmatter present, file readable). It never checks that the skill actually changes an agent's behavior the way it's supposed to. A skill can pass every structural test and still be useless — or worse, get silently skipped — if its description is shaped wrong or its instructions don't address the actual failure mode.

## Rule 1: Description = When to Use, Not What It Does

The `description:` field in frontmatter is the only thing an agent sees before deciding whether to open the skill body. If it reads like a summary of the skill's contents, the agent treats the summary as good enough and never reads the body — it follows its own guess at what the skill says instead of what the skill actually says.

```yaml
# Wrong — summarizes the skill, invites the agent to skip the body
description: This skill covers root-cause analysis, the four debugging phases, and an escalation path after repeated failures.

# Right — states the trigger condition, nothing about the content
description: Use when investigating a bug, especially after a fix attempt fails or you're tempted to guess at a fix without reproducing the symptom first.
```

Test it by asking: "Does this sentence tell the agent *when* to reach for this skill, or does it tell the agent *what's inside*?" If it's the latter, rewrite it.

## Rule 2: RED → GREEN → REFACTOR for Skill Authoring

Borrowed directly from TDD, applied to a markdown skill instead of a function:

1. **RED** — Before writing the skill, run the actual pressure scenario the skill is meant to fix, *without* the skill present. Document the agent's real failure verbatim (the rationalization it used, the shortcut it took, the wrong assumption it made).
2. **GREEN** — Write the smallest skill addressing exactly that documented failure. Not a general best-practices essay — a targeted fix for the specific rationalization observed in RED.
3. **REFACTOR** — Re-run the same pressure scenario with the skill present. If the agent finds a loophole (a slightly different phrasing of the same shortcut), close that specific loophole. Don't generalize preemptively for failures you haven't observed.

This catches the failure mode where a skill *sounds* right (reads well, covers the topic) but doesn't actually change behavior because it never addressed the specific rationalization an agent reaches for under pressure.

## Self-Review Before Adding to the Catalog

Before registering a new skill in `.agent/ARCHITECTURE.md` and `.agent/skills_guide.md`:

- [ ] Description states a trigger condition, not a content summary (Rule 1)
- [ ] At least one pressure scenario was run without the skill, and the failure is documented somewhere (commit message, this skill's own notes, or `.agent/memory/gotchas.md`)
- [ ] The skill's instructions map directly to that documented failure — no unrelated best-practices padding
- [ ] `python .agent/scripts/doctor.py` passes with the new skill counted

## What This Does NOT Require

- Retrofitting the existing 62 skills — out of scope by explicit decision (see Run #5, item 2).
- A formal test harness or automated pressure-scenario runner — this is a authoring discipline, not new tooling. Running the scenario can be as simple as asking the same question in a fresh session once with the skill absent, once with it present, and comparing.
