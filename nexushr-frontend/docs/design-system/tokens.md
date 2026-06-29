# Design Tokens Standard

This document outlines the canonical design tokens for the NexusHR Design System, implemented in Sprint 1 via Tailwind v4's `@theme` directive and standard CSS variables in `index.css`.

## 1. Color Palette

All colors are controlled via CSS variables mapped to Tailwind `@theme`. Dark mode automatically inverts these variables using the `.dark` selector, eliminating the need to use `dark:` utility classes manually on every component.

| Token | Light Mode Value | Dark Mode Value | Tailwind Class |
|---|---|---|---|
| `--primary` | `#B8860B` (Amber) | `#FBBF24` (Yellow) | `bg-primary`, `text-primary` |
| `--primary-foreground` | `#ffffff` | `#1e293b` | `text-primary-foreground` |
| `--surface` | `rgba(255, 255, 255, 0.9)` | `rgba(30, 41, 59, 0.7)` | `bg-surface` |
| `--surface-muted` | `#f1f5f9` | `#0f172a` | `bg-surface-muted` |
| `--surface-border` | `rgba(226, 232, 240, 0.8)` | `rgba(255, 255, 255, 0.08)`| `border-surface-border` |
| `--background` | `#f1f5f9` | `#0b0f19` | `bg-background` |
| `--foreground` | `#1e293b` | `#e2e8f0` | `text-foreground` |
| `--success` | `#10b981` | `#34d399` | `text-success` |
| `--warning` | `#f59e0b` | `#fbbf24` | `text-warning` |
| `--destructive` | `#ef4444` | `#f87171` | `text-destructive` |

## 2. Typography Scale

Fonts are mapped globally and via Tailwind.

- **Display Typeface:** `Outfit` (`font-display`) — used for headers and primary numbers.
- **Body Typeface:** `Plus Jakarta Sans` (`font-sans`) — used for all standard UI text.

## 3. Shape & Elevation

- **Radius:** `--radius-md` (0.5rem), `--radius-lg` (1rem).
- **Shadow:** `--shadow-card` provides the standard ambient shadow + top inner highlight for the glassmorphism aesthetic.
- **Hover Shadow:** `--shadow-card-hover` increases the elevation.

---

## 4. Component Deprecation Map

As part of the Sprint 1 foundation, legacy CSS classes have been refactored under the hood to consume the new variables. In Sprint 2, these legacy classes will be actively deprecated in favor of React components.

| Legacy CSS Class | Status | Sprint 2 Migration Target |
|---|---|---|
| `.glass-card` | ✅ Refactored to use `--surface` and `--shadow-card` | `<Card>` (Shared) |
| `.btn-primary` | ✅ Refactored to use `--primary` | `<Button variant="default">` |
| `.btn-secondary`| ⏳ Pending (Still uses hardcoded values) | `<Button variant="secondary">` |
| `.kpi-amber` | ⏳ Pending (Still uses hardcoded values) | Update to semantic `<Card>` variants |
