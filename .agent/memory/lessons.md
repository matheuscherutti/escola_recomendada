# Lessons Learned — Antigravity Kit

> Padrões identificados durante o desenvolvimento. Consulte antes de iniciar uma task complexa.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — [Feature/Task Name]
**Gatilho:** Situação/palavra-chave que deveria fazer o agente lembrar deste padrão
**Confiança:** 🟢 Confirmado / 🟡 Inferido / 🔴 Hipótese (escala de `confidence-scale`)
**Padrão identificado:** O que funcionou bem (reutilizável)
**Pitfall evitado:** O que não fazer / armadilha identificada
**Evidência:** Onde isso foi comprovado (commit, sessão, teste) — o que sustenta o nível de Confiança
**Arquivos chave:** lista de arquivos relevantes
```

Confiança usa a mesma escala de `.agent/skills/confidence-scale/SKILL.md`: 🟢 Confirmado (validado em produção ou em múltiplas sessões), 🟡 Inferido (observado uma vez, ainda não re-testado), 🔴 Hipótese (ainda não comprovado, registrado para vigiar).

---

## 2026-03-03 — AIOS Integration Planning

**Gatilho:** Adicionar um novo script master, workflow ou skill ao kit.
**Confiança:** 🟢 Confirmado (princípio reaplicado em toda sessão de benchmark desde então)
**Padrão identificado:** Ao integrar novos scripts/workflows ao kit, atualizar SEMPRE os 4 arquivos de configuração do agente em sequência: DEVBUREAU.md → ARCHITECTURE.md → intelligent-routing → workflow file.
**Pitfall evitado:** Criar novos scripts sem registrá-los no DEVBUREAU.md faz o agente não saber que existem.
**Evidência:** Repetido em todas as implementações de benchmark (Runs #1–#7, ver `.agent/memory/benchmark-log.md`).
**Arquivos chave:** `.agent/rules/DEVBUREAU.md`, `.agent/ARCHITECTURE.md`, `.agent/skills/intelligent-routing/SKILL.md`

## 2026-03-06 — Premium Design Agent (Skills Locais)

**Gatilho:** Criar uma skill reutilizável e compartilhável entre projetos/equipes.
**Confiança:** 🟢 Confirmado (modelo de pasta usado por toda skill complexa do kit desde então)
**Padrão identificado:** Skills complexas devem ser organizadas em múltiplos arquivos: SKILL.md (instruções) + reference files (dados). O SKILL.md contém a tabela de referências internas com prioridade (🔴 Obrigatório / 🟡 Sob demanda). Exemplo: premium-design-orchestrator tem SKILL.md + palette-library.md + design-references.md.
**Pitfall evitado:** Skills Globais (`~/.gemini/antigravity/skills/`) NÃO são versionadas no Git. Para projetos compartilháveis, usar Skills Locais (`.agent/skills/`). A portabilidade exige que tudo relevante esteja dentro do repositório.
**Evidência:** Estrutura replicada em `framework-benchmarking`, `mobile-design`, `saas-stack-rules` e outras skills multi-arquivo.
**Arquivos chave:** `.agent/skills/premium-design-orchestrator/`, `.agent/skills/brand-identity-extractor/`, `.agent/skills/premium-tech-stack/`

## 2026-07-01 — Pre-criar arquivo alvo antes de pedir conteúdo

**Gatilho:** Uma tarefa multi-arquivo pede a criação de um arquivo novo que ainda não existe no disco.
**Confiança:** 🟡 Inferido (padrão documentado por uma ferramenta de terceiros madura, ainda não re-testado dentro do DevBureau)
**Padrão identificado:** Um agente tende a, por padrão, anexar conteúdo a um arquivo já existente em vez de criar um novo, a menos que o arquivo alvo já exista no disco antes do pedido. Criar o arquivo vazio primeiro (Write com conteúdo mínimo) remove essa ambiguidade antes de pedir o conteúdo real.
**Pitfall evitado:** Conteúdo destinado a um arquivo novo terminar anexado, por engano, a um arquivo existente com nome parecido.
**Evidência:** Mineração de padrões, Wave 2 Source 2 (aider docs, `docs/usage/tips.html`) — ver `.agent/memory/pattern-mining-log.md` entrada 2026-07-01.
**Arquivos chave:** n/a (comportamento de agente, não arquivo específico do kit)

## 2026-06-28 — Invariantes citam o bug que previnem

**Gatilho:** Escrever uma nova regra cross-cutting em `lessons.md`, `gotchas.md` ou no frontmatter de um agente/skill.
**Confiança:** 🟡 Inferido (minerado de repositório externo, ainda não validado em uso próprio do DevBureau)
**Padrão identificado:** Toda regra invariante deve citar o bug/incidente concreto que ela previne (ex.: "single-writer SQLite — evita a race da issue X"), não apenas declarar a regra. Isso transforma "por que isso existe" em um contrato revisável e durável, em vez de uma opinião que se perde com o tempo. Formato completo em `.agent/skills/documentation-templates/SKILL.md` §8.
**Pitfall evitado:** Regras sem justificativa registrada são as primeiras a serem "simplificadas" ou removidas por um agente futuro que não entende por que existem.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/documentation-templates/SKILL.md`

