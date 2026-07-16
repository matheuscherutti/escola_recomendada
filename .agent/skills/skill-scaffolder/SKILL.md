---
name: skill-scaffolder
description: "Use when creating a new skill, improving an existing skill, or checking if a similar skill already exists. Triggers: 'create a skill', 'build a skill', 'new skill for X', 'make a skill', 'skill that does X', 'skill para X', 'criar uma skill', 'build me a skill', 'need a skill', 'preciso de uma skill', 'improve skill', 'melhorar skill existente', 'benchmark skill', 'skill benchmarking', 'verificar skills similares', 'reuse skill', 'reusar skill existente', 'enhance skill', 'skill scaffolding', 'skill boilerplate', 'automated skill creation'. Use this skill ALWAYS when the user mentions skill-related work — it analyzes the codebase first to avoid duplicating existing skills, generates a complete boilerplate for new skills or modifications for existing ones, and supports quantitative benchmarking via test runs."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, PowerShell, Agent
---

# Skill Scaffolder

Automated skill creation, discovery, reuse, and optimization framework.

## Overview

The Skill Scaffolder is your assistant for **everything skill-related**:
- **Discover** → Check if a similar skill already exists before building
- **Create** → Generate new skills with complete boilerplate (SKILL.md, scripts/, references/)
- **Improve** → Modify existing skills with optional benchmarking
- **Benchmark** → Run quantitative evals to measure skill effectiveness

This is faster and more systematic than manual skill authoring.

---

## Core Workflow

### Phase 1: Intent & Discovery (Automatic)

When you request a skill, the scaffolder:

1. **Parses your intent:** What should this skill do? Who uses it? When does it trigger?
2. **Scans the kit:** Searches existing skills in `.agent/skills/` to find similar or related ones
3. **Recommends reuse:** If an existing skill covers 80%+ of your use case, suggests enhancing it instead of creating a duplicate
4. **Checks naming:** Ensures the skill name is unique and follows naming conventions

**What you'll see:**
```
✅ Scanning 65 existing skills...
Found: skill-X (80% match), skill-Y (40% match)
Recommendation: Enhance skill-X instead of creating a new one
```

If you want to proceed anyway (e.g., to create a specialized variant), just say so.

---

### Phase 2: Scaffolding

**For new skills:**
- Generates folder structure: `skill-name/`, `SKILL.md`, frontmatter, `scripts/`, `references/`
- Populates templates based on skill type (orchestrator, validator, processor, reference)
- Fills in description with trigger keywords (EN + PT-BR)
- Registers in the kit index

**For existing skills:**
- Loads current skill
- Proposes targeted improvements
- Prepares optional test cases

---

### Phase 3: Optional Benchmarking

If the skill's output is objectively verifiable (code generation, data extraction, transformations):

1. **Create test cases** (2–3 examples of what the skill should handle)
2. **Run with/without skill** (baseline comparison)
3. **Grade results** (automated grading against assertions)
4. **Report metrics** (pass rate, time, tokens)

If the skill's output is subjective (writing style, design), benchmarking is optional — qualitative feedback is often enough.

---

## How to Use

### Create a New Skill

**Say this:**
```
Create a skill for X that does Y when the user says Z.
```

**You provide:**
- What the skill enables (1–2 sentences)
- When it should trigger (phrases the user might type)
- Expected input/output format
- (Optional) Test cases

**Scaffolder returns:**
- Complete skill folder structure
- SKILL.md with triggers
- Scripts template (if applicable)
- Ready to integrate

### Improve an Existing Skill

**Say this:**
```
Improve [skill-name] to handle X better.
```

**Scaffolder:**
1. Loads the skill
2. Proposes changes
3. (Optional) Runs benchmarks to measure improvement
4. Updates the skill

### Verify No Duplicates

**Say this:**
```
Is there already a skill for X?
```

**Scaffolder:**
- Scans the kit
- Reports matches + confidence level
- Suggests reuse if applicable

---

## Skill Anatomy (What Gets Generated)

```
skill-name/
├── SKILL.md
│   ├── Frontmatter (name, description, allowed-tools)
│   ├── Overview section (What this skill does & when to use)
│   ├── Core workflow (Step-by-step instructions)
│   ├── Examples (2–3 realistic test cases)
│   └── References (Pointers to bundled resources)
│
├── scripts/ (optional, for deterministic tasks)
│   ├── helper_function.py
│   └── README.md (how to invoke)
│
└── references/ (optional, for templates & docs)
    ├── template.md
    ├── schema.json
    └── README.md (what's here & why)
```

### Frontmatter Template

```yaml
---
name: skill-name
description: "When to use this skill. Triggers: 'phrase1', 'phrase2', 'phrase3', 'frase-pt1', 'frase-pt2'. Use when the user mentions X, Y, or Z — include trigger keywords prominently."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---
```

**Key rule for descriptions:**
- State **when to use** (trigger conditions), NOT what's inside
- Include trigger phrases in EN + PT-BR (user speaks both; keywords help routing)
- Be "pushy" — err on the side of over-triggering rather than under-triggering

### Example Triggers (EN + PT-BR)

```
English triggers:
  "create a skill", "build a skill", "new skill", "make a skill",
  "skill for X", "need a skill", "improve skill", "enhance skill",
  "skill that does", "skill benchmarking", "reuse skill"

Portuguese triggers:
  "criar uma skill", "construir skill", "nova skill", "fazer skill",
  "skill para X", "preciso de skill", "melhorar skill", "skill que faz",
  "skill benchmarking", "reusar skill", "skill existente"
```

---

## Bundled Scripts

