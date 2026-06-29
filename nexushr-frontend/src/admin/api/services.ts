import { adminClient } from './client';
import type { 
  HR, Manager, Department, Employee, AttendanceLog, 
  PayrollSlip, LeaveRequest, ActivityLog, RolePermissions, DashboardMetrics 
} from '../types';

// Helper to seed localStorage for mock fallbacks (to allow fully functioning demo)
const getLocalStorageData = <T>(key: string, initialData: T): T => {
  const data = localStorage.getItem(`admin_${key}`);
  if (!data) {
    localStorage.setItem(`admin_${key}`, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

const setLocalStorageData = <T>(key: string, data: T): void => {
  localStorage.setItem(`admin_${key}`, JSON.stringify(data));
};

// Seed Data
const defaultHRs: HR[] = [
  { id: 1, firstName: 'Jessica', lastName: 'Day', email: 'jessica.day@nexushr.com', phone: '555-0192', department: 'HR', position: 'HR Director', status: 'ACTIVE' },
  { id: 2, firstName: 'Winston', lastName: 'Schmidt', email: 'w.schmidt@nexushr.com', phone: '555-0143', department: 'HR', position: 'HR Recruiter', status: 'ACTIVE' }
];

const defaultManagers: Manager[] = [
  { id: 10, firstName: 'Sarah', lastName: 'Connor', email: 'sarah.connor@nexushr.com', phone: '555-0100', department: 'IT', position: 'Engineering Director', status: 'ACTIVE' },
  { id: 11, firstName: 'Michael', lastName: 'Scott', email: 'michael.scott@nexushr.com', phone: '555-0120', department: 'Sales', position: 'Sales Manager', status: 'ACTIVE' }
];

const defaultDepartments: Department[] = [
  { id: 1, name: 'IT', code: 'IT-DEPT', managerId: 10, managerName: 'Sarah Connor', employeeCount: 15, budget: 150000, status: 'ACTIVE' },
  { id: 2, name: 'HR', code: 'HR-DEPT', managerId: 1, managerName: 'Jessica Day', employeeCount: 4, budget: 60000, status: 'ACTIVE' },
  { id: 3, name: 'Finance', code: 'FIN-DEPT', employeeCount: 6, budget: 90000, status: 'ACTIVE' },
  { id: 4, name: 'Sales', code: 'SAL-DEPT', managerId: 11, managerName: 'Michael Scott', employeeCount: 12, budget: 110000, status: 'ACTIVE' },
  { id: 5, name: 'Marketing', code: 'MKT-DEPT', employeeCount: 8, budget: 75000, status: 'ACTIVE' },
  { id: 6, name: 'Operations', code: 'OPS-DEPT', employeeCount: 10, budget: 95000, status: 'ACTIVE' }
];

const defaultActivities: ActivityLog[] = [
  { id: 'act-1', type: 'HR_CREATED', description: 'HR Account created for Winston Schmidt', operator: 'Admin', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'act-2', type: 'MANAGER_CREATED', description: 'Manager Account created for Michael Scott', operator: 'Admin', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'act-3', type: 'DEPT_ASSIGNED', description: 'Assigned Sarah Connor to IT Department', operator: 'Admin', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
];

const defaultMatrix: RolePermissions[] = [
  {
    role: 'ADMIN',
    permissions: [
      { resource: 'HR Management', create: true, read: true, update: true, delete: true },
      { resource: 'Manager Management', create: true, read: true, update: true, delete: true },
      { resource: 'Department Management', create: true, read: true, update: true, delete: true },
      { resource: 'Employee Roster', create: true, read: true, update: true, delete: true },
      { resource: 'Workforce Operations', create: true, read: true, update: true, delete: true },
      { resource: 'Leave Approval Workflow', create: true, read: true, update: true, delete: true },
    ]
  },
  {
    role: 'HR',
    permissions: [
      { resource: 'HR Management', create: false, read: true, update: false, delete: false },
      { resource: 'Manager Management', create: false, read: true, update: false, delete: false },
      { resource: 'Department Management', create: false, read: true, update: false, delete: false },
      { resource: 'Employee Roster', create: true, read: true, update: true, delete: false },
      { resource: 'Workforce Operations', create: true, read: true, update: true, delete: false },
      { resource: 'Leave Approval Workflow', create: true, read: true, update: true, delete: false },
    ]
  },
  {
    role: 'MANAGER',
    permissions: [
      { resource: 'HR Management', create: false, read: false, update: false, delete: false },
      { resource: 'Manager Management', create: false, read: true, update: false, delete: false },
      { resource: 'Department Management', create: false, read: true, update: false, delete: false },
      { resource: 'Employee Roster', create: false, read: true, update: false, delete: false },
      { resource: 'Workforce Operations', create: false, read: true, update: false, delete: false },
      { resource: 'Leave Approval Workflow', create: false, read: true, update: true, delete: false },
    ]
  },
  {
    role: 'EMPLOYEE',
    permissions: [
      { resource: 'HR Management', create: false, read: false, update: false, delete: false },
      { resource: 'Manager Management', create: false, read: false, update: false, delete: false },
      { resource: 'Department Management', create: false, read: false, update: false, delete: false },
      { resource: 'Employee Roster', create: false, read: false, update: false, delete: false },
      { resource: 'Workforce Operations', create: false, read: false, update: false, delete: false },
      { resource: 'Leave Approval Workflow', create: false, read: false, update: false, delete: false },
    ]
  }
];

export const adminServices = {
  // --- DASHBOARD METRICS ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await adminClient.get<DashboardMetrics>('/admin/metrics');
      return res.data;
    } catch {
      // Fallback calculation using live lists
      const hrs = getLocalStorageData<HR[]>('hrs', defaultHRs);
      const mgers = getLocalStorageData<Manager[]>('managers', defaultManagers);
      const depts = getLocalStorageData<Department[]>('departments', defaultDepartments);
      return {
        totalEmployees: 32,
        totalHRs: hrs.length,
        totalManagers: mgers.length,
        totalDepartments: depts.length,
        attendanceToday: 94,
        pendingLeaveRequests: 3,
        payrollProcessed: 91,
        activeUsers: 28
      };
    }
  },

  async getRecentActivities(): Promise<ActivityLog[]> {
    try {
      const res = await adminClient.get<ActivityLog[]>('/admin/activities');
      return res.data;
    } catch {
      return getLocalStorageData<ActivityLog[]>('activities', defaultActivities);
    }
  },

  // --- HR MANAGEMENT ---
  async getAllHRs(): Promise<HR[]> {
    try {
      const res = await adminClient.get<HR[]>('/admin/hr');
      return res.data;
    } catch {
      return getLocalStorageData<HR[]>('hrs', defaultHRs);
    }
  },

  async createHR(payload: Omit<HR, 'id'>): Promise<HR> {
    try {
      const res = await adminClient.post<HR>('/admin/hr', payload);
      return res.data;
    } catch {
      const hrs = getLocalStorageData<HR[]>('hrs', defaultHRs);
      const newHR: HR = { ...payload, id: Date.now() };
      hrs.push(newHR);
      setLocalStorageData('hrs', hrs);
      
      // Log Activity
      this.logActivity('HR_CREATED', `HR Account created for ${payload.firstName} ${payload.lastName}`);
      return newHR;
    }
  },

  async updateHR(id: number, payload: Partial<HR>): Promise<HR> {
    try {
      const res = await adminClient.put<HR>(`/admin/hr/${id}`, payload);
      return res.data;
    } catch {
      const hrs = getLocalStorageData<HR[]>('hrs', defaultHRs);
      const index = hrs.findIndex(h => h.id === id);
      if (index === -1) throw new Error('HR account not found');
      hrs[index] = { ...hrs[index], ...payload };
      setLocalStorageData('hrs', hrs);
      return hrs[index];
    }
  },

  async deleteHR(id: number): Promise<void> {
    try {
      await adminClient.delete(`/admin/hr/${id}`);
    } catch {
      const hrs = getLocalStorageData<HR[]>('hrs', defaultHRs);
      const filtered = hrs.filter(h => h.id !== id);
      setLocalStorageData('hrs', filtered);
    }
  },

  // --- MANAGER MANAGEMENT ---
  async getAllManagers(): Promise<Manager[]> {
    try {
      const res = await adminClient.get<Manager[]>('/admin/managers');
      return res.data;
    } catch {
      return getLocalStorageData<Manager[]>('managers', defaultManagers);
    }
  },

  async createManager(payload: Omit<Manager, 'id'>): Promise<Manager> {
    try {
      const res = await adminClient.post<Manager>('/admin/managers', payload);
      return res.data;
    } catch {
      const managers = getLocalStorageData<Manager[]>('managers', defaultManagers);
      const newManager: Manager = { ...payload, id: Date.now() };
      managers.push(newManager);
      setLocalStorageData('managers', managers);
      
      // Log Activity
      this.logActivity('MANAGER_CREATED', `Manager Account created for ${payload.firstName} ${payload.lastName}`);
      return newManager;
    }
  },

  async updateManager(id: number, payload: Partial<Manager>): Promise<Manager> {
    try {
      const res = await adminClient.put<Manager>(`/admin/managers/${id}`, payload);
      return res.data;
    } catch {
      const managers = getLocalStorageData<Manager[]>('managers', defaultManagers);
      const index = managers.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Manager account not found');
      managers[index] = { ...managers[index], ...payload };
      setLocalStorageData('managers', managers);
      return managers[index];
    }
  },

  async deleteManager(id: number): Promise<void> {
    try {
      await adminClient.delete(`/admin/managers/${id}`);
    } catch {
      const managers = getLocalStorageData<Manager[]>('managers', defaultManagers);
      const filtered = managers.filter(m => m.id !== id);
      setLocalStorageData('managers', filtered);
    }
  },

  // --- DEPARTMENT MANAGEMENT ---
  async getAllDepartments(): Promise<Department[]> {
    try {
      const res = await adminClient.get<Department[]>('/admin/departments');
      return res.data;
    } catch {
      return getLocalStorageData<Department[]>('departments', defaultDepartments);
    }
  },

  async createDepartment(payload: Omit<Department, 'id' | 'employeeCount'>): Promise<Department> {
    try {
      const res = await adminClient.post<Department>('/admin/departments', payload);
      return res.data;
    } catch {
      const depts = getLocalStorageData<Department[]>('departments', defaultDepartments);
      const newDept: Department = { ...payload, id: Date.now(), employeeCount: 0 };
      depts.push(newDept);
      setLocalStorageData('departments', depts);
      return newDept;
    }
  },

  async updateDepartment(id: number, payload: Partial<Department>): Promise<Department> {
    try {
      const res = await adminClient.put<Department>(`/admin/departments/${id}`, payload);
      return res.data;
    } catch {
      const depts = getLocalStorageData<Department[]>('departments', defaultDepartments);
      const index = depts.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Department not found');
      depts[index] = { ...depts[index], ...payload };
      
      // Update manager name if assigned
      if (payload.managerId) {
        const managers = getLocalStorageData<Manager[]>('managers', defaultManagers);
        const mgr = managers.find(m => m.id === payload.managerId);
        if (mgr) {
          depts[index].managerName = `${mgr.firstName} ${mgr.lastName}`;
          this.logActivity('DEPT_ASSIGNED', `Assigned ${mgr.firstName} ${mgr.lastName} to ${depts[index].name} Department`);
        }
      }
      
      setLocalStorageData('departments', depts);
      return depts[index];
    }
  },

  async deleteDepartment(id: number): Promise<void> {
    try {
      await adminClient.delete(`/admin/departments/${id}`);
    } catch {
      const depts = getLocalStorageData<Department[]>('departments', defaultDepartments);
      const filtered = depts.filter(d => d.id !== id);
      setLocalStorageData('departments', filtered);
    }
  },

  // --- EMPLOYEE MODULE INTEGRATION ---
  async getEmployees(): Promise<Employee[]> {
    try {
      // Integration with core GET /employees
      const res = await adminClient.get<Employee[]>('/employees');
      return res.data;
    } catch {
      // Return custom mock list
      return [
        { id: 2, firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@nexushr.com', phone: '555-0102', department: 'IT', position: 'Senior Java Engineer', hireDate: '2025-01-15', salary: 8580, status: 'ACTIVE', performanceRating: 4.2 },
        { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@nexushr.com', phone: '555-0103', department: 'IT', position: 'Junior QA Engineer', hireDate: '2025-06-01', salary: 3661, status: 'ACTIVE', performanceRating: 2.3 },
        { id: 4, firstName: 'Clara', lastName: 'Danvers', email: 'clara.d@nexushr.com', phone: '555-0104', department: 'Marketing', position: 'Marketing Lead', hireDate: '2025-03-10', salary: 6200, status: 'ACTIVE', performanceRating: 3.8 },
        { id: 5, firstName: 'Wade', lastName: 'Wilson', email: 'wade.w@nexushr.com', phone: '555-0105', department: 'Sales', position: 'Sales Associate', hireDate: '2025-07-20', salary: 4500, status: 'ON_LEAVE', performanceRating: 3.1 }
      ];
    }
  },

  async deleteEmployee(id: number): Promise<void> {
    try {
      await adminClient.delete(`/employees/${id}`);
    } catch {
      this.logActivity('EMPLOYEE_DELETED', `Terminated Employee Profile with ID ${id}`);
    }
  },

  // --- ATTENDANCE OVERVIEW ---
  async getAttendanceToday(): Promise<AttendanceLog[]> {
    try {
      const res = await adminClient.get<AttendanceLog[]>('/attendance');
      return res.data;
    } catch {
      return [
        { id: 1, employeeId: 2, employeeName: 'Alice Smith', department: 'IT', date: new Date().toISOString().split('T')[0], clockIn: '08:45:00', clockOut: '17:15:00', status: 'PRESENT' },
        { id: 2, employeeId: 3, employeeName: 'Bob Johnson', department: 'IT', date: new Date().toISOString().split('T')[0], clockIn: '09:25:00', clockOut: '17:05:00', status: 'LATE' },
        { id: 3, employeeId: 4, employeeName: 'Clara Danvers', department: 'Marketing', date: new Date().toISOString().split('T')[0], clockIn: '08:58:00', clockOut: '17:00:00', status: 'PRESENT' },
        { id: 4, employeeId: 5, employeeName: 'Wade Wilson', department: 'Sales', date: new Date().toISOString().split('T')[0], status: 'ABSENT' }
      ];
    }
  },

  // --- PAYROLL OVERVIEW ---
  async getPayrollSummary(): Promise<PayrollSlip[]> {
    try {
      const res = await adminClient.get<PayrollSlip[]>('/payroll');
      return res.data;
    } catch {
      return [
        { id: 1, employeeId: 2, employeeName: 'Alice Smith', department: 'IT', payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 8580, allowances: 858, deductions: 0, netSalary: 9438, status: 'PAID', processedAt: '2026-06-25T10:00:00Z' },
        { id: 2, employeeId: 3, employeeName: 'Bob Johnson', department: 'IT', payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 3661, allowances: 366, deductions: 166, netSalary: 3861, status: 'DRAFT' },
        { id: 3, employeeId: 4, employeeName: 'Clara Danvers', department: 'Marketing', payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 6200, allowances: 620, deductions: 0, netSalary: 6820, status: 'PAID', processedAt: '2026-06-25T10:10:00Z' }
      ];
    }
  },

  // --- LEAVE MANAGEMENT ---
  async getAllLeaves(): Promise<LeaveRequest[]> {
    try {
      const res = await adminClient.get<LeaveRequest[]>('/leaves');
      // Format backend response to match our workflow matrix
      return res.data.map((l: any) => ({
        id: l.id,
        requesterId: l.employee?.id || 0,
        requesterName: l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : 'N/A',
        requesterRole: l.employee?.user?.role || 'EMPLOYEE',
        startDate: l.startDate,
        endDate: l.endDate,
        reason: l.reason,
        type: l.type,
        status: l.status,
        approvedBy: l.approvedBy,
        workflowStage: l.status === 'PENDING' ? 'HR_APPROVAL' : 'COMPLETED'
      }));
    } catch {
      return getLocalStorageData<LeaveRequest[]>('leaves', [
        { id: 1, requesterId: 1, requesterName: 'Jessica Day', requesterRole: 'HR', startDate: '2026-07-10', endDate: '2026-07-15', reason: 'Summer Vacation', type: 'ANNUAL', status: 'PENDING', workflowStage: 'ADMIN_APPROVAL' },
        { id: 2, requesterId: 5, requesterName: 'Wade Wilson', requesterRole: 'EMPLOYEE', startDate: '2026-06-28', endDate: '2026-06-30', reason: 'Medical Leave', type: 'SICK', status: 'APPROVED', approvedBy: 'Sarah Connor', workflowStage: 'COMPLETED' }
      ]);
    }
  },

  async approveLeave(id: number): Promise<LeaveRequest> {
    try {
      const res = await adminClient.post<LeaveRequest>(`/leaves/${id}/approve`);
      return res.data;
    } catch {
      const leaves = getLocalStorageData<LeaveRequest[]>('leaves', []);
      const idx = leaves.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Leave Request not found');
      leaves[idx].status = 'APPROVED';
      leaves[idx].approvedBy = 'Admin';
      leaves[idx].workflowStage = 'COMPLETED';
      setLocalStorageData('leaves', leaves);
      
      // Log activity
      this.logActivity('LEAVE_APPROVED', `Admin approved HR leave request for ${leaves[idx].requesterName}`);
      return leaves[idx];
    }
  },

  async rejectLeave(id: number): Promise<LeaveRequest> {
    try {
      const res = await adminClient.post<LeaveRequest>(`/leaves/${id}/reject`);
      return res.data;
    } catch {
      const leaves = getLocalStorageData<LeaveRequest[]>('leaves', []);
      const idx = leaves.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Leave Request not found');
      leaves[idx].status = 'REJECTED';
      leaves[idx].approvedBy = 'Admin';
      leaves[idx].workflowStage = 'COMPLETED';
      setLocalStorageData('leaves', leaves);
      return leaves[idx];
    }
  },

  // --- ROLES & PERMISSIONS ---
  async getRolesPermissions(): Promise<RolePermissions[]> {
    try {
      const res = await adminClient.get<RolePermissions[]>('/admin/roles-permissions');
      return res.data;
    } catch {
      return getLocalStorageData<RolePermissions[]>('matrix', defaultMatrix);
    }
  },

  async updateRolePermissions(role: string, permissions: RolePermissions['permissions']): Promise<RolePermissions> {
    try {
      const res = await adminClient.put<RolePermissions>(`/admin/roles-permissions/${role}`, { permissions });
      return res.data;
    } catch {
      const matrix = getLocalStorageData<RolePermissions[]>('matrix', defaultMatrix);
      const idx = matrix.findIndex(m => m.role === role);
      if (idx === -1) throw new Error('Role not found');
      matrix[idx].permissions = permissions;
      setLocalStorageData('matrix', matrix);
      return matrix[idx];
    }
  },

  // Helper activity logger
  logActivity(type: ActivityLog['type'], description: string): void {
    const logs = getLocalStorageData<ActivityLog[]>('activities', defaultActivities);
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      description,
      operator: 'Admin',
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    setLocalStorageData('activities', logs.slice(0, 20)); // Limit to last 20
  }
};