## 2026-06-28 — Defense-in-depth como checklist documentado, não princípio vago

**Gatilho:** Revisão de segurança (`security-auditor`) em qualquer projeto que lide com dados externos, uploads, ou execução de comandos.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Traduzir "defesa em profundidade" em uma lista numerada e concreta de camadas independentes e individualmente desativáveis (ex.: validação de input, SSRF, sanitização de filename, prompt size cap) — cada uma testável isoladamente. Checklist completo agora em `security-auditor.md`.
**Pitfall evitado:** Princípios genéricos ("pense como atacante") não geram ação verificável; uma lista numerada sim.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/agents/security-auditor.md`

## 2026-06-28 — Loop de auto-melhoria precisa de trilha de auditoria + gate de avaliação

**Gatilho:** Qualquer mecanismo onde o próprio agente propõe mudanças ao kit (ex.: `/ade` autônomo, scripts de auto-fix).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Toda proposta de auto-melhoria deve: (1) logar em uma trilha de auditoria antes de aplicar, (2) passar por um gate de avaliação executável antes de ser promovida, (3) ter aprovação opt-in por padrão — nunca auto-aprovação silenciosa, (4) usar claim por sessão para que uma falha não fique re-tentando para sempre.
**Pitfall evitado:** Auto-melhoria sem gate é exatamente o cenário que o protocolo Anti-Hallucination do `DEVBUREAU.md` já tenta prevenir manualmente — esse padrão automatiza a mesma garantia.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/agent-evaluation/SKILL.md`

## 2026-06-28 — Markdown em disco como fonte de verdade, índice é sempre reconstruível

**Gatilho:** Decidir onde armazenar conhecimento/estado que precisa sobreviver entre sessões.
**Confiança:** 🟢 Confirmado (é o modelo que o próprio `.agent/memory/` já usa; agora com vocabulário formal)
**Padrão identificado:** Arquivo markdown versionado em git é a fonte de verdade; qualquer índice derivado (SQLite, cache, busca) deve ser reconstruível a partir dos arquivos a qualquer momento — nunca a única cópia do dado. "Compile, don't retrieve."
**Pitfall evitado:** Guardar conhecimento só em um índice binário/DB quebra grep, diff de git e portabilidade entre IDEs.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/architecture/SKILL.md`, `.agent/memory/`

## 2026-06-28 — Falhar para o lado cauteloso em degradação

**Gatilho:** Um serviço dependente (API externa, modelo de IA, chave ausente) cai ou degrada.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Modo degradado deve ficar MAIS conservador, nunca mais confiante — nunca "inventar" um veredito suportado por repetição. Para primitivas de segurança, a falha deve sempre cair para o lado mais restritivo (ex.: recusar iniciar sem auth, em vez de iniciar com auth fraca).
**Pitfall evitado:** Degradação que mantém ou aumenta confiança quando dados ficam incompletos é a forma mais comum de um sistema "mentir com convicção".
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/agents/security-auditor.md`

## 2026-06-28 — Configuração centralizada: um schema tipado, um resolvedor único

