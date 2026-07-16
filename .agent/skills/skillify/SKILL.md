---
name: skillify
description: Use when a multi-step flow just SUCCEEDED in the current session and the user (or the agent, proactively) wants to save it as a reusable artifact — "salva esse fluxo", "vira um script/skill", "save this flow", "make this reusable", "do this the same way next time". NOT for speculative automation of flows that never ran.
---

# Skillify — Codificar um fluxo de sessão bem-sucedido em artefato reutilizável

> Complementa, não substitui, o Protocolo Script-First: a Regra dos Três cobre repetição ENTRE
> sessões; skillify cobre o momento "isso acabou de funcionar NESTA sessão e vale guardar".

## Quando disparar

1. **Reativo**: o usuário pede explicitamente para salvar/reutilizar o fluxo que acabou de dar certo.
2. **Proativo**: um fluxo ad-hoc de 3+ passos acabou de ser concluído com sucesso verificado
   (não "deve ter funcionado" — evidência fresca, per Zero-Break) E há sinal de recorrência
   (o usuário já fez algo parecido antes, ou disse que fará de novo). Nesse caso, OFEREÇA em
   uma frase; nunca crie sem resposta.

## Regra de Promoção — não consagre palpites

> Um artefato salvo é **autoritativo**: a próxima sessão confia nele sem re-derivar. Por isso a barra é alta.

Só promova um fluxo a artefato quando as **três** condições valem:

1. **Verificação que passou.** O fluxo foi verificado de verdade (teste verde, comando com exit 0, repro reproduzido) — e o artefato registra QUAL foi essa verificação. "Pareceu funcionar" não conta.
2. **Padrão de falha nomeado.** Você consegue nomear a falha que esse fluxo evita ou diagnostica (ex: "cache de build velho → erros de tipo fantasma"), não um vago "às vezes quebra".
3. **Pelo menos um beco-sem-saída descartado.** Uma abordagem concreta tentada e eliminada, com o motivo — registrada no artefato numa seção "O que não funcionou" (pular um beco conhecido na próxima sessão vale tanto quanto o caminho de ouro).

Faltando qualquer uma: vira nota tentativa em `lessons.md`/`gotchas.md` (marcada como não-verificada) ou é descartado. Nunca escreva valores de segredos no artefato — só ONDE encontrá-los (nome da env var, secret manager).

## Regras invioláveis

1. **Confirmação explícita antes de salvar qualquer artefato.** A oferta descreve em 1-2 frases
   de negócio o que será salvo, onde, e quando será reutilizado. Sem "sim" do usuário, nada é escrito.
2. **Só fluxos que funcionaram de verdade.** O gatilho é sucesso verificado nesta sessão, com a
   evidência citada na oferta (ex: "os 3 comandos que acabaram de passar"). Nunca codifique um
   fluxo hipotético ou um que falhou e "quase deu".
3. **Respeite a Regra dos Três para scripts.** Se o artefato proposto é um script determinístico
   e esta é a 1ª ocorrência do fluxo, o padrão é registrar como CANDIDATO (nota em
   `SCRIPTS_REGISTRY.md` ou `lessons.md`), não criar o script — salvo pedido explícito do usuário,
   que sempre vence.
4. **Auditoria de destino.** Registre o artefato no índice correto: script → `SCRIPTS_REGISTRY.md`
   (com gatilhos EN + PT-BR); skill → validada via `writing-skills` (RED→GREEN→REFACTOR) e
   scaffolded via `skill-scaffolder`; checklist/template → `.agent/memory/lessons.md` com ponteiro.

## Escolha da forma do artefato

| O fluxo era... | Artefato | Ferramenta |
|---|---|---|
| Determinístico (mesma entrada → mesma saída, sem julgamento) | Script Python + entrada no `SCRIPTS_REGISTRY.md` | `skill-scaffolder/scripts/scaffold_new_skill.py` ou script avulso |
| Julgamento repetível com método estável (ex: um tipo de auditoria) | Skill (`SKILL.md`) | `writing-skills` + `skill-scaffolder` |
| Sequência de comandos/passos que o usuário repete manualmente | Checklist/template em memória | `lessons.md` |
| Fluxo multi-agente com fases | Workflow (`.agent/workflows/`) | manual, seguindo `plan-writing` |

## Anti-padrões

- Criar artefato "para o futuro" sem demanda comprovada (manutenção morta, mesmo erro que o
  Script-First proíbe).
- Codificar o fluxo com dados reais da sessão embutidos (PII, paths de cliente) — parametrize
  e aplique Higiene de Dados Sensíveis.
- Transformar em skill algo que cabe em 3 linhas de `lessons.md`.
