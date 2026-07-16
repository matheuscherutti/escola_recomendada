#!/usr/bin/env python3
"""
doctor.py — DevBureau Health Diagnostics
Verifica a integridade completa do .agent/ (agentes, skills, workflows, scripts, memory).
Usage: python .agent/scripts/doctor.py
"""

import sys
from pathlib import Path

# Configuração de encoding para evitar erros em terminais Windows (cp1252)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

# ── constants ──────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
AGENT_DIR = REPO_ROOT / ".agent"
AGENTS_DIR = AGENT_DIR / "agents"
SKILLS_DIR = AGENT_DIR / "skills"
WORKFLOWS_DIR = AGENT_DIR / "workflows"
SCRIPTS_DIR = AGENT_DIR / "scripts"
TESTS_DIR = AGENT_DIR / "tests"
MEMORY_DIR = AGENT_DIR / "memory"
RULES_DIR = AGENT_DIR / "rules"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"


# ── helpers ─────────────────────────────────────────────────────────────────
def ok(msg: str) -> None:
    print(f"  {GREEN}✔{RESET} {msg}")


def fail(msg: str) -> None:
    print(f"  {RED}✘{RESET} {msg}")


def warn(msg: str) -> None:
    print(f"  {YELLOW}⚠{RESET} {msg}")


def section(title: str) -> None:
    print(f"\n{CYAN}{BOLD}{title}{RESET}")


def score_from(errors: int, total: int) -> int:
    """0-10 score for a section: full marks if there's nothing to check."""
    if total <= 0:
        return 10
    return max(0, round(10 * (total - errors) / total))


def extract_frontmatter_field(content: str, field: str) -> str:
    """Extract a field value from YAML frontmatter."""
    for line in content.splitlines():
        if line.startswith(f"{field}:"):
            return line.split(":", 1)[1].strip()
    return ""


def collect_skill_refs_from_frontmatter(content: str) -> list[str]:
    """Extract skills listed in agent frontmatter skills: field."""
    raw = extract_frontmatter_field(content, "skills")
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


# ── check functions ──────────────────────────────────────────────────────────
def check_directory_structure() -> tuple[int, int]:
    """Verify required .agent/ subdirectories exist."""
    errors = 0
    required_dirs = [
        AGENTS_DIR,
        SKILLS_DIR,
        WORKFLOWS_DIR,
        SCRIPTS_DIR,
        RULES_DIR,
    ]
    optional_dirs = [TESTS_DIR, MEMORY_DIR]

    for directory in required_dirs:
        if directory.exists():
            ok(f"{directory.name}/ found")
        else:
            fail(f"{directory.name}/ MISSING (required)")
            errors += 1

    for directory in optional_dirs:
        if directory.exists():
            ok(f"{directory.name}/ found")
        else:
            warn(
                f"{directory.name}/ not found (optional — will be created on first use)"
            )

    return errors, len(required_dirs)


def check_agents() -> tuple[int, int]:
    """Validate all agent .md files have required frontmatter."""
    errors = 0
    agents = list(AGENTS_DIR.glob("*.md")) if AGENTS_DIR.exists() else []

    if not agents:
        fail("No agents found in .agent/agents/")
        return 1, 1

    broken = []
    for agent_path in sorted(agents):
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        name = extract_frontmatter_field(content, "name")
        if not name:
            broken.append(agent_path.name)

    if broken:
        for b in broken:
            fail(f"agents/{b} — missing 'name:' in frontmatter")
        errors += len(broken)
    else:
        ok(f"Agents: {len(agents)} found, 0 broken frontmatter")

    return errors, len(agents)


def check_skills() -> tuple[int, int]:
    """Validate all skill directories have a SKILL.md."""
    errors = 0
    skill_dirs = (
        [d for d in SKILLS_DIR.iterdir() if d.is_dir()] if SKILLS_DIR.exists() else []
    )

    if not skill_dirs:
        fail("No skills found in .agent/skills/")
        return 1, 1

    missing_skill_md = []
    empty_skill_md = []
    for skill_dir in sorted(skill_dirs):
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            missing_skill_md.append(skill_dir.name)
        elif skill_md.stat().st_size < 100:
            empty_skill_md.append(skill_dir.name)

    if missing_skill_md:
        for s in missing_skill_md:
            fail(f"skills/{s}/SKILL.md — MISSING")
        errors += len(missing_skill_md)
    else:
        ok(f"Skills: {len(skill_dirs)} found, 0 missing SKILL.md")

    if empty_skill_md:
        for s in empty_skill_md:
            warn(f"skills/{s}/SKILL.md — appears nearly empty (<100 chars)")

    return errors, len(skill_dirs)


