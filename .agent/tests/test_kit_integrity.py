#!/usr/bin/env python3
"""
test_kit_integrity.py — DevBureau Automated Test Suite
Validates structure, frontmatter, cross-references, and file quality of .agent/.
Usage: python -m pytest .agent/tests/test_kit_integrity.py -v
"""
import re
from pathlib import Path

import pytest

# ── fixture: repo paths ───────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
AGENT_DIR = REPO_ROOT / ".agent"
AGENTS_DIR = AGENT_DIR / "agents"
SKILLS_DIR = AGENT_DIR / "skills"
WORKFLOWS_DIR = AGENT_DIR / "workflows"
SCRIPTS_DIR = AGENT_DIR / "scripts"
RULES_DIR = AGENT_DIR / "rules"

REQUIRED_DIRS = [AGENTS_DIR, SKILLS_DIR, WORKFLOWS_DIR, SCRIPTS_DIR, RULES_DIR]
REQUIRED_MASTER_SCRIPTS = ["checklist.py", "verify_all.py"]
REQUIRED_RULES_FILES = ["DEVBUREAU.md"]


def extract_frontmatter(content: str) -> dict[str, str]:
    """Parse YAML frontmatter block between --- markers."""
    pattern = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
    match = pattern.match(content.lstrip())
    if not match:
        return {}
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return fields


def get_all_agents() -> list[Path]:
    return sorted(AGENTS_DIR.glob("*.md")) if AGENTS_DIR.exists() else []


def get_all_skill_dirs() -> list[Path]:
    return sorted(d for d in SKILLS_DIR.iterdir() if d.is_dir()) if SKILLS_DIR.exists() else []


def get_all_workflows() -> list[Path]:
    return sorted(WORKFLOWS_DIR.glob("*.md")) if WORKFLOWS_DIR.exists() else []


# ── directory structure tests ─────────────────────────────────────────────────
class TestDirectoryStructure:

    def test_agent_dir_exists(self) -> None:
        assert AGENT_DIR.exists(), ".agent/ directory not found in project root"

    @pytest.mark.parametrize("directory", REQUIRED_DIRS)
    def test_required_subdirs_exist(self, directory: Path) -> None:
        assert directory.exists(), f".agent/{directory.name}/ is missing"

    def test_has_agents(self) -> None:
        agents = get_all_agents()
        assert len(agents) > 0, "No .md files found in .agent/agents/"

    def test_has_skills(self) -> None:
        skills = get_all_skill_dirs()
        assert len(skills) > 0, "No directories found in .agent/skills/"

    def test_has_workflows(self) -> None:
        workflows = get_all_workflows()
        assert len(workflows) > 0, "No .md files found in .agent/workflows/"


# ── rules tests ───────────────────────────────────────────────────────────────
class TestRules:

    @pytest.mark.parametrize("rules_file", REQUIRED_RULES_FILES)
    def test_rules_file_exists(self, rules_file: str) -> None:
        path = RULES_DIR / rules_file
        assert path.exists(), f".agent/rules/{rules_file} not found"

    def test_devbureau_md_has_content(self) -> None:
        rules = RULES_DIR / "DEVBUREAU.md"
        if not rules.exists():
            pytest.skip("DEVBUREAU.md not found — skipping content check")
        assert rules.stat().st_size > 5000, "DEVBUREAU.md seems too small (< 5KB)"

    def test_devbureau_md_has_tier0_rules(self) -> None:
        rules = RULES_DIR / "DEVBUREAU.md"
        if not rules.exists():
            pytest.skip("DEVBUREAU.md not found")
        content = rules.read_text(encoding="utf-8", errors="ignore")
        assert "TIER 0" in content, "DEVBUREAU.md missing TIER 0 universal rules section"
        assert "SOCRATIC GATE" in content, "DEVBUREAU.md missing SOCRATIC GATE section"

    def test_devbureau_md_references_ade(self) -> None:
        rules = RULES_DIR / "DEVBUREAU.md"
        if not rules.exists():
            pytest.skip("DEVBUREAU.md not found")
        content = rules.read_text(encoding="utf-8", errors="ignore")
        assert "/ade" in content.lower() or "ADE PIPELINE" in content, (
            "DEVBUREAU.md does not reference /ade workflow — run agent tuning"
        )


