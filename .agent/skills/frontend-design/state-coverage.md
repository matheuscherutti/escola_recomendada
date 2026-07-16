# State Coverage

> Adapted from open-design (nexu-io/open-design), craft/, and refero_skill (MIT), via analysis on 2026-06-30.

The single most common AI-design failure is shipping only the "everything worked" state. Every surface that fetches, transforms, or accepts data must render five states, not one.

## The 5 Required States

| State | When | Must show |
|---|---|---|
| **Loading** | Data in flight | Skeleton/spinner + a "taking longer than expected" fallback at 15s |
| **Empty** | No records / query returned nothing | Headline, plain explanation, primary CTA — never a blank or "No data" |
| **Error** | Fetch/server/validation failed | Plain-language cause, recovery action, preserved user input |
| **Populated** | Data present | The state that's usually the only one designed |
| **Edge** | Extreme volume, long strings, missing fields, RTL, partial network | Layout that survives without breaking |

Test rule: for every list, table, card, form, or panel, ask "what does this look like in the other four states?" before calling the surface done.

## Loading Thresholds

Pick the indicator by expected duration, not by what's already in the component library.

| Duration | Indicator |
|---|---|
| 0–300ms | None — render synchronously |
| 300ms–2s | Subtle spinner/skeleton |
| 2–10s | Skeleton matched to layout, or a labelled spinner |
| 10–30s | Determinate progress bar with a cancel option |
| 30–60s | Progress bar + cancel; the "taking longer" notice already fired at 15s, don't repeat it |
| 60s+ | Stop the animation, show an error with retry/cancel/continue |

Never leave a spinner running with no timeout on the request.

## Error Composition

Every error answers three questions, in order: what happened (plain language — "your card was declined," not "something went wrong") → why, if knowable → what the user can do about it. Preserve user input across the error; never wipe the form on submit failure.

Match severity to scope, don't escalate past it:

| Severity | Surface |
|---|---|
| Field-level | Inline message, focus moves to the field |
| Form-level | Error summary banner at top + per-field markers |
| Section-level | Inline panel with retry, rest of the page still works |
| Page-level | Full error state with recovery CTA |
| App-level | Persistent banner/modal for critical loss of function |

Retry discipline: first retry fires immediately on click; second and third use exponential backoff (2s, 4s, 8s max); after 3 failed retries, replace "Retry" with "Contact support" plus a copyable error ID.

## Empty State Composition

Empty is its own state with a job, not the absence of one:

- **First-use empty** — illustration + headline + value sentence + primary CTA. This is the onboarding moment.
- **No-results empty** — echo the query, suggest alternatives, never a true blank.
- **Cleared empty** — celebratory phrasing, optional next action.
- Never collapse an error into an empty state — an error needs recovery information an empty state doesn't carry.

## ARIA on State Change

| Change | Role | Focus action |
|---|---|---|
| Inline error on submit | `role="alert"` | Move focus to the first error field |
| Toast / non-urgent confirmation | `role="status"` (polite) | Don't move focus |
| Critical or destructive confirmation | `role="alertdialog"` | Move focus to the dialog |
| Loading begins | `role="status"` announcement ("Loading…") | Don't move focus to the spinner |
| Loading ends, user-initiated | — | Move focus to the loaded content |

Live-region containers must already exist in the DOM before content is injected into them — adding `aria-live` at the same moment as the content skips the announcement.

## Common Mistakes

- Only the populated state exists; loading, empty, error, and edge are absent.
- "Something went wrong" with no cause or recovery action.
- A spinner with no timeout that can run indefinitely.
- The form clears on submit failure, forcing re-entry.
- Toast position drifts between appearances on the same screen.
- Color alone conveys the error state, with no icon or text label.
