# Form Validation Lifecycle

> Adapted from open-design (nexu-io/open-design), craft/, and refero_skill (MIT), via analysis on 2026-06-30.

Validation timing decides most of whether a form feels hostile or helpful. The rule that resolves nearly every timing debate: validate on blur, never on the first keystroke.

## Input State Machine

Drive error UI off state, not off raw `:invalid` or ad-hoc focus/blur booleans.

| State | Meaning | UI |
|---|---|---|
| `pristine` | Not yet touched | No error chrome |
| `dirty` | Typed, still focused | No error chrome yet |
| `touched` | Blurred at least once after editing | Field-level constraint runs now |
| `invalid-after-touched` | Constraint failed after blur | Show error, link via `aria-describedby` |
| `invalid-after-submit` | Submit attempted, field still invalid | Same, plus focus moves to the summary or first invalid field |
| `recovering` | User editing an already-invalid field | Re-validate on every keystroke, not on the next blur |
| `submitting` | Action in flight | Disable submit, announce via a polite live region |
| `server-error` | Server rejected this field | Use the server's message, treat as `invalid-after-submit` |

## The 4 Timing Rules

1. **First blur after edit** runs the field-level constraint — not on focus, not on the first keystroke.
2. Once a field is invalid, **switch to keystroke re-validation** so the error clears the instant input becomes valid — don't make the user blur again to dismiss it.
3. **On submit**, run full validation and move focus to the error summary (or the first invalid field if no summary exists).
4. **Background checks** (uniqueness while typing, address lookup) debounce 250–500ms and never block typing or lock the submit button indefinitely. **Server validation on submit** is different — that path must wait for the server's answer, since the server is the truth.

## Constraint Validation API (the platform floor)

Use native HTML attributes for every field that has them — `required`, `type` (email/url/number/tel), `pattern`, `min`/`max`, `minlength`/`maxlength`. They survive JS failure and integrate with autofill. Cross-field rules go through `setCustomValidity()`.

- Empty string clears `setCustomValidity` — not `null`, not a no-arg call.
- `form.requestSubmit()` honors validation; `form.submit()` skips it. Never call the second.
- `inputmode` is a virtual-keyboard hint, not validation — it doesn't replace `pattern`/`type`.

## Error Wiring Beyond the Baseline

- Ship 4–7 distinct messages per high-traffic complex field (email, phone, card, postal code). A generic "invalid input" when the back end already knows the exact subrule that fired is the single most common preventable form failure.
- Error summary on submit only: a heading-led container with `tabindex="-1"` so JS can focus it, without `role="alert"` — combining a moved-focus target with an alert role causes double-announcement. Reserve `role="alert"` for inline per-field errors that appear without focus moving.
- Preserve user input across an error reload — never wipe a field, especially a payment field, because an unrelated field failed.

## Schema as the Cross-Stack Contract

One schema (Zod/Valibot/ArkType via the `~standard` Standard Schema interface) validates on both client and server. Server is the truth, client is the optimization: return `{ errors }` from a failed server action instead of throwing — throwing routes to the error boundary and loses the form data.

## Common Mistakes

- Styling off `:invalid` instead of `:user-invalid` — red borders on page load before anything was touched.
- Validating on every keystroke before the user finished typing.
- A generic catch-all error message when the specific subrule is already known server-side.
- Wiping the credit-card field because an unrelated field errored.
- `role="alert"` on a summary container that focus also moves to (double announcement).
- Per-validator resolver shims (`zodResolver`, `valibotResolver`) instead of accepting any `~standard`-compliant validator.
