#!/usr/bin/env python3
"""
Master Checklist Runner - DevBureau
====================================

Orchestrates all validation scripts in priority order.
Use this for incremental validation during development.

Usage:
    python scripts/checklist.py .                    # Run core checks
    python scripts/checklist.py . --url <URL>        # Include performance checks

Priority Order:
    P0: Security Scan (vulnerabilities, secrets)
    P1: Lint & Type Check (code quality)
    P2: Schema Validation (if database exists)
    P3: Test Runner (unit/integration tests)
    P4: UX Audit (psychology laws, accessibility)
    P5: SEO Check (meta tags, structure)
    P6: Performance (lighthouse - requires URL)
"""

import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Tuple, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Configuração de encoding para evitar erros em terminais Windows (cp1252)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

# Import validation configuration
try:
    from validation_config import get_validation_plan, print_validation_plan
except ImportError:
    print("⚠️  Warning: validation_config.py not found. Using full validation mode.")
    get_validation_plan = None
    print_validation_plan = None

# ANSI colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.ENDC}\n")

def print_step(text: str):
    print(f"{Colors.BOLD}{Colors.BLUE}🔄 {text}{Colors.ENDC}")

def print_success(text: str):
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")

def print_warning(text: str):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.ENDC}")

def print_error(text: str):
    print(f"{Colors.RED}❌ {text}{Colors.ENDC}")

# Define priority-ordered checks
CORE_CHECKS = [
    ("Security Scan", ".agent/skills/vulnerability-scanner/scripts/security_scan.py", True),
    ("Lint Check", ".agent/skills/lint-and-validate/scripts/lint_runner.py", True),
    ("Schema Validation", ".agent/skills/database-design/scripts/schema_validator.py", False),
    ("Test Runner", ".agent/skills/testing-patterns/scripts/test_runner.py", False),
    ("UX Audit", ".agent/skills/frontend-design/scripts/ux_audit.py", False),
    ("SEO Check", ".agent/skills/seo-fundamentals/scripts/seo_checker.py", False),
]

PERFORMANCE_CHECKS = [
    ("Lighthouse Audit", ".agent/skills/performance-profiling/scripts/lighthouse_audit.py", True),
    ("Playwright E2E", ".agent/skills/webapp-testing/scripts/playwright_runner.py", False),
]

def check_script_exists(script_path: Path) -> bool:
    """Check if script file exists"""
    return script_path.exists() and script_path.is_file()

def run_script(name: str, script_path: Path, project_path: str, url: Optional[str] = None) -> dict:
    """
    Run a validation script and capture results
    
    Returns:
        dict with keys: name, passed, output, skipped
    """
    if not check_script_exists(script_path):
        print_warning(f"{name}: Script not found, skipping")
        return {"name": name, "passed": True, "output": "", "skipped": True}
    
    print_step(f"Running: {name}")
    
    # Build command
    cmd = ["python", str(script_path), project_path]
    if url and ("lighthouse" in script_path.name.lower() or "playwright" in script_path.name.lower()):
        cmd.append(url)
    
    # Run script
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        passed = result.returncode == 0
        
        if passed:
            print_success(f"{name}: PASSED")
        else:
            print_error(f"{name}: FAILED")
            if result.stderr:
                print(f"  Error: {result.stderr[:200]}")
        
        return {
            "name": name,
            "passed": passed,
            "output": result.stdout,
            "error": result.stderr,
            "skipped": False
        }
    
    except subprocess.TimeoutExpired:
        print_error(f"{name}: TIMEOUT (>5 minutes)")
        return {"name": name, "passed": False, "output": "", "error": "Timeout", "skipped": False}
    
    except Exception as e:
        print_error(f"{name}: ERROR - {str(e)}")
        return {"name": name, "passed": False, "output": "", "error": str(e), "skipped": False}

def print_summary(results: List[dict]):
    """Print final summary report"""
    print_header("📊 CHECKLIST SUMMARY")
    
    # UX Audit and SEO Check are considered non-blocking "Advisory" checks
    advisory_names = ["UX Audit", "SEO Check"]
    
    passed_count = sum(1 for r in results if r["passed"] and not r.get("skipped"))
    # Only count failures for non-advisory checks
    failed_count = sum(1 for r in results if not r["passed"] and not r.get("skipped") and r["name"] not in advisory_names)
    warning_count = sum(1 for r in results if not r["passed"] and not r.get("skipped") and r["name"] in advisory_names)
    skipped_count = sum(1 for r in results if r.get("skipped"))
    
    print(f"Total Checks: {len(results)}")
    print(f"{Colors.GREEN}✅ Passed: {passed_count}{Colors.ENDC}")
    if failed_count > 0:
        print(f"{Colors.RED}❌ Failed (Critical): {failed_count}{Colors.ENDC}")
    if warning_count > 0:
        print(f"{Colors.YELLOW}⚠️  Warnings (Advisory): {warning_count}{Colors.ENDC}")
    print(f"{Colors.YELLOW}⏭️  Skipped: {skipped_count}{Colors.ENDC}")
    print()
    
    # Detailed results
    for r in results:
        if r.get("skipped"):
            status = f"{Colors.YELLOW}⏭️ {Colors.ENDC}"
        elif r["passed"]:
            status = f"{Colors.GREEN}✅{Colors.ENDC}"
        elif r["name"] in advisory_names:
            status = f"{Colors.YELLOW}⚠️ {Colors.ENDC}"
        else:
            status = f"{Colors.RED}❌{Colors.ENDC}"
        
        print(f"{status} {r['name']}")
    
    print()
    
    if failed_count > 0:
        print_error(f"{failed_count} critical check(s) FAILED - Please fix before proceeding")
        return False
    elif warning_count > 0:
        print_warning(f"Functional integrity verified, but {warning_count} advisory check(s) have warnings.")
        print_success("Project is in pleno funcionamento ✨")
        return True
    else:
        print_success("All checks PASSED ✨")
        return True