**Gatilho:** Qualquer projeto novo (via `saas-stack-rules`/`stack-sizing`) que precise ler variáveis de ambiente/config.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Toda config passa por UM resolvedor único com precedência clara (arquivo > ENV > default); proibido ler `process.env`/`os.environ` diretamente em qualquer outro lugar do código.
**Pitfall evitado:** Leitura dispersa de ENV é a causa raiz mais comum de "funciona local, quebra em prod" — cada ponto de leitura pode aplicar um default diferente.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/saas-stack-rules/SKILL.md`

## 2026-06-28 — UPDATE condicional atômico para eliminar race de contador/limite

**Gatilho:** Implementar qualquer "decrementar contador" / "reivindicar slot" / "aplicar limite" sob concorrência.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Um único `UPDATE ... WHERE count < max AND not_expired` (sucesso = "1 linha afetada") substitui o padrão check-then-act, eliminando o TOCTOU sem precisar de lock explícito.
**Pitfall evitado:** Ler o valor, decidir em código, depois escrever de volta é uma race condition clássica sob qualquer carga concorrente real.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/database-design/SKILL.md`

## 2026-06-28 — Testar na fronteira, nunca no SO real

**Gatilho:** Escrever testes que tocariam filesystem real, `$HOME`, variáveis de ambiente reais, ou permissões de SO.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Stubar a fronteira (ex.: `Errno::EACCES` via mock) em vez de fazer `chmod` real; injetar o path/dependência (`Cache.at(path)`) em vez de depender de `$HOME` global — necessário inclusive para builds que rodam testes na máquina do usuário (ex.: pacotes AUR).
**Pitfall evitado:** Testes que tocam o SO real são lentos, frágeis entre plataformas, e podem vazar segredos reais do ambiente de quem roda o teste.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/testing-patterns/SKILL.md`

## 2026-06-28 — Fan-out limitado + timeout em duas camadas para chamadas externas

**Gatilho:** Chamar múltiplos endpoints externos (ex.: scripts de auditoria do kit que consultam várias APIs).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Concorrência limitada por janela deslizante (cap fixo, reabastece ao completar) + timeout por tarefa DENTRO de um timeout global; falha parcial é um status tipado por item, não aborta o lote inteiro — só falha se TODAS as chamadas falharem.
**Pitfall evitado:** Disparar chamadas ilimitadas em paralelo estoura rate limit do provedor; um único endpoint lento sem timeout duplo trava o lote inteiro.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/api-patterns/rate-limiting.md`

## 2026-06-28 — Três níveis de risco de ferramenta (ReadOnly/Mutating/Destructive)

**Gatilho:** Um agente decide se executa uma ação direto ou se para e pergunta ao usuário primeiro.
**Confiança:** 🟡 Inferido (minerado de repositório externo, ainda não validado em uso próprio do DevBureau)
**Padrão identificado:** Classificar toda ação/ferramenta em um de três tiers — ReadOnly (nunca pede confirmação), Mutating (confirma por padrão, pode ter override explícito), Destructive (sempre confirma, sem override silencioso) — em vez de decidir caso a caso na hora. Isso é a mesma lógica da seção "Executing actions with care" do `CLAUDE.md`, só que como classificação explícita em vez de prosa.
**Pitfall evitado:** Decidir "isso é arriscado?" de forma ad-hoc a cada chamada produz inconsistência — a mesma ação pode ser tratada diferente em sessões diferentes.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/agents/security-auditor.md`

## 2026-06-28 — Gates operacionais para execuções longas sem supervisão

**Gatilho:** Qualquer pipeline automático de longa duração (`/ade`, benchmark, scraping) que roda sem um humano observando passo a passo.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Três guardas independentes: (1) matar a execução se a velocidade/throughput cair abaixo de um limiar, (2) timeout de "sem progresso" separado do timeout total, (3) limpar processo travado de uma tentativa anterior antes de iniciar um retry.
**Pitfall evitado:** Um pipeline autônomo sem esses gates pode ficar preso indefinidamente, consumindo recursos sem produzir sinal de que travou.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/agent-evaluation/SKILL.md`

