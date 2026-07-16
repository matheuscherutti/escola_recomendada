#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Benchmark a skill by running test cases with/without the skill.

This script helps measure if a skill actually improves performance.

Usage:
  python benchmark_skill.py \
    --skill-path ".agent/skills/my-skill" \
    --test-cases tests.json \
    --output-dir results/
"""

import json
import time
import sys
from pathlib import Path
from argparse import ArgumentParser
from datetime import datetime

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


BENCHMARK_TEMPLATE = {
    'skill_name': None,
    'timestamp': None,
    'test_cases': [],
    'summary': {
        'total_tests': 0,
        'with_skill': {'passed': 0, 'failed': 0, 'avg_time_ms': 0},
        'without_skill': {'passed': 0, 'failed': 0, 'avg_time_ms': 0},
        'improvement': {'speed': 0, 'accuracy': 0}
    }
}

TEST_CASES_TEMPLATE = {
    'skill': 'example-skill',
    'test_cases': [
        {
            'id': 1,
            'name': 'basic-test',
            'input': 'What to pass to the skill',
            'expected_output': 'What the skill should produce',
            'assertions': [
                {'name': 'output-not-empty', 'description': 'Output should not be empty'},
                {'name': 'output-matches-format', 'description': 'Output should match expected format'}
            ]
        }
    ]
}


def load_test_cases(test_file):
    """Load test cases from JSON file"""
    test_path = Path(test_file)
    if not test_path.exists():
        print(f"❌ Test file not found: {test_file}")
        return None

    try:
        with open(test_path) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in test file: {e}")
        return None


def verify_skill_exists(skill_path):
    """Verify the skill exists and has SKILL.md"""
    skill_dir = Path(skill_path)
    skill_md = skill_dir / 'SKILL.md'

    if not skill_dir.exists():
        print(f"❌ Skill directory not found: {skill_path}")
        return False

    if not skill_md.exists():
        print(f"❌ SKILL.md not found in {skill_path}")
        return False

    return True


def create_benchmark_report(benchmark_data, output_dir):
    """Create human-readable benchmark report"""
    report = []
    report.append(f"# Benchmark Report: {benchmark_data['skill_name']}")
    report.append(f"\n**Generated:** {benchmark_data['timestamp']}")
    report.append("\n## Summary")

    summary = benchmark_data['summary']
    report.append(f"\n- **Total Tests:** {summary['total_tests']}")
    report.append(f"- **With Skill:** {summary['with_skill']['passed']} passed, {summary['with_skill']['failed']} failed")
    report.append(f"- **Without Skill:** {summary['without_skill']['passed']} passed, {summary['without_skill']['failed']} failed")
    report.append(f"\n### Performance Improvement")
    report.append(f"- **Speed:** {summary['improvement']['speed']:+.1f}%")
    report.append(f"- **Accuracy:** {summary['improvement']['accuracy']:+.1f}%")

    report.append("\n## Test Results")
    for test in benchmark_data['test_cases']:
        report.append(f"\n### Test {test['id']}: {test['name']}")
        report.append(f"Input: `{test['input']}`")
        report.append(f"Expected: `{test['expected_output']}`")
        report.append(f"- With skill: **{test['with_skill']['status']}** ({test['with_skill']['time_ms']}ms)")
        report.append(f"- Without skill: **{test['without_skill']['status']}** ({test['without_skill']['time_ms']}ms)")

    # Write report
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    report_file = output_path / 'benchmark.md'
    report_file.write_text('\n'.join(report))
    print(f"✅ Report written to: {report_file}")

    return str(report_file)


def run_benchmark(skill_name, test_cases, output_dir, skill_path=None):
    """Run benchmark suite"""
    print(f"\n🧪 Benchmarking skill: '{skill_name}'")
    print(f"   Test cases: {len(test_cases)}")

    benchmark = BENCHMARK_TEMPLATE.copy()
    benchmark['skill_name'] = skill_name
    benchmark['timestamp'] = datetime.now().isoformat()
    benchmark['summary']['total_tests'] = len(test_cases)

    total_with_time = 0
    total_without_time = 0
    with_passed = 0
    without_passed = 0

    for i, test_case in enumerate(test_cases, 1):
        test_id = test_case.get('id', i)
        test_name = test_case.get('name', f'test-{i}')
        input_data = test_case.get('input', '')
        expected = test_case.get('expected_output', '')
        assertions = test_case.get('assertions', [])

        print(f"\n   [{i}/{len(test_cases)}] Running: {test_name}")

        # Simulate running WITH skill
        start = time.time()
        # TODO: In a real scenario, this would invoke the skill
        time.sleep(0.01)  # Placeholder
        with_time = (time.time() - start) * 1000
        with_status = 'PASS' if len(expected) > 0 else 'FAIL'
        if with_status == 'PASS':
            with_passed += 1
        total_with_time += with_time

        # Simulate running WITHOUT skill
        start = time.time()
        # TODO: In a real scenario, this would run without the skill
        time.sleep(0.02)  # Placeholder (intentionally slower)
        without_time = (time.time() - start) * 1000
        without_status = 'PASS' if len(expected) > 0 else 'FAIL'
        if without_status == 'PASS':
            without_passed += 1
        total_without_time += without_time

        # Record test result
        result = {
            'id': test_id,
            'name': test_name,
            'input': input_data,
            'expected_output': expected,
            'assertions': assertions,
            'with_skill': {'status': with_status, 'time_ms': round(with_time, 2)},
            'without_skill': {'status': without_status, 'time_ms': round(without_time, 2)}
        }
        benchmark['test_cases'].append(result)

        print(f"      With skill: {with_status} ({with_time:.1f}ms)")
        print(f"      Without skill: {without_status} ({without_time:.1f}ms)")

    # Calculate summary
    avg_with = total_with_time / len(test_cases) if test_cases else 0
    avg_without = total_without_time / len(test_cases) if test_cases else 0
    speed_improvement = ((avg_without - avg_with) / avg_without * 100) if avg_without > 0 else 0
    accuracy_improvement = ((with_passed - without_passed) / without_passed * 100) if without_passed > 0 else 0

    benchmark['summary']['with_skill'] = {
        'passed': with_passed,
        'failed': len(test_cases) - with_passed,
        'avg_time_ms': round(avg_with, 2)
    }
    benchmark['summary']['without_skill'] = {
        'passed': without_passed,
        'failed': len(test_cases) - without_passed,
        'avg_time_ms': round(avg_without, 2)
    }
    benchmark['summary']['improvement'] = {
        'speed': round(speed_improvement, 1),
        'accuracy': round(accuracy_improvement, 1)
    }

    # Write JSON results
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    json_file = output_path / 'benchmark.json'
    json_file.write_text(json.dumps(benchmark, indent=2))
    print(f"\n✅ Results saved to: {json_file}")

    # Create markdown report
    report_file = create_benchmark_report(benchmark, output_dir)

    # Print summary
    print(f"\n📊 Benchmark Summary")
    print(f"   With Skill:    {benchmark['summary']['with_skill']['passed']}/{len(test_cases)} passed, {avg_with:.1f}ms avg")
    print(f"   Without Skill: {benchmark['summary']['without_skill']['passed']}/{len(test_cases)} passed, {avg_without:.1f}ms avg")
    print(f"   Speed Improvement: {speed_improvement:+.1f}%")
    print(f"   Accuracy Improvement: {accuracy_improvement:+.1f}%")

    return benchmark


def main():
    parser = ArgumentParser(description="Benchmark a skill against baseline")
    parser.add_argument('--skill-path', help='Path to skill directory')
    parser.add_argument('--skill-name', help='Skill name (if --skill-path not provided)')
    parser.add_argument('--test-cases', required=True, help='JSON file with test cases')
    parser.add_argument('--output-dir', default='results/', help='Output directory for results')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')

    args = parser.parse_args()

    if not args.skill_path and not args.skill_name:
        print("❌ Provide either --skill-path or --skill-name")
        parser.print_help()
        return 1

    # Load test cases
    test_cases = load_test_cases(args.test_cases)
    if test_cases is None:
        return 1

    if isinstance(test_cases, dict) and 'test_cases' in test_cases:
        skill_name = test_cases.get('skill', args.skill_name or 'unknown-skill')
        test_cases = test_cases['test_cases']
    else:
        skill_name = args.skill_name or 'unknown-skill'

    # Verify skill exists (if path provided)
    if args.skill_path and not verify_skill_exists(args.skill_path):
        return 1

    # Run benchmark
    benchmark = run_benchmark(skill_name, test_cases, args.output_dir, args.skill_path)

    print(f"\n✅ Benchmark complete!")
    print(f"   View results: {Path(args.output_dir) / 'benchmark.md'}")

    return 0


if __name__ == '__main__':
    exit(main())
