# OPERATIONS_DETAIL.md — Detalhe operacional sob demanda

> Conteúdo movido do core `DEVBUREAU.md` na dieta de contexto (v3.26.0) para reduzir o custo
> fixo por sessão. As regras do core continuam P0 e apontam para cá; leia APENAS a seção
> relevante quando a regra correspondente for acionada. Não injetar este arquivo inteiro.

---

## Validação Seletiva — comandos e tipos de mudança

**Modo rápido (dev):**
```bash
python .agent/scripts/checklist.py . --selective --change-type component
# Roda: lint (arquivo), pytest (testes do componente), lighthouse (core web vitals)
# Pula: security scan completo, playwright, outros
# Tempo: ~30s vs 2m 30s (5x mais rápido)
```

**Modo pré-commit:**
```bash
python .agent/scripts/checklist.py . --pre-commit
# Roda: lint (arquivos alterados), pytest (módulos afetados), security scan (diffs)
# Tempo: ~45s
```

**Modo deploy (completo):**
```bash
python .agent/scripts/verify_all.py
# Roda: TUDO (lint, pytest, lighthouse, playwright, security, etc)
# Tempo: 3-5 min (necessário antes de publicar)
```

**Tipos de mudança suportados:**
- `logic` → Lint + pytest (unidade)
- `api` → Lint + pytest (integração)
- `component` → Lint + pytest + lighthouse + playwright
- `style` → Lint + lighthouse + playwright
- `database` → Lint + pytest (completo) + security
- `config` → Nenhum teste (manual apenas)
- `docs` → Nenhum teste
- `refactor` → Lint + pytest (se escopo grande)

**Referência completa:** `.agent/memory/test-strategy-by-change-type.md`.

---

## Code Quality Standards — detalhe completo

> Versão condensada vive no core (TIER 1). Regras completas também em `@[skills/clean-code]`.

### Functions & Methods
- Functions MUST do ONE thing only — if you need "and" to describe it, split into two
- Maximum 20 lines per function. Above that, extract sub-functions
- Maximum 3 arguments per function — above that, group into object/dataclass/Pydantic model
- Functions MUST NOT have hidden side effects (mutating global state, modifying mutable arguments silently)
- Function names MUST be descriptive verbs: `create_subscription()`, `validate_input()` — never `process()`, `handle()`, `do()`

### Naming & Readability
- Names MUST reveal intent: `elapsed_time_in_days` not `d`, `is_active_subscription` not `flag`
- Classes/models with noun names: `Subscription`, `UserProfile` — avoid `Manager`, `Helper`, `Data`, `Info`
- No ambiguous abbreviations: `usr`, `mgr`, `tmp` — write in full
- Consistent naming: if you used `get_user` in one module, don't use `fetch_user` in another without reason

### Error Handling
- Use exceptions instead of return codes — keep logic clean
- NEVER return None/null to indicate error — raise exception with clear message
- Try/except MUST be specific: catch `ValueError`, `HTTPException` — NEVER generic `except Exception` (except in top-level catch-all)
- Domain errors MUST use custom exceptions: `SubscriptionExpiredError`, `QuotaExceededError`

### Structure & Organization
- Law of Demeter: NEVER chain `a.get_b().get_c().do_something()` — create direct method
- One file, one responsibility: don't mix routes + service + schemas in the same file
- Imports organized: stdlib → third-party → local (Python) / react → libs → components → utils (TypeScript)
- Dead code (unused functions, unused imports, commented variables) MUST be removed, not commented

### Type Safety
- Python: type hints mandatory on all functions and variables. No generic `Any`.
- TypeScript: strict mode enabled. No `any`, no `@ts-ignore`, no `as unknown as`.

### Security Basics (Universal)
- Secrets and API keys exclusively in `.env` — NEVER hardcoded, NEVER committed to git
- `.env.example` MUST exist with all required variables, without real values
- NEVER expose internal IDs (user_id, session_id) in browser console
- NEVER log sensitive data in console.log (tokens, emails, passwords, internal IDs)
- Error messages returned to frontend NEVER expose stack traces, SQL queries, or internal structure
- Sensitive environment variables NEVER have `NEXT_PUBLIC_` prefix

### Documentation
- Every new finished feature MUST be documented in README.md: feature name, short description, and flow
- Document ONLY features — not internal refactors, config changes, or style adjustments
- README MUST have a `## Features` section with updated feature list

---

## Final Checklist Protocol — tabelas completas

