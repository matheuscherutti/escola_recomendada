# Root Cause Tracing

Bugs often manifest deep in the call stack — a file created in the wrong directory, a database opened with the wrong path, a request that fails three layers away from where the bad value originated. The instinct is to fix where the error appears; that's treating a symptom.

**Core principle:** trace backward through the call chain until you find the original trigger, then fix at the source.

## When to Use

The error surfaces somewhere deep, and the code at that exact location looks correct in isolation — the bug is in what it was handed, not in what it does with it.

## The Technique

1. **Start at the error.** What value, file, or state is wrong at the point of failure?
2. **Ask "who handed me this?"** — find the caller. Is the value already wrong when it arrives, or does this function corrupt it?
3. **If already wrong on arrival, repeat one level up.** Keep walking up the call chain — don't stop at the first plausible-looking suspect.
4. **Stop when you find the place the value was first set, computed, or read incorrectly.** That's the source.
5. **Fix there, not at the symptom.** A fix applied at the symptom point will need to be re-applied at every other place that's affected by the same upstream bug.

## Example

```
Error: "file not found" at deploy.sh:42 (reading config.json)
  ↑ who called deploy.sh with this path?
build.sh:18 passes $CONFIG_DIR/config.json
  ↑ where is CONFIG_DIR set?
ci.yml sets CONFIG_DIR=./build (relative — but the runner's CWD changed in step 3)
  ↑ root cause: step 3's `cd` changed CWD before CONFIG_DIR was computed,
    so the relative path resolves from the wrong directory
```

Fixing `deploy.sh:42` to check more paths would have masked this for one script; the actual bug was in `ci.yml`'s ordering, and would have resurfaced anywhere else that reads `$CONFIG_DIR`.

## Common Mistakes

- **Stopping at the first caller** instead of asking whether ITS input was already wrong.
- **Fixing where it's convenient** (the file you're already looking at) instead of where it's correct (the actual source).
- **Assuming "that can't be it"** about an upstream step without checking — verify, don't assume.
