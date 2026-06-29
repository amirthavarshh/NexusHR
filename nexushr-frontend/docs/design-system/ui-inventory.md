# NexusHR UI Inventory

This document provides a comprehensive mapping of all routable surfaces across the 4 primary roles (Employee, Admin, Manager, HR) and the Auth flows. 

## 1. Authentication & Onboarding (3 Routes)
- `/login` - Login Page
- `/register` - Registration Page
- `/profile-setup` - Profile Setup Gate

## 2. Employee Hub & Shared Features (AppShell) (8 Routes)
- `/dashboard` - Landing Dashboard
- `/attendance` - Personal Attendance
- `/leaves` - Personal Leaves
- `/goals` - Personal Goals
- `/payroll/me` - Personal Payslips
- `/team` - Team Directory (Gated: Manager, Admin, HR)
- `/reports` - Shared Reports (Gated: Manager, Admin, HR)
- `/payroll/admin` - Payroll Administration (Gated: Manager, Admin, HR)

## 3. Admin Module (`/admin/*`) (11 Routes)
- `/admin/dashboard` - Admin Dashboard
- `/admin/hr` - HR Management
- `/admin/managers` - Manager Management
- `/admin/departments` - Department Management
- `/admin/employees` - Employee Management
- `/admin/attendance` - Attendance Overview
- `/admin/payroll` - Payroll Overview
- `/admin/leaves` - Leave Management
- `/admin/analytics` - System Analytics
- `/admin/roles-permissions` - Roles & Permissions
- `/admin/settings` - Admin Settings

## 4. Manager Module (`/manager/*`) (7 Routes)
- `/manager/dashboard` - Manager Dashboard
- `/manager/roster` - Team Roster
- `/manager/attendance` - Team Attendance Tracker
- `/manager/leaves` - Leave Approvals
- `/manager/goals` - Goals Tracker
- `/manager/reviews` - Performance Reviews
- `/manager/settings` - Manager Settings

## 5. HR Module (`/hr/*`) (8 Routes)
- `/hr/dashboard` - HR Operations Dashboard
- `/hr/employees` - Employee Management
- `/hr/leaves` - Leave Center
- `/hr/attendance` - Attendance Oversight
- `/hr/payroll` - Payroll Processing Center
- `/hr/reviews` - Performance Reviews
- `/hr/goals` - Goals Administration
- `/hr/ai-insights` - AI Workforce Intelligence

---

## Shared Layouts & Shells
1. **AppShell** (`src/components/AppShell.tsx`) - Legacy hub wrapper.
2. **Admin Layout** (`src/admin/components/Layout.tsx`) - Admin sidebar & navbar.
3. **Manager Layout** (`src/manager/components/Layout.tsx`) - Manager sidebar & navbar.
4. **HR Layout** (`src/hr/components/Layout.tsx`) - HR sidebar & navbar.

Total Routable Surfaces: **37**
