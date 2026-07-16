---
name: humanizer
description: "Use when the user asks to make a text sound human or less like AI — 'humanize', 'humaniza esse texto', 'tá com cara de IA', 'sounds like ChatGPT', 'remove AI tells', 'deixa mais natural', 'reescreve como pessoa' — or before delivering client-facing copy (posts, carousels, proposals, emails, articles) produced by a squad or agent. Detects and rewrites 33 catalogued AI-writing patterns (em dashes, rule of three, inflated significance, -ing analyses, AI vocabulary, sycophancy) in EN and PT-BR, with false-positive guardrails so real human prose is not gutted. Out of scope: code comments and technical docs (use clean-code / documentation-templates)."
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion
---

# Humanizer

Rewrites text to remove the statistical fingerprints of AI generation while preserving
meaning, coverage, and the author's voice. Adapted for this kit (EN + PT-BR) from
[blader/humanizer](https://github.com/blader/humanizer) (MIT, Siqi Chen), based on
Wikipedia's "Signs of AI writing".

**Full English pattern catalog (33 patterns, before/after examples, false positives):**
`references/signs-of-ai-writing.md` — read the relevant sections on demand, not the whole
file. This SKILL.md holds the process, the PT-BR layer, and the guardrails.

## Process (every run)

1. **Detect the language** of the input; apply the matching tell list (below for PT-BR,
   reference file for EN). Mixed text gets both.
2. **Scan for clusters, not isolated hits.** One em dash means nothing; em dash + rule of
   three + "vibrant tapestry"/"verdadeira tapeçaria" + generic conclusion is a confession.
3. **Draft rewrite** — rewrite, don't delete: cover everything the original covers, same
   paragraph count, same register. If the user provided a writing sample, match ITS
   sentence length, word level, and tics instead of a generic "natural" voice.
4. **Self-audit:** ask "what still reads as AI here?" and list the remaining tells.
5. **Final rewrite** fixing them. Hard constraint: zero em/en dashes (—, –) in the final
   text, EN or PT (kit rule reinforced). Scan before delivering; any hit = not done.
6. **Deliver** the final text first, then (only if the user wants detail) the tell list.

## PT-BR tell list (the layer the upstream skill lacks)

| Categoria | Marcas a caçar (reescrever) |
|---|---|
| Travessão | `—` e `–` em qualquer posição → vírgula, ponto, dois-pontos ou parênteses. O tell nº 1 em português. |
| Significância inflada | "desempenha um papel fundamental/crucial", "marco fundamental", "se consolida como", "testemunho de", "verdadeira tapeçaria", "no cenário atual", "na era digital", "em constante evolução" |
| Gerundismo analítico | frases encerradas com "...destacando", "...evidenciando", "...reforçando", "...demonstrando", "...garantindo" para fingir profundidade (equivalente do padrão "-ing" inglês) |
| Vocabulário de IA | "robusto", "vibrante", "impulsionar", "alavancar", "potencializar", "agregar valor", "mergulhar em", "desvendar", "panorama", "abordagem holística", "sinergia" |
| Fuga do "é/são" | "se destaca como", "figura como", "conta com", "oferece uma gama de" no lugar de "é/tem" |
| Paralelismo negativo | "não é apenas X, é Y", "não se trata de X, mas de Y", "mais do que X, é Y" |
| Regra de três | trincas mecânicas: "inovação, inspiração e insights", "rápido, seguro e escalável" (quando não são três fatos reais) |
| Enchimento | "é importante ressaltar/destacar que", "vale ressaltar", "cabe destacar", "nesse sentido", "diante disso", "dito isso", "em suma", "além disso" empilhado, "ademais", "outrossim" |
| Bajulação/artefato de chat | "Ótima pergunta!", "Com certeza!", "Claro!", "Espero ter ajudado", "Fico à disposição" colados em texto de conteúdo |
| Conclusão genérica | "O futuro é promissor", "As possibilidades são infinitas", "Fique de olho", seção "Conclusão" que só repete o texto |
| Formatação | emojis decorando títulos/bullets; listas com "**Rótulo:** frase"; negrito mecânico; títulos Em Caixa Alta Por Palavra |
| Hedging excessivo | "pode potencialmente", "poderia possivelmente ser argumentado que" |

## False-positive guardrails (mandatory before rewriting)

From the reference file's "What NOT to flag" — the short version: polish is not AI; formal
vocabulary is not AI; one em dash or one "além disso" is not AI; never rewrite quoted
material, titles, proper names, or text where the phrase is being DISCUSSED rather than
used. Preserve signs of human writing: specific hard-to-fabricate detail, mixed feelings,
era-bound slang, varied sentence length, genuine asides. When in doubt, leave the prose
alone — over-editing destroys what makes it sound human.

## Where this plugs into the kit

- **Squads:** content-producing squad steps SHOULD run humanizer on client-facing copy
  before their checkpoint (add it to the step's skill list in `squad.md`).
- **Style discipline:** the kit's own response rules (DEVBUREAU.md, "Disciplina de Estilo")
  already ban em dashes and tell-words in PT — this skill applies the same standard to
  DELIVERABLES, with a rewrite protocol instead of a style rule.
- **Not for code:** comments and technical docs follow `clean-code` /
  `documentation-templates`, not this skill.
