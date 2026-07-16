# DevBureau Architecture

> Comprehensive AI Agent Capability Expansion Toolkit

---

## 📋 Overview

DevBureau is a modular system consisting of:

- **23 Specialist Agents** - Role-based AI personas
- **78 Skills** - Domain-specific knowledge modules
- **29 Workflows** - Slash command procedures

---

## 🏗️ Directory Structure

```plaintext
.agent/
├── ARCHITECTURE.md          # This file
├── SCRIPTS_REGISTRY.md      # Deterministic tool inventory (Script-First Protocol)
├── agents/                  # 23 Specialist Agents
├── skills/                  # 78 Skills
├── workflows/                # 29 Slash Commands
├── rules/                   # Global Rules (DEVBUREAU.md P0)
├── scripts/                 # 9 Master Validation Scripts
├── tests/                   # Kit Integrity Tests
└── memory/                  # Persistent Memory Layer
```

---

## 🤖 Agents (23)

Specialist AI personas for different domains.

| Agent                       | Focus                       | Key Skills                                  |
| ---------------------------- | --------------------------- | -------------------------------------------- |
| `orchestrator`               | Multi-agent coordination     | parallel-agents, behavioral-modes, stack-sizing |
| `project-planner`             | Discovery, task planning     | brainstorming, plan-writing, stack-sizing      |
| `frontend-specialist`         | Web UI/UX                   | frontend-design, tailwind-patterns, nextjs-react-expert |
| `backend-specialist`          | API, business logic          | api-patterns, nodejs-best-practices, database-design |
| `database-architect`          | Schema, SQL                 | database-design                              |
| `api-designer`                | API contract design          | api-patterns, stack-sizing                   |
| `mobile-developer`            | iOS, Android, RN             | mobile-design                                |
| `game-developer`               | Game logic, mechanics        | game-development (+ 10 platform sub-skills)  |
| `devops-engineer`              | CI/CD, deployment            | deployment-procedures, server-management      |
| `sre-engineer`                 | Observability, incidents     | observability-patterns, stack-sizing          |
| `security-auditor`             | Security compliance          | vulnerability-scanner, red-team-tactics       |
| `penetration-tester`           | Offensive security           | red-team-tactics, vulnerability-scanner       |
| `test-engineer`                 | Unit/TDD testing strategies   | testing-patterns, tdd-workflow                |
| `qa-automation-engineer`       | E2E testing, CI pipelines     | webapp-testing, testing-patterns              |
| `accessibility-specialist`     | WCAG, ARIA, screen readers     | accessibility-standards, frontend-design       |
| `performance-optimizer`        | Speed, Web Vitals             | performance-profiling                         |
| `seo-specialist`               | Ranking, visibility           | seo-fundamentals, geo-fundamentals             |
| `debugger`                     | Root cause analysis           | systematic-debugging                          |
| `code-archaeologist`           | Legacy code, refactoring       | clean-code, code-review-checklist             |
| `documentation-writer`          | Manuals, docs                 | documentation-templates                        |
| `product-manager`              | Requirements, user stories, backlog | plan-writing, brainstorming               |
| `explorer-agent`               | Codebase analysis             | architecture, plan-writing                     |
| `content-creator`               | Marketing/social content       | humanizer, carousel-design-system, social-publisher |

---

## 🧩 Skills (78)

Modular knowledge domains that agents load on-demand, based on task context. Grouped here by theme; the authoritative source of truth for what exists is always `.agent/skills/` itself — run `python .agent/scripts/doctor.py` to verify this list against reality.

### Architecture & Planning

