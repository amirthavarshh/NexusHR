import { request } from './client';
import type { 
  Employee, Attendance, LeaveRequest, Payroll, 
  Goal, PerformanceReview, AttritionReport, SkillGapReport, 
  WorkforceMetrics 
} from '../types/domain';

export const api = {
  // Auth API
  async login(payload: any): Promise<any> {
    return request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async register(payload: any): Promise<any> {
    return request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Employee API
  async getMyProfile(): Promise<Employee> {
    return request<Employee>('/employees/me');
  },

  async createProfile(payload: any, username?: string): Promise<Employee> {
    return request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
      params: username ? { username } : undefined
    });
  },

  async updateProfile(id: number, payload: any): Promise<Employee> {
    return request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async getAllEmployees(): Promise<Employee[]> {
    return request<Employee[]>('/employees');
  },

  async getEmployeeById(id: number): Promise<Employee> {
    return request<Employee>(`/employees/${id}`);
  },

  async getWorkforceMetrics(): Promise<WorkforceMetrics> {
    return request<WorkforceMetrics>('/employees/metrics');
  },

  // Attendance API
  async clockIn(): Promise<Attendance> {
    return request<Attendance>('/attendance/clock-in', {
      method: 'POST'
    });
  },

  async clockOut(): Promise<Attendance> {
    return request<Attendance>('/attendance/clock-out', {
      method: 'POST'
    });
  },

  async getTodayAttendance(): Promise<Attendance | null> {
    try {
      const res = await request<Attendance>('/attendance/today');
      // If it returns an empty object or null from client handles
      if (!res || !res.id) return null;
      return res;
    } catch {
      return null;
    }
  },

  async getMyAttendanceHistory(): Promise<Attendance[]> {
    return request<Attendance[]>('/attendance/my-history');
  },

  async getAllAttendance(): Promise<Attendance[]> {
    return request<Attendance[]>('/attendance');
  },

  // Leave API
  async applyLeave(payload: any): Promise<LeaveRequest> {
    return request<LeaveRequest>('/leaves', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyLeaves(): Promise<LeaveRequest[]> {
    return request<LeaveRequest[]>('/leaves/my-requests');
  },

  async getAllLeaves(): Promise<LeaveRequest[]> {
    return request<LeaveRequest[]>('/leaves');
  },

  async approveLeave(id: number): Promise<LeaveRequest> {
    return request<LeaveRequest>(`/leaves/${id}/approve`, {
      method: 'POST'
    });
  },

  async rejectLeave(id: number): Promise<LeaveRequest> {
    return request<LeaveRequest>(`/leaves/${id}/reject`, {
      method: 'POST'
    });
  },

  // Payroll API
  async runPayroll(startDate: string, endDate: string): Promise<Payroll[]> {
    return request<Payroll[]>(`/payroll/run`, {
      method: 'POST',
      params: { start: startDate, end: endDate }
    });
  },

  async payPayroll(id: number): Promise<Payroll> {
    return request<Payroll>(`/payroll/${id}/pay`, {
      method: 'POST'
    });
  },

  async getMyPayrolls(): Promise<Payroll[]> {
    return request<Payroll[]>('/payroll/my-slips');
  },

  async getAllPayrolls(): Promise<Payroll[]> {
    return request<Payroll[]>('/payroll');
  },

  // AI Insights API
  async getAttritionPrediction(employeeId: number): Promise<AttritionReport> {
    return request<AttritionReport>(`/ai/attrition/${employeeId}`);
  },

  async getSkillGapAnalysis(employeeId: number): Promise<SkillGapReport> {
    return request<SkillGapReport>(`/ai/skillgap/${employeeId}`);
  },

  // Performance Review API
  async createReview(payload: any): Promise<PerformanceReview> {
    return request<PerformanceReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getEmployeeReviews(employeeId: number): Promise<PerformanceReview[]> {
    return request<PerformanceReview[]>(`/reviews/employee/${employeeId}`);
  },

  // Goals API
  async getGoals(employeeId: number): Promise<Goal[]> {
    return request<Goal[]>(`/goals/employee/${employeeId}`);
  },

  async createGoal(payload: any): Promise<Goal> {
    return request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateGoalStatus(goalId: number, status: string): Promise<Goal> {
    return request<Goal>(`/goals/${goalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};
