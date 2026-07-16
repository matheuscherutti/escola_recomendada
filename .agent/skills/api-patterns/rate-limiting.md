# Rate Limiting Principles

> Protect your API from abuse and overload.

## Why Rate Limit

```
Protect against:
├── Brute force attacks
├── Resource exhaustion
├── Cost overruns (if pay-per-use)
└── Unfair usage
```

## Strategy Selection

| Type | How | When |
|------|-----|------|
| **Token bucket** | Burst allowed, refills over time | Most APIs |
| **Sliding window** | Smooth distribution | Strict limits |
| **Fixed window** | Simple counters per window | Basic needs |

## Response Headers

```
Include in headers:
├── X-RateLimit-Limit (max requests)
├── X-RateLimit-Remaining (requests left)
├── X-RateLimit-Reset (when limit resets)
└── Return 429 when exceeded
```

## Calling External APIs Politely (Outbound Fan-Out)

When your own service calls out to N external endpoints (third-party APIs, webhooks, scrapers):

| Layer | Pattern |
|-------|---------|
| Concurrency | Bounded sliding window — cap concurrent in-flight calls, refill a slot only when one completes; never spawn unbounded |
| Timeout | Two layers: a per-task timeout AND an outer global timeout, so one slow endpoint can't hang the whole batch |
| Partial failure | A typed per-item status (success/not-found/error/timeout), not an all-or-nothing batch; only abort if EVERY call failed |
| Transport errors | Map to domain states (404 → NotFound, 401 → fall back to public data) instead of letting raw HTTP errors propagate |
