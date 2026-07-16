# Pattern Mining Log — DevBureau

> Dated record of `/mine-patterns` runs. Each entry mines one reference project for generalizable engineering patterns to import into DevBureau's own knowledge base. Never auto-applied — a human decides what merges. Full methodology in `.agent/skills/pattern-mining/SKILL.md`.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — [repo name/URL]

**Repo:** path or URL, stack, maturity signals observed
**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| [pattern] | 🟢/🟡/🔴 | `file:line` or dir | lessons.md / skill/agent name | Adopt/Consider/Skip |

**Adopt (ready for follow-up):** ...
**Consider (needs a decision):** ...
**Skip:** ...
```

---

## 🔀 Status de Merge — Knowledge Base Sync

> Quando um cluster de itens Adopt deste log é efetivamente incorporado ao kit, ele é registrado aqui com data e destino. Antes de reportar um padrão como "novo" numa futura sessão de `/mine-patterns`, confira esta tabela — o tema pode já estar coberto, mesmo que sob outro nome.

| # | Cluster mesclado | Itens-fonte subsumidos (repo) | Destino no kit | Status |
|---|---|---|---|---|
| 1 | Ground LLM output against verifiable facts (parsing tolerante em camadas, descarte de alegação sem evidência, piso determinístico, consenso ponderado) | frank_fbi, frank_investigator, FrankSherlock, llm-coding-benchmark, tropicalruby-2026 | `ai-engineer/SKILL.md` (Safety), `gotchas.md` | ✅ Merged 2026-06-28 |
| 2 | Invariants cite the bug they prevent | ai-memory | `documentation-templates/SKILL.md` §8, `lessons.md` | ✅ Merged 2026-06-28 |
| 3 | Defense-in-depth como checklist numerado e documentado | ai-jail, FrankClaw, FrankSherlock | `security-auditor.md` | ✅ Merged 2026-06-28 |
| 4 | Self-improvement loop com trilha de auditoria + eval gate | ai-memory | `agent-evaluation/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 5 | Markdown como fonte de verdade, índice derivado reconstruível | ai-memory, frank_type, akitaonrails.github.io | `architecture/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 6 | Completude estrutural ≠ correção em runtime; teste verde pode mentir | llm-coding-benchmark | `agent-evaluation/SKILL.md`, `testing-patterns/SKILL.md`, `gotchas.md` | ✅ Merged 2026-06-28 |
| 7 | Fail toward caution / degradação graciosa | frank_fbi, frank_investigator, ai-jail, FrankClaw | `security-auditor.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 8 | Config centralizada: schema tipado + resolvedor único | FrankMD, distrobox-gaming, ai-memory, ai-jail, ai-usagebar | `saas-stack-rules/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 9 | Disciplina de leitura de segredos | ai-usagebar, ai-jail, llm-coding-benchmark, ghpending | `security-auditor.md`, `gotchas.md` | ✅ Merged 2026-06-28 |
| 10 | UPDATE condicional atômico para limite/contador sob concorrência | FrankMega, ai-memory, frank_investigator | `database-design/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 11 | Teste na fronteira / testes herméticos | FrankMD, ai-usagebar, frank_investigator | `testing-patterns/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 12 | Fan-out limitado + timeout em duas camadas para chamadas externas | ghpending | `api-patterns/rate-limiting.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| 13 | Sanitização de filename + trust-no-client em upload | FrankMega, FrankSherlock | `security-auditor.md`, `gotchas.md` | ✅ Merged 2026-06-28 |
| 14 | Migrações de schema append-only | FrankSherlock | `database-design/migrations.md`, `gotchas.md` | ✅ Merged 2026-06-28 |
| 15 | Compat retroativa para config gerada pelo usuário | ai-jail | `migration-strategy/SKILL.md`, `gotchas.md` | ✅ Merged 2026-06-28 |
| 16 | Scorer multi-dimensional para roteamento de modelo | FrankClaw | — | 🔶 Em hold (decisão de produto pendente) |

**Lote 2 — itens Consider mesclados em 2026-06-28:**

| # | Cluster mesclado | Itens-fonte subsumidos (repo) | Destino no kit | Status |
|---|---|---|---|---|
| C1 | Três níveis de risco de ferramenta (ReadOnly/Mutating/Destructive) | FrankClaw | `security-auditor.md` | ✅ Merged 2026-06-28 |
| C2 | Gates operacionais para execuções longas sem supervisão | llm-coding-benchmark | `agent-evaluation/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C3 | Máquina de estados de job com auto-reparo | FrankClaw | `agent-evaluation/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C4 | Pipeline em DAG com dependências explícitas por fase | frank_fbi | `architecture/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C5 | Nunca persistir automaticamente um override pontual | ai-jail | `lessons.md` | ✅ Merged 2026-06-28 |
| C6 | Checklist de docs-sync | frank_investigator | `documentation-templates/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C7 | AGENTS.md único vs. sync por IDE | FrankMD | `lessons.md` (registrado como decisão aberta) | 📝 Documentado, NÃO decidido — ver `lessons.md` "Decisão pendente" |
| C8 | Lições e becos-sem-saída como dado durável | distrobox-gaming | `gotchas.md` (nota no formato de entrada) | ✅ Merged 2026-06-28 |
| C9 | Backup-antes-de-sobrescrever como built-in de script | distrobox-gaming, ai-memory | `deployment-procedures/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C10 | Avaliação em duas fases (gerar, depois forçar validação) | llm-coding-benchmark | `agent-evaluation/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C11 | Reavaliar histórico quando uma regra de auditoria estava errada | llm-coding-benchmark | `agent-evaluation/SKILL.md`, `pattern-mining/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C12 | Path pessoal absoluto vazado em config commitada | frank_fbi | `gotchas.md` | ✅ Merged 2026-06-28 |
| C13 | Reescrita cirúrgica de config gerada pelo usuário | FrankMD | `lessons.md` | ✅ Merged 2026-06-28 |
| C14 | Config local do usuário sempre 0600 por padrão | ghpending | `security-auditor.md` | ✅ Merged 2026-06-28 |
| C15 | Preflight fail-fast antes de provisionar | distrobox-gaming | `deployment-procedures/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C16 | "Toda ferramenta nova precisa ganhar o slot" (MCP) | ai-memory | `mcp-builder/SKILL.md` | ✅ Merged 2026-06-28 |
| C17 | Notas de release citam CVE de dependência transitiva | FrankMD | `deployment-procedures/SKILL.md`, `lessons.md` | ✅ Merged 2026-06-28 |
| C18 | Template de prompt com restrição negativa explícita | FrankMD | `ai-engineer/SKILL.md` | ✅ Merged 2026-06-28 |

Itens da lista "baixa prioridade" do lote 2 (concorrência estruturada Rust, hot-reload `arc_swap`, plugin por trait, CDP, Strategy para WebView, versionamento por commit count, seleção de modelo por hardware, venv isolado, `cfg`-gating, mask-vs-deny, mount-order, detect-and-defer tmux/zellij, outlier-gating, proveniência anti-scraping, i18n YAML plano, índice-de-frontmatter, interface-compat com predecessor, cred resolution "name-both-options", IP via proxy, cache de blocklist, stack Solid leve, bootstrap admin, deploy dual-target) permanecem **não mescladas** — avaliadas como amarradas a stack específica ou redundantes com itens já cobertos.

Todo Adopt/Consider não listado nesta tabela permanece **pendente** — ainda não avaliado para merge.

---

## 2026-06-28 — akitaonrails/FrankMD (https://github.com/akitaonrails/FrankMD)

