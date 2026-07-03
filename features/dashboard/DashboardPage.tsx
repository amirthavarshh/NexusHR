import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, CheckCircle, Calendar, Sparkles, Upload, FileText,
  CheckCircle2, ChevronRight, Settings
} from 'lucide-react';
import { Card, Button, Input, Dialog as Modal, Badge } from '../../components/ui';

export const DashboardPage: React.FC = () => {
  const { 
    session, profile, setProfile, showToast,
    completedSteps, markStepCompleted,
    setupCompany, setSetupCompany, setupDocs, setSetupDocs, setupDepts, setSetupDepts,
    setupAttendanceConfig, setSetupAttendanceConfig, setupLeavePolicy, setSetupLeavePolicy
  } = useAuth();
  
  const queryClient = useQueryClient();

  // Queries for HR/Manager/Admin
  const isManagerOrAdmin = session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR';
  
  const { data: employeesList = [] } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: api.getAllEmployees,
    enabled: isManagerOrAdmin,
  });
  
  const { data: allLeaves = [] } = useQuery({
    queryKey: ['leaves', 'all'],
    queryFn: api.getAllLeaves,
    enabled: isManagerOrAdmin,
  });
  const leaveRequestsPending = allLeaves.filter((l: any) => l.status === 'PENDING');
  
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: api.getWorkforceMetrics,
    enabled: isManagerOrAdmin,
  });

  // Queries for Employee
  const isEmployee = !!session?.employeeId;
  const { data: attendanceHistory = [] } = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: async () => {
      const hist = await api.getMyAttendanceHistory();
      return hist.reverse();
    },
    enabled: isEmployee,
  });

  const { data: skillGap } = useQuery({
    queryKey: ['skillgap', session?.employeeId],
    queryFn: () => api.getSkillGapAnalysis(session!.employeeId!),
    enabled: isEmployee,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', session?.employeeId],
    queryFn: async () => {
      const revs = await api.getEmployeeReviews(session!.employeeId!);
      return revs.reverse();
    },
    enabled: isEmployee,
  });

  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  // Profile Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [pos, setPos] = useState('');
  const [salary, setSalary] = useState('');

  const updateProfileMut = useMutation({
    mutationFn: (payload: any) => api.updateProfile(session!.employeeId!, payload),
    onSuccess: (updated) => {
      setProfile(updated);
      setShowEditModal(false);
      showToast('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => showToast(err.message || 'Failed to update profile', 'error')
  });

  // Setup / Onboarding Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalText1, setModalText1] = useState('');
  const [modalText2, setModalText2] = useState('');
  const [modalNum, setModalNum] = useState(0);

  const registerAdminMut = useMutation({
    mutationFn: api.register,
    onSuccess: () => {
      markStepCompleted(4);
      setActiveModal(null);
      showToast('Successfully registered new workspace administrator!');
    },
    onError: (err: any) => showToast(err.message || 'Could not register administrator', 'error')
  });

  const startEditProfile = () => {
    if (!profile) return;
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setEmail(profile.email || '');
    setPhone(profile.phone || '');
    setDept(profile.department || '');
    setPos(profile.position || '');
    setSalary(profile.salary ? profile.salary.toString() : '');
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.employeeId) return;
    updateProfileMut.mutate({
      firstName,
      lastName,
      email,
      phone,
      department: dept,
      position: pos,
      salary: parseFloat(salary)
    });
  };

  // Onboarding action switches
  const handleOnboardingAction = (stepId: number) => {
    if (stepId === 1) {
      setModalText1(setupCompany.name);
      setModalText2(setupCompany.website);
      setActiveModal('company');
    } else if (stepId === 2) {
      setActiveModal('documents');
    } else if (stepId === 3) {
      setActiveModal('departments');
    } else if (stepId === 4) {
      setModalText1('');
      setModalText2('');
      setModalNum(0);
      setActiveModal('admins');
    } else if (stepId === 5) {
      showToast('Please visit the Team Directory tab to register an employee profile.');
    } else if (stepId === 6) {
      setModalText1(setupAttendanceConfig.workStart);
      setModalNum(setupAttendanceConfig.gracePeriodMinutes);
      setActiveModal('attendance');
    } else if (stepId === 7) {
      setModalNum(setupLeavePolicy.annualDays);
      setActiveModal('leave-policy');
    } else if (stepId === 8) {
      showToast('Please open the Payroll Admin tab and generate a new cycle.');
    }
  };

  const saveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupCompany({ name: modalText1, website: modalText2, industry: 'Tech' });
    markStepCompleted(1);
    setActiveModal(null);
    showToast('Company Profile setup completed!');
  };

  const uploadDummyDocument = () => {
    const filename = `manual_upload_${Date.now().toString().slice(-4)}.pdf`;
    setSetupDocs([...setupDocs, filename]);
    markStepCompleted(2);
    showToast('Document uploaded successfully!');
  };

  const addDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalText1) return;
    setSetupDepts([...setupDepts, modalText1]);
    setModalText1('');
    markStepCompleted(3);
    showToast('Department added to workforce mapping!');
  };

  const registerSecondaryAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    registerAdminMut.mutate({
      username: modalText1,
      email: modalText2,
      password: 'adminPassword123',
      role: 'ADMIN'
    });
  };

  const saveAttendanceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupAttendanceConfig({ workStart: modalText1, gracePeriodMinutes: modalNum });
    markStepCompleted(6);
    setActiveModal(null);
    showToast('Attendance rules updated successfully!');
  };

  const saveLeavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupLeavePolicy({ annualDays: modalNum, sickDays: 10 });
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

  if (!session) return null;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex justify-between items-center animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">
            Welcome, {profile ? `${profile.firstName} ${profile.lastName}` : session.username}
          </h2>
          <p className="text-sm text-foreground/60 mt-1 font-medium">
            Let's manage your workspace operations and check details.
          </p>
        </div>
      </div>

      {/* Privileged Role Dashboards */}
      {isManagerOrAdmin && (
        <>
          {/* KPI Summary Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <Card className="p-4 flex flex-col justify-between border-t-4 border-t-amber-500 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-foreground/50 uppercase">Total Employees</span>
                <Users size={16} className="text-amber-500" />
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-4">{employeesList.length || metrics?.totalEmployees || 0}</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-t-4 border-t-emerald-500 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-foreground/50 uppercase">Active Employees</span>
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-4">
                {employeesList.filter((e: any) => e.status === 'ACTIVE').length || 0}
              </span>
            </Card>

            <Card className={`p-4 flex flex-col justify-between border-t-4 shadow-sm ${leaveRequestsPending.length > 3 ? 'border-t-destructive' : 'border-t-amber-500'}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-foreground/50 uppercase">Pending Leave</span>
                <Calendar size={16} className={leaveRequestsPending.length > 3 ? 'text-destructive' : 'text-amber-500'} />
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-4">{leaveRequestsPending.length}</span>
            </Card>

            <Card className="p-4 flex flex-col justify-between border-t-4 border-t-amber-500 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-foreground/50 uppercase">Avg Performance</span>
                <Sparkles size={16} className="text-amber-500" />
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-4">
                {(metrics?.averagePerformance || (employeesList.length > 0 ? (employeesList.reduce((sum: number, e: any) => sum + e.performanceRating, 0) / employeesList.length) : 3.0)).toFixed(1)}
              </span>
            </Card>
          </div>

          {/* Onboarding Checklist Stepper */}
          <Card className="p-6 shadow-sm border-surface-border animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Get Started With Your Workspace</h3>
                <p className="text-xs text-foreground/60">Complete these essential steps to configure your HRMS portal.</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-foreground/70">{completedSteps.length}/8 Completed</span>
              </div>
            </div>

            <div className="w-full h-2 bg-surface-muted rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(completedSteps.length / 8) * 100}%` }}
              />
            </div>

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
                    className={`p-4 rounded-lg border text-left cursor-pointer flex flex-col justify-between min-h-[120px] transition-all hover:scale-[1.01] ${
                      isDone 
                        ? 'bg-surface-muted border-surface-border opacity-75' 
                        : 'bg-surface border-surface-border hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-foreground/50">STEP 0{step.id}</span>
                        {isDone && <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                      <h4 className="text-xs font-bold text-foreground">{step.title}</h4>
                      <p className="text-[10px] text-foreground/60 mt-1">{step.desc}</p>
                    </div>
                    {!isDone && (
                      <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-3">
                        <span>Setup</span>
                        <ChevronRight size={10} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Employee Dashboard Sections */}
      {isEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Summary Profile Details */}
          <Card className="p-6 flex flex-col justify-between border-t-4 border-t-primary shadow-sm animate-fadeIn">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Job Details</h3>
                {profile && (
                  <button 
                    onClick={startEditProfile}
                    className="p-1 rounded text-foreground/50 hover:text-amber-500 hover:bg-surface-muted transition-all cursor-pointer"
                    title="Edit Profile"
                  >
                    <Settings size={14} />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-surface-border pb-2">
                  <span className="text-xs text-foreground/50 uppercase">Position</span>
                  <span className="text-xs font-semibold text-foreground">{profile?.position || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-border pb-2">
                  <span className="text-xs text-foreground/50 uppercase">Department</span>
                  <span className="text-xs font-semibold text-foreground">{profile?.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-surface-border pb-2">
                  <span className="text-xs text-foreground/50 uppercase">Basic Salary</span>
                  <span className="text-xs font-mono font-semibold text-foreground">
                    {profile ? `$${profile.salary.toLocaleString()}/mo` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/50 uppercase">Performance Rating</span>
                  <Badge variant="warning" className="gap-1 px-2">
                    <Sparkles size={11} />
                    {profile?.performanceRating?.toFixed(1) || '3.0'}
                  </Badge>
                </div>
              </div>
            </div>

            {profile?.status && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                <span className="text-[10px] text-foreground/50 block mb-1 uppercase tracking-wider font-semibold">Employment State</span>
                <Badge variant={profile.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {profile.status}
                </Badge>
              </div>
            )}
          </Card>

          {/* Recent Attendance Logs Table */}
          <Card className="lg:col-span-2 p-6 border-t-4 border-t-emerald-500 shadow-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-foreground mb-4">Your Recent Shifts</h3>
            {attendanceHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-foreground/80">
                  <thead>
                    <tr className="border-b border-surface-border text-foreground/50 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Clock In</th>
                      <th className="pb-3 font-semibold">Clock Out</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {attendanceHistory.slice(0, 5).map((log: any) => (
                      <tr key={log.id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3 font-mono text-xs">{formatDate(log.date)}</td>
                        <td className="py-3 font-mono text-xs">{log.clockIn ? log.clockIn.slice(0, 5) : '--:--'}</td>
                        <td className="py-3 font-mono text-xs">{log.clockOut ? log.clockOut.slice(0, 5) : '--:--'}</td>
                        <td className="py-3">
                          <Badge variant={log.status === 'PRESENT' ? 'success' : log.status === 'LATE' ? 'warning' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-foreground/50 text-xs">No shift logs found. Complete check-ins in the Attendance tab!</div>
            )}
          </Card>

          {/* Competency Skill Development Card */}
          <Card className="p-6 flex flex-col justify-between border-t-4 border-t-sky-500 shadow-sm animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">My Skill Development</h3>
              {skillGap ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {skillGap.skills?.map((s: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-foreground/80">
                          <span>{s.skill}</span>
                          <span className="font-mono text-foreground/50">Current: {s.current.toFixed(1)} / Target: {s.target.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(s.current / s.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-surface-border">
                    <span className="text-[10px] text-sky-500 block mb-1.5 uppercase tracking-wider font-bold">AI Skill Growth Strategy</span>
                    <ul className="list-disc pl-4 text-[10px] text-foreground/60 space-y-1">
                      {skillGap.recommendations?.split('\n').map((rec: string, rIdx: number) => {
                        const cleanRec = rec.replace(/^(\d+\.\s*|-\s*|\*\s*)/, '').trim();
                        if (!cleanRec || cleanRec.toLowerCase().includes('recommended action plan')) return null;
                        return <li key={rIdx}>{cleanRec}</li>;
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-foreground/50 text-xs">Loading AI Skill Analysis...</div>
              )}
            </div>
          </Card>

          {/* Performance Review History */}
          <Card className="lg:col-span-2 p-6 border-t-4 border-t-primary shadow-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-foreground mb-4">Performance Review History</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="p-4 rounded-lg border border-surface-border bg-surface-muted space-y-2.5 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-foreground/50 block font-mono">Review Date: {formatDate(rev.reviewDate)}</span>
                        <span className="text-xs font-semibold text-foreground/80">Evaluated by: {rev.reviewer?.username || 'System'}</span>
                      </div>
                      <Badge variant="warning" className="gap-1">
                        <Sparkles size={11} />
                        {rev.rating?.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-foreground/80 leading-relaxed">
                      <span className="font-bold text-amber-500 block mb-0.5">Feedback & Commentary:</span>
                      {expandedReviews[rev.id] ? rev.feedback : (rev.feedback && rev.feedback.length > 150 ? rev.feedback.slice(0, 150) + '...' : rev.feedback)}
                      {rev.feedback && rev.feedback.length > 150 && (
                        <button 
                          type="button"
                          onClick={() => setExpandedReviews(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                          className="text-amber-500 font-bold ml-1.5 hover:underline cursor-pointer"
                        >
                          {expandedReviews[rev.id] ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </div>
                    {rev.goals && (
                      <div className="text-xs text-foreground/80 leading-relaxed pt-2 border-t border-surface-border">
                        <span className="font-bold text-foreground block mb-0.5">Development Goals:</span>
                        {expandedReviews[rev.id] ? rev.goals : (rev.goals.length > 150 ? rev.goals.slice(0, 150) + '...' : rev.goals)}
                        {rev.goals.length > 150 && (
                          <button 
                            type="button"
                            onClick={() => setExpandedReviews(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                            className="text-amber-500 font-bold ml-1.5 hover:underline cursor-pointer"
                          >
                            {expandedReviews[rev.id] ? 'Show Less' : 'Show More'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-foreground/50 text-xs">No reviews recorded yet.</div>
            )}
          </Card>
        </div>
      )}

      {/* Modal Profile Setup Form for self-edit */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile Card">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">First Name *</label>
              <Input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Last Name *</label>
              <Input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Email Address *</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Phone Number</label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Department *</label>
              <Input type="text" required value={dept} onChange={(e) => setDept(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Position / Title *</label>
              <Input type="text" required value={pos} onChange={(e) => setPos(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/50 mb-1">Basic Salary ($ / month) *</label>
            <Input type="number" required min="0" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>
          <Button 
            type="submit" 
            disabled={updateProfileMut.isPending}
            className="w-full flex items-center justify-center gap-1.5"
          >
            {updateProfileMut.isPending ? 'Saving...' : '✓ Save Changes'}
          </Button>
        </form>
      </Modal>

      {/* Setup / Onboarding Modal Dialogs */}
      <Modal isOpen={activeModal !== null} onClose={() => setActiveModal(null)} title={
        activeModal === 'company' ? 'Setup Company Profile' :
        activeModal === 'documents' ? 'Upload Workspace Documents' :
        activeModal === 'departments' ? 'Add Department Workspace' :
        activeModal === 'admins' ? 'Invite Team Administrator' :
        activeModal === 'attendance' ? 'Configure Attendance Hours' :
        activeModal === 'leave-policy' ? 'Establish Leave Policy' : 'Settings'
      }>
        {activeModal === 'company' && (
          <form onSubmit={saveCompanyProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Company Name</label>
              <Input type="text" required value={modalText1} onChange={(e) => setModalText1(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Website URL</label>
              <Input type="url" required value={modalText2} onChange={(e) => setModalText2(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Save Profile</Button>
          </form>
        )}

        {activeModal === 'documents' && (
          <div className="space-y-4">
            <p className="text-xs text-foreground/60">Provide compliance manuals or handbooks for employees.</p>
            <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Upload className="mx-auto text-foreground/50 mb-2" size={32} />
              <Button onClick={uploadDummyDocument} variant="outline" size="sm">Upload Document</Button>
              <span className="block text-[10px] text-foreground/50 mt-1">PDF, DOCX up to 10MB</span>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground/50 block">Uploaded Files:</span>
              {setupDocs.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface-muted p-2 rounded-lg text-xs border border-surface-border">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-amber-500" />
                    <span className="font-medium text-foreground">{doc}</span>
                  </div>
                  <span className="text-[10px] text-foreground/50">Processed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModal === 'departments' && (
          <form onSubmit={addDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">New Department Title</label>
              <Input type="text" required value={modalText1} onChange={(e) => setModalText1(e.target.value)} placeholder="e.g. Legal, Finance" />
            </div>
            <Button type="submit" className="w-full">Add Department</Button>
            <div className="flex flex-wrap gap-2 pt-2">
              {setupDepts.map((d, i) => (
                <Badge key={i} variant="outline">{d}</Badge>
              ))}
            </div>
          </form>
        )}

        {activeModal === 'admins' && (
          <form onSubmit={registerSecondaryAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Username *</label>
              <Input type="text" required value={modalText1} onChange={(e) => setModalText1(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Email Address *</label>
              <Input type="email" required value={modalText2} onChange={(e) => setModalText2(e.target.value)} />
            </div>
            <div className="p-3 bg-surface-muted text-[10px] text-foreground/60 rounded border border-surface-border">
              New administrators will default to the secure password <span className="font-bold text-foreground">adminPassword123</span>.
            </div>
            <Button type="submit" className="w-full" disabled={registerAdminMut.isPending}>
              {registerAdminMut.isPending ? 'Registering...' : 'Register Administrator'}
            </Button>
          </form>
        )}

        {activeModal === 'attendance' && (
          <form onSubmit={saveAttendanceConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Shift Start Time (HH:MM)</label>
              <Input type="text" required value={modalText1} onChange={(e) => setModalText1(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Grace Period Minutes</label>
              <Input type="number" required value={modalNum} onChange={(e) => setModalNum(parseInt(e.target.value))} />
            </div>
            <Button type="submit" className="w-full">Save Shift Parameters</Button>
          </form>
        )}

        {activeModal === 'leave-policy' && (
          <form onSubmit={saveLeavePolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Annual Paid Quota Days</label>
              <Input type="number" required value={modalNum} onChange={(e) => setModalNum(parseInt(e.target.value))} />
            </div>
            <Button type="submit" className="w-full">Set Quota Policies</Button>
          </form>
        )}
      </Modal>

    </div>
  );
};
