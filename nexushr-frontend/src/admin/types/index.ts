export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
}

export interface HR {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
  user?: User;
}

export interface Manager {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
  user?: User;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  managerId?: number;
  managerName?: string;
  employeeCount: number;
  budget: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  performanceRating?: number;
  user?: User;
}

export interface AttendanceLog {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
}

export interface PayrollSlip {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'DRAFT' | 'PAID';
  processedAt?: string;
}

export interface LeaveRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterRole: 'EMPLOYEE' | 'MANAGER' | 'HR';
  startDate: string;
  endDate: string;
  reason: string;
  type: 'ANNUAL' | 'SICK' | 'UNPAID';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  workflowStage: 'MANAGER_APPROVAL' | 'HR_APPROVAL' | 'ADMIN_APPROVAL' | 'COMPLETED';
}

export interface ActivityLog {
  id: string;
  type: 'HR_CREATED' | 'MANAGER_CREATED' | 'DEPT_ASSIGNED' | 'EMPLOYEE_DELETED' | 'LEAVE_APPROVED';
  description: string;
  operator: string;
  timestamp: string;
}

export interface RolePermissions {
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  permissions: {
    resource: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface DashboardMetrics {
  totalEmployees: number;
  totalHRs: number;
  totalManagers: number;
  totalDepartments: number;
  attendanceToday: number;
  pendingLeaveRequests: number;
  payrollProcessed: number;
  activeUsers: number;
}