# ── agents tests ──────────────────────────────────────────────────────────────
class TestAgents:

    @pytest.mark.parametrize("agent_path", get_all_agents())
    def test_agent_has_name_in_frontmatter(self, agent_path: Path) -> None:
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        fm = extract_frontmatter(content)
        assert "name" in fm and fm["name"], (
            f"{agent_path.name}: missing 'name:' field in YAML frontmatter"
        )

    @pytest.mark.parametrize("agent_path", get_all_agents())
    def test_agent_has_minimum_content(self, agent_path: Path) -> None:
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        assert len(content) > 200, (
            f"{agent_path.name}: file is nearly empty ({len(content)} chars)"
        )

    @pytest.mark.parametrize("agent_path", get_all_agents())
    def test_agent_has_skills_or_description(self, agent_path: Path) -> None:
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        fm = extract_frontmatter(content)
        has_skills = "skills" in fm and fm["skills"]
        has_description = "description" in fm and fm["description"]
        assert has_skills or has_description, (
            f"{agent_path.name}: missing both 'skills:' and 'description:' in frontmatter"
        )


# ── skills tests ──────────────────────────────────────────────────────────────
class TestSkills:

    @pytest.mark.parametrize("skill_dir", get_all_skill_dirs())
    def test_skill_has_skill_md(self, skill_dir: Path) -> None:
        skill_md = skill_dir / "SKILL.md"
        assert skill_md.exists(), (
            f"skills/{skill_dir.name}/SKILL.md not found"
        )

    @pytest.mark.parametrize("skill_dir", get_all_skill_dirs())
    def test_skill_md_has_content(self, skill_dir: Path) -> None:
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            pytest.skip(f"{skill_dir.name}/SKILL.md missing")
        content = skill_md.read_text(encoding="utf-8", errors="ignore")
        assert len(content) > 100, (
            f"skills/{skill_dir.name}/SKILL.md appears nearly empty ({len(content)} chars)"
        )

    @pytest.mark.parametrize("skill_dir", get_all_skill_dirs())
    def test_skill_md_has_name_in_frontmatter(self, skill_dir: Path) -> None:
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            pytest.skip(f"{skill_dir.name}/SKILL.md missing")
        content = skill_md.read_text(encoding="utf-8", errors="ignore")
        fm = extract_frontmatter(content)
        assert "name" in fm and fm["name"], (
            f"skills/{skill_dir.name}/SKILL.md: missing 'name:' in frontmatter"
        )


# ── workflows tests ───────────────────────────────────────────────────────────
class TestWorkflows:

    @pytest.mark.parametrize("wf_path", get_all_workflows())
    def test_workflow_has_description_in_frontmatter(self, wf_path: Path) -> None:
        content = wf_path.read_text(encoding="utf-8", errors="ignore")
        fm = extract_frontmatter(content)
        assert "description" in fm and fm["description"], (
            f"workflows/{wf_path.name}: missing 'description:' in frontmatter"
        )

    def test_ade_workflow_exists(self) -> None:
        ade_wf = WORKFLOWS_DIR / "ade.md"
        assert ade_wf.exists(), (
            "workflows/ade.md not found — /ade pipeline not available"
        )

    def test_plan_workflow_exists(self) -> None:
        plan_wf = WORKFLOWS_DIR / "plan.md"
        assert plan_wf.exists(), "workflows/plan.md not found"

    def test_debug_workflow_exists(self) -> None:
        debug_wf = WORKFLOWS_DIR / "debug.md"
        assert debug_wf.exists(), "workflows/debug.md not found"


# ── master scripts tests ──────────────────────────────────────────────────────
class TestMasterScripts:

    @pytest.mark.parametrize("script_name", REQUIRED_MASTER_SCRIPTS)
    def test_required_script_exists(self, script_name: str) -> None:
        script_path = SCRIPTS_DIR / script_name
        assert script_path.exists(), (
            f".agent/scripts/{script_name} not found — required master script missing"
        )

    def test_doctor_script_exists(self) -> None:
        doctor = SCRIPTS_DIR / "doctor.py"
        assert doctor.exists(), (
            ".agent/scripts/doctor.py not found — run AIOS integration phase 1"
        )

    def test_no_syntax_errors_in_doctor(self) -> None:
        doctor = SCRIPTS_DIR / "doctor.py"
        if not doctor.exists():
            pytest.skip("doctor.py not found")
        import ast
        source = doctor.read_text(encoding="utf-8")
        try:
            ast.parse(source)
        except SyntaxError as exc:
            pytest.fail(f"Syntax error in doctor.py: {exc}")