| Skill | Description |
| --- | --- |
| `app-builder` | Full-stack app scaffolding orchestrator — determines project type and routes to specialists |
| `architecture` | Architectural decision-making framework, trade-off evaluation, ADRs |
| `plan-writing` | Structured task planning with dependencies and verification criteria |
| `brainstorming` | Socratic questioning protocol for clarifying requirements |
| `behavioral-modes` | AI operational modes (brainstorm, implement, debug, review, teach, ship) |
| `parallel-agents` | Multi-agent orchestration patterns for independent/parallel tasks |
| `intelligent-routing` | Automatic agent selection based on request analysis |
| `skill-scaffolder` | Automated skill creation, discovery, and improvement — verify no duplicates exist, generate complete boilerplate for new skills or improvements to existing ones, optional benchmarking for objective skill outputs |
| `skillify` | Codifies a multi-step flow that just succeeded in the current session into a reusable artifact (script, skill, or workflow) — offer-then-confirm, never for flows that never ran |
| `stack-sizing` | Project-tier sizing (Prototype/MVP/Growth SaaS/Enterprise) and stack ceiling/floor per layer |
| `migration-strategy` | Picks the rollout approach (Strangler Fig, Big Bang, Parallel Run, Branch by Abstraction) for rebuilding/modernizing an existing legacy system |
| `effort-estimation` | Translates a task breakdown into a tier-aware time/cost range for non-technical stakeholders |
| `saas-stack-rules` | Stack-specific rules for the Next.js + FastAPI + Supabase + Stripe reference stack |
| `framework-benchmarking` | Process for comparing this kit against external agent-framework collections (`/benchmark`) and scoring gaps Adopt/Consider/Skip |
| `codebase-audit` | Senior-advisor survey across 9 categories (bugs, security, perf, tests, tech debt, deps, DX, docs, direction), vetted findings ranked by leverage, self-contained handoff plans (`/audit`) — never edits code itself |
| `using-git-worktrees` | Isolates work in its own workspace — detects existing isolation, prefers a native tool, falls back to plain `git worktree`, never fights the harness |
| `finishing-a-branch` | Structured close-out once work is done — merge/PR/keep/discard (`/finish-branch`), provenance-aware worktree cleanup |
| `writing-skills` | Authoring discipline for NEW skills going forward — description states when to use (not what it contains), RED-GREEN-REFACTOR validation against a real pressure scenario before adding to the catalog |
| `pattern-mining` | Extracts generalizable engineering patterns from a reference project the user points at (`/mine-patterns`), proposes a `lessons.md`/skill/agent destination per pattern, never auto-applies |
| `loop-forge` | Interviews the user and writes hardened agent-loop specs (`<name>-loop.md`) — but only after a mandatory Triple Gate (iteration, script-first, economics) discussed with the user; most requests fail the gate and get a cheaper alternative. Never executes loops |
| `squad-forge` | Designs and runs squads — reusable multi-agent teams for repeatable business processes (`squads/<name>/squad.md` pipelines mapping roles to the kit's 23 agents), with disk state (`state.json`) and human checkpoints (`/squad`) |
| `config-gc` | Human-in-the-loop garbage collection for the kit's own `.agent/` tree — scans for orphaned skills/scripts/memory files, confirm-each-deletion, never auto-deletes |

### Frontend & UI

| Skill | Description |
| --- | --- |
| `frontend-design` | Design thinking for web UI — layout, color, typography decisions |
| `hover-effects` | Pointer-driven micro-interaction recipes — ripple, spotlight, magnetic, scratch-off, particle/SVG hover effects |
| `web-design-guidelines` | UI code review against Web Interface Guidelines |
| `tailwind-patterns` | Tailwind CSS v4, CSS-first config, container queries, design tokens |
| `nextjs-react-expert` | React/Next.js performance optimization (internal skill name: `react-best-practices`) |
| `mobile-design` | Mobile-first design thinking for iOS/Android, touch interaction |
| `i18n-localization` | Internationalization — hardcoded string detection, locale files, RTL |
| `brand-identity-extractor` | Reverse-engineers a design system from a URL or reference image |
| `accessibility-standards` | WCAG 2.1/2.2, ARIA, keyboard navigation, contrast, screen reader testing |

### Premium Design

| Skill | Description |
| --- | --- |
| `premium-design-orchestrator` | Premium design direction orchestrator — niches, palettes, progressive disclosure |
| `premium-tech-stack` | The 5 Premium Pillars: GSAP, ScrollSmoother, Swup, Motion, Three.js |

### Backend & Languages

| Skill | Description |
| --- | --- |
| `api-patterns` | REST vs. GraphQL vs. tRPC selection, versioning, auth, rate limiting |
| `nodejs-best-practices` | Node.js framework selection, async patterns, security |
| `python-patterns` | Python framework selection, async patterns, type hints |
| `rust-pro` | Rust 1.75+, async patterns, ownership/type system |
| `mcp-builder` | Model Context Protocol server design — tools, resources, security |

### Database

| Skill | Description |
| --- | --- |
| `database-design` | Schema design, indexing strategy, ORM selection, serverless databases |

### Cloud, Infra & Observability

| Skill | Description |
| --- | --- |
| `deployment-procedures` | Safe deployment workflows, rollback strategies |
| `server-management` | Process management, monitoring strategy, scaling decisions |
| `observability-patterns` | Metrics, structured logging, tracing, alerting, SLOs, incident runbooks |

### Testing & Quality

| Skill | Description |
| --- | --- |
| `testing-patterns` | Unit/integration/E2E test strategy, AAA pattern, mocking |
| `webapp-testing` | E2E testing, Playwright, deep audit strategies |
| `tdd-workflow` | RED-GREEN-REFACTOR cycle, test-first development |
| `code-review-checklist` | Code review guidelines — quality, security, best practices |
| `receiving-code-review` | How to respond to review feedback — verify before implementing, no performative agreement, YAGNI-check "do it properly" suggestions |
| `confidence-scale` | Marks every claim a code-reading agent makes as CONFIRMED 🟢, INFERRED 🟡, or GAP 🔴; also covers vetting subagent-sourced findings before they carry a 🟢 |
| `lint-and-validate` | Linting and static analysis after every code change |
| `performance-profiling` | Measurement, Core Web Vitals, bundle/runtime profiling |

### Security

| Skill | Description |
| --- | --- |
| `vulnerability-scanner` | OWASP 2025, supply chain security, attack surface mapping |
| `red-team-tactics` | MITRE ATT&CK-based adversary simulation phases |

### AI & Agent Engineering

| Skill | Description |
| --- | --- |
| `ai-engineer` | Production LLM apps, RAG systems, vector search, agent orchestration |
| `agent-evaluation` | Behavioral testing and benchmarking for LLM agents |
| `agent-memory-mcp` | Persistent, searchable memory system for AI agents |
| `agent-orchestration-multi-agent-optimize` | Multi-agent system profiling, cost, and workload optimization |
| `machine-learning-ops-ml-pipeline` | End-to-end ML pipeline design |

### SEO & Growth

| Skill | Description |
| --- | --- |
| `seo-fundamentals` | SEO, E-E-A-T, Core Web Vitals, Google ranking factors |
| `geo-fundamentals` | Generative Engine Optimization — visibility in AI search (ChatGPT, Claude, Perplexity) |

### Game Development

| Skill | Description |
| --- | --- |
| `game-development` | Orchestrator routing to 10 nested platform skills: `pc-games`, `web-games`, `mobile-games`, `2d-games`, `3d-games`, `vr-ar`, `multiplayer`, `game-design`, `game-art`, `game-audio` |

### Content & Writing

| Skill | Description |
| --- | --- |
| `humanizer` | Detects and rewrites 33 catalogued AI-writing tells (em dashes, rule of three, inflated significance, AI vocabulary, sycophancy) in EN and PT-BR, with false-positive guardrails — for client-facing copy (posts, carousels, proposals, emails) before delivery |
| `content-research` | Native-tools-first research (WebSearch/WebFetch) for trending topics, competitor patterns, and citations; escalates to Apify only for scraping at a scale native tools can't handle |
| `carousel-design-system` | Design-system-first methodology for social/marketing visuals — platform viewport & typography specs (Instagram, LinkedIn, Stories), WCAG contrast rules, anti-patterns |
| `visual-renderer` | Deterministic HTML/CSS → PNG rendering via a headless-Chromium script (Script-First) — the generic engine behind any HTML-templated visual |
| `ai-image-generator` | AI image generation from text prompts via OpenRouter, test/production cost modes, reference-image support for brand consistency |
| `social-publisher` | Publishes/schedules social posts — native Instagram Graph API path (free, direct) plus an optional multi-platform aggregator path; publishing is always a checkpoint |
| `email-sender` | Transactional/marketing email via the Resend HTTP API — single/batch send, HTML/text, scheduling |

### Documentation & Debugging

| Skill | Description |
| --- | --- |
| `documentation-templates` | README, API docs, code comment structure |
| `systematic-debugging` | 4-phase debugging methodology with root cause analysis |

### Shell/CLI

| Skill | Description |
| --- | --- |
| `bash-linux` | Bash/Linux terminal patterns, critical commands |
| `powershell-windows` | PowerShell patterns, Windows-specific pitfalls |

### Strategy & Business (Vertical/Niche)

| Skill | Description |
| --- | --- |
| `startup-analyst` | Market sizing, financial modeling, competitive analysis for early-stage startups |
| `micro-saas-launcher` | Indie-hacker approach to launching small, focused SaaS products fast |

> These two are narrower in scope than the rest of the catalog — useful for specific business-strategy requests, not general engineering.

### Global

| Skill | Description |
| --- | --- |
| `clean-code` | Pragmatic coding standards applied across every agent |
| `lean-code-ladder` | 7-rung decision ladder (YAGNI → reuse → stdlib → native → existing dep → one-liner → minimum) for the smallest correct solution, calibrated by `stack-sizing` tier |
| `lean-audit` | Finds over-engineering to delete (diff or whole-repo scope) — `delete:`/`stdlib:`/`native:`/`yagni:`/`shrink:` tags, reports only |
| `lean-debt` | Harvests `lean:` shortcut-marker comments into a debt ledger so deferred simplifications don't rot into permanent |
| `karpathy-guidelines` | Karpathy's 4 LLM coding disciplines: think before coding, simplicity first, surgical changes (touch only what's requested), goal-driven execution with verifiable criteria |

