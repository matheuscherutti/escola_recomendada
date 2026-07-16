#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Centralized Validation Configuration for DevBureau
===================================================

Defines which tests/checks to run based on change type.
Used by checklist.py to enable selective validation mode.

Usage:
    from validation_config import get_validation_plan
    plan = get_validation_plan(change_type='component', selective=True)
"""

from dataclasses import dataclass
from typing import List, Optional
from enum import Enum


class ChangeType(Enum):
    """Types of changes and their validation requirements"""
    LOGIC = "logic"           # Utility, helpers, pure functions
    API = "api"               # Endpoints, routes, middleware
    COMPONENT = "component"   # React/Vue components
    STYLE = "style"          # CSS, styling, layout
    DATABASE = "database"    # Schema, migrations
    CONFIG = "config"        # .env, config files
    DOCS = "docs"            # Documentation
    REFACTOR = "refactor"    # Code reorganization


@dataclass
class ValidationPlan:
    """Defines which checks to run"""
    doctor: bool = False         # Kit integrity
    lint: bool = False           # Linting & formatting
    pytest: bool = False         # Unit/integration tests
    lighthouse: bool = False     # Performance audit
    playwright: bool = False     # E2E/visual testing
    security_scan: bool = False  # Security vulnerabilities

    def active_checks(self) -> List[str]:
        """Return list of active checks"""
        checks = []
        if self.doctor:
            checks.append("doctor")
        if self.security_scan:
            checks.append("security")
        if self.lint:
            checks.append("lint")
        if self.pytest:
            checks.append("pytest")
        if self.lighthouse:
            checks.append("lighthouse")
        if self.playwright:
            checks.append("playwright")
        return checks

    def is_full_validation(self) -> bool:
        """Check if this is a full validation run"""
        return all([
            self.doctor, self.security_scan, self.lint,
            self.pytest, self.lighthouse, self.playwright
        ])


# Mapping: ChangeType → ValidationPlan (selective mode)
SELECTIVE_VALIDATION_PLANS = {
    ChangeType.LOGIC: ValidationPlan(
        doctor=False,      # 1x per session
        lint=True,         # File only
        pytest=True,       # Module unit tests
        lighthouse=False,
        playwright=False,
        security_scan=False
    ),

    ChangeType.API: ValidationPlan(
        doctor=False,      # 1x per session
        lint=True,         # File only
        pytest=True,       # Integration tests
        lighthouse=False,
        playwright=False,
        security_scan=False
    ),

    ChangeType.COMPONENT: ValidationPlan(
        doctor=False,
        lint=True,         # File only
        pytest=True,       # Component tests (if exist)
        lighthouse=True,   # Core Web Vitals
        playwright=True,   # Layout/interaction test
        security_scan=False
    ),

    ChangeType.STYLE: ValidationPlan(
        doctor=False,
        lint=True,         # CSS lint only
        pytest=False,      # No style unit tests
        lighthouse=True,   # PageSpeed metrics
        playwright=True,   # Visual regression
        security_scan=False
    ),

    ChangeType.DATABASE: ValidationPlan(
        doctor=False,
        lint=True,         # SQL linting
        pytest=True,       # FULL integration suite (must be thorough)
        lighthouse=False,
        playwright=False,
        security_scan=True  # Check for SQL injection risks
    ),

    ChangeType.CONFIG: ValidationPlan(
        doctor=False,
        lint=False,
        pytest=False,
        lighthouse=False,
        playwright=False,
        security_scan=False  # Manual verification only
    ),

    ChangeType.DOCS: ValidationPlan(
        doctor=False,
        lint=False,
        pytest=False,
        lighthouse=False,
        playwright=False,
        security_scan=False  # No validation needed
    ),

    ChangeType.REFACTOR: ValidationPlan(
        doctor=False,
        lint=True,         # File only
        pytest=False,      # Only if large scope (>50 lines)
        lighthouse=False,
        playwright=False,
        security_scan=False
    ),
}

# Mapping: ChangeType → ValidationPlan (pre-commit mode)
PRE_COMMIT_VALIDATION_PLANS = {
    ChangeType.LOGIC: ValidationPlan(
        doctor=False,
        lint=True,         # Changed files
        pytest=True,       # Affected modules
        lighthouse=False,
        playwright=False,
        security_scan=True  # Scan diffs for secrets
    ),

    ChangeType.API: ValidationPlan(
        doctor=False,
        lint=True,
        pytest=True,
        lighthouse=False,
        playwright=False,
        security_scan=True
    ),

    ChangeType.COMPONENT: ValidationPlan(
        doctor=False,
        lint=True,
        pytest=True,
        lighthouse=False,
        playwright=False,
        security_scan=True
    ),

    ChangeType.STYLE: ValidationPlan(
        doctor=False,
        lint=True,
        pytest=False,
        lighthouse=False,
        playwright=False,
        security_scan=True
    ),

    ChangeType.DATABASE: ValidationPlan(
        doctor=False,
        lint=True,
        pytest=True,       # FULL
        lighthouse=False,
        playwright=False,
        security_scan=True
    ),

    ChangeType.CONFIG: ValidationPlan(
        doctor=False,
        lint=False,
        pytest=False,
        lighthouse=False,
        playwright=False,
        security_scan=True  # Check for secrets in config
    ),

    ChangeType.DOCS: ValidationPlan(
        doctor=False,
        lint=False,
        pytest=False,
        lighthouse=False,
        playwright=False,
        security_scan=False
    ),

    ChangeType.REFACTOR: ValidationPlan(
        doctor=False,
        lint=True,
        pytest=False,
        lighthouse=False,
        playwright=False,
        security_scan=True
    ),
}

# Full validation (deploy mode)
FULL_VALIDATION_PLAN = ValidationPlan(
    doctor=True,
    lint=True,
    pytest=True,
    lighthouse=True,
    playwright=True,
    security_scan=True
)


def get_validation_plan(
    change_type: str = None,
    selective: bool = False,
    pre_commit: bool = False,
) -> ValidationPlan:
    """
    Get validation plan based on change type and mode.

    Args:
        change_type: One of 'logic', 'api', 'component', 'style', 'database', 'config', 'docs', 'refactor'
        selective: If True, use minimal validation (dev mode)
        pre_commit: If True, use pre-commit validation

    Returns:
        ValidationPlan object with which checks to run
    """

    # Pre-commit or full validation takes precedence
    if pre_commit:
        if change_type:
            try:
                ct = ChangeType(change_type)
                return PRE_COMMIT_VALIDATION_PLANS.get(ct, FULL_VALIDATION_PLAN)
            except ValueError:
                return FULL_VALIDATION_PLAN
        return FULL_VALIDATION_PLAN

    # Selective mode (dev)
    if selective and change_type:
        try:
            ct = ChangeType(change_type)
            return SELECTIVE_VALIDATION_PLANS.get(ct, FULL_VALIDATION_PLAN)
        except ValueError:
            # Unknown change type, use full validation
            return FULL_VALIDATION_PLAN

    # Default: full validation
    return FULL_VALIDATION_PLAN


def print_validation_plan(plan: ValidationPlan, change_type: str = None, mode: str = "full"):
    """Pretty print the validation plan"""
    print(f"\n📋 Validation Plan ({mode} mode)")
    if change_type:
        print(f"   Change Type: {change_type}")
    print("   Checks to run:")

    checks = {
        'doctor': (plan.doctor, "Kit integrity check"),
        'security': (plan.security_scan, "Security vulnerability scan"),
        'lint': (plan.lint, "Linting & formatting"),
        'pytest': (plan.pytest, "Unit/integration tests"),
        'lighthouse': (plan.lighthouse, "Lighthouse performance audit"),
        'playwright': (plan.playwright, "Playwright E2E tests"),
    }

    for check_name, (enabled, description) in checks.items():
        status = "✅" if enabled else "⏭️ "
        print(f"   {status} {description}")
    print()


if __name__ == "__main__":
    # Example: show plans for each change type
    print("=" * 60)
    print("DevBureau Validation Configuration")
    print("=" * 60)

    for change_type in ChangeType:
        print(f"\n{change_type.value.upper()}")
        print("-" * 60)

        plan_selective = get_validation_plan(
            change_type=change_type.value,
            selective=True
        )
        print("Selective (Dev):")
        print(f"  {', '.join(plan_selective.active_checks())}")

        plan_precommit = get_validation_plan(
            change_type=change_type.value,
            pre_commit=True
        )
        print("Pre-commit:")
        print(f"  {', '.join(plan_precommit.active_checks())}")

    print("\n" + "=" * 60)
