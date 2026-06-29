export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'HR';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
export type LeaveType = 'ANNUAL' | 'SICK' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PayrollStatus = 'DRAFT' | 'PAID';
export type GoalStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface UserSession {
  token: string;
  username: string;
  email: string;
  role: Role;
  employeeId: number | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  hireDate?: string;
  salary: number;
  status: EmployeeStatus;
  performanceRating?: number;
  user?: User;
}

export interface Attendance {
  id: number;
  employee?: Employee;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: number;
  employee?: Employee;
  startDate: string;
  endDate: string;
  reason: string;
  type: LeaveType;
  status: LeaveStatus;
  approvedBy?: string;
}

export interface Payroll {
  id: number;
  employee?: Employee;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt?: string;
}

export interface Goal {
  id: number;
  employee?: Employee;
  title: string;
  description?: string;
  targetDate: string;
  status: GoalStatus;
}

export interface PerformanceReview {
  id: number;
  employee?: Employee;
  reviewer?: User;
  reviewDate: string;
  rating: number;
  feedback: string;
  goals: string;
}

export interface AttritionReport {
  employeeId: number;
  employeeName: string;
  riskScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

export interface SkillGapItem {
  skill: string;
  current: number;
  target: number;
}

export interface SkillGapReport {
  employeeId: number;
  employeeName: string;
  position: string;
  skills: SkillGapItem[];
  recommendations: string;
}

export interface WorkforceMetrics {
  totalEmployees: number;
  averageSalary: number;
  averagePerformance: number;
  departmentDistribution: Record<string, number>;
}
