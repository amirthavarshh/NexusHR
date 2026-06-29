# UI Refactor Risk Assessment

This document assesses the risks associated with executing the 10-Sprint Design System Standardization Epic. A core constraint of this epic is **No Backend Changes**.

## 1. API Contract & Backend Compatibility Risks

**Risk Level: HIGH**
The UI refactoring must map to the exact JSON shapes currently expected by the backend. 
- **Employee Hub Data Fetching:** Currently relies on raw `api.ts` fetches. Migrating this to TanStack Query (Sprint 4) carries a risk of mutating the expected payload or query shapes if not carefully verified against the existing Java models.
- **Form Validations:** The UI must handle backend `400 Bad Request` `{ message }` payload structures consistently. Changing to standardized `FormField` patterns (Sprint 7) must not break how these errors are displayed.
- **Forgot Password UX:** The frontend currently lacks a Forgot Password flow, and the backend lacks an endpoint. *Mitigation:* Explicitly excluded from scope; do not attempt to add UI for missing backend features.

## 2. Component Migration Risks

**Risk Level: HIGH**
- **Big-Bang Import Changes:** Moving `admin/components/ui/index.tsx` to `src/components/ui/index.ts` will break all Admin and Manager routes instantly.
- *Mitigation:* Implement a "re-export shim" in `admin/components/ui/index.tsx` during Sprint 2. This allows Admin/Manager pages to continue compiling while they are migrated page-by-page.

## 3. Style Regression Risks

**Risk Level: MEDIUM**
- **Dark Mode Breakage:** Converting hardcoded `#0b0f19` and rgba values to CSS variables (Sprint 1) could break contrast on complex components like glass cards.
- *Mitigation:* Retain `.glass-card` and `.btn-primary` legacy classes in `index.css` but rewire their internals to use the new `@theme` tokens. Do not delete the old classes until Sprint 9.

## 4. State Management Risks

**Risk Level: LOW**
- **Auth Session Expiry:** Moving session expiry (401 handling) to `AuthContext` (Sprint 3) could cause infinite redirect loops if the `ProtectedRoute` and the api client interceptors race each other.
- *Mitigation:* Ensure `AuthContext` is the single source of truth for triggering the `/login` redirect on 401s.

## Sign-off
This risk assessment confirms that the 10-Sprint UI refactor can be executed safely provided the backend constraints are strictly honored and the re-export shim is utilized for component migration.