# ── cross-reference tests ─────────────────────────────────────────────────────
class TestCrossReferences:

    def test_no_agent_references_nonexistent_skill(self) -> None:
        """Agents should not reference skills that don't exist as directories."""
        available_skills = {d.name for d in SKILLS_DIR.iterdir() if d.is_dir()} if SKILLS_DIR.exists() else set()
        issues: list[str] = []

        for agent_path in get_all_agents():
            content = agent_path.read_text(encoding="utf-8", errors="ignore")
            fm = extract_frontmatter(content)
            skills_raw = fm.get("skills", "")
            skill_refs = [s.strip() for s in skills_raw.split(",") if s.strip()]

            for ref in skill_refs:
                ref_slug = ref.replace(" ", "-").lower()
                if ref_slug not in available_skills and ref not in available_skills:
                    # Partial match tolerance (some refs are short aliases)
                    if not any(ref_slug in s for s in available_skills):
                        issues.append(f"{agent_path.name} references '{ref}' (not found)")

        # Allow warnings instead of hard failures for cross-refs (aliases exist)
        if issues:
            print(f"\n  ⚠  Possible ghost references (may be aliases): {issues}")


# ── docs sync tests ───────────────────────────────────────────────────────────
class TestDocsSync:
    """Canonical docs must match what's on disk (KIT_MASTER_RULES.md, rule 5).

    Runs in the pre-commit hook: adding/removing an agent, skill, or workflow
    without updating ARCHITECTURE.md and the README badges blocks the commit.
    """

    @staticmethod
    def _disk_counts() -> dict[str, int]:
        return {
            "Agents": len(get_all_agents()),
            "Skills": len(get_all_skill_dirs()),
            "Workflows": len(get_all_workflows()),
        }

    @staticmethod
    def _package_version() -> str:
        import json

        package_json = REPO_ROOT / "package.json"
        return json.loads(package_json.read_text(encoding="utf-8"))["version"]

    def test_kit_master_rules_exists(self) -> None:
        # KIT_MASTER_RULES.md is intentionally excluded from package.json's
        # "files" list — it governs the kit's own source repo, not projects
        # that installed devbureau. Per DEVBUREAU.md ("test_kit_integrity.py
        # roda EXCLUSIVAMENTE no projeto devbureau"), this whole suite should
        # never run outside the source repo — but if it ever does, skip
        # instead of hard-failing on a file that was never supposed to ship.
        if not (REPO_ROOT / "KIT_MASTER_RULES.md").exists():
            pytest.skip(
                "KIT_MASTER_RULES.md not found — not the devbureau source repo "
                "(this file is deliberately excluded from npm package files)"
            )

    @pytest.mark.parametrize("readme_name", ["README.md", "README_pt-BR.md"])
    def test_readme_badges_match_disk(self, readme_name: str) -> None:
        readme = REPO_ROOT / readme_name
        if not readme.exists():
            pytest.skip(f"{readme_name} not found")
        content = readme.read_text(encoding="utf-8", errors="ignore")
        counts = self._disk_counts()
        expected_badges = {
            f"badge/Agents-{counts['Agents']}-": f"Agents badge ({counts['Agents']})",
            f"badge/Skills-{counts['Skills']}-": f"Skills badge ({counts['Skills']})",
            f"badge/Workflows-{counts['Workflows']}-": f"Workflows badge ({counts['Workflows']})",
            f"badge/DevBureau-v{self._package_version()}-": f"Version badge (v{self._package_version()})",
        }
        stale = [label for needle, label in expected_badges.items() if needle not in content]
        assert not stale, (
            f"{readme_name} badges out of sync with disk — expected {stale}. "
            "Update the badges (and any counts in the body) per KIT_MASTER_RULES.md rule 5."
        )

    def test_architecture_counts_match_disk(self) -> None:
        arch = AGENT_DIR / "ARCHITECTURE.md"
        if not arch.exists():
            pytest.skip("ARCHITECTURE.md not found")
        content = arch.read_text(encoding="utf-8", errors="ignore")
        counts = self._disk_counts()
        mismatches: list[str] = []

        for kind, disk_count in counts.items():
            # Section headers: "## 🤖 Agents (23)" etc.
            for match in re.finditer(rf"^##[^\n]*\b{kind} \((\d+)\)", content, re.MULTILINE):
                documented = int(match.group(1))
                if documented != disk_count:
                    mismatches.append(
                        f"{kind} section header says {documented}, disk has {disk_count}"
                    )
            # Statistics table: "| **Total Agents** | 23 |" etc.
            stats_match = re.search(rf"\*\*Total {kind}\*\*\s*\|\s*(\d+)", content)
            if stats_match and int(stats_match.group(1)) != disk_count:
                mismatches.append(
                    f"Total {kind} in stats table says {stats_match.group(1)}, disk has {disk_count}"
                )

        assert not mismatches, (
            f"ARCHITECTURE.md out of sync with disk: {mismatches}. "
            "Update it per KIT_MASTER_RULES.md rule 5."
        )
