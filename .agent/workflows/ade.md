---
description: ADE Pipeline Autônomo — transforma uma descrição em código funcional via pipeline multi-agente supervisionado (Req → Spec → Critique → Execution → QA → Memory)
---

# /ade - Autonomous Development Engine Pipeline

$ARGUMENTS

---

## 🔴 REGRAS CRÍTICAS

1. **SOCRATIC GATE REDUZIDO** — diferente do /plan padrão, o /ade faz apenas 1-2 perguntas essenciais
2. **PIPELINE SEQUENCIAL** — cada fase deve completar antes da próxima iniciar
3. **HUMAN-IN-THE-LOOP na fase 3** — o usuário aprova a spec antes da execução
4. **MEMORY OBRIGATÓRIA** — toda execução deve registrar aprendizados em `.agent/memory/`

---

## Pipeline: 6 Fases

```
$ARGUMENTS
    │
    ▼
[F1] DISCOVERY (@project-planner)
    │  → Entende o contexto, escopo, dependências
    │  → 1 pergunta máxima ao usuário
    ▼
[F2] SPEC (@backend-specialist | @frontend-specialist)
    │  → Cria spec técnica detalhada
    │  → Define: arquivos a criar, modificar, dependências
    ▼
[F3] CRITIQUE (@qa-automation-engineer)
    │  → Revisa a spec → aponta lacunas, riscos, edge cases
    │  → ⚠️ PAUSA: mostra spec revisada ao usuário para aprovação
    ▼
[F4] EXECUTION (@orchestrator → multi-agent)
    │  → Divide em subtasks paralelas/sequenciais
    │  → Implementa com zero-break garantido
    ▼
[F5] QA REVIEW (@test-engineer)
    │  → Valida output: testes passam, sem regressão
    │  → Roda `python .agent/scripts/checklist.py .`
    ▼
[F6] MEMORY (@project-planner)
       → Registra padrões em `.agent/memory/lessons.md`
       → Registra pitfalls em `.agent/memory/gotchas.md`
```

---

## Fase 1: Discovery

**Agent:** `@project-planner`
**Skill:** `brainstorming` + `plan-writing`

```
Ação: Analisar o pedido em $ARGUMENTS e identificar:
0. Se existir `STATE.md` na raiz do projeto (produto de um /build-saas anterior), lê-lo
   primeiro — diz em qual batch/milestone este pedido provavelmente se encaixa.
1. Domínio principal (web, backend, mobile, kit, infra)
2. Arquivos impactados (existentes ou novos)
3. Dependências do kit (.agent/ refs, imports)
4. Escopo (pequeno <30min | médio <2h | grande >2h)

Se escopo for "grande" → dividir em sub-ADEs e perguntar ao usuário.
Fazer no máximo 1 pergunta de clarificação se necessário.
```

**Output:** `[ADE] Discovery completo. Scope: {small|medium|large}. Iniciando spec...`

---

## Fase 2: Spec Técnica

**Agent:** `@backend-specialist` (backend/infra) ou `@frontend-specialist` (UI/UX)
**Skill:** `clean-code` + skill específica do domínio

A spec deve conter:

```markdown
## ADE Spec: {nome da feature}

### Aprovado no commit
- `git rev-parse --short HEAD` no momento em que o usuário aprovar na Fase 3 — usado no drift check da Fase 4.

### Arquivos a criar
- `caminho/arquivo.ext` — propósito

### Arquivos a modificar
- `caminho/arquivo.ext` — linha X: o que muda e por quê

### Dependências
- imports necessários, versões de libs

### Critério de sucesso
- [ ] Teste A passa
- [ ] Comportamento B funciona
- [ ] Nenhum arquivo existente quebrado

### Condições de PARE
Parar a execução e reportar ao usuário em vez de improvisar, se:
- [ ] um arquivo listado em "a modificar" não existir mais, ou seu conteúdo não corresponder ao que a spec assumiu
- [ ] uma dependência listada não estiver disponível/instalada
- [ ] um teste de verificação falhar duas vezes após uma tentativa razoável de correção
```