def main():
    parser = argparse.ArgumentParser(
        description="Run DevBureau validation checklist",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/checklist.py .                              # Full validation
  python scripts/checklist.py . --selective                  # Fast dev mode
  python scripts/checklist.py . --selective --change-type component
  python scripts/checklist.py . --pre-commit                 # Pre-commit mode
  python scripts/checklist.py . --url http://localhost:3000  # Include performance
        """
    )
    parser.add_argument("project", help="Project path to validate")
    parser.add_argument("--url", help="URL for performance checks (lighthouse, playwright)")
    parser.add_argument("--skip-performance", action="store_true", help="Skip performance checks even if URL provided")

    # New selective mode flags
    parser.add_argument("--selective", action="store_true", help="Fast dev mode: only essential checks")
    parser.add_argument("--change-type", choices=['logic', 'api', 'component', 'style', 'database', 'config', 'docs', 'refactor'],
                        help="Type of change for selective validation")
    parser.add_argument("--pre-commit", action="store_true", help="Pre-commit validation mode")
    parser.add_argument("--files", help="Specific files to validate (comma-separated)")

    args = parser.parse_args()
    
    project_path = Path(args.project).resolve()

    if not project_path.exists():
        print_error(f"Project path does not exist: {project_path}")
        sys.exit(1)

    # Determine validation mode
    mode_name = "FULL"
    if args.selective:
        mode_name = "SELECTIVE (DEV)"
    elif args.pre_commit:
        mode_name = "PRE-COMMIT"

    print_header(f"🚀 DEVBUREAU CHECKLIST - {mode_name} MODE")
    print(f"Project: {project_path}")
    if args.url:
        print(f"URL: {args.url}")
    if args.change_type:
        print(f"Change Type: {args.change_type}")

    # Get validation plan if in selective or pre-commit mode
    validation_plan = None
    if (args.selective or args.pre_commit) and get_validation_plan:
        validation_plan = get_validation_plan(
            change_type=args.change_type,
            selective=args.selective,
            pre_commit=args.pre_commit
        )
        if print_validation_plan:
            print_validation_plan(validation_plan, args.change_type, mode_name)

    results = []

    # Run core checks (respecting validation plan)
    print_header("📋 CORE CHECKS")

    # Mapping check names to their enable flags in validation_plan
    check_enable_map = {
        "Security Scan": "security_scan",
        "Lint Check": "lint",
        "Schema Validation": "pytest",  # Schema is part of integration testing
        "Test Runner": "pytest",
        "UX Audit": "lighthouse",       # UX audit is visual, like lighthouse
        "SEO Check": "playwright",      # SEO check is content-based, similar to playwright
    }

    for name, script_path, required in CORE_CHECKS:
        # Skip check if not in validation plan
        if validation_plan:
            enable_flag = check_enable_map.get(name)
            if enable_flag and not getattr(validation_plan, enable_flag):
                print_warning(f"{name}: Skipped (not in validation plan for {args.change_type or 'this change'})")
                results.append({
                    "name": name,
                    "passed": True,
                    "output": "",
                    "skipped": True
                })
                continue

        script = project_path / script_path
        result = run_script(name, script, str(project_path))
        results.append(result)

        # If required check fails, stop
        if required and not result["passed"] and not result.get("skipped"):
            print_error(f"CRITICAL: {name} failed. Stopping checklist.")
            print_summary(results)
            sys.exit(1)

    # Run performance checks if URL provided AND enabled in validation plan
    should_run_performance = args.url and not args.skip_performance
    if validation_plan and not validation_plan.lighthouse and not validation_plan.playwright:
        should_run_performance = False

    if should_run_performance:
        print_header("⚡ PERFORMANCE CHECKS")
        for name, script_path, required in PERFORMANCE_CHECKS:
            # Skip if not enabled
            if validation_plan:
                if "lighthouse" in script_path.lower() and not validation_plan.lighthouse:
                    print_warning(f"{name}: Skipped (not in validation plan)")
                    results.append({"name": name, "passed": True, "output": "", "skipped": True})
                    continue
                if "playwright" in script_path.lower() and not validation_plan.playwright:
                    print_warning(f"{name}: Skipped (not in validation plan)")
                    results.append({"name": name, "passed": True, "output": "", "skipped": True})
                    continue

            script = project_path / script_path
            result = run_script(name, script, str(project_path), args.url)
            results.append(result)
    
    # Print summary
    all_passed = print_summary(results)
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
