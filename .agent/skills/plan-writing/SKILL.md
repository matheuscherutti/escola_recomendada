---
name: plan-writing
description: Use when implementing features, refactoring, or any multi-step work that needs a written plan ({task-slug}.md) — provides task breakdown rules, acceptance criteria format, and the no-placeholders standard.
allowed-tools: Read, Glob, Grep
---

# Plan Writing

## Overview
This skill provides a framework for breaking down work into clear, actionable tasks with verification criteria.

## Task Breakdown Principles

### 1. Small, Focused Tasks
- Each task should take 2-5 minutes
- One clear outcome per task
- Independently verifiable

### 2. Clear Verification
- How do you know it's done?
- What can you check/test?
- What's the expected output?

### 3. Logical Ordering
- Dependencies identified
- Parallel work where possible
- Critical path highlighted
- **Phase X: Verification is always LAST**

### 4. Dynamic Naming in Project Root
- Plan files are saved as `{task-slug}.md` in the PROJECT ROOT
- Name derived from task (e.g., "add auth" → `auth-feature.md`)
- **NEVER** inside `.claude/`, `docs/`, or temp folders

## Planning Principles (NOT Templates!)

> 🔴 **NO fixed templates. Each plan is UNIQUE to the task.**

### Principle 1: Keep It SHORT

| ❌ Wrong | ✅ Right |
|----------|----------|
| 50 tasks with sub-sub-tasks | 5-10 clear tasks max |
| Every micro-step listed | Only actionable items |
| Verbose descriptions | One-line per task |

> **Rule:** If plan is longer than 1 page, it's too long. Simplify.

---

### Principle 2: Be SPECIFIC, Not Generic

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Set up project" | "Run `npx create-next-app`" |
| "Add authentication" | "Install next-auth, create `/api/auth/[...nextauth].ts`" |
| "Style the UI" | "Add Tailwind classes to `Header.tsx`" |

> **Rule:** Each task should have a clear, verifiable outcome.

---

### Principle 3: Dynamic Content Based on Project Type

**For NEW PROJECT:**
- What tech stack? (decide first)
- What's the MVP? (minimal features)
- What's the file structure?

**For FEATURE ADDITION:**
- Which files are affected?
- What dependencies needed?
- How to verify it works?

**For BUG FIX:**
- What's the root cause?
- What file/line to change?
- How to test the fix?

---

### Principle 4: Scripts Are Project-Specific

> 🔴 **DO NOT copy-paste script commands. Choose based on project type.**

| Project Type | Relevant Scripts |
|--------------|------------------|
| Frontend/React | `ux_audit.py`, `accessibility_checker.py` |
| Backend/API | `api_validator.py`, `security_scan.py` |
| Mobile | `mobile_audit.py` |
| Database | `schema_validator.py` |
| Full-stack | Mix of above based on what you touched |

**Wrong:** Adding all scripts to every plan
**Right:** Only scripts relevant to THIS task

---

### Principle 5: Verification is Simple

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Verify the component works correctly" | "Run `npm run dev`, click button, see toast" |
| "Test the API" | "curl localhost:3000/api/users returns 200" |
| "Check styles" | "Open browser, verify dark mode toggle works" |

---

## Critérios de Aceite (Contrato de Aceite)

> Todo plano precisa de um contrato de aceite em linguagem simples antes de o trabalho começar — a especificação, não o código, é a fonte da verdade sobre "o que é entregar certo".

Escreva cada critério como uma frase "Quando [situação], o sistema deve [resultado esperado]". Isso é a versão em linguagem acessível do formato Given/When/Then (Gherkin/BDD) usado em Spec-Driven Development.

| ❌ Vago (não é um critério de aceite) | ✅ Contrato de aceite |
|----------|----------|
| "Login deve funcionar" | "Quando o cliente digitar e-mail e senha corretos, o sistema deve abrir o painel em até 2 segundos" |
| "Tratar erro de pagamento" | "Quando o pagamento for recusado, o sistema deve mostrar o motivo da recusa e não cobrar o cliente" |

Um critério sem "quando/deve" testável conta como placeholder (ver seção "No Placeholders") e reprova o plano.

## Nota Técnica: YAML para Dados Estruturados

Quando o plano precisar descrever dados estruturados (schema de config, contrato de API, modelo de dados), use um bloco YAML em vez de JSON dentro do plano — o agente processa YAML com mais precisão e menor custo de tokens. Texto corrido continua em Markdown normalmente; isso vale só para blocos de dados estruturados.

## Plan Structure (Flexible, Not Fixed!)

```
# [Task Name]

## Goal
One sentence: What are we building/fixing?

## Critérios de Aceite
- [ ] Quando [situação], o sistema deve [resultado esperado]
- [ ] Quando [situação], o sistema deve [resultado esperado]

## Tasks
- [ ] Task 1: [Specific action] → Verify: [How to check]
- [ ] Task 2: [Specific action] → Verify: [How to check]
- [ ] Task 3: [Specific action] → Verify: [How to check]

## Done When
- [ ] [Main success criteria]

## Notes
[Any important considerations — only if truly needed]
```

> **That's it.** No phases, no sub-sections unless truly needed.
> Keep it minimal. Add complexity only when required.

---

## No Placeholders

A plan with these is a plan failure, regardless of how short it is — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases" (name the actual check)
- "Similar to Task N" (repeat the actual content — a reader may hit tasks out of order)
- A verification step without a command and expected output

## Self-Review (Before Calling the Plan Done)

After writing the plan, check it against the original request with fresh eyes — this is a checklist you run yourself, not a separate pass:

1. **Coverage**: can you point to a task for every part of what was asked? List any gaps.
2. **Placeholder scan**: search the plan for the patterns above. Fix them inline.
3. **Consistency**: do names/paths used in later tasks match what earlier tasks defined? A function called `clearLayers()` in Task 2 but `clearFullLayers()` in Task 4 is a bug in the plan itself.

Fix issues inline as you find them — no need to re-run the whole review after a fix.

## Best Practices (Quick Reference)

1. **Start with goal** - What are we building/fixing?
2. **Max 10 tasks** - If more, break into multiple plans
3. **Each task verifiable** - Clear "done" criteria
4. **Project-specific** - No copy-paste templates
5. **Update as you go** - Mark `[x]` when complete

---

## When to Use

- New project from scratch
- Adding a feature
- Fixing a bug (if complex)
- Refactoring multiple files
