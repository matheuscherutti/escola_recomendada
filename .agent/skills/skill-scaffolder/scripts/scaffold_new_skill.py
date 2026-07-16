#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate complete boilerplate for a new skill.

Usage:
  python scaffold_new_skill.py \
    --name "commit-formatter" \
    --type "processor" \
    --description "Format commit messages following Conventional Commits standard" \
    --triggers "format commit,conventional commit,commit message"
"""

import json
import os
import sys
from pathlib import Path
from argparse import ArgumentParser
from datetime import datetime

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


SKILL_TEMPLATE = '''---
name: {name}
description: "{description} Use when: {triggers_first}. Also triggers on: {triggers_full}"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---

# {title}

{short_desc}

---

## Overview

[Describe what this skill does and when to use it. Keep it concise and focused on the WHEN, not the WHAT.]

---

## Core Workflow

### Step 1: Input & Understanding
[How users typically invoke this skill]

### Step 2: Processing
[Main logic or workflow]

### Step 3: Output
[What the skill produces]

---

## Examples

**Example 1:**
Input: [What the user provides]
Output: [What the skill produces]

**Example 2:**
Input: [Another example]
Output: [Expected output]

---

## Key Concepts

[Explain important ideas or patterns the user needs to understand]

---

## Integration Notes

- When to use this skill: [Trigger conditions]
- When NOT to use this skill: [Edge cases or alternatives]

---

## References

For more information, see:
- `references/` directory in this skill folder
- Related skills: [List any related skills]

---

## FAQ

**Q: When should I use this skill?**
A: [Answer]

**Q: What's the difference between this and [other skill]?**
A: [Answer]

---

Generated: {timestamp}
'''

SCRIPT_TEMPLATE = '''#!/usr/bin/env python3
"""
{name} helper script.

This script automates {description}.

Usage:
  python {name}.py --input <input_file> --output <output_file>
