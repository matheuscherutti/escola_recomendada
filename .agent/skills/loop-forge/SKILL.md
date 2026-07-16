---
name: loop-forge
description: "Use when the user asks to create/write an agent loop — 'create a loop', 'agent loop', 'run until', 'keep iterating until', 'autonomous loop', 'overnight loop', 'coverage loop', 'crie um loop', 'forja um loop', 'loop autônomo', 'rodar sozinho até', 'automatizar tarefa repetitiva com verificação'. Interviews the user and WRITES the loop spec (<name>-loop.md), but ONLY after a mandatory Triple Gate (iteration test, script-first test, economic test) proves a loop is justified — most requests fail the gate and get a cheaper alternative (script, one-shot, scheduled prompt). Never executes the loop itself or handles one-off tasks."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, PowerShell, AskUserQuestion
---

# Loop Forge

Writes hardened agent-loop specifications — but its FIRST job is deciding, together with the
user, whether a loop should exist at all. Loops are the most token-expensive construct in the
kit (cost = turns × cost-per-turn, multiplied again by sub-loops), so this skill is a gatekeeper
first and a spec writer second.

**What it produces:** a single document `<name>-loop.md` (the full loop specification), never a
running loop and never an executable skill. **What it refuses to produce:** a loop for a task
that a script, a one-shot prompt, or a scheduled prompt solves cheaper.

## Governing principle

The core capability of a loop is not the prompt — it is the **check that decides when the work
is done**, running OUTSIDE the agent's own head. Golden rule: **if no new feedback changes the
next action, it is not a loop, it is a scheduled prompt.** A loop with no external push-back is
an agent agreeing with itself.

---

## Phase 0 — TRIPLE GATE (mandatory, discussed WITH the user, before anything else)

All three gates run as a conversation, not a silent checklist. Present the verdict of each gate
in plain business language. **A loop is only specified if ALL THREE pass.** This phase respects
the Socratic Gate and the Matriz de Decisão in DEVBUREAU.md: a loop consumes money over many
turns, so activating one without an explicit user "go" is forbidden.

### Gate 1 — Iteration test
Ask: **"does the result of each turn change the next action?"**
- **No** → not a loop. Deliver a scheduled prompt (the task + the cadence) or a one-shot, say
  why, and stop here.
- **Yes** → next gate.

### Gate 2 — Script-first test (connects to `.agent/SCRIPTS_REGISTRY.md`)
Two questions, in order:
1. **"Can the WHOLE task be done by a deterministic script?"** If yes → no loop. Route to the
   Script-First Protocol (DEVBUREAU.md): use an existing registry script or, if the task has
   recurred, propose creating one. A loop wrapping a fully deterministic task is pure waste.
2. **"Can the loop's CHECK be a deterministic script?"** (test run, lint, count, diff, registry
   script). Strongly prefer yes — a loop whose only verifier is LLM judgment is where reward
   hacking and self-deception live. If the check must be judgment-based, it gets hardened in
   Phase 2, and the user must be told the loop is riskier and costlier.

### Gate 3 — Economic test
Estimate and SHOW the user, in one short table or sentence:
- expected number of turns (be pessimistic),
- rough cost per turn,
- the cheaper alternative and its cost (manual one-shot, script, scheduled prompt).

Decision rules:
- **Fewer than 3 expected turns** → almost never worth a loop; recommend doing it directly.
- **3–10 turns with a deterministic check** → loop territory.
- **More than 10 turns** → possible, but budget ceiling and fresh-context strategy (Ralph
  skeleton) become mandatory topics before proceeding.

Then **wait for the user's explicit approval before moving to Phase 1.** If any gate failed,
deliver the cheaper alternative and stop — that is a success of this skill, not a failure.

---

## Phase 1 — Interview (one question at a time, never the whole list at once)

Cover these eight, adapting language to the case:

1. **Goal.** The concrete final state. Optional: **Inputs** the loop asks the user at start
   (target, theme, iteration count); autonomous loops have none.
2. **Verifiable?** Is success a number/test/command, or judgment? (judgment → harden in Phase 2).
3. **Check.** Which command proves a turn worked? Prefer deterministic; prefer a script already
   in `SCRIPTS_REGISTRY.md` (e.g. `test_runner.py`, `lint_runner.py`, `security_scan.py`).
4. **Trigger.** Manual, scheduled, or event-driven?
5. **Stop states.** Besides success: no-progress, blocked, budget-exhausted.
6. **Named skills/agents called inside.** A loop must compose named kit skills and agents
   (`.agent/skills/`, `.agent/agents/`), not improvise from scratch each turn. Optional:
   **sub-loops** (name of each `<name>-loop.md`, same folder; budget multiplies).
7. **Memory.** Where state lives between turns (a file on disk: progress, decisions, attempts).
8. **Guardrails.** Turn/cost ceiling, and where human approval is required. Apply the Matriz de
   Decisão: any turn that deploys, deletes data, spends money, or touches production is
   **EXIGIR + TRADUÇÃO** — the loop must stop and ask, with the risk translated to business
   language.

