---
description: Create, run, and manage squads — reusable multi-agent teams for repeatable business processes (client websites, content, reports). Menu with create/run/list/status/edit, powered by the squad-forge skill.
---

# /squad — Squad Management

You are now in **SQUAD MODE**. Read `.agent/skills/squad-forge/SKILL.md` FIRST — it defines
the Architect (create/edit) and Runner (run/resume) protocols. This workflow only routes.

## Arguments
$ARGUMENTS

## Routing

| Input | Action |
|-------|--------|
| *(empty)* | Show the menu below, plus `/squad list` output if any squad exists |
| `create` or a description | Phase A (Architect): interview → design → approval → write `squads/<name>/squad.md` |
| `run <name>` | Phase B (Runner): load squad.md, init/resume state.json, execute pipeline |
| `list` | Enumerate `squads/*/squad.md` — name + goal, one line each |
| `status <name>` | Read `squads/<name>/state.json`, report progress in business language |
| `edit <name>` | Phase A on the existing file — show current design, ask what changes, re-approve |

## Menu (when called with no arguments)

```plaintext
🏢 DevBureau Squads
1. Criar novo squad        → /squad create
2. Rodar um squad          → /squad run <nome>
3. Ver squads existentes   → /squad list
4. Status de uma execução  → /squad status <nome>
5. Editar um squad         → /squad edit <nome>
```

## Hard rules

1. **Never run without a definition** — `run <name>` with no `squads/<name>/squad.md` →
   offer `create` instead.
2. **Checkpoints are non-negotiable** for irreversible actions (deploy, publish, spend,
   delete), regardless of the squad's checkpoint-mode (Matriz de Decisão, DEVBUREAU.md).
3. **State on disk before progress** — update `state.json` after every step, so any session
   can resume with `/squad run <name>`.
4. **Business language at every pause** — checkpoints summarize in 1-3 sentences what was
   made, what comes next, and what it risks/costs (Tradutor de Risco).

## Exit gate (before reporting a run as finished)

- All pipeline steps `done` in `state.json`, every declared deliverable exists in `output/`
  (or the project folder), and engineering steps have fresh command evidence in the
  conversation. Error or skipped step is NEVER reported as success.