## 2026-06-28 — Máquina de estados de job com auto-reparo

**Gatilho:** Qualquer fluxo assíncrono/job do kit que pode ficar em um estado intermediário se interrompido.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Ciclo de vida explícito (ex.: Pending→InProgress→Completed→Accepted) com detecção de "travado" (tempo no estado atual excede um limite) e recuperação automática — reagendar ou reverter, nunca deixar o item parado para sempre.
**Pitfall evitado:** Sem detecção de "travado", um job interrompido fica invisível até alguém notar manualmente que nada avançou.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/agent-evaluation/SKILL.md`

## 2026-06-28 — Pipeline em DAG com dependências explícitas por fase

**Gatilho:** Desenhar/evoluir um pipeline multi-fase (ex.: `/ade`: req→spec→impl→qa→memory).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Declarar a dependência de cada fase explicitamente (fase X só roda depois que fase Y terminou) em vez de depender de ordem implícita no código; fases independentes podem rodar em paralelo (fan-out).
**Pitfall evitado:** Ordem implícita quebra silenciosamente quando alguém reordena passos sem entender a dependência real entre eles.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/architecture/SKILL.md`

## 2026-06-28 — Nunca persistir automaticamente um override pontual

**Gatilho:** Uma flag de linha de comando ou config de sessão muda o comportamento de um script do kit (ex.: `sync_ide.py`, scaffolding).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Um override passado explicitamente em uma execução vale só para aquela execução; só é gravado como novo padrão default se o usuário pedir isso explicitamente (ex.: uma flag `--init`/`--save`). Separar "tentar agora" de "isso é o novo padrão salvo".
**Pitfall evitado:** Sem essa separação, um teste pontual ("deixa eu só tentar com X") silenciosamente se torna o comportamento permanente do projeto.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** N/A (princípio a aplicar em qualquer script novo do kit que escreva config)

## 2026-06-28 — Checklist de docs-sync amarrando feature a documentação

**Gatilho:** Qualquer mudança de feature/comportamento que deveria estar refletida em mais de um lugar (README, doc de usuário, schema de API, i18n).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Manter uma lista explícita de "o que precisa mudar junto" sempre que um certo tipo de mudança acontece (ex.: mudar uma regra de análise → atualizar README + página de metodologia + i18n en/pt-BR + método de API JSON), em vez de confiar na memória de quem está editando.
**Pitfall evitado:** Documentação que deveria acompanhar a feature fica defasada porque "atualizar os docs" nunca foi uma etapa explícita do checklist de PR.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/documentation-templates/SKILL.md`

## 2026-06-28 — Decisão pendente: AGENTS.md único vs. sync por IDE

**Gatilho:** Avaliar se o DevBureau deveria migrar de "um `.agent/` sincronizado para cada IDE via `sync_ide.py`" para "um único AGENTS.md como fonte, com CLAUDE.md/GEMINI.md como ponteiros finos".
**Confiança:** 🔴 Hipótese — decisão estratégica NÃO tomada, registrada apenas para discussão futura, não é uma migração recomendada.
**Padrão identificado:** O repositório de origem observado usa um único `AGENTS.md` tool-agnostic como fonte, com um `CLAUDE.md` fino que só aponta para ele — modelo mais simples de manter, mas assume que todos os IDEs consomem o mesmo formato igualmente bem. O DevBureau hoje faz o oposto: gera conteúdo específico por IDE via `sync_ide.py` a partir de `.agent/rules/DEVBUREAU.md`, o que permite adaptar formato/tom por ferramenta mas exige manter o pipeline de sync.
**Pitfall evitado:** Trocar de modelo sem comparar o custo real de manutenção dos dois lados pode trocar um problema conhecido (manter `sync_ide.py`) por um desconhecido (perda de adaptação por IDE).
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/scripts/sync_ide.py`, `.agent/rules/DEVBUREAU.md`, `CLAUDE.md`

## 2026-06-28 — Backup-antes-de-sobrescrever como hábito de script, não passo opcional

