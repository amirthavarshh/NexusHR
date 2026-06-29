// HR Module TypeScript Types
// Reuses domain types from the shared domain.ts and adds HR-specific composites

export type { 
  Employee, Attendance, LeaveRequest, Payroll, 
  Goal, PerformanceReview, AttritionReport, SkillGapReport,
  WorkforceMetrics, LeaveStatus, LeaveType, GoalStatus, 
  AttendanceStatus, EmployeeStatus, PayrollStatus, Role
} from '../../types/domain';

// HR-specific composite types for local state and seeds
export interface HrMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveCount: number;
  terminatedCount: number;
  averageSalary: number;
  totalPayroll: number;
  averagePerformance: number;
  pendingLeaves: number;
  departmentDistribution: Record<string, number>;
  leaveTypeBreakdown: Record<string, number>;
}

export interface HrActivity {
  id: number;
  type: 'HIRE' | 'TERMINATE' | 'LEAVE_ACTION' | 'PAYROLL_RUN' | 'REVIEW' | 'GOAL';
  description: string;
  actor: string;
  timestamp: string;
}
