import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerServices } from '../api/services';

export const useTeamMetrics = () => {
  return useQuery({
    queryKey: ['manager', 'metrics'],
    queryFn: () => managerServices.getTeamMetrics(),
    refetchInterval: 30000,
  });
};

export const useDirectReports = () => {
  return useQuery({
    queryKey: ['manager', 'reports'],
    queryFn: () => managerServices.getDirectReports(),
  });
};

export const useTeamAttendance = () => {
  return useQuery({
    queryKey: ['manager', 'attendance'],
    queryFn: () => managerServices.getTeamAttendanceToday(),
  });
};

export const useTeamLeaves = () => {
  return useQuery({
    queryKey: ['manager', 'leaves'],
    queryFn: () => managerServices.getTeamLeaves(),
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => managerServices.approveEmployeeLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'activities'] });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => managerServices.rejectEmployeeLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'activities'] });
    },
  });
};

export const useEmployeeGoals = (employeeId: number) => {
  return useQuery({
    queryKey: ['manager', 'goals', employeeId],
    queryFn: () => managerServices.getEmployeeGoals(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { employeeId: number; title: string; description: string; targetDate: string }) =>
      managerServices.createEmployeeGoal(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'goals', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'activities'] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: number; employeeId: number; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }) =>
      managerServices.updateGoalStatus(variables.id, variables.status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'goals', variables.employeeId] });
    },
  });
};

export const useEmployeeReviews = (employeeId: number) => {
  return useQuery({
    queryKey: ['manager', 'reviews', employeeId],
    queryFn: () => managerServices.getEmployeeReviews(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { employeeId: number; rating: number; feedback: string }) =>
      managerServices.createPerformanceReview(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'reviews', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['manager', 'activities'] });
    },
  });
};

export const useTeamActivities = () => {
  return useQuery({
    queryKey: ['manager', 'activities'],
    queryFn: () => managerServices.getTeamActivities(),
  });
};

export const useAttritionPrediction = (employeeId: number) => {
  return useQuery({
    queryKey: ['manager', 'attrition', employeeId],
    queryFn: () => managerServices.getAttritionPrediction(employeeId),
    enabled: !!employeeId,
  });
};

export const useSkillGapAnalysis = (employeeId: number) => {
  return useQuery({
    queryKey: ['manager', 'skillgap', employeeId],
    queryFn: () => managerServices.getSkillGapAnalysis(employeeId),
    enabled: !!employeeId,
  });
};