**Gatilho:** Qualquer script do kit que sobrescreve um arquivo de config/estado existente (ex.: `sync_ide.py` regenerando `CLAUDE.md`).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Operações que tocam config/arquivo existente fazem backup do estado atual ANTES de sobrescrever, como parte do próprio script — não como uma etapa manual que alguém pode esquecer de rodar.
**Pitfall evitado:** Sem backup automático, uma regeneração que dá errado (ou um valor de origem corrompido) destrói o estado anterior sem chance de comparação/rollback.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/deployment-procedures/SKILL.md`

## 2026-06-28 — Avaliação em duas fases: gerar, depois forçar validação

**Gatilho:** Qualquer fluxo onde um agente gera algo (código, config, documento) que precisa funcionar de fato, não só parecer completo.
**Confiança:** 🟡 Inferido
**Padrão identificado:** Separar "gerar" de "validar" em dois passos distintos — o segundo passo é um prompt/etapa dedicado que força a verificação real (build, boot, teste de fumaça), em vez de assumir que a geração já implica correção.
**Pitfall evitado:** Avaliação de um único passo (gerar e julgar no mesmo turno) mede completude estrutural, não se a coisa de fato funciona — mesmo pitfall do item já mesclado "completude estrutural ≠ correção em runtime".
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/agent-evaluation/SKILL.md`

## 2026-06-28 — Reavaliar o histórico quando uma regra de auditoria estava errada

**Gatilho:** Descobrir que uma régua/checklist usada para avaliar casos passados continha um erro (ex.: um padrão marcado como "ruim" que na verdade era válido).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Corrigir a regra E voltar para reavaliar todos os casos anteriores afetados por ela, documentando a correção — não só aplicar a regra nova daqui para frente.
**Pitfall evitado:** Deixar avaliações antigas erradas "como estavam" porque "a regra só mudou agora" deixa o histórico inconsistente e mina a confiança no processo de avaliação como um todo.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/agent-evaluation/SKILL.md`, `.agent/skills/pattern-mining/SKILL.md`

## 2026-06-28 — Reescrita cirúrgica de config gerada pelo usuário

**Gatilho:** Um script do kit precisa editar um arquivo de config que o usuário já personalizou manualmente (ex.: `sync_ide.py` tocando um `CLAUDE.md`/settings já editado à mão).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Tocar SOMENTE as chaves que de fato mudaram, preservando comentários, linhas em branco e formatação do resto do arquivo; "descomentar" uma chave quando ela ganha valor, em vez de reescrever o arquivo inteiro do zero a cada sync.
**Pitfall evitado:** Reescrever o arquivo inteiro destrói qualquer personalização/comentário que o usuário tenha adicionado manualmente, mesmo em partes não relacionadas à mudança.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/scripts/sync_ide.py`

## 2026-06-28 — Preflight fail-fast antes de provisionar/montar ambiente

**Gatilho:** Início de qualquer script de setup/deploy do kit (`doctor.py`, scripts de provisionamento).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Validar pré-condições (permissões, paths obrigatórios, UID/GID, ferramentas instaladas) ANTES de começar a executar passos de provisionamento — falhar rápido e com mensagem clara, em vez de falhar no meio do processo deixando estado parcial.
**Pitfall evitado:** Falhar no meio de um provisionamento deixa o ambiente em estado parcial, mais difícil de diagnosticar do que uma falha clara no início.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/deployment-procedures/SKILL.md`, `.agent/scripts/doctor.py`

## 2026-06-28 — Notas de release citam CVE de dependência transitiva

**Gatilho:** Cortar uma nova versão do kit ou de um projeto gerado por ele (ex.: commits já versionados como `v3.18.0`).
**Confiança:** 🟡 Inferido
**Padrão identificado:** Toda nota de release que inclui um bump de dependência cita explicitamente a classe de CVE corrigida quando aplicável, não só "atualizou dependências".
**Pitfall evitado:** "Bump de dependências" genérico esconde se a mudança era cosmética ou corrigia uma vulnerabilidade real — quem decide se atualiza urgente ou não precisa dessa informação.
**Evidência:** observação cruzada em múltiplos codebases auditados (nota de manutenção interna, não pública).
**Arquivos chave:** `.agent/skills/deployment-procedures/SKILL.md`
