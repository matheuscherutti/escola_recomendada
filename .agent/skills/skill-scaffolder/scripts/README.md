# Skill Scaffolder Scripts

Automated tools for discovering, creating, and benchmarking skills.

## Quick Start

### 1. Discover Similar Skills

Before creating a new skill, check if something similar already exists:

```bash
python verify_similar_skills.py --intent "extract data from PDFs"
```

Output:
```
✅ Found 65 skills.

🔎 Finding skills similar to: 'extract data from PDFs'

🔴 1. webapp-testing (82%)
   E2E testing strategies, Playwright, deep audit capabilities...
   Path: .agent/skills/webapp-testing

💡 RECOMMENDATION: Skill 'webapp-testing' is a very close match (82%).
```

**Options:**
- `--intent TEXT` — What you want to build
- `--skill-name TEXT` — Proposed name (checks for conflicts)
- `--threshold FLOAT` — Similarity threshold (default: 0.3)
- `--json` — Output results as JSON

---

### 2. Create a New Skill

Generate complete boilerplate for a new skill:

```bash
python scaffold_new_skill.py \
  --name "commit-formatter" \
  --type "processor" \
  --description "Format commit messages following Conventional Commits standard" \
  --triggers "format commit,conventional commit,commit message"
```

Output:
```
🔨 Scaffolding skill: 'commit-formatter'
   Type: processor
   Title: Commit Formatter
   Triggers: format commit, conventional commit, commit message

✅ Created directory: .agent/skills/commit-formatter/
✅ Generated: .agent/skills/commit-formatter/SKILL.md
✅ Generated: .agent/skills/commit-formatter/scripts/commit-formatter.py
✅ Generated: .agent/skills/commit-formatter/scripts/README.md
✅ Generated: .agent/skills/commit-formatter/references/README.md
✅ Generated: .agent/skills/commit-formatter/references/schema.json

✅ Skill scaffolded successfully!
   Location: .agent/skills/commit-formatter/

📝 Next steps:
   1. Review and customize SKILL.md
   2. Add content to references/ (if needed)
   3. Implement scripts/ (if needed)
   4. Run: python .agent/scripts/doctor.py
   5. Mention @commit-formatter to use it
```

**Skill Types:**
- `reference` — Docs, best practices (no scripts)
- `processor` — Data transformation (includes script template)
- `validator` — Quality checks, audits (includes script template)
- `orchestrator` — Multi-step coordination
- `selector` — Decision framework

**Options:**
- `--name TEXT` (required) — Skill name in kebab-case
- `--type CHOICE` — Skill type (default: reference)
- `--title TEXT` — Skill title (auto-generated from name if omitted)
- `--description TEXT` (required) — What the skill does
- `--triggers TEXT` — Comma-separated trigger phrases

---

### 3. Benchmark a Skill

Measure if a skill actually improves performance:

```bash
python benchmark_skill.py \
  --skill-path ".agent/skills/commit-formatter" \
  --test-cases tests.json \
  --output-dir results/
```

**Test Cases Format** (JSON):
```json
{
  "skill": "commit-formatter",
  "test_cases": [
    {
      "id": 1,
      "name": "basic-formatting",
      "input": "Add new feature to login system",
      "expected_output": "feat(auth): add new feature to login system",
      "assertions": [
        {"name": "has-type", "description": "Commit should have type prefix"},
        {"name": "has-scope", "description": "Commit should have scope"}
      ]
    }
  ]
}
```

**Output:**
```
   [1/3] Running: basic-formatting
      With skill: PASS (15.2ms)
      Without skill: PASS (32.4ms)

📊 Benchmark Summary
   With Skill:    3/3 passed, 16.4ms avg
   Without Skill: 3/3 passed, 31.2ms avg
   Speed Improvement: +51.3%
   Accuracy Improvement: +0.0%

✅ Benchmark complete!
   View results: results/benchmark.md
```

**Options:**
- `--skill-path TEXT` — Path to skill directory
- `--skill-name TEXT` — Skill name (if path not provided)
- `--test-cases TEXT` (required) — JSON file with test cases
- `--output-dir TEXT` — Where to save results (default: results/)
- `--verbose` — Detailed output

---

## Complete Workflow

### Create a new skill from scratch:

