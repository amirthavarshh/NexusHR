# UI Consistency Report

This report outlines visual and behavioral inconsistencies across the NexusHR frontend modules. These findings establish the baseline debt that Sprints 2-8 will resolve.

## High Severity Findings

| Component/Pattern | Employee/HR AppShell | Admin / Manager Modules | Resolution Plan |
|---|---|---|---|
| **Buttons** | Uses `.btn-primary` on raw HTML `<button>`. | Uses `<Button variant="default">`. | **Sprint 2:** Migrate all buttons to shared `<Button>` primitive. |
| **Cards & Surfaces** | Uses `.glass-card` CSS class. | Uses `<Card>` React component. | **Sprint 2:** Migrate all surfaces to shared `<Card>` primitive. |
| **Modals / Dialogs** | Uses `Modal` from `src/components/ui` (lacks a11y focus traps). | Uses `Dialog` from `admin/components/ui` (robust but module-locked). | **Sprint 2:** Consolidate on shared `Dialog` component. |

## Medium Severity Findings

| Issue | Description | Affected Areas | Resolution Plan |
|---|---|---|---|
| **Typography Sizes** | Inconsistent micro-typography. Codebase mixes `text-[10px]`, `text-[11px]`, and `text-xs` in sidebars and table headers. | All Navigation, Data Tables | **Sprint 1/2:** Standardize to `text-xs` for body and `text-[11px]` for labels via tokens. |
| **Form Layouts** | Auth and Employee forms lack consistent spacing and error handling. Admin uses tight grids. | Auth, Employee Features | **Sprint 7:** Establish `FormField` pattern. |
| **Data Fetching** | Employee hub uses ad-hoc `api.ts` fetch with local state (`useState`, `useEffect`). Admin uses TanStack Query. | All Employee Pages | **Sprint 4:** Migrate Employee pages to TanStack Query hooks. |
| **Mock Analytics** | Admin dashboard and analytics pages use mock data mixed with real API metrics. | Admin Dashboards | **Sprint 9:** Document as product debt; label mock data clearly. |

## Low Severity Findings

| Issue | Description | Resolution Plan |
|---|---|---|
| **Icons** | Mixing of different lucide-react icon weights or sizes across headers. | **Sprint 6:** Normalize in Navbar/Sidebar extraction. |
| **Empty States** | Some lists show empty tables, others show text, others show nothing. | **Sprint 7:** Standardize `EmptyState` component. |
