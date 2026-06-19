const BASE_URL = 'http://localhost:8080/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  // Handled for void responses or empty content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

export const api = {
  // Auth API
  async login(payload: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async register(payload: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  // Employee API
  async getMyProfile() {
    const res = await fetch(`${BASE_URL}/employees/me`, {
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  async createProfile(payload: any) {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async updateProfile(id: number, payload: any) {
    const res = await fetch(`${BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async getAllEmployees() {
    const res = await fetch(`${BASE_URL}/employees`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async getWorkforceMetrics() {
    const res = await fetch(`${BASE_URL}/employees/metrics`, {
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  // Attendance API
  async clockIn() {
    const res = await fetch(`${BASE_URL}/attendance/clock-in`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  async clockOut() {
    const res = await fetch(`${BASE_URL}/attendance/clock-out`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  async getTodayAttendance() {
    const res = await fetch(`${BASE_URL}/attendance/today`, {
      headers: getHeaders()
    });
    if (res.status === 404 || res.status === 204) return null;
    try {
      return await handleResponse<any>(res);
    } catch {
      return null;
    }
  },

  async getMyAttendanceHistory() {
    const res = await fetch(`${BASE_URL}/attendance/my-history`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async getAllAttendance() {
    const res = await fetch(`${BASE_URL}/attendance`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  // Leave API
  async applyLeave(payload: any) {
    const res = await fetch(`${BASE_URL}/leaves`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async getMyLeaves() {
    const res = await fetch(`${BASE_URL}/leaves/my-requests`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async getAllLeaves() {
    const res = await fetch(`${BASE_URL}/leaves`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async approveLeave(id: number) {
    const res = await fetch(`${BASE_URL}/leaves/${id}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  async rejectLeave(id: number) {
    const res = await fetch(`${BASE_URL}/leaves/${id}/reject`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  // Payroll API
  async runPayroll(startDate: string, endDate: string) {
    const res = await fetch(`${BASE_URL}/payroll/run?start=${startDate}&end=${endDate}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async payPayroll(id: number) {
    const res = await fetch(`${BASE_URL}/payroll/${id}/pay`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  async getMyPayrolls() {
    const res = await fetch(`${BASE_URL}/payroll/my-slips`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async getAllPayrolls() {
    const res = await fetch(`${BASE_URL}/payroll`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  // AI Insights API
  async getAttritionPrediction(employeeId: number) {
    const res = await fetch(`${BASE_URL}/ai/attrition/${employeeId}`, {
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  async getSkillGapAnalysis(employeeId: number) {
    const res = await fetch(`${BASE_URL}/ai/skillgap/${employeeId}`, {
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  // Performance Review API
  async createReview(payload: any) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async getEmployeeReviews(employeeId: number) {
    const res = await fetch(`${BASE_URL}/reviews/employee/${employeeId}`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  // Goals API
  async getGoals(employeeId: number) {
    const res = await fetch(`${BASE_URL}/goals/employee/${employeeId}`, {
      headers: getHeaders()
    });
    return handleResponse<any[]>(res);
  },

  async createGoal(payload: any) {
    const res = await fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<any>(res);
  },

  async updateGoalStatus(goalId: number, status: string) {
    const res = await fetch(`${BASE_URL}/goals/${goalId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<any>(res);
  }
};
