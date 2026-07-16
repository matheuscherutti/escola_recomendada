# Behavioral Alignment — Wave 2 (✅ Complete)

> Registered: 2026-06-30. Execute in a future session via `/mine-patterns` or manually.
> **2026-07-01: Source 4 executed and merged.** See `.agent/memory/pattern-mining-log.md` entry "2026-07-01 — Anthropic prompt engineering docs" for the full patterns table and Adopt/Consider/Skip breakdown (5 principles merged into `DEVBUREAU.md`, `orchestrator.md`, and `ai-engineer/SKILL.md`; `sync_ide.py --target all` + `doctor.py` run afterward).
> **2026-07-01: Sources 1-3 executed and merged in the same session.** See `.agent/memory/pattern-mining-log.md` entries "2026-07-01 — PatrickJS/awesome-cursorrules", "2026-07-01 — aider-chat/aider", and "2026-07-01 — continuedev/continue" (plus the "Wave 2 close-out note" at the end of the log). 9 net-new principles merged across `DEVBUREAU.md`, `backend-specialist.md`, `devops-engineer.md`, `explorer-agent.md`, `testing-patterns/SKILL.md`, and `lessons.md`. 2 items logged as Consider, deliberately not merged, pending a human decision: FastAPI layered-architecture defaults for `backend-specialist.md`, and a glob/regex-scoped skill-frontmatter convention (kit-wide structural change, overlaps the Domain Overlap Detection table). `sync_ide.py --target all` + `doctor.py` run afterward.
>
> **All 4 sources of Wave 2 are now done.** This file is kept for historical record; no further action pending except the two Consider items above if the user decides to act on them.

## Context

Wave 1 was executed and closed the following behavioral gaps in DevBureau:
- Auto-fixer hook: `auto_fix_on_edit.py` runs automatically after every `Edit`/`Write`
- Domain Overlap Detection table added to DEVBUREAU.md routing section
- Gate Decision table added to Socratic Gate (ask vs. proceed with declared assumption)

## Wave 2: External Framework Mining

Four sources to mine in priority order. Each source should be analyzed for principles
genuinely absent from DevBureau. Principles already covered (Socratic Gate, Lean Code,
Surgical Changes, Zero-Break, etc.) should be noted but not duplicated.

### Source 1: PatrickJS/awesome-cursorrules
- URL: https://github.com/PatrickJS/awesome-cursorrules
- Why: Aggregates `.cursorrules` from hundreds of teams in production — most likely to
  surface domain-specific conventions DevBureau hasn't seen (e.g., specific stacks,
  testing patterns, AI pair programming habits).
- Expected yield: 5-8 new principles

### Source 2: aider-chat/aider
- URL: https://github.com/aider-chat/aider / https://aider.chat/docs/
- Why: Mature autonomous coding tool (2+ years), conventions refined through real
  repository work. Strong on context management and edit discipline.
- Expected yield: 3-5 new principles

### Source 3: continue-dev/continue
- URL: https://github.com/continue-dev/continue
- Why: Large VS Code AI extension user base. Strong on context window management,
  diff review patterns, and AI pair programming in long-lived codebases.
- Expected yield: 3-4 new principles

### Source 4: Anthropic prompt engineering guides — ✅ DONE (2026-07-01)
- URL: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering
  (redirects to https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- Why: First-party guidance from the model manufacturer. May reveal sub-optimal
  patterns in current kit prompting or missing best practices.
- Yield: 6 net-new principles merged (5 unique destinations), 6 correctly skipped as
  already covered, 2 logged as Consider. Full breakdown in `pattern-mining-log.md`.

## Execution Protocol (per source)

1. Clone or fetch the source to scratchpad
2. Read the key files (CLAUDE.md, .cursorrules, README, docs/conventions)
3. Extract principles not already covered in DevBureau
4. For each net-new principle: decide if it belongs as a new skill, a DEVBUREAU.md
   addition, or an agent frontmatter update
5. Update `pattern-mining-log.md` with source URL, date, and what was extracted
6. Run `sync_ide.py --target all` and `doctor.py` after each source

## Success Criteria

- `pattern-mining-log.md` has dated entries for all 4 sources
- At least 5 net-new principles integrated into the kit
- `doctor.py` passes after all additions
- DevBureau coverage estimated at 90%+ of publicly available best practices
