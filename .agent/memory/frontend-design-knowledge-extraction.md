# Frontend/Design Knowledge Extraction — open-design (nexu-io)

> **Status:** Fase 1 executada em 2026-06-30 (ver `frontend-craft-knowledge-port.md` na raiz do projeto para o plano tarefa-a-tarefa e verificação). Fase 2 continua opcional, não priorizada.
> **Origem:** análise do repositório https://github.com/nexu-io/open-design (clone raso, 2026-06-30)
> **Escopo confirmado com o usuário:** somente princípios/diretrizes de qualidade (craft/), NÃO a arquitetura de skills/design-systems/plugins do open-design.
> **Prioridade confirmada:** qualidade visual e consistência (accessibility, typography, color, anti-ai-slop) primeiro.

---

## Por que vale a pena

O open-design mantém uma pasta `craft/` com 12 arquivos "brand-agnostic": regras universais de UI craft, cada uma ancorada em fontes primárias datadas (WCAG 2.2 Understanding pages, WHATWG HTML Living Standard, Baymard Institute 2023/2024, WebAIM Million 2026, ADA Title II 2024/2026 IFR, EN 301 549). O nível de rigor e especificidade (valores hex exatos, thresholds numéricos, tabelas por jurisdição legal, versões de browser) está acima do que `frontend-design` e `accessibility-standards` têm hoje no kit DevBureau.

Licenciamento: conteúdo `craft/` do open-design é Apache-2.0, adaptado por eles de `refero_skill` (MIT). Reaproveitar o **conteúdo das regras** (reescrito com vocabulário do DevBureau) é permitido; não copiar código-fonte do produto (`lint-artifact.ts`, daemon, etc.) nem a arquitetura de skills/design-systems/plugins.

## Gaps identificados (grep feito em 2026-06-30 contra `.agent/agents/` e `.agent/skills/`)

| # | Gap | Situação atual no kit | Fonte no open-design |
|---|---|---|---|
| 1 | **State coverage** (loading/empty/error/edge/form-states como conjunto unificado) | Menções espalhadas em `frontend-specialist.md`, `mobile-design/*`, mas nenhum arquivo canônico com os 5 estados obrigatórios, thresholds de loading (300ms/2s/10s/30s), tiers de severidade de erro, ou disciplina de retry (backoff 2s/4s/8s) | `craft/state-coverage.md` (134 linhas) |
| 2 | **Accessibility baseline com piso legal versionado** | `accessibility-specialist.md` (81 linhas) e `accessibility-standards/SKILL.md` já citam WCAG, mas sem mapeamento por jurisdição (EAA→WCAG 2.1 AA até 2026/2027, ADA Title II→WCAG 2.1 AA com prazos 2027/2028, Section 508→WCAG 2.0 AA), sem nota APCA, sem correção do erro comum "44×44 = AA" (correto é 24×24 AA / 44×44 AAA) | `craft/accessibility-baseline.md` (201 linhas) |
| 3 | **Form validation lifecycle** | Nenhum arquivo canônico. Falta a state machine (`pristine → dirty → touched → invalid-after-touched → recovering → submitting → server-error`), regras de timing (validar no blur, não no keystroke), Constraint Validation API, e o padrão Standard Schema (`~standard`) | `craft/form-validation.md` (221 linhas) |
| 4 | **Anti-ai-slop, lista P0 exata** | `frontend-specialist.md` já tem Purple Ban e Cliché Bans (bento, mesh gradient, glassmorphism) — sobreposição real aqui — mas falta a lista fechada de "7 cardinal sins" com valores hex exatos (`#6366f1`, `#4f46e5` etc.), ban de emoji-como-ícone, ban de métricas inventadas ("10× faster") e filler copy | `craft/anti-ai-slop.md` (84 linhas) |
| 5 | **Typography hierarchy / editorial** | `typography-system.md` cobre pairing e escalas; não cobre hierarquia autoral para superfícies de leitura sustentada (blog, docs, e-guide) | `craft/typography-hierarchy.md`, `craft/typography-hierarchy-editorial.md` |

