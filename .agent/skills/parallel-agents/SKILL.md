---
name: parallel-agents
description: Use when multiple independent tasks can run with different domain expertise, or when comprehensive analysis requires multiple perspectives — multi-agent orchestration patterns.
allowed-tools: Read, Glob, Grep
---

# Native Parallel Agents

> Orchestration through Antigravity's built-in Agent Tool

## Overview

This skill enables coordinating multiple specialized agents through Antigravity's native agent system. Unlike external scripts, this approach keeps all orchestration within Antigravity's control.

## When to Use Orchestration

✅ **Good for:**
- Complex tasks requiring multiple expertise domains
- Code analysis from security, performance, and quality perspectives
- Comprehensive reviews (architecture + security + testing)
- Feature implementation needing backend + frontend + database work

❌ **Not for:**
- Simple, single-domain tasks
- Quick fixes or small changes
- Tasks where one agent suffices

---

## When NOT to Fan Out

This skill answers "which specialist for which domain." Before fanning out N agents in parallel, also check whether the tasks should run in parallel at all — a different question.

**Don't parallelize when:**
- **Tasks are related, not independent** — agent B needs to see what agent A actually changed (not just "agent A is done"), e.g. two agents touching the same function from different angles.
- **They share mutable state** — same file, same migration, same config — parallel writes race or silently overwrite each other.
- **One task needs full-system context** the others don't have — e.g. an architecture decision that should inform every other agent's approach, not run alongside them blind to it.

**Safe to parallelize when:** tasks are genuinely independent investigations or fixes — different files/modules, no shared state, no task's output changes another's approach. Pattern 1 (Comprehensive Analysis) above is the canonical safe case: each domain agent reads the same code but writes nothing, so there's no race.

## Dependency Waves

Real task sets are rarely *all* independent or *all* dependent — usually some subset can run together and the rest waits on their output. Instead of one flat fan-out or one fully sequential chain, group into waves:

1. **Wave 1** — every task with no dependency on another task in this batch. Dispatch all of them in parallel.
2. Wait for Wave 1 to fully land (all agents report back, state merged — e.g. files written, checkboxes updated in `{task-slug}.md`).
3. **Wave 2** — tasks that only needed Wave 1's output. Dispatch those in parallel.
4. Repeat until every task is placed in a wave.

The rule for grouping: two tasks belong in the same wave only if neither needs to read something the other one is about to write. If unsure, put them in separate waves — a wave boundary costs a little time, a same-wave race costs a debugging session. This is the sequencing answer to "when NOT to fan out" above: don't skip parallelism just because *some* tasks are dependent — isolate the dependent ones into their own wave and parallelize the rest.

## Prompt Construction for Parallel Dispatch

Each dispatched agent starts cold with no memory of this conversation — the prompt is its only context. Common mistakes when writing one:

| Mistake | Fix |
|---|---|
| Too broad ("look into the auth module") | Too specific ceiling: state the exact question the agent must answer |
| No context ("fix the bug") | Context: what you've ruled out, why this matters, relevant file paths |
| No constraints ("refactor this") | Constraints: what must NOT change, scope boundaries, files out of bounds |
| Vague output ("let me know what you find") | Specific output: the exact format/fields the synthesis step needs back |

---

## Native Agent Invocation

### Single Agent
```
Use the security-auditor agent to review authentication
```

### Sequential Chain
```
First, use the explorer-agent to discover project structure.
Then, use the backend-specialist to review API endpoints.
Finally, use the test-engineer to identify test gaps.
```

### With Context Passing
```
Use the frontend-specialist to analyze React components.
Based on those findings, have the test-engineer generate component tests.
```

### Resume Previous Work
```
Resume agent [agentId] and continue with additional requirements.
```

---

## Orchestration Patterns

### Pattern 1: Comprehensive Analysis
```
Agents: explorer-agent → [domain-agents] → synthesis

1. explorer-agent: Map codebase structure
2. security-auditor: Security posture
3. backend-specialist: API quality
4. frontend-specialist: UI/UX patterns
5. test-engineer: Test coverage
6. Synthesize all findings
```

### Pattern 2: Feature Review
```
Agents: affected-domain-agents → test-engineer

1. Identify affected domains (backend? frontend? both?)
2. Invoke relevant domain agents
3. test-engineer verifies changes
4. Synthesize recommendations
```

### Pattern 3: Security Audit
```
Agents: security-auditor → penetration-tester → synthesis

1. security-auditor: Configuration and code review
2. penetration-tester: Active vulnerability testing
3. Synthesize with prioritized remediation
```

---

## Available Agents

| Agent | Expertise | Trigger Phrases |
|-------|-----------|-----------------|
| `orchestrator` | Coordination | "comprehensive", "multi-perspective" |
| `security-auditor` | Security | "security", "auth", "vulnerabilities" |
| `penetration-tester` | Security Testing | "pentest", "red team", "exploit" |
| `backend-specialist` | Backend | "API", "server", "Node.js", "Express" |
| `frontend-specialist` | Frontend | "React", "UI", "components", "Next.js" |
| `test-engineer` | Testing | "tests", "coverage", "TDD" |
| `devops-engineer` | DevOps | "deploy", "CI/CD", "infrastructure" |
| `database-architect` | Database | "schema", "Prisma", "migrations" |
| `mobile-developer` | Mobile | "React Native", "Flutter", "mobile" |
| `api-designer` | API Design | "REST", "GraphQL", "OpenAPI" |
| `debugger` | Debugging | "bug", "error", "not working" |
| `explorer-agent` | Discovery | "explore", "map", "structure" |
| `documentation-writer` | Documentation | "write docs", "create README", "generate API docs" |
| `performance-optimizer` | Performance | "slow", "optimize", "profiling" |
| `project-planner` | Planning | "plan", "roadmap", "milestones" |
| `seo-specialist` | SEO | "SEO", "meta tags", "search ranking" |
| `game-developer` | Game Development | "game", "Unity", "Godot", "Phaser" |

---

## Antigravity Built-in Agents

These work alongside custom agents:

| Agent | Model | Purpose |
|-------|-------|---------|
| **Explore** | Haiku | Fast read-only codebase search |
| **Plan** | Sonnet | Research during plan mode |
| **General-purpose** | Sonnet | Complex multi-step modifications |

Use **Explore** for quick searches, **custom agents** for domain expertise.

---

## Synthesis Protocol

After all agents complete, synthesize:

```markdown
## Orchestration Synthesis

### Task Summary
[What was accomplished]

### Agent Contributions
| Agent | Finding |
|-------|---------|
| security-auditor | Found X |
| backend-specialist | Identified Y |

### Consolidated Recommendations
1. **Critical**: [Issue from Agent A]
2. **Important**: [Issue from Agent B]
3. **Nice-to-have**: [Enhancement from Agent C]

### Action Items
- [ ] Fix critical security issue
- [ ] Refactor API endpoint
- [ ] Add missing tests
```

---

## Best Practices

1. **Available agents** - 17 specialized agents can be orchestrated
2. **Logical order** - Discovery → Analysis → Implementation → Testing
3. **Share context** - Pass relevant findings to subsequent agents
4. **Single synthesis** - One unified report, not separate outputs
5. **Verify changes** - Always include test-engineer for code modifications

---

## Key Benefits

- ✅ **Single session** - All agents share context
- ✅ **AI-controlled** - Claude orchestrates autonomously
- ✅ **Native integration** - Works with built-in Explore, Plan agents
- ✅ **Resume support** - Can continue previous agent work
- ✅ **Context passing** - Findings flow between agents
