# UI Component Inventory & Duplication Matrix

This document provides an inventory of the UI components across NexusHR and analyzes duplication between the three styling strategies in use: raw CSS utilities, shared components, and admin components.

## Component Library Usage by Module

| Component Source | Usage in Employee Hub | Usage in Admin Module | Usage in Manager Module | Usage in HR Module |
|---|---|---|---|---|
| **Raw Tailwind / CSS (`index.css`)** | High (Primary pattern) | Medium | Medium | Low |
| **`src/components/ui`** (Shared) | Low (Modal, Toast) | None | None | None |
| **`src/admin/components/ui`** | None | High (Primary pattern) | High (Primary pattern) | High (Primary pattern) |

## CSS Utility Duplication

Legacy CSS classes in `index.css` act as a parallel component API that overlaps heavily with the React components in `admin/components/ui`:

| Legacy CSS Class | Occurrences | React Component Equivalent | Target Migration |
|---|---|---|---|
| `.btn-primary` | ~25 uses | `<Button variant="default">` | Replace raw `<button>` and `<Button className="btn-primary">` |
| `.glass-card` | ~45 uses | `<Card>` | Replace raw `<div>` with `<Card>` |

## React Component Duplication Matrix

Currently, the `src/components/ui` folder contains only 3 primitives, while `src/admin/components/ui` contains a full suite. 

| Primitive | Exists in Shared UI? | Exists in Admin UI? | Duplication / Gap Status |
|---|---|---|---|
| **Button** | No | Yes | Gap: Employee hub uses raw HTML/CSS. |
| **Card** | No | Yes | Gap: Employee hub uses raw HTML/CSS. |
| **Input** | No | Yes | Gap: Employee hub uses raw HTML/CSS. |
| **Select** | No | Yes | Gap: Employee hub uses raw HTML/CSS. |
| **Modal / Dialog**| Yes (`Modal`) | Yes (`Dialog`) | **Duplication**: `Modal` lacks accessibility; `Dialog` is robust. |
| **Toast** | Yes | No | Gap: Admin/Manager rely on context wrapper instead of direct component. |
| **Skeleton** | Yes | No | Gap: Admin/Manager use `animate-pulse` divs instead. |
| **Table** | No | Yes | Gap: Employee hub uses raw HTML tables. |
| **Badge** | No | Yes | Gap: Employee hub uses raw HTML/CSS spans. |
| **Tabs** | No | Yes | Gap: Shared pages use state-based rendering. |

## Refactor Risk Level: HIGH
Migrating Admin and Manager modules to use `src/components/ui` requires moving the entire `admin/components/ui` suite and updating import paths across ~26 pages. A re-export shim in `admin/components/ui/index.tsx` is highly recommended to prevent breaking changes during the transition.
