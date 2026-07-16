---
name: brainstorming
description: MANDATORY for complex requests, new features, or unclear requirements — Socratic questioning protocol, user communication, progress reporting, and error handling.
allowed-tools: Read, Glob, Grep
---

# Brainstorming & Communication Protocol

> **MANDATORY:** Use for complex/vague requests, new features, updates.

---

## 🛑 SOCRATIC GATE (ENFORCEMENT)

### When to Trigger

| Pattern | Action |
|---------|--------|
| "Build/Create/Make [thing]" without details | 🛑 ASK 3 questions |
| Complex feature or architecture | 🛑 Clarify before implementing |
| Update/change request | 🛑 Confirm scope |
| Vague requirements | 🛑 Ask purpose, users, constraints |

### 🚫 MANDATORY: 3 Questions Before Implementation

1. **STOP** - Do NOT start coding
2. **EXTRACT** - Silently run the Intent Extraction Matrix (below) against the request + session context
3. **ASK** - Minimum 3 questions for new builds, targeting the **missing critical dimensions** from the matrix — never the same generic trio by reflex. Purpose (🎯), Users (👥), and Scope (📦) are the fallback ONLY when the matrix yields nothing more specific to this request
4. **WAIT** - Get response before proceeding

### 🧭 Intent Extraction Matrix (run SILENTLY before generating questions)

> 9-dimension silent intent extraction. Extraction is invisible to the user — no meta-commentary like "analyzing your request".

| Dimension | What to extract | Critical when |
|-----------|-----------------|---------------|
| **Goal / Problem** | The business problem being solved, not the feature name | Always |
| **Users / Audience** | Who uses it, their technical level | Always on new features/products |
| **Scope** | Must-have vs nice-to-have; 1 file or 50 | Always |
| **Success criteria** | How the user will judge "it worked" — binary where possible | Complex builds |
| **Constraints** | Must / must-not, deadline, budget, brand rules | If mentioned or implied |
| **Existing context** | Project state, stack, decisions already made this session | Existing project |
| **Content / Input** | Real content in hand vs placeholder | UI or content work |
| **Output shape** | Page? API? Component? Report? Automation? | Deliverable is ambiguous |
| **Examples / References** | Reference designs, competitors, shared images | Design work |

**Rules:**

