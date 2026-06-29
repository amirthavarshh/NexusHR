import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, X } from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/ui';

export const LeavesPage: React.FC = () => {
  const { session, showToast } = useAuth();
  const queryClient = useQueryClient();

  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('ANNUAL');

  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const { data: personalLeaves = [] } = useQuery({
    queryKey: ['leaves', 'personal'],
    queryFn: async () => {
      const data = await api.getMyLeaves();
      return data.reverse();
    },
    enabled: !!session?.employeeId,
  });

  const { data: teamLeaves = [] } = useQuery({
    queryKey: ['leaves', 'team'],
    queryFn: async () => {
      const data = await api.getAllLeaves();
      return data.reverse();
    },
    enabled: session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR',
  });

  const applyLeaveMut = useMutation({
    mutationFn: api.applyLeave,
    onSuccess: () => {
      showToast('Leave request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      setType('ANNUAL');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (err: any) => showToast(err.message || 'Could not submit leave request', 'error')
  });

  const approveLeaveMut = useMutation({
    mutationFn: api.approveLeave,
    onSuccess: () => {
      showToast('Leave request approved.');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (err: any) => showToast(err.message || 'Approval operation failed', 'error')
  });

  const rejectLeaveMut = useMutation({
    mutationFn: api.rejectLeave,
    onSuccess: () => {
      showToast('Leave request declined.');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (err: any) => showToast(err.message || 'Reject operation failed', 'error')
  });

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    if (new Date(endDate) < new Date(startDate)) {
      showToast('End date cannot be before start date', 'error');
      return;
    }
    if (type === 'UNPAID') {
      showToast('Notice: Unpaid leaves trigger payroll net salary deductions.', 'error');
    }
    applyLeaveMut.mutate({ startDate, endDate, reason, type });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const stats = useMemo(() => {
    const today = new Date();
    const curYear = today.getFullYear();
    const source = (session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR') 
      ? teamLeaves : personalLeaves;
    
    return {
      pending: source.filter(l => l.status === 'PENDING').length,
      planned: source.filter(l => l.status === 'APPROVED' && new Date(l.startDate) > today).length,
      taken: source.filter(l => l.status === 'APPROVED' && new Date(l.endDate) < today && new Date(l.endDate).getFullYear() === curYear).length
    };
  }, [teamLeaves, personalLeaves, session?.role]);

  if (!session) return null;

  const filteredTeamLeaves = teamLeaves.filter(l => leaveFilter === 'ALL' || l.status === leaveFilter);
  const pendingApprovals = teamLeaves.filter(l => l.status === 'PENDING');

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">Leave & Absence Tracker</h2>
        <p className="text-sm text-foreground/60">Submit requests for annual, sick, or unpaid leave and track approval progress.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 animate-fadeIn">
        <Card className="p-4 text-center border-t-4 border-t-amber-500 shadow-sm">
          <span className="text-[10px] text-foreground/50 uppercase block mb-1 font-bold">Pending Requests</span>
          <span className="text-xl font-extrabold text-foreground">{stats.pending}</span>
        </Card>
        <Card className="p-4 text-center border-t-4 border-t-emerald-500 shadow-sm">
          <span className="text-[10px] text-foreground/50 uppercase block mb-1 font-bold">Planned Absences</span>
          <span className="text-xl font-extrabold text-foreground">{stats.planned}</span>
        </Card>
        <Card className="p-4 text-center border-t-4 border-t-amber-500 shadow-sm">
          <span className="text-[10px] text-foreground/50 uppercase block mb-1 font-bold">Leaves Taken (YTD)</span>
          <span className="text-xl font-extrabold text-foreground">{stats.taken}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Submit Leave Application Form */}
        <Card className="p-6 h-fit border-t-4 border-t-orange-400 shadow-md">
          <h3 className="text-lg font-bold text-foreground mb-4">Request Absence</h3>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Start Date</label>
              <Input 
                type="date" required value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">End Date</label>
              <Input 
                type="date" required value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Absence Type</label>
              <select 
                value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none bg-surface-muted text-foreground"
              >
                <option value="ANNUAL">Annual Leave (Paid)</option>
                <option value="SICK">Sick Leave (Paid)</option>
                <option value="UNPAID">Unpaid Leave (Payroll Deducted)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Reason / Note</label>
              <textarea 
                required rows={3} value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief description..."
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none bg-surface-muted text-foreground" 
              />
            </div>

            <Button 
              type="submit"
              disabled={applyLeaveMut.isPending}
              className="w-full"
            >
              {applyLeaveMut.isPending ? 'Submitting...' : 'Send Request'}
            </Button>
          </form>
        </Card>

        {/* Requests display column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Manager view: Team Leave Administration */}
          {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
            <div className="space-y-6">
              
              {/* Filter Tabs Bar */}
              <div className="flex gap-2 border-b border-surface-border pb-2">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLeaveFilter(f as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      leaveFilter === f 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-foreground/50 hover:bg-surface-muted hover:text-foreground'
                    }`}
                  >
                    {f === 'ALL' ? 'All Team Requests' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Pending Team Approvals list */}
              {pendingApprovals.length > 0 && (leaveFilter === 'ALL' || leaveFilter === 'PENDING') && (
                <Card className="p-6 border-surface-border shadow-sm animate-fadeIn">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Calendar className="text-orange-500 animate-pulse" size={16} />
                    <span>Pending Team Approvals</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {pendingApprovals.map((req) => (
                      <div key={req.id} className="p-4 rounded-lg bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {req.employee?.firstName} {req.employee?.lastName}
                            </span>
                            <Badge variant="outline">{req.type}</Badge>
                          </div>
                          <span className="text-xs text-foreground/50 block mt-1">
                            Dates: <span className="font-mono text-foreground/80">{formatDate(req.startDate)}</span> to <span className="font-mono text-foreground/80">{formatDate(req.endDate)}</span>
                          </span>
                          <p className="text-xs text-foreground/60 mt-2 bg-surface-muted p-2 rounded border border-surface-border">
                            <strong>Notes:</strong> {req.reason}
                          </p>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                          <Button 
                            onClick={() => rejectLeaveMut.mutate(req.id)}
                            variant="destructive"
                            size="sm"
                            title="Decline"
                            disabled={rejectLeaveMut.isPending}
                            className="px-2"
                          >
                            <X size={14} />
                          </Button>
                          <Button 
                            onClick={() => approveLeaveMut.mutate(req.id)}
                            variant="default"
                            size="sm"
                            title="Approve"
                            disabled={approveLeaveMut.isPending}
                            className="px-2"
                          >
                            <Check size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Team Leaves Ledger Table */}
              <Card className="p-6 border-surface-border shadow-sm animate-fadeIn">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Team Leaves Ledger</h3>
                {filteredTeamLeaves.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-foreground/80">
                      <thead>
                        <tr className="border-b border-surface-border text-foreground/50 text-xs uppercase font-bold tracking-wider">
                          <th className="pb-3">Employee</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Duration</th>
                          <th className="pb-3">Reason</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {filteredTeamLeaves.map((req) => (
                          <tr key={req.id} className="hover:bg-surface-muted/50 transition-colors">
                            <td className="py-3 font-bold text-foreground">
                              {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'N/A'}
                            </td>
                            <td className="py-3">
                              <Badge variant="outline">{req.type}</Badge>
                            </td>
                            <td className="py-3 text-xs font-mono text-foreground/80">
                              {formatDate(req.startDate)} - {formatDate(req.endDate)}
                            </td>
                            <td className="py-3 text-xs max-w-[150px] truncate" title={req.reason}>{req.reason}</td>
                            <td className="py-3">
                              <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'destructive'}>
                                {req.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-foreground/50 text-sm">No team leaves found.</div>
                )}
              </Card>
            </div>
          )}

          {/* My Leave requests table */}
          {session.employeeId && (
            <Card className="p-6 border-surface-border shadow-sm animate-fadeIn">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Absence History (Personal)</h3>
              {personalLeaves.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-foreground/80">
                    <thead>
                      <tr className="border-b border-surface-border text-foreground/50 text-xs uppercase font-bold tracking-wider">
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {personalLeaves.map((req) => (
                        <tr key={req.id} className="hover:bg-surface-muted/50 transition-colors">
                          <td className="py-3">
                            <Badge variant="outline">{req.type}</Badge>
                          </td>
                          <td className="py-3 text-xs font-mono text-foreground/80">
                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                          </td>
                          <td className="py-3 text-xs max-w-[150px] truncate" title={req.reason}>{req.reason}</td>
                          <td className="py-3">
                            <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'destructive'}>
                              {req.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-foreground/50 text-sm">No leave history found.</div>
              )}
            </Card>
          )}

        </div>
      </div>

    </div>
  );
};
