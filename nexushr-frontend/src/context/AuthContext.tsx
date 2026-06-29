import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api';
import type { UserSession, Employee } from '../types/domain';

interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  profile: Employee | null;
  setProfile: React.Dispatch<React.SetStateAction<Employee | null>>;
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  login: (payload: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  completedSteps: number[];
  markStepCompleted: (stepId: number) => void;
  setupCompany: any;
  setSetupCompany: (val: any) => void;
  setupDocs: string[];
  setSetupDocs: (val: string[]) => void;
  setupDepts: string[];
  setSetupDepts: (val: string[]) => void;
  setupAttendanceConfig: any;
  setSetupAttendanceConfig: (val: any) => void;
  setupLeavePolicy: any;
  setSetupLeavePolicy: (val: any) => void;
  setSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  loadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Onboarding states
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('onboardingCompletedSteps');
    return saved ? JSON.parse(saved) : [];
  });
  const [setupCompany, setSetupCompanyState] = useState(() => {
    const saved = localStorage.getItem('setupCompany');
    return saved ? JSON.parse(saved) : { name: '', industry: '', website: '' };
  });
  const [setupDocs, setSetupDocsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('setupDocs');
    return saved ? JSON.parse(saved) : ['employee_handbook_draft.pdf'];
  });
  const [setupDepts, setSetupDeptsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('setupDepts');
    return saved ? JSON.parse(saved) : ['Engineering', 'Product', 'Marketing', 'HR', 'Sales'];
  });
  const [setupAttendanceConfig, setSetupAttendanceConfigState] = useState(() => {
    const saved = localStorage.getItem('setupAttendanceConfig');
    return saved ? JSON.parse(saved) : { workStart: '09:00', gracePeriodMinutes: 15 };
  });
  const [setupLeavePolicy, setSetupLeavePolicyState] = useState(() => {
    const saved = localStorage.getItem('setupLeavePolicy');
    return saved ? JSON.parse(saved) : { annualDays: 20, sickDays: 10 };
  });

  const setSetupCompany = (val: any) => {
    setSetupCompanyState(val);
    localStorage.setItem('setupCompany', JSON.stringify(val));
  };
  const setSetupDocs = (val: string[]) => {
    setSetupDocsState(val);
    localStorage.setItem('setupDocs', JSON.stringify(val));
  };
  const setSetupDepts = (val: string[]) => {
    setSetupDeptsState(val);
    localStorage.setItem('setupDepts', JSON.stringify(val));
  };
  const setSetupAttendanceConfig = (val: any) => {
    setSetupAttendanceConfigState(val);
    localStorage.setItem('setupAttendanceConfig', JSON.stringify(val));
  };
  const setSetupLeavePolicy = (val: any) => {
    setSetupLeavePolicyState(val);
    localStorage.setItem('setupLeavePolicy', JSON.stringify(val));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      const newSteps = [...completedSteps, stepId];
      setCompletedSteps(newSteps);
      localStorage.setItem('onboardingCompletedSteps', JSON.stringify(newSteps));
    }
  };

  // Check login on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email');
    const savedRole = localStorage.getItem('role');
    const savedEmpId = localStorage.getItem('employeeId');

    if (savedToken && savedUsername && savedRole) {
      setSession({
        token: savedToken,
        username: savedUsername,
        email: savedEmail || '',
        role: savedRole as any,
        employeeId: savedEmpId ? parseInt(savedEmpId) : null
      });
    }
  }, []);

  const loadProfile = async () => {
    if (session?.employeeId) {
      try {
        const prof = await api.getMyProfile();
        setProfile(prof);
      } catch {
        // No profile or failed to load
      }
    }
  };

  useEffect(() => {
    if (session) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  // Global unauthorized listener
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      showToast('Your session has expired. Please sign in again.', 'error');
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = async (payload: any) => {
    setLoading(true);
    try {
      const res = await api.login(payload);
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      localStorage.setItem('email', res.email);
      localStorage.setItem('role', res.role);
      if (res.employeeId) {
        localStorage.setItem('employeeId', res.employeeId.toString());
      }
      setSession({
        token: res.token,
        username: res.username,
        email: res.email,
        role: res.role,
        employeeId: res.employeeId
      });
      showToast(`Welcome back, ${res.username}!`);
    } catch (err: any) {
      throw new Error(err.message || 'Login credentials did not match');
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      // Force Role.EMPLOYEE on register page
      const res = await api.register({ ...payload, role: 'EMPLOYEE' });
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      localStorage.setItem('email', res.email);
      localStorage.setItem('role', res.role);
      setSession({
        token: res.token,
        username: res.username,
        email: res.email,
        role: res.role,
        employeeId: null
      });
      showToast("Welcome to the team! Let's complete your profile card.");
    } catch (err: any) {
      throw new Error(err.message || 'Could not register account');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('employeeId');
    setSession(null);
    setProfile(null);
    showToast('Successfully signed out');
  };

  return (
    <AuthContext.Provider value={{
      session, loading, setLoading, profile, setProfile, toast, showToast,
      login, register, logout, completedSteps, markStepCompleted,
      setupCompany, setSetupCompany, setupDocs, setSetupDocs, setupDepts, setSetupDepts,
      setupAttendanceConfig, setSetupAttendanceConfig, setupLeavePolicy, setSetupLeavePolicy,
      setSession, loadProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