1. A dimension already answered (this session or a previous one), inferable from the codebase, or suppressed in `question-preferences.md` is **filled, not asked** — state the assumption in one line instead (Gate Decision table in DEVBUREAU.md).
2. Questions target only missing **critical** dimensions, highest architectural impact first.
3. **Max 3 questions per round.** If a new build has fewer than 3 critical dimensions missing, fill the remaining slots with edge-case/trade-off questions (per DEVBUREAU.md's Socratic Gate) — never with dimensions the matrix already filled.

### 🔇 Before Asking: Check Suppressed Questions

Before firing ANY question above, read `.agent/memory/question-preferences.md`:

1. Match the question you're about to ask against its logged entries by topic (the `**Gatilho:**` field), not by exact wording — a suppression for "tech stack preference" applies even if this turn's phrasing differs slightly.
2. If the topic is marked **Suprimida**, skip that specific question. Proceed using the most recent reasonable assumption for it, and state the assumption explicitly in your response (e.g. "Assumindo Next.js + Postgres como da última vez, já que você pediu para eu não perguntar isso de novo.").
3. If the topic is marked **Sempre perguntar**, ask it anyway — that status is an explicit confirmation the user wants it asked every time, not an oversight.
4. If the user says something like "para de perguntar isso", "já respondi isso antes", "stop asking that" — append a new dated entry to `question-preferences.md` immediately (same format as `lessons.md`/`gotchas.md`: date, Gatilho, Status, Razão do usuário, Evidência). Do this before continuing with the rest of the response, not as an afterthought.
5. This check never suppresses the FIRST time a topic comes up in a brand-new project/context — suppression only applies once an entry actually exists for that topic.

### 📊 Telemetria do Gate (feche o loop de aprendizado)

Todo disparo do Gate gera **uma linha** em `.agent/memory/gate-telemetry.md`, no fim da interação (não no meio):

1. **Perguntou e o usuário respondeu** → registre as dimensões que faltavam, quantas perguntas, e se a resposta **mudou o plano** (escopo/abordagem diferente do que seria feito sem perguntar).
2. **Prosseguiu com suposição declarada** → registre a suposição e, quando o resultado ficar claro, se ela estava **correta**.
3. Nunca acumule débito: se a sessão está terminando e a linha não foi escrita, escreva antes de encerrar. Uma linha, sem prosa extra — o formato está no próprio arquivo.

Esses dados alimentam `question-preferences.md`: tópico com "Mudou o plano? = Não" repetido é candidato a supressão (proponha ao usuário); suposição errada repetida vira "Sempre perguntar".

---

## 🧠 Dynamic Question Generation

**⛔ NEVER use static templates.** Read `dynamic-questioning.md` for principles.

### Core Principles

| Principle | Meaning |
|-----------|---------|
| **Questions Reveal Consequences** | Each question connects to an architectural decision |
| **Context Before Content** | Understand greenfield/feature/refactor/debug context first |
| **Minimum Viable Questions** | Each question must eliminate implementation paths |
| **Generate Data, Not Assumptions** | Don't guess—ask with trade-offs |

### Question Generation Process

```
1. Parse request → Run Intent Extraction Matrix (above) → note missing critical dimensions
2. Identify decision points → Blocking vs. deferable
3. Generate questions → Priority: P0 (blocking) > P1 (high-leverage) > P2 (nice-to-have), scoped to missing dimensions
4. Format with trade-offs → What, Why, Options, Default
```

### Question Format (MANDATORY)

```markdown
### [PRIORITY] **[DECISION POINT]**

**Question:** [Clear question]

**Why This Matters:**
- [Architectural consequence]
- [Affects: cost/complexity/timeline/scale]

**Options:**
| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| A | [+] | [-] | [Use case] |

**If Not Specified:** [Default + rationale]
```

**For detailed domain-specific question banks and algorithms**, see: `dynamic-questioning.md`

---

## Progress Reporting (PRINCIPLE-BASED)

**PRINCIPLE:** Transparency builds trust. Status must be visible and actionable.

### Status Board Format

| Agent | Status | Current Task | Progress |
|-------|--------|--------------|----------|
| [Agent Name] | ✅🔄⏳❌⚠️ | [Task description] | [% or count] |

### Status Icons

| Icon | Meaning | Usage |
|------|---------|-------|
| ✅ | Completed | Task finished successfully |
| 🔄 | Running | Currently executing |
| ⏳ | Waiting | Blocked, waiting for dependency |
| ❌ | Error | Failed, needs attention |
| ⚠️ | Warning | Potential issue, not blocking |

---

## Error Handling (PRINCIPLE-BASED)

**PRINCIPLE:** Errors are opportunities for clear communication.

### Error Response Pattern

```
1. Acknowledge the error
2. Explain what happened (user-friendly)
3. Offer specific solutions with trade-offs
4. Ask user to choose or provide alternative
```

### Error Categories

| Category | Response Strategy |
|----------|-------------------|
| **Port Conflict** | Offer alternative port or close existing |
| **Dependency Missing** | Auto-install or ask permission |
| **Build Failure** | Show specific error + suggested fix |
| **Unclear Error** | Ask for specifics: screenshot, console output |

---

## Completion Message (PRINCIPLE-BASED)

**PRINCIPLE:** Celebrate success, guide next steps.

### Completion Structure

```
1. Success confirmation (celebrate briefly)
2. Summary of what was done (concrete)
3. How to verify/test (actionable)
4. Next steps suggestion (proactive)
```

---

## Communication Principles

| Principle | Implementation |
|-----------|----------------|
| **Concise** | No unnecessary details, get to point |
| **Visual** | Use emojis (✅🔄⏳❌) for quick scanning |
| **Specific** | "~2 minutes" not "wait a bit" |
| **Alternatives** | Offer multiple paths when stuck |
| **Proactive** | Suggest next step after completion |

---

## Anti-Patterns (AVOID)

| Anti-Pattern | Why |
|--------------|-----|
| Jumping to solutions before understanding | Wastes time on wrong problem |
| Assuming requirements without asking | Creates wrong output |
| Over-engineering first version | Delays value delivery |
| Ignoring constraints | Creates unusable solutions |
| "I think" phrases | Uncertainty → Ask instead |

---
