// HR Module TanStack Query Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrServices } from '../api/services';

// ── Employee Hooks ────────────────────────────────────────────────────────────
export const useAllEmployees = () =>
  useQuery({ queryKey: ['hr', 'employees'], queryFn: hrServices.getAllEmployees });

export const useEmployeeById = (id: number) =>
  useQuery({ queryKey: ['hr', 'employee', id], queryFn: () => hrServices.getEmployeeById(id), enabled: !!id });

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, username }: { payload: any; username: string }) =>
      hrServices.createEmployee(payload, username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'employees'] });
      qc.invalidateQueries({ queryKey: ['hr', 'metrics'] });
      qc.invalidateQueries({ queryKey: ['hr', 'activities'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      hrServices.updateEmployee(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr', 'employees'] });
      qc.invalidateQueries({ queryKey: ['hr', 'employee', vars.id] });
    },
  });
};

export const useHrMetrics = () =>
  useQuery({ queryKey: ['hr', 'metrics'], queryFn: hrServices.getWorkforceMetrics });

// ── Attendance Hooks ──────────────────────────────────────────────────────────
export const useAllAttendance = () =>
  useQuery({ queryKey: ['hr', 'attendance'], queryFn: hrServices.getAllAttendance });

// ── Leave Hooks ───────────────────────────────────────────────────────────────
export const useAllLeaves = () =>
  useQuery({ queryKey: ['hr', 'leaves'], queryFn: hrServices.getAllLeaves });

export const useApproveLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrServices.approveLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'leaves'] });
      qc.invalidateQueries({ queryKey: ['hr', 'metrics'] });
      qc.invalidateQueries({ queryKey: ['hr', 'activities'] });
    },
  });
};

export const useRejectLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrServices.rejectLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'leaves'] });
    },
  });
};

// ── Payroll Hooks ─────────────────────────────────────────────────────────────
export const useAllPayrolls = () =>
  useQuery({ queryKey: ['hr', 'payrolls'], queryFn: hrServices.getAllPayrolls });

export const useRunPayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      hrServices.runPayroll(start, end),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'payrolls'] });
      qc.invalidateQueries({ queryKey: ['hr', 'metrics'] });
      qc.invalidateQueries({ queryKey: ['hr', 'activities'] });
    },
  });
};

export const usePayPayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrServices.payPayroll(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'payrolls'] }),
  });
};

// ── Review Hooks ──────────────────────────────────────────────────────────────
export const useEmployeeReviews = (employeeId: number) =>
  useQuery({
    queryKey: ['hr', 'reviews', employeeId],
    queryFn: () => hrServices.getEmployeeReviews(employeeId),
    enabled: !!employeeId,
  });

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { employeeId: number; rating: number; feedback: string; goals: string }) =>
      hrServices.createReview(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr', 'reviews', vars.employeeId] });
      qc.invalidateQueries({ queryKey: ['hr', 'employees'] });
      qc.invalidateQueries({ queryKey: ['hr', 'activities'] });
    },
  });
};

// ── Goals Hooks ───────────────────────────────────────────────────────────────
export const useEmployeeGoals = (employeeId: number) =>
  useQuery({
    queryKey: ['hr', 'goals', employeeId],
    queryFn: () => hrServices.getEmployeeGoals(employeeId),
    enabled: !!employeeId,
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { employeeId: number; title: string; description: string; targetDate: string }) =>
      hrServices.createGoal(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr', 'goals', vars.employeeId] });
      qc.invalidateQueries({ queryKey: ['hr', 'activities'] });
    },
  });
};

export const useUpdateGoalStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, status }: { goalId: number; status: string; employeeId: number }) =>
      hrServices.updateGoalStatus(goalId, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hr', 'goals', vars.employeeId] });
    },
  });
};

// ── AI Hooks ──────────────────────────────────────────────────────────────────
export const useAttritionPrediction = (employeeId: number) =>
  useQuery({
    queryKey: ['hr', 'attrition', employeeId],
    queryFn: () => hrServices.getAttritionPrediction(employeeId),
    enabled: !!employeeId,
  });

export const useSkillGapAnalysis = (employeeId: number) =>
  useQuery({
    queryKey: ['hr', 'skillgap', employeeId],
    queryFn: () => hrServices.getSkillGapAnalysis(employeeId),
    enabled: !!employeeId,
  });

// ── Activities Hook ───────────────────────────────────────────────────────────
export const useHrActivities = () =>
  useQuery({ queryKey: ['hr', 'activities'], queryFn: hrServices.getRecentActivities });