def check_cross_references() -> tuple[int, int]:
    """Check that skills referenced in agent frontmatter actually exist.

    Ghost refs are warnings, not blocking errors (a ref may be a documented
    alias) — the returned count feeds the section score only, it is never
    added to the pre-commit-blocking total_errors.
    """
    total_refs = 0
    ghost_refs: list[str] = []
    agents = list(AGENTS_DIR.glob("*.md")) if AGENTS_DIR.exists() else []
    available_skills: set[str] = set()
    if SKILLS_DIR.exists():
        for skill_md in SKILLS_DIR.glob("**/SKILL.md"):
            skill_dir = skill_md.parent
            available_skills.add(skill_dir.name)
            # Nested skills (e.g. game-development/pc-games) are referenced by their
            # path relative to SKILLS_DIR, not just the leaf directory name.
            available_skills.add(
                skill_dir.relative_to(SKILLS_DIR).as_posix()
            )
            # A skill's declared `name:` in its own frontmatter can differ from its
            # directory name (a documented internal alias) — both are valid refs.
            declared_name = extract_frontmatter_field(
                skill_md.read_text(encoding="utf-8", errors="ignore"), "name"
            )
            if declared_name:
                available_skills.add(declared_name)

    for agent_path in agents:
        content = agent_path.read_text(encoding="utf-8", errors="ignore")
        skill_refs = collect_skill_refs_from_frontmatter(content)
        total_refs += len(skill_refs)
        for ref in skill_refs:
            ref_slug = ref.replace(" ", "-").lower()
            # Try exact match and partial match (some refs use short names)
            if ref_slug not in available_skills and ref not in available_skills:
                # Check if any available skill name contains the ref slug
                partial_match = any(ref_slug in s for s in available_skills)
                if not partial_match:
                    ghost_refs.append(f"{agent_path.name} → '{ref}'")

    if ghost_refs:
        for ref in ghost_refs:
            warn(f"Possible ghost skill reference: {ref}")
        # Warnings only — skill names may use aliases
    else:
        ok("Cross-references: 0 ghost skills detected")

    return len(ghost_refs), total_refs


def check_workflows() -> tuple[int, int]:
    """Validate all workflow files have a description in frontmatter."""
    errors = 0
    workflows = list(WORKFLOWS_DIR.glob("*.md")) if WORKFLOWS_DIR.exists() else []

    if not workflows:
        fail("No workflows found in .agent/workflows/")
        return 1, 1

    broken = []
    for wf_path in sorted(workflows):
        content = wf_path.read_text(encoding="utf-8", errors="ignore")
        desc = extract_frontmatter_field(content, "description")
        if not desc:
            broken.append(wf_path.name)

    if broken:
        for b in broken:
            fail(f"workflows/{b} — missing 'description:' in frontmatter")
        errors += len(broken)
    else:
        ok(f"Workflows: {len(workflows)} found, 0 broken frontmatter")

    return errors, len(workflows)


def check_master_scripts() -> tuple[int, int]:
    """Verify master scripts exist in .agent/scripts/."""
    errors = 0
    expected_scripts = ["checklist.py", "verify_all.py"]
    optional_scripts = ["doctor.py", "sync_ide.py"]

    for script_name in expected_scripts:
        script_path = SCRIPTS_DIR / script_name
        if script_path.exists():
            ok(f"scripts/{script_name}: ✅")
        else:
            fail(f"scripts/{script_name}: MISSING (required)")
            errors += 1

    for script_name in optional_scripts:
        script_path = SCRIPTS_DIR / script_name
        if script_path.exists():
            ok(f"scripts/{script_name}: ✅")
        else:
            warn(f"scripts/{script_name}: not found (optional)")

    return errors, len(expected_scripts)


def check_tests() -> int:
    """Check that kit integrity test file exists."""
    test_file = TESTS_DIR / "test_kit_integrity.py"
    if TESTS_DIR.exists() and test_file.exists():
        ok("tests/test_kit_integrity.py: ✅")
    else:
        warn("tests/test_kit_integrity.py: not found (run /ade to create)")
    return 0


def check_memory_layer() -> int:
    """Verify memory layer is initialized."""
    lessons = MEMORY_DIR / "lessons.md"
    gotchas = MEMORY_DIR / "gotchas.md"

    if MEMORY_DIR.exists() and lessons.exists() and gotchas.exists():
        ok("Memory layer: lessons.md + gotchas.md ✅")
    elif MEMORY_DIR.exists():
        warn("Memory layer: directory exists but files incomplete")
    else:
        warn("Memory layer: .agent/memory/ not found (run: mkdir .agent/memory/)")
    return 0