| Task Stage       | Command                                            | Purpose                           |
| ---------------- | -------------------------------------------------- | --------------------------------- |
| **Kit Health**   | `python .agent/scripts/doctor.py`                  | Diagnóstico de saúde do kit       |
| **Cleaning**     | `python .agent/scripts/auto_fixer.py .`            | Auto-fix lint & formatting        |
| **Kit Tests**    | `python -m pytest .agent/tests/ -v`                | Valida integridade do .agent/     |
| **Manual Audit** | `python .agent/scripts/checklist.py .`             | Priority-based project audit      |
| **Pre-Deploy**   | `python .agent/scripts/checklist.py . --url <URL>` | Full Suite + Performance + E2E    |
| **IDE Sync**     | `python .agent/scripts/sync_ide.py --target all`   | Sincroniza kit para Claude/Cursor |

**Batch no fim, não por edição:** `auto_fixer.py`/`checklist.py --selective` rodam **uma vez**,
sobre todos os caminhos alterados na tarefa, pouco antes de finalizar — nunca após cada Edit/Write
individual. Rodar a cada edição multiplica custo de tokens/tempo sem ganho: o objetivo é o estado
final dos arquivos tocados, não um checkpoint por escrita.

**Inventário completo de scripts (15):** ver `.agent/SCRIPTS_REGISTRY.md` — fonte única; a
tabela por skill que vivia no core foi consolidada lá.

> 🔴 Agents & Skills podem invocar qualquer script via `python .agent/skills/<skill>/scripts/<script>.py`
> 🔴 Kit Master Scripts via `python .agent/scripts/<script>.py`

---

## Gemini Mode Mapping — detalhe

| Mode     | Agent             | Behavior                                     |
| -------- | ----------------- | -------------------------------------------- |
| **plan** | `project-planner` | 4-phase methodology. NO CODE before Phase 4. |
| **ask**  | -                 | Focus on understanding. Ask questions.       |
| **edit** | `orchestrator`    | Execute. Check `{task-slug}.md` first.       |

**Plan Mode (4-Phase):** 1. ANALYSIS (research, questions) → 2. PLANNING (`{task-slug}.md`,
task breakdown) → 3. SOLUTIONING (architecture, design, NO CODE) → 4. IMPLEMENTATION (code + tests).

> 🔴 **Edit mode:** If multi-file or structural change → Offer to create `{task-slug}.md`.
> For single-file fixes → Proceed directly.

---

## GateGuard — enforcement externo opcional

[GateGuard](https://github.com/zunoworks/gateguard) (`pip install gateguard-ai && gateguard init`,
third-party, não bundled) é um hook `PreToolUse` que bloqueia a primeira tentativa de Edit/Write/Bash
em mudança arriscada e exige fatos concretos de investigação (importers, schema, plano de rollback)
antes de liberar o retry — a mesma ideia "investigação cria consciência que auto-avaliação não cria"
da tabela de evidências do Zero-Break, só que enforçada. Registra em `~/.claude/settings.json`
(escopo de usuário), então não colide com os hooks de projeto do DevBureau em `.claude/settings.json`.

---

## Quick Reference — listas completas

### Agents & Skills
- **Masters**: `orchestrator`, `project-planner`, `security-auditor` (Cyber/Audit), `backend-specialist` (API/DB), `frontend-specialist` (UI/UX), `mobile-developer`, `debugger`, `game-developer`
- **Key Skills**: `clean-code`, `brainstorming`, `app-builder`, `frontend-design`, `mobile-design`, `plan-writing`, `behavioral-modes`, `saas-stack-rules`, `loop-forge` (especifica loops de agente com triple gate), `skillify` (codifica um fluxo de sessão bem-sucedido em artefato reutilizável)

### Key Scripts
- **Kit Health**: `.agent/scripts/doctor.py` → diagnóstico completo do kit
- **Kit Tests**: `python -m pytest .agent/tests/test_kit_integrity.py -v`
- **IDE Sync**: `.agent/scripts/sync_ide.py --target [claude|cursor|codex|copilot|all]`
- **Verify**: `.agent/scripts/verify_all.py`, `.agent/scripts/checklist.py`
- **Scanners**: `security_scan.py`, `dependency_analyzer.py`
- **Audits**: `ux_audit.py`, `mobile_audit.py`, `lighthouse_audit.py`, `seo_checker.py`
- **Test**: `playwright_runner.py`, `test_runner.py`

### Workflows (/slash commands)
- `/brainstorm` `/create` `/debug` `/deploy` `/enhance` `/orchestrate`
- `/plan` `/preview` `/status` `/test` `/ui-ux-pro-max`
- `/ade` → **ADE Pipeline Autônomo** (req → spec → impl → qa → memory)
- `/build-saas` → SaaS completo em 7 etapas
- `/finish-branch` → também gera `.agent/memory/retro-log.md` (Step 6), só no repo do próprio kit

### Memory Layer — arquivos completos
- `lessons.md` / `gotchas.md` / `question-preferences.md` — já referenciados no core
- `benchmark-log.md` — histórico de runs de `/benchmark` (kit-vs-kit) e de Skill Re-Audit (qualidade interna)
- `retro-log.md` — síntese datada de commits + lições novas, gerada por `finishing-a-branch` Step 6
