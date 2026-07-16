# Defense in Depth

After fixing a root cause, decide whether validation at additional layers would have caught the bug sooner, or would catch a similar future bug before it reaches the layer that just broke.

**Core principle:** the fix addresses this instance; a second layer of validation addresses the next one. Add the second layer only after the root cause is actually fixed — never as a substitute for finding it.

## When to Add a Layer

- The bad value crossed a trust boundary (network, file system, another team's service, user input) before causing the failure — validating at the boundary would have caught it immediately instead of three calls later.
- The same class of bug is plausible elsewhere in the codebase (the same pattern, copied or re-implemented).
- The cost of validating is small relative to the cost of the failure mode (e.g., a null check at a function's entry vs. a silent data-corruption bug three services downstream).

## When NOT to Add a Layer

- The root cause is fully fixed and the failure mode genuinely cannot recur through any other path — an extra check here is just dead code padding, not defense.
- Adding the check requires speculative handling for an input shape that can't actually occur given the type system or the caller's guarantees.

This is `lean-code-ladder`'s territory too: defense in depth is not a license to validate everything everywhere "just in case" — it's targeted, one layer closer to the trust boundary than where the bug was caught, justified by a concrete recurrence risk.

## Example

A bug: a negative quantity reached the inventory-decrement function and underflowed a counter. Root cause: the order-form validation only checked quantity was a number, not that it was positive.

- **Fix (root cause):** add a positive-number check in the order form's validation.
- **Second layer (defense in depth):** also guard the inventory-decrement function itself against negative input, since it's called from at least one other code path (an internal admin tool) that doesn't go through the order form's validation at all.

The second layer isn't redundant here — it covers an entry point the first fix doesn't reach.

## Common Mistakes

- Adding the second layer instead of fixing the root cause (treats the symptom, the bug still exists at the source).
- Adding validation at every layer "to be safe" regardless of whether another path can actually reach that state.