---

## 🔄 Workflows (29)

Slash command procedures. Invoke with `/command`.

| Command          | Description                                          |
| ----------------- | ----------------------------------------------------- |
| `/ade`             | Autonomous Development Engine — 6-phase pipeline       |
| `/audit`           | Senior-advisor codebase survey, vetted findings ranked by leverage, self-contained handoff plans (no auto-apply) |
| `/benchmark`       | Compares the kit against external agent-framework collections, logs findings (no auto-apply) |
| `/brainstorm`      | Socratic discovery                                     |
| `/build-saas`      | Guided 7-step SaaS planning                            |
| `/clean`           | Auto-fix & format code (selective paths supported)      |
| `/create`          | Create new features/applications                       |
| `/debug`           | Systematic problem investigation                       |
| `/deploy`          | Pre-flight checks + guided deployment                   |
| `/enhance`         | Improve existing code/features                          |
| `/epic-claim`      | Claim a GitHub epic issue for one session/agent (coordination layer for `/squad`/`/ade`) |
| `/epic-decompose`  | Record an epic issue's checklist as a structured task list |
| `/epic-publish`    | Write the current coordination state back to an epic issue |
| `/epic-review`     | Record a review verdict on an epic issue's coordination state |
| `/epic-sync`       | Mirror epic issue state into a local read-only cache     |
| `/epic-unblock`    | Sweep blocked epics whose dependencies are now closed    |
| `/epic-validate`   | Check an epic issue is claimed and its dependencies are closed |
| `/finish-branch`   | Structured close-out (merge/PR/keep/discard) once work is done |
| `/lean-audit`      | Finds over-engineering to delete in the current diff (default) or the whole repo |
| `/lean-debt`       | Harvests `lean:` shortcut markers into a one-shot debt ledger |
| `/mine-patterns`   | Mines a reference project for generalizable engineering patterns, logs Adopt/Consider/Skip recommendations (no auto-apply) |
| `/new-project`     | Bootstrap a new project from this base                 |
| `/orchestrate`     | Multi-agent coordination                                |
| `/plan`            | Task breakdown without writing code                     |
| `/preview`         | Start/stop/monitor local dev server                     |
| `/squad`           | Create, run, and manage squads — reusable multi-agent teams for repeatable business processes (`squads/`) |
| `/status`          | Check project progress                                  |
| `/test`            | Generate and run tests                                  |
| `/ui-ux-pro-max`   | Design intelligence search (50 styles, 21 palettes, 50 fonts) — backed by `.agent/.shared/ui-ux-pro-max/`, not a skill folder |

