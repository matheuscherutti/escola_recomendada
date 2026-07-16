---
name: code-review-checklist
description: Use when reviewing PRs, auditing code quality, or checking for security issues — code quality, security, and best-practice guidelines.
allowed-tools: Read, Glob, Grep
---

# Code Review Checklist

## Quick Review Checklist

### Correctness
- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error handling in place
- [ ] No obvious bugs

### Security
- [ ] Input validated and sanitized
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No XSS or CSRF vulnerabilities
- [ ] No hardcoded secrets or sensitive credentials
- [ ] **AI-Specific:** Protection against Prompt Injection (if applicable)
- [ ] **AI-Specific:** Outputs are sanitized before being used in critical sinks

### Performance
- [ ] No N+1 queries
- [ ] No unnecessary loops
- [ ] Appropriate caching
- [ ] Bundle size impact considered

### Code Quality
- [ ] Clear naming
- [ ] DRY - no duplicate code
- [ ] SOLID principles followed
- [ ] Appropriate abstraction level

### Testing
- [ ] Unit tests for new code
- [ ] Edge cases tested
- [ ] Tests readable and maintainable

### Documentation
- [ ] Complex logic commented
- [ ] Public APIs documented
- [ ] README updated if needed

## Trilha de Auditoria (Trajectory Check)

Para tarefas marcadas como sensíveis (segurança, dados de produção, dinheiro, deploy, exclusão de dados), não avalie só se o resultado final está certo — avalie também o caminho usado para chegar lá:

- [ ] Quais arquivos/comandos/ferramentas foram usados para produzir esse resultado?
- [ ] Algum passo pulou uma checagem de segurança, apagou evidência de erro, ou silenciou um aviso só para o resultado "parecer" certo?
- [ ] Se sim → marque 🔴 BLOCKING mesmo que a saída final esteja correta. Um resultado certo por um caminho perigoso é uma falha de qualidade, não um sucesso.
- [ ] **Exemplo concreto — proteção de config:** editar/enfraquecer um arquivo de config de lint/formatter/tooling (`eslint.config.*`, `tsconfig.json`, `.flake8`, `pyproject.toml [tool.*]`, etc.) só para um check parar de reclamar, em vez de corrigir o código que ele está sinalizando, é 🔴 BLOCKING — mesmo com o lint/build "verde" no final. A trava existe para pegar o código, não para ser contornada.

## AI & LLM Review Patterns (2025)

### Logic & Hallucinations
- [ ] **Chain of Thought:** Does the logic follow a verifiable path?
- [ ] **Edge Cases:** Did the AI account for empty states, timeouts, and partial failures?
- [ ] **External State:** Is the code making safe assumptions about file systems or networks?

### Prompt Engineering Review
```markdown
// ❌ Vague prompt in code
const response = await ai.generate(userInput);

// ✅ Structured & Safe prompt
const response = await ai.generate({
  system: "You are a specialized parser...",
  input: sanitize(userInput),
  schema: ResponseSchema
});
```

## Anti-Patterns to Flag

```typescript
// ❌ Magic numbers
if (status === 3) { ... }

// ✅ Named constants
if (status === Status.ACTIVE) { ... }

// ❌ Deep nesting
if (a) { if (b) { if (c) { ... } } }

// ✅ Early returns
if (!a) return;
if (!b) return;
if (!c) return;
// do work

// ❌ Long functions (100+ lines)
// ✅ Small, focused functions

// ❌ any type
const data: any = ...

// ✅ Proper types
const data: UserData = ...
```

## Review Comments Guide

```
// Blocking issues use 🔴
🔴 BLOCKING: SQL injection vulnerability here

// Important suggestions use 🟡
🟡 SUGGESTION: Consider using useMemo for performance

// Minor nits use 🟢
🟢 NIT: Prefer const over let for immutable variable

// Questions use ❓
❓ QUESTION: What happens if user is null here?
```
