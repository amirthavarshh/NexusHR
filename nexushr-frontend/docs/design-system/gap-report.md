# Design System Gap Report

This report compares the current state of NexusHR's styling architecture against the target Enterprise Design System standards for Sprint 1.

## 1. Token Architecture Gap

**Current State (`index.css`):**
- **Tailwind `@theme` usage**: Minimal. Only `--font-sans` and `--font-display` are defined.
- **Colors**: Hardcoded HEX and RGBA values scattered across ~400 lines of CSS (e.g., `#B8860B` for primary accents, `#0b0f19` for dark background).
- **Shadows/Radii**: Hardcoded in `.glass-card` (`border-radius: 1rem; box-shadow: ...`).

**Target State (Sprint 1):**
- Semantic CSS variables mapped to Tailwind v4 `@theme`.
- Required Tokens: 
  - `color-primary`, `color-primary-foreground`
  - `color-surface`, `color-surface-muted`, `color-surface-border`
  - Status colors (`success`, `warning`, `destructive`)
  - `radius-sm`, `radius-md`, `radius-lg`
  - Elevation/Shadows (`shadow-card`, `shadow-modal`)

## 2. Layout & Spacing Gap

**Current State:**
- Spacing classes (`p-4`, `p-6`, `p-8`) are used inconsistently. `glass-card` forces specific paddings depending on where it's used.
- Grid breakpoints are mostly `lg:col-span-2`, but lack a unified 12-column responsive standard.

**Target State:**
- Standardized container paddings (e.g., `p-4` mobile, `p-6` desktop).
- Unified AppShell layout that gracefully degrades to mobile without horizontal scrolling.

## 3. Dark Mode Implementation Gap

**Current State:**
- Dark mode is implemented via manual `.dark` overrides on almost every class (e.g., `body.dark .glass-card { ... }`).
- This causes massive CSS bloat and is prone to styling bugs when new components are added without explicit `.dark` overrides.

**Target State:**
- Dark mode should be handled via CSS variable reassignment at the `:root.dark` level.
- Example: `--color-surface` changes from `#ffffff` to `#1e293b`. Components use `bg-surface` and automatically adapt.

## 4. Accessibility (A11y) Gap

**Current State:**
- Focus states are hardcoded on `input:focus` with a specific amber glow.
- `Modal` component lacks focus trapping and `Esc` key handling.
- `btn-primary` contrast ratio on hover in dark mode needs verification.

**Target State:**
- Use standard `focus-visible` Tailwind utilities tied to a semantic `--color-ring`.
- All modals/dialogs implement WAI-ARIA dialog patterns (planned for Sprint 2 with shared `Dialog`).

## Recommendation for Sprint 1
Refactor `index.css` to introduce the root variables and `@theme` block. Update `.glass-card`, `.btn-primary`, and `.kpi-*` classes to consume these new variables to ensure backward compatibility while paving the way for React component migration in Sprint 2.
