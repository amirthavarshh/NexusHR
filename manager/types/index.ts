export interface DirectReport {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  hireDate: string;
  salary: number;
  performanceRating?: number;
}

export interface TeamAttendance {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface TeamLeaveRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterRole: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  workflowStage: string;
  approvedBy?: string;
}

export interface TeamGoal {
  id: number;
  employeeId: number;
  employeeName: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  targetDate: string;
  createdAt: string;
}

export interface TeamReview {
  id: number;
  employeeId: number;
  employeeName: string;
  reviewerId: number;
  reviewerName: string;
  rating: number;
  feedback: string;
  reviewDate: string;
}

export interface TeamMetrics {
  totalDirectReports: number;
  attendanceToday: number;
  pendingLeaveRequests: number;
  activeGoalsCount: number;
}

export interface TeamActivity {
  id: number;
  description: string;
  type: 'LEAVE_ACTION' | 'GOAL_ACTION' | 'REVIEW_ACTION' | 'CLOCK_ACTION';
  operator: string;
  timestamp: string;
}