```bash
# Step 1: Check if something similar exists
python verify_similar_skills.py --intent "validate email addresses"

# Step 2: Create the skill
python scaffold_new_skill.py \
  --name "email-validator" \
  --type "validator" \
  --description "Validate and normalize email addresses" \
  --triggers "validate email,check email,email validation"

# Step 3: Customize the generated files
# Edit: .agent/skills/email-validator/SKILL.md
# Edit: .agent/skills/email-validator/scripts/email-validator.py
# Edit: .agent/skills/email-validator/references/schema.json

# Step 4: Run tests (optional)
python benchmark_skill.py \
  --skill-path ".agent/skills/email-validator" \
  --test-cases my_tests.json

# Step 5: Verify the kit
python .agent/scripts/doctor.py

# Step 6: Use the skill
# Mention @email-validator to activate it
```

### Update an existing skill:

```bash
# 1. Check what similar skills exist
python verify_similar_skills.py --skill-name "my-skill"

# 2. Make changes to the skill files
# Edit: .agent/skills/my-skill/SKILL.md

# 3. Test with benchmarks (optional)
python benchmark_skill.py \
  --skill-path ".agent/skills/my-skill" \
  --test-cases updated_tests.json

# 4. Verify
python .agent/scripts/doctor.py
```

---

## Key Concepts

### Similarity Scoring

The `verify_similar_skills.py` script uses fuzzy matching to find related skills:
- **90%+**: Exact or near-duplicate; consider merging
- **70-90%**: Very similar; check before creating new skill
- **50-70%**: Related; might complement each other
- **Below 50%**: Not related; safe to create new skill

### Triggers

Triggers are phrases users might type to use your skill. Include:
- **English variants**: "create", "build", "make", "new"
- **Portuguese variants**: "criar", "construir", "fazer", "nova"
- **Specific keywords**: Feature names, domain terms
- **Synonyms**: Alternative phrasings

Example triggers for a PDF tool:
```
"extract from PDF", "read PDF", "parse PDF", "PDF data",
"extrair PDF", "ler PDF", "analisar PDF"
```

### Skill Types & Templates

| Type | When to Use | Example |
|------|-------------|---------|
| **reference** | Best practices, docs, guidelines | `clean-code`, `karpathy-guidelines` |
| **processor** | Transform data, generate code | `commit-formatter`, `markdown-converter` |
| **validator** | Quality checks, audits | `code-review-checklist`, `lint-runner` |
| **orchestrator** | Coordinate multiple steps | `app-builder`, `deployment-workflow` |
| **selector** | Choose between options | `stack-sizing`, `framework-picker` |

---

## Troubleshooting

### "Skill already exists"
```bash
python verify_similar_skills.py --skill-name "my-new-skill"
# Use a different name if it suggests a conflict
```

### "No skills found"
Make sure you're in the DevBureau root directory (where `.agent/` exists).

### "doctor.py fails after creating skill"
Run the doctor to see what's wrong:
```bash
python .agent/scripts/doctor.py
```

Common issues:
- Missing frontmatter in SKILL.md
- Skill name doesn't match folder name
- Scripts aren't executable

### "Benchmark results don't look right"
Make sure your test cases are well-defined:
```json
{
  "expected_output": "What the skill SHOULD produce"
}
```

---

## Integration with DevBureau

After creating a skill:

1. **Auto-discovered**: Matches trigger phrases from description
2. **Manual activation**: Mention `@skill-name` to use it
3. **Validated**: `python .agent/scripts/doctor.py` checks structure
4. **Indexed**: `.agent/skills/SKILL.md` tracks all skills

No manual registration needed — scaffolder handles it.

---

## Performance Tips

- **Large skill sets**: Use `--threshold 0.5` to filter noise
- **Iterative benchmarking**: Start with 2–3 test cases, expand later
- **Test case quality**: Well-written assertions lead to better insights

---

## Examples

### Example 1: Create a data transformation skill

```bash
python scaffold_new_skill.py \
  --name "csv-normalizer" \
  --type "processor" \
  --description "Normalize and clean CSV data" \
  --triggers "clean CSV,normalize data,fix CSV"
```

### Example 2: Check if we need a logging utility

```bash
python verify_similar_skills.py --intent "structured logging utility"
```

### Example 3: Benchmark a new skill

```bash
python benchmark_skill.py \
  --skill-path ".agent/skills/new-skill" \
  --test-cases evals/test_cases.json \
  --output-dir benchmarks/iteration-1
```

---

Generated: 2026-07-02