The scaffolder includes optional helper scripts:

### `verify_similar_skills.py`
Searches existing skills for matches to a given intent.

```bash
python scripts/verify_similar_skills.py --intent "data extraction from PDFs"
```

**Output:**
```
Searching 65 skills for matches...
HIGH MATCH (85%): webapp-testing (has PDF handling logic)
MEDIUM MATCH (60%): i18n-localization (has file parsing)
LOW MATCH (30%): documentation-templates (mentions PDFs)
```

### `scaffold_new_skill.py`
Generates complete boilerplate for a new skill.

```bash
python scripts/scaffold_new_skill.py \
  --name "my-skill" \
  --type "processor" \
  --description "Processes X data when user says Y"
```

**Output:**
- Folder created: `.agent/skills/my-skill/`
- Files generated: `SKILL.md`, `scripts/README.md`, `references/template.md`

### `benchmark_skill.py` (Optional)
Runs test cases and compares with/without the skill.

```bash
python scripts/benchmark_skill.py \
  --skill-path ".agent/skills/my-skill" \
  --test-cases tests.json \
  --output-dir results/
```

**Output:**
- `benchmark.json` (pass rate, time, tokens)
- `benchmark.md` (human-readable summary)
- Grading results (per-test-case assertions)

---

## Workflow: From Intent to Integrated Skill

### Step 1: Clarify Intent
```
You: "I need a skill that formats commit messages."
Scaffolder: "Got it. Who uses this? When should it trigger? Any formatting rules?"
You: "Developers. Trigger: 'format my commit', 'conventional commit', 'commit message'. Rules: use Conventional Commits format."
```

### Step 2: Check for Duplicates
```
Scaffolder: "Scanning for similar skills..."
Found: documentation-templates (20% match), code-review-checklist (15% match)
Recommendation: Neither covers this fully. Creating new skill 'commit-formatter'.
```

### Step 3: Generate Boilerplate
```
Scaffolder: "Generating skill structure..."
✅ Created: .agent/skills/commit-formatter/
   ├── SKILL.md
   ├── scripts/format_commit.py
   └── references/conventional-commits.md
```

### Step 4: Review & Refine
```
You review the generated SKILL.md and scripts.
Scaffolder: "Ready to integrate? Any changes needed?"
You: "Add one more trigger: 'generate commit message'"
Scaffolder: Updates description, re-registers skill.
```

### Step 5: (Optional) Benchmark
```
You: "Can you test this with a few commits?"
Scaffolder: Runs 3 test commits (with skill vs. without), grades results.
Results: 100% pass rate, 2.3x faster with skill, +5K tokens used.
```

### Step 6: Integrate
```
Scaffolder: "Registering in .agent/skills/SKILL.md index..."
✅ Skill ready. Mention @commit-formatter to use it.
```

---

## When NOT to Create a Skill

- **Tiny one-off tasks** that don't repeat → Just do it inline
- **Existing skill covers it 90%+** → Enhance instead
- **Contradicts another skill** → Merge or clarify scope
- **No clear trigger keywords** → Too vague; needs clarification first

---

## Integration & Triggering

Once created, your skill is:

1. **Auto-discovered** by intelligent routing (keyword matching on description)
2. **Manually triggered** via `@skill-name` mention
3. **Listed** in `.agent/skills/SKILL.md` (the index)
4. **Tested** by `python .agent/scripts/doctor.py` (validates structure)

No manual registration needed — scaffolder handles it.

---

## FAQ

**Q: Can I update a skill later?**
A: Yes. Just say "Update [skill-name] to handle X better" and the scaffolder loads it, proposes changes, and re-integrates.

**Q: What if I want to benchmark my skill?**
A: Provide 2–3 test cases and the scaffolder runs them with/without your skill, measures time/tokens/pass-rate.

**Q: Can I delete a skill?**
A: Yes, but the scaffolder will warn you if other skills reference it. After deletion, run `python .agent/scripts/doctor.py` to verify.

**Q: Do I need to understand Python/YAML?**
A: No. The scaffolder generates all structure. You just review and refine the content.

**Q: How does this compare to skill-creator?**
A: **skill-creator** is for iterative refinement (test → eval → improve). **skill-scaffolder** is for fast initial generation and discovery. They complement each other — use scaffolder to bootstrap, skill-creator to iterate.

---

## What Gets Validated

After scaffolding, run this to verify everything works:

```bash
python .agent/scripts/doctor.py
```

The doctor will check:
- ✅ Skill folder exists
- ✅ SKILL.md has required frontmatter (name, description)
- ✅ Skill is registered in the index
- ✅ No naming conflicts
- ✅ Scripts are executable

---

## Skill Types (for scaffolding)

When creating a skill, specify one of these types to get the right template:

| Type | Use Case | Bundled Scripts? | Example |
|------|----------|-----------------|---------|
| **reference** | Docs, best practices, guidelines | No | `clean-code`, `karpathy-guidelines` |
| **processor** | Data transformation, code generation | Yes | `commit-formatter`, `data-validator` |
| **orchestrator** | Multi-step coordination | No | `app-builder`, `game-development` |
| **validator** | Quality checks, audits | Yes | `code-review-checklist`, `lint-and-validate` |
| **selector** | Decision framework (pick one option) | No | `stack-sizing`, `migration-strategy` |

---

## Next Steps

**Ready to create a skill?** Tell the scaffolder:
- What the skill should do
- When users would need it
- Any test cases or examples

**Ready to improve a skill?** Tell the scaffolder:
- Which skill to enhance
- What's missing or wrong
- Whether to benchmark

The scaffolder handles the rest.