---

## 🎯 Skill Loading Protocol

```plaintext
User Request → Skill Description Match → Load SKILL.md
                                            ↓
                                    Read references/
                                            ↓
                                    Read scripts/
```

### Skill Structure

```plaintext
skill-name/
├── SKILL.md           # (Required) Metadata & instructions
├── scripts/           # (Optional) Python/Bash scripts
├── references/        # (Optional) Templates, docs
└── assets/            # (Optional) Images, logos
```

### Skills With Scripts

17 of the 76 skills ship an executable script alongside their `SKILL.md`:

| Skill | Script(s) |
| --- | --- |
| `frontend-design`, `nextjs-react-expert`, `lint-and-validate` | 2 each |
| `api-patterns`, `database-design`, `geo-fundamentals`, `i18n-localization`, `mobile-design`, `performance-profiling`, `seo-fundamentals`, `testing-patterns`, `vulnerability-scanner`, `webapp-testing`, `visual-renderer`, `ai-image-generator`, `social-publisher`, `email-sender` | 1 each |

---

## 📂 Scripts (9 master + tests)

Master validation scripts that orchestrate skill-level scripts.

> **Full inventory with bilingual triggers and the Rule of Three governance:**
> `.agent/SCRIPTS_REGISTRY.md` — consult it before spending AI reasoning on a deterministic
> subtask (Script-First Protocol, DEVBUREAU.md).

