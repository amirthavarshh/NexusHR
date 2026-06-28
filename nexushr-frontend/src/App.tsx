import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Award, BrainCircuit, LogOut, 
  Clock, CheckCircle, AlertTriangle, Play, Check, X, Plus, 
  RefreshCw, Sparkles, Search, Moon, Sun, Bell, 
  ChevronRight, Upload, Settings, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, 
  YAxis, Tooltip, Bar
} from 'recharts';
import { api } from './api';

// Interface types
interface UserSession {
  token: string;
  username: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'HR';
  employeeId: number | null;
}

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Auth Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('EMPLOYEE');

  // Navigation & View management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Profile status
  const [profile, setProfile] = useState<any | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Profile creation state
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newPos, setNewPos] = useState('');
  const [newSalary, setNewSalary] = useState('');

  // Daily attendance state
  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  // Leaves state
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState('ANNUAL');

  // Payroll state (unused)
  // const [payrolls, setPayrolls] = useState<any[]>([]);
  // const [payrollStart, setPayrollStart] = useState('2026-06-01');
  // const [payrollEnd, setPayrollEnd] = useState('2026-06-30');

  // Performance reviews state
  // const [reviews, setReviews] = useState<any[]>([]);
  const [reviewEmployeeId, setReviewEmployeeId] = useState('');
  const [reviewRating, setReviewRating] = useState('5.0');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewGoals, setReviewGoals] = useState('');

  // Goals state
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');

  // AI insights state
  // const [skillGapData, setSkillGapData] = useState<any | null>(null);
  const [attritionReports, setAttritionReports] = useState<Record<number, any>>({});
  
  // Manager-only data
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [leaveRequestsPending, setLeaveRequestsPending] = useState<any[]>([]);
  // const [payrollAll, setPayrollAll] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<any | null>(null);
  const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Unified Search State
  const [searchQuery, setSearchQuery] = useState('');

  // UI Theme / Custom Features States
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Interactive Onboarding Setup Steps State
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('onboardingCompletedSteps');
    return saved ? JSON.parse(saved) : [];
  });

  // Custom setup states for onboarding configuration
  const [setupCompany, setSetupCompany] = useState(() => {
    const saved = localStorage.getItem('setupCompany');
    return saved ? JSON.parse(saved) : { name: '', industry: '', website: '' };
  });
  const [setupDocs, setSetupDocs] = useState<string[]>(() => {
    const saved = localStorage.getItem('setupDocs');
    return saved ? JSON.parse(saved) : ['employee_handbook_draft.pdf'];
  });
  const [setupDepts, setSetupDepts] = useState<string[]>(() => {
    const saved = localStorage.getItem('setupDepts');
    return saved ? JSON.parse(saved) : ['Engineering', 'Product', 'Marketing', 'HR', 'Sales'];
  });
  const [setupAttendanceConfig, setSetupAttendanceConfig] = useState(() => {
    const saved = localStorage.getItem('setupAttendanceConfig');
    return saved ? JSON.parse(saved) : { workStart: '09:00', gracePeriodMinutes: 15 };
  });
  const [setupLeavePolicy, setSetupLeavePolicy] = useState(() => {
    const saved = localStorage.getItem('setupLeavePolicy');
    return saved ? JSON.parse(saved) : { annualDays: 20, sickDays: 10 };
  });

  // Modal Text Inputs
  const [modalInputText, setModalInputText] = useState('');
  const [modalInputText2, setModalInputText2] = useState('');
  const [modalInputNumber, setModalInputNumber] = useState(0);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Check login on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email');
    const savedRole = localStorage.getItem('role');
    const savedEmpId = localStorage.getItem('employeeId');

    if (savedToken && savedUsername && savedRole) {
      const activeSession: UserSession = {
        token: savedToken,
        username: savedUsername,
        email: savedEmail || '',
        role: savedRole as any,
        employeeId: savedEmpId ? parseInt(savedEmpId) : null
      };
      setSession(activeSession);
    }
  }, []);

  // Fetch initial tab data
  useEffect(() => {
    if (session) {
      loadTabContext();
    }
  }, [session, activeTab]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('employeeId');
    setSession(null);
    setProfile(null);
    setTodayAttendance(null);
    setAttendanceHistory([]);
    setLeaves([]);
    // setPayrolls([]);
    setEmployeesList([]);
    setMetrics(null);
    setSelectedTeamMember(null);
    setActiveTab('dashboard');
    setUsernameInput('');
    setPasswordInput('');
    setEmailInput('');
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewDept('');
    setNewPos('');
    setNewSalary('');
    showToast('Successfully signed out');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await api.login({ username: usernameInput, password: passwordInput });
      
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
      
      setUsernameInput('');
      setPasswordInput('');
      showToast(`Welcome back, ${res.username}!`);
    } catch (err: any) {
      setAuthError(err.message || 'Login credentials did not match');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await api.register({
        username: usernameInput,
        password: passwordInput,
        email: emailInput,
        role: roleInput
      });

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

      setUsernameInput('');
      setPasswordInput('');
      setEmailInput('');
      showToast("Welcome to the team! Let's complete your profile card.");
    } catch (err: any) {
      setAuthError(err.message || 'Could not register account');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        phone: newPhone,
        department: newDept,
        position: newPos,
        salary: parseFloat(newSalary)
      };
      
      const isTeamDirectory = activeTab === 'team';
      const targetUser = isTeamDirectory ? usernameInput : undefined;

      const newEmp = await api.createProfile(payload, targetUser);
      
      if (!isTeamDirectory) {
        localStorage.setItem('employeeId', newEmp.id.toString());
        if (session) {
          setSession({ ...session, employeeId: newEmp.id });
        }
        setProfile(newEmp);
        setShowProfileForm(false);
        showToast('Profile card generated successfully!');
      } else {
        showToast(`Profile card registered and linked to ${usernameInput} successfully!`);
      }
      
      // Auto complete "Add First Employee" onboarding step if we created profile
      markStepCompleted(5);

      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPhone('');
      setNewDept('');
      setNewPos('');
      setNewSalary('');
      if (isTeamDirectory) {
        setUsernameInput('');
      }

      loadTabContext();
    } catch (err: any) {
      showToast(err.message || 'Failed to establish profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTabContext = async () => {
    if (!session) return;
    setLoading(true);
    try {
      if (session.employeeId && !profile) {
        try {
          const prof = await api.getMyProfile();
          setProfile(prof);
        } catch {
          // No profile yet
        }
      }

      if (activeTab === 'dashboard') {
        if (session.employeeId) {
          const today = await api.getTodayAttendance();
          setTodayAttendance(today);
          const history = await api.getMyAttendanceHistory();
          setAttendanceHistory(history.reverse());
        }
        if (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') {
          const team = await api.getAllEmployees();
          setEmployeesList(team);
          const allLeaves = await api.getAllLeaves();
          setLeaveRequestsPending(allLeaves.filter(l => l.status === 'PENDING'));
          const met = await api.getWorkforceMetrics();
          setMetrics(met);
        }
      } else if (activeTab === 'goals') {
        if (session.employeeId) {
          const myGoals = await api.getGoals(session.employeeId);
          setGoals(myGoals.reverse());
        }
        if (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') {
          const team = await api.getAllEmployees();
          setEmployeesList(team);
          if (selectedTeamMember) {
            const tGoals = await api.getGoals(selectedTeamMember.id);
            setGoals(tGoals.reverse());
          }
        }
      } else if (activeTab === 'attendance') {
        if (session.employeeId) {
          const today = await api.getTodayAttendance();
          setTodayAttendance(today);
          const history = await api.getMyAttendanceHistory();
          setAttendanceHistory(history.reverse());
        }
        if (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') {
          const teamAtt = await api.getAllAttendance();
          setTeamAttendance(teamAtt.reverse());
        }
      } else if (activeTab === 'leaves') {
        if (session.employeeId) {
          const myLeaves = await api.getMyLeaves();
          setLeaves(myLeaves.reverse());
        }
        if (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') {
          const allLeaves = await api.getAllLeaves();
          setTeamLeaves(allLeaves.reverse());
          setLeaveRequestsPending(allLeaves.filter(l => l.status === 'PENDING'));
        }
      } else if (activeTab === 'team') {
        if (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') {
          const team = await api.getAllEmployees();
          setEmployeesList(team);
          const met = await api.getWorkforceMetrics();
          setMetrics(met);
        }
      } else if (activeTab === 'reports') {
        if (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') {
          const met = await api.getWorkforceMetrics();
          setMetrics(met);
          const team = await api.getAllEmployees();
          setEmployeesList(team);
          
          for (const emp of team.slice(0, 5)) {
            if (!attritionReports[emp.id]) {
              try {
                const report = await api.getAttritionPrediction(emp.id);
                setAttritionReports(prev => ({ ...prev, [emp.id]: report }));
              } catch {}
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Data sync failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const attendance = await api.clockIn();
      setTodayAttendance(attendance);
      showToast('Checked in successfully. Enjoy your day!');
      loadTabContext();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleClockOut = async () => {
    try {
      const attendance = await api.clockOut();
      setTodayAttendance(attendance);
      showToast('Checked out. Have a relaxing evening!');
      loadTabContext();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.applyLeave({
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: leaveReason,
        type: leaveType
      });
      showToast('Leave request submitted to your manager');
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
      loadTabContext();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleApproveLeave = async (id: number) => {
    try {
      await api.approveLeave(id);
      showToast('Leave request approved successfully');
      
      // Auto complete "Create Leave Policy" onboarding step if we approve a leave
      markStepCompleted(7);

      loadTabContext();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await api.rejectLeave(id);
      showToast('Leave request has been declined');
      loadTabContext();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // const handleRunPayroll = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const results = await api.runPayroll(payrollStart, payrollEnd);
  //     showToast(`Payroll slips computed for ${results.length} active members`);
  //     
  //     // Auto complete "Add Payroll Cycle" onboarding step
  //     markStepCompleted(8);
  // 
  //     loadTabContext();
  //   } catch (err: any) {
  //     showToast(err.message, 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // 
  // const handlePaySalary = async (id: number) => {
  //   try {
  //     await api.payPayroll(id);
  //     showToast('Salary payment successfully disbursed');
  //     loadTabContext();
  //   } catch (err: any) {
  //     showToast(err.message, 'error');
  //   }
  // };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReview({
        employeeId: parseInt(reviewEmployeeId),
        rating: parseFloat(reviewRating),
        feedback: reviewFeedback,
        goals: reviewGoals
      });
      showToast('Employee appraisal submitted successfully');
      setReviewEmployeeId('');
      setReviewFeedback('');
      setReviewGoals('');
      loadTabContext();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const inspectEmployeeAttrition = async (empId: number) => {
    if (attritionReports[empId]) return;
    try {
      const rep = await api.getAttritionPrediction(empId);
      setAttritionReports(prev => ({ ...prev, [empId]: rep }));
    } catch (err: any) {
      showToast('Could not load AI attrition report', 'error');
    }
  };

  const inspectEmployeeGoals = async (empId: number) => {
    try {
      const g = await api.getGoals(empId);
      setGoals(g.reverse());
    } catch {
      setGoals([]);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamMember) return;
    try {
      await api.createGoal({
        employeeId: selectedTeamMember.id,
        title: newGoalTitle,
        description: newGoalDescription,
        targetDate: newGoalTargetDate
      });
      showToast('Goal assigned successfully');
      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalTargetDate('');
      inspectEmployeeGoals(selectedTeamMember.id);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleGoalStatus = async (goalId: number, currentStatus: string) => {
    let newStatus = 'IN_PROGRESS';
    if (currentStatus === 'IN_PROGRESS') {
      newStatus = 'COMPLETED';
    } else if (currentStatus === 'COMPLETED') {
      newStatus = 'PENDING';
    }
    try {
      await api.updateGoalStatus(goalId, newStatus);
      showToast(`Goal status updated to ${newStatus}`);
      if (session && session.employeeId) {
        const myGoals = await api.getGoals(session.employeeId);
        setGoals(myGoals.reverse());
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Helper: Mark Onboarding steps completed
  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      const newSteps = [...completedSteps, stepId];
      setCompletedSteps(newSteps);
      localStorage.setItem('onboardingCompletedSteps', JSON.stringify(newSteps));
    }
  };

  const handleOnboardingAction = (stepId: number) => {
    if (stepId === 1) {
      setModalInputText(setupCompany.name);
      setModalInputText2(setupCompany.website);
      setActiveModal('company');
    } else if (stepId === 2) {
      setActiveModal('documents');
    } else if (stepId === 3) {
      setActiveModal('departments');
    } else if (stepId === 4) {
      setUsernameInput('');
      setPasswordInput('');
      setEmailInput('');
      setRoleInput('ADMIN');
      setActiveModal('admins');
    } else if (stepId === 5) {
      setActiveTab('team');
      showToast('Complete the "Register Employee Profile" form below to add an employee.');
    } else if (stepId === 6) {
      setModalInputText(setupAttendanceConfig.workStart);
      setModalInputNumber(setupAttendanceConfig.gracePeriodMinutes);
      setActiveModal('attendance');
    } else if (stepId === 7) {
      setModalInputNumber(setupLeavePolicy.annualDays);
      setActiveModal('leave-policy');
    } else if (stepId === 8) {
      setActiveTab('payroll');
      showToast('Set the pay period dates and click Calculate Statements.');
    }
  };

  const saveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { name: modalInputText, website: modalInputText2, industry: 'Tech' };
    setSetupCompany(updated);
    localStorage.setItem('setupCompany', JSON.stringify(updated));
    markStepCompleted(1);
    setActiveModal(null);
    showToast('Company Profile setup completed!');
  };

  const uploadDummyDocument = () => {
    const filename = `manual_upload_${Date.now().toString().slice(-4)}.pdf`;
    const updated = [...setupDocs, filename];
    setSetupDocs(updated);
    localStorage.setItem('setupDocs', JSON.stringify(updated));
    markStepCompleted(2);
    showToast('Document uploaded successfully!');
  };

  const addDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInputText) return;
    const updated = [...setupDepts, modalInputText];
    setSetupDepts(updated);
    localStorage.setItem('setupDepts', JSON.stringify(updated));
    setModalInputText('');
    markStepCompleted(3);
    showToast('New department added to directory!');
  };

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({
        username: usernameInput,
        password: passwordInput,
        email: emailInput,
        role: roleInput
      });
      markStepCompleted(4);
      setActiveModal(null);
      showToast('Successfully registered new workspace administrator!');
    } catch (err: any) {
      showToast(err.message || 'Could not register administrator', 'error');
    }
  };

  const saveAttendanceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { workStart: modalInputText, gracePeriodMinutes: modalInputNumber };
    setSetupAttendanceConfig(updated);
    localStorage.setItem('setupAttendanceConfig', JSON.stringify(updated));
    markStepCompleted(6);
    setActiveModal(null);
    showToast('Attendance rules updated successfully!');
  };

  const saveLeavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { annualDays: modalInputNumber, sickDays: 10 };
    setSetupLeavePolicy(updated);
    localStorage.setItem('setupLeavePolicy', JSON.stringify(updated));
    markStepCompleted(7);
    setActiveModal(null);
    showToast('Leave quota policy created!');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Filtered lists for search query
  const filteredEmployees = employeesList.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-sky-100 selection:text-sky-900 relative transition-colors duration-300 dark:bg-slate-900 dark:text-slate-300">
      
      {/* Global Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 border ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/80 dark:border-red-900 dark:text-red-300' : 'bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-300'
        } animate-fadeIn`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main modals container */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 relative animate-fadeIn dark:bg-slate-800 dark:border-slate-700">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            {activeModal === 'company' && (
              <form onSubmit={saveCompanyProfile} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Setup Company Profile</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Company Name</label>
                  <input 
                    type="text" required value={modalInputText} onChange={(e) => setModalInputText(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Website URL</label>
                  <input 
                    type="url" required value={modalInputText2} onChange={(e) => setModalInputText2(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <button type="submit" className="w-full py-2 btn-primary font-semibold text-sm">Save Profile</button>
              </form>
            )}

            {activeModal === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upload Workspace Documents</h3>
                <p className="text-xs text-slate-500">Provide manuals, compliance policies, or templates for employees.</p>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors">
                  <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                  <button onClick={uploadDummyDocument} className="btn-secondary px-4 py-1.5 text-xs font-semibold">Upload Document</button>
                  <span className="block text-[10px] text-slate-400 mt-1">PDF, DOCX up to 10MB</span>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 block">Uploaded Files:</span>
                  {setupDocs.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-amber-500" />
                        <span className="truncate max-w-[200px] font-mono">{doc}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'departments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Departments</h3>
                <form onSubmit={addDepartment} className="flex gap-2">
                  <input 
                    type="text" required placeholder="e.g. Finance" value={modalInputText} onChange={(e) => setModalInputText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                  <button type="submit" className="btn-primary px-4 py-2 text-sm font-semibold">Add</button>
                </form>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 block">Active Departments:</span>
                  <div className="flex flex-wrap gap-2">
                    {setupDepts.map((dept, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'admins' && (
              <form onSubmit={createAdminUser} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Invite Workspace Admin</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                  <input 
                    type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input 
                    type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                  <input 
                    type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
                  <select 
                    value={roleInput} onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="HR">HR Officer</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 btn-primary font-semibold text-sm">Create Admin</button>
              </form>
            )}

            {activeModal === 'attendance' && (
              <form onSubmit={saveAttendanceConfig} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Configure Attendance Tracking</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Shift Start Time (24h format)</label>
                  <input 
                    type="text" required placeholder="09:00" value={modalInputText} onChange={(e) => setModalInputText(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Grace Period (Minutes)</label>
                  <input 
                    type="number" required value={modalInputNumber} onChange={(e) => setModalInputNumber(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <button type="submit" className="w-full py-2 btn-primary font-semibold text-sm">Save Configuration</button>
              </form>
            )}

            {activeModal === 'leave-policy' && (
              <form onSubmit={saveLeavePolicy} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create Leave Policy</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Annual Paid Leave Quota (Days)</label>
                  <input 
                    type="number" required value={modalInputNumber} onChange={(e) => setModalInputNumber(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                  />
                </div>
                <button type="submit" className="w-full py-2 btn-primary font-semibold text-sm">Create Policy</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="glass sticky top-0 z-45 py-3 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-600 flex items-center justify-center shadow-md">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight font-display text-slate-900 dark:text-white m-0 p-0">
              NexusHR
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold dark:text-slate-500">
              Workforce Intelligence
            </span>
          </div>
        </div>

        {/* Header center search bar */}
        {session && (
          <div className="hidden md:flex items-center relative w-80">
            <Search className="absolute left-3 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search directory, departments, positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-800"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {session && (
            <>
              {/* Notification icon */}
              <div className="relative cursor-pointer p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <Bell size={18} />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
              </div>

              {/* User profile dropdown & signout */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {session.username[0].toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{session.username}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-semibold">{session.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold dark:border-slate-700 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <LogOut size={12} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* LOGGED OUT VIEW */}
        {!session ? (
          <div className="login-bg flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
            <div className="glass-card max-w-md w-full p-8 relative dark:bg-slate-800 dark:border-slate-700">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded bg-amber-700 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <BrainCircuit className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {isRegistering 
                    ? 'Register a new account to access the platform.' 
                    : 'Access your employee or manager dashboard.'}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-750 text-xs flex items-center gap-2 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                  <AlertTriangle size={14} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input 
                    type="text" 
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full px-3 py-2 rounded border border-slate-200 text-slate-855 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                {isRegistering && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@enterprise.com"
                      className="w-full px-3 py-2 rounded border border-slate-200 text-slate-855 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded border border-slate-200 text-slate-855 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 text-sm shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>



                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 btn-primary font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError('');
                  }}
                  className="text-xs text-amber-600 hover:underline font-semibold dark:text-amber-400"
                >
                  {isRegistering 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          /* LOGGED IN NAVIGATION AND CONTENT PANELS */
          <>
            <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-4 shrink-0 dark:bg-slate-850 dark:border-slate-700">
              
              {/* Profile Card Summary */}
              {profile ? (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold font-display shadow-sm dark:bg-amber-950 dark:text-amber-300">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{profile.firstName} {profile.lastName}</h4>
                      <p className="text-[10px] text-slate-550 truncate">{profile.position}</p>
                    </div>
                  </div>
                </div>
              ) : session.employeeId ? (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 animate-pulse flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-center dark:bg-red-950/30 dark:border-red-900 animate-fadeIn">
                  <p className="text-[10px] text-red-650 font-bold mb-1.5 dark:text-red-400">No Profile Connected</p>
                  <button 
                    onClick={() => setShowProfileForm(true)}
                    className="w-full py-1 btn-primary text-xs font-semibold cursor-pointer"
                  >
                    Setup Profile Card
                  </button>
                </div>
              )}

              {/* Sidebar Menu Items */}
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 dark:text-slate-500">Core Hub</span>
                
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'dashboard' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle size={15} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('goals')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'goals' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Award size={15} />
                  <span>My Goals</span>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'attendance' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock size={15} />
                  <span>Attendance</span>
                </button>

                <button
                  onClick={() => setActiveTab('leaves')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'leaves' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Calendar size={15} />
                  <span>Leave Requests</span>
                </button>
              </div>

              {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
                <div className="space-y-1">
                  <span className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 dark:text-slate-500">Management</span>

                  <button
                    onClick={() => setActiveTab('team')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'team' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Users size={15} />
                    <span>Team Directory</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'reports' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <BrainCircuit size={15} />
                    <span>Reports</span>
                  </button>
                </div>
              )}

              {/* Sidebar footer settings */}
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 cursor-pointer"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>
              </div>
            </aside>

            {/* Content Display Window */}
            <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
              
              {/* Profile Setup Modal overlay if profile missing */}
              {showProfileForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(10,14,30,0.7)', backdropFilter: 'blur(8px)'}}>
                  <div className="animate-fadeIn w-full max-w-xl relative" style={{background: 'linear-gradient(145deg, #1e2035 0%, #161829 100%)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '1.25rem', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset'}}>
                    {/* Header gradient bar */}
                    <div style={{height: '4px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)', borderRadius: '1.25rem 1.25rem 0 0'}} />

                    <div className="p-7">
                      {/* Title row */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <div style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '0.5rem', padding: '6px', display: 'flex'}}>
                              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                            </div>
                            <h3 className="text-lg font-bold font-display" style={{color: '#f1f5f9'}}>Complete Your Profile</h3>
                          </div>
                          <p style={{color: '#94a3b8', fontSize: '0.8rem'}}>Fill in your details to activate your employee card</p>
                        </div>
                        <button
                          onClick={() => setShowProfileForm(false)}
                          style={{color: '#64748b', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '6px', cursor: 'pointer', transition: 'all 0.2s'}}
                          onMouseOver={e => (e.currentTarget.style.color = '#f1f5f9')}
                          onMouseOut={e => (e.currentTarget.style.color = '#64748b')}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <form onSubmit={handleCreateProfile} className="space-y-4">
                        {/* Section label */}
                        <p style={{color: '#6366f1', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Personal Information</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>First Name <span style={{color:'#ef4444'}}>*</span></label>
                            <input
                              type="text" required value={newFirstName} placeholder="e.g. Amirtha"
                              onChange={(e) => setNewFirstName(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#6366f1')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>Last Name <span style={{color:'#ef4444'}}>*</span></label>
                            <input
                              type="text" required value={newLastName} placeholder="e.g. Gopinath"
                              onChange={(e) => setNewLastName(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#6366f1')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>Work Email <span style={{color:'#ef4444'}}>*</span></label>
                            <input
                              type="email" required value={newEmail} placeholder="name@company.com"
                              onChange={(e) => setNewEmail(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#6366f1')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>Phone Number <span style={{color:'#ef4444'}}>*</span></label>
                            <input
                              type="tel" required value={newPhone} placeholder="+91 98765 43210"
                              onChange={(e) => setNewPhone(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#6366f1')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0.5rem 0'}} />
                        <p style={{color: '#8b5cf6', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Role & Compensation</p>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>Department <span style={{color:'#ef4444'}}>*</span></label>
                            <select
                              required value={newDept} onChange={(e) => setNewDept(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(30,32,53,0.98)', color: newDept ? '#f1f5f9' : '#64748b', fontSize:'0.8rem', outline:'none', boxSizing:'border-box', cursor:'pointer', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#8b5cf6')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            >
                              <option value="" disabled style={{color:'#64748b'}}>Select dept.</option>
                              {setupDepts.map((d, i) => (
                                <option key={i} value={d} style={{background:'#1e2035', color:'#f1f5f9'}}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>Job Title <span style={{color:'#ef4444'}}>*</span></label>
                            <input
                              type="text" required value={newPos} placeholder="e.g. Sr. Engineer"
                              onChange={(e) => setNewPos(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#8b5cf6')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                          <div>
                            <label style={{display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#94a3b8', marginBottom:'0.35rem', letterSpacing:'0.03em'}}>Monthly Salary (₹) <span style={{color:'#ef4444'}}>*</span></label>
                            <input
                              type="number" required value={newSalary} placeholder="e.g. 85000" min="0"
                              onChange={(e) => setNewSalary(e.target.value)}
                              style={{width:'100%', padding:'0.55rem 0.75rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s'}}
                              onFocus={e => (e.target.style.borderColor = '#8b5cf6')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end" style={{paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem'}}>
                          <button
                            type="button" onClick={() => setShowProfileForm(false)}
                            style={{padding:'0.6rem 1.25rem', borderRadius:'0.5rem', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#94a3b8', fontSize:'0.875rem', fontWeight:'600', cursor:'pointer', transition:'all 0.2s'}}
                            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#f1f5f9'; }}
                            onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#94a3b8'; }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit" disabled={loading}
                            style={{padding:'0.6rem 1.5rem', borderRadius:'0.5rem', border:'none', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', color:'#fff', fontSize:'0.875rem', fontWeight:'700', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 15px rgba(99,102,241,0.4)', opacity: loading ? 0.7 : 1}}
                          >
                            {loading ? 'Saving...' : '✓ Save Profile'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Loader indicator */}
              {loading && (
                <div className="flex justify-center mb-6 animate-fadeIn">
                  <div className="px-4 py-1.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    <RefreshCw className="animate-spin" size={13} />
                    <span>Syncing platform database...</span>
                  </div>
                </div>
              )}

              {/* 1. CLOCK & DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Top Welcome Title */}
                  <div className="flex justify-between items-center animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white">Welcome, {profile ? `${profile.firstName} ${profile.lastName}` : session.username}</h2>
                      <p className="text-xs text-slate-500 mt-1 dark:text-slate-400 font-medium">Let's set up your workspace and manage team operations.</p>
                    </div>
                    
                    {!session.employeeId && (
                      <button 
                        onClick={() => setShowProfileForm(true)}
                        className="px-4 py-2 btn-primary text-sm font-semibold flex items-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Plus size={16} />
                        <span>Complete Profile</span>
                      </button>
                    )}
                  </div>

                  {/* Manager view: 4 KPI Cards */}
                  {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                      <div className="glass-card p-4 flex flex-col justify-between kpi-amber">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Employees</span>
                          <Users size={16} className="text-amber-600 animate-pulse" />
                        </div>
                        <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">{employeesList.length || metrics?.totalEmployees || 0}</span>
                      </div>

                      <div className="glass-card p-4 flex flex-col justify-between kpi-green">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Employees</span>
                          <CheckCircle size={16} className="text-emerald-500" />
                        </div>
                        <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">
                          {employeesList.filter(e => e.status === 'ACTIVE').length || 0}
                        </span>
                      </div>

                      <div className={`glass-card p-4 flex flex-col justify-between ${leaveRequestsPending.length > 3 ? 'kpi-red' : 'kpi-amber'}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Leave Approvals</span>
                          <Calendar size={16} className={leaveRequestsPending.length > 3 ? 'text-rose-500' : 'text-amber-600'} />
                        </div>
                        <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">{leaveRequestsPending.length}</span>
                      </div>

                      <div className="glass-card p-4 flex flex-col justify-between kpi-amber">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Performance</span>
                          <Sparkles size={16} className="text-amber-600" />
                        </div>
                        <span className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">
                          {(metrics?.averagePerformance || (employeesList.length > 0 ? (employeesList.reduce((sum, e) => sum + e.performanceRating, 0) / employeesList.length) : 0)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Onboarding Checklist Section for Manager, Admin, and HR */}
                  {(session.role === 'ADMIN' || session.role === 'HR' || session.role === 'MANAGER') && (
                    <div className="glass-card p-6 bg-white dark:bg-slate-850 dark:border-slate-700 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Get Started With Your Workspace</h3>
                          <p className="text-xs text-slate-500">Complete these essential steps to unlock the full potential of your HRMS.</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-750 dark:text-slate-300">{completedSteps.length}/8 Completed</span>
                        </div>
                      </div>

                      {/* Onboarding Progress bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden dark:bg-slate-800">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${(completedSteps.length / 8) * 100}%` }}
                        />
                      </div>

                      {/* Onboarding Grid of Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { id: 1, title: 'Add Company Profile', desc: 'Set up your company profile details.' },
                          { id: 2, title: 'Upload Documents', desc: 'Provide company guidelines & documents.' },
                          { id: 3, title: 'Add Departments', desc: 'Create organizational structure groups.' },
                          { id: 4, title: 'Invite Team Admins', desc: 'Add secondary workspace admin users.' },
                          { id: 5, title: 'Add First Employee', desc: 'Register team members in directory.' },
                          { id: 6, title: 'Configure Attendance', desc: 'Define shift times and grace limits.' },
                          { id: 7, title: 'Create Leave Policy', desc: 'Set quotas for annual & sick leaves.' },
                          { id: 8, title: 'Add Payroll Cycle', desc: 'Compute monthly salary payouts.' }
                        ].map((step) => {
                          const isDone = completedSteps.includes(step.id);
                          return (
                            <div 
                              key={step.id}
                              onClick={() => handleOnboardingAction(step.id)}
                              className={`onboarding-card p-4 rounded-lg border text-left cursor-pointer flex flex-col justify-between min-h-[120px] ${
                                isDone 
                                  ? 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700' 
                                  : 'bg-white border-slate-200 hover:shadow-md dark:bg-slate-800 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-xl font-bold font-display ${isDone ? 'text-slate-400' : 'text-amber-500'}`}>
                                  {step.id}
                                </span>
                                {isDone ? (
                                  <Check className="text-emerald-500" size={16} />
                                ) : (
                                  <ChevronRight className="text-slate-400" size={14} />
                                )}
                              </div>
                              <div>
                                <h4 className={`text-xs font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                                  {step.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-1">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Onboarding Help Widget */}
                      <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3 dark:border-slate-800">
                        <p className="text-xs text-slate-500">Need help setting up? We are here to help you get started.</p>
                        <button 
                          onClick={() => {
                            setActiveTab('reports');
                            showToast("Check 'AI Predictive Attrition Board' for AI workforce transformations!");
                          }}
                          className="px-5 py-2 btn-primary text-xs font-semibold flex items-center gap-1.5 mx-auto"
                        >
                          <Sparkles size={12} />
                          <span>Ask AI ✨</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Standard view for Employee */}
                  {session.employeeId ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Summary Profile Details */}
                      <div className="glass-card p-6 flex flex-col justify-between accent-border-lavender animate-fadeIn">
                        <div>
                          <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Job Details</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 dark:border-slate-700">
                              <span className="text-xs text-slate-500">Position</span>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{profile?.position || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 dark:border-slate-700">
                              <span className="text-xs text-slate-500">Department</span>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{profile?.department || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 dark:border-slate-700">
                              <span className="text-xs text-slate-500">Basic Salary</span>
                              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                                {profile ? `$${profile.salary.toLocaleString()}/mo` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">Performance Rating</span>
                              <div className="flex items-center gap-1 badge-pastel-amber px-2.5 py-0.5 rounded">
                                <Sparkles size={11} className="text-amber-600" />
                                <span className="text-xs font-bold">{profile?.performanceRating?.toFixed(1) || '3.0'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {profile?.status && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider font-semibold">Employment State</span>
                            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                                profile.status === 'ACTIVE' ? 'badge-pastel-green' : 'badge-pastel-amber'
                            }`}>
                              {profile.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Recent Attendance Logs Table */}
                      <div className="lg:col-span-2 glass-card p-6 accent-border-mint animate-fadeIn">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Your Recent Shifts</h3>
                        {attendanceHistory.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider dark:border-slate-700">
                                  <th className="pb-3 font-semibold">Date</th>
                                  <th className="pb-3 font-semibold">Clock In</th>
                                  <th className="pb-3 font-semibold">Clock Out</th>
                                  <th className="pb-3 font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {attendanceHistory.slice(0, 5).map((log) => (
                                  <tr key={log.id} className="text-slate-600 dark:text-slate-455">
                                    <td className="py-3 font-mono text-xs">{formatDate(log.date)}</td>
                                    <td className="py-3 font-mono text-xs text-slate-700 dark:text-slate-350">{log.clockIn ? log.clockIn.slice(0, 5) : '--:--'}</td>
                                    <td className="py-3 font-mono text-xs text-slate-700 dark:text-slate-350">{log.clockOut ? log.clockOut.slice(0, 5) : '--:--'}</td>
                                    <td className="py-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                        log.status === 'PRESENT' ? 'badge-pastel-green' :
                                        log.status === 'LATE' ? 'badge-pastel-amber' : 'badge-pastel-rose'
                                      }`}>
                                        {log.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-xs">No shift logs found. Complete check-ins in the Attendance tab!</div>
                        )}
                      </div>

                    </div>
                  ) : (
                    !completedSteps.includes(5) && (
                      <div className="glass-card p-8 text-center max-w-xl mx-auto space-y-4 accent-border-rose animate-fadeIn">
                        <BrainCircuit className="text-slate-450 mx-auto animate-bounce" size={48} />
                        <h3 className="text-lg font-bold text-slate-855 dark:text-white">Profile Card Setup Recommended</h3>
                        <p className="text-xs text-slate-500">
                          Complete profile cards to activate logger, leave submissions, and payroll slips.
                        </p>
                        <button 
                          onClick={() => setShowProfileForm(true)}
                          className="px-6 py-2 btn-primary font-semibold text-xs shadow cursor-pointer"
                        >
                          Complete Profile Card
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* 2. LEAVES TAB */}
              {activeTab === 'leaves' && (() => {
                const leavesDataForStats = (session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') ? teamLeaves : leaves;
                const todayDate = new Date();
                const curYear = todayDate.getFullYear();
                const countPending = leavesDataForStats.filter(l => l.status === 'PENDING').length;
                const countPlanned = leavesDataForStats.filter(l => l.status === 'APPROVED' && new Date(l.startDate) > todayDate).length;
                const countTaken = leavesDataForStats.filter(l => l.status === 'APPROVED' && new Date(l.endDate) < todayDate && new Date(l.endDate).getFullYear() === curYear).length;
                const filteredTeamLeavesList = teamLeaves.filter(l => leaveFilter === 'ALL' || l.status === leaveFilter);

                return (
                  <div className="space-y-6">
                    
                    <div>
                      <h2 className="text-2xl font-bold font-display text-slate-855 dark:text-white">Leave & Absence Tracker</h2>
                      <p className="text-xs text-slate-500">Submit requests for annual, sick, or unpaid leave and track approval progress.</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                      <div className="glass-card p-4 text-center kpi-amber">
                        <span className="text-[10px] text-slate-550 dark:text-slate-400 block mb-1 font-bold">Pending Requests</span>
                        <span className="text-xl font-extrabold text-slate-800 dark:text-white">{countPending}</span>
                      </div>
                      <div className="glass-card p-4 text-center kpi-green">
                        <span className="text-[10px] text-slate-550 dark:text-slate-400 block mb-1 font-bold">Planned Absences</span>
                        <span className="text-xl font-extrabold text-slate-800 dark:text-white">{countPlanned}</span>
                      </div>
                      <div className="glass-card p-4 text-center kpi-amber">
                        <span className="text-[10px] text-slate-550 dark:text-slate-400 block mb-1 font-bold">Leaves Taken (YTD)</span>
                        <span className="text-xl font-extrabold text-slate-800 dark:text-white">{countTaken}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Submit Leave Application Form */}
                      <div className="glass-card p-6 bg-white dark:bg-slate-855 dark:border-slate-700 accent-border-peach animate-fadeIn">
                        <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Request Absence</h3>
                        <form onSubmit={handleApplyLeave} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                            <input 
                              type="date" required value={leaveStart} 
                              onChange={(e) => setLeaveStart(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-350" 
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                            <input 
                              type="date" required value={leaveEnd} 
                              onChange={(e) => setLeaveEnd(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-350" 
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Absence Type</label>
                            <select 
                              value={leaveType} onChange={(e) => setLeaveType(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-350"
                            >
                              <option value="ANNUAL">Annual Leave (Paid)</option>
                              <option value="SICK">Sick Leave (Paid)</option>
                              <option value="UNPAID">Unpaid Leave (Payroll Deducted)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason / Note</label>
                            <textarea 
                              required rows={3} value={leaveReason}
                              onChange={(e) => setLeaveReason(e.target.value)}
                              placeholder="Brief description..."
                              className="w-full px-3 py-2 rounded border border-slate-200 text-sm focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-350" 
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-2 btn-primary font-semibold text-sm cursor-pointer shadow flex items-center justify-center gap-2"
                          >
                            <span>Send Request</span>
                          </button>
                        </form>
                      </div>

                      {/* Left side requests list */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Manager view: Team Leave Administration */}
                        {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
                          <div className="space-y-6">
                            
                            {/* Filter Bar */}
                            <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
                              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => setLeaveFilter(f as any)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
                                    leaveFilter === f 
                                      ? 'bg-amber-500 text-white shadow-sm' 
                                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {f === 'ALL' ? 'All Team Requests' : f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                              ))}
                            </div>

                            {/* Pending Team Approvals list */}
                            {leaveRequestsPending.length > 0 && (leaveFilter === 'ALL' || leaveFilter === 'PENDING') && (
                              <div className="glass-card p-6 accent-border-peach animate-fadeIn">
                                <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4 flex items-center gap-2">
                                  <Calendar className="text-orange-500 animate-pulse" size={18} />
                                  <span>Pending Team Approvals</span>
                                </h3>
                                
                                <div className="space-y-4 animate-fadeIn">
                                  {leaveRequestsPending.map((req) => (
                                    <div key={req.id} className="p-4 rounded bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dark:bg-slate-800 dark:border-slate-750 animate-fadeIn">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-sm text-slate-800 dark:text-white">
                                            {req.employee.firstName} {req.employee.lastName}
                                          </span>
                                          <span className="text-[9px] badge-pastel-indigo px-2 py-0.5 rounded font-bold uppercase">
                                            {req.type}
                                          </span>
                                        </div>
                                        <span className="text-xs text-slate-555 block mt-1 dark:text-slate-400">
                                          Dates: <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(req.startDate)}</span> to <span className="font-mono text-slate-700 dark:text-slate-300">{formatDate(req.endDate)}</span>
                                        </span>
                                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-200 dark:bg-slate-750/30 dark:border-slate-650 dark:text-slate-350">
                                          <strong>Notes:</strong> {req.reason}
                                        </p>
                                      </div>

                                      <div className="flex gap-2 self-end sm:self-center">
                                        <button 
                                          onClick={() => handleRejectLeave(req.id)}
                                          className="p-1.5 rounded btn-danger cursor-pointer"
                                          title="Decline"
                                        >
                                          <X size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleApproveLeave(req.id)}
                                          className="p-1.5 rounded btn-success cursor-pointer"
                                          title="Approve"
                                        >
                                          <Check size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Team Leaves Ledger Table */}
                            <div className="glass-card p-6 accent-border-peach animate-fadeIn">
                              <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Team Leaves Ledger</h3>
                              {filteredTeamLeavesList.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                                    <thead>
                                      <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider dark:border-slate-700 font-bold">
                                        <th className="pb-3">Employee</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Duration</th>
                                        <th className="pb-3">Reason</th>
                                        <th className="pb-3">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {filteredTeamLeavesList.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                          <td className="py-3 font-bold text-slate-800 dark:text-white">
                                            {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'N/A'}
                                          </td>
                                          <td className="py-3">
                                            <span className="text-[10px] badge-pastel-indigo px-2 py-0.5 rounded font-mono font-bold uppercase">
                                              {req.type}
                                            </span>
                                          </td>
                                          <td className="py-3 text-xs font-mono text-slate-700 dark:text-slate-350">
                                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                                          </td>
                                          <td className="py-3 text-xs max-w-[150px] truncate" title={req.reason}>{req.reason}</td>
                                          <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                              req.status === 'APPROVED' ? 'badge-pastel-green' :
                                              req.status === 'PENDING' ? 'badge-pastel-amber' :
                                              req.status === 'REJECTED' ? 'badge-pastel-rose' : 'badge-pastel-amber'
                                            }`}>
                                              {req.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-slate-400 text-xs">No team leaves found.</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* My Leave requests table */}
                        {session.employeeId && (
                          <div className="glass-card p-6 accent-border-peach animate-fadeIn">
                            <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Absence History (Personal)</h3>
                            {leaves.length > 0 ? (
                               <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider dark:border-slate-700 font-bold">
                                      <th className="pb-3">Type</th>
                                      <th className="pb-3">Duration</th>
                                      <th className="pb-3">Reason</th>
                                      <th className="pb-3">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {leaves.map((req) => (
                                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="py-3">
                                          <span className="text-[10px] badge-pastel-indigo px-2 py-0.5 rounded font-mono font-bold uppercase">
                                            {req.type}
                                          </span>
                                        </td>
                                        <td className="py-3 text-xs font-mono text-slate-700 dark:text-slate-350">
                                          {formatDate(req.startDate)} - {formatDate(req.endDate)}
                                        </td>
                                        <td className="py-3 text-xs max-w-[150px] truncate" title={req.reason}>{req.reason}</td>
                                        <td className="py-3">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                            req.status === 'APPROVED' ? 'badge-pastel-green' :
                                            req.status === 'PENDING' ? 'badge-pastel-amber' :
                                            req.status === 'REJECTED' ? 'badge-pastel-rose' : 'badge-pastel-amber'
                                          }`}>
                                            {req.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-6 text-slate-400 text-xs">No leave history found.</div>
                            )}
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* 3. ATTENDANCE TAB */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  
                  <div>
                    <h2 className="text-2xl font-bold font-display text-slate-855 dark:text-white">Attendance Tracking</h2>
                    <p className="text-xs text-slate-500">Monitor shift logs, check-in statuses, and historical workforce timings.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Employee clock tracker card & shift logs */}
                    {session.employeeId && (
                      <>
                        {/* Attendance Clock Card */}
                        <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between accent-border-mint animate-fadeIn">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                              <Clock className="text-emerald-500 animate-pulse" size={18} />
                              <span>Shift Time Tracker</span>
                            </h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Log check-ins. Shifts beginning past 09:15 AM flag automatically as Late.</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="p-4 rounded bg-slate-50 border border-slate-200 text-center dark:bg-slate-800 dark:border-slate-700">
                                <span className="text-[10px] text-slate-400 block mb-1">Check In Time</span>
                                <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-350">
                                  {todayAttendance && todayAttendance.clockIn ? todayAttendance.clockIn.slice(0, 5) : '--:--'}
                                </span>
                              </div>
                              <div className="p-4 rounded bg-slate-50 border border-slate-200 text-center dark:bg-slate-800 dark:border-slate-700">
                                <span className="text-[10px] text-slate-400 block mb-1">Check Out Time</span>
                                <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-350">
                                  {todayAttendance && todayAttendance.clockOut ? todayAttendance.clockOut.slice(0, 5) : '--:--'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex gap-4">
                              <button 
                                disabled={!!todayAttendance}
                                onClick={handleClockIn}
                                className={`flex-1 py-2 rounded flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                                  todayAttendance 
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700' 
                                    : 'btn-success cursor-pointer'
                                }`}
                              >
                                <Play size={14} />
                                <span>Clock In</span>
                              </button>
                              
                              <button 
                                disabled={!todayAttendance || !!todayAttendance.clockOut}
                                onClick={handleClockOut}
                                className={`flex-1 py-2 rounded flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                                  (!todayAttendance || todayAttendance.clockOut)
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700' 
                                    : 'btn-danger cursor-pointer'
                                }`}
                              >
                                <LogOut size={14} />
                                <span>Clock Out</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Recent Attendance Logs Table */}
                        <div className="lg:col-span-2 glass-card p-6 accent-border-mint animate-fadeIn">
                          <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Your Shifts History</h3>
                          {attendanceHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs text-slate-655 dark:text-slate-400">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider dark:border-slate-700 font-bold">
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Clock In</th>
                                    <th className="pb-3">Clock Out</th>
                                    <th className="pb-3">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {attendanceHistory.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                      <td className="py-3 font-mono text-xs">{formatDate(log.date)}</td>
                                      <td className="py-3 font-mono text-xs text-slate-700 dark:text-slate-350">{log.clockIn ? log.clockIn.slice(0, 5) : '--:--'}</td>
                                      <td className="py-3 font-mono text-xs text-slate-700 dark:text-slate-350">{log.clockOut ? log.clockOut.slice(0, 5) : '--:--'}</td>
                                      <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                          log.status === 'PRESENT' ? 'badge-pastel-green' :
                                          log.status === 'LATE' ? 'badge-pastel-amber' : 'badge-pastel-rose'
                                        }`}>
                                          {log.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-400 text-xs">No shift logs found. Click Clock In to log your check-in.</div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Manager view: Team Attendance list */}
                    {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
                      <div className="lg:col-span-3 glass-card p-6 accent-border-mint animate-fadeIn">
                        <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Team Attendance Ledger</h3>
                        {teamAttendance.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-655 dark:text-slate-400">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider dark:border-slate-700 font-bold">
                                  <th className="pb-3">Employee</th>
                                  <th className="pb-3">Date</th>
                                  <th className="pb-3">Clock In</th>
                                  <th className="pb-3">Clock Out</th>
                                  <th className="pb-3">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teamAttendance.map((log) => (
                                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="py-3 font-bold text-slate-800 dark:text-white">
                                      {log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : 'N/A'}
                                    </td>
                                    <td className="py-3 font-mono text-xs">{formatDate(log.date)}</td>
                                    <td className="py-3 font-mono text-xs text-slate-700 dark:text-slate-350">{log.clockIn ? log.clockIn.slice(0, 5) : '--:--'}</td>
                                    <td className="py-3 font-mono text-xs text-slate-700 dark:text-slate-350">{log.clockOut ? log.clockOut.slice(0, 5) : '--:--'}</td>
                                    <td className="py-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                        log.status === 'PRESENT' ? 'badge-pastel-green' :
                                        log.status === 'LATE' ? 'badge-pastel-amber' : 'badge-pastel-rose'
                                      }`}>
                                        {log.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-xs">No team attendance logs found.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. MY GOALS TAB */}
              {activeTab === 'goals' && (
                <div className="space-y-6">
                  
                  <div>
                    <h2 className="text-2xl font-bold font-display text-slate-855 dark:text-white">Goals & Performance Milestones</h2>
                    <p className="text-xs text-slate-500">View current deliverables, assign task timelines, and check overall goal completions.</p>
                  </div>

                  {/* Employee goals view */}
                  {session.employeeId && !['MANAGER', 'ADMIN', 'HR'].includes(session.role) && (
                    <div className="glass-card p-6 accent-border-lavender animate-fadeIn">
                      <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Target Goals & Milestones</h3>
                      {goals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {goals.map((goal) => (
                            <div key={goal.id} className="p-4 rounded bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{goal.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                                    goal.status === 'COMPLETED' ? 'badge-pastel-green' :
                                    goal.status === 'IN_PROGRESS' ? 'badge-pastel-indigo' : 'badge-pastel-amber'
                                  }`}>
                                    {goal.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-655 dark:text-slate-400 mb-4">{goal.description}</p>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                <span className="text-[10px] text-slate-450">Target Date: <span className="font-mono">{formatDate(goal.targetDate)}</span></span>
                                <button
                                  onClick={() => handleToggleGoalStatus(goal.id, goal.status)}
                                  className="px-2.5 py-1 text-[10px] btn-secondary font-semibold cursor-pointer"
                                >
                                  {goal.status === 'PENDING' ? 'Start Goal' :
                                   goal.status === 'IN_PROGRESS' ? 'Complete' : 'Reopen'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">No active goals assigned. Good job!</div>
                      )}
                    </div>
                  )}

                  {/* Manager/Admin/HR goals view */}
                  {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
                    <div>
                      {!selectedTeamMember ? (
                        <div className="glass-card p-8 text-center max-w-xl mx-auto space-y-4 accent-border-amber animate-fadeIn">
                          <Award className="text-amber-500 mx-auto animate-bounce" size={48} />
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Select a Team Member</h3>
                          <p className="text-xs text-slate-500">
                            Please select a team member from the Team Directory tab to view, update, and assign goals.
                          </p>
                          <button
                            onClick={() => setActiveTab('team')}
                            className="px-6 py-2 btn-primary font-semibold text-xs shadow cursor-pointer animate-pulse"
                          >
                            Go to Team Directory
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Goals list for this selected employee */}
                          <div className="lg:col-span-2 glass-card p-6 bg-white dark:bg-slate-855 dark:border-slate-700 accent-border-lavender animate-fadeIn">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2 dark:border-slate-800">
                              <h3 className="text-lg font-bold text-slate-855 dark:text-white">
                                Goals for {selectedTeamMember.firstName} {selectedTeamMember.lastName}
                              </h3>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedTeamMember.position}</span>
                            </div>
                            
                            {goals.length > 0 ? (
                              <div className="space-y-4">
                                {goals.map((goal) => (
                                  <div key={goal.id} className="p-4 rounded border border-slate-200 bg-slate-50/50 flex justify-between items-center dark:bg-slate-800 dark:border-slate-750">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{goal.title}</h4>
                                      <p className="text-[10px] text-slate-500 mt-1">{goal.description}</p>
                                      <span className="text-[9px] text-slate-400 block mt-2 font-mono">Target Date: {formatDate(goal.targetDate)}</span>
                                    </div>
                                    <div className="text-right flex flex-col gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                                        goal.status === 'COMPLETED' ? 'badge-pastel-green' :
                                        goal.status === 'IN_PROGRESS' ? 'badge-pastel-indigo' : 'badge-pastel-amber'
                                      }`}>
                                        {goal.status}
                                      </span>
                                      {goal.status !== 'COMPLETED' && (
                                        <button
                                          onClick={() => {
                                            api.updateGoalStatus(goal.id, 'COMPLETED').then(() => {
                                              showToast('Goal marked as completed');
                                              inspectEmployeeGoals(selectedTeamMember.id);
                                            });
                                          }}
                                          className="px-2 py-1 text-[9px] btn-success text-center cursor-pointer font-bold shadow-sm"
                                        >
                                          Complete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 text-center py-6">No goals assigned yet.</p>
                            )}
                          </div>

                          {/* Assign Goal form */}
                          <div className="glass-card p-6 bg-white dark:bg-slate-855 dark:border-slate-700 accent-border-lavender animate-fadeIn">
                            <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Assign Goal</h3>
                            <form onSubmit={handleCreateGoal} className="space-y-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Goal Title</label>
                                <input
                                  type="text" required placeholder="Goal Title (e.g. Optimize test suites)" value={newGoalTitle}
                                  onChange={(e) => setNewGoalTitle(e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-755 dark:text-slate-350"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                  placeholder="Describe deliverables..." rows={3} value={newGoalDescription}
                                  onChange={(e) => setNewGoalDescription(e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-755 dark:text-slate-350"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                                <input
                                  type="date" required value={newGoalTargetDate}
                                  onChange={(e) => setNewGoalTargetDate(e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-755 dark:text-slate-350"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full py-2 btn-primary font-semibold text-xs cursor-pointer shadow-sm animate-fadeIn"
                              >
                                Assign New Goal
                              </button>
                            </form>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* 5. TEAM DIRECTORY TAB */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold font-display text-slate-855 dark:text-white">Team Directory</h2>
                      <p className="text-xs text-slate-500">Register new employees, log formal reviews, and access details.</p>
                    </div>
                  </div>

                  {/* Stats Row above */}
                  <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                    <div className="glass-card p-4 text-center kpi-amber">
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 block mb-1 font-bold">Total Employees</span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-white">{employeesList.length}</span>
                    </div>
                    <div className="glass-card p-4 text-center kpi-green">
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 block mb-1 font-bold">Active Employees</span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-white">
                        {employeesList.filter(e => e.status === 'ACTIVE').length}
                      </span>
                    </div>
                    <div className="glass-card p-4 text-center kpi-amber">
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 block mb-1 font-bold">Departments</span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-white">
                        {new Set(employeesList.map(e => e.department)).size}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Register new employee form */}
                    <div className="glass-card p-6 bg-white dark:bg-slate-850 dark:border-slate-700 accent-border-peach animate-fadeIn">
                      <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">Register Employee Profile</h3>
                      <p className="text-xs text-slate-500 mb-4">Create a profile card. Links automatically using the unique user login username.</p>
                      
                      <form onSubmit={handleCreateProfile} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" required placeholder="First Name" value={newFirstName} 
                            onChange={(e) => setNewFirstName(e.target.value)}
                            className="px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                          />
                          <input 
                            type="text" required placeholder="Last Name" value={newLastName} 
                            onChange={(e) => setNewLastName(e.target.value)}
                            className="px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                          />
                        </div>
                        <input 
                          type="email" required placeholder="Work Email" value={newEmail} 
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                        />
                        <input 
                          type="tel" required placeholder="Phone Number" value={newPhone} 
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select 
                            value={newDept} onChange={(e) => setNewDept(e.target.value)}
                            className="px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          >
                            {setupDepts.map((d, i) => (
                              <option key={i} value={d}>{d}</option>
                            ))}
                          </select>
                          <input 
                            type="text" required placeholder="Position (e.g. Designer)" value={newPos} 
                            onChange={(e) => setNewPos(e.target.value)}
                            className="px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                          />
                        </div>
                        <input 
                          type="number" required placeholder="Monthly Salary ($)" value={newSalary} 
                          onChange={(e) => setNewSalary(e.target.value)}
                          className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                        />
                            <div className="pt-2">
                          <label className="block text-[10px] text-amber-600 font-bold mb-1 uppercase tracking-wider">Link Account Username</label>
                          <input 
                            type="text" required placeholder="Login username to bind" 
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600" 
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-2 btn-primary font-semibold text-xs cursor-pointer shadow-sm"
                        >
                          Bind and Create Profile
                        </button>
                      </form>
                    </div>

                    {/* Team directory grid */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-card p-6 accent-border-peach animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-slate-855 dark:text-white">Directory</h3>
                          {/* Inner search bar for mobile or convenience */}
                          <input 
                            type="text"
                            placeholder="Filter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 md:hidden"
                          />
                        </div>
                        {filteredEmployees.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredEmployees.map((emp) => (
                              <div 
                                key={emp.id} 
                                onClick={() => {
                                  setSelectedTeamMember(emp);
                                  inspectEmployeeAttrition(emp.id);
                                  inspectEmployeeGoals(emp.id);
                                }}
                                className={`p-4 rounded border transition-all cursor-pointer flex justify-between items-center ${
                                  selectedTeamMember?.id === emp.id 
                                    ? 'bg-amber-50/40 border-amber-200 shadow-sm dark:bg-amber-950/20 dark:border-indigo-900' 
                                    : 'bg-white border-slate-200 hover:border-slate-350 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                                }`}
                              >
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{emp.firstName} {emp.lastName}</h4>
                                  <span className="text-[10px] text-slate-550 block dark:text-slate-400">{emp.position}</span>
                                  <span className="text-[9px] font-mono text-slate-450 uppercase tracking-widest mt-1 block font-semibold">{emp.department}</span>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 badge-pastel-amber px-2 py-0.5 rounded justify-end font-semibold">
                                    <Sparkles size={10} className="text-amber-600" />
                                    <span className="text-[10px]">{emp.performanceRating.toFixed(1)}</span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 block mt-2 font-mono">${emp.salary.toLocaleString()}/mo</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-xs">No employee profiles found.</div>
                        )}
                      </div>

                      {/* Performance review submission */}
                      {selectedTeamMember && (
                        <div className="space-y-6">
                          {/* Current Goals list for this selected employee */}
                          <div className="glass-card p-6 border-t-2 border-amber-400 animate-fadeIn bg-white dark:bg-slate-850 dark:border-slate-700 accent-border-lavender">
                            <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">
                              Goals for {selectedTeamMember.firstName} {selectedTeamMember.lastName}
                            </h3>
                            {goals.length > 0 ? (
                              <div className="space-y-3 mb-6">
                                {goals.map((goal) => (
                                  <div key={goal.id} className="p-3 rounded border border-slate-200 bg-slate-50 flex justify-between items-center dark:bg-slate-800 dark:border-slate-750">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{goal.title}</h4>
                                      <p className="text-[10px] text-slate-500 mt-0.5">{goal.description}</p>
                                      <span className="text-[9px] text-slate-400 block mt-1 font-mono">Target: {formatDate(goal.targetDate)}</span>
                                    </div>
                                    <div className="text-right flex flex-col gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                                        goal.status === 'COMPLETED' ? 'badge-pastel-green' :
                                        goal.status === 'IN_PROGRESS' ? 'badge-pastel-indigo' : 'badge-pastel-amber'
                                      }`}>
                                        {goal.status}
                                      </span>
                                      {goal.status !== 'COMPLETED' && (
                                        <button
                                          onClick={() => {
                                            api.updateGoalStatus(goal.id, 'COMPLETED').then(() => {
                                              showToast('Goal marked as completed');
                                              inspectEmployeeGoals(selectedTeamMember.id);
                                            });
                                          }}
                                          className="px-1.5 py-0.5 text-[9px] btn-success text-center cursor-pointer"
                                        >
                                          Complete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 text-center py-4 mb-6">No goals assigned yet.</p>
                            )}

                            {/* Create new Goal form */}
                            <form onSubmit={handleCreateGoal} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Assign New Goal</h4>
                              
                              <div>
                                <input
                                  type="text" required placeholder="Goal Title (e.g. Optimize test suites)" value={newGoalTitle}
                                  onChange={(e) => setNewGoalTitle(e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600"
                                  />
                              </div>
                              <div>
                                <textarea
                                  placeholder="Description..." rows={2} value={newGoalDescription}
                                  onChange={(e) => setNewGoalDescription(e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600"
                                  />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Target Date</label>
                                <input
                                  type="date" required value={newGoalTargetDate}
                                  onChange={(e) => setNewGoalTargetDate(e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600"
                                  />
                              </div>
                              <button
                                type="submit"
                                className="w-full py-2 btn-primary text-xs font-semibold cursor-pointer"
                              >
                                Assign Goal
                              </button>
                            </form>
                          </div>

                          {/* Original Appraisal submission Form */}
                          <div className="glass-card p-6 border-t-2 border-amber-400 animate-fadeIn bg-white dark:bg-slate-850 dark:border-slate-700 accent-border-lavender">
                            <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4">
                              Evaluate {selectedTeamMember.firstName} {selectedTeamMember.lastName}
                            </h3>
                            <form onSubmit={(e) => {
                              reviewEmployeeId === '' ? setReviewEmployeeId(selectedTeamMember.id.toString()) : null;
                              handleSubmitReview(e);
                            }} className="space-y-4">
                              <input type="hidden" value={selectedTeamMember.id} />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">Checked ID</label>
                                  <input 
                                    type="text" disabled value={selectedTeamMember.id}
                                    className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs border border-slate-200 cursor-not-allowed" 
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">Appraisal Score (1.0 - 5.0)</label>
                                  <select 
                                    value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}
                                    className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-750 dark:text-slate-300"
                                  >
                                    <option value="5.0">5.0 - Outstanding</option>
                                    <option value="4.0">4.0 - Exceeds Expectations</option>
                                    <option value="3.0">3.0 - Meets Expectations</option>
                                    <option value="2.0">2.0 - Needs Improvement</option>
                                    <option value="1.0">1.0 - Unsatisfactory</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Appraisal Feedback</label>
                                <textarea 
                                  required rows={2} value={reviewFeedback}
                                  onChange={(e) => {
                                    setReviewEmployeeId(selectedTeamMember.id.toString());
                                    setReviewFeedback(e.target.value);
                                  }}
                                  placeholder="Describe performance details and accomplishments..."
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-750 dark:text-slate-300 placeholder-slate-400" 
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Quarterly Goals</label>
                                <textarea 
                                  required rows={2} value={reviewGoals}
                                  onChange={(e) => setReviewGoals(e.target.value)}
                                  placeholder="Core upskilling targets..."
                                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs focus:outline-none dark:bg-slate-700 dark:border-slate-600 text-slate-750 dark:text-slate-300 placeholder-slate-400" 
                                />
                              </div>

                              <button 
                                type="submit"
                                className="px-4 py-2 btn-primary font-semibold text-xs cursor-pointer shadow-sm"
                              >
                                Submit Appraisal Card
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. AI WORKFORCE ANALYTICS TAB */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  
                  <div>
                    <h2 className="text-2xl font-bold font-display text-slate-855 dark:text-white">Workforce Reports & AI Insights</h2>
                    <p className="text-xs text-slate-500">Platform-wide statistics, department metrics, and attrition flight-risk prediction warnings.</p>
                  </div>

                  {metrics ? (
                    <div className="space-y-6">
                      
                      {/* Metric Summary Widgets */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                        <div className="glass-card p-4 text-center accent-border-lavender">
                          <span className="text-xs text-slate-550 block mb-1">Active Team Size</span>
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.totalEmployees}</span>
                        </div>
                        <div className="glass-card p-4 text-center accent-border-mint">
                          <span className="text-xs text-slate-550 block mb-1">Average Monthly Pay</span>
                          <span className="text-2xl font-bold text-emerald-600">${Math.round(metrics.averageSalary).toLocaleString()}</span>
                        </div>
                        <div className="glass-card p-4 text-center accent-border-peach">
                          <span className="text-xs text-slate-550 block mb-1">Avg Performance KPI</span>
                          <div className="flex items-center justify-center gap-1 font-bold text-amber-600">
                            <Sparkles size={16} className="text-amber-500" />
                            <span className="text-2xl">{metrics.averagePerformance.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="glass-card p-4 text-center accent-border-rose">
                          <span className="text-xs text-slate-550 block mb-1">Active AI Risk Warnings</span>
                          <span className="text-2xl font-bold text-rose-600">
                            {employeesList.filter(e => e.performanceRating < 2.5).length} Alerts
                          </span>
                        </div>
                      </div>

                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Department Distribution Chart */}
                        <div className="glass-card p-6 min-h-[300px] flex flex-col justify-between accent-border-sky">
                          <h3 className="text-base font-bold text-slate-855 dark:text-white mb-4">Department Size Breakdown</h3>
                          <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={Object.entries(metrics.departmentDistribution).map(([dept, count]) => ({ name: dept, count }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fontWeight: 500 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Salary Distribution representation */}
                        <div className="glass-card p-6 min-h-[300px] flex flex-col justify-between accent-border-peach">
                          <h3 className="text-base font-bold text-slate-855 dark:text-white mb-4">Monthly Compensation Breakdown</h3>
                          <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={employeesList.map(e => ({ name: e.firstName + ' ' + e.lastName[0] + '.', salary: e.salary }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 500 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px' }} />
                                <Bar dataKey="salary" fill="#f97316" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                      </div>

                      {/* Attrition Risk Monitor Panel */}
                      <div className="glass-card p-6 border border-rose-100 bg-rose-50/10 dark:bg-rose-950/10 dark:border-rose-900 accent-border-rose">
                        <h3 className="text-lg font-bold text-slate-855 dark:text-white mb-4 flex items-center gap-2">
                          <BrainCircuit className="text-rose-500" size={18} />
                          <span>AI Predictive Attrition Board</span>
                        </h3>
                        
                        <div className="space-y-4">
                          {employeesList.map((emp) => {
                            const rep = attritionReports[emp.id];
                            return (
                              <div key={emp.id} className="p-4 rounded bg-white border border-slate-200 shadow-sm animate-fadeIn hover:border-red-300 dark:bg-slate-800 dark:border-slate-700 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                      rep?.riskScore > 70 ? 'bg-red-500' :
                                      rep?.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`} />
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-855 dark:text-white">
                                        {emp.firstName} {emp.lastName}
                                      </h4>
                                      <span className="text-[10px] text-slate-500">Role: {emp.position} | Dept: {emp.department}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 self-end sm:self-center">
                                    <div className="text-right">
                                      <span className="text-[9px] text-slate-400 block uppercase font-bold">AI Attrition Risk</span>
                                      <span className={`text-sm font-mono font-bold ${
                                        rep?.riskScore > 70 ? 'text-rose-600' :
                                        rep?.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'
                                      }`}>
                                        {rep ? `${rep.riskScore}%` : 'Calculating...'}
                                      </span>
                                    </div>
                                    
                                    {!rep && (
                                      <button 
                                        onClick={() => inspectEmployeeAttrition(emp.id)}
                                        className="px-3 py-1.5 btn-primary text-[10px] font-semibold shadow-sm cursor-pointer"
                                      >
                                        Run AI Analysis
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {rep && (
                                  <>
                                    <div className="mt-3 p-3 rounded bg-slate-50 text-xs text-slate-655 border border-slate-200/50 leading-relaxed animate-fadeIn dark:bg-slate-900/40 dark:border-slate-700 dark:text-slate-350">
                                      <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">AI Recommendation Commentary:</span>
                                      {rep.explanation}
                                    </div>
                                    <div className="mt-2 p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 dark:bg-slate-900/40 dark:border-slate-700 dark:text-slate-350 leading-relaxed flex items-start gap-2.5 animate-fadeIn">
                                      <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold text-slate-900 dark:text-slate-200 block mb-0.5">AI HR Transformation Insight:</span>
                                        HR teams spend too much time on manual processes and lack real-time workforce insights. NexusHR streamlines this employee's lifecycle, attendance, payroll, and performance tracking, delivering AI-powered insights — reducing administrative workload by 40-60% and improving decision-making.
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-450 text-sm">Failed to generate AI metrics.</div>
                  )}
                </div>
              )}

            </main>
          </>
        )}

      </div>
    </div>
  );
}
