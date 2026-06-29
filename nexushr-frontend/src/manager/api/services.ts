import { adminClient } from '../../admin/api/client';
import type { 
  DirectReport, TeamAttendance, TeamLeaveRequest, TeamGoal, 
  TeamReview, TeamMetrics, TeamActivity 
} from '../types';

// Helper to load localStorage fallbacks
const getLocalStorageData = <T>(key: string, initialData: T): T => {
  const data = localStorage.getItem(`manager_${key}`);
  if (!data) {
    localStorage.setItem(`manager_${key}`, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

const setLocalStorageData = <T>(key: string, data: T): void => {
  localStorage.setItem(`manager_${key}`, JSON.stringify(data));
};

// Initial Seed Data
const seedDirectReports: DirectReport[] = [
  { id: 101, firstName: 'John', lastName: 'Doe', email: 'john.doe@nexushr.com', phone: '555-0201', department: 'IT', position: 'Software Engineer', status: 'ACTIVE', hireDate: '2024-03-15', salary: 6500, performanceRating: 4.2 },
  { id: 102, firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@nexushr.com', phone: '555-0202', department: 'IT', position: 'Senior Engineer', status: 'ACTIVE', hireDate: '2022-06-01', salary: 8500, performanceRating: 4.8 },
  { id: 103, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@nexushr.com', phone: '555-0203', department: 'IT', position: 'QA Specialist', status: 'ACTIVE', hireDate: '2025-01-10', salary: 5500, performanceRating: 3.9 },
  { id: 104, firstName: 'Clara', lastName: 'Oswald', email: 'clara.oswald@nexushr.com', phone: '555-0204', department: 'IT', position: 'Product Designer', status: 'ACTIVE', hireDate: '2023-11-20', salary: 6200, performanceRating: 4.5 },
  { id: 105, firstName: 'David', lastName: 'Tennant', email: 'david.tennant@nexushr.com', phone: '555-0205', department: 'IT', position: 'DevOps Specialist', status: 'ACTIVE', hireDate: '2024-08-01', salary: 7200, performanceRating: 4.1 }
];

const seedAttendanceLogs: TeamAttendance[] = [
  { id: 201, employeeId: 101, employeeName: 'John Doe', department: 'IT', date: new Date().toISOString().split('T')[0], clockIn: '08:55', clockOut: '17:30', status: 'PRESENT' },
  { id: 202, employeeId: 102, employeeName: 'Alice Smith', department: 'IT', date: new Date().toISOString().split('T')[0], clockIn: '09:15', clockOut: '18:00', status: 'LATE' },
  { id: 203, employeeId: 103, employeeName: 'Bob Johnson', department: 'IT', date: new Date().toISOString().split('T')[0], clockIn: '08:45', clockOut: '17:00', status: 'PRESENT' },
  { id: 204, employeeId: 104, employeeName: 'Clara Oswald', department: 'IT', date: new Date().toISOString().split('T')[0], status: 'ABSENT' },
  { id: 205, employeeId: 105, employeeName: 'David Tennant', department: 'IT', date: new Date().toISOString().split('T')[0], clockIn: '08:50', clockOut: '17:45', status: 'PRESENT' }
];

const seedLeaveRequests: TeamLeaveRequest[] = [
  { id: 301, requesterId: 101, requesterName: 'John Doe', requesterRole: 'EMPLOYEE', type: 'Annual Leave', startDate: '2026-07-10', endDate: '2026-07-15', reason: 'Family summer vacation trip', status: 'PENDING', workflowStage: 'MANAGER_APPROVAL' },
  { id: 302, requesterId: 104, requesterName: 'Clara Oswald', requesterRole: 'EMPLOYEE', type: 'Sick Leave', startDate: '2026-06-29', endDate: '2026-06-30', reason: 'High fever and dental appointment', status: 'PENDING', workflowStage: 'MANAGER_APPROVAL' },
  { id: 303, requesterId: 103, requesterName: 'Bob Johnson', requesterRole: 'EMPLOYEE', type: 'Unpaid Leave', startDate: '2026-06-15', endDate: '2026-06-17', reason: 'Moving to new apartment relocation', status: 'APPROVED', workflowStage: 'HR_APPROVAL', approvedBy: 'IT Manager' }
];

const seedGoals: TeamGoal[] = [
  { id: 401, employeeId: 101, employeeName: 'John Doe', title: 'Route Migration', description: 'Migrate legacy router endpoints to the new nested layout router.', status: 'PENDING', targetDate: '2026-07-30', createdAt: '2026-06-25' },
  { id: 402, employeeId: 102, employeeName: 'Alice Smith', title: 'Performance Optimization', description: 'Reduce network request latency by implementing server queries caching.', status: 'IN_PROGRESS', targetDate: '2026-07-15', createdAt: '2026-06-20' },
  { id: 403, employeeId: 103, employeeName: 'Bob Johnson', title: 'Configure Jest Tests', description: 'Introduce coverage verification scripts in the frontend build process.', status: 'COMPLETED', targetDate: '2026-06-28', createdAt: '2026-06-10' }
];

const seedReviews: TeamReview[] = [
  { id: 501, employeeId: 101, employeeName: 'John Doe', reviewerId: 99, reviewerName: 'IT Manager', rating: 4.2, feedback: 'Consistently completes dashboard enhancements on time. Excellent team player.', reviewDate: '2026-05-15' },
  { id: 502, employeeId: 102, employeeName: 'Alice Smith', reviewerId: 99, reviewerName: 'IT Manager', rating: 4.8, feedback: 'Leads our components refactoring masterfully. Exceptional code quality and designs.', reviewDate: '2026-05-10' }
];

const seedActivities: TeamActivity[] = [
  { id: 601, description: 'Approved leave request for Bob Johnson', type: 'LEAVE_ACTION', operator: 'IT Manager', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 602, description: 'Assigned new goal Route Migration to John Doe', type: 'GOAL_ACTION', operator: 'IT Manager', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 603, description: 'Submitted performance review evaluation for Alice Smith', type: 'REVIEW_ACTION', operator: 'IT Manager', timestamp: new Date(Date.now() - 14400000).toISOString() }
];

export const managerServices = {
  // 1. Get Team metrics dashboard summaries
  getTeamMetrics: async (): Promise<TeamMetrics> => {
    try {
      const reports = await managerServices.getDirectReports();
      const leaves = await managerServices.getTeamLeaves();
      const attendance = await managerServices.getTeamAttendanceToday();
      const goals = getLocalStorageData<TeamGoal[]>('goals', seedGoals);

      const presentRate = attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status !== 'ABSENT').length / attendance.length) * 100) 
        : 100;

      return {
        totalDirectReports: reports.length,
        attendanceToday: presentRate,
        pendingLeaveRequests: leaves.filter(l => l.status === 'PENDING').length,
        activeGoalsCount: goals.filter(g => g.status === 'PENDING' || g.status === 'IN_PROGRESS').length
      };
    } catch {
      return {
        totalDirectReports: seedDirectReports.length,
        attendanceToday: 80,
        pendingLeaveRequests: seedLeaveRequests.filter(l => l.status === 'PENDING').length,
        activeGoalsCount: seedGoals.filter(g => g.status === 'PENDING' || g.status === 'IN_PROGRESS').length
      };
    }
  },

  // 2. Get direct reports list
  getDirectReports: async (): Promise<DirectReport[]> => {
    try {
      const response = await adminClient.get<any[]>('/employees');
      // Simulated: Filter employees for IT department which the seed manager heads
      const list = response.data.filter(e => e.department === 'IT' || e.department === 'Engineering');
      if (list.length === 0) throw new Error('Fall back to seeds');
      return list.map(e => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone,
        department: e.department,
        position: e.position,
        status: e.status || 'ACTIVE',
        hireDate: e.hireDate || '2024-01-01',
        salary: e.salary || 5000,
        performanceRating: e.performanceRating || 4.0
      }));
    } catch {
      return getLocalStorageData<DirectReport[]>('direct_reports', seedDirectReports);
    }
  },

  // 3. Get team attendance today
  getTeamAttendanceToday: async (): Promise<TeamAttendance[]> => {
    try {
      const response = await adminClient.get<any[]>('/attendance');
      // IT department filter
      const list = response.data.filter(a => a.department === 'IT' || a.department === 'Engineering');
      if (list.length === 0) throw new Error('Fall back to seeds');
      return list.map(a => ({
        id: a.id,
        employeeId: a.employeeId || 100,
        employeeName: a.employeeName || 'Unknown Employee',
        department: a.department,
        date: a.date || new Date().toISOString().split('T')[0],
        clockIn: a.clockIn,
        clockOut: a.clockOut,
        status: a.status
      }));
    } catch {
      return getLocalStorageData<TeamAttendance[]>('attendance', seedAttendanceLogs);
    }
  },

  // 4. Get team leaves requests
  getTeamLeaves: async (): Promise<TeamLeaveRequest[]> => {
    try {
      const response = await adminClient.get<any[]>('/leaves');
      // IT department filter
      const list = response.data.filter(l => l.requesterRole === 'EMPLOYEE');
      if (list.length === 0) throw new Error('Fall back to seeds');
      return list.map(l => ({
        id: l.id,
        requesterId: l.requesterId || 100,
        requesterName: l.requesterName,
        requesterRole: l.requesterRole,
        type: l.type,
        startDate: l.startDate,
        endDate: l.endDate,
        reason: l.reason,
        status: l.status,
        workflowStage: l.workflowStage,
        approvedBy: l.approvedBy
      }));
    } catch {
      return getLocalStorageData<TeamLeaveRequest[]>('leaves', seedLeaveRequests);
    }
  },

  // 5. Approve direct report leave request
  approveEmployeeLeave: async (id: number): Promise<TeamLeaveRequest> => {
    try {
      const response = await adminClient.post<any>(`/leaves/${id}/approve`);
      return response.data;
    } catch {
      const list = getLocalStorageData<TeamLeaveRequest[]>('leaves', seedLeaveRequests);
      const idx = list.findIndex(l => l.id === id);
      if (idx !== -1) {
        list[idx].status = 'APPROVED';
        list[idx].workflowStage = 'APPROVED';
        list[idx].approvedBy = 'IT Manager';
        setLocalStorageData('leaves', list);

        // Add activity
        const acts = getLocalStorageData<TeamActivity[]>('activities', seedActivities);
        acts.unshift({
          id: Date.now(),
          description: `Approved leave request for ${list[idx].requesterName}`,
          type: 'LEAVE_ACTION',
          operator: 'IT Manager',
          timestamp: new Date().toISOString()
        });
        setLocalStorageData('activities', acts);

        return list[idx];
      }
      throw new Error('Leave request not found');
    }
  },

  // 6. Reject direct report leave request
  rejectEmployeeLeave: async (id: number): Promise<TeamLeaveRequest> => {
    try {
      const response = await adminClient.post<any>(`/leaves/${id}/reject`);
      return response.data;
    } catch {
      const list = getLocalStorageData<TeamLeaveRequest[]>('leaves', seedLeaveRequests);
      const idx = list.findIndex(l => l.id === id);
      if (idx !== -1) {
        list[idx].status = 'REJECTED';
        list[idx].workflowStage = 'REJECTED';
        list[idx].approvedBy = 'IT Manager';
        setLocalStorageData('leaves', list);

        // Add activity
        const acts = getLocalStorageData<TeamActivity[]>('activities', seedActivities);
        acts.unshift({
          id: Date.now(),
          description: `Rejected leave request for ${list[idx].requesterName}`,
          type: 'LEAVE_ACTION',
          operator: 'IT Manager',
          timestamp: new Date().toISOString()
        });
        setLocalStorageData('activities', acts);

        return list[idx];
      }
      throw new Error('Leave request not found');
    }
  },

  // 7. Get employee goals
  getEmployeeGoals: async (employeeId: number): Promise<TeamGoal[]> => {
    try {
      const response = await adminClient.get<any[]>(`/goals/employee/${employeeId}`);
      return response.data.map(g => ({
        id: g.id,
        employeeId: g.employee?.id || employeeId,
        employeeName: g.employee ? `${g.employee.firstName} ${g.employee.lastName}` : 'Direct Report',
        title: g.title,
        description: g.description,
        status: g.status,
        targetDate: g.targetDate,
        createdAt: g.createdAt || '2026-06-01'
      }));
    } catch {
      const list = getLocalStorageData<TeamGoal[]>('goals', seedGoals);
      return list.filter(g => g.employeeId === employeeId);
    }
  },

  // 8. Create employee goal
  createEmployeeGoal: async (payload: { employeeId: number; title: string; description: string; targetDate: string }): Promise<TeamGoal> => {
    try {
      const response = await adminClient.post<any>('/goals', payload);
      return response.data;
    } catch {
      const list = getLocalStorageData<TeamGoal[]>('goals', seedGoals);
      const reports = getLocalStorageData<DirectReport[]>('direct_reports', seedDirectReports);
      const emp = reports.find(r => r.id === payload.employeeId);
      const newGoal: TeamGoal = {
        id: Date.now(),
        employeeId: payload.employeeId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Direct Report',
        title: payload.title,
        description: payload.description,
        status: 'PENDING',
        targetDate: payload.targetDate,
        createdAt: new Date().toISOString().split('T')[0]
      };
      list.push(newGoal);
      setLocalStorageData('goals', list);

      // Add activity
      const acts = getLocalStorageData<TeamActivity[]>('activities', seedActivities);
      acts.unshift({
        id: Date.now(),
        description: `Assigned new goal "${payload.title}" to ${newGoal.employeeName}`,
        type: 'GOAL_ACTION',
        operator: 'IT Manager',
        timestamp: new Date().toISOString()
      });
      setLocalStorageData('activities', acts);

      return newGoal;
    }
  },

  // 9. Update employee goal status
  updateGoalStatus: async (id: number, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<TeamGoal> => {
    try {
      const response = await adminClient.put<any>(`/goals/${id}/status`, { status });
      return response.data;
    } catch {
      const list = getLocalStorageData<TeamGoal[]>('goals', seedGoals);
      const idx = list.findIndex(g => g.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        setLocalStorageData('goals', list);
        return list[idx];
      }
      throw new Error('Goal not found');
    }
  },

  // 10. Get performance reviews for an employee
  getEmployeeReviews: async (employeeId: number): Promise<TeamReview[]> => {
    try {
      const response = await adminClient.get<any[]>(`/reviews/employee/${employeeId}`);
      return response.data.map(r => ({
        id: r.id,
        employeeId: r.employee?.id || employeeId,
        employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Direct Report',
        reviewerId: r.reviewer?.id || 99,
        reviewerName: r.reviewerName || 'IT Manager',
        rating: r.rating,
        feedback: r.feedback,
        reviewDate: r.reviewDate || '2026-06-01'
      }));
    } catch {
      const list = getLocalStorageData<TeamReview[]>('reviews', seedReviews);
      return list.filter(r => r.employeeId === employeeId);
    }
  },

  // 11. Create a performance review
  createPerformanceReview: async (payload: { employeeId: number; rating: number; feedback: string }): Promise<TeamReview> => {
    try {
      const response = await adminClient.post<any>('/reviews', payload);
      return response.data;
    } catch {
      const list = getLocalStorageData<TeamReview[]>('reviews', seedReviews);
      const reports = getLocalStorageData<DirectReport[]>('direct_reports', seedDirectReports);
      const emp = reports.find(r => r.id === payload.employeeId);
      
      const newReview: TeamReview = {
        id: Date.now(),
        employeeId: payload.employeeId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Direct Report',
        reviewerId: 99,
        reviewerName: 'IT Manager',
        rating: payload.rating,
        feedback: payload.feedback,
        reviewDate: new Date().toISOString().split('T')[0]
      };
      list.push(newReview);
      setLocalStorageData('reviews', list);

      // Update employee rating
      if (emp) {
        emp.performanceRating = payload.rating;
        const index = reports.findIndex(r => r.id === emp.id);
        reports[index] = emp;
        setLocalStorageData('direct_reports', reports);
      }

      // Add activity
      const acts = getLocalStorageData<TeamActivity[]>('activities', seedActivities);
      acts.unshift({
        id: Date.now(),
        description: `Submitted performance review evaluation for ${newReview.employeeName}`,
        type: 'REVIEW_ACTION',
        operator: 'IT Manager',
        timestamp: new Date().toISOString()
      });
      setLocalStorageData('activities', acts);

      return newReview;
    }
  },

  // 12. Get recent team activities
  getTeamActivities: async (): Promise<TeamActivity[]> => {
    return getLocalStorageData<TeamActivity[]>('activities', seedActivities);
  },

  // 13. AI Attrition prediction
  getAttritionPrediction: async (employeeId: number): Promise<any> => {
    try {
      const response = await adminClient.get<any>(`/ai/attrition/${employeeId}`);
      return response.data;
    } catch {
      // High-fidelity fallback
      const risks: Record<number, any> = {
        101: { riskScore: 18, riskLevel: 'LOW', factors: ['Salary Competitiveness', 'High Engagement'], recommendations: 'Maintain current path. Provide clear progression outline.' },
        102: { riskScore: 8, riskLevel: 'LOW', factors: ['Recent Review Score', 'Strong Connection'], recommendations: 'No risk elements detected. Keep engaging in milestone planning.' },
        103: { riskScore: 42, riskLevel: 'MEDIUM', factors: ['Tenure Duration', 'Pending Review Cycle'], recommendations: 'Schedule one-on-one check-in. Review goals check-in logs.' },
        104: { riskScore: 28, riskLevel: 'LOW', factors: ['Recent Hire', 'Salary Range'], recommendations: 'Conduct early check-in review. Offer skills guidance sessions.' },
        105: { riskScore: 15, riskLevel: 'LOW', factors: ['High Productivity', 'Active Goals'], recommendations: 'Maintain current path. Plan next review milestone.' }
      };
      return risks[employeeId] || { riskScore: 20, riskLevel: 'LOW', factors: ['Standard Tenure'], recommendations: 'Schedule standard reviews check-ins.' };
    }
  },

  // 14. AI Skill Gap analysis
  getSkillGapAnalysis: async (employeeId: number): Promise<any> => {
    try {
      const response = await adminClient.get<any>(`/ai/skillgap/${employeeId}`);
      return response.data;
    } catch {
      // High-fidelity fallback
      const gaps: Record<number, any> = {
        101: {
          skills: [
            { name: 'React 19 Hooks', level: 3, requiredLevel: 5 },
            { name: 'TypeScript Architectures', level: 4, requiredLevel: 5 },
            { name: 'CSS Tailwind v4', level: 3, requiredLevel: 4 }
          ],
          recommendations: 'Complete advanced state management training.\nPractice components code splitting structures.'
        },
        102: {
          skills: [
            { name: 'Vite Bundler Configs', level: 4.5, requiredLevel: 5 },
            { name: 'Performance Audits', level: 4, requiredLevel: 5 }
          ],
          recommendations: 'Incorporate bundle analyzers checkups.\nLead developer performance workshops.'
        },
        103: {
          skills: [
            { name: 'Jest Test coverages', level: 3, requiredLevel: 4.5 },
            { name: 'E2E Testing setups', level: 2.5, requiredLevel: 4 }
          ],
          recommendations: 'Undergo cypress integration tutorials.\nConfigure automation test suites on staging.'
        }
      };
      return gaps[employeeId] || {
        skills: [
          { name: 'Core HRMS Operations', level: 3.5, requiredLevel: 4 },
          { name: 'Communication Syncs', level: 4, requiredLevel: 4 }
        ],
        recommendations: 'Participate in team alignment meetings.'
      };
    }
  }
};