**Já coberto — não portar para evitar duplicação:** Purple Ban, bento-grid ban, glassmorphism warning, leis de UX (Hick's, Fitts, Miller, Von Restorff) já existem em `frontend-specialist.md` / `ux-psychology.md`. `craft/laws-of-ux.md` e `craft/color.md` do open-design devem ser comparados campo-a-campo antes de qualquer port, não assumidos como gap.

## Plano de execução (quando priorizado)

### Fase 1 — Qualidade visual e consistência (prioridade confirmada)
1. Enriquecer a seção "Anti-Patterns" de `.agent/skills/frontend-design/SKILL.md` com a lista fechada dos 7 cardinal sins (hex exatos, emoji-icon ban, invented-metrics ban, filler-copy ban), adaptada de `craft/anti-ai-slop.md`.
2. Criar `.agent/skills/frontend-design/state-coverage.md` (5 estados obrigatórios, estados extras de formulário, thresholds de loading, composição de empty/error, ARIA de mudança de estado), adaptado de `craft/state-coverage.md`.
3. Atualizar `.agent/agents/accessibility-specialist.md` + `.agent/skills/accessibility-standards/SKILL.md` com: piso legal por jurisdição, correção do threshold de touch target (AA 24×24 vs AAA 44×44), correção de "large text" (18pt, não 18px), tabela de paridade mobile nativa (iOS/Android/Flutter/RN), nota APCA como design-review only (não substitui WCAG).
4. Criar `.agent/skills/frontend-design/form-validation.md` (state machine de input, Constraint Validation API, timing de validação, padrão Standard Schema), adaptado de `craft/form-validation.md`.

### Fase 2 (opcional, só se Fase 1 comprovar valor)
- Comparar `craft/laws-of-ux.md` e `craft/color.md` contra `ux-psychology.md` e `color-system.md` campo-a-campo — portar só o que for gap real, não redundância.
- Avaliar `craft/rtl-and-bidi.md` (gap provável — kit não tem nada sobre RTL/bidi hoje) e `craft/typography-hierarchy(-editorial).md`.

## Regras ao executar
- Atribuição obrigatória: nota de rodapé "Adaptado de open-design (nexu-io/open-design), craft/, e refero_skill (MIT), via análise em 2026-06-30" nos arquivos atualizados.
- Não copiar código-fonte, scripts, nem estrutura de skills/design-systems/plugins do open-design — só o conteúdo textual das regras.
- Checar duplicação com grep antes de escrever (ver tabela "já coberto" acima).
- Ao iniciar a execução: criar o plano formal `{task-slug}.md` na raiz do projeto conforme convenção do skill `plan-writing` (este arquivo em `.agent/memory/` é registro de intenção entre sessões, não substitui o plano de tarefas).
- Rodar `python .agent/scripts/checklist.py <arquivos alterados>` (validação seletiva) ao final.

## Quando retomar
Na próxima vez que o usuário pedir trabalho de frontend, design ou acessibilidade neste workspace — ou explicitamente pedir para executar este plano.

## Referências
- Repo analisado: https://github.com/nexu-io/open-design (clone raso, 2026-06-30)
- Arquivos-fonte: `craft/README.md`, `craft/anti-ai-slop.md`, `craft/state-coverage.md`, `craft/accessibility-baseline.md`, `craft/form-validation.md`, `craft/typography-hierarchy.md`, `craft/typography-hierarchy-editorial.md`, `craft/rtl-and-bidi.md`, `craft/laws-of-ux.md`, `craft/color.md`
- Upstream attribution: conteúdo `craft/` do open-design é "adaptado de refero_skill (MIT), tightened to match Open Design's lint surface" — ao portar para o DevBureau, citar ambas as origens.
