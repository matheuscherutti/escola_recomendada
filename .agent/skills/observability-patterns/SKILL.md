---
name: observability-patterns
description: Use when setting up monitoring for a deployed app, investigating a production incident, or deciding what to instrument — observability and incident-response principles (metrics, structured logging, distributed tracing, alerting, SLOs/error budgets, runbooks). Triggers on "monitorar", "alertas", "ficou fora do ar", "como saber se quebrou em produção", "SLO", "uptime", "incident".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Observability Patterns

> **You can't fix what you can't see, and you shouldn't watch everything the same way regardless of scale.**

Observability needs are sized by project tier (see `stack-sizing`), exactly like frameworks and databases. A Prototype doesn't need Prometheus; an Enterprise/Critical system without tracing and on-call is a liability.

---

## ⚠️ Core Principle

- Instrument BEFORE you need it — adding observability after the first outage is too late for that outage.
- Alert on symptoms users feel (error rate, latency), not on every internal cause.
- Every alert that pages someone must be actionable. If there's nothing to do at 3am, it's a dashboard metric, not a page.

---

## 1. The Three Pillars

| Pillar | Answers | Example |
|---|---|---|
| **Metrics** | "Is something wrong, and how bad?" | Request rate, error rate, p95 latency, CPU/memory |
| **Logs** | "What exactly happened, in order?" | Structured JSON logs with correlation/request IDs |
| **Traces** | "Where in the call chain did it happen?" | Distributed trace spans across services |

Start with metrics + logs. Add traces only once a request crosses more than one service boundary.

---

## 2. Tooling by Project Tier

| Tier | Metrics/Uptime | Logs | Errors | Alerting | Tracing |
|---|---|---|---|---|---|
| **Prototype** | Platform built-in (Vercel/Railway dashboard) | Platform built-in | Console only | None | None |
| **MVP** | Uptime ping (UptimeRobot, Better Uptime) | Hosted logs (platform built-in or Axiom free tier) | Sentry (free tier) | Email/Slack on down | None |
| **Growth SaaS** | Sentry/Datadog/Grafana Cloud dashboards | Structured JSON logs, centralized (Axiom, Logtail) | Sentry with release tracking | Slack/PagerDuty for actionable alerts only | Optional, if multi-service |
| **Enterprise/Critical** | Full APM (Datadog/New Relic) + formal SLOs | Centralized, retained per compliance requirements | Sentry + on-call triage | PagerDuty/Opsgenie, on-call rotation | OpenTelemetry across all services |

> Over-engineering flag: a Prototype or MVP reaching for OpenTelemetry + Prometheus + Grafana before there's a second engineer to read the dashboards.
> Under-engineering flag: an Enterprise/Critical system with no paging, no SLOs, and "we'll notice if it's down."

---

## 3. Structured Logging

- Every log line: timestamp, level, correlation/request ID, service name, message.
- NEVER log secrets, tokens, full request bodies with PII, or passwords (this is also a DEVBUREAU.md security rule, not just an observability one).
- Log at boundaries (incoming request, outgoing call, error) — not every internal function call.
- Use log levels deliberately: `ERROR` = needs human attention, `WARN` = degraded but self-healing, `INFO` = normal lifecycle events, `DEBUG` = local dev only.

---

## 4. Alerting Principles

- Alert on **symptoms** (error rate > 1%, p95 latency > 2s) not **causes** (CPU at 80%) — causes are for dashboards, symptoms are for pages.
- Every page needs a clear "so what do I do" — link the alert to a runbook.
- Tune thresholds to avoid alert fatigue: a page ignored twice stops being a page.

---

## 5. SLOs & Error Budgets (Growth SaaS and above)

- Define a Service Level Objective per critical user journey (e.g., "99.9% of checkout requests succeed in <2s").
- The gap between 100% and the SLO is the **error budget** — spend it on deploys/experiments, not silently.
- Burn-rate alerts (budget consumed too fast) are usually more useful than static thresholds.

---

## 6. Incident Response Runbook Skeleton

```markdown
## Runbook: [Service/Alert Name]

### Detect
- Alert: [name, threshold]
- Dashboard: [link]

### Triage (first 5 minutes)
1. Is it a real outage or a false alarm? (Check dashboard)
2. What's the blast radius? (One tenant? All traffic?)

### Mitigate (stop the bleeding)
- Rollback command: [exact command]
- Feature flag to disable: [if applicable]

### Resolve
- Root cause investigation → hand off to `debugger` if it's a code bug

### Postmortem (after resolution)
- Timeline, root cause, what made detection slow, action items
```

---

## ❌ Anti-Patterns

- Paging for every WARN-level log line.
- Logging full request/response bodies "just in case."
- Building a tracing pipeline before there's more than one service.
- No runbook — the alert fires and the on-call person has to improvise from scratch.
- Dashboards nobody looks at until something is already on fire.
