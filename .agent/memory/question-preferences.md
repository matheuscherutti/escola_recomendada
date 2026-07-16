# Question Preferences — DevBureau

> Preferências do usuário sobre quais perguntas do Socratic Gate pular ou sempre fazer. Consulte antes de disparar qualquer pergunta do Gate — ver `DEVBUREAU.md`'s Socratic Gate Protocol e `.agent/skills/brainstorming/SKILL.md`.

---

## Formato de entrada

```markdown
## YYYY-MM-DD — [Tópico da pergunta]
**Gatilho:** Situação/tipo de pergunta que normalmente dispararia isso
**Status:** Suprimida (usuário pediu para não perguntar mais) / Sempre perguntar (confirmado explicitamente)
**Razão do usuário:** Citação ou paráfrase do motivo
**Evidência:** Sessão/contexto onde foi pedido
```

Quando o tópico está **Suprimida**: pule a pergunta e prossiga com a suposição razoável mais recente, declarando-a explicitamente na resposta. Quando está **Sempre perguntar**: trate como uma confirmação explícita de que o Gate deve continuar perguntando sobre esse tópico, mesmo que pareça redundante.

Se o usuário disser algo como "pare de perguntar isso", "já respondi isso antes", "não precisa perguntar de novo", ou variantes — registre uma entrada nova imediatamente, sem esperar confirmação adicional.

---