---

## Fase 3: Critique + Aprovação do Usuário

**Agent:** `@qa-automation-engineer`
**Skill:** `testing-patterns` + `systematic-debugging`

```
Ação: Revisar a spec da Fase 2 e identificar:
- Edge cases não cobertos
- Arquivos impactados que foram esquecidos
- Riscos de rollback
- Testes ausentes
```

**⚠️ PAUSA OBRIGATÓRIA:** Apresentar spec revisada ao usuário com:

```
[ADE] Spec pronta para execução:
{spec revisada}

Riscos identificados:
- {risco 1}
- {risco 2}

▶ Confirme para iniciar execução, ou peça ajustes.
```

> 🔴 NÃO prosseguir para Fase 4 sem confirmação explícita.

**Opcional:** se o usuário quiser isolar essa execução do branch atual, invocar a skill `using-git-worktrees` aqui, antes da Fase 4 — não é obrigatório por padrão.

---

## Fase 4: Execution

**Agent:** `@orchestrator`
**Delegação:** skills específicas por subtask

**Seleção de modelo por subtask** (sem depender de nenhuma capacidade especial do host, apenas o parâmetro `model` do Agent tool quando disponível):

| Tipo de subtask | Modelo | Exemplo |
|---|---|---|
| Mecânica, 1-2 arquivos, spec já completa (sem julgamento a fazer) | barato (haiku) | aplicar um rename, gerar um arquivo de teste a partir de um padrão já definido |
| Integração ou exige julgamento (decidir como dois módulos se conectam) | padrão (sonnet) | a maioria dos passos da Fase 4 |
| Decisão de arquitetura ou revisão final antes de reportar ao usuário | mais capaz (opus) | escolher a abordagem entre duas alternativas, revisar o resultado da Fase 4 antes da Fase 5 |

> 🔴 Sempre especificar o modelo explicitamente ao despachar a subtask. Se omitido, herda o modelo da sessão principal — geralmente o mais caro, mesmo para a subtask mais mecânica. Em hosts sem suporte a seleção de modelo por subagente, esta tabela não tem efeito (degrada graciosamente — nada quebra).

**Se houver múltiplas subtasks independentes:** agrupar em ondas antes de despachar — ver a seção "Dependency Waves" da skill `parallel-agents`. Subtasks sem dependência entre si vão na mesma onda e disparam em paralelo; uma subtask que precisa do resultado de outra vai na onda seguinte.

**Ledger de progresso (reaproveita o `{task-slug}.md` já criado na Fase 2 — não cria um arquivo novo):** cada checkbox de "Critério de sucesso" é marcado como feito **no próprio arquivo**, ao vivo, conforme cada subtask conclui — não só escrito uma vez no início. Se a execução for retomada após uma interrupção (compactação de contexto, sessão encerrada no meio), o primeiro passo é reler `{task-slug}.md` e tratar os checkboxes já marcados como já feitos, não refazer. Se o próprio arquivo se perder, `git log`/`git diff` no SHA aprovado (campo "Aprovado no commit" da Fase 2) mostra o que já foi criado/modificado em disco como sinal de recuperação.

> Isso cobre retomada dentro do mesmo checkout/disco. Se a execução precisa coordenar múltiplas sessões/agentes que **não** compartilham disco (times, CI, sessões paralelas), ver `/epic-claim`/`/epic-sync` — coordenação via GitHub Issues, opcional, não substitui o ledger local.

