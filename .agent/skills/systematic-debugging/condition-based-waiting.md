# Condition-Based Waiting

Arbitrary timeouts (`sleep(2)`, `setTimeout(fn, 500)`) are a frequent root cause of intermittent test failures and race conditions: too short and the test is flaky under load, too long and the suite is slow, and either way the wait doesn't actually track the thing it's waiting for.

**Core principle:** wait for the specific condition that proves readiness, not for a guessed duration.

## When to Use

- A test or script fails intermittently, especially under CI load or on slower machines, and the fix attempted so far was "increase the timeout."
- Code waits for an async operation, a file to appear, a server to start, or a UI element to render, using a fixed delay.

## The Technique

Replace the fixed delay with a poll loop that checks the actual condition:

```javascript
// Before: arbitrary timeout, flaky under load
await sleep(2000);
const result = readFile('output.json');

// After: poll the actual condition, bounded by a timeout as a safety net only
async function waitFor(conditionFn, { timeoutMs = 5000, intervalMs = 50 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = conditionFn();
    if (result) return result;
    await sleep(intervalMs);
  }
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

const result = await waitFor(() => fs.existsSync('output.json') && readFile('output.json'));
```

The timeout in the second version is a safety net against a genuinely stuck process, not the mechanism that decides when to proceed — the loop proceeds as soon as the real condition is true, whether that takes 10ms or 4 seconds.

## What Counts as a Condition

- A file existing, or existing with a specific minimum size/content.
- An HTTP endpoint returning 200 instead of connection-refused.
- A specific log line appearing.
- A promise resolving, an event firing, a DOM element matching a selector.

If there's no way to observe the real condition (the system genuinely gives no signal), that's worth fixing upstream — add a signal (a log line, a healthcheck endpoint, a callback) rather than guessing a duration.

## Common Mistakes

- "Just increase the timeout" as the fix — treats the symptom; the race condition is still there, just less likely to show under the conditions you tested.
- Polling too aggressively (no `intervalMs` delay) — turns the wait into a busy-loop that can itself slow down the thing it's waiting for.
- No upper bound at all — a genuinely stuck process then hangs the whole run instead of failing with a clear "condition not met" error.