def check_version_drift() -> int:
    """Advisory only: notice when a newer DevBureau release is published.

    Looks for the sidecar `.devbureau-version` file `npx devbureau init/update`
    writes at the project root. Absent when running inside DevBureau's own
    source repo (not an install target) — that's normal, skip silently.
    Network/parsing failures are swallowed on purpose: this is a best-effort
    convenience notice, not a correctness check, so a single broad
    `except Exception` is the documented top-level-catch-all case clean-code
    rules already carve out, not a violation of them.
    """
    version_path = REPO_ROOT / ".devbureau-version"
    if not version_path.exists():
        return 0

    try:
        local_version = version_path.read_text(encoding="utf-8").strip()
        import json
        import urllib.request

        with urllib.request.urlopen("https://registry.npmjs.org/devbureau/latest", timeout=2) as response:
            latest_version = json.loads(response.read().decode("utf-8"))["version"]

        local_parts = tuple(int(p) for p in local_version.split("."))
        latest_parts = tuple(int(p) for p in latest_version.split("."))
        if latest_parts > local_parts:
            warn(f"DevBureau v{latest_version} disponível (você está na v{local_version}) — rode `npx devbureau update`")
        else:
            ok(f"DevBureau v{local_version} — você está atualizado")
    except Exception:
        pass
    return 0


def check_devbureau_rules() -> tuple[int, int]:
    """Verify DEVBUREAU.md rules file exists."""
    rules_path = RULES_DIR / "DEVBUREAU.md"
    if rules_path.exists() and rules_path.stat().st_size > 1000:
        ok(f"DEVBUREAU.md (P0 rules): ✅ ({rules_path.stat().st_size} bytes)")
    else:
        fail("DEVBUREAU.md: MISSING or too small")
        return 1, 1
    return 0, 1


def check_python_version() -> tuple[int, int]:
    """Check Python version compatibility."""
    version = sys.version_info
    if version >= (3, 9):
        ok(f"Python {version.major}.{version.minor}.{version.micro} ✅")
    else:
        fail(f"Python {version.major}.{version.minor} — version 3.9+ required")
        return 1, 1
    return 0, 1


# ── main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    print(f"\n{BOLD}🏥 DevBureau — System Diagnostics{RESET}")
    print("─" * 50)

    total_errors = 0
    scoreboard: list[tuple[str, int]] = []

    section("Python Environment")
    errors, total = check_python_version()
    total_errors += errors
    scoreboard.append(("Python Environment", score_from(errors, total)))

    section("Directory Structure")
    errors, total = check_directory_structure()
    total_errors += errors
    scoreboard.append(("Directory Structure", score_from(errors, total)))

    section("DEVBUREAU.md Rules (P0)")
    errors, total = check_devbureau_rules()
    total_errors += errors
    scoreboard.append(("DEVBUREAU.md Rules", score_from(errors, total)))

    section("Agents")
    errors, total = check_agents()
    total_errors += errors
    scoreboard.append(("Agents", score_from(errors, total)))

    section("Skills")
    errors, total = check_skills()
    total_errors += errors
    scoreboard.append(("Skills", score_from(errors, total)))

    section("Cross-References (Agents → Skills)")
    ghost_refs, refs_checked = check_cross_references()
    # Ghost refs are advisory (aliases can produce false positives) — they
    # feed the scoreboard but never block the pre-commit exit code.
    scoreboard.append(("Cross-References", score_from(ghost_refs, refs_checked)))

    section("Workflows")
    errors, total = check_workflows()
    total_errors += errors
    scoreboard.append(("Workflows", score_from(errors, total)))

    section("Master Scripts")
    errors, total = check_master_scripts()
    total_errors += errors
    scoreboard.append(("Master Scripts", score_from(errors, total)))

    section("Kit Tests")
    check_tests()

    section("Memory Layer")
    check_memory_layer()

    section("Version")
    check_version_drift()

    section("Kit Health Score")
    for name, sc in scoreboard:
        bar_color = GREEN if sc >= 8 else YELLOW if sc >= 5 else RED
        print(f"  {name:.<32} {bar_color}{sc}/10{RESET}")
    overall = round(sum(sc for _, sc in scoreboard) / len(scoreboard))
    overall_color = GREEN if overall >= 8 else YELLOW if overall >= 5 else RED
    print(f"  {BOLD}{'Overall':.<32} {overall_color}{overall}/10{RESET}")

    print("\n" + "─" * 50)
    if total_errors == 0:
        print(f"\n{GREEN}{BOLD}✅ All checks passed! Kit is healthy.{RESET}\n")
        sys.exit(0)
    else:
        print(
            f"\n{RED}{BOLD}❌ {total_errors} issue(s) found. Fix before proceeding.{RESET}\n"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
