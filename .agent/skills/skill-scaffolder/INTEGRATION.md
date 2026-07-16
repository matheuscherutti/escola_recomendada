# Skill Scaffolder — Integration Guide

## Automatic Triggering

The `skill-scaffolder` is automatically triggered when you mention ANY of these phrases (EN or PT-BR):

### English Triggers
- "create a skill"
- "build a skill"
- "new skill"
- "make a skill"
- "skill for X"
- "skill that does"
- "improve a skill"
- "enhance skill"
- "skill benchmarking"
- "benchmark a skill"
- "verify skills"
- "check if skill exists"
- "reuse skill"
- "skill scaffolding"

### Portuguese Triggers
- "criar uma skill"
- "criar skill"
- "construir skill"
- "nova skill"
- "fazer skill"
- "skill para"
- "skill que faz"
- "melhorar skill"
- "skill existente"
- "benchmark de skill"
- "verificar skills"
- "reusar skill"
- "scaffold de skill"

## How It Works

### Phase 1: Automatic Discovery
When you request a skill, the scaffolder automatically:
1. Scans all 66 existing skills
2. Finds similar ones by fuzzy matching
3. Recommends reuse if there's 70%+ match
4. Suggests creating new if appropriate

### Phase 2: Scaffolding
Generates complete structure:
```
your-skill/
├── SKILL.md               (auto-filled frontmatter + template)
├── scripts/               (if processor/validator type)
│   ├── your-skill.py      (function template)
│   └── README.md          (how to use)
└── references/            (if not reference type)
    ├── README.md
    └── schema.json
```

### Phase 3: Optional Benchmarking
If you provide test cases, runs:
- With-skill tests
- Without-skill tests (baseline)
- Grades results (pass/fail)
- Measures time & tokens

## Activation Paths

### Path 1: Mention @skill-scaffolder explicitly
```
@skill-scaffolder create a skill for X
```

### Path 2: Use trigger keywords
```
I need to create a skill that validates emails
```
→ Scaffolder auto-activates

### Path 3: Combine with other agents
```
@orchestrator I need a new skill for X and implement it
```
→ Orchestrator routes to scaffolder first

## Integration with Intelligent Routing

The `skill-scaffolder` is part of DevBureau's intelligent routing system:

1. **Analysis**: Your request is analyzed for skill-related keywords
2. **Auto-selection**: If skill-creation is detected, scaffolder activates
3. **Discovery**: Scans existing skills before proceeding
4. **Recommendation**: Suggests best path (create new / enhance existing / reuse)

No manual agent selection needed — the system figures it out.

## Workflow Example

**User says:**
```
I want to create a skill for formatting git commit messages
```

**Scaffolder automatically:**
1. Scans for similar skills → finds `code-review-checklist` (20% match)
2. Recommends: "Not a close match. Creating new skill is appropriate."
3. Asks for clarification: "Should this trigger on 'format commit', 'conventional commit', etc.?"
4. Generates boilerplate at `.agent/skills/commit-formatter/`
5. Asks: "Ready to test with benchmarks?"
6. Updates kit index and validates with `doctor.py`

**User mentions:**
```
@skill-scaffolder also add a processor function
```

**Scaffolder:**
1. Loads existing skill
2. Enhances with processor function
3. Runs optional benchmarks
4. Re-validates kit

## Testing Your Skill

After scaffolding:

```bash
# Validate structure
python .agent/scripts/doctor.py

# Test the skill's discovery/triggering
python .agent/skills/skill-scaffolder/scripts/verify_similar_skills.py \
  --skill-name "your-skill"

# Benchmark (if applicable)
python .agent/skills/skill-scaffolder/scripts/benchmark_skill.py \
  --skill-path ".agent/skills/your-skill" \
  --test-cases tests.json
```

## Deletion & Cleanup

To delete a skill safely:

```bash
rm -r .agent/skills/skill-name/
python .agent/scripts/doctor.py  # Validates removal
```

Doctor will warn if other skills reference the deleted one.

## Performance Tips

- **Faster discovery**: Use `--threshold 0.5` to filter noise
- **Iterative creation**: Start simple, enhance incrementally
- **Benchmarking**: 2–3 test cases sufficient for initial validation

## FAQ

**Q: Can I trigger scaffolder without using exact phrases?**
A: Yes — the intelligent routing system does fuzzy keyword matching. Say anything related to "creating/improving skills" and it should activate.

**Q: What if I want a skill that doesn't fit the template?**
A: Edit the generated SKILL.md directly. Templates are just starting points.

**Q: Can benchmarks run real Claude API calls?**
A: Current version simulates runs. For real benchmarking, use `skill-creator` workflow instead.

**Q: Will my skill be auto-registered?**
A: Yes — scaffolder updates `.agent/skills/` and you can immediately mention `@skill-name`.

## Next Steps

1. **Create a skill** → Use any trigger keyword above
2. **Browse examples** → Check `.agent/skills/*/SKILL.md` for patterns
3. **Iterate** → Use benchmarks to measure improvements
4. **Share** → Skills are ready to use immediately after creation

---

**Ready to create your first skill?**

Just say: _"I need a skill for X"_ and let the scaffolder handle the rest.
