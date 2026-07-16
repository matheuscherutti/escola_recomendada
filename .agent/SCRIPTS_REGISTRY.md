# SCRIPTS_REGISTRY.md — Deterministic Tool Inventory

> **Purpose:** Before spending AI reasoning (tokens) on any subtask, check whether a script here
> already solves it deterministically. A script runs in milliseconds, costs zero tokens after it
> exists, and always returns the same answer for the same input.
>
> This registry backs the **Script-First Protocol** in `.agent/rules/DEVBUREAU.md`
> (section "⚡ EFICIÊNCIA OPERACIONAL", item 5). Discovery is the whole point: a script the
> model cannot find at the right moment might as well not exist — keep triggers current.

---

## Decision Criterion: Script vs. AI Reasoning

A task belongs to a script when it is **deterministic AND repeatable**:

| Question | Script | AI Reasoning |
|---|---|---|
| Same input always gives same correct output? | ✅ Required | ❌ Not required |
| Will the task recur (3+ occurrences)? | ✅ Required | One-offs stay inline |
| Examples | count, validate, diff, format, measure, scan, parse | naming, design, trade-offs, refactoring judgment, root-cause reasoning |

**Building a script for a one-off task costs MORE tokens than doing it inline.** The economics
only close with reuse — see Governance (Rule of Three) at the bottom of this file.

---

## Master Scripts (`.agent/scripts/`)

Invoke: `python .agent/scripts/<script>.py`

| Script | What it does | Triggers (EN / PT-BR) |
|---|---|---|
| `doctor.py` | Kit health check — agents, skills, refs, structure | "kit health", "diagnose kit" / "diagnóstico", "checar kit", "saúde do kit" |
| `checklist.py` | Priority-based validation (security, lint, schema, tests); supports `--selective`, `--pre-commit` | "validate project", "run checks" / "validar projeto", "rodar verificações" |
| `verify_all.py` | Full pre-deploy suite (everything + Lighthouse + Playwright + bundle) | "final verification", "pre-deploy" / "verificação final", "antes de publicar" |
| `auto_fixer.py` | Auto-fix lint & formatting on given paths | "fix formatting", "clean code style" / "arrumar formatação", "limpar lint" |
| `auto_preview.py` | Start/stop/monitor local dev server | "preview", "dev server" / "abrir preview", "servidor local" |
| `session_manager.py` | Project state & tech-stack detection | "project status", "what stack" / "status do projeto", "qual stack" |
| `sync_ide.py` | Regenerates IDE rule files (Claude, Cursor, Codex, Copilot…) from `.agent/` sources | "sync IDE", "propagate rules" / "sincronizar IDE", "propagar regras" |
| `install_hooks.py` | Installs the git pre-commit hook (doctor + kit tests) | "install hooks" / "instalar hooks" |
| `token_footprint.py` | Measures approx. token cost of the kit's generated rule files | "token cost", "context footprint" / "custo de tokens", "pegada de contexto" |
| `github_coordination.py` | GitHub Issues-backed epic coordination (claim/decompose/validate/publish/review/unblock/sync) for `/squad`/`/ade` work spanning multiple sessions/agents; wraps `gh` CLI | "coordinate this epic", "claim this issue" / "coordenar esse epic", "reivindicar essa issue" |
| `validation_config.py` | Support module: central config for selective validation (not invoked directly) | — (imported by `checklist.py`) |

## Skill Scripts (`.agent/skills/<skill>/scripts/`)

Invoke: `python .agent/skills/<skill>/scripts/<script>.py`

