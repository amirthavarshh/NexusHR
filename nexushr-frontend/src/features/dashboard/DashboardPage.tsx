import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Settings } from 'lucide-react';
import { Card, Button, Input, Dialog as Modal, Badge } from '../../components/ui';

export const DashboardPage: React.FC = () => {
  const { session, profile, setProfile, showToast } = useAuth();
  const queryClient = useQueryClient();

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

    </div>
  );
};
