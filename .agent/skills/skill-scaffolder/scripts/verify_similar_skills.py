#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verify and discover similar skills in the DevBureau kit.

Usage:
  python verify_similar_skills.py --intent "extract data from PDFs"
  python verify_similar_skills.py --skill-name "my-skill"
"""

import json
import os
import sys
from pathlib import Path
from difflib import SequenceMatcher
from argparse import ArgumentParser

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def load_skill_index():
    """Load all skills from .agent/skills/"""
    skills = {}
    skills_dir = Path(".agent/skills")

    if not skills_dir.exists():
        print("❌ .agent/skills/ not found. Are you in the DevBureau root?")
        return {}

    for skill_folder in skills_dir.iterdir():
        if not skill_folder.is_dir():
            continue

        skill_md = skill_folder / "SKILL.md"
        if not skill_md.exists():
            continue

        try:
            content = skill_md.read_text(encoding='utf-8', errors='ignore')
            # Extract name and description from frontmatter
            lines = content.split('\n')
            metadata = {}
            in_frontmatter = False

            for line in lines:
                if line.strip() == '---':
                    if not in_frontmatter:
                        in_frontmatter = True
                    else:
                        break
                elif in_frontmatter and ':' in line:
                    key, value = line.split(':', 1)
                    metadata[key.strip()] = value.strip().strip('"\'')

            if 'name' in metadata and 'description' in metadata:
                skills[metadata['name']] = {
                    'name': metadata['name'],
                    'description': metadata['description'],
                    'path': str(skill_folder),
                    'full_content': content
                }
        except Exception as e:
            print(f"⚠️  Error reading {skill_folder.name}: {e}")

    return skills


def similarity_score(text1, text2):
    """Calculate similarity between two texts (0-1)"""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()


def find_similar_skills(intent, skills, threshold=0.3):
    """Find skills similar to the given intent"""
    if not skills:
        return []

    matches = []
    intent_lower = intent.lower()

    for skill_name, skill_data in skills.items():
        desc = skill_data['description'].lower()
        name_score = similarity_score(intent_lower, skill_name)
        desc_score = similarity_score(intent_lower, desc)
        combined_score = (name_score * 0.3) + (desc_score * 0.7)

        if combined_score >= threshold:
            matches.append({
                'name': skill_name,
                'description': skill_data['description'][:100] + '...',
                'score': round(combined_score * 100, 0),
                'path': skill_data['path']
            })

    return sorted(matches, key=lambda x: x['score'], reverse=True)


def check_naming_conflict(skill_name, skills):
    """Check if skill name already exists or is similar"""
    if skill_name in skills:
        return {'conflict': True, 'reason': 'Exact match', 'existing': skill_name}

    for existing_name in skills.keys():
        score = similarity_score(skill_name, existing_name)
        if score > 0.7:
            return {'conflict': True, 'reason': 'Similar name', 'existing': existing_name, 'score': score}

    return {'conflict': False}


def main():
    parser = ArgumentParser(description="Discover similar skills or check naming conflicts")
    parser.add_argument('--intent', help='Intent description (e.g., "extract data from PDFs")')
    parser.add_argument('--skill-name', help='Proposed skill name to check for conflicts')
    parser.add_argument('--threshold', type=float, default=0.3, help='Similarity threshold (0-1)')
    parser.add_argument('--json', action='store_true', help='Output as JSON')

    args = parser.parse_args()

    if not args.intent and not args.skill_name:
        parser.print_help()
        return

    print("🔍 Scanning 65 skills in .agent/skills/...\n")
    skills = load_skill_index()

    if not skills:
        print("❌ No skills found. Check that .agent/skills/ exists.")
        return

    print(f"✅ Found {len(skills)} skills.\n")

    results = {
        'skills_scanned': len(skills),
        'matches': [],
        'naming_conflict': None
    }

    # Check naming conflict first
    if args.skill_name:
        print(f"📋 Checking naming for: '{args.skill_name}'")
        conflict = check_naming_conflict(args.skill_name, skills)

        if conflict['conflict']:
            print(f"⚠️  CONFLICT: {conflict['reason']} with '{conflict['existing']}'")
            if 'score' in conflict:
                print(f"   Similarity score: {round(conflict['score']*100, 0)}%")
        else:
            print(f"✅ No naming conflicts found.\n")

        results['naming_conflict'] = conflict

    # Find similar skills
    if args.intent:
        print(f"🔎 Finding skills similar to: '{args.intent}'\n")
        matches = find_similar_skills(args.intent, skills, threshold=args.threshold)

        if matches:
            for i, match in enumerate(matches, 1):
                icon = "🔴" if match['score'] > 80 else "🟡" if match['score'] > 50 else "🟢"
                print(f"{icon} {i}. {match['name']} ({match['score']}%)")
                print(f"   {match['description']}")
                print(f"   Path: {match['path']}\n")

            results['matches'] = matches

            # Recommendation
            if matches[0]['score'] > 80:
                print(f"\n💡 RECOMMENDATION: Skill '{matches[0]['name']}' is a very close match ({matches[0]['score']}%).")
                print(f"   Consider enhancing it instead of creating a new skill.")
            elif matches[0]['score'] > 50:
                print(f"\n💡 RECOMMENDATION: Skill '{matches[0]['name']}' is partially relevant ({matches[0]['score']}%).")
                print(f"   Check if it covers your use case before creating a new skill.")
        else:
            print(f"✅ No similar skills found. Creating a new skill is appropriate.\n")

    if args.json:
        print("\n" + json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
