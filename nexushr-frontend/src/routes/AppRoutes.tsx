import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppShell } from '../components/AppShell';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ProfileSetupGate } from '../features/auth/ProfileSetupGate';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AttendancePage } from '../features/attendance/AttendancePage';
import { LeavesPage } from '../features/leaves/LeavesPage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { TeamDirectoryPage } from '../features/team/TeamDirectoryPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { PayrollPage } from '../features/payroll/PayrollPage';

// Admin Module Page Imports
import { Layout as AdminLayout } from '../admin/components/Layout';
import { Dashboard as AdminDashboard } from '../admin/pages/Dashboard';
import { HrManagement } from '../admin/pages/HrManagement';
import { ManagerManagement } from '../admin/pages/ManagerManagement';
import { DepartmentManagement } from '../admin/pages/DepartmentManagement';
import { EmployeeManagement as AdminEmployeeManagement } from '../admin/pages/EmployeeManagement';
import { AttendanceOverview } from '../admin/pages/AttendanceOverview';
import { PayrollOverview } from '../admin/pages/PayrollOverview';
import { LeaveManagement as AdminLeaveManagement } from '../admin/pages/LeaveManagement';
import { Analytics as AdminAnalytics } from '../admin/pages/Analytics';
import { RolesPermissions } from '../admin/pages/RolesPermissions';
import { Settings as AdminSettings } from '../admin/pages/Settings';

// Manager Module Page Imports
import { Layout as ManagerLayout } from '../manager/components/Layout';
import { Dashboard as ManagerDashboard } from '../manager/pages/Dashboard';
import { TeamRoster as ManagerTeamRoster } from '../manager/pages/TeamRoster';
import { AttendanceTracker as ManagerAttendanceTracker } from '../manager/pages/AttendanceTracker';
import { LeavesApprovals as ManagerLeavesApprovals } from '../manager/pages/LeavesApprovals';
import { GoalsTracker as ManagerGoalsTracker } from '../manager/pages/GoalsTracker';
import { PerformanceReviews as ManagerPerformanceReviews } from '../manager/pages/PerformanceReviews';
import { Settings as ManagerSettings } from '../manager/pages/Settings';

// HR Module Page Imports
import { Layout as HrLayout } from '../hr/components/Layout';
import { Dashboard as HrDashboard } from '../hr/pages/Dashboard';
import { EmployeeManagement as HrEmployeeManagement } from '../hr/pages/EmployeeManagement';
import { LeaveCenter as HrLeaveCenter } from '../hr/pages/LeaveCenter';
import { AttendanceOversight as HrAttendanceOversight } from '../hr/pages/AttendanceOversight';
import { PayrollCenter as HrPayrollCenter } from '../hr/pages/PayrollCenter';
import { ReviewsManagement as HrReviewsManagement } from '../hr/pages/ReviewsManagement';
import { GoalsAdministration as HrGoalsAdministration } from '../hr/pages/GoalsAdministration';
import { AIInsights as HrAIInsights } from '../hr/pages/AIInsights';

// Role-based landing redirect for dashboard path
const DashboardLanding: React.FC = () => {
  const { session } = useAuth();
  if (session?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (session?.role === 'MANAGER') {
    return <Navigate to="/manager/dashboard" replace />;
  }
  if (session?.role === 'HR') {
    return <Navigate to="/hr/dashboard" replace />;
  }
  return <DashboardPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Profile Gate */}
      <Route path="/profile-setup" element={<ProfileSetupGate />} />

      {/* Admin Module nested routing */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hr" element={<HrManagement />} />
        <Route path="managers" element={<ManagerManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="employees" element={<AdminEmployeeManagement />} />
        <Route path="attendance" element={<AttendanceOverview />} />
        <Route path="payroll" element={<PayrollOverview />} />
        <Route path="leaves" element={<AdminLeaveManagement />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="roles-permissions" element={<RolesPermissions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Manager Module nested routing */}
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="roster" element={<ManagerTeamRoster />} />
        <Route path="attendance" element={<ManagerAttendanceTracker />} />
        <Route path="leaves" element={<ManagerLeavesApprovals />} />
        <Route path="goals" element={<ManagerGoalsTracker />} />
        <Route path="reviews" element={<ManagerPerformanceReviews />} />
        <Route path="settings" element={<ManagerSettings />} />
      </Route>

      {/* HR Module nested routing */}
      <Route path="/hr" element={<HrLayout />}>
        <Route index element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="dashboard"   element={<HrDashboard />} />
        <Route path="employees"   element={<HrEmployeeManagement />} />
        <Route path="leaves"      element={<HrLeaveCenter />} />
        <Route path="attendance"  element={<HrAttendanceOversight />} />
        <Route path="payroll"     element={<HrPayrollCenter />} />
        <Route path="reviews"     element={<HrReviewsManagement />} />
        <Route path="goals"       element={<HrGoalsAdministration />} />
        <Route path="ai-insights" element={<HrAIInsights />} />
      </Route>
      
      {/* Protected Layout Routes */}
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Core Hub */}
        <Route path="dashboard" element={<DashboardLanding />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="payroll/me" element={<PayrollPage roleView="employee" />} />

        {/* Management Gated */}
        <Route path="team" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'HR']}><TeamDirectoryPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'HR']}><ReportsPage /></ProtectedRoute>} />
        <Route path="payroll/admin" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'HR']}><PayrollPage roleView="manager" /></ProtectedRoute>} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