### Master Scripts

| Script                  | Purpose                                   | When to Use                    |
| ----------------------- | ------------------------------------------ | -------------------------------- |
| `doctor.py`              | Kit health check — agents, skills, refs     | Always, before any work          |
| `checklist.py`           | Priority-based validation (core checks)      | Development, pre-commit          |
| `verify_all.py`          | Comprehensive verification (all checks)       | Pre-deployment, releases          |
| `sync_ide.py`            | Multi-IDE sync (Claude, Cursor, Codex, OpenCode, Copilot, Antigravity, Windsurf, Cline, Roo Code, Zed) | When updating the kit or its rules |
| `auto_fixer.py`          | Auto-fix & format code (selective paths)      | Before finalizing any task         |
| `auto_preview.py`        | Start/stop/monitor local dev server           | During development                |
| `session_manager.py`     | Project state, tech stack detection           | Status checks                     |
| `install_hooks.py`       | Installs the git pre-commit hook              | Once, after cloning/copying the kit |
| `token_footprint.py`     | Measures the approx. token cost of the kit's own generated rule files | Periodically, to watch context-footprint growth |

### Hooks (deterministic enforcement, not prose)

| Hook | Platform | Trigger | What it does |
| --- | --- | --- | --- |
| `install_hooks.py`'s git pre-commit | Git (any IDE) | `git commit` | Runs `doctor.py` + the kit integrity tests; blocks the commit on failure |
| `.agent/scripts/hooks/protect_generated_files.py` | Claude Code only (`.claude/settings.json`, `PreToolUse`) | Edit/Write/MultiEdit on an auto-generated file (`.claude/CLAUDE.md`, root `AGENTS.md`/`GEMINI.md`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, `.github/instructions/*`, `.windsurfrules`, `.clinerules`, `.roorules`, `.rules`) | Blocks the write, tells the agent which real source file to edit instead |
| `.agent/scripts/hooks/guard_worktree_path.py` | Claude Code only (`PreToolUse`) | Edit/Write/MultiEdit while `cwd` is inside a git worktree | Blocks the write if the target path is outside the current worktree's root — makes `using-git-worktrees`'s prose guard hard-blocking |
| `.agent/scripts/hooks/scan_injection.py` | Claude Code only (`PostToolUse`) | Read/WebFetch/WebSearch returns content | Advisory-only: prints a warning if known prompt-injection patterns or invisible Unicode are found, reinforcing DEVBUREAU.md's Untrusted Content Boundary — never blocks |
| `.agent/scripts/hooks/block_no_verify.py` | Claude Code only (`PreToolUse`) | Bash command containing `git ... --no-verify` or `-c core.hooksPath=` | Blocks the command — makes `CLAUDE.md`'s Git Safety Protocol ("NEVER skip hooks") hard-blocking instead of prose-only |
| `.agent/scripts/hooks/enforce_design_context.py` | Claude Code only (`PreToolUse`) | Edit/Write/MultiEdit on a UI file (`.css`/`.scss`/`.tsx`/`.jsx`/`.vue`/`.html`/`.dart`) in a project carrying `.agent/agents/` | Blocks the edit if the session transcript shows no Read of `frontend-specialist.md`/`mobile-developer.md` (or their design skills) — makes DEVBUREAU.md's Agent Routing Checklist step 2 hard-blocking for design work; self-correcting (read the agent file, retry passes), fails open without a transcript, never fires on `.agent/`/`.claude/` files |
| `.agent/scripts/hooks/warn_debug_statements.py` | Claude Code only (`PostToolUse`) | Edit/Write/MultiEdit on a `.ts`/`.tsx`/`.js`/`.jsx` file | Advisory-only: warns if the file still contains `console.log(...)` calls — never blocks |
| `.agent/scripts/hooks/auto_fix_on_edit.py` | Claude Code only (`PostToolUse`) | Edit/Write/MultiEdit on a recognized code file | Advisory-only: runs `auto_fixer.py` on the touched file automatically, fails silently if unavailable |
| `.agent/scripts/hooks/warn_generic_design.py` | Claude Code only (`PostToolUse`) | Edit/Write/MultiEdit on a `.css`/`.scss`/`.tsx`/`.jsx`/`.html`/`.vue` file | Advisory-only: warns on banned color families (purple/violet/indigo/magenta) or banned default UI library imports — reinforces `frontend-specialist.md`'s Purple Ban / No Default UI Libraries, never blocks |
| `.agent/scripts/hooks/detect_tool_loop.py` | Claude Code only (`PostToolUse`) | Edit/Write/MultiEdit/Bash/Grep/Read | Advisory-only: mirrors 2 rows of DEVBUREAU.md's Loop Detection Rules table (same tool+args+error 3×, Edit content-mismatch 2×) using per-session state in `_hook_state.py` — never blocks |
| `.agent/scripts/hooks/check_mcp_health.py` | Claude Code only (`PreToolUse` + `PostToolUse`) | Any `mcp__*` tool call | Advisory-only: tracks consecutive failures per MCP server, warns before a call if that server failed 3× in a row recently — never blocks |