## Phase 2 — Hardening (apply before writing)

- **External check instead of self-score.** Without external feedback, self-correction stalls or
  inflates its own grade. The stop condition must come from a check that runs outside the
  agent's head — never "I think it looks good".
- **Evidence in the transcript.** The loop must RUN the check and PASTE its output into the
  conversation every turn; the stop condition is written over that evidence (an evaluator reads
  the transcript, it does not run commands).
- **If the goal depends on an LLM judge, harden it:** frozen rubric; generator separated from
  judge (distinct sessions/models); broken context symmetry (the judge never sees the maker's
  history — shared context is what triggers reward hacking).
- **Named terminal states:** success / no-progress (e.g. 2 turns without measurable gain) /
  blocked / exhausted. **An error or a blown budget is NEVER success.**
- **One change per turn; worst first; snapshot the "before"** as a comparable baseline.
- **Sub-loops nest with multiplicative ceilings** (parent turns × child turns) and cycles are
  forbidden: a sub-loop never calls, directly or indirectly, its caller.
- **Memory on disk**, so the loop survives fresh-context restarts.
- **Health metric:** cost per accepted change = tokens (or R$) spent ÷ changes that survived the
  check. A loop that burns without accepted changes is broken. Measure (e.g. with
  `benchmark_skill.py` on the composed skills); never quote savings without measurement.

## Phase 3 — Trigger form (goes inside the document's "How to trigger" section)

- Fits in one context window (short/medium work) → a **`/goal`-style prompt** that fires the
  loop and pins the stop condition.
- Long work (many turns; quality degrades past ~100–150k tokens) → a **Ralph skeleton**: a shell
  loop that re-reads the spec + disk state each turn with fresh context (isolated sandbox and
  budget ceiling required).

## Phase 3.5 — Where to save (ask BEFORE writing)

Ask, one at a time, in prose:
1. **Location:** local `./loops/<name>-loop.md` (project-specific) or global
   `~/.claude/loops/<name>-loop.md` (callable from any project; on Windows
   `C:\Users\<user>\.claude\loops\`). Create the folder if missing.
2. **Create a `/loop-<name>` command?** If yes, write `loop-<name>.md` into the matching
   commands folder (`./.claude/commands/` or `~/.claude/commands/`): frontmatter with
   `description` and `argument-hint`, body referencing the loop document by absolute path,
   instructing to read it first, ask/pin the inputs, paste the check output each turn, and
   honor the stop states (error or blown budget is never success), with `$ARGUMENTS` for inline
   inputs.

## Phase 4 — Write `<name>-loop.md`

Write ONE file with this skeleton. Every section is mandatory except **Inputs** (omit entirely
for autonomous loops); where something does not apply, write "does not apply" and why — silence
hides holes. Write the document in the user's language.

```markdown
---
nome: <loop-name>
categoria: <e.g. Coverage | Refactoring | Evaluation | Multi-agent>
gatilho: <manual | scheduled | event>
base-teorica: <sources backing the design, if any>
---

# <Readable loop name>

## Descrição            <what it does, 1–2 sentences>
## Use quando           <the concrete situation worth running it>
## Entradas (OPTIONAL)  <only if the loop asks the user for values at start>
## Meta                 <concrete final state; verifiable? yes/no — if no, hardened below>
## Verificação (o check que manda)
  Every turn, RUN the check and PASTE the output — that is the evidence the stop reads.
  - **Check:** `<deterministic command — prefer a SCRIPTS_REGISTRY.md script>` OR <hardened judge>.
  - **Pronto =** <condition read from that output>.
## Passos da volta
  0. Setup (only if Inputs, 1st turn): ask and pin inputs for the whole run.
  1. Snapshot current state (baseline).  2. Rank worst-first target.
  3. Make ONE change, calling named skills <skills> or a declared sub-loop.
  4. Run the check, paste output.  5. Keep only if nothing regressed; else revert.
  6. Record progress in <state file>.
## Estados de parada    sucesso / sem-progresso (2 turns no gain) / bloqueado / esgotado (<N turns / budget>)
                        (Error or blown budget is NEVER success.)
## Guardrails           ceiling <N turns / R$ X>; human approval before <irreversible/production/financial/external>
## Memória / estado     <disk file: progress, decisions, attempts>
## Sub-loops (OPTIONAL) <`<sub>-loop.md` in the SAME folder; parent ceiling counts nesting; no cycles>
## Por que funciona     <which failure mode each design decision prevents>
## Como acionar         </goal prompt for short loops | Ralph skeleton for long ones>
## Métrica de saúde     cost per accepted change = tokens (or R$) ÷ changes that survived the check
```

## Final output to the user

Deliver: (1) the Triple Gate verdict and, if any gate failed, the cheaper alternative that was
delivered instead; (2) if passed, the `<name>-loop.md` document saved at the chosen location,
with its path; (3) the optional `/loop-<name>` command path and how to trigger it; (4) the
health metric to watch. Failing the gate and delivering something cheaper is this skill working
as designed.
