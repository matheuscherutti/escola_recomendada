---
name: intelligent-routing
description: Use at the start of EVERY user request, before responding, to decide which specialist agent(s) to apply — including when the user names no agent, mixes domains, or writes in PT-BR colloquialisms ("tá lento", "não funciona", "deixa mais bonito").
version: 1.1.0
---

# Intelligent Agent Routing

**Purpose**: Automatically analyze user requests and route them to the most appropriate specialist agent(s) without requiring explicit user mentions.

## Core Principle

> **The AI should act as an intelligent Project Manager**, analyzing each request and automatically selecting the best specialist(s) for the job.

## How It Works

### 1. Request Analysis

Before responding to ANY user request, perform automatic analysis:

```mermaid
graph TD
    A[User Request: Add login] --> B[ANALYZE]
    B --> C[Keywords]
    B --> D[Domains]
    B --> E[Complexity]
    C --> F[SELECT AGENT]
    D --> F
    E --> F
    F --> G[security-auditor + backend-specialist]
    G --> H[AUTO-INVOKE with context]
```

### 2. Agent Selection Matrix

**Use this matrix to automatically select agents:**

| User Intent         | Keywords (EN / PT)                                           | Selected Agent(s)                           | Auto-invoke? |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------- | ------------ |
| **Authentication**  | "login", "auth", "signup", "password" / "senha", "cadastro", "autenticação" | `security-auditor` + `backend-specialist`   | ✅ YES       |
| **UI Component**    | "button", "card", "layout", "style" / "botão", "cartão", "visual", "estilo" | `frontend-specialist`                       | ✅ YES       |
| **Mobile UI**       | "screen", "navigation", "touch" / "tela", "navegação", "toque", "celular" | `mobile-developer`                          | ✅ YES       |
| **API Endpoint**    | "endpoint", "route", "API" / "rota", "servidor", "conectar front" | `backend-specialist`                        | ✅ YES       |
| **Database**        | "schema", "query", "table" / "banco de dados", "tabela", "estrutura" | `database-architect` + `backend-specialist` | ✅ YES       |
| **Bug Fix**         | "error", "bug", "broken" / "erro", "quebrado", "não funciona", "bug" | `debugger`                                  | ✅ YES       |
| **Test**            | "test", "coverage", "unit" / "testar", "validar", "cobertura", "testes" | `test-engineer`                             | ✅ YES       |
| **Deployment**      | "deploy", "CI/CD", "docker" / "publicar", "colocar no ar", "subir site" | `devops-engineer`                           | ✅ YES       |
| **Security Review** | "security", "vulnerability" / "seguro", "vulnerabilidade", "ataque" | `security-auditor` + `penetration-tester`   | ✅ YES       |
| **Performance**     | "slow", "optimize", "speed" / "lento", "rápido", "otimizar", "velocidade" | `performance-optimizer`                     | ✅ YES       |
| **Product Def**     | "requirements", "MVP" / "requisitos", "ideia", "funcionalidades" | `product-manager`                           | ✅ YES       |
| **Kit Health**      | "doctor", "diagnóstico", "checar kit" / "saúde", "integridade", "tá tudo certo" | *(scripts)* `doctor.py`                      | ✅ YES       |
| **ADE Pipeline**    | "/ade", "pipeline autônomo" / "fazer tudo", "implementar autônomo" | `orchestrator` via `/ade`                   | ✅ YES       |
| **Memory Layer**    | "lessons", "gotchas", "memory" / "lições", "aprendemos", "evitar erro" | Consultar `.agent/memory/`                  | ✅ YES       |
| **Premium Design** | "premium design", "immersive", "awwwards", "gsap", "three.js" / "site premiado", "design de luxo", "animações premium", "interface imersiva", "5 pilares", "experiência imersiva", "design premium" | `frontend-specialist` + `premium-design-orchestrator` | ✅ YES       |
| **Brand Extraction** | "extract identity", "clone design", "analyze reference" / "extrair identidade", "clonar design", "analisar referência", "extrair paleta", "copiar essência" | `brand-identity-extractor` | ✅ YES       |
| **Monitoring/Incident** | "monitoring", "alert", "down", "incident" / "monitorar", "alerta", "fora do ar", "caiu" | `sre-engineer`                              | ✅ YES       |
| **API Contract**    | "OpenAPI", "GraphQL schema", "API versioning" / "contrato de API", "versionar API" | `api-designer`                              | ✅ YES       |
| **Accessibility**   | "accessibility", "a11y", "WCAG", "screen reader" / "acessibilidade", "leitor de tela", "contraste" | `accessibility-specialist`                  | ✅ YES       |

