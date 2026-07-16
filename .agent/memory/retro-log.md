# Retro Log — DevBureau

> Dated, trend-tracked synthesis of what shipped and what was learned, mined automatically by
> `finishing-a-branch`'s Step 6 whenever `/finish-branch` runs on DevBureau's own kit repo (never
> on a target project). Ties to an existing event instead of inventing a scheduler the kit
> doesn't have. Origin: benchmark run #8 Consider item #5 (`retro`-equivalent), decided
> 2026-07-03 — "amarrar ao /finish-branch" over a manual command or no action at all.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — Retro
**Since:** <sha anterior ou "início">
**Commits:**
- <sha curto> <mensagem>
**Lessons/gotchas novos:** o que foi aprendido desde a última entrada, se houver
**HEAD at this entry:** <sha completo ou curto>
```

---

## 2026-07-03 — Retro (seed entry — no prior entry to diff against)

**Since:** início do log (primeira entrada; próximas rodadas usam o SHA abaixo como referência)

**Commits:**
- `d7a3cd2` feat: wrapper diet + description-only pass at scale, 68 skills (v3.27.0)
- `4d4d689` chore: remove Serena MCP data from project tracking
- `64e0b1a` feat: context diet + skillify skill + Skill Re-Audit #1 (v3.26.0)

**Lessons/gotchas novos:**
- O próprio `test_kit_integrity.py` só faz parsing manual linha-a-linha do frontmatter, não YAML real — 4 skills tinham `:` não citado quebrando parse YAML estrito sem que o kit soubesse (1 era regressão introduzida na mesma sessão). Rodar `yaml.safe_load` real é uma checagem que vale considerar incorporar ao `test_kit_integrity.py` no futuro, não só como verificação manual pontual.
- "Footprint da fonte" e "footprint do que o agente realmente lê" são números diferentes — `DEVBUREAU.md` pode estar dentro do orçamento enquanto `CLAUDE.md`/`GEMINI.md`/`AGENTS.md` (fonte + wrapper do `sync_ide.py`) passam do teto. Medir sempre os 3 targets injetados, não só a fonte.

**HEAD at this entry:** `d7a3cd2`
