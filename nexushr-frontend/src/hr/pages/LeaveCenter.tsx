import React, { useState } from 'react';
import { useAllLeaves, useApproveLeave, useRejectLeave, useAllEmployees } from '../hooks/useHrQuery';
import type { LeaveRequest } from '../types';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Dialog, Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../admin/components/ui';
import { Clock, CheckCircle2, XCircle, Check, X, CalendarDays } from 'lucide-react';

const leaveVariant = (s: string) =>
  s === 'APPROVED' ? 'success' : s === 'REJECTED' ? 'destructive' : 'warning';

const leaveTypeColor = (t: string) =>
  t === 'ANNUAL' ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400'
  : t === 'SICK' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';

export const LeaveCenter: React.FC = () => {
  const { data: leaves = [], isLoading } = useAllLeaves();
  const { data: employees = [] } = useAllEmployees();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const [activeTab, setActiveTab] = useState('pending');
  const [actionLeave, setActionLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const pending = leaves.filter(l => l.status === 'PENDING');
  const approved = leaves.filter(l => l.status === 'APPROVED');
  const rejected = leaves.filter(l => l.status === 'REJECTED');

  const handleAction = async () => {
    if (!actionLeave) return;
    try {
      if (actionType === 'approve') {
        await approveMutation.mutateAsync(actionLeave.id);
        showToast(`Leave approved for ${actionLeave.employee?.firstName} ${actionLeave.employee?.lastName}.`);
      } else {
        await rejectMutation.mutateAsync(actionLeave.id);
        showToast(`Leave rejected.`, 'error');
      }
      setActionLeave(null);
    } catch (e: any) { showToast(e.message || 'Action failed', 'error'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

  const calcDays = (start: string, end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
    return diff;
  };

  // Build 14-day calendar overlap grid
  const today = new Date();
  const calDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });
  const activeLeaves = leaves.filter(l => l.status === 'APPROVED' || l.status === 'PENDING');

  const LeaveTable: React.FC<{ rows: LeaveRequest[] }> = ({ rows }) => (
    rows.length === 0 ? (
      <div className="text-center py-12 text-slate-400 text-xs">No records in this category.</div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            {activeTab === 'pending' && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(l => (
            <TableRow key={l.id}>
              <TableCell>
                <div>
                  <span className="font-bold text-slate-800 dark:text-white text-xs block">{l.employee?.firstName} {l.employee?.lastName}</span>
                  <span className="text-[10px] text-slate-400">{l.employee?.department}</span>
                </div>
              </TableCell>
              <TableCell><span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${leaveTypeColor(l.type)}`}>{l.type}</span></TableCell>
              <TableCell className="text-xs text-slate-500 font-mono">{formatDate(l.startDate)} → {formatDate(l.endDate)}</TableCell>
              <TableCell className="font-bold text-slate-700 dark:text-slate-350 text-xs">{calcDays(l.startDate, l.endDate)}d</TableCell>
              <TableCell className="text-xs text-slate-500 max-w-32 truncate">{l.reason}</TableCell>
              <TableCell><Badge variant={leaveVariant(l.status)}>{l.status}</Badge></TableCell>
              {activeTab === 'pending' && (
                <TableCell className="text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" onClick={() => { setActionLeave(l); setActionType('approve'); }}>
                      <Check size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20" onClick={() => { setActionLeave(l); setActionType('reject'); }}>
                      <X size={12} />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Leave Management Center</h2>
        <p className="text-xs text-slate-500">Review, approve, and reject all employee leave applications.</p>
      </div>

      {toast && (
        <div className={`p-3 rounded-lg text-xs font-bold border animate-fadeIn ${toast.type === 'success' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400'}`}>
          {toast.text}
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Awaiting Review</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1 block">{pending.length}</span>
          </div>
          <Clock size={20} className="text-amber-600 animate-pulse" />
        </Card>
        <Card className="bg-teal-50 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Approved</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1 block">{approved.length}</span>
          </div>
          <CheckCircle2 size={20} className="text-teal-600" />
        </Card>
        <Card className="bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rejected</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1 block">{rejected.length}</span>
          </div>
          <XCircle size={20} className="text-rose-500" />
        </Card>
      </div>

      {/* Team Overlap Calendar */}
      <Card className="border border-slate-100 dark:border-slate-800">
        <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2"><CalendarDays size={14} className="text-teal-500" /><span>Team Leave Overlap Planner</span></CardTitle>
          <CardDescription>14-day rolling calendar showing approved and pending leaves. Helps prevent team understaffing.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day header */}
            <div className="flex gap-0.5 mb-2">
              <div className="w-36 shrink-0" />
              {calDays.map((d, i) => (
                <div key={i} className="flex-1 text-center text-[9px] font-bold text-slate-400 font-mono">
                  {d.toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}
                </div>
              ))}
            </div>
            {/* Employee rows */}
            {employees.slice(0, 8).map(emp => {
              const empName = `${emp.firstName} ${emp.lastName}`;
              return (
                <div key={emp.id} className="flex gap-0.5 mb-1 items-center">
                  <div className="w-36 shrink-0 text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate pr-2">{empName}</div>
                  {calDays.map((d, i) => {
                    const leave = activeLeaves.find(l => {
                      if (l.employee?.id !== emp.id) return false;
                      const start = new Date(l.startDate); start.setHours(0);
                      const end = new Date(l.endDate); end.setHours(23);
                      return d >= start && d <= end;
                    });
                    return (
                      <div key={i} title={leave ? `${leave.type} (${leave.status})` : ''} className={`flex-1 h-5 rounded text-[8px] font-bold flex items-center justify-center ${leave ? (leave.status === 'APPROVED' ? 'bg-teal-400 dark:bg-teal-600 text-white' : 'bg-amber-300 dark:bg-amber-600 text-white') : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {leave ? (leave.status === 'APPROVED' ? '✓' : '?') : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Legend */}
            <div className="flex gap-4 mt-3 text-[10px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-400" />Approved Leave</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-300" />Pending Leave</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />Working</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Request Tabs */}
      <Card className="border border-slate-100 dark:border-slate-800">
        <CardContent className="pt-6">
          <Tabs defaultValue="pending" activeTabState={[activeTab, setActiveTab]}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading leave records...</div>
            ) : (
              <>
                <TabsContent value="pending"><LeaveTable rows={pending} /></TabsContent>
                <TabsContent value="approved"><LeaveTable rows={approved} /></TabsContent>
                <TabsContent value="rejected"><LeaveTable rows={rejected} /></TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirm Action Modal */}
      <Dialog
        isOpen={!!actionLeave}
        onClose={() => setActionLeave(null)}
        title={actionType === 'approve' ? 'Confirm Leave Approval' : 'Confirm Leave Rejection'}
        description={actionType === 'approve'
          ? `Approve leave for ${actionLeave?.employee?.firstName} ${actionLeave?.employee?.lastName} from ${actionLeave ? formatDate(actionLeave.startDate) : ''} to ${actionLeave ? formatDate(actionLeave.endDate) : ''}?`
          : `Reject leave request from ${actionLeave?.employee?.firstName} ${actionLeave?.employee?.lastName}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setActionLeave(null)}>Cancel</Button>
            <Button
              onClick={handleAction}
              loading={approveMutation.isPending || rejectMutation.isPending}
              className={actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
            >
              {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
            </Button>
          </>
        }
      >
        {actionLeave && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Employee</span><span className="font-bold">{actionLeave.employee?.firstName} {actionLeave.employee?.lastName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Type</span><span className={`font-extrabold px-1.5 py-0.5 rounded ${leaveTypeColor(actionLeave.type)}`}>{actionLeave.type}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-bold">{calcDays(actionLeave.startDate, actionLeave.endDate)} days</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Reason</span><span className="font-semibold text-right max-w-48">{actionLeave.reason}</span></div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