### 3. Automatic Routing Protocol (ALWAYS ACTIVE)

Before responding to ANY request: classify the request type → detect domains → assess complexity → select. SIMPLE + 1 domain = single agent; MODERATE + ≤2 domains = multiple agents in sequence; anything beyond = `orchestrator`.

## 4. Response Format

**When auto-selecting an agent, inform the user concisely:**

```markdown
🤖 **Applying knowledge of `@security-auditor` + `@backend-specialist`...**

[Proceed with specialized response]
```

**Benefits:**

- ✅ User sees which expertise is being applied
- ✅ Transparent decision-making
- ✅ Still automatic (no /commands needed)

## Script-First Pre-Check (runs BEFORE agent selection)

Routing has a step zero: **if the request (or a subtask of it) is deterministic — same input,
same correct output, no judgment — consult `.agent/SCRIPTS_REGISTRY.md` before selecting any
agent.** If a registered script covers it, the "route" is running that script, not spending
agent reasoning. If no script exists, apply the Rule of Three from the registry (1st inline,
2nd inline + flag, 3rd promote to script). Judgment tasks (naming, architecture, trade-offs,
design taste, root-cause hypotheses) skip this pre-check and go straight to agent selection.

## Domain Detection Rules

### Single-Domain Tasks (Auto-invoke Single Agent)

