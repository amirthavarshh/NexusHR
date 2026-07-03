import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminServices } from '../api/services';
import type { HR, Manager, Department, RolePermissions } from '../types';

export const useAdminDashboardMetrics = () => {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => adminServices.getDashboardMetrics(),
    refetchInterval: 30000, // Poll metrics every 30s
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['admin', 'activities'],
    queryFn: () => adminServices.getRecentActivities(),
  });
};

// --- HR MANAGEMENT HOOKS ---
export const useHRs = () => {
  return useQuery({
    queryKey: ['admin', 'hrs'],
    queryFn: () => adminServices.getAllHRs(),
  });
};

export const useCreateHR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<HR, 'id'>) => adminServices.createHR(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hrs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

export const useUpdateHR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<HR> }) => 
      adminServices.updateHR(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hrs'] });
    },
  });
};

export const useDeleteHR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServices.deleteHR(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hrs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// --- MANAGER MANAGEMENT HOOKS ---
export const useManagers = () => {
  return useQuery({
    queryKey: ['admin', 'managers'],
    queryFn: () => adminServices.getAllManagers(),
  });
};

export const useCreateManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Manager, 'id'>) => adminServices.createManager(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

export const useUpdateManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Manager> }) => 
      adminServices.updateManager(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
    },
  });
};

export const useDeleteManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServices.deleteManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// --- DEPARTMENT HOOKS ---
export const useDepartments = () => {
  return useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: () => adminServices.getAllDepartments(),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Department, 'id' | 'employeeCount'>) => 
      adminServices.createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Department> }) => 
      adminServices.updateDepartment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServices.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// --- EMPLOYEE MANAGEMENT HOOKS ---
export const useAdminEmployees = () => {
  return useQuery({
    queryKey: ['admin', 'employees'],
    queryFn: () => adminServices.getEmployees(),
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServices.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

// --- ATTENDANCE OVERVIEW HOOKS ---
export const useAttendanceToday = () => {
  return useQuery({
    queryKey: ['admin', 'attendance'],
    queryFn: () => adminServices.getAttendanceToday(),
  });
};

// --- PAYROLL OVERVIEW HOOKS ---
export const usePayrollSummary = () => {
  return useQuery({
    queryKey: ['admin', 'payroll'],
    queryFn: () => adminServices.getPayrollSummary(),
  });
};

// --- LEAVE MANAGEMENT HOOKS ---
export const useLeaveRequests = () => {
  return useQuery({
    queryKey: ['admin', 'leaves'],
    queryFn: () => adminServices.getAllLeaves(),
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServices.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServices.rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leaves'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'activities'] });
    },
  });
};

// --- ROLES & PERMISSIONS HOOKS ---
export const useRolesPermissions = () => {
  return useQuery({
    queryKey: ['admin', 'matrix'],
    queryFn: () => adminServices.getRolesPermissions(),
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: RolePermissions['permissions'] }) => 
      adminServices.updateRolePermissions(role, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'matrix'] });
    },
  });
};