> Cursor does not yet expose a pre-write blocking hook (`afterFileEdit` is informational only as of this writing), so the hooks above are Claude-Code-specific. See `.agent/memory/benchmark-log.md` (2026-06-26 and 2026-06-27 Run #6) for the research behind this.

### Kit Tests

| File                          | Purpose                                              |
| ------------------------------ | ------------------------------------------------------ |
| `tests/test_kit_integrity.py`  | Validates structure, frontmatter, and cross-references of agents/skills/workflows |

### Usage

```bash
# Quick health check
python .agent/scripts/doctor.py

# Quick validation during development
python .agent/scripts/checklist.py .

# Full verification before deployment
python .agent/scripts/verify_all.py . --url http://localhost:3000

# Kit integrity (after modifying .agent/)
python -m pytest .agent/tests/ -v

# Multi-IDE sync
python .agent/scripts/sync_ide.py --target all
```

### What They Check

**checklist.py** (Core checks):

- Security (vulnerabilities, secrets)
- Code Quality (lint, types)
- Schema Validation
- Test Suite
- UX Audit
- SEO Check

**verify_all.py** (Full suite):

- Everything in checklist.py PLUS:
- Lighthouse (Core Web Vitals)
- Playwright E2E
- Bundle Analysis
- Mobile Audit
- i18n Check

---

## 📊 Statistics

| Metric              | Value                                                  |
| -------------------- | --------------------------------------------------------- |
| **Total Agents**     | 23                                                         |
| **Total Skills**     | 78 (+ 10 nested under `game-development`)                  |
| **Total Workflows**  | 29                                                         |
| **Master Scripts**   | 10 (`doctor`, `checklist`, `verify_all`, `sync_ide`, `auto_fixer`, `auto_preview`, `session_manager`, `install_hooks`, `token_footprint`, `github_coordination`) |
| **Skills With Scripts** | 17                                                       |
| **Kit Tests**        | 1 file, parametrized (`test_kit_integrity.py`)              |
| **Memory Layer**     | `.agent/memory/` (lessons.md + gotchas.md + benchmark-log.md + pattern-mining-log.md) |

---

## 🔗 Quick Reference

| Need              | Agent                       | Skills / Scripts                          |
| ------------------ | ----------------------------- | -------------------------------------------- |
| Web App             | `frontend-specialist`         | nextjs-react-expert, frontend-design          |
| API Contract        | `api-designer`                 | api-patterns, stack-sizing                    |
| API Implementation  | `backend-specialist`           | api-patterns, nodejs-best-practices            |
| Mobile              | `mobile-developer`             | mobile-design                                 |
| Database            | `database-architect`           | database-design                               |
| Security            | `security-auditor`             | vulnerability-scanner                          |
| Accessibility       | `accessibility-specialist`      | accessibility-standards, frontend-design        |
| Testing             | `test-engineer`                 | testing-patterns, tdd-workflow                 |
| E2E/CI Testing      | `qa-automation-engineer`        | webapp-testing, testing-patterns                |
| Debug               | `debugger`                      | systematic-debugging                          |
| Monitoring/Incident  | `sre-engineer`                  | observability-patterns                         |
| Plan                | `project-planner`               | brainstorming, plan-writing, stack-sizing        |
| Social/marketing content | `content-creator`          | humanizer, carousel-design-system, visual-renderer, social-publisher |
| **Kit Health**      | *(script)*                     | `python .agent/scripts/doctor.py`              |
| **ADE**             | `orchestrator`                  | `/ade` workflow — 6-phase autonomous pipeline   |
| **Squads**          | *(any)*                        | `/squad` workflow — reusable teams (`squads/`)  |