| Script | Skill | What it does | Triggers (EN / PT-BR) |
|---|---|---|---|
| `security_scan.py` | vulnerability-scanner | Secrets, OWASP patterns, PII scan (`--scan-type pii`) | "scan security", "check secrets" / "verificar segurança", "vazou segredo" |
| `dependency_analyzer.py` | vulnerability-scanner | Vulnerable/outdated dependency report | "audit dependencies" / "auditar dependências" |
| `lint_runner.py` | lint-and-validate | Lint + static analysis on given paths | "lint", "static analysis" / "rodar lint" |
| `type_coverage.py` | lint-and-validate | % of functions/variables with type hints (TS/Python) | "type coverage" / "cobertura de tipos" |
| `test_runner.py` | testing-patterns | Runs the test suite (selective paths supported) | "run tests" / "rodar testes" |
| `playwright_runner.py` | webapp-testing | E2E browser tests | "E2E", "browser test" / "teste ponta a ponta" |
| `schema_validator.py` | database-design | Validates DB schema/migrations | "validate schema" / "validar schema", "migração" |
| `api_validator.py` | api-patterns | Validates API contract/spec consistency | "validate API contract" / "validar contrato de API" |
| `ux_audit.py` | frontend-design | Heuristic UX audit on UI code | "UX audit" / "auditoria de UX" |
| `accessibility_checker.py` | frontend-design | WCAG/a11y static checks | "accessibility check" / "checar acessibilidade" |
| `react_performance_checker.py` | nextjs-react-expert | React/Next.js performance anti-pattern scan | "react performance" / "performance do React" |
| `convert_rules.py` | nextjs-react-expert | Utility: converts rule formats for the skill | — (internal utility) |
| `lighthouse_audit.py` | performance-profiling | Core Web Vitals / Lighthouse run | "lighthouse", "web vitals" / "medir performance" |
| `bundle_analyzer.py` | performance-profiling | Bundle size analysis | "bundle size" / "tamanho do bundle" |
| `seo_checker.py` | seo-fundamentals | On-page SEO checks | "SEO check" / "verificar SEO" |
| `geo_checker.py` | geo-fundamentals | Generative Engine Optimization checks | "GEO check" / "visibilidade em IA" |
| `i18n_checker.py` | i18n-localization | Hardcoded strings, locale coverage | "i18n check" / "checar tradução" |
| `mobile_audit.py` | mobile-design | Mobile UI/UX audit | "mobile audit" / "auditoria mobile" |
| `verify_similar_skills.py` | skill-scaffolder | Finds existing skills matching an intent (anti-duplicate) | "similar skill exists?" / "já existe skill?" |
| `scaffold_new_skill.py` | skill-scaffolder | Generates skill boilerplate | "scaffold skill" / "gerar esqueleto de skill" |
| `benchmark_skill.py` | skill-scaffolder | Measures a skill with/without (pass rate, time, tokens) | "benchmark skill" / "medir skill" |

> Enforcement hooks (pre-commit, PreToolUse/PostToolUse) are documented in
> `.agent/ARCHITECTURE.md` → "Hooks"; they run automatically and are not invoked by hand.

---

## Governance: Rule of Three (how this arsenal grows)

Scripts are born from proven demand, never from speculation. A speculative script is dead
maintenance weight.

| Occurrence of a deterministic task | Action |
|---|---|
| 1st time | Solve inline. No script. |
| 2nd time | Solve inline AND flag to the user: "this recurred — candidate for a script". |
| 3rd time | Promote to script: create it (via `skill-scaffolder` if it belongs to a skill), register it HERE with EN + PT-BR triggers. |

**Promotion checklist** (all must be true):
1. Deterministic — same input, same correct output, no judgment involved.
2. Recurred 3+ times (or the user explicitly ordered the script).
3. Stable input/output contract that can be expressed as CLI arguments.

**Measurement instead of projection:** when claiming a script saved effort, measure — use
`benchmark_skill.py` for before/after comparisons and `token_footprint.py` to watch the kit's
own context cost. Never quote savings percentages without a measurement behind them.

**Registry hygiene:** a script that is deleted or renamed MUST be removed/updated here in the
same change (File Dependency Awareness, DEVBUREAU.md).

---

## What does NOT belong here

Judgment tasks stay with agents: naming, architecture and trade-off decisions, design/UX taste,
refactoring strategy, root-cause hypotheses, anything where two senior engineers could
reasonably disagree. Routing natural-language requests is itself a judgment task — which is why
this registry is consulted BY the model during routing, not replaced by a router script.