**Repo:** Shallow clone. Stack: Ruby on Rails 8.1, importmap (no JS build step), Stimulus + CodeMirror 6, Propshaft, Tailwind, `ruby_llm`, Puma + Thruster, Kamal deploy. **Maturity signals:** 450 Ruby (Minitest+Mocha) + 1,393 JS (Vitest) tests; single `bin/ci` running rubocop + brakeman + bundler-audit + importmap audit + both suites; per-release notes tracking transitive CVE bumps (e.g. `releases/v0.3.6.md`); dual contributor guide (AGENTS.md + thin CLAUDE.md). **License:** MIT (permissive — no IP/licensing concern for pattern extraction).

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Centralize every configurable value in one typed `SCHEMA` with a single resolver (`file > ENV > default`); forbid direct `ENV[...]` reads anywhere else | 🟢 | `app/models/config.rb:10` SCHEMA + `:239 get`; rule in `AGENTS.md` | `lessons.md` (config/secrets) | Adopt |
| Route all filesystem access through one `safe_path` chokepoint: strip `..`, `cleanpath`, assert resolved path starts with base dir | 🟢 | `app/services/notes_service.rb:181` | `security-auditor` agent / `red-team-tactics` | Adopt |
| Multi-provider LLM config: clear ALL provider keys before setting the active one, because the SDK's `configure` is additive (cross-contamination gotcha) | 🟢 | `app/services/ai_service.rb:186` `configure_client` | `gotchas.md` + `ai-engineer` | Adopt |
| Test at the boundary, not the OS: permission failures stubbed as `Errno::EACCES` via Mocha, never real `chmod`; `Config` stubbed via `Config.stubs(:new)` | 🟢 | `AGENTS.md` "Don't"/"Testing patterns" | `testing-patterns` skill | Adopt |
| Tightly-scoped LLM system prompt with explicit negative constraints ("DO NOT change facts/style/markdown; return ONLY corrected text") | 🟢 | `app/services/ai_service.rb:6` GRAMMAR_PROMPT | `ai-engineer` agent | Consider |
| Surgical rewrite of a user-owned config file: only touch changed keys, preserve comments/blank lines/formatting, un-comment a key when it gains a value | 🟢 | `app/models/config.rb:469` `save_keys` | `lessons.md` | Consider |
| ActiveModel without ActiveRecord — `Note`/`Folder` are validated models backed by files, not a DB (use the model layer even with no database) | 🟢 | `app/models/note.rb:3` | `architecture` skill | Consider |
| Single local CI entrypoint (`bin/ci`) that mirrors the full remote pipeline; "always run before pushing" | 🟢 | `README.md` Dev section, `AGENTS.md` | `lint-and-validate` / `deployment-procedures` | Consider (overlaps DevBureau's existing pre-commit guard + `verify_all.py`) |
| Tool-agnostic `AGENTS.md` as the single source, with a thin `CLAUDE.md` that just points to it | 🟢 | `CLAUDE.md`, `AGENTS.md` | `documentation-writer` / sync_ide approach | Consider (alternative to DevBureau's per-IDE sync; worth contrasting, not adopting blindly) |
| Per-release notes that explicitly log transitive-dependency CVE bumps with the CVE class | 🟢 | `releases/v0.3.6.md` | `deployment-procedures` | Consider |
| Hotwire convention: server-rendered DOM updates via Turbo Streams only (never build HTML in JS from JSON); controller-to-controller via Stimulus Outlets | 🟢 | `AGENTS.md`, `app/javascript/controllers/app_controller.js:40` | — | Skip (stack-bound to Hotwire; DevBureau frontend skills are React/Tailwind) |

---

## 2026-06-28 — akitaonrails/FrankMega (https://github.com/akitaonrails/FrankMega)

**Repo:** Shallow clone. Stack: Ruby on Rails 8.1, SQLite3, Solid Queue/Cache/Cable (zero external services — no Redis/Postgres/S3), Active Storage, Tailwind, Hotwire, Rack::Attack, secure_headers, webauthn + rotp + bcrypt, administrate, Kamal deploy, behind Cloudflare Tunnel. **Maturity signals:** Minitest + factory_bot + shoulda-matchers + simplecov; Lefthook git hooks (rubocop/brakeman/bundler-audit pre-commit, full tests pre-push); env-tiered security with a documented prod/dev table in README; security-focused integration tests called out in `docs/IDEA.md`. **License:** MIT (permissive — no IP/licensing concern).

**Note on overlap with FrankMD entry above:** same author/stack family, so config-cascade, filename-sanitization-chokepoint, single-CI-entrypoint, and lean-self-hosting patterns recur. Logged again only where FrankMega shows a *materially stronger or different* instance; pure repeats are marked Skip (redundant) to avoid double-counting at merge time.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Atomic conditional UPDATE to enforce a limit under concurrency — single `update_all` guarded by `WHERE count < max AND not expired`, success = "1 row changed"; no check-then-act TOCTOU | 🟢 | `app/models/shared_file.rb:46` `increment_download!` | `lessons.md` + `database-design` | Adopt |
| Re-derive file content-type from actual bytes server-side (Marcel/MiniMime), never trust the client-declared MIME; validate id/chunk-index/chunk-size/final-size at every step of a resumable upload | 🟢 | `app/services/chunked_upload_store.rb` (`complete!`, `write_chunk!`) | `api-patterns` + `security-auditor` | Adopt |
| Defense-in-depth filename sanitization: basename-only, encoding scrub, strip control/traversal/reserved chars, escape Windows reserved names (CON/PRN/…), fix extension by real MIME, byte-aware truncation to 255 | 🟢 | `app/services/upload_filename_sanitizer.rb` | `security-auditor` / `red-team-tactics` | Adopt |
| Threshold auto-ban decoupled from the request: async job increments a per-IP cache counter with TTL, bans once threshold crossed, then clears the counter | 🟢 | `app/jobs/invalid_hash_access_job.rb` + `app/models/ban.rb:16` `ban!` | `red-team-tactics` + `lessons.md` | Adopt |
| OTP replay prevention — reject a valid TOTP whose timestamp ≤ `last_otp_at` so a code can't be reused within its drift window | 🟢 | `app/models/user.rb` `verify_otp` | `security-auditor` | Adopt |
| Environment-tiered security knobs in one `config.x.security` object (prod vs dev: rate multiplier, ban duration, banning on/off, attempt limits), with the table documented in README | 🟢 | `config/initializers/security.rb` + README table | `lessons.md` / `saas-stack-rules` | Adopt |
| Cached blocklist lookup — wrap the per-request "is this IP banned?" DB check in a short `Rails.cache.fetch` (1 min) and invalidate on ban!, so Rack::Attack doesn't hit the DB every request | 🟢 | `app/models/ban.rb:9` `banned?` | `performance-profiling` / `lessons.md` | Consider |
| Lean self-hosting: Solid Queue/Cache/Cable on SQLite instead of Redis+Postgres+S3 — recurring background cleanup (`recurring.yml`) purges expired files/bans/chunks on a schedule | 🟢 | `Gemfile`, `config/recurring.yml` | `stack-sizing` / `saas-stack-rules` | Consider (aligns with DevBureau lean-code-ladder ethos) |
| First-run bootstrap admin — a setup route that only works while `User.count.zero?`, makes the first user admin, then invite-only thereafter (single-tenant onboarding without a seed step) | 🟢 | `app/controllers/setup_controller.rb` + `app/models/user.rb` `sole_admin?` | `lessons.md` | Consider |
| Proxy-aware real client IP (trust Cloudflare ranges) so rate limiting/banning targets the real client, not the proxy | 🟡 | README + `config/initializers/cloudflare.rb` (not opened; inferred from README + gem) | `lessons.md` / `deployment-procedures` | Consider |
| Lefthook git hooks gating commits/pushes (lint+security pre-commit, full tests pre-push) | 🟡 | `lefthook.yml` (present; behavior from README, file not opened) | `lint-and-validate` | Skip (redundant with DevBureau's existing pre-commit guard) |
| Config-cascade / single-CI-entrypoint / lean-stack patterns shared with FrankMD | 🟢 | same-author conventions | — | Skip (already captured in FrankMD entry) |

**Adopt (ready for follow-up):**
1. Atomic conditional UPDATE for limit enforcement → `lessons.md` + `database-design` (the canonical fix for "decrement a counter / claim a slot" races).
2. Trust-no-client upload validation (re-derive MIME from bytes, validate every chunk step) → `api-patterns` + `security-auditor`.
3. Filename-sanitization defense-in-depth checklist → `security-auditor` / `red-team-tactics`.
4. Async threshold auto-ban via cache counter → `red-team-tactics` + `lessons.md`.
5. OTP replay prevention → `security-auditor` (subtle, commonly missed).
6. Env-tiered security config object + documented prod/dev table → `lessons.md` / `saas-stack-rules`.

**Consider (needs a decision):** cached blocklist lookup (performance-profiling); lean Solid-stack + recurring cleanup (stack-sizing, overlaps lean-code-ladder); first-run bootstrap admin (lessons.md); proxy-aware real IP (🟡, confirm by reading `cloudflare.rb` before merging).

**Skip:** Lefthook hooks (redundant with DevBureau guard); config-cascade / single-CI / lean-stack patterns already logged under FrankMD.

**Adopt (ready for follow-up):**
1. Config schema pattern → new `lessons.md` entry (single typed schema + single resolver + ban on scattered `ENV` reads).
2. `safe_path` traversal chokepoint → strengthen `security-auditor`/`red-team-tactics` with the "one validated FS chokepoint" guidance.
3. Additive-SDK key-clearing gotcha → `gotchas.md` entry (applies to any multi-provider LLM setup, including DevBureau's own).
4. Boundary-stubbing test pattern (`Errno::EACCES` via mock, not `chmod`) → `testing-patterns`.

**Consider (needs a decision):** scoped-negative-constraint prompt template (ai-engineer); surgical config-file rewrite (lessons.md); ActiveModel-without-DB (architecture); `bin/ci` single entrypoint (overlaps existing guard); AGENTS.md-as-source vs per-IDE sync (philosophical contrast); CVE-tracking release notes.

**Skip:** Hotwire/Turbo-Streams frontend convention — real and well-executed, but stack-specific and doesn't transfer to DevBureau's React-oriented frontend guidance.

---

## 2026-06-28 — akitaonrails/frank_type (https://github.com/akitaonrails/frank_type)

**Repo:** Shallow clone. Stack: Rails 8.1 but **à-la-carte** (depends on `railties`/`actionpack`/`actionview`/`activemodel` only — no full `rails` gem, no ActiveRecord, no DB), Propshaft, importmap, Hotwire/Stimulus, Tailwind, Thruster, Kamal. Local-first: all user history in browser localStorage. **Maturity signals:** Ruby tests (Minitest) for services + JS tests via Node's built-in `node --test` runner (zero JS test deps); `bin/ci` runs rubocop + brakeman + bundler-audit + importmap audit + SimpleCov; CHANGELOG present; corpus governance notes in README (Gutenberg sourcing rules, attribution metadata required per excerpt). **License:** MIT.

**Note on overlap:** same author/Rails-8 family as FrankMD/FrankMega, so importmap+Hotwire+Tailwind, `bin/ci`, and Docker-first patterns recur → Skip as redundant. Logged here only where frank_type is materially different (no-DB-via-à-la-carte-Rails, file-based corpus, browser-side analytics).

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| À-la-carte Rails: depend on `railties`/`actionpack`/`actionview`/`activemodel` instead of the full `rails` gem when there's no DB/mailer/jobs — smaller image, fewer CVEs, clearer intent | 🟢 | `Gemfile` (no `rails`, no `activerecord`) | `stack-sizing` / `saas-stack-rules` | Adopt |
| Immutable value objects with Ruby 3.2 `Data.define` for read-only domain records (excerpts), instead of `Struct`/`OpenStruct`/PORO | 🟢 | `app/services/typing/excerpt_catalog.rb:2` | `lessons.md` / `clean-code` | Adopt |
| File-tree-as-database: content lives in `config/excerpts/<lang>/<category>/<speed>.yml`; loader derives taxonomy from the path, with attribute fallback; versioned `Rails.cache` keys (`/v3`) for cheap cache-busting on schema change | 🟢 | `excerpt_catalog.rb` (`load_records`, `records`) | `architecture` / `lessons.md` | Adopt |
| Locale-specific Unicode normalization: NFKC + transliterate + strip for English vs NFC (preserve accents/diacritics) for pt-BR — normalization form is a per-language decision, not global | 🟢 | `app/services/typing/text_normalizer.rb` | `i18n-localization` skill | Adopt |
| Bounded client-side history: keep N detailed records, then compact older ones into weighted daily summaries; cap total; `sampleCount` weight preserves averages across compaction | 🟢 | `app/javascript/lib/storage/session_store.js` (`compact`, `weightedAverage`) | `lessons.md` (frontend data) | Adopt |
| Treat browser storage as fallible: every `localStorage` read/write wrapped in try/catch that degrades gracefully (private mode / quota full), never throws into the UI | 🟢 | `session_store.js` (`readRaw`, `save`, `persistCompaction`) | `lessons.md` / `frontend-design` | Adopt |
| Zero-dependency JS unit tests via Node's built-in `node --test` runner (`.test.mjs`), pure logic modules extracted from Stimulus controllers to stay testable without a DOM | 🟢 | `package.json` `"test"`, `test/javascript/*.test.mjs`, `app/javascript/lib/typing/*` | `testing-patterns` | Adopt |
| Statistical robustness in analytics: median/percentile + clamping over raw means for the digraph heat map, with min/max latency gates to discard outliers (paste bursts, pauses) | 🟡 | `app/javascript/lib/typing/metrics.js` | `lessons.md` | Consider |
| Data-governance metadata required with every content record (title/author/source/source_url/copyright) + explicit "don't scrape, use official feeds" rule | 🟢 | README "Corpus notes"; `Excerpt` fields | `lessons.md` / `documentation-templates` | Consider |
| importmap + Hotwire + Tailwind, `bin/ci`, Docker-first deploy | 🟢 | same-author conventions | — | Skip (already captured under FrankMD/FrankMega) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. À-la-carte Rails when no DB → `stack-sizing` (concrete lean-dependency example).
2. `Data.define` immutable value objects → `clean-code`/`lessons.md`.
3. File-tree-as-DB + path-derived taxonomy + versioned cache keys → `architecture`.
4. Per-language Unicode normalization (NFKC vs NFC) → `i18n-localization`.
5. Bounded localStorage history via weighted daily-summary compaction → `lessons.md`.
6. Fail-safe browser-storage access (try/catch, graceful degrade) → `frontend-design`.
7. Zero-dep `node --test` for logic modules split out of controllers → `testing-patterns`.

**Consider (needs a decision):** median/percentile + outlier-gating for analytics (lessons.md); per-record provenance metadata + anti-scraping sourcing policy (documentation-templates).

**Skip:** shared same-author Rails-8 conventions already captured in earlier entries.

---

## 2026-06-28 — akitaonrails/frank_fbi (https://github.com/akitaonrails/frank_fbi)

> ⚠️ **License: AGPL-3.0 (copyleft, NOT permissive).** Earlier repos in this log were MIT. Extraction here is limited to engineering *patterns described in my own words* — no literal code/prose lifted. If any of these patterns were ever to be implemented, do it as a clean-room re-implementation of the idea; AGPL covers the source, not the general technique. The repo is also a third party's (Fabio Akita), not this user's own code.

**Repo:** Shallow clone. Stack: Rails 8.1 **headless** (Action Mailbox + Action Mailer + Active Job/Solid Queue, no web UI), SQLite3, `ruby_llm` (multi-provider via OpenRouter), ferrum/headless-Chromium, Active Record Encryption, Kamal/Docker. **Domain:** forwards a suspicious `.eml` to a dedicated Gmail; a 6-layer pipeline (deterministic + 3-model LLM ensemble) scores it and replies on-thread. **Maturity signals:** Minitest + FactoryBot + WebMock (all external HTTP blocked in tests), ~30 real `.eml` adversarial fixtures, `bin/ci` (rubocop/brakeman/bundler-audit), smoke-test rake task. **Note:** a committed `.ai-jail` file leaks the author's personal absolute filesystem paths (home dir, project/mount names) — minor info-disclosure gotcha, not an app pattern.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Ground the LLM in verifiable facts: cross-check every LLM-stated finding against the deterministic layers' data; **strip claims with zero supporting evidence as hallucinations** (logged), tag "[unverified]" when the prerequisite data is missing | 🟢 | `app/services/analysis/llm_finding_validator.rb` | `ai-engineer` + `gotchas.md` | Adopt |
| Deterministic floor overrides probabilistic average: hard-confirmed signals (URLhaus-confirmed malicious, authoritative blacklist hit, executable attachment) force a **minimum score** so soft weighted-averaging can't dilute a confirmed threat | 🟢 | `app/services/analysis/risk_escalation_policy.rb` | `lessons.md` | Adopt |
| Weight × confidence aggregation: every layer emits score + weight + confidence; final = Σ(score·weight·conf)/Σ(weight·conf), so a low-confidence layer contributes proportionally less than a high-confidence one | 🟢 | README "Final Score"; `analysis/score_aggregator.rb` | `lessons.md` + `ai-engineer` (judge ensembles) | Adopt |
| LLM ensemble consensus: N models in parallel, confidence-weighted mean score, majority verdict with **severity-based tiebreak**, consensus confidence adjusted by agreement level, safe default on invalid JSON | 🟢 | README "Consensus building"; `analysis/llm_consensus_builder.rb` | `ai-engineer` / `agent-evaluation` | Adopt |
| Graceful degradation by design: deterministic layers always run with no keys; API-dependent layers **degrade to low confidence** when a service/key is absent instead of hard-failing the pipeline | 🟢 | README (Layers 1/3 vs 2/4/5/6) | `api-patterns` / `lessons.md` | Adopt |
| Authenticate before metering: SPF/DKIM verified **before** the per-sender rate-limit counter, so a spoofed sender can't burn the real sender's quota | 🟢 | README "Rate Limiting" | `security-auditor` / `red-team-tactics` | Adopt |
| Anti-poisoning before publishing IOCs to shared feeds: allowlist ~40 well-known domains, filter provider/MTA + cloud infra IPs, exclude scan-clean and freemail domains, idempotent audit record per email | 🟢 | README "Anti-Poisoning"; `community_reporting/ioc_extractor.rb` | `red-team-tactics` / `security-auditor` | Adopt |
| Conditional privacy encryption: always encrypt the submitter (deterministic/queryable AR encryption); encrypt the email body **only when the verdict is legitimate** ("don't retain plaintext of confirmed-safe; don't protect scammers") | 🟢 | README "Security" + `docs/IDEA.md` | `lessons.md` / `database-design` | Adopt |
| DAG job pipeline: explicit per-layer job dependencies with parallel fan-out where independent (Solid Queue); dependents gate on prerequisites' results | 🟢 | README "Job Pipeline" | `architecture` / `observability-patterns` | Consider |
| TTL-cached expensive external scans (VirusTotal 24h / URLhaus 12h in `UrlScanResult`) to avoid redundant paid/rate-limited calls | 🟢 | README "Caching" | `performance-profiling` | Consider (echoes FrankMega's cached-blocklist pattern) |
| Prompt objects: LLM prompts as dedicated classes under `services/analysis/prompts/` rather than inline strings | 🟢 | `analysis/prompts/*.rb` | `ai-engineer` | Consider |
| Real adversarial fixtures + total HTTP isolation in tests (WebMock blocks all external calls; ~30 real spam `.eml` as fixtures) | 🟢 | README "Testing" | `testing-patterns` | Consider |
| Don't commit personal sandbox/tooling configs with absolute home paths | 🟢 | `.ai-jail` | `gotchas.md` | Consider (gotcha, not a design pattern) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. LLM-finding validation against ground truth + hallucination stripping → `ai-engineer`/`gotchas.md` (directly reinforces DevBureau's anti-hallucination + untrusted-content themes).
2. Deterministic floor over probabilistic average → `lessons.md`.
3. Weight × confidence scoring + N-model consensus with severity tiebreak → `ai-engineer`/`agent-evaluation` (applies to any LLM-as-judge ensemble).
4. Graceful degradation to low confidence when a dependency is absent → `api-patterns`.
5. Authenticate-before-rate-limit ordering → `security-auditor`.
6. Anti-poisoning allowlist/infra-filter before publishing to shared feeds → `red-team-tactics`.
7. Conditional encryption keyed on the verdict (privacy for the innocent, not the scammer) → `lessons.md`/`database-design`.

**Consider (needs a decision):** DAG job pipeline (architecture); TTL scan cache (echoes FrankMega); prompt objects (ai-engineer); adversarial fixtures + WebMock isolation (testing-patterns); `.ai-jail` personal-path leak (gotchas.md).

**Skip:** none new — shared same-author Rails/Docker/CI conventions already captured under FrankMD/FrankMega.

---

## 2026-06-28 — akitaonrails/ai-memory (https://github.com/akitaonrails/ai-memory)

**Repo:** Shallow clone. Stack: **Rust** (first non-Rails repo here), Cargo workspace of 8 single-responsibility crates, axum HTTP/MCP server, SQLite (WAL + FTS5, optional vector), git2-versioned markdown wiki, multi-provider LLM/embedding boundary. **Domain:** long-term, cross-agent memory for AI coding CLIs (Claude Code/Codex/Cursor/…). **Maturity signals:** explicit cross-cutting invariants each citing the upstream prior-art bug it prevents; recall-eval harness (`crates/ai-memory-consolidate/tests/recall_eval.rs`); `deny.toml`, `.gitleaks.toml`, SECURITY.md, multi-platform release/packaging (AUR/systemd/Docker multi-arch); thorough `docs/` including competitor issue-tracker studies. **License:** MIT. **Maximally relevant to DevBureau** — it is, itself, an agent-memory system, so its patterns map onto DevBureau's `.agent/memory/` layer, hooks, and MCP surface.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Markdown-on-disk as source of truth, SQLite as a *derived* index that can always be rebuilt from the files (grep-able, git-versioned, Obsidian-openable); "compile, don't retrieve" | 🟢 | `docs/ARCHITECTURE.md` "Storage architecture" | `architecture` + `lessons.md` | Adopt |
| Cross-cutting invariants list where **each rule cites the prior-art bug it prevents** (e.g. "single-writer SQLite actor — cognee #2717"); turns "why" into a reviewable, durable contract | 🟢 | `docs/ARCHITECTURE.md` "Cross-cutting invariants" | `documentation-templates` + `lessons.md` | Adopt |
| Single-writer actor for the DB: all writes funnel through one mpsc channel to one thread; reads via a cloneable read-only pool (WAL) — removes write-contention races by construction | 🟢 | invariant #2; `crates/ai-memory-store` | `database-design` + `lessons.md` | Adopt |
| Derived indexes commit in the **same transaction** as the data — no "index after return" background drift between source and index | 🟢 | invariant #3 | `database-design` | Adopt |
| Fire-and-forget hooks with a hard ≤200ms timeout and server backpressure (202/429), so the agent hot path never blocks on memory capture | 🟢 | invariant #5; `crates/ai-memory-hooks` | `lessons.md` / `observability-patterns` | Adopt |
| Typed sanitization boundary: untrusted text can only enter the store as `Sanitized<NewObservation>`, a type with no constructor other than `sanitize()` — the compiler enforces the trust boundary | 🟢 | invariant #6 | `security-auditor` + `lessons.md` | Adopt |
| Memory tiers with explicit decay math (working/episodic/semantic/procedural; `salience·exp(−λΔt)+σ·log(1+access)·exp(−μ·age)`; pinned exempt; access reinforces retention) | 🟢 | `docs/ARCHITECTURE.md` "Memory tiers" | `lessons.md` / `agent-memory-mcp` | Adopt |
| Self-improvement loop with layered safety: proposals logged to an audit trail, auto-approve default but `require_approval` opt-in, executable **eval gate** before staging, non-overlapping scheduler, per-session claim so failures don't retry forever | 🟢 | `docs/ARCHITECTURE.md` + `docs/auto-improvement-loop.md` | `agent-evaluation` + `lessons.md` | Adopt |
| Hybrid retrieval via Reciprocal Rank Fusion: FTS5 + graph-neighbour + optional vector cosine fused by RRF, with bounded raw-observation fallback when compiled pages miss | 🟢 | `docs/ARCHITECTURE.md` "Data flow" §6 | `ai-engineer` / `agent-memory-mcp` | Adopt |
| Atomic file writes (tmp + rename + fsync); the file watcher ignores its own writes by filename prefix to avoid reconciliation loops | 🟢 | invariant #10 | `lessons.md` | Consider (stronger version of file-write patterns from FrankMD/frank_type) |
| Narrow tool-surface discipline: "every new MCP tool must earn its slot"; additions documented with the gap each fills | 🟢 | `docs/ARCHITECTURE.md` "MCP tool surface" | `mcp-builder` | Consider |
| Crate-per-responsibility, no circular deps, `core` crate has **NO IO** (pure domain types) | 🟢 | "Crate layout" | `architecture` / `clean-code` | Consider |
| Design-by-studying-competitors'-bug-trackers: `docs/issues-*.md` + `research-*.md` distil prior tools' failure modes into this project's invariants | 🟢 | `docs/issues-*`, `docs/research-*` | `lessons.md` (meta: mirrors `/mine-patterns` itself) | Consider |
| Live-process check (`sysinfo`) before destructive ops (reset/backup/restore); denormalize `{provider,model,dim}` next to each embedding and ignore stale vectors on mismatch | 🟢 | invariants #8, #9 | `database-design` / `deployment-procedures` | Consider |
| One config-read path (`Config::load()` once; no scattered env reads); zero-LLM default with rule-based fallback; provider auth resolved into typed material before client construction | 🟢 | invariants #1, #13, #14 | — | Skip (config-cascade + graceful-degradation already captured under FrankMD/frank_fbi) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Markdown-source-of-truth + rebuildable derived index → `architecture` (this is essentially DevBureau's own `.agent/memory/` model, validated at scale).
2. Invariants-cite-the-bug-they-prevent documentation pattern → `documentation-templates`/`lessons.md` (a sharper format for DevBureau's own lessons.md/gotchas.md).
3. Single-writer actor + same-transaction index commit → `database-design`.
4. Fire-and-forget hooks with hard timeout + backpressure → `lessons.md` (DevBureau ships hooks; this is the latency-safety contract for them).
5. Typed sanitization boundary (`Sanitized<T>` with only `sanitize()`) → `security-auditor` (compiler-enforced Untrusted Content Boundary).
6. Memory tiers + decay math with pinned exemption + access reinforcement → `agent-memory-mcp`/`lessons.md`.
7. Self-improvement loop with audit trail + approval + eval gate + non-overlapping scheduler → `agent-evaluation` (directly informs DevBureau's auto-improve ambitions).
8. Hybrid FTS+graph+vector retrieval via RRF → `ai-engineer`/`agent-memory-mcp`.

**Consider (needs a decision):** atomic-write + self-write-ignoring watcher; narrow MCP tool-surface discipline (mcp-builder); crate-per-responsibility/no-IO-core; design-from-competitor-bug-trackers (meta); live-process guard + embedding provenance denormalization.

**Skip:** one-config-read-path, zero-LLM default, typed provider-auth — already represented by config-cascade (FrankMD) and graceful-degradation (frank_fbi) entries.

---

## 2026-06-28 — akitaonrails/distrobox-gaming (https://github.com/akitaonrails/distrobox-gaming)

> ⚠️ **License: NONE declared (no LICENSE file).** Default copyright = all rights reserved — the most restrictive case in this log so far. Extraction is strictly idea-level, in my own words; no YAML/code/prose lifted. Third-party personal repo (Fabio Akita). If any pattern were ever wanted, treat it as a generic IaC technique re-implemented clean-room, never a copy.

**Repo:** Shallow clone. Stack: **Ansible** (infrastructure-as-code, first non-application repo), data-driven roles + playbooks, Jinja2 templates, helper Python scripts. **Domain:** reproducibly provisions an Arch `distrobox` container as a retro-gaming/emulation station (ES-DE, ~12 standalone emulators, RetroArch, per-game tuning). **Maturity signals:** AGENTS.md with explicit conventions (no hardcoded paths, reuse-over-duplication, idempotency test = rerun expecting no changes), `--syntax-check` + `desktop-file-validate` as the test gate, focused vs. default playbooks, tag-gated subsets, extensive `docs/` capturing dead-ends per game.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Config-as-data / data-logic separation: every knob is a `dg_*` variable in `group_vars`; roles hold only logic. Adding a whole new game/emulator is a **YAML data change, not new code** | 🟢 | `group_vars/all/*.yml` + AGENTS.md "Reuse" | `lessons.md` / `deployment-procedures` | Adopt |
| No hardcoded local paths: everything derived from root vars (`dg_data_root`, `dg_box_home`, …); personal paths allowed only as defaults in central vars; machine overrides in a documented `*.example` | 🟢 | AGENTS.md "Path Customization"; `host_vars/localhost.yml.example` | `lessons.md` | Adopt (IaC sibling of FrankMD's config-cascade) |
| Version-aware idempotency: the PS3 DLC extractor compares the PKG filename-encoded version against the installed `PARAM.SFO` VERSION to decide whether to re-extract; a full re-run is a no-op. Tested by rerunning and asserting "no changes" | 🟢 | README "Full PS3 update workflow"; `roles/install_dlcs` | `deployment-procedures` / `lessons.md` | Adopt |
| Tag-gated selective execution + opt-in for destructive/heavy work: large-download or user-layout-specific roles are **skipped by default** and only run with an explicit `--tags` | 🟢 | README "Opt-in roles"; site.yml tags | `deployment-procedures` | Adopt |
| Backup-before-overwrite as a built-in: config-touching ops back up existing files first; dedicated `backup.yml`/`restore.yml` before destructive testing | 🟢 | README "Backup and Restore" / "Resetting Configs" | `lessons.md` / `deployment-procedures` | Consider (echoes ai-memory's live-process guard + FrankMega data-safety) |
| Fail-fast preflight: a `check_host` role asserts UID/GID and required paths before any provisioning runs | 🟢 | README "UID/GID"; `roles/check_host` | `lessons.md` | Consider |
| Render-from-single-template: all desktop launchers are data in `launchers.yml`, emitted via one Jinja2 template; new entry = data | 🟢 | `roles/desktop_apps/templates/*.j2` | `lessons.md` | Skip (instance of config-as-data, already captured row 1) |
| Capture per-case lessons AND dead-ends as durable artifacts: tested Wine-game quirks become reusable `dg_*` vars; "all dead ends captured, read before touching X again" docs | 🟢 | AGENTS.md "Reuse"; `docs/driveclub-shadps4.md` | `gotchas.md` (mirrors DevBureau's own gotchas.md ethos) | Consider |
| Explicit legal/safety boundary in-repo: ships no ROMs/BIOS/keys; playbooks only detect/link/configure existing files and never delete game data | 🟢 | README "Safety Rules" | `documentation-templates` | Consider |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Config-as-data / data-logic separation (new capability = data edit, not code) → `lessons.md`/`deployment-procedures`.
2. No-hardcoded-paths + central root vars + documented override example → `lessons.md`.
3. Version-aware idempotency with rerun-is-no-op as the test → `deployment-procedures`.
4. Tag-gated + opt-in-for-heavy/destructive execution → `deployment-procedures`.

**Consider (needs a decision):** backup-before-overwrite (echoes ai-memory/FrankMega); fail-fast preflight host validation; lessons-and-dead-ends-as-durable-data (gotchas.md); explicit in-repo legal/safety boundary (documentation-templates).

**Skip:** render-from-single-template (subset of config-as-data, row 1).

---

## 2026-06-28 — akitaonrails/akitaonrails.github.io (https://github.com/akitaonrails/akitaonrails.github.io)

> ⚠️ **License: CC BY-NC-SA 4.0** (content license — attribution, NonCommercial, ShareAlike). It governs the blog *content*, not really reusable code; the repo's "engineering" is Hugo config + Ruby helper scripts + CI. Extraction is idea-level, my own words. Third-party personal repo (Fabio Akita).

**Repo:** Full clone (1.4k files, years of posts). Stack: **Hugo** static site (Extended) + **Hextra** theme vendored via Go modules (`_vendor/`, `go.mod`), Ruby helper scripts, Docker dev env, GitHub Pages CI (+ Netlify alt). **Domain:** personal blog. **Maturity signals:** AGENTS.md with explicit gotchas + command table, `.markdownlint.json`, devcontainer/gitpod, dual-target deploy with per-target Hugo version pinning, documented build-cache strategy.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Vendor + pin third-party dependencies for reproducible/offline builds (theme committed under `_vendor/` via `go mod vendor`, versions pinned in `go.mod`) instead of pulling latest at build time | 🟢 | `_vendor/`, `go.mod`, AGENTS.md | `deployment-procedures` / `lessons.md` | Adopt |
| Render-only-recent for fast iteration on large content sets: `hugo server --renderSegments recent` renders just 2025+ in dev; full render only when older content is needed | 🟢 | README "dev server"; `hugo.yaml` render segments | `performance-profiling` / `lessons.md` | Adopt |
| Cache-aware build flags: deliberately **omit `--gc`** on the cached (Netlify) build so `netlify-plugin-cache` can persist `resources/_gen` + Hugo module cache between builds; the tradeoff is documented inline | 🟢 | README "Performance do build"; `netlify.toml` | `performance-profiling` / `lessons.md` | Adopt |
| Extend a third-party theme through its **designated override hooks** (Hextra `layouts/partials/custom/*`), never by forking/editing the vendored theme | 🟢 | AGENTS.md "Theme Customization" | `frontend-design` / `lessons.md` | Adopt |
| Derived index regenerated from content frontmatter (`generate_index.rb` scans every post, groups by year/month, writes `_index.md`); the generated file is never hand-edited | 🟢 | `scripts/generate_index.rb`; AGENTS.md "Index Generation" | `lessons.md` | Consider (simpler echo of ai-memory's derived-index-from-source-of-truth) |
| One-time content migrations kept as named, labeled scripts (`fix-old-code-blocks.rb`, `fix_images.rb`, `fix-s3-params.rb`) rather than ad-hoc manual edits | 🟢 | `scripts/`; AGENTS.md "Utility Scripts" | `migration-strategy` | Consider |
| Dual-target deploy (GitHub Pages primary + Netlify alt) with **per-target tool-version pinning** (Hugo 0.145 vs 0.152) | 🟢 | `.github/workflows/pages.yaml`, `netlify.toml`; AGENTS.md "Deployment" | `deployment-procedures` | Consider |
| Date-based Hugo page bundles (`content/YYYY/MM/DD/slug/index.md`, images co-located) | 🟢 | AGENTS.md "Content Conventions" | — | Skip (same Hugo bundle convention FrankMD generates; already captured) |
| Gotchas captured in AGENTS.md (don't edit auto-generated index, Hugo Extended required, `master` not `main`); Docker-first one-command dev env | 🟢 | AGENTS.md "Gotchas"; `scripts/dev.sh` | — | Skip (gotchas-as-docs captured under distrobox-gaming; Docker-first recurs across all akita repos) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Vendor + pin deps for reproducible builds → `deployment-procedures`.
2. Render-only-recent (segment rendering) for fast iteration on large datasets → `performance-profiling`.
3. Cache-aware build flags with the tradeoff documented inline → `performance-profiling`.
4. Extend-via-designated-hooks, never fork the vendored theme → `frontend-design`.

**Consider (needs a decision):** derived-index-from-frontmatter (echoes ai-memory); named/labeled one-time migration scripts (migration-strategy); dual-target deploy with per-target version pinning (deployment-procedures).

**Skip:** date-based Hugo bundles (already captured via FrankMD); gotchas-as-docs + Docker-first dev env (already captured in earlier akita entries).

---

## 2026-06-28 — akitaonrails/frank_investigator (https://github.com/akitaonrails/frank_investigator)

> ⚠️ **License: AGPL-3.0 (copyleft, not permissive).** Idea-level extraction only, my own words; no code/prose lifted. Third-party personal repo (Fabio Akita).

**Repo:** Full clone (~490 files). Stack: Rails 8.1, SQLite (WAL + tuned pragmas) with vendored **sqlite-vec** for embeddings (no external vector DB), Solid Queue/Cache/Cable, headless Chromium fetch, multi-model LLM via RubyLLM/OpenRouter, Kamal split web/worker deploy. **Domain:** news fact-checking pipeline ("truth over consensus"): extract claims, build an evidence graph, assess via authority-weighted multi-model consensus, detect rhetorical/contextual manipulation. **Maturity signals:** 678+ Minitest tests with disciplined LLM stubbing (~1.5s vs ~9min), explicit Core Principles + Architecture Decisions in CLAUDE.md, automated stale-job cleanup, docs-sync checklist. Same author/theme as frank_fbi (the email version) — overlapping ideas marked.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Persist LLM output as **first-class domain records**, not transient prompt output; the LLM is a planner/synthesizer over an evidence graph, never the sole source of truth | 🟢 | README "Architecture"; CLAUDE.md | `ai-engineer` / `architecture` | Adopt |
| Every pipeline step idempotent AND rebuildable from stored snapshots: maintenance tasks (`reanalyze`/`refresh`) replay stored article/claim snapshots through services to pick up new heuristics **without re-fetching or DB surgery** | 🟢 | CLAUDE.md "Operational Tasks"; `app/jobs/**` | `architecture` / `deployment-procedures` | Adopt |
| Aggregate by authority × confidence, never head-count: weight cap on secondary sources, primary-source veto, independence-clustering so correlated outlets count as one voice; conservative caps on viral/unsubstantiated claims | 🟢 | CLAUDE.md principles 1-4,6 | `ai-engineer` / `lessons.md` | Adopt (extends frank_fbi's weight×confidence with authority-tiering + independence dedup) |
| Fail toward caution: when LLM/semantic analysis degrades, the heuristic fallback gets **more conservative, never more confident** ("prefer needs_more_evidence"); degraded mode can't manufacture a supported verdict by repetition | 🟢 | CLAUDE.md principle 15, "Heuristic fallback must be safe" | `lessons.md` / `ai-engineer` | Adopt (sharper framing of frank_fbi's graceful degradation) |
| Queue isolation by resource pressure: fetch-heavy Chromium jobs on a dedicated low-concurrency `fetch` queue; realtime broadcasts on their own queue so a backlog can't starve real work; race-safe automated stale-job cleanup that only touches unclaimed `ReadyExecution` rows | 🟢 | CLAUDE.md "Background jobs"/"Stale-job cleanup" | `observability-patterns` / `deployment-procedures` | Adopt |
| Idempotency via timestamp watermark + pessimistic lock: concurrent sibling triggers no-op unless a strictly newer dependency has completed (`last_enrichment_refresh_at`) | 🟢 | CLAUDE.md "Auto-submission… closed loop" | `lessons.md` / `database-design` | Adopt |
| Test-stub fidelity discipline for LLM apps: a stub MUST mirror a real observed response (make one live call first); empty-returning stubs don't validate the path; test the fallback by disabling the provider key, not by erroring the stub | 🟢 | CLAUDE.md "LLM stubbing in tests" | `testing-patterns` | Adopt |
| Retrieval ≠ truth: vector embeddings widen recall for related items, but a deterministic subject/topic guardrail makes the final relatedness call | 🟢 | CLAUDE.md principle 16 | `ai-engineer` | Consider (echoes ai-memory RRF + frank_fbi) |
| Docs-sync checklist tying any analysis change to README + user methodology page + i18n (en & pt-BR) + JSON API method | 🟢 | CLAUDE.md "Documentation" | `documentation-templates` | Consider |
| Structural-over-pattern fixes: prefer fixing HTML selectors over URL regex; specific patterns over broad; test extraction against many outlet HTML styles | 🟢 | CLAUDE.md "Link Extraction" | `lessons.md` | Consider |
| Split web/worker runtime, shared persistent storage outside container lifecycle; vendored sqlite-vec, embeddings in SQLite (no external vector DB); Kamal secrets sourced from env, only `.example` tracked | 🟢 | README/CLAUDE.md "Deployment" | — | Skip (lean-stack + secret-hygiene already captured under ai-memory/FrankMega/FrankMD) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Persist LLM output as first-class records; LLM as planner over evidence, not source of truth → `ai-engineer`/`architecture`.
2. Idempotent + snapshot-rebuildable pipeline steps (replay through services, no DB surgery) → `architecture`.
3. Authority × confidence aggregation with independence dedup + primary-source veto → `ai-engineer`.
4. Fail-toward-caution degradation (more conservative when LLM is down) → `lessons.md`.
5. Queue isolation by resource pressure + race-safe stale-job cleanup → `observability-patterns`/`deployment-procedures`.
6. Timestamp-watermark + pessimistic-lock idempotency for concurrent triggers → `database-design`.
7. LLM test-stub fidelity discipline (mirror real responses; test fallback by disabling the key) → `testing-patterns`.

**Consider (needs a decision):** retrieval≠truth deterministic guardrail (echoes ai-memory/frank_fbi); docs-sync checklist (documentation-templates); structural-over-pattern fixes (lessons.md).

**Skip:** split runtime + lean SQLite/sqlite-vec stack + Kamal secret hygiene — already represented by ai-memory/FrankMega/FrankMD entries.

---

## 2026-06-28 — akitaonrails/ai-usagebar (https://github.com/akitaonrails/ai-usagebar)

**Repo:** Full clone (~107 files). Stack: **Rust** CLI + ratatui TUI; two binaries from one crate; per-vendor modules (anthropic/openai/openrouter/zai/deepseek), OAuth + API-key + macOS Keychain creds. **Domain:** Waybar widget + terminal UI showing AI-plan usage across 5 vendors. **Maturity signals:** 200+ `cargo test` + clippy `-D warnings` + `cargo machete` gate, mockito+insta snapshot tests, `#[ignore]`d live smoke tests, Keep-A-Changelog, dual AUR packaging + crates.io, CI-driven multi-arch release. **License:** MIT. Rust port of `claudebar` (mryll), stays drop-in compatible.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Honor the host's contract: the Waybar widget **always exits 0** (Waybar hides non-zero modules) and wraps every error in a fallback `⚠` JSON, so failures degrade visibly instead of vanishing | 🟢 | README "Always exits 0"; CLAUDE.md "Hard invariants"; `widget::run::fallback` | `lessons.md` | Adopt |
| Atomic cache writes (tempfile + persist) + per-vendor `flock` so multiple instances (multi-monitor bars) coexist without stampeding a rate-limited API | 🟢 | README; CLAUDE.md; `src/cache.rs` | `lessons.md` / `performance-profiling` | Adopt |
| Error taxonomy for UX: separate transient (DNS/timeout → quiet "Loading…") from hard (HTTP 4xx/5xx → surface the code) instead of one generic failure | 🟢 | README "Separate transient and hard errors" | `lessons.md` | Adopt |
| Drift detection for undocumented external APIs: live smoke tests (`make smoke`) assert the exact fields consumed; on drift, update the per-vendor `types.rs` and bump **pkgrel not pkgver** (packaging-only change) | 🟢 | README "Endpoint stability"; CLAUDE.md "Live API smoke discipline" | `testing-patterns` / `deployment-procedures` | Adopt |
| Hermetic tests via injected seams: a test must never touch real `$HOME`/`$XDG`/env (because AUR `makepkg` runs `cargo test` on the user's machine) — always inject the path/dep (`Cache::at` not `for_vendor`), live calls behind `#[ignore]` | 🟢 | CLAUDE.md "Hard invariants — Tests are hermetic" | `testing-patterns` | Adopt (stronger-motivated sibling of FrankMD's boundary-stubbing) |
| Secret discipline "learned the hard way": never `cat` a creds/config file or `env | grep` loosely (real keys once leaked into the agent transcript); use `jq 'keys'` / per-var `printenv … | sed` | 🟢 | CLAUDE.md "Secret-discipline rules" | `gotchas.md` / `security-auditor` | Adopt (independent confirmation of the read-tool discipline I adopted earlier this session) |
| Per-vendor uniform module structure: each provider is a self-contained module (creds/fetch/types/render) behind one shared shape (tooltip renderer, JSON contract), so adding a vendor is bounded and consistent | 🟢 | CLAUDE.md "What lives where"; `src/{vendor}/` | `architecture` / `clean-code` | Adopt |
| Layered credential resolution with a self-describing error: env var named by config → inline config value → error that names BOTH options; safe default reads env only | 🟢 | README "Credential resolution order" | `lessons.md` | Consider (echoes config-cascade; the name-both-options error is the new bit) |
| `cfg`-gated platform code compiled out elsewhere (`keychain.rs` is `#[cfg(target_os = "macos")]`; Linux never compiles it); OS-path convention lives in one reused resolver | 🟢 | CLAUDE.md; `src/anthropic/keychain.rs`, `src/cache.rs` | `lessons.md` | Consider |
| Drop-in compatibility with the predecessor's interface (same claudebar flags/placeholders) so users migrate with zero config change; comment-preserving config edits via `toml_edit` + `chmod 600` on save | 🟢 | README; CLAUDE.md `tui/settings.rs` | `lessons.md` | Consider (config-rewrite echoes FrankMD; interface-compat is new) |
| Cache TTL (60s) deliberately decoupled from the host poll interval (300s) to respect aggressive undocumented rate limits while letting instances coexist | 🟢 | README "Why 300s?" | `performance-profiling` | Skip (instance of the atomic-cache+flock row) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Honor-the-host-contract (exit 0 + visible fallback) → `lessons.md`.
2. Atomic cache write + flock to prevent cross-instance API stampedes → `lessons.md`/`performance-profiling`.
3. Transient-vs-hard error taxonomy for UX → `lessons.md`.
4. Live smoke tests for undocumented-API drift + pkgrel-not-pkgver discipline → `testing-patterns`/`deployment-procedures`.
5. Hermetic tests via injected seams (never touch real $HOME/env; packaging runs tests on user machines) → `testing-patterns`.
6. Secret-read discipline (no `cat`/loose `env|grep` on creds; `jq 'keys'` only) → `gotchas.md`/`security-auditor` — **independently confirms the read-tool change made earlier this session**.
7. Per-vendor uniform module structure behind one shared shape → `architecture`.

**Consider (needs a decision):** layered cred resolution with name-both-options error; cfg-gated platform code + single OS-path resolver; predecessor interface-compat + toml_edit comment-preserving edits.

**Skip:** cache-TTL-vs-poll-interval (subsumed by atomic-cache+flock row); Omarchy theme auto-detection (already captured under FrankMD); multi-target packaging/release (echoes ai-memory).

---

## 2026-06-28 — akitaonrails/ai-jail (https://github.com/akitaonrails/ai-jail)

> ⚠️ **License: GPL-3.0 (copyleft, not permissive).** Idea-level extraction only, my own words; no code lifted. Third-party repo (Fabio Akita). This is the tool whose `.ai-jail` config surfaced in the frank_fbi entry (the personal-path leak noted there is in a user's generated config, not the tool itself).

**Repo:** Full clone (~108 files). Stack: **Rust** CLI (sync, no tokio; `lexopt` not clap; minimal deps), wraps bubblewrap (Linux) / sandbox-exec seatbelt (macOS) with Landlock + seccomp + rlimits; PTY proxy status bar; TOML config. **Domain:** OS-level sandbox for running AI coding agents with least-privilege filesystem/network access. **Maturity signals:** in-repo security audit docs (`docs/AUDIT_1.0_SECURITY.md`, sandbox-alternatives comparison), per-version release notes (v0.1→v1.10), `cargo fmt --check`/clippy `-D warnings`/tests gate, config backward-compat regression tests. **License:** GPL-3.0.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Defense-in-depth: independent, individually-disableable security layers (namespaces + Landlock LSM at VFS + seccomp-bpf syscall filter + rlimits + sensitive-/sys masking); no single layer is the whole boundary | 🟢 | README "Defense-in-depth layers"; `src/sandbox/*` | `security-auditor` / `red-team-tactics` | Adopt |
| Honest "what this is and isn't" threat-model doc: explicitly enumerates what it does NOT protect (kernel escapes out of scope, process-sandbox≠VM, side channels remain, use a disposable VM for real malware) | 🟢 | README "What this is and isn't" | `security-auditor` / `documentation-templates` | Adopt |
| Secure-by-default, dangerous features off + explicitly labeled: `.ssh`/`.gnupg`/`.aws` never mounted; `--systemd-user`/`--ssh`/`--tailscale` opt-in and marked dangerous; `--lockdown` for hostile workloads | 🟢 | README "Security notes"/"Home directory handling" | `security-auditor` / `lessons.md` | Adopt |
| Hide the control plane from the controlled process: auto-mask the sandbox's own `.ai-jail` policy file inside the jail so the agent can't read its own restrictions and craft workarounds | 🟢 | README "Hiding the sandbox policy itself" | `security-auditor` / `red-team-tactics` | Adopt |
| Copy-on-write overlay that doubles as a reviewable diff: agent sees a path read-write, writes land on a side `upper/` layer (the original is never touched), which you then inspect and selectively promote | 🟢 | README "Overlay maps" | `lessons.md` | Adopt |
| Capability degradation that is never fatal AND fails toward more-restrictive for security primitives: Landlock ABI V3→V1→no-op by kernel; overlay → read-only on macOS; missing paths warn-and-skip | 🟢 | README "Landlock"/"Overlay maps"; CLAUDE.md "Warn and skip" | `lessons.md` / `security-auditor` | Adopt |
| Aggressive backward-compat contract for user-generated config: never remove/rename/retype a field (serde `default`/`alias`, never `deny_unknown_fields`), keep old CLI flags working, add a regression test parsing the OLD format before changing the parser | 🟢 | CLAUDE.md "Critical Rule: Backward Compatibility" | `lessons.md` / `migration-strategy` | Adopt |
| Two concealment semantics for different needs: `--mask` (empty placeholder) vs `--deny-path` (permission denied), both glob-aware | 🟢 | README "Hiding project-level secrets" | `lessons.md` | Consider |
| Don't auto-persist a one-off override: a CLI command/flag runs for the session but isn't written back to `.ai-jail` unless `--init`; separates "try this now" from "this is the saved default" | 🟢 | README/CLAUDE.md "Merge behavior" | `lessons.md` | Consider |
| Detect-and-defer to the environment: auto-disable the status bar inside tmux/zellij (they already own the terminal) instead of fighting them | 🟢 | README "Status bar" | `lessons.md` | Consider (echoes ai-usagebar honor-host-contract) |
| Ordering as a documented correctness invariant: the 22-step bwrap mount order is specified and explained because reordering breaks isolation (mask/deny after project mount; overlay-storage hide last) | 🟢 | CLAUDE.md "Mount Order Matters" | `lessons.md` | Consider |
| Config merge precedence + command-scoped global tables (`[commands.<name>]`): global base → command table → project → CLI; vectors append+dedupe, scalars override | 🟢 | README "Global command-specific config" | — | Skip (config-cascade already captured under FrankMD/ai-memory) |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Defense-in-depth with independent, individually-disableable layers → `security-auditor`/`red-team-tactics`.
2. Honest "what it does NOT protect" threat-model section → `security-auditor`/`documentation-templates`.
3. Secure-by-default + dangerous-opt-ins-explicitly-labeled → `security-auditor`.
4. Hide the control plane from the controlled process (don't leak policy to the sandboxed agent) → `red-team-tactics`.
5. COW overlay that doubles as a reviewable, selectively-promotable diff → `lessons.md`.
6. Never-fatal degradation that fails toward more-restrictive for security primitives → `lessons.md`/`security-auditor`.
7. Backward-compat contract for user-generated config (serde default/alias, old-format regression test first) → `migration-strategy`/`lessons.md`.

**Consider (needs a decision):** mask-vs-deny dual concealment semantics; don't-auto-persist-one-off-overrides; detect-and-defer-to-environment (echoes ai-usagebar); mount-order-as-documented-invariant.

**Skip:** config merge precedence / command-scoped tables (config-cascade already captured); multi-channel distribution (echoes ai-memory/ai-usagebar).

---

## 2026-06-28 — akitaonrails/llm-coding-benchmark (https://github.com/akitaonrails/llm-coding-benchmark)

> ⚠️ **License: NONE declared (no LICENSE file).** Default = all rights reserved. Idea/methodology-level extraction only, my own words; no code/prose lifted. Third-party repo (Fabio Akita), explicitly the data source for the author's blog series. **Most directly relevant repo to DevBureau's own `framework-benchmarking` / `agent-evaluation` skills.**

**Repo:** Full clone (~262 files). Stack: Python orchestration scripts (`run_benchmark.py`, warmup, runtime validator) driving `opencode`/Codex/deepclaude across cloud (OpenRouter/Z.ai) + local (Ollama/llama-swap) models against one fixed Rails brief; results as committed JSON + hand-written Markdown deep-reviews; an in-repo `.agents/skills/benchmark-audit/` skill + `docs/audit_prompt_template.md` rubric. **Domain:** measuring LLM coding ability. **Maturity signals:** documented rubric methodology, two-phase build+validate flow, reproducible isolated configs, per-profile (AMD/NVIDIA) separation, forensic failure analyses.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **Structural completeness ≠ runtime correctness**: file/test/artifact counts don't measure whether generated code runs; the only reliable signal is a human reading the integration code by hand for hallucinated APIs | 🟢 | README "Key Findings"/"What We Learned" | `agent-evaluation` / `framework-benchmarking` | Adopt |
| Green tests can lie: a test that mocks a *hallucinated* API passes AND certifies broken code; verify tests mock the REAL API, not an invented one | 🟢 | README §"Hallucinated APIs + tests that mock the hallucination"; analysis step e | `testing-patterns` / `agent-evaluation` | Adopt |
| Holistic rubric (0-100 over 8 named dimensions) + a documented, repeatable audit checklist (count tests → read integration code → check Dockerfile → Tier 1/2/3) instead of a single score or raw counts | 🟢 | `docs/audit_prompt_template.md`; `.agents/skills/benchmark-audit/` | `agent-evaluation` | Adopt |
| Reproducible isolation: generate a trimmed benchmark config FROM the user's real config and point the subprocess at it via env var; never mutate the user's global setup | 🟢 | README "Local Opencode Benchmark Config" | `agent-evaluation` / `lessons.md` | Adopt |
| The harness matters as much as the subject: same model in two harnesses produced different correctness; control and document the harness, don't attribute harness artifacts to the model | 🟢 | README "The harness matters for correctness"; "GPT 5.4 … unfair test" | `agent-evaluation` / `framework-benchmarking` | Adopt |
| Commit only sanitized artifacts: result JSON committed, but project trees / event-stream logs / session exports gitignored because they capture raw env (secrets); a model was penalized for writing a real `.env` | 🟢 | README "Commit the result"/"Outputs" | `gotchas.md` / `security-auditor` | Adopt (third independent secret-hygiene signal this session, after ai-usagebar + ai-jail) |
| Honest "unfair test" disclosure: when a subject fails due to tooling, not capability, say so explicitly and describe the fair path, instead of letting a harness artifact read as a capability verdict | 🟢 | README "GPT 5.4 Pro: Tool Calling Incompatibility" | `framework-benchmarking` / `documentation-templates` | Adopt |
| Two-phase eval (build, then a continuation prompt that forces boot/Docker/Compose validation) materially changes the measured quality vs a single-shot generation | 🟢 | README "Benchmark Workflow"/"What We Learned" | `agent-evaluation` | Consider |
| Self-correcting methodology: when an earlier audit rule was wrong (kwargs pattern actually valid), re-inspect the source of truth and re-score every affected subject, documenting the correction | 🟢 | README §"Previously-miscategorized kwargs pattern" | `agent-evaluation` | Consider |
| Operational gates for long unattended runs: tok/s speed gate auto-kills too-slow runs, no-progress timeout, and kill-stale-locking-processes before retry | 🟢 | README "Notes"/llama-swap "Stale opencode processes" | `observability-patterns` | Consider |
| Preflight/warmup separated from the real run: prove the model loads at a useful context before spending a full benchmark on it | 🟢 | README "Warmup" | `lessons.md` | Consider |

**Adopt (logged for the knowledge base — this workspace never merges into DevBureau):**
1. Structural completeness ≠ runtime correctness; read the integration code by hand → `agent-evaluation`/`framework-benchmarking` (the core anti-metric-gaming lesson).
2. Green-tests-that-mock-a-hallucination-lie → `testing-patterns`/`agent-evaluation`.
3. Holistic multi-dimension rubric + documented repeatable audit checklist → `agent-evaluation`.
4. Reproducible isolation (generate trimmed config, env-point the subprocess, never touch the global) → `agent-evaluation`.
5. The harness matters as much as the subject; document/control it → `framework-benchmarking`.
6. Commit only sanitized artifacts; gitignore anything that may capture env/secrets → `gotchas.md`/`security-auditor`.
7. Honest "unfair test" disclosure when failure is tooling not capability → `framework-benchmarking`.

**Consider (needs a decision):** two-phase build+validate eval; self-correcting re-score on a corrected rule; operational gates (speed/no-progress/stale-process); preflight-warmup-before-full-run.

**Skip:** none — this repo's value is methodology, most of which is new to the log (closest prior overlap is ai-memory's recall-eval, but that's retrieval, not code-generation quality).

---

## 2026-06-28 — ghpending

- **Repo:** https://github.com/akitaonrails/ghpending.git
- **License:** ✅ MIT (Fabio Akita, 2026) — permissive, patterns freely reusable. First-party author repo.
- **Stack / maturity:** Rust 2024 edition, single CLI crate (not a workspace). `octocrab` (GitHub API), `tokio`/`futures` (async), `hyper-socks2` (SOCKS), `serde`/`toml`, `directories`, `indicatif`, `anyhow`/`thiserror`, `lexopt`-style CLI. Tagged release v0.3.4, multi-channel packaging (Homebrew/AUR/crates.io/mise), CI release workflow. Mature, well-factored small tool.
- **Domain:** terminal digest of open issues + PRs across a watch-list of GitHub repos. Pure read-side aggregation over a third-party API.

### Patterns found

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **Bounded-concurrency fan-out with a sliding window** — `FuturesUnordered`, cap `MAX_CONCURRENT_FETCHES = 4`, refill on completion, never spawn unbounded | 🟢 read directly | `commands/digest.rs:46-80` | `api-patterns` / `backend-specialist` (rate-limit-friendly fan-out) | **Adopt** |
| **Per-task deadline AND a global deadline** — each fetch wrapped in `timeout(30s)` *and* an outer `tokio::select!` on a global `sleep`; un-started/slow repos render `timeout after 30s` instead of hanging the batch | 🟢 read directly | `commands/digest.rs:57-99` | `api-patterns` / `gotchas.md` | **Adopt** |
| **Partial failure is a first-class result, not an abort** — `RepoStatus::{Items,NotFound,Error}` per repo; one failing/missing repo never sinks the digest; only fail the run if *all* fetches failed (`all_repo_fetches_failed`) | 🟢 read directly | `github.rs:30-43`, `commands/digest.rs:101-106` | `api-patterns` / `backend-specialist` | **Adopt** |
| **Secret-grade ENV hygiene** — token `.trim()`-ed and empty-filtered to `None`; auth header marked `set_sensitive(true)`; SOCKS proxy URIs with embedded `user:pass@` credentials explicitly rejected | 🟢 read directly | `github_client.rs:72-93,158-160` | `security-auditor` / `gotchas.md` (4th secret-discipline signal this session) | **Adopt** |
| **Strict vs. best-effort config split** — explicitly-set proxy (`GHPENDING_GITHUB_PROXY`/`HTTPS_PROXY`) is `strict: true` (fail loudly if it can't build); auto-detected local `127.0.0.1:9050` is `strict: false` (silently fall back to direct). Intent declared by the user is honored hard; convenience inference degrades soft | 🟢 read directly | `github_client.rs:25-37,95-123` | `api-patterns` / `lessons.md` | **Adopt** |
| **Pure decision fn split from its IO** — `resolve_list_source(all, username, auth_login, kind)` is total, synchronous, exhaustively unit-tested; the async `resolve_source_for` only does the GitHub lookups then delegates. Same for `item_cmp` / `account_kind_from_type` / `split_repo` | 🟢 read directly | `github.rs:97-138,230-244` | `clean-code` / `testing-patterns` | **Adopt** |
| **404 demoted to a domain state, not an error** — `map_github_err` maps HTTP 404 → `NotFound`, 401 (unauth `current().user()`) → `Ok(None)` so callers fall back to public listing; only genuine API faults propagate | 🟢 read directly | `github.rs:53-65,208-216` | `api-patterns` / `backend-specialist` | **Adopt** |
| **Config file written `0600` on Unix** — user-local watch-list saved with restricted perms after write (`set_mode(0o600)`) | 🟢 read directly | `config.rs:40-46` | `security-auditor` / `gotchas.md` | **Consider** |
| **Capability-aware listing source** — own login → authenticated listing (private incl.), org → org listing, third-party → public-only; encoded as a `ListSource` enum, not scattered `if`s | 🟢 read directly | `github.rs:83-130` | `api-patterns` | **Consider** |
| **Packaging/publish artifact discipline** — `Cargo.toml` excludes `.github/`, `target/`, `.claude/`, `docs/`, `packaging/` from the crates.io package; AUR PKGBUILDs intentionally carry last-released pins, regenerated from tag by CI | 🟡 inferred from AGENTS.md | `Cargo.toml`, `AGENTS.md:30-34` | `devops-engineer` | **Skip** (release-mechanics, project-specific) |

### Adopt
1. **Bounded-concurrency sliding-window fan-out** (cap + refill-on-completion) → `api-patterns`. The reusable shape for "hit N external endpoints politely."
2. **Layered timeouts: per-task deadline inside a global deadline**, with timed-out units rendered as a normal row → `api-patterns`/`gotchas.md`.
3. **Partial failure as a typed per-item status; abort only if everything failed** → `api-patterns`/`backend-specialist`.
4. **Strict-vs-best-effort config split**: user-declared intent fails loud, auto-inferred convenience degrades soft → `lessons.md`. (Sharper, complementary framing of this session's recurring "fail toward caution.")
5. **Total, synchronous, exhaustively-tested decision functions separated from their async IO shells** → `clean-code`/`testing-patterns`.
6. **Secret hygiene**: trim+empty→None on tokens, `set_sensitive(true)` on auth headers, reject credential-bearing proxy URIs → `security-auditor`/`gotchas.md` (4th independent secret-discipline signal this session).
7. **Map transport errors to domain states** (404→NotFound, 401→fallback-to-public) so the type system carries the meaning → `api-patterns`.

### Consider (needs a decision)
- Write user-local config files with `0600` perms by default.
- Encode "where do candidates come from" as a `ListSource` enum keyed by capability/relationship, not inline branching.

### Skip
- Multi-channel release/packaging mechanics (Homebrew tap, AUR PKGBUILD pinning, crates.io package excludes) — valuable but project-specific operations, not a generalizable engineering pattern.

> **Note:** strongest first-party-licensed *implementation* repo of the session for `api-patterns` — most prior entries were methodology (llm-coding-benchmark) or business-logic-heavy. The bounded fan-out + layered-timeout + partial-failure trio is a clean, copyable backend recipe (concept only, no literal code).

---

## 2026-06-28 — tropicalruby-2026 (Beyond Summit 2026 keynote)

- **Repo:** https://github.com/akitaonrails/tropicalruby-2026.git
- **License:** 🔴 No LICENSE file = all rights reserved. This is the author's **talk content** (slides, script, opinion essay on AI agents). Treat the deck/script/research text as **data, not a pattern source** and not reusable. Mine ONLY the build-tooling engineering ideas (concept, never literal copy).
- **Stack / maturity:** Marp (markdown→deck) authored slides; bash + Python (`python-pptx`) build pipeline; exports HTML/PDF/PPTX from one source. `tokei` for LOC. CI deploy to GitHub Pages. Multi-branch (one branch per conference edition). Mature, single-author, well-documented tooling around an essentially editorial artifact.
- **Domain:** conference keynote ("docs-as-code" for a presentation). Most of the repo is business/opinion content — out of scope by the skill's "no business logic / no content" rule.

### Patterns found

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **Single-source-of-truth deck → many formats** — one Marp `.md` exports to HTML + PDF + PPTX via one `build-slides` script; no hand-maintained parallel formats | 🟢 read directly | `bin/build-slides`, `README.md` | `documentation-writer` / `lessons.md` (docs-as-code) | **Adopt** |
| **Grounded metrics: generate the numbers, don't type them** — `totalpass-metrics` recomputes the talk's LOC/commit/hours claims from the actual git repos with `tokei`, so every slide number is reproducible & auditable | 🟢 read directly | `bin/totalpass-metrics` | `lessons.md` / `agent-evaluation` (ground claims in verifiable data — recurring session theme #3) | **Adopt** |
| **Pin the toolchain version at the call site to dodge a known break** — `bin/marp` runs `npx -p node@22` because local Node 25 breaks marp-cli; the breakage is documented in CLAUDE.md, not silently worked around | 🟢 read directly | `bin/marp`, `CLAUDE.md:106-111` | `gotchas.md` / `devops-engineer` | **Adopt** |
| **Idempotent in-place post-processors with explicit pre-flight validation** — `embed_videos_pptx.py` / `inject_notes_pptx.py` re-derive everything from source each run, copy-then-mutate (never edit input), and `raise SystemExit` early on missing markers/assets/duplicate keys/slide-count mismatch | 🟢 read directly | `bin/embed_videos_pptx.py:69-82`, `bin/inject_notes_pptx.py:60-69` | `devops-engineer` / `clean-code` | **Adopt** |
| **Match-by-content, not by-position** — to swap a poster image for a movie, it locates the right PPTX shape by **SHA1 of the image bytes** rather than trusting slide/shape order; reuses the placeholder's exact geometry | 🟢 read directly | `bin/embed_videos_pptx.py:125-141` | `lessons.md` | **Adopt** |
| **Session-clustering heuristic for effort estimation** — turn raw commit timestamps into "hours worked": new session after 90-min idle gap, +20 min per session, capped at 8h/session; assumptions printed alongside the output | 🟢 read directly | `bin/totalpass-metrics:214-232,287` | `lessons.md` / `agent-evaluation` | **Consider** |
| **Disciplined LOC classification** — explicit source/content/asset extension sets + test-path markers + vendored/build dir excludes, with prod-vs-test split, so "lines of code" means something defensible | 🟢 read directly | `bin/totalpass-metrics:64-128` | `lessons.md` | **Consider** |
| **Auto-pick a free port instead of failing on a busy one** — `serve-slides` probes upward from 8080 (`ss`) until a free port, honoring an explicit `PORT` override | 🟢 read directly | `bin/serve-slides:6-19` | `gotchas.md` / `devops-engineer` | **Consider** |
| **Stricter renderer is the source of truth** — when HTML preview and PDF disagree, trust the PDF (Chromium) and simplify the CSS; rebuild the strict target after layout changes, don't eyeball the lenient one | 🟡 inferred from docs | `CLAUDE.md:106-110`, `README.md:142-157` | `frontend-design` / `gotchas.md` | **Consider** |
| **Keep N artifacts in sync as a hard rule** — slides + script + presenter-notes must move together; "do not update one in isolation" stated as a project invariant | 🟢 read directly | `CLAUDE.md:29-37` | `documentation-writer` | **Skip** (sound, but project-specific editorial workflow) |

### Adopt
1. **Docs/decks as code: one source → many exported formats via a single build script** → `lessons.md`/`documentation-writer`. Kills format drift.
2. **Generate your evidence numbers from ground truth (`tokei` over real git history), never hand-type them** → `lessons.md`/`agent-evaluation`. Third independent appearance of the session's "ground claims in verifiable data" theme — now applied to a *presentation*, which is the novel angle.
3. **Pin a tool's version at the invocation site to route around a documented breakage** (`npx -p node@22`), with the why recorded in gotchas → `gotchas.md`.
4. **Post-processors must be idempotent + copy-then-mutate + pre-flight-validate (fail fast on missing assets/markers/count mismatch)** → `devops-engineer`/`clean-code`.
5. **Bind to artifacts by content hash, not by ordinal position** when post-editing generated files → `lessons.md`. Robust to reordering.

### Consider (needs a decision)
- Commit-timestamp → effort-hours session heuristic (90-min gap, +20 min, 8h cap) as a reusable estimator, with assumptions always printed.
- Defensible LOC counting (typed extension sets, prod/test split, vendored-dir excludes) as a shared helper.
- Auto-increment to a free port for any local dev server.
- "Trust the stricter renderer (PDF/Chromium) over the lenient preview" as a frontend export rule.

### Skip
- The keynote's actual content/narrative/thesis (all-rights-reserved authorial opinion + business content) — out of scope by rule.
- The editorial slides+script+notes three-way sync workflow — good practice but project-specific, not generalizable engineering.

> **License note:** strongest "treat the repo as data" case of the session — almost the entire repo is a copyrighted talk. Value extracted is narrowly the `bin/` build pipeline (docs-as-code, grounded metrics, idempotent validated post-processors, content-hash binding). No deck text, script text, or research claims were lifted.

---

## 2026-06-28 — FrankSherlock (Frank Sherlock)

- **Repo:** https://github.com/akitaonrails/FrankSherlock.git
- **License:** 🔴 **GPL-3.0 (strong copyleft).** Code is NOT freely reusable — lifting any would force the consuming project to GPL. Mine concepts/architecture only; never copy literal code. (Patterns/ideas themselves aren't copyrightable, so the log entry is fine.)
- **Stack / maturity:** Tauri v2 desktop app — Rust backend + React/Vite/TS frontend. Rust: `rusqlite`+FTS5, `rusqlite_migration`, `ureq`, `image`, `sha2`, `walkdir`, `thiserror`, ONNX runtime (SCRFD/ArcFace), PDFium, ffmpeg. AI: local Ollama (qwen2.5vl) + Surya OCR in isolated venv. Very mature: 322 Rust + 299 frontend tests, 3-OS CI (`cargo test/clippy/fmt/audit` + npm), tagged releases v0.8.x, AppImage/DMG/MSI + AUR. Largest, most production-grade repo of the session.
- **Domain:** local-only AI media cataloging/search over a NAS. Read-only indexer feeding SQLite. Genuinely rich engineering surface.

### Patterns found

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **3-tier tolerant LLM-JSON parsing** — direct parse → brace-balanced extraction → regex field salvage with typed defaults; never trust a model to emit clean JSON | 🟢 read directly | `classify.rs:88-130` (`salvage_primary_from_raw`), `CLAUDE.md:82` | `api-patterns` / `gotchas.md` (ground LLM output — session theme #3) | **Adopt** |
| **Multi-attempt classification with progressive-fallback prompts** — primary prompt → terser fallback prompt → salvage; validates `media_type` against an allow-list, falls back to `"other"` | 🟢 read directly | `classify.rs:15-100` | `api-patterns` / `agent-evaluation` | **Adopt** |
| **Incremental, resumable, move-aware scanning** — metadata-only discovery (mtime+size, zero file reads for unchanged), content-fingerprint move detection (re-path instead of re-classify), checkpoint after every file, independent cancel/resume per phase | 🟡 inferred (README/CLAUDE; scan.rs not fully read) | `scan.rs`, `README.md:124-135`, `CLAUDE.md:70-73` | `backend-specialist` / `lessons.md` | **Adopt** |
| **Two-tier duplicate detection: exact (SHA-256) + near (perceptual)** — dHash Hamming similarity weighted 0.85 visual + 0.15 Jaccard-word textual, transitively grouped with **Union-Find (path compression + rank)**, with an algebraic early-exit Hamming bound to skip impossible pairs | 🟢 read directly | `similarity.rs:6-137` | `backend-specialist` / `lessons.md` | **Adopt** |
| **OS specifics quarantined behind one `platform/` module** — clipboard/GPU/python-paths/process isolated; "never use OS-specific paths/commands outside this module"; 3-OS CI enforces it | 🟢 read directly | `platform/`, `CLAUDE.md:75` | `clean-code` / `devops-engineer` | **Adopt** |
| **Append-only, position-identified DB migrations** — `rusqlite_migration` keyed by `PRAGMA user_version`; never edit/reorder shipped migrations, only `ALTER TABLE ADD COLUMN ... DEFAULT`; test against fresh AND existing DBs; no drop/delete without consent | 🟢 read directly | `db.rs`, `CLAUDE.md:107-116` | `database-design` / `gotchas.md` | **Adopt** |
| **Strictly read-only over source data; all derived state in app-data dir** — never writes to scanned dirs; DB/thumbnails/caches/venv all under `~/.local/share/...`; mirror source `rel_path` in caches | 🟢 read directly | `README.md:226-238`, `CLAUDE.md:70` | `backend-specialist` / `security-auditor` | **Adopt** |
| **Heavy/foreign runtime isolated in its own venv, invoked as a subprocess** — Surya OCR runs in an isolated Python venv ("no system Python imports"), bundled as a Tauri resource; Rust shells out, keeping the native binary clean | 🟢 read directly | `scripts/surya_ocr.py`, `platform/python.rs`, `CLAUDE.md:31,132` | `backend-specialist` / `lessons.md` | **Consider** |
| **Hardware-aware model selection with explicit override + on-demand load/unload** — pick vision model from detected VRAM; `model_override` in a commented settings.toml; load model on first request, unload after scans | 🟢 read directly | `llm/model_selection.rs`, `README.md:48-70` | `lessons.md` / `backend-specialist` | **Consider** |
| **A/B benchmark research kept as a first-class, gitignored-corpus harness** — phased scripts + `GROUND_TRUTH.json` + `RESULTS.md` chose qwen2.5vl:7b (80% vs 33-50%) and Surya as primary OCR; copyrighted/personal test corpus deliberately gitignored, with instructions to BYO | 🟢 read directly | `_research_ab_test/`, `README.md:205-224` | `agent-evaluation` / `gotchas.md` (4th IP-hygiene signal: gitignore copyrighted/personal data) | **Adopt** |
| **Thin orchestrator UI, feature state in dedicated hooks/components** — `App.tsx` only holds layout/search/mode-switch; each tool mode is a self-contained component owning its data loading | 🟡 inferred from CLAUDE | `CLAUDE.md:85` | `frontend-design` | **Skip** (sound but generic React guidance) |

### Adopt
1. **3-tier tolerant LLM-JSON parsing (parse → balanced-extract → regex-salvage with typed defaults)** → `api-patterns`/`gotchas.md`. The single most reusable artifact here; 5th+ "ground/repair LLM output" signal across the session, now with a concrete Rust salvage implementation to model (concept only — GPL code, no copy).
2. **Multi-attempt + progressive-fallback-prompt + allow-list-validated classification** → `api-patterns`.
3. **Incremental/resumable/move-aware indexing** (metadata-only discovery, fingerprint move-detection, per-file checkpoint, per-phase cancel/resume) → `backend-specialist`. The canonical "re-scan a huge tree cheaply" recipe.
4. **Two-tier dup detection + Union-Find transitive grouping + algebraic early-exit bound** → `backend-specialist`/`lessons.md`.
5. **Quarantine all OS-specific code behind one `platform/` module, enforced by multi-OS CI** → `clean-code`/`devops-engineer`.
6. **Append-only position-identified DB migrations** (`user_version`, ADD COLUMN only, test fresh+existing) → `database-design`/`gotchas.md`. Same backward-compat DNA as ai-jail's config rules, applied to schema.
7. **Read-only over user data; all derived artifacts in a dedicated app-data dir mirroring source paths** → `backend-specialist`/`security-auditor`.
8. **Benchmark-driven model/tool choice with a reproducible harness + gitignored copyrighted corpus + BYO instructions** → `agent-evaluation`/`gotchas.md`.

### Consider (needs a decision)
- Isolate a heavy/foreign runtime (Python ML) in its own venv invoked as a subprocess, bundled as an app resource, instead of linking it into the native binary.
- Hardware-aware model selection with user override and on-demand load/unload to bound VRAM.

### Skip
- Generic React structure guidance (thin `App.tsx` orchestrator, per-feature hooks) — good practice, not novel.
- All product-specific UI/UX (VSCode-inspired layout, confidence slider, etc.).

> **License note:** GPL-3.0 is the hardest IP flag of the session — concretely don't reuse code. The mined value is architecture: tolerant LLM-JSON repair, incremental/resumable indexing, Union-Find dup grouping, `platform/` OS-quarantine, append-only migrations, read-only-over-source. This repo is the strongest single source for `api-patterns`, `backend-specialist`, and `database-design` in the log so far.

---

## 2026-06-28 — FrankYomik

- **Repo:** https://github.com/akitaonrails/FrankYomik.git
- **License:** 🔴 **Dual copyleft: server is AGPL-3.0, client (Flutter + extension) is GPL-3.0.** Code is NOT reusable (would force consuming project to matching license). Architecture + patterns + organizational insights only.
- **Stack / maturity:** Go 1.21 API + Python 3.12 workers, Redis Streams, Flutter 3.11 mobile, Chromium MV3 extension. Multiple pipelines (manga translate/furigana, webtoon). Content-addressed v2 cache with git-backed manifests. 356 Python + 34 integration + Go + 50 Flutter tests. Docker Compose deployment with Cloudflare Tunnel support. Mature, highly coordinated cross-platform system.
- **Domain:** distributed end-to-end manga/webtoon real-time translation. Image processing pipeline (detection → OCR → LLM → render) with sophisticated multi-client overlay logic.

### Patterns found

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **Content-addressed v2 cache with manifest-as-source-of-truth** — objects at `objects/<aa>/<bb>/<sha256>`, page manifests at `pages/by-hash/<pipeline>/<source_hash>/manifest.json` as the single source, Redis/mtime/refs are transient | 🟢 read directly | `cache.go`, `page_cache.py`, `CLAUDE.md:68-76` | `backend-specialist` / `lessons.md` | **Adopt** |
| **Pre-enqueue dedup: hash the input, check Redis/cache for prior job, re-enqueue + `force=true` if stale (60s+)** — avoid redundant processing but gracefully refresh old results | 🟢 read directly | `queue.go`, `handlers.go`, `CLAUDE.md:179` | `api-patterns` / `backend-specialist` | **Adopt** |
| **Layered job reliability: HTTP timeouts + retry-with-backoff + PEL claiming + stale job timeout + cache-download fallback** — multiple independent recovery mechanisms for high-latency/unreliable links | 🟢 read directly | `api_service.dart`, `jobs_provider.dart`, `consumer.py`, `CLAUDE.md:173-182` | `backend-specialist` / `gotchas.md` | **Adopt** |
| **Trust boundaries explicitly documented** (image upload, metadata, websocket, webview, cache) — design assumes these are hostile; validate path components, parse URLs safely, etc. | 🟢 read directly | `CLAUDE.md:127-151` | `security-auditor` | **Adopt** |
| **Multi-client state sync requirement: 3+ places must agree** (handlers.go, consumer.py, jobs_provider.dart, extension service worker) when job shape/metadata changes | 🟢 read directly | `CLAUDE.md:184-206` | `backend-specialist` / `devops-engineer` | **Adopt** |
| **WebView strategy pattern with site-specific implementations** — Kindle vs Naver capture/detection logic isolated in pluggable strategies; safe URL matching via parsed host, not regex | 🟢 read directly | `CLAUDE.md:141-145`, `kindle_strategy.dart`, `naver_webtoon_strategy.dart` | `frontend-design` / `clean-code` | **Consider** |
| **Automatic versioning from git commit count** — Android `versionCode` auto-derives from `git rev-list --count HEAD`; bumped every commit; avoids regression (code won't install if versionCode < prior build) | 🟢 read directly | `build.gradle.kts`, `CLAUDE.md:153-161` | `devops-engineer` / `gotchas.md` | **Consider** |
| **Content-aware rendering: font selection, color respect, SFX character handling** — not just overlay text, but re-render with pipeline/content-specific choices | 🟡 inferred (not fully read source) | `text_renderer.py`, `README.md:26-36` | `frontend-design` | **Skip** (domain-specific visual logic) |

### Adopt
1. **Content-addressed v2 cache with manifest as truth** — `objects/<aa>/<bb>/<sha256>`, manifests at `pages/by-hash/<pipeline>/<source_hash>/manifest.json`, Redis/mtime as transient delivery layer → `backend-specialist`/`lessons.md`. Separates durable storage from ephemeral queue state.
2. **Pre-enqueue dedup with stale-result re-enqueue** → `api-patterns`. Hash input, check for prior job, if result expired (>60s old), re-enqueue with `force=true` instead of returning stale data.
3. **Layered reliability: HTTP timeouts + exponential backoff + PEL claiming + stale-job timeout + cache-download fallback** → `backend-specialist`/`gotchas.md`. Every layer is independent; if one fails, the next catches it.
4. **Trust boundaries as a first-class design document** → `security-auditor`. Images, metadata, websocket clients, webview content, cache are all hostile; list what needs validation.
5. **Multi-client sync requirement: document what must stay in sync when** (handlers.go ↔ consumer.py ↔ jobs_provider.dart ↔ extension) → `devops-engineer`. Pre-empts silent bugs.

### Consider (needs a decision)
- Strategy pattern for cross-platform WebView integrations (Kindle vs Naver detection/capture); safe URL matching via parsed host.
- Automatic versioning from git commit count to prevent Android "version code regression" (app won't install).

### Skip
- Content-specific rendering logic (fonts, color, SFX characters for manga/webtoon) — domain-specific visual design.

> **License note:** Strongest dual-copyleft repo of the session — all rights reserved on both ends. Architecture/org insights are rich (v2 cache, multi-client sync, reliability layers, trust boundaries) but the code itself is not reusable. The system design (distributed pipeline, cache model, job reliability) is the prize.

---

## 2026-06-28 — FrankClaw (https://github.com/akitaonrails/FrankClaw)

- **Repo:** Comprehensive clone. Stack: Rust 1.93+ (2024 edition) monorepo (13 crates), tokio async, SQLite with ChaCha20-Poly1305 encryption, Axum WebSocket+HTTP server, multi-provider LLM (OpenAI, Anthropic, Ollama, Copilot, Gemini, OpenRouter, Groq, Together, DeepSeek), 7 messaging channels (Web, Telegram, Discord, Slack, Signal, WhatsApp, Email), Chrome DevTools Protocol for browser automation, SQLite FTS5 + vector embeddings (OpenAI, Ollama, Gemini, Voyage AI), Redis Streams (optional), ai-jail sandbox (bubblewrap+landlock), Plugin SDK with manifest discovery, ratatui TUI, rust-i18n (9 locales), comprehensive security audit (7 categories, severity-rated).
- **License:** 🔴 **AGPL-3.0 (strong copyleft).** Code is NOT freely reusable — lifting any would force the consuming project to AGPL. Mine concepts/architecture only; never copy literal code.
- **Maturity signals:** 920+ tests (`cargo test`), multi-OS CI (`cargo check/clippy/test/audit`), security-focused (`#![forbid(unsafe_code)]` on all crates), zero dependencies on OpenSSL (rustls only), release builds use LTO + stripped symbols + `panic = abort`, all secrets wrapped in `SecretString` (zeroed on drop), comprehensive input validation checklist in CLAUDE.md (11 rules), attack-driven development (explicitly docs OpenClaw security audit and FrankClaw's fixes), third-party safety review documented.

### Patterns found

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **Credential leak detection: 12 regex patterns with severity-based action (Block/Redact/Warn)** — scans all LLM and tool output, word-level split for normal patterns, full-content for PEM keys; masks on log output; blocks critical leaks (API keys, SSH keys, JWT) | 🟢 read directly | `leak_detector.rs:61-128`, `CLAUDE.md:53` | `security-auditor` / `gotchas.md` | **Adopt** |
| **13-dimension complexity scorer for smart model routing** — weights reasoning/tokens/code/multi-step/domain/ambiguity/creativity/precision/context/tool/safety/questions/sentence; routes simple queries to cheap models (50-70% cost reduction) | 🟢 read directly | `routing.rs:20-200`, README lines 48-49 | `backend-specialist` / `performance-profiling` | **Adopt** |
| **Defense-in-depth security: 11-point validation checklist as first-class documentation** — IDs size-bounded (255 bytes), all text inputs size-checked, no user data in system prompts, all SQL parameterized, SSRF protection on all outbound HTTP, filenames sanitized, tool args validated, text to LLM sanitized (Unicode Cc/Cf stripped), external content wrapped, prompt size hard-capped (2 MB), files optionally VirusTotal-scanned | 🟢 read directly | `CLAUDE.md:111-185` (Rule 1-11) | `security-auditor` / `lessons.md` | **Adopt** |
| **Encryption at rest with ChaCha20-Poly1305** — all sensitive data (sessions, credentials, config) encrypted when master key provided; automatic `secure_delete` on SQLite WAL | 🟢 read directly | `CLAUDE.md:79`, `crypto/` crate, `sessions/` storage | `frankclaw-crypto` crate (library-grade implementation) | **Adopt** |
| **Constant-time token comparison + Argon2id password hashing (t=3, m=64MB, p=4 — OWASP params)** — timing-safe auth, no early returns; prevents both timing side-channels and weak password attacks | 🟢 read directly | `CLAUDE.md:49`, `auth.rs`, `crypto/` | `security-auditor` / `gotchas.md` | **Adopt** |
| **Hard refusal to start on non-loopback without auth configured** — not a warning, a fatal error; prevents accidental LAN/WAN exposure | 🟢 read directly | `CLAUDE.md:75`, `gateway/src/main.rs` (inferred) | `devops-engineer` / `security-auditor` | **Adopt** |
| **Structured concurrency with tokio: CancellationToken, JoinSet, no fire-and-forget spawns** — graceful shutdown, no orphaned tasks, task-driven health signals | 🟡 inferred from CLAUDE + Rust async best practices | `CLAUDE.md:45` | `backend-specialist` / `clean-code` | **Consider** |
| **Config hot-reload via arc_swap::ArcSwap (lock-free pointer swap)** — non-blocking updates; restart-sensitive config changes detected/flagged instead of silently applied | 🟡 inferred from CLAUDE | `CLAUDE.md:46` | `devops-engineer` / `lessons.md` | **Consider** |
| **Internationalization with structured i18n (rust-i18n, flat YAML v1 keys, 9 locales)** — system prompts in English only; "respond in {language}" appended per-locale; code stays English; only user-facing text translatable | 🟢 read directly | `CLAUDE.md:60-71`, `crates/frankclaw-cli/locales/*.yml` | `documentation-writer` / `lessons.md` | **Consider** |
| **Plugin system: manifest-based discovery, enable/disable lifecycle** — pluggable channel adapters and model providers via trait; no hard-coded list | 🟡 inferred from README/CLAUDE | `CLAUDE.md:70-79` (plugin-sdk crate), README lines 33 | `backend-specialist` | **Consider** |
| **Browser automation via Chrome DevTools Protocol (CDP) with profile-based concurrency** — 11 tools (screenshot, extract, click, type, press, etc.); port allocation 18800-18899 for parallel sessions; named browser profiles | 🟢 read directly | `CLAUDE.md:32`, README lines 60-64 | `frontend-design` / `backend-specialist` | **Consider** |
| **Three-tier tool risk levels (ReadOnly/Mutating/Destructive) with per-tool approval override and UI cards** — tools explicitly classified; approval gates via `FRANKCLAW_TOOL_APPROVAL`; inline approval in web console | 🟢 read directly | `CLAUDE.md:61`, README lines 61, 25 | `security-auditor` / `api-patterns` | **Consider** |
| **Job state machine with self-repair** — full lifecycle (Pending→InProgress→Completed→Accepted), stuck detection, automatic recovery | 🟡 inferred (CLAUDE references but not read source) | `CLAUDE.md:57`, `cron/` crate | `backend-specialist` / `gotchas.md` | **Consider** |
| **Webhook transforms: JSON path extraction, templates, per-mapping rate limiting and concurrency control** — flexible payload transformation, guard against webhook storms | 🟡 inferred from README | README lines 70 | `api-patterns` | **Skip** (webhook-specific, not broadly generalizable) |
| **Memory/RAG: SQLite FTS5 + cosine vector similarity with hybrid scoring, embedding providers with SHA-256 caching** — paragraph-based chunking, automatic file sync | 🟡 inferred (not fully read source) | `CLAUDE.md:68`, `memory/` crate, README lines 68-69 | `backend-specialist` / `lessons.md` | **Skip** (sophisticated but FTS5+vector is already logged in FrankSherlock/FrankYomik entries) |
| **OpenAI-compatible API endpoints (/v1/chat/completions, /v1/models) for drop-in client support** — allows any OpenAI-compatible tool to talk to FrankClaw as if it were OpenAI | 🟢 read directly | `CLAUDE.md:22`, README lines 22 | `api-patterns` | **Skip** (good pattern but implementation-specific, leverages OpenAI's published API contract) |
| **File I/O security: 0o600 owner-only permissions on all sensitive files, 0o700 on directories** — enforced across all storage paths | 🟢 read directly | `CLAUDE.md:48` | `security-auditor` / `lessons.md` | **Adopt** |
| **SSRF protection: outbound HTTP resolves DNS first, blocks private IPs (RFC 1918), loopback, link-local, CGNAT, documentation ranges** — active on all SafeFetcher calls, no user-controlled URL bypasses | 🟢 read directly | `CLAUDE.md:76-77`, `core/` crate IP blocklist | `security-auditor` / `api-patterns` | **Adopt** |

### Adopt (ready for follow-up)

1. **Credential leak detection with 12 patterns + severity-based actions (Block/Redact/Warn)** → `security-auditor`/`gotchas.md`. The most comprehensive signal-to-noise leak detector yet (prior session repos didn't have this level of sophistication).
2. **13-dimension complexity scorer for intelligent model routing** → `backend-specialist`/`performance-profiling`. Reduces cost 50-70% without sacrificing quality; adaptable framework beyond just cost optimization (latency, safety-sensitivity, etc.).
3. **Defense-in-depth 11-point validation checklist as documented law** → `security-auditor`/`lessons.md`. This is a template for any project handling external data; first fully written-out, product-grade checklist of the session.
4. **ChaCha20-Poly1305 encryption at rest for sessions/credentials/config** → `frankclaw-crypto` as library-grade reference (not just concept — deployable Rust code for defensive tech stacks).
5. **Constant-time token comparison + Argon2id (OWASP params)** → `security-auditor`/`gotchas.md` (applies anywhere auth happens).
6. **Hard refusal to start if non-loopback + no auth** → `devops-engineer`/`security-auditor` (operational security: fail closed, not degraded).
7. **File permissions: 0o600 on sensitive files, 0o700 on dirs** → `security-auditor`/`lessons.md`. Fundamental but often skipped; now documented as a hard requirement.
8. **SSRF protection: block private IPs, loopback, CGNAT, documentation ranges** → `security-auditor`/`api-patterns`. Complete IP blocklist for any safe-fetcher.

### Consider (needs a decision)

- Structured concurrency (CancellationToken, JoinSet) — real and important for async safety, but Rust-specific guidance; applicable to DevBureau's own tokio-based tooling if it exists.
- Config hot-reload via arc_swap (lock-free pointer swap) + restart-sensitive detection → `devops-engineer`/`lessons.md`.
- Internationalization with flat YAML v1 keys + English-only system prompts + per-locale "respond in X" instruction → `documentation-writer`/`lessons.md` (applicable if DevBureau ever ships CLI i18n).
- Plugin system with trait-based discovery and lifecycle → `backend-specialist` (Rust-specific but valuable for plugin-based architectures in general).
- Browser automation via CDP with profile-based concurrency and port allocation → `frontend-design`/`backend-specialist`.
- Three-tier tool risk levels (ReadOnly/Mutating/Destructive) + inline approval UI → `api-patterns` (generalizable beyond FrankClaw; could adapt to other agent systems).
- Job state machine with self-repair → `backend-specialist`/`gotchas.md` (applies to any distributed/async workflow).

### Skip

- Webhook transforms (JSON path extraction, templates) — webhook-specific, limited generalization.
- Memory/RAG FTS5+vector — already captured in prior session repos (FrankSherlock, FrankYomik).
- OpenAI-compatible API endpoints — leverages published OpenAI contract; good pattern but implementation-specific.

> **License note:** Strong copyleft (AGPL-3.0). No code can be lifted. The system architecture (defense-in-depth, crypto, router, multi-client coordination, tool classification, state machine) is the prize. FrankClaw represents the highest maturity level of the session: production-grade, security-hardened, multi-stakeholder design (Rust team's guidance on unsafe forbids, Argon2 OWASP params, etc.), and attack-driven development (explicitly documents OpenClaw vulnerabilities and FrankClaw fixes). A rare "exemplary system" to study.

---

> **Session note (16 repos mined: FrankMD, FrankMega, frank_type, frank_fbi, ai-memory, distrobox-gaming, akitaonrails.github.io, frank_investigator, ai-usagebar, ai-jail, llm-coding-benchmark, ghpending, tropicalruby-2026, FrankSherlock, FrankYomik, FrankClaw).** Recurring cross-repo themes worth consolidating if ever acted on: (1) **config-as-data with a single typed resolver, file > ENV > default, no scattered reads** (FrankMD, distrobox-gaming, ai-memory, ai-jail, ai-usagebar). (2) **Fail toward caution / graceful degradation** — degraded mode gets more conservative, never more confident, and for security primitives fails more-restrictive (frank_fbi, frank_investigator, ai-jail, ai-memory). (3) **Ground claims/output against verifiable facts; treat LLM output as untrusted text to repair, not truth** (frank_fbi, frank_investigator, llm-coding-benchmark, tropicalruby-2026 where even a *slide's* numbers are recomputed from git via `tokei`, FrankSherlock's 3-tier tolerant LLM-JSON parse → balanced-extract → regex-salvage, and FrankClaw's leak detection). (4) **Secret-read discipline** — no `cat`/loose `env|grep` on creds, gitignore artifacts that capture env, trim/empty-filter tokens, mark auth headers sensitive, reject credential-bearing proxy URIs (ai-usagebar, ai-jail, llm-coding-benchmark, ghpending); this also drove the read-tool change made earlier this session. (5) **Lean self-hosting on SQLite, zero external/cloud services** (FrankMega, ai-memory, frank_investigator, FrankSherlock with FTS5 + append-only `user_version` migrations + read-only-over-source). (6) **Test at the boundary / hermetic tests / stub fidelity** (FrankMD, ai-usagebar, frank_investigator). (7) **Markdown/files as source of truth, derived index rebuildable** (ai-memory, frank_type, akitaonrails.github.io). (8) **Defense-in-depth security as explicit design law, not afterthought** (ai-jail, FrankSherlock, FrankClaw with credential-leak detection, SSRF blocks, encryption at rest, three-tier approval, hard-fail-closed refusals).

---

## 2026-07-01 — Anthropic prompt engineering docs (https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)

> **Wave 2, Source 4 of 4** (see `behavioral-alignment-wave2.md`). Sources 1-3 (awesome-cursorrules, aider, continue-dev) remain pending. First-party guidance from the model manufacturer, mined for gaps in DevBureau's own agent behavior rules and in the `ai-engineer` skill's prompting guidance. Unlike the third-party repos above, Wave 2's protocol authorizes merging Adopt items directly into the kit in the same pass (not log-only).

**Source:** Official Anthropic documentation (consolidated "Prompting best practices" reference page, covering general principles, output/formatting, tool use, thinking, and agentic systems for current-generation Claude models).

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Ground answers in actually-read code — never speculate about a file/function you haven't opened, even for explanatory (non-editing) questions | 🟢 | "Minimizing hallucinations in agentic coding" §, `investigate_before_answering` sample prompt | `DEVBUREAU.md` Anti-Hallucination section | Adopt |
| A passing test suite must reflect a general solution — never hardcode values or special-case visible test inputs to make tests pass; say so if a test is wrong instead of working around it | 🟢 | "Avoid focusing on passing tests and hard-coding" § | `DEVBUREAU.md` Zero-Break Deployment Protocol | Adopt |
| Clean up temp scripts/files created purely for iteration once the task is done | 🟢 | "Reduce file creation in agentic coding" § | `DEVBUREAU.md` Surgical Changes Protocol | Adopt |
| Don't delegate to a subagent what a direct tool call (grep/read) already solves; reserve delegation for genuinely parallel or isolated-context work | 🟢 | "Subagent orchestration" §, "watch for overuse" | `orchestrator.md` Best Practices | Adopt |
| Structure complex prompts with XML tags (`<instructions>`, `<context>`, `<example>`); tell the model what TO do instead of what NOT to do; for long-context tasks (20k+ tokens) put documents near the top and ask for a grounding quote before the answer | 🟢 | "Structure prompts with XML tags", "Control the format of responses", "Long context prompting" §§ | `ai-engineer/SKILL.md` Prompt Engineering & Optimization | Adopt |
| Prefilling the assistant's final turn is deprecated/errors on current-generation Claude models — migrate to structured outputs/tool calling for format control, direct system-prompt instructions for preamble control | 🟢 | "Migrating away from prefilled responses" § | `ai-engineer/SKILL.md` Prompt Engineering & Optimization | Adopt |
| Give Claude a role via system prompt to focus tone/behavior | 🟢 | "Give Claude a role" § | — | Skip (DevBureau's entire agent-persona architecture already is this, at a much deeper level) |
| Balancing autonomy and safety — confirm before hard-to-reverse/destructive/visible-to-others actions | 🟢 | "Balancing autonomy and safety" § | — | Skip (near-verbatim already in DevBureau's "Executando ações com cuidado" + this session's own top-level system instructions) |
| Overeagerness / avoid over-engineering, unrequested abstractions, defensive coding for unreachable cases | 🟢 | "Overeagerness" § | — | Skip (already covered, arguably more thoroughly, by Lean Code Ladder + Surgical Changes Protocol) |
| Concise, fact-based, non-self-congratulatory communication style | 🟢 | "Communication style and verbosity" § | — | Skip (already covered by "Anti-Bajulação" + "Sem palavras-tell" + "Remove elogios sem evidências") |
| Frontend "AI slop" aesthetics (generic fonts, purple gradients, predictable layouts) — be distinctive | 🟢 | "Frontend design" § | — | Skip (already covered by `frontend-specialist.md`'s Purple Ban + Template Ban + anti-cliché rules) |
| Structured long-horizon state: `tests.json` (structured) + `progress.txt` (freeform) + git as the audit trail across context windows | 🟡 | "State management best practices" § | `agent-evaluation` / `.agent/memory/` | Consider (meaningful overlap with DevBureau's existing `{task-slug}.md` plan-file convention + `.agent/memory/lessons.md`/`gotchas.md`; a cleaner unification is a real but separate decision, not a clean net-new adopt) |
| Context-window awareness / compaction instructions so the agent doesn't stop early near the token limit | 🟡 | "Context awareness and multi-window workflows" § | — | Consider (already handled at the Claude Code harness level per this session's own system reminder on auto-compaction; only relevant if DevBureau ever targets non-Claude-Code harnesses without that feature) |
| Explicit action-taking instructions ("change this function" vs. "can you suggest changes") | 🟢 | "Tool usage" § | — | Skip (mirror-image of DevBureau's own SIMPLE CODE vs. QUESTION request classifier, already solved from the routing side) |
| Model-specific effort/adaptive-thinking API migration guidance (`budget_tokens` → `effort`) | 🟡 | "Overthinking and excessive thoroughness", migration examples | `ai-engineer/SKILL.md` Knowledge Base | Skip this pass (real but out of scope — a Knowledge Base model/version refresh is a separate maintenance task, not a prompting principle) |

**Adopt (merged this pass):**
1. Ground-claims-in-actually-read-code → `.agent/rules/DEVBUREAU.md` Anti-Hallucination & Loop Protection (new "Ground Claims in Actually-Read Code" subsection).
2. No-hardcoding-to-pass-tests → `.agent/rules/DEVBUREAU.md` Zero-Break Deployment Protocol (new paragraph after the evidence table).
3. Clean-up-scratch-files → `.agent/rules/DEVBUREAU.md` Surgical Changes Protocol (new table row).
4. Don't-delegate-what-a-direct-call-solves → `.agent/agents/orchestrator.md` Best Practices (new item 6).
5. XML-tag structuring + positive framing + long-context document grounding → `.agent/skills/ai-engineer/SKILL.md` Prompt Engineering & Optimization (new bullets).
6. Prefill-deprecation migration note → `.agent/skills/ai-engineer/SKILL.md` Prompt Engineering & Optimization (same edit as #5).

**Consider (needs a decision):** unify `{task-slug}.md`/`.agent/memory/` conventions with the `tests.json`+`progress.txt`+git state-tracking pattern for very long `/ade` runs; context-window-awareness prompting (only relevant outside Claude Code harnesses).

**Skip:** role-prompting, autonomy/safety confirmation, anti-over-engineering, concise/non-sycophantic communication, frontend anti-cliché rules, explicit-action-language — all already covered at least as thoroughly elsewhere in the kit; effort/adaptive-thinking API migration (out of scope, separate maintenance task).

Ran `sync_ide.py --target all` and `doctor.py` after merging. Sources 1-3 of Wave 2 (awesome-cursorrules, aider, continue-dev) remain pending — see `behavioral-alignment-wave2.md`.

---

## 2026-07-01 — PatrickJS/awesome-cursorrules (https://github.com/PatrickJS/awesome-cursorrules)

> **Wave 2, Source 1 of 3 (remaining).** Community-curated aggregator of `.cursorrules`/`.mdc` files for the Cursor AI editor. Mined via a research subagent sampling 10 diverse rule files across stacks (anti-sycophancy, anti-overengineering, clean-code, FastAPI, Flutter, Go, Jest, Cypress, Next.js, C++). License: CC0 1.0 Universal (public domain, no attribution required, zero IP risk).

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Distinguish "compiles" from "correct" — confirm a function does what its NAME promises, not just that it returns without error | 🟢 | `anti-sycophancy-code-discipline` | `DEVBUREAU.md` Zero-Break Deployment Protocol | Adopt (folded into the risk-tiering note below rather than a separate row) |
| Match verification depth to change risk — trivial change → syntax/type check; logic change → manual trace; concurrency/state change → written-out failure scenario | 🟢 | `anti-sycophancy-code-discipline` | `DEVBUREAU.md` Zero-Break Deployment Protocol | Adopt |
| `VERIFY: <library>.<symbol>` inline marker when uncertain a library/API call actually exists, instead of inventing a plausible signature | 🟡 | `anti-sycophancy-code-discipline` | `DEVBUREAU.md` Anti-Hallucination & Loop Protection | Adopt |
| Idempotency key required on every side-effecting endpoint; single-writer principle for safety-critical state | 🟢 | `fastapi-production-architecture` | `.agent/agents/backend-specialist.md` | Adopt |
| 3-5 focused tests per file cap; auto-detect TS/JS (tsconfig/package.json) before writing test syntax | 🟢 | `jest-unit-testing`, `cypress-e2e-testing` | `.agent/skills/testing-patterns/SKILL.md` | Adopt |
| Strict layered architecture (Router → Service → Repository → ORM) with hard import boundaries + LOC governance thresholds (400 green / 600 blocks merge) | 🟢 | `fastapi-production-architecture` | `backend-specialist.md` | Consider — opinionated architecture prescription, not a universal behavior; risks conflicting with "match existing project style" on brownfield work |
| Enumerate ≥3 concrete failure modes (empty input, boundary value, state assumption) before claiming code "works" | 🟢 | `anti-sycophancy-code-discipline` | — | Skip (overlaps with existing evidence table + risk-tiered verification just adopted above) |
| Name a trade-off once when pressured, then comply without repeating it | 🟡 | `anti-sycophancy-code-discipline` | — | Skip (Anti-Bajulação already covers holding a position under pressure) |
| `data-testid` selectors over CSS/XPath; ban hard-coded waits; mock before imports | 🟢 | `cypress-e2e-testing`, `jest-unit-testing` | — | Skip (standard QA practice already implicit in `test-engineer`/`qa-automation-engineer` domain expertise) |
| Class/function size ceilings (200 instructions/class, 20/function, 10 public methods) | 🟢 | `cpp-programming-guidelines` | — | Skip (DevBureau's Clean Code standards already impose function-size/arg-count limits) |
| "Defer to existing project structure over the rule file's own prescriptions" | 🟢 | `flutter-app-expert` | — | Skip (redundant with Surgical Changes Protocol's "match existing style") |

**Adopt (merged this pass):**
1. Risk-tiered verification depth → `.agent/rules/DEVBUREAU.md` Zero-Break Deployment Protocol (new paragraph after the evidence table).
2. `VERIFY: <library>.<symbol>` marker → `.agent/rules/DEVBUREAU.md` Anti-Hallucination & Loop Protection (new line under "Ground Claims in Actually-Read Code").
3. Idempotency key + single-writer principle → `.agent/agents/backend-specialist.md` (API Development ✅ list + Architecture ❌ list).
4. Test-file scoping (3-5 tests/file, auto-detect stack) → `.agent/skills/testing-patterns/SKILL.md` (new "File Scoping" subsection).

**Consider (needs a decision):** FastAPI layered architecture + LOC governance thresholds — valuable but prescriptive; needs a human call on whether `backend-specialist.md` should default to it for greenfield work only, to avoid conflicting with "match existing style" on brownfield projects.

**Skip:** 3-failure-mode enumeration, pressure-response phrasing, data-testid/no-hard-waits QA basics, class/function size ceilings, defer-to-project-structure — all redundant with DevBureau content already covered elsewhere.

---

## 2026-07-01 — aider-chat/aider (https://github.com/aider-chat/aider, https://aider.chat/docs/)

> **Wave 2, Source 2 of 3 (remaining).** Mature (2+ years, ~47k stars, weekly releases) autonomous AI-pair-programming CLI. Apache-2.0. Notable maturity signal: tracks a "Singularity" metric (% of its own new code written by itself, 88% at time of check) and a public polyglot benchmark scoring edit-format compliance and task correctness as separate axes.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Minimal-context-by-design: only pull in files there's good reason to believe are relevant, not whole directories "just in case" — excess context measurably degrades output quality, not just cost | 🟢 | `docs/faq.html`, `docs/usage/tips.html` | `DEVBUREAU.md` (new section near Surgical Changes Protocol) | Adopt |
| Context-budget via graph-ranking: rank files/symbols by dependency-graph connectivity, read the most-referenced first, expand only when starting from zero context | 🟢 | `docs/repomap.html` | `.agent/agents/explorer-agent.md` | Adopt |
| Isolate agent-authored commits from pre-existing dirty state — flush the user's pre-existing uncommitted changes into their own commit before the agent's own change lands | 🟡 | `docs/git.html` | `.agent/agents/devops-engineer.md` | Adopt |
| Pre-create an empty target file before asking the AI to populate it — models default to appending into an existing file rather than creating a new one unless it already exists on disk | 🟡 | `docs/usage/tips.html` | `.agent/memory/lessons.md` | Adopt |
| Edit-format selection matched to model capability (whole-file vs. search/replace vs. unified-diff per model's known quirks) | 🟢 | `docs/more/edit-formats.html` | — | Skip (specific to aider's own diff-applying engine; DevBureau is a prompt/rules kit, not an edit-applying engine) |
| Separating "edit format compliance" from "task correctness" as two independent benchmark axes | 🟢 | `docs/leaderboards/` | — | Skip (belongs to a benchmarking tool, not an operating-rules kit) |
| Auto-lint after every edit (default ON) / auto-test after edits (default OFF, opt-in) | 🟢 | `docs/config/options.html` | — | Skip (DevBureau's Zero-Break Protocol + Final Checklist already mandates fresh test evidence, stricter than aider's opt-in default) |
| Auto-commit after every edit + `/undo` for one-command rollback | 🟢 | `docs/git.html` | — | Skip (auto-commit-by-default conflicts with DevBureau/harness's explicit "never commit unless asked" stance) |
| Persistent `CONVENTIONS.md` loaded into every session | 🟢 | `docs/usage/conventions.html` | — | Skip (DevBureau's CLAUDE.md/DEVBUREAU.md + memory layer already serve this role) |
| Incremental one-goal-at-a-time workflow with a "discuss a plan first" mode before implementing | 🟡 | `docs/usage/tips.html` | — | Skip (redundant with Socratic Gate + Alinhamento de Workspace) |

**Adopt (merged this pass):**
1. Minimal-context-by-design → `.agent/rules/DEVBUREAU.md` (new "Context Scoping Discipline" section after Surgical Changes Protocol — merged with Source 3's named-context-vocabulary finding below into one section).
2. Context-budget graph-ranking heuristic → `.agent/agents/explorer-agent.md` (new "Context Budgeting" subsection under Discovery Flow).
3. Isolate-agent-commits-from-dirty-state → `.agent/agents/devops-engineer.md` (new Anti-Patterns table row).
4. Pre-create target files → `.agent/memory/lessons.md` (new dated entry, 2026-07-01).

**Consider:** none carried forward — the two borderline items (edit-format-per-model, benchmark-axis split) were judged Skip as too tool-specific to aider's own architecture rather than needing a further decision.

**Skip:** auto-lint/auto-test defaults, auto-commit + `/undo`, persistent CONVENTIONS.md, incremental-plan-first workflow — redundant with existing DevBureau protocols or in direct conflict with the "never commit unless asked" git-safety stance.

---

## 2026-07-01 — continuedev/continue (https://github.com/continuedev/continue, https://docs.continue.dev/)

> **Wave 2, Source 3 of 3 (remaining) — now complete.** VS Code/JetBrains AI coding extension, Apache-2.0. Note: the project was acquired by Cursor (2026-06-18) and the repo archived/read-only as of 2026-06-19 — docs remain accessible and safe to mine, but this is frozen historical knowledge, not an actively evolving reference. This date is after this session's training cutoff; flagged per Chain-of-Verification as a claim sourced live from the docs site, not from training memory.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Named, scoped context providers (`@codebase`, `@diff`, `@terminal`, `@folder`, `@open`, ...) as an explicit menu to pull in only the context a request needs, rather than open-ended broad reads | 🟢 | `docs.continue.dev/customize/custom-providers` | `DEVBUREAU.md` (merged into the same Context Scoping Discipline section as Source 2's minimal-context finding) | Adopt |
| Glob/regex-scoped rule files (frontmatter `globs`/`regex`/`alwaysApply` tri-state) so a rule auto-applies only to matching file types instead of always loading | 🟢 | `docs.continue.dev/customize/deep-dives/rules` | Skill frontmatter convention (`.agent/skills/*/SKILL.md`) | Consider — structural change touching every skill's frontmatter schema; overlaps with the existing Domain Overlap Detection table and needs an explicit decision before a multi-file rollout |
| Retrieval pipeline tuning knobs (retrieve top-N → rerank → keep top-K) as an explicit, user-visible config | 🟢 | `docs.continue.dev/customize/model-roles/embeddings` | — | Skip (Continue-specific vector-index/LanceDB infrastructure; no equivalent surface in a prompt-based rules kit) |
| Numbered filename prefixes to control deterministic rule-file load order | 🟢 | `docs.continue.dev/customize/deep-dives/rules` | — | Skip (superseded by DevBureau's existing P0 > P1 > P2 priority system, a stronger mechanism) |
| Invokable prompt files (markdown + YAML frontmatter) as slash commands | 🟢 | `docs.continue.dev/customize/deep-dives/prompts` | — | Skip (DevBureau's slash-command system is already broader and more structured) |
| Local-first single `config.yaml` checked into git | 🟡 | `docs.continue.dev/guides/understanding-configs` | — | Skip (DevBureau's IDE-sync mechanism already solves "one source of truth, multiple targets" more completely) |
| CONTRIBUTING.md norms: align-before-code, one focused PR, mandatory test updates | 🟢 | `github.com/continuedev/continue/blob/main/CONTRIBUTING.md` | — | Skip (both sub-patterns already covered by Socratic Gate and Surgical Changes Protocol) |

**Adopt (merged this pass):**
1. Named context-scoping vocabulary → `.agent/rules/DEVBUREAU.md` "Context Scoping Discipline" section (item 3: "prefer named context handles over ad-hoc exploration").

**Consider (needs a decision):** glob/regex-scoped skill frontmatter (`applies_to`/`globs` field) — a genuinely new capability (skills that self-scope to file types) but requires editing every skill's frontmatter schema and deciding how it interacts with the Domain Overlap Detection table; too large a structural change to fold into this pass without explicit sign-off.

**Skip:** retrieval-tuning knobs, numbered load-order prefixes, invokable prompt files, local-first config.yaml, CONTRIBUTING.md process norms — all either Continue-specific infrastructure or already covered more completely by an existing DevBureau mechanism.

---

**Wave 2 close-out note:** All 4 sources now mined (see `behavioral-alignment-wave2.md`). Combined Adopt yield across Sources 1-3: 9 items merged (risk-tiered verification, `VERIFY:` marker, idempotency/single-writer, test-file scoping, context scoping discipline [3-part merge], context-budget graph-ranking, commit-isolation-from-dirty-state, pre-create-target-files). 2 items logged as Consider, requiring a human decision before any further action: FastAPI layered-architecture defaults (backend-specialist.md) and glob/regex-scoped skill frontmatter (kit-wide structural change). Lower-than-planned yield (9 net-new vs. the 11-17 originally estimated) reflects that DevBureau's existing coverage — Socratic Gate, Lean Code Ladder, Surgical Changes, Zero-Break, Anti-Hallucination, memory layer, slash-command system — already subsumed most of what these three sources had to offer; this is itself a signal of kit maturity, not a mining shortfall. Ran `sync_ide.py --target all` and `doctor.py` after merging.

---

## 2026-07-08 — affaan-m/ECC "Everything Claude Code" (https://github.com/affaan-m/ECC)

> **Direct competitor/peer, not a consumer app.** ECC is itself an agent-operating-system kit for Claude Code — same genre as DevBureau, but ~10x larger surface (30 agents, 135+ skills, 60+ commands, native `hooks.json` lifecycle, 211.9K★ / 230+ contributors). MIT license, no IP concern. Shallow clone (3,321 files); sampled top-level docs (`RULES.md`, `SOUL.md`, `hooks/hooks.json`, `hooks/memory-persistence/README.md`) plus ~15 targeted files across `commands/`, `skills/` chosen for structural novelty vs. DevBureau, not an exhaustive read of all 135 skills. **Maturity signals:** native Claude Code hook lifecycle (`PreToolUse`/`PostToolUse`/`Stop`/`SessionStart`/`SessionEnd`/`PreCompact`) wired to ~20 discrete hook scripts; a deterministic `harness-audit.js` scoring its own kit health; a GitHub-Issues-backed multi-agent work-coordination system (`epic-*` commands); an automated, hook-observed "instinct" memory system with confidence scoring and portable export/import.

**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| Block edits to linter/formatter/tooling config files via a dedicated hook, forcing the agent to fix code instead of weakening the guardrail | 🟢 | `hooks/hooks.json` `pre:config-protection` | `.agent/rules/DEVBUREAU.md` "Trilha de Auditoria" | Adopt |
| Deterministic, versioned kit-health rubric: 7-12 fixed 0-10 categories (Tool Coverage, Context Efficiency, Quality Gates, Memory Persistence, Eval Coverage, Security Guardrails, Cost Efficiency, + conditional deploy-target categories), reproducible per-commit, JSON or text output, top-3 prioritized actions | 🟢 | `commands/harness-audit.md` + `scripts/harness-audit.js` | `.agent/scripts/doctor.py` | Adopt |
| Human-in-the-loop "config GC": periodic scan of the kit itself (skills/memory/hooks/permissions/MCP/caches) for redundant, stale, or orphaned items, confirm-each-deletion — never autonomous delete | 🟢 | `skills/config-gc/SKILL.md` | new skill or `.agent/scripts/doctor.py` extension | Adopt |
| Batch expensive post-edit checks (format + typecheck) once at session `Stop` instead of after every single edit, via an accumulator that just records touched files | 🟢 | `hooks/hooks.json` `post:edit:accumulator` + `stop:format-typecheck` | `reference/OPERATIONS_DETAIL.md` (Final Checklist Protocol) | Adopt |
| Automated, hook-observed "instinct" memory: atomic learned behaviors captured via `PreToolUse`/`PostToolUse` observation hooks, confidence-scored, decayed/reinforced by repeated observation, project-scoped vs. global-scoped (project overrides global on ID collision), portable export/import as YAML for team sharing with explicit conflict resolution (higher-confidence wins) | 🟢 | `skills/continuous-learning-v2/SKILL.md`, `commands/instinct-status.md`, `instinct-export.md`, `instinct-import.md` | `.agent/memory/lessons.md` / `gotchas.md` | Consider (structural — would mean turning DevBureau's manually-curated memory files into an automated, hook-driven, confidence-scored system; large scope, needs explicit decision) |
| GitHub-Issues-as-source-of-truth multi-agent work coordination: claim/decompose/validate/publish/review/unblock/sync lifecycle over epic issues, with a local SQLite cache mirror and dependency-gated auto-unblock | 🟢 | `commands/epic-*.md` + `scripts/github-coordination.js` | `.agent/agents/orchestrator.md` / `/squad` workflow | Consider (needs a decision — real capability for coordinating `/squad` or `/ade` across multiple sessions/agents, but is a new subsystem, not a doc change) |
| Automated hook that warns when frontend edits drift toward generic template-looking UI | 🟢 | `hooks/hooks.json` `post:edit:design-quality-check` | `.agent/agents/frontend-specialist.md` (Purple Ban / Template Ban) | Consider (DevBureau already has the rule; this would be an automated enforcement layer DevBureau doesn't have a hook mechanism for yet) |
| PostToolUse warning hook for context exhaustion, high cost, scope creep, or repeated-tool loops, injected as an agent-visible warning | 🟢 | `hooks/hooks.json` `post:ecc-context-monitor` | `.agent/rules/DEVBUREAU.md` (Anti-Hallucination & Loop Protection is process-only today, no automated trigger) | Consider |
| MCP server health check before tool execution; blocks calls to unhealthy servers and tracks reconnect attempts | 🟢 | `hooks/hooks.json` `pre:mcp-health-check` / `post:mcp-health-check` | — | Consider (relevant given DevBureau's own MCP surface — headroom, serena, github — but needs a hook-execution mechanism DevBureau doesn't currently use) |
| 5-axis structured self-evaluation scorecard (accuracy, completeness, clarity, actionability, conciseness) with concrete evidence per axis, run after any 3+ file / 50+ line task | 🟢 | `skills/agent-self-evaluation/SKILL.md` | `.agent/rules/DEVBUREAU.md` directive #6 "Execução Orientada por Meta" | Consider (DevBureau's directive #6 already exists but is a one-line "declare criteria then check"; this is a sharper, more concrete rubric) |
| `pre:edit-write:gateguard-fact-force` hook: blocks the first Edit/Write/MultiEdit per file and demands investigation facts (importers, data schemas, user instruction) before allowing | 🟢 | `hooks/hooks.json` | — | Skip (this is the same third-party "GateGuard" already referenced as optional in `.agent/rules/reference/OPERATIONS_DETAIL.md`; confirms it's a real, working mechanism, nothing new to merge) |
| Doc-file-warning hook flagging non-standard documentation files on Write | 🟢 | `hooks/hooks.json` `pre:write:doc-file-warning` | — | Skip (redundant with DevBureau's own Docs Sync Guard, merged v3.32.0) |
| Portable instinct export/import as a generalized mechanism | 🟡 | `commands/instinct-export.md` / `instinct-import.md` | — | Skip as a standalone item (subsumed by the instinct-system Consider row above; noted only because it structurally resembles what `/mine-patterns` already does by hand — a meta-observation, not a new pattern) |

**Adopt (ready for follow-up):**
1. Config-protection principle (block edits to tooling/lint config files as a shortcut) → strengthen `.agent/rules/DEVBUREAU.md` "Trilha de Auditoria" with an explicit named example.
2. Deterministic multi-category kit-health rubric (versioned, reproducible, top-3 actions) → extend `doctor.py` scoring beyond current binary pass/fail.
3. Config-GC skill (confirm-each-deletion cleanup of DevBureau's own agents/skills/scripts/memory as the kit grows) → new skill, human-in-the-loop only.
4. Batch-at-Stop instead of batch-per-edit for expensive checks → document as the default pattern in the Final Checklist Protocol section.

**Consider (needs a decision):** automated hook-driven confidence-scored instinct memory vs. DevBureau's manual `lessons.md`/`gotchas.md` (biggest-scope item in this entry); GitHub-Issues epic coordination for `/squad`/`/ade` multi-session work; automated Purple-Ban/Template-Ban enforcement hook; context-exhaustion/scope-creep/tool-loop warning hook; MCP health-check before tool use; sharper 5-axis self-eval rubric for directive #6. All six require a Claude Code hook-execution mechanism DevBureau doesn't currently wire up (DevBureau today expresses these as prose rules the agent self-applies, not `hooks.json`-triggered scripts) — the underlying open decision is whether DevBureau adopts a `hooks.json` layer at all, which several of these Consider items depend on.

**Skip:** `gateguard-fact-force` (confirms existing third-party GateGuard reference, nothing new); doc-file-warning (redundant with Docs Sync Guard).

## 2026-07-11 — nidhinjs/prompt-master

**Repo:** https://github.com/nidhinjs/prompt-master — single-skill repo (SKILL.md 460 lines + references/), prompt-engineering skill that generates paste-ready prompts for external AI tools (Claude, Cursor, Midjourney, video AI). Mature structure: versioned frontmatter (v1.7.0), zone-based layout (primacy/middle), per-tool routing tables.
**Origin:** user asked whether DevBureau has an equivalent and whether it would improve inbound request interpretation before building.
**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| 9-dimension silent intent extraction; ask only about missing critical dimensions | 🟢 | `SKILL.md` "Intent Extraction" table | `brainstorming/SKILL.md` (Socratic Gate) | Adopt |
| Hard cap of 3 clarifying questions before producing | 🟢 | `SKILL.md` hard rules | `brainstorming/SKILL.md` (same graft) | Adopt |
| Per-tool prompt routing (Claude literal-following, no-CoT on reasoning-native models, Midjourney params) | 🟢 | `SKILL.md` "Tool Routing" + `references/templates.md` | would be a new outbound `prompt-engineering` skill | Skip (for now) |
| Zone-based skill layout (PRIMACY/MIDDLE zones for rule priority) | 🟡 | `SKILL.md` structure | `writing-skills` | Skip |

**Adopt (merged same session, v3.35.0):** Intent Extraction Matrix grafted into `brainstorming/SKILL.md` — silent extraction of 9 dimensions adapted to software-building context (goal, users, scope, success criteria, constraints, existing context, content/input, output shape, references); questions target only missing critical dimensions with a 3-per-round cap; the old fixed Purpose/Users/Scope trio demoted to fallback. Respects DEVBUREAU.md P0 (minimum 3 questions for new builds — remaining slots fill with edge-case/trade-off questions) and `question-preferences.md` suppression.
**Skip rationale:** outbound prompt-generation for external tools is a real gap but no demonstrated demand yet (Regra dos Três); `content-creator`/`ai-image-generator` already cover image-prompt needs. Zone-based layout solves rule-priority drift DevBureau already handles via P0>P1>P2 tiers.

## 2026-07-13 — Kulaxyz/self-learning-skills

**Repo:** https://github.com/Kulaxyz/self-learning-skills — MIT, single meta-skill (`self-learning`, 191-line SKILL.md + authoring reference + template). Teaches an agent to harvest "golden paths" (hard-won session knowledge) into reusable skills across Claude Code/Cursor/AGENTS.md tools.
**Origin:** user asked whether anything transfers to DevBureau.
**Patterns found:**

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| **Promotion rule**: only promote a session lesson to an authoritative artifact when (1) a passing check verified it, (2) the failure pattern it avoids is named, (3) ≥1 dead-end was concretely ruled out — otherwise it stays a tentative memory note | 🟢 | `SKILL.md` "Promotion rule: don't enshrine guesses" | `skillify/SKILL.md` | Adopt |
| Capture failures/dead-ends in the artifact itself ("What didn't work" section) — skipping a known dead-end next session is worth as much as the golden path | 🟢 | `SKILL.md` harvest brief | `skillify/SKILL.md` (same graft) | Adopt |
| Triage table: multi-step procedure → skill; single fact → memory note; one-off → skip | 🟢 | `SKILL.md` "Skill, memory, or skip?" | — | Skip (redundant: skillify's "Escolha da forma do artefato" table + anti-pattern "3 linhas de lessons.md" already cover it) |
| Act-on-cue-immediately harvesting (no confirmation before writing the skill) | 🟢 | `SKILL.md` "Recognize the moment" | — | Skip (contradicts skillify's inviolable rule 1 — explicit confirmation before saving — which fits DevBureau's business-minded user profile better) |
| Never write secret values into a harvested artifact; record only WHERE the secret lives | 🟢 | `SKILL.md` "Gotchas" | — | Skip (already covered by Higiene de Dados Sensíveis + skillify anti-patterns; one reinforcing line added with the promotion-rule graft) |
| Subagent delegation with a boxed-in brief (write only under skills dir, never resume original task) | 🟡 | `SKILL.md` "Delegate the write" | — | Skip (DevBureau's skill-scaffolder + writing-skills pipeline already constrains authoring) |

**Adopt (merged same session, v3.36.0):** Promotion rule + "O que não funcionou" capture grafted into `skillify/SKILL.md` as a gate above the existing inviolable rules — skillify previously required verified success (rule 2) but not a named failure pattern nor a ruled-out dead-end, so a confident-but-shallow flow could still be enshrined.
**Skip rationale:** rows above. The repo's core loop (recognize → harvest → reuse) is what `skillify` + Regra dos Três already implement; the promotion rule was the one genuinely missing piece.
