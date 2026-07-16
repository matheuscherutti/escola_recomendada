# Gate Telemetry — DevBureau

> Registro de cada disparo do Socratic Gate para medir se ele melhora o entendimento de verdade, em vez de assumir que sim. Uma linha por disparo, preenchida pelo agente no fim da interação (ver `.agent/skills/brainstorming/SKILL.md`, seção "Telemetria do Gate"). Revisão periódica: `/benchmark` ou pedido explícito do usuário ("o gate está funcionando?").

## Como ler os dados

- **"Mudou o plano? = Sim" frequente** → o Gate está pagando o custo: as respostas do usuário alteraram a implementação.
- **"Mudou o plano? = Não" repetido para o mesmo tópico** → pergunta candidata a supressão em `question-preferences.md` (proponha ao usuário, não suprima sozinho).
- **"Suposição correta? = Não" repetido** → o agente está inferindo demais nesse tópico; mover de "assumir" para "perguntar".

## Formato de entrada (uma linha por disparo)

| Data | Pedido (slug curto) | Dimensões que faltavam | Perguntas (n) | Mudou o plano? | Suposição declarada correta? |
|------|--------------------|------------------------|---------------|----------------|------------------------------|

<!-- Entradas abaixo. "Mudou o plano?": a resposta do usuário alterou escopo/abordagem vs. o que seria feito sem perguntar. "Suposição correta?": preencher só quando o Gate prosseguiu com suposição declarada em vez de perguntar; N/A caso contrário. -->
| 2026-07-13 | permissoes-plano-aprovado | Nível de risco/autonomia aceito (irreversível: define o que roda sem supervisão) | 1 | Não (confirmou a recomendação) | N/A |
| 2026-07-13 | site-exemplo-premium | Tema/setor, Estilo/vibes de design, Stack de tecnologia | 3 | Sim (definiu o estilo como Futuristic Cyber-HUD e o tema como IA em vez do padrão de Estúdio de Arquitetura Brutalista) | N/A |