| Domain          | Patterns (EN + PT natural language)                                                  | Agent                   |
| --------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| **Security**    | auth, login, jwt, password, hash, token, "tá seguro?", "pode ser hackeado?", "verificar segurança", "proteger dados" | `security-auditor` |
| **Frontend**    | component, react, vue, css, html, tailwind, "deixa mais bonito", "muda o visual", "tá feio", "redesign", "interface moderna", "mudar cor", "dark mode", "modo escuro" | `frontend-specialist` |
| **Backend**     | api, server, express, fastapi, node, "criar endpoint", "conectar com", "rota", "servidor", "API" | `backend-specialist` |
| **Mobile**      | react native, flutter, ios, android, expo, "app mobile", "app para celular", "tela do celular" | `mobile-developer` |
| **Database**    | prisma, sql, mongodb, schema, migration, "banco de dados", "tabela", "estrutura dos dados", "modelar dados" | `database-architect` |
| **Testing**     | test, jest, vitest, playwright, cypress, "testar", "verificar qualidade", "tá funcionando?", "garantir que funciona", "rode os testes" | `test-engineer` |
| **DevOps**      | docker, kubernetes, ci/cd, pm2, nginx, "colocar no ar", "publicar", "deploy", "servidor caiu" | `devops-engineer` |
| **Debug**       | error, bug, crash, not working, issue, "não funciona", "tá quebrado", "dando erro", "travou", "tela branca", "não carrega", "bugado" | `debugger` |
| **Performance** | slow, lag, optimize, cache, performance, "tá lento", "demora pra carregar", "site devagar", "pesado", "fica travando" | `performance-optimizer` |
| **SEO**         | seo, meta, analytics, sitemap, robots, "aparecer no Google", "melhorar posição", "otimizar para buscadores", "mais visitas" | `seo-specialist` |
| **Game**        | unity, godot, phaser, game, multiplayer, "criar jogo", "fazer um game", "jogo 2D" | `game-developer` |
| **Kit Health**  | doctor, diagnóstico, "checar kit", "kit integridade", "saúde do kit", "tudo certo?", "verificar agente" | *(run doctor.py)* |
| **ADE**         | /ade, "pipeline autônomo", "fazer tudo sozinho", "implementar de forma autônoma", "crie e entregue pronto" | `orchestrator`+`/ade` |
| **Memory**      | "lições aprendidas", lessons, gotchas, "o que aprendemos", "evitar erro passado" | *.agent/memory/*  |
| **Premium Design** | gsap, three.js, swup, awwwards, scroll suave, "design premium", "site premiado", "interface imersiva", "animações premium", "5 pilares", "experiência imersiva", "landing page premium", "paleta premium" | `frontend-specialist` + premium skills |
| **Brand Extraction** | "extrair identidade", "clonar design", "analisar referência", "extrair paleta", "copiar essência", "extract brand", "analyze design" | `brand-identity-extractor` |
| **Agent Loop**  | "create a loop", "agent loop", "run until", "keep iterating until", "autonomous loop", "crie um loop", "loop autônomo", "rodar sozinho até", "automatizar tarefa repetitiva com verificação" | skill `loop-forge` (Triple Gate first — never activates a loop directly) |


### Multi-Domain Tasks (Auto-invoke Orchestrator)

If request matches **2+ domains from different categories**, automatically use `orchestrator`:

```text
Example: "Create a secure login system with dark mode UI"
→ Detected: Security + Frontend
→ Auto-invoke: orchestrator
→ Orchestrator will handle: security-auditor, frontend-specialist, test-engineer
```

## Complexity Assessment

### SIMPLE (Direct agent invocation)

- Single file edit
- Clear, specific task
- One domain only
- Example: "Fix the login button style"

**Action**: Auto-invoke respective agent

### MODERATE (2-3 agents)

- 2-3 files affected
- Clear requirements
- 2 domains max
- Example: "Add API endpoint for user profile"

**Action**: Auto-invoke relevant agents sequentially

### COMPLEX (Orchestrator required)

- Multiple files/domains
- Architectural decisions needed
- Unclear requirements
- Example: "Build a social media app"

**Action**: Auto-invoke `orchestrator` → will ask Socratic questions

## Implementation Rules

### Rule 1: Silent Analysis

#### DO NOT announce "I'm analyzing your request..."

- ✅ Analyze silently
- ✅ Inform which agent is being applied
- ❌ Avoid verbose meta-commentary

### Rule 2: Inform Agent Selection

**DO inform which expertise is being applied:**

```markdown
🤖 **Applying knowledge of `@frontend-specialist`...**

I will create the component with the following characteristics:
[Continue with specialized response]
```

### Rule 3: Seamless Experience

**The user should not notice a difference from talking to the right specialist directly.**

### Rule 4: Override Capability

**User can still explicitly mention agents:**

```text
User: "Use @backend-specialist to review this"
→ Override auto-selection
→ Use explicitly mentioned agent
```

## Edge Cases

### Case 1: Generic Question

```text
User: "How does React work?"
→ Type: QUESTION
→ No agent needed
→ Respond directly with explanation
```

### Case 2: Extremely Vague Request

```text
User: "Make it better"
→ Complexity: UNCLEAR
→ Action: Ask clarifying questions first
→ Then route to appropriate agent
```

### Case 3: Contradictory Patterns

```text
User: "Add mobile support to the web app"
→ Conflict: mobile vs web
→ Action: Ask: "Do you want responsive web or native mobile app?"
→ Then route accordingly
```

## Integration with Existing Workflows

### With /orchestrate Command

- **User types `/orchestrate`**: Explicit orchestration mode
- **AI detects complex task**: Auto-invoke orchestrator (same result)

**Difference**: User doesn't need to know the command exists.

### With Socratic Gate

- **Auto-routing does NOT bypass Socratic Gate**
- If task is unclear, still ask questions first
- Then route to appropriate agent

### With DEVBUREAU.md Rules

- **Priority**: DEVBUREAU.md rules > intelligent-routing
- If DEVBUREAU.md specifies explicit routing, follow it
- Intelligent routing is the DEFAULT when no explicit rule exists

## Routing Self-Test (pressure scenarios)

Se estiver em dúvida sobre uma seleção, valide contra estes casos-referência: "Create a dark mode toggle button" → `frontend-specialist`; "Review the authentication flow for vulnerabilities" → `security-auditor`; "Build a chat application with real-time notifications" → `orchestrator` (multi-domínio); "Login is not working, getting 401 error" → `debugger`. Se a sua seleção divergiria desses, releia a matriz antes de responder.
