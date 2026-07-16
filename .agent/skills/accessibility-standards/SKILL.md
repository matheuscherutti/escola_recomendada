---
name: accessibility-standards
description: Use when auditing or building accessible UI, or when a legal/compliance requirement (ADA, EN 301 549, LBI/eMAG) applies — WCAG 2.1/2.2 compliance, semantic HTML, ARIA roles, keyboard navigation, color contrast, screen reader testing, automated a11y tooling (axe, pa11y, Lighthouse). Triggers on "acessibilidade", "leitor de tela", "contraste", "WCAG", "ARIA", "navegação por teclado".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Accessibility Standards

> **If it's not accessible, it's broken — not "broken for some users," just broken.**

---

## ⚠️ Core Principle

- Semantic HTML first. ARIA is a patch for when semantic HTML genuinely can't express the interaction — not a default.
- WCAG **AA** is the practical bar for almost everything (it's what ADA lawsuits, EU's EN 301 549, and Brazil's LBI/eMAG for public-sector sites reference). AAA is for content explicitly aimed at users with disabilities.
- Accessibility is sized by audience and legal exposure, not by project tier the way infra is — a one-page Prototype aimed at the public still needs basic semantic HTML and alt text.

---

## 1. WCAG Levels — When Each Applies

| Level | Bar | Typical Requirement Source |
|---|---|---|
| **A** | Minimum, often legally insufficient alone | Rarely the target alone |
| **AA** | Practical default for almost everything public-facing | ADA (US), EN 301 549 (EU), LBI/eMAG (BR public sector) |
| **AAA** | Enhanced, for content/audiences that need it | Government services for disability-focused orgs, specific contracts |

Default to **AA** unless told otherwise.

---

## 1.1 Legal Floor by Jurisdiction

> Adapted from open-design (nexu-io/open-design), craft/, and refero_skill (MIT), via analysis on 2026-06-30.

The legal floor is not the same standard everywhere, and it lags behind the latest WCAG version:

| Jurisdiction | Standard referenced | Deadline/status |
|---|---|---|
| **EU (EAA)** | EN 301 549 v3.2.1 → **WCAG 2.1 AA** | Enforcement live since 2025-06-28. v4.1.1 (adds WCAG 2.2's SCs) targets OJ citation late 2026/2027 |
| **US public sector (ADA Title II)** | **WCAG 2.1 AA** | 2027-04-26 for population ≥50,000; 2028-04-26 for smaller jurisdictions |
| **US federal procurement (Section 508)** | **WCAG 2.0 AA** | Access Board has WCAG 2.x updates in flight, not yet shipped |
| **US private sector (ADA Title III)** | No fixed technical standard; DOJ guidance/settlements cite WCAG 2.1 AA | Case-by-case, not rule-based |

Practical rule: target **WCAG 2.2 AA** as the working ceiling regardless of jurisdiction — it clears every legal floor above and prepares for the next revision. Anything below 2.2 AA is craft debt, not a passing grade.

---

## 2. Semantic HTML Checklist (do this before reaching for ARIA)

- [ ] Headings in order (`h1` → `h2` → `h3`, no skipped levels)
- [ ] `<button>` for actions, `<a href>` for navigation — never a `<div onClick>`
- [ ] `<label>` associated with every form input
- [ ] Landmark elements (`<nav>`, `<main>`, `<header>`, `<footer>`)
- [ ] Images have meaningful `alt` text (or `alt=""` if purely decorative)

---

## 3. ARIA — Only When Semantic HTML Can't Do It

| Need | Use |
|---|---|
| Custom dropdown/combobox | `role="combobox"` + `aria-expanded`, `aria-controls` |
| Live region (toast, status update) | `aria-live="polite"` (or `"assertive"` only for urgent errors) |
| Icon-only button | `aria-label` describing the action, not the icon |
| Modal dialog | `role="dialog"` + `aria-modal="true"` + focus trap + restore focus on close |

> First rule of ARIA: no ARIA is better than wrong ARIA. An incorrect `role` lies to screen reader users.

---

## 4. Keyboard Navigation

- Every interactive element reachable via `Tab`, operable via `Enter`/`Space`.
- Visible focus indicator — never `outline: none` without a replacement.
- Logical tab order matching visual order.
- No keyboard traps (a modal must let `Esc` or `Tab` cycling out).

---

## 5. Color & Contrast

| Text Type | Minimum Ratio (AA) |
|---|---|
| Normal text (below 18pt regular / 14pt bold) | 4.5:1 |
| Large text (**18pt regular ≈24px**, or 14pt bold ≈18.5px) | 3:1 |
| UI components/icons | 3:1 |

- Never use color alone to convey meaning (error state needs an icon/text too, not just red).
- "Large text" is **18pt**, not 18px — 18px regular still needs 4.5:1. This is one of the most common threshold mix-ups.
- **APCA is a parallel design check, not a WCAG replacement.** APCA's Lc value catches font-weight/stem-thickness effects WCAG's ratio misses (body copy at Lc ≥60 is a reasonable parallel pass), but APCA is not part of WCAG, EN 301 549, ADA, or Section 508 compliance. Keep WCAG 2.2 AA as the compliance floor; treat APCA as design-review only.

## 5.1 Touch Targets

| Bar | Size |
|---|---|
| **AA (legal floor, SC 2.5.8)** | **24×24 CSS px** |
| AAA (craft commitment, SC 2.5.5) | 44×44 CSS px |
| iOS HIG | 44×44 pt |
| Material 3 | 48×48 dp |

The common mistake is citing 44×44 as the AA bar — it's AAA. AA is 24×24. WCAG 2.5.8 has five narrow exceptions (spacing, equivalent alternative, inline text links, user-agent controls, essential size like a map pin) — don't stretch these to excuse an undersized primary action.

---

## 6. Testing Approach

| Layer | Tool | Catches |
|---|---|---|
| **Automated, CI** | `axe-core`, `pa11y`, Lighthouse a11y audit | ~30-40% of issues: missing labels, contrast, ARIA misuse |
| **Manual, keyboard-only** | Unplug the mouse, navigate the whole flow | Tab order, focus traps, hidden interactive elements |
| **Manual, screen reader** | NVDA (Windows, free), VoiceOver (Mac) | Announcement clarity, redundant/missing context |

Automated tools are a floor, not a finish line — they cannot judge whether an `alt` text is actually meaningful.

---

## 7. Native Mobile Parity

Web ARIA does not auto-translate to mobile. Each platform has its own labelling API — mirroring web ARIA verbatim into a mobile app usually misses the platform-native screen reader path.

| Platform | Label | Role |
|---|---|---|
| iOS UIKit | `accessibilityLabel` | `accessibilityTraits` |
| iOS SwiftUI | `.accessibilityLabel(…)` | `.accessibilityAddTraits(.isButton)` |
| Android Compose | `Modifier.semantics { contentDescription = … }` | `Modifier.semantics { role = Role.Button }` |
| Flutter | `Semantics(label: …)` | `Semantics(button: true, …)` |
| React Native | `accessibilityLabel` | `accessibilityRole` |

---

## ❌ Anti-Patterns

- `<div onClick>` instead of `<button>`.
- Decorative icon fonts read aloud as gibberish by screen readers (missing `aria-hidden="true"`).
- Placeholder text used as the only label.
- Auto-playing media with no pause control.
- Fixing only what the automated scanner flags and calling it "accessible."
- Citing 44×44 as the AA touch-target bar — that's AAA (2.5.5). AA (2.5.8) is 24×24.
- Treating accessibility as web-only — Flutter/iOS/Android have their own labelling APIs that web ARIA doesn't reach.