"""

import json
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="{description}")
    parser.add_argument('--input', required=True, help='Input file path')
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')

    args = parser.parse_args()

    # TODO: Implement your logic here
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"❌ Input file not found: {{input_path}}")
        return 1

    # Example: Read input
    with open(input_path) as f:
        data = json.load(f) if input_path.suffix == '.json' else f.read()

    if args.verbose:
        print(f"📥 Loaded from {{input_path}}")

    # TODO: Process data

    # Example: Write output
    with open(output_path, 'w') as f:
        if isinstance(data, dict) or isinstance(data, list):
            json.dump(data, f, indent=2)
        else:
            f.write(str(data))

    if args.verbose:
        print(f"✅ Saved to {{output_path}}")

    return 0


if __name__ == '__main__':
    exit(main())
'''

REFERENCE_TEMPLATE = '''# {name} — Reference

This directory contains reference materials, templates, and schemas for the `{name}` skill.

## Contents

- `schema.json` — Data structure reference
- `template.md` — Markdown template (if applicable)
- `examples.json` — Example inputs and outputs

## How to Use These Files

[Explain how the skill uses these references]

## Extending

To extend or modify this skill:

1. Update the relevant reference file
2. Update the main `SKILL.md` to reflect the change
3. Re-test with examples
4. Run `python .agent/scripts/doctor.py` to verify

---

Generated: {timestamp}
'''

README_TEMPLATE = '''# Scripts Directory

This directory contains executable scripts that automate tasks for the `{name}` skill.

## Available Scripts

### {name}.py
Automates {description}.

**Usage:**
```bash
python {name}.py --input <input> --output <output>
```

**Arguments:**
- `--input`: Path to input file
- `--output`: Path to output file
- `--verbose`: Enable verbose logging (optional)

## Adding More Scripts

To add a new script:
1. Create a new `.py` file in this directory
2. Add a shebang: `#!/usr/bin/env python3`
3. Include a docstring explaining its purpose
4. Update this README with usage instructions

---

Generated: {timestamp}
'''


def create_skill_directory(skill_name, skill_type='reference'):
    """Create skill directory structure"""
    skills_dir = Path('.agent/skills')
    skill_dir = skills_dir / skill_name

    if skill_dir.exists():
        print(f"❌ Skill '{skill_name}' already exists at {skill_dir}")
        return None

    try:
        skill_dir.mkdir(parents=True, exist_ok=True)

        # Create subdirectories based on type
        if skill_type in ['processor', 'validator']:
            (skill_dir / 'scripts').mkdir(exist_ok=True)

        if skill_type != 'reference':
            (skill_dir / 'references').mkdir(exist_ok=True)

        print(f"✅ Created directory: {skill_dir}")
        return skill_dir

    except Exception as e:
        print(f"❌ Error creating directory: {e}")
        return None


def generate_skill_md(skill_dir, name, title, description, triggers_list):
    """Generate SKILL.md file"""
    triggers_str = ', '.join([f'"{t}"' for t in triggers_list[:3]])
    all_triggers = ', '.join([f'"{t}"' for t in triggers_list])

    content = SKILL_TEMPLATE.format(
        name=name,
        title=title,
        description=description,
        short_desc=description,
        triggers_first=triggers_list[0] if triggers_list else 'user mentions this skill',
        triggers_full=all_triggers,
        timestamp=datetime.now().isoformat()
    )

    skill_md = skill_dir / 'SKILL.md'
    skill_md.write_text(content, encoding='utf-8')
    print(f"OK: Generated: {skill_md}")


def generate_script(skill_dir, name, description):
    """Generate helper script (for processor/validator skills)"""
    script_file = skill_dir / 'scripts' / f'{name}.py'
    content = SCRIPT_TEMPLATE.format(name=name, description=description)
    script_file.write_text(content, encoding='utf-8')
    try:
        script_file.chmod(0o755)
    except:
        pass  # Windows doesn't support chmod
    print(f"OK: Generated: {script_file}")

    # Generate README for scripts
    readme = skill_dir / 'scripts' / 'README.md'
    readme.write_text(README_TEMPLATE.format(
        name=name,
        description=description,
        timestamp=datetime.now().isoformat()
    ), encoding='utf-8')
    print(f"OK: Generated: {readme}")


def generate_references(skill_dir, name, skill_type):
    """Generate reference files"""
    if skill_type == 'reference':
        return

    ref_dir = skill_dir / 'references'
    if not ref_dir.exists():
        return

    # Generate README
    readme = ref_dir / 'README.md'
    readme.write_text(REFERENCE_TEMPLATE.format(
        name=name,
        timestamp=datetime.now().isoformat()
    ), encoding='utf-8')
    print(f"OK: Generated: {readme}")

    # Generate schema template
    schema_file = ref_dir / 'schema.json'
    schema = {
        'description': f'Data schema for {name} skill',
        'version': '1.0.0',
        'properties': {
            'example_property': {
                'type': 'string',
                'description': 'Replace with actual properties'
            }
        }
    }
    schema_file.write_text(json.dumps(schema, indent=2), encoding='utf-8')
    print(f"OK: Generated: {schema_file}")


def main():
    parser = ArgumentParser(description="Scaffold a new skill with complete boilerplate")
    parser.add_argument('--name', required=True, help='Skill name (kebab-case)')
    parser.add_argument('--title', help='Skill title (defaults to title-cased name)')
    parser.add_argument('--type', default='reference',
                       choices=['reference', 'processor', 'validator', 'orchestrator', 'selector'],
                       help='Skill type')
    parser.add_argument('--description', required=True, help='What the skill does')
    parser.add_argument('--triggers', help='Trigger phrases (comma-separated)')

    args = parser.parse_args()

    # Validate skill name (kebab-case)
    if not all(c.isalnum() or c == '-' for c in args.name):
        print(f"❌ Skill name must be kebab-case: {args.name}")
        return 1

    if args.name.startswith('-') or args.name.endswith('-'):
        print(f"❌ Skill name cannot start or end with dash: {args.name}")
        return 1

    title = args.title or args.name.replace('-', ' ').title()
    triggers = [t.strip() for t in args.triggers.split(',')] if args.triggers else [args.name]

    print(f"\n🔨 Scaffolding skill: '{args.name}'")
    print(f"   Type: {args.type}")
    print(f"   Title: {title}")
    print(f"   Triggers: {', '.join(triggers)}\n")

    # Create directories
    skill_dir = create_skill_directory(args.name, args.type)
    if not skill_dir:
        return 1

    # Generate files
    generate_skill_md(skill_dir, args.name, title, args.description, triggers)

    if args.type in ['processor', 'validator']:
        generate_script(skill_dir, args.name, args.description)

    generate_references(skill_dir, args.name, args.type)

    print(f"\n✅ Skill scaffolded successfully!")
    print(f"   Location: {skill_dir}")
    print(f"\n📝 Next steps:")
    print(f"   1. Review and customize SKILL.md")
    print(f"   2. Add content to references/ (if needed)")
    print(f"   3. Implement scripts/ (if needed)")
    print(f"   4. Run: python .agent/scripts/doctor.py")
    print(f"   5. Mention @{args.name} to use it")

    return 0


if __name__ == '__main__':
    exit(main())
