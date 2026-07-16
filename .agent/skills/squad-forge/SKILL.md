---
name: squad-forge
description: "Use when the user asks to create, run, or manage a squad — '/squad', 'create a squad', 'squad for <process>', 'monte uma equipe', 'crie um squad', 'rode o squad <nome>', 'equipe de agentes para <trabalho>'. Designs reusable multi-agent teams for ANY repeatable process (client websites, content production, reports, proposals) as squads/<name>/squad.md pipelines that map roles to the kit's 23 agents, then runs them step-by-step with disk state (state.json) and human checkpoints. Never invents a new persona when a kit specialist already covers the role. Out of scope: one-off tasks (use the agents directly) and recurring timed automation (use loop-forge)."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, PowerShell, AskUserQuestion
---

# Squad Forge

A squad is a named, reusable team of kit agents that executes a business process as a
pipeline with human checkpoints. This skill has two jobs: the **Architect** (designs and
writes squad definitions) and the **Runner** (executes them, one step at a time, with
state on disk so a run survives session restarts).

**Governing principle:** a squad COMPOSES what the kit already has — the 23 agents in
`.agent/agents/` and the skills in `.agent/skills/`. The squad file adds only what the kit
cannot know: the sequence, the deliverables, the checkpoints, and the client-specific
context. If a step needs expertise no agent covers, say so explicitly instead of
improvising a persona.

## Directory layout (per squad)

```plaintext
squads/
└── <squad-name>/
    ├── squad.md        # Definition: pipeline, roles, checkpoints (the Architect writes this)
    ├── state.json      # Current run state (the Runner writes this; one active run at a time)
    └── output/         # Deliverables produced by the run (PRDs, proposals, briefs, reports)
```

Code deliverables (an actual website/app) do NOT go in `output/` — they live in their own
project folder/repo; `output/` holds the documents and `state.json` records the project path.

> `state.json` assumes one active run on one disk. If a squad's work needs to coordinate
> across multiple sessions/agents that don't share disk, see `/epic-claim`/`/epic-sync`
> (GitHub Issues coordination, optional, does not replace `state.json`).

---

## Phase A — Architect (create / edit)

**Trigger:** `/squad create`, `/squad edit <name>`, or a natural-language ask.

1. **Interview (Socratic Gate, business language only).** Ask, one at a time, at most 5:
   goal of the process, who the end client/audience is, expected deliverables, what "done"
   means, and where human approval is non-negotiable. Never ask technical questions
   (framework, ORM) — those are decided by the specialist agents during the run.
2. **Design the pipeline.** For each step assign: a kit agent (exact name from
   `.agent/agents/`), the skills it should load, the input it receives, the deliverable it
   writes to `output/`, and whether a checkpoint follows. Checkpoint placement follows the
   user's chosen mode (see below) PLUS the Matriz de Decisão: anything irreversible
   (deploy, publish, spend, delete) is ALWAYS a checkpoint with the risk translated to
   business language, regardless of mode.
3. **Present the design for approval** as a plain-language table (step → who → delivers →
   pauses?). Only after an explicit "yes", write `squads/<name>/squad.md` from the template
   in `references/squad-template.md`.

**Checkpoint modes** (recorded in the squad frontmatter):
- `key-points` (default) — pauses only at business decisions named in the pipeline.
- `every-step` — pauses after every step.
- `autonomous` — pauses only at irreversible actions (which can never be waived).

## Phase B — Runner (run / resume)

**Trigger:** `/squad run <name>`, "rode o squad <nome>".

1. **Load** `squads/<name>/squad.md`. If `state.json` exists with `status != "done"`,
   resume from `current_step`; otherwise initialize a fresh `state.json`.
2. **Execute steps strictly in order.** For each step:
   - Announce `🤖 Applying knowledge of @[agent]...`, read that agent's `.md` file and its
     listed skills (only the ones for THIS step — context discipline).
   - Do the work; write the deliverable to `output/` (or the project folder for code).
   - Update `state.json` (step status, artifact paths, timestamp) BEFORE moving on.
3. **At a checkpoint:** stop all tool calls, summarize what was produced in 1-3 business
   sentences, state what happens next and what it costs/risks, and wait for approval.
   Record the verdict in `state.json` (`approved` / `changes-requested` + notes).
4. **Evidence rule (Zero-Break):** an engineering step only counts as done with fresh
   command output (tests, build, checklist.py) pasted in the conversation — a step's own
   claim of success is not evidence.
5. **Terminal states:** `done` (all steps complete), `awaiting-approval` (checkpoint),
   `blocked` (impediment the user must resolve — never silently skip a step). An error is
   never marked `done`.

### state.json schema

```json
{
  "squad": "<name>",
  "status": "running | awaiting-approval | blocked | done",
  "current_step": 3,
  "total_steps": 8,
  "step_label": "Aprovar proposta",
  "project_path": "<path to code project, if any>",
  "steps": [
    { "id": 1, "agent": "product-manager", "status": "done",
      "artifacts": ["output/01-prd.md"], "updated": "<ISO date>" }
  ],
  "checkpoints": [
    { "after_step": 2, "verdict": "approved", "notes": "" }
  ]
}
```

## Rules

- **Reuse over invention:** every role maps to an existing agent; the cross-reference is
  the agent table in `.agent/ARCHITECTURE.md`.
- **One squad, one process.** A squad that needs a fundamentally different pipeline per run
  is two squads.
- **Multiple clients:** re-running a squad for a new client = new run of the same
  `squad.md` (archive the previous `state.json` + `output/` into `output/_archive/<date>/`
  first, after asking).
- **List/status:** `/squad list` = enumerate `squads/*/squad.md` with one-line goals;
  `/squad status <name>` = read `state.json` and report progress in business language.
- **Token discipline:** the Runner loads only the current step's agent + skills, never the
  whole catalog. Squad files stay under ~150 lines.
