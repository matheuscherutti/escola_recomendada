# Gotchas & Armadilhas — DevBureau

> Erros comuns e como evitá-los. Consulte antes de iniciar desenvolvimento.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — [Nome do Problema]
**Gatilho:** Sintoma ou contexto que deveria fazer o agente lembrar deste gotcha
**Confiança:** 🟢 Confirmado / 🟡 Inferido / 🔴 Hipótese (escala de `confidence-scale`)
**Sintoma:** O que aconteceu / como se manifesta
**Causa raiz:** Por que aconteceu
**Solução:** Como foi resolvido
**Evidência:** Onde isso foi corrigido/comprovado (commit, arquivo, teste)
**Prevenção:** Como evitar que aconteça de novo
```

Confiança usa a mesma escala de `.agent/skills/confidence-scale/SKILL.md`: 🟢 Confirmado (causa raiz reproduzida e corrigida), 🟡 Inferido (causa mais provável, não 100% reproduzida), 🔴 Hipótese (ainda não comprovado, registrado para vigiar).

> Registre também os becos-sem-saída: uma abordagem tentada e descartada (com o motivo) é tão valiosa quanto a causa raiz de um bug — evita que uma sessão futura perca tempo tentando de novo o mesmo caminho já provado errado.

---

## 2026-03-03 — GEMINI.md não refletia novos scripts

**Gatilho:** Agente criou um script/workflow novo mas parece "não saber" que ele existe nas sessões seguintes.
**Confiança:** 🟢 Confirmado (causa raiz reproduzida e corrigida)
**Sintoma:** Agente não invocava `doctor.py` ou `/ade` automaticamente mesmo após implementação.
**Causa raiz:** Arquivos foram criados no filesystem mas não registrados no `GEMINI.md` (Request Classifier + Scripts table + Quick Reference).
**Solução:** Atualizar as 4 seções de GEMINI.md + ARCHITECTURE.md + intelligent-routing.
**Evidência:** Reaplicado como checklist mandatório em `/ade`'s fase de Memory Registration.
**Prevenção:** Usar o `/ade` workflow para qualquer nova adição ao kit — ele inclui fase de Memory Registration.

---

## Regra Geral: ZeroDivisionError em checklist.py

**Gatilho:** `checklist.py` lançando exceção em vez de relatório, especialmente em projeto recém-iniciado.
**Confiança:** 🟢 Confirmado (causa raiz reproduzida e corrigida)
**Sintoma:** `checklist.py` falha na linha ~232 com `ZeroDivisionError`.
**Causa raiz:** Dicionário `scores` está vazio quando nenhum check retorna resultado.
**Solução:** Adicionar guard `if max_val > 0` antes de calcular percentual.
**Evidência:** Correção aplicada diretamente em `.agent/scripts/checklist.py`.
**Prevenção:** Sempre rodar `doctor.py` antes de `checklist.py` para validar que o ambiente está correto.

---

## 2026-06-28 — LLM output tratado como verdade sem checagem

**Gatilho:** Um agente reporta um "finding" (segurança, fact-check, classificação) baseado puramente na saída de um LLM, sem cruzar com dados verificáveis.
**Confiança:** 🟡 Inferido (minerado de repositório externo, ainda não validado em uso próprio do DevBureau)
**Sintoma:** Achado soa plausível e específico, mas não corresponde a nenhum dado real do projeto/contexto — é uma alucinação bem-formatada.
**Causa raiz:** Saída de LLM foi tratada como fato em vez de hipótese a ser verificada contra a fonte (código, dados determinísticos, evidência).
**Solução:** Antes de reportar qualquer achado vindo de um LLM, cruzar com a camada determinística disponível; descartar (e logar) alegações sem suporte; marcar "[não verificado]" quando o pré-requisito de verificação não existir.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** Aplicar a mesma régua do protocolo Anti-Hallucination do `DEVBUREAU.md` à saída de qualquer LLM consumida por um agente, não só à saída do próprio Claude. Detalhado em `.agent/skills/ai-engineer/SKILL.md`.

## 2026-06-28 — Teste verde que certifica código quebrado (mock de API alucinada)

**Gatilho:** Um agente gera teste E implementação juntos para uma integração externa nova.
**Confiança:** 🟡 Inferido
**Sintoma:** Suíte de testes passa 100%, mas a integração falha em produção contra a API real.
**Causa raiz:** O teste mockou uma API que o próprio LLM inventou (assinatura, campo ou endpoint que não existe), então o mock "confirma" uma alucinação em vez de validar contra o contrato real.
**Solução:** Para qualquer integração nova, ler a documentação real (ou fazer uma chamada real uma vez) antes de escrever o mock; contagem de testes/arquivos passando NUNCA substitui leitura humana do código de integração.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** No checklist final (`checklist.py`/`verify_all.py`), tratar "testes passando" como sinal necessário, não suficiente — reforça a regra "No completion claim without fresh evidence" já existente no `CLAUDE.md` do projeto. Detalhado em `.agent/skills/agent-evaluation/SKILL.md` e `.agent/skills/testing-patterns/SKILL.md`.

## 2026-06-28 — Segredo vazado por leitura solta de credenciais

**Gatilho:** Comando tipo `cat .env`, `env | grep`, ou debug de config que imprime tudo.
**Confiança:** 🟢 Confirmado (4 sinais independentes no mining)
**Sintoma:** Uma chave de API real aparece em texto puro na transcrição de uma sessão de agente.
**Causa raiz:** Comando de leitura ampla (`cat`, `env | grep` sem filtro) despeja todo o conteúdo do arquivo de credenciais na saída, que o agente então vê e pode citar de volta.
**Solução:** Nunca `cat`/`env | grep` solto em arquivo de credenciais; usar `jq 'keys'` (só nomes de chave) ou `printenv VAR | sed 's/./*/g'` para confirmar existência sem expor o valor.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** Tratar qualquer arquivo `.env`/credentials como write-only para o agente (existência confirmável, conteúdo não). Reforçado em `.agent/agents/security-auditor.md`.

## 2026-06-28 — Upload aceito por confiar no MIME/nome enviado pelo cliente

**Gatilho:** Endpoint de upload de arquivo que decide tipo/destino com base no `Content-Type` ou extensão enviados pelo cliente.
**Confiança:** 🟡 Inferido
**Sintoma:** Arquivo malicioso passa validação porque o cliente "disse" que era uma imagem.
**Causa raiz:** MIME type e nome de arquivo são inputs controlados pelo atacante, não fatos — confiar neles pula a validação real.
**Solução:** Re-derivar o tipo real a partir dos bytes (magic number), nunca do header declarado; sanitizar o nome do arquivo em profundidade (basename-only, strip de caracteres de controle/traversal, nomes reservados do Windows, truncamento byte-aware).
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** Checklist de upload no `security-auditor`: nunca decidir nada com base em dado declarado pelo cliente sem re-derivar do conteúdo real.

## 2026-06-28 — Migração de schema editada/reordenada depois de já aplicada

**Gatilho:** Alterar um arquivo de migração já mergeado/deployado, ou inserir uma nova migração no meio da sequência existente.
**Confiança:** 🟡 Inferido
**Sintoma:** Banco de um ambiente diverge de outro mesmo rodando "as mesmas migrações" — ou a migração falha em bancos que já passaram por uma versão antiga dela.
**Causa raiz:** Migrações não são append-only; editar uma já aplicada deixa bancos antigos e novos em estados diferentes, porque o histórico real não corresponde mais ao arquivo.
**Solução:** Migração é sempre `ADD COLUMN ... DEFAULT` (nunca editar/reordenar uma já existente); testar contra um banco fresco E um banco com o histórico antigo antes de mergear.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** Tratar todo arquivo de migração já mergeado como imutável; qualquer correção é uma migração NOVA. Detalhado em `.agent/skills/database-design/migrations.md`.

## 2026-06-28 — Atualização do kit quebra config gerada pelo usuário em sessão anterior

**Gatilho:** Mudar o formato/nome de um campo de config que o próprio kit gera ou edita (ex.: arquivos de config de skill, settings.json).
**Confiança:** 🟡 Inferido
**Sintoma:** Depois de atualizar o DevBureau, configs de projetos antigos param de funcionar ou são lidas com valores errados.
**Causa raiz:** Campo foi removido/renomeado/teve o tipo trocado sem caminho de compatibilidade para o formato antigo.
**Solução:** Nunca remover/renomear/mudar tipo de um campo gerado para o usuário; usar default/alias para o campo antigo; escrever um teste de regressão que faz parse do formato ANTIGO antes de mudar o parser.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** Tratar qualquer config gerada por uma versão anterior do kit como um contrato público, não um detalhe interno. Detalhado em `.agent/skills/migration-strategy/SKILL.md`.

## 2026-06-28 — Path pessoal absoluto vazado em config commitada

**Gatilho:** Commitar um arquivo de config de sandbox/tooling pessoal (ex.: config gerado por uma ferramenta de IA local) sem revisar o conteúdo.
**Confiança:** 🟡 Inferido (minerado de repositório externo, ainda não validado em uso próprio do DevBureau)
**Sintoma:** Um arquivo versionado expõe o home directory, nome de máquina ou nome de projeto/mount pessoal do autor.
**Causa raiz:** Ferramentas que geram config local (sandboxes, jails, configs de IDE) costumam gravar paths absolutos reais da máquina onde rodaram; commitar esse arquivo sem revisar publica esses paths.
**Solução:** Revisar todo arquivo de config gerado automaticamente antes do primeiro commit; preferir paths relativos ou placeholders quando o formato permitir.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Prevenção:** Adicionar configs de sandbox/tooling pessoal ao `.gitignore` por padrão, só commitando uma versão `.example` sem dados pessoais.

## 2026-07-11 — Pseudo-CSS de posts de rede social tratado como código real (cenário RED da skill hover-effects)

**Gatilho:** Usuário compartilha imagem/vídeo de efeito de UI de rede social ("Hover Button Effects Pt.X") pedindo para reproduzir, muitas vezes atribuindo a um repositório GitHub.
**Confiança:** 🟢 Observado
**Sintoma:** (a) O código exibido na imagem (`surface: wave(x, y)`, `blades: part(x)`, `filter: thermal()`) não é CSS real — é shorthand ilustrativo do post; um agente sob pressão tenta usá-lo ou inventa propriedades equivalentes. (b) A atribuição de origem pode estar errada: `suraniharsh/CodeCandy` foi apontado como fonte dos efeitos, mas clone + grep provou que é um app gerenciador de snippets sem nenhum dos efeitos. (c) As paletas dessas imagens são quase sempre roxas (violação do Purple Ban se copiadas).
**Causa raiz:** Imagens de showcase priorizam estética do post, não fidelidade técnica; nomes de contas de rede social colidem com nomes de repositórios não relacionados.
**Solução:** Tratar a imagem como briefing visual, nunca como código; verificar a fonte real (clonar/grepar) antes de afirmar que um repo contém algo; mapear o efeito mostrado para a técnica real (canvas, SVG filter, mask, custom props).
**Evidência:** Sessão 2026-07-11 — criação da skill `hover-effects` (v3.35.0); CodeCandy clonado e verificado sem os efeitos.
**Prevenção:** Skill `.agent/skills/hover-effects/SKILL.md` abre com a seção "Social-Media Pseudo-CSS (READ FIRST)" endereçando exatamente essa racionalização.