```
Drift check (rodar ANTES do primeiro passo, sempre):
  git diff --stat <SHA aprovado na Fase 3>..HEAD -- <arquivos a modificar listados na spec>
  Se algum arquivo em escopo mudou desde a aprovação → NÃO prosseguir direto.
  Comparar o estado atual contra o que a spec descreve; se divergir, é uma
  Condição de PARE — reportar ao usuário e pedir reconfirmação da spec antes
  de continuar. Isso só importa quando a execução é retomada depois de um
  intervalo (aprovação numa sessão, execução em outra); no fluxo comum
  (aprovar e executar na mesma sessão) o diff vem vazio e a checagem é instantânea.

Protocolo de execução:
1. Criar arquivos novos primeiro (nunca modificar existentes antes)
2. Modificar arquivos existentes com edições cirúrgicas (multi_replace)
3. Verificar zero-break após cada arquivo modificado
4. Se qualquer arquivo quebrar → ROLLBACK imediato dessa subtask
5. Se uma Condição de PARE da spec ocorrer → parar e reportar, não improvisar
6. Marcar o checkbox correspondente em `{task-slug}.md` como feito imediatamente após cada subtask concluir
```

**Durante execução, reportar progresso:**
```
[ADE] ✅ {arquivo} criado/modificado
[ADE] ⚡ Executando: {próximo passo}
```

---

## Fase 5: QA Review

**Agent:** `@test-engineer`
**Skill:** `testing-patterns` + `webapp-testing`

```bash
# Passo 1: Verificar kit integridade (se .agent/ foi modificado)
python -m pytest .agent/tests/test_kit_integrity.py -v

# Passo 2: Checklist geral
python .agent/scripts/checklist.py .

# Passo 3: Testes do projeto (se existirem)
npm test 2>/dev/null || python -m pytest . 2>/dev/null || echo "No tests configured"
```

**Passo 4 — Cobertura de decisão:** "testes passam" não é o mesmo que "o que foi decidido na Fase 2 foi de fato implementado." Reler a spec da Fase 2 e confirmar, item por item:
- Cada item de "Critério de sucesso" tem o checkbox marcado E corresponde a um comportamento real verificável (não só "parece que está lá").
- Nenhuma decisão registrada na spec foi silenciosamente trocada por outra durante a Fase 4 (ex.: a spec dizia "validação no backend", o código só validou no frontend).
- Nenhum item de "Arquivos a criar/modificar" ficou de fora sem uma Condição de PARE registrada explicando por quê.

Se algo não corresponder, isso é um achado de QA como qualquer outro — registrar e corrigir antes de declarar a Fase 5 concluída, não só quando os testes automatizados falham.

**Se falhar:** `@debugger` é invocado automaticamente para investigar e corrigir.

---

## Fase 6: Memory

**Agent:** `@project-planner`

Se `STATE.md` existir na raiz (ver Fase 1, passo 0), atualizar a linha do batch correspondente para `done` (ou `in-progress` se a feature só cobriu parte do batch), e o campo "Last updated". Se não existir, pular este passo — é infraestrutura opcional, só relevante para projetos multi-batch nascidos de um `/build-saas`.

Registrar em `.agent/memory/lessons.md`:

```markdown
## {DATA} — {Nome da Feature}
**Padrão identificado:** {O que funcionou bem}
**Pitfall evitado:** {O que não fazer}
**Contexto:** {Quando aplicar este padrão}
**Arquivos chave:** {lista}
```

Registrar em `.agent/memory/gotchas.md` se houver problemas encontrados:

```markdown
## {DATA} — {Nome do Problema}
**Sintoma:** {O que aconteceu}
**Causa raiz:** {Por que aconteceu}
**Solução:** {Como foi resolvido}
```

---

## Output Final

```
[ADE] ✅ Pipeline completo

Entregue:
- {lista de arquivos criados/modificados}

QA:
- Kit integrity: ✅
- Checklist: ✅

Memory: atualizada em .agent/memory/lessons.md

Se a execução foi isolada num worktree (ou se há um branch para decidir o destino), rode `/finish-branch` a seguir.

Próximos passos sugeridos:
- {sugestão 1}
```

---

## Exemplos de uso

```
/ade adicione uma nova skill chamada data-analysis ao kit
/ade crie o test_kit_integrity.py conforme o plano aios-integration.md
/ade implemente o doctor.py para diagnóstico do kit
/ade refatore o intelligent-routing para incluir roteamento para /ade e /doctor
```
