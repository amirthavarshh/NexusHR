// HR Module API Services
// Wires all backend HR-accessible endpoints with high-fidelity localStorage fallback seeds

import { adminClient } from '../../admin/api/client';
import type { Employee, Attendance, LeaveRequest, Payroll, Goal, PerformanceReview } from '../../types/domain';
import type { HrMetrics, HrActivity } from '../types';

// ─── Local Storage Helpers ───────────────────────────────────────────────────
const getLS = <T>(key: string, seed: T): T => {
  try {
    const raw = localStorage.getItem(`hr_${key}`);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
};
const setLS = <T>(key: string, data: T) => {
  localStorage.setItem(`hr_${key}`, JSON.stringify(data));
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedEmployees: Employee[] = [
  { id: 101, firstName: 'Alice', lastName: 'Morgan', email: 'alice@nexushr.com', phone: '+1-555-0101', department: 'Engineering', position: 'Senior Engineer', hireDate: '2021-03-15', salary: 9500, status: 'ACTIVE', performanceRating: 4.5 },
  { id: 102, firstName: 'Bob', lastName: 'Chen', email: 'bob@nexushr.com', phone: '+1-555-0102', department: 'Engineering', position: 'Lead Developer', hireDate: '2020-06-01', salary: 11000, status: 'ACTIVE', performanceRating: 4.8 },
  { id: 103, firstName: 'Carol', lastName: 'Davis', email: 'carol@nexushr.com', phone: '+1-555-0103', department: 'Product', position: 'QA Engineer', hireDate: '2022-01-10', salary: 7500, status: 'ACTIVE', performanceRating: 3.9 },
  { id: 104, firstName: 'David', lastName: 'Kim', email: 'david@nexushr.com', phone: '+1-555-0104', department: 'Marketing', position: 'Junior Developer', hireDate: '2023-08-20', salary: 5500, status: 'ACTIVE', performanceRating: 3.5 },
  { id: 105, firstName: 'Emma', lastName: 'Wilson', email: 'emma@nexushr.com', phone: '+1-555-0105', department: 'Sales', position: 'Sales Engineer', hireDate: '2021-11-05', salary: 7200, status: 'ACTIVE', performanceRating: 4.2 },
  { id: 106, firstName: 'Frank', lastName: 'Reyes', email: 'frank@nexushr.com', phone: '+1-555-0106', department: 'HR', position: 'HR Specialist', hireDate: '2022-04-12', salary: 6800, status: 'ON_LEAVE', performanceRating: 4.0 },
  { id: 107, firstName: 'Grace', lastName: 'Patel', email: 'grace@nexushr.com', phone: '+1-555-0107', department: 'Engineering', position: 'DevOps Engineer', hireDate: '2020-09-30', salary: 10200, status: 'ACTIVE', performanceRating: 4.6 },
  { id: 108, firstName: 'Henry', lastName: 'Park', email: 'henry@nexushr.com', phone: '+1-555-0108', department: 'Product', position: 'Product Manager', hireDate: '2019-05-15', salary: 12000, status: 'ACTIVE', performanceRating: 4.7 },
];

const seedLeaves: LeaveRequest[] = [
  { id: 1, employee: seedEmployees[0], startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Annual vacation', type: 'ANNUAL', status: 'PENDING' },
  { id: 2, employee: seedEmployees[2], startDate: '2026-07-10', endDate: '2026-07-12', reason: 'Medical appointment', type: 'SICK', status: 'PENDING' },
  { id: 3, employee: seedEmployees[4], startDate: '2026-06-20', endDate: '2026-06-22', reason: 'Family event', type: 'ANNUAL', status: 'APPROVED', approvedBy: 'hr_manager' },
  { id: 4, employee: seedEmployees[1], startDate: '2026-07-15', endDate: '2026-07-16', reason: 'Personal errands', type: 'UNPAID', status: 'REJECTED' },
  { id: 5, employee: seedEmployees[5], startDate: '2026-07-08', endDate: '2026-07-25', reason: 'Medical leave', type: 'SICK', status: 'APPROVED', approvedBy: 'hr_manager' },
];

const seedAttendance: Attendance[] = [
  { id: 1, employee: seedEmployees[0], date: '2026-06-29', clockIn: '08:55', clockOut: '17:30', status: 'PRESENT' },
  { id: 2, employee: seedEmployees[1], date: '2026-06-29', clockIn: '09:18', clockOut: '18:00', status: 'LATE' },
  { id: 3, employee: seedEmployees[2], date: '2026-06-29', clockIn: '09:02', clockOut: '17:15', status: 'PRESENT' },
  { id: 4, employee: seedEmployees[3], date: '2026-06-29', clockIn: undefined, clockOut: undefined, status: 'ABSENT' },
  { id: 5, employee: seedEmployees[4], date: '2026-06-29', clockIn: '08:45', clockOut: '17:00', status: 'PRESENT' },
  { id: 6, employee: seedEmployees[5], date: '2026-06-29', clockIn: undefined, clockOut: undefined, status: 'ABSENT' },
  { id: 7, employee: seedEmployees[6], date: '2026-06-29', clockIn: '08:59', clockOut: '17:45', status: 'PRESENT' },
  { id: 8, employee: seedEmployees[7], date: '2026-06-29', clockIn: '09:00', clockOut: '18:30', status: 'PRESENT' },
];

const seedPayrolls: Payroll[] = [
  { id: 1, employee: seedEmployees[0], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 9500, allowances: 500, deductions: 950, netSalary: 9050, status: 'PAID', processedAt: '2026-06-28' },
  { id: 2, employee: seedEmployees[1], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 11000, allowances: 800, deductions: 1100, netSalary: 10700, status: 'PAID', processedAt: '2026-06-28' },
  { id: 3, employee: seedEmployees[2], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 7500, allowances: 300, deductions: 750, netSalary: 7050, status: 'DRAFT' },
  { id: 4, employee: seedEmployees[3], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 5500, allowances: 200, deductions: 550, netSalary: 5150, status: 'DRAFT' },
  { id: 5, employee: seedEmployees[4], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 7200, allowances: 350, deductions: 720, netSalary: 6830, status: 'PAID', processedAt: '2026-06-28' },
  { id: 6, employee: seedEmployees[5], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 6800, allowances: 300, deductions: 680, netSalary: 6420, status: 'DRAFT' },
  { id: 7, employee: seedEmployees[6], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 10200, allowances: 600, deductions: 1020, netSalary: 9780, status: 'PAID', processedAt: '2026-06-28' },
  { id: 8, employee: seedEmployees[7], payPeriodStart: '2026-06-01', payPeriodEnd: '2026-06-30', basicSalary: 12000, allowances: 900, deductions: 1200, netSalary: 11700, status: 'PAID', processedAt: '2026-06-28' },
];

const seedGoals: Goal[] = [
  { id: 1, employee: seedEmployees[0], title: 'Reduce API latency by 40%', description: 'Optimize database queries and add caching layers', targetDate: '2026-09-30', status: 'IN_PROGRESS' },
  { id: 2, employee: seedEmployees[1], title: 'Complete React 19 migration', description: 'Migrate legacy class components to functional hooks', targetDate: '2026-08-15', status: 'COMPLETED' },
  { id: 3, employee: seedEmployees[2], title: 'Achieve 90% test coverage', description: 'Write unit and integration tests for all critical paths', targetDate: '2026-10-01', status: 'PENDING' },
  { id: 4, employee: seedEmployees[3], title: 'Deliver onboarding feature', description: 'Build employee onboarding wizard end-to-end', targetDate: '2026-07-31', status: 'IN_PROGRESS' },
  { id: 5, employee: seedEmployees[4], title: 'Expand enterprise client base', description: 'Sign 3 new enterprise contracts this quarter', targetDate: '2026-09-01', status: 'PENDING' },
];

const seedReviews: PerformanceReview[] = [
  { id: 1, employee: seedEmployees[0], reviewer: { id: 99, username: 'hr_admin', email: 'hr@nexushr.com', role: 'HR' }, reviewDate: '2026-06-15', rating: 4.5, feedback: 'Alice consistently delivers high-quality work and exceeds project deadlines. Outstanding leadership on the infrastructure migration project.', goals: 'Mentor two junior engineers' },
  { id: 2, employee: seedEmployees[1], reviewer: { id: 99, username: 'hr_admin', email: 'hr@nexushr.com', role: 'HR' }, reviewDate: '2026-06-14', rating: 4.8, feedback: 'Bob is an exceptional senior engineer with deep TypeScript expertise. His codebase contributions have significantly improved system reliability.', goals: 'Lead architecture design sessions' },
  { id: 3, employee: seedEmployees[2], reviewer: { id: 99, username: 'hr_admin', email: 'hr@nexushr.com', role: 'HR' }, reviewDate: '2026-06-10', rating: 3.9, feedback: 'Carol shows solid QA skills. Focus areas include E2E testing automation and improving communication during sprint retrospectives.', goals: 'Complete Cypress certification' },
];

const seedActivities: HrActivity[] = [
  { id: 1, type: 'HIRE', description: 'Hired David Kim as Junior Developer', actor: 'HR Admin', timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
  { id: 2, type: 'LEAVE_ACTION', description: 'Approved annual leave for Emma Wilson', actor: 'HR Admin', timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
  { id: 3, type: 'PAYROLL_RUN', description: 'Processed June payroll for 8 employees', actor: 'HR Admin', timestamp: new Date(Date.now() - 1 * 24 * 3600000).toISOString() },
  { id: 4, type: 'REVIEW', description: 'Submitted performance review for Alice Morgan', actor: 'HR Admin', timestamp: new Date(Date.now() - 14 * 24 * 3600000).toISOString() },
  { id: 5, type: 'GOAL', description: 'Assigned Q3 milestone goals to 5 employees', actor: 'HR Admin', timestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString() },
];

// ─── HR Services ──────────────────────────────────────────────────────────────
export const hrServices = {

  // ── Employees ────────────────────────────────────────────────────────────
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const res = await adminClient.get<Employee[]>('/employees');
      return res.data;
    } catch {
      return getLS<Employee[]>('employees', seedEmployees);
    }
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      const res = await adminClient.get<Employee>(`/employees/${id}`);
      return res.data;
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const emp = employees.find(e => e.id === id);
      if (!emp) throw new Error('Employee not found');
      return emp;
    }
  },

  createEmployee: async (payload: Partial<Employee>, username: string): Promise<Employee> => {
    try {
      const res = await adminClient.post<Employee>(`/employees?username=${username}`, payload);
      return res.data;
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const newEmp: Employee = {
        id: Date.now(),
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        email: payload.email || '',
        phone: payload.phone,
        department: payload.department || 'Engineering',
        position: payload.position || 'Employee',
        hireDate: new Date().toISOString().split('T')[0],
        salary: payload.salary || 5000,
        status: 'ACTIVE',
        performanceRating: undefined
      };
      employees.push(newEmp);
      setLS('employees', employees);
      // Log activity
      const acts = getLS<HrActivity[]>('activities', seedActivities);
      acts.unshift({ id: Date.now(), type: 'HIRE', description: `Hired ${newEmp.firstName} ${newEmp.lastName} as ${newEmp.position}`, actor: 'HR Admin', timestamp: new Date().toISOString() });
      setLS('activities', acts);
      return newEmp;
    }
  },

  updateEmployee: async (id: number, payload: Partial<Employee>): Promise<Employee> => {
    try {
      const res = await adminClient.put<Employee>(`/employees/${id}`, payload);
      return res.data;
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const idx = employees.findIndex(e => e.id === id);
      if (idx === -1) throw new Error('Employee not found');
      employees[idx] = { ...employees[idx], ...payload };
      setLS('employees', employees);
      return employees[idx];
    }
  },

  getWorkforceMetrics: async (): Promise<HrMetrics> => {
    try {
      const [metricsRes, leavesRes, payrollRes] = await Promise.all([
        adminClient.get('/employees/metrics'),
        adminClient.get<LeaveRequest[]>('/leaves'),
        adminClient.get<Payroll[]>('/payroll'),
      ]);
      const metrics = metricsRes.data;
      const leaves = leavesRes.data as LeaveRequest[];
      const payrolls = payrollRes.data as Payroll[];
      return {
        totalEmployees: metrics.totalEmployees,
        activeEmployees: metrics.totalEmployees,
        onLeaveCount: 0,
        terminatedCount: 0,
        averageSalary: metrics.averageSalary,
        totalPayroll: payrolls.reduce((s, p) => s + p.netSalary, 0),
        averagePerformance: metrics.averagePerformance,
        pendingLeaves: leaves.filter(l => l.status === 'PENDING').length,
        departmentDistribution: metrics.departmentDistribution,
        leaveTypeBreakdown: leaves.reduce((acc: Record<string, number>, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {}),
      };
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const leaves = getLS<LeaveRequest[]>('leaves', seedLeaves);
      const payrolls = getLS<Payroll[]>('payrolls', seedPayrolls);
      const deptDist = employees.reduce((acc: Record<string, number>, e) => { acc[e.department] = (acc[e.department] || 0) + 1; return acc; }, {});
      const leaveBreak = leaves.reduce((acc: Record<string, number>, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {});
      return {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
        onLeaveCount: employees.filter(e => e.status === 'ON_LEAVE').length,
        terminatedCount: employees.filter(e => e.status === 'TERMINATED').length,
        averageSalary: Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length),
        totalPayroll: payrolls.reduce((s, p) => s + p.netSalary, 0),
        averagePerformance: parseFloat((employees.reduce((s, e) => s + (e.performanceRating || 0), 0) / employees.filter(e => e.performanceRating).length).toFixed(1)),
        pendingLeaves: leaves.filter(l => l.status === 'PENDING').length,
        departmentDistribution: deptDist,
        leaveTypeBreakdown: leaveBreak,
      };
    }
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  getAllAttendance: async (): Promise<Attendance[]> => {
    try {
      const res = await adminClient.get<Attendance[]>('/attendance');
      return res.data;
    } catch {
      return getLS<Attendance[]>('attendance', seedAttendance);
    }
  },

  // ── Leaves ────────────────────────────────────────────────────────────────
  getAllLeaves: async (): Promise<LeaveRequest[]> => {
    try {
      const res = await adminClient.get<LeaveRequest[]>('/leaves');
      return res.data;
    } catch {
      return getLS<LeaveRequest[]>('leaves', seedLeaves);
    }
  },

  approveLeave: async (id: number): Promise<LeaveRequest> => {
    try {
      const res = await adminClient.post<LeaveRequest>(`/leaves/${id}/approve`);
      return res.data;
    } catch {
      const leaves = getLS<LeaveRequest[]>('leaves', seedLeaves);
      const idx = leaves.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Leave request not found');
      leaves[idx].status = 'APPROVED';
      leaves[idx].approvedBy = 'HR Admin';
      setLS('leaves', leaves);
      // Log activity
      const acts = getLS<HrActivity[]>('activities', seedActivities);
      acts.unshift({ id: Date.now(), type: 'LEAVE_ACTION', description: `Approved leave for ${leaves[idx].employee?.firstName} ${leaves[idx].employee?.lastName}`, actor: 'HR Admin', timestamp: new Date().toISOString() });
      setLS('activities', acts);
      return leaves[idx];
    }
  },

  rejectLeave: async (id: number): Promise<LeaveRequest> => {
    try {
      const res = await adminClient.post<LeaveRequest>(`/leaves/${id}/reject`);
      return res.data;
    } catch {
      const leaves = getLS<LeaveRequest[]>('leaves', seedLeaves);
      const idx = leaves.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Leave request not found');
      leaves[idx].status = 'REJECTED';
      setLS('leaves', leaves);
      return leaves[idx];
    }
  },

  // ── Payroll ───────────────────────────────────────────────────────────────
  getAllPayrolls: async (): Promise<Payroll[]> => {
    try {
      const res = await adminClient.get<Payroll[]>('/payroll');
      return res.data;
    } catch {
      return getLS<Payroll[]>('payrolls', seedPayrolls);
    }
  },

  runPayroll: async (start: string, end: string): Promise<Payroll[]> => {
    try {
      const res = await adminClient.post<Payroll[]>(`/payroll/run?start=${start}&end=${end}`);
      return res.data;
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const payrolls = getLS<Payroll[]>('payrolls', seedPayrolls);
      const newRecords: Payroll[] = employees.map(emp => ({
        id: Date.now() + emp.id,
        employee: emp,
        payPeriodStart: start,
        payPeriodEnd: end,
        basicSalary: emp.salary,
        allowances: Math.round(emp.salary * 0.05),
        deductions: Math.round(emp.salary * 0.1),
        netSalary: Math.round(emp.salary * 0.95),
        status: 'DRAFT' as const,
      }));
      const updated = [...payrolls, ...newRecords];
      setLS('payrolls', updated);
      const acts = getLS<HrActivity[]>('activities', seedActivities);
      acts.unshift({ id: Date.now(), type: 'PAYROLL_RUN', description: `Processed payroll for ${start} to ${end} — ${newRecords.length} records generated`, actor: 'HR Admin', timestamp: new Date().toISOString() });
      setLS('activities', acts);
      return newRecords;
    }
  },

  payPayroll: async (id: number): Promise<Payroll> => {
    try {
      const res = await adminClient.post<Payroll>(`/payroll/${id}/pay`);
      return res.data;
    } catch {
      const payrolls = getLS<Payroll[]>('payrolls', seedPayrolls);
      const idx = payrolls.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Payroll record not found');
      payrolls[idx].status = 'PAID';
      payrolls[idx].processedAt = new Date().toISOString().split('T')[0];
      setLS('payrolls', payrolls);
      return payrolls[idx];
    }
  },

  // ── Performance Reviews ───────────────────────────────────────────────────
  getEmployeeReviews: async (employeeId: number): Promise<PerformanceReview[]> => {
    try {
      const res = await adminClient.get<PerformanceReview[]>(`/reviews/employee/${employeeId}`);
      return res.data;
    } catch {
      const reviews = getLS<PerformanceReview[]>('reviews', seedReviews);
      return reviews.filter(r => r.employee?.id === employeeId);
    }
  },

  createReview: async (payload: { employeeId: number; rating: number; feedback: string; goals: string }): Promise<PerformanceReview> => {
    try {
      const res = await adminClient.post<PerformanceReview>('/reviews', payload);
      return res.data;
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const reviews = getLS<PerformanceReview[]>('reviews', seedReviews);
      const emp = employees.find(e => e.id === payload.employeeId);
      const newReview: PerformanceReview = {
        id: Date.now(),
        employee: emp,
        reviewer: { id: 99, username: 'hr_admin', email: 'hr@nexushr.com', role: 'HR' },
        reviewDate: new Date().toISOString().split('T')[0],
        rating: payload.rating,
        feedback: payload.feedback,
        goals: payload.goals || '',
      };
      reviews.push(newReview);
      setLS('reviews', reviews);
      // Update employee rating
      if (emp) {
        emp.performanceRating = payload.rating;
        const emps = getLS<Employee[]>('employees', seedEmployees);
        const ei = emps.findIndex(e => e.id === emp.id);
        if (ei !== -1) { emps[ei] = emp; setLS('employees', emps); }
      }
      const acts = getLS<HrActivity[]>('activities', seedActivities);
      acts.unshift({ id: Date.now(), type: 'REVIEW', description: `Submitted performance review for ${emp?.firstName} ${emp?.lastName}`, actor: 'HR Admin', timestamp: new Date().toISOString() });
      setLS('activities', acts);
      return newReview;
    }
  },

  // ── Goals ─────────────────────────────────────────────────────────────────
  getEmployeeGoals: async (employeeId: number): Promise<Goal[]> => {
    try {
      const res = await adminClient.get<Goal[]>(`/goals/employee/${employeeId}`);
      return res.data;
    } catch {
      const goals = getLS<Goal[]>('goals', seedGoals);
      return goals.filter(g => g.employee?.id === employeeId);
    }
  },

  createGoal: async (payload: { employeeId: number; title: string; description: string; targetDate: string }): Promise<Goal> => {
    try {
      const res = await adminClient.post<Goal>('/goals', payload);
      return res.data;
    } catch {
      const employees = getLS<Employee[]>('employees', seedEmployees);
      const goals = getLS<Goal[]>('goals', seedGoals);
      const emp = employees.find(e => e.id === payload.employeeId);
      const newGoal: Goal = {
        id: Date.now(),
        employee: emp,
        title: payload.title,
        description: payload.description,
        targetDate: payload.targetDate,
        status: 'PENDING',
      };
      goals.push(newGoal);
      setLS('goals', goals);
      const acts = getLS<HrActivity[]>('activities', seedActivities);
      acts.unshift({ id: Date.now(), type: 'GOAL', description: `Assigned goal "${payload.title}" to ${emp?.firstName} ${emp?.lastName}`, actor: 'HR Admin', timestamp: new Date().toISOString() });
      setLS('activities', acts);
      return newGoal;
    }
  },

  updateGoalStatus: async (goalId: number, status: string): Promise<Goal> => {
    try {
      const res = await adminClient.put<Goal>(`/goals/${goalId}/status`, { status });
      return res.data;
    } catch {
      const goals = getLS<Goal[]>('goals', seedGoals);
      const idx = goals.findIndex(g => g.id === goalId);
      if (idx === -1) throw new Error('Goal not found');
      goals[idx].status = status as Goal['status'];
      setLS('goals', goals);
      return goals[idx];
    }
  },

  // ── AI Insights ───────────────────────────────────────────────────────────
  getAttritionPrediction: async (employeeId: number): Promise<any> => {
    try {
      const res = await adminClient.get(`/ai/attrition/${employeeId}`);
      return res.data;
    } catch {
      const scores: Record<number, any> = {
        101: { riskScore: 12, riskCategory: 'LOW', explanation: 'Long tenure, high performance, competitive salary bracket.' },
        102: { riskScore: 8, riskCategory: 'LOW', explanation: 'Top performer, strong engagement, recent salary adjustment.' },
        103: { riskScore: 45, riskCategory: 'MEDIUM', explanation: 'Pending review cycle missed. Intermediate tenure risk window.' },
        104: { riskScore: 30, riskCategory: 'MEDIUM', explanation: 'Recent hire within 12-month high-risk window. Performance below target.' },
        105: { riskScore: 18, riskCategory: 'LOW', explanation: 'Active goals, strong cross-department relationships.' },
        106: { riskScore: 55, riskCategory: 'HIGH', explanation: 'Extended medical leave. Job market alternatives increasing.' },
        107: { riskScore: 10, riskCategory: 'LOW', explanation: 'High performer, strong technical retention metrics.' },
        108: { riskScore: 15, riskCategory: 'LOW', explanation: 'Senior tenure, leadership role, strong organisational alignment.' },
      };
      return scores[employeeId] || { riskScore: 25, riskCategory: 'LOW', explanation: 'Standard employee profile. Regular check-ins recommended.' };
    }
  },

  getSkillGapAnalysis: async (employeeId: number): Promise<any> => {
    try {
      const res = await adminClient.get(`/ai/skillgap/${employeeId}`);
      return res.data;
    } catch {
      const gaps: Record<number, any> = {
        101: { skills: [{ skill: 'System Design', current: 3.5, target: 5 }, { skill: 'TypeScript Advanced', current: 4, target: 5 }, { skill: 'Cloud Architecture', current: 3, target: 4 }], recommendations: 'Enrol in advanced cloud architecture programme. Practise system design interviews.' },
        102: { skills: [{ skill: 'Team Leadership', current: 4, target: 5 }, { skill: 'Agile Coaching', current: 3.5, target: 5 }], recommendations: 'Participate in leadership coaching sessions. Lead sprint retrospectives.' },
        103: { skills: [{ skill: 'E2E Testing', current: 2.5, target: 4 }, { skill: 'CI/CD Pipelines', current: 2, target: 4 }, { skill: 'Cypress Framework', current: 2, target: 4.5 }], recommendations: 'Complete Cypress certification programme. Set up automated test suites.' },
        104: { skills: [{ skill: 'React 19', current: 2.5, target: 4.5 }, { skill: 'Backend Integration', current: 2, target: 4 }], recommendations: 'Pair programme with senior engineers. Complete React advanced patterns course.' },
        105: { skills: [{ skill: 'Enterprise Sales', current: 3.5, target: 5 }, { skill: 'CRM Mastery', current: 3, target: 4.5 }], recommendations: 'Shadow enterprise account executives. Complete Salesforce certification.' },
      };
      return gaps[employeeId] || { skills: [{ skill: 'Core Role Competencies', current: 3, target: 4 }], recommendations: 'Schedule skill assessment session with line manager.' };
    }
  },

  // ── Activities ────────────────────────────────────────────────────────────
  getRecentActivities: async (): Promise<HrActivity[]> => {
    return getLS<HrActivity[]>('activities', seedActivities);
  },
};
