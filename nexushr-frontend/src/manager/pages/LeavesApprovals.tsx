import React, { useState } from 'react';
import { 
  useTeamLeaves, useApproveLeave, useRejectLeave, useDirectReports 
} from '../hooks/useManagerQuery';
import type { TeamLeaveRequest } from '../types';
import { 
  Card, CardContent,
  Button, Badge, Dialog, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../admin/components/ui';
import { 
  Clock, CheckCircle2, XCircle, Check, X, ArrowRight, Activity
} from 'lucide-react';

export const LeavesApprovals: React.FC = () => {
  const { data: leaves = [], isLoading } = useTeamLeaves();
  const { data: _reports = [] } = useDirectReports();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<TeamLeaveRequest | null>(null);
  const [isApproveConfirm, setIsApproveConfirm] = useState(true);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleActionOpen = (req: TeamLeaveRequest, approve: boolean) => {
    setSelectedRequest(req);
    setIsApproveConfirm(approve);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    try {
      if (isApproveConfirm) {
        await approveMutation.mutateAsync(selectedRequest.id);
        showStatus('Leave request approved!');
      } else {
        await rejectMutation.mutateAsync(selectedRequest.id);
        showStatus('Leave request rejected.');
      }
      setSelectedRequest(null);
    } catch (err: any) {
      showStatus(err.message || 'Action failed', 'error');
    }
  };

  // Leave aggregates
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');
  const rejectedLeaves = leaves.filter(l => l.status === 'REJECTED');

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const e = new Date(end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} to ${e}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Team Leave Requests</h2>
        <p className="text-xs text-slate-500">Sign off direct report leave applications and review approval timelines.</p>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className={`p-3 rounded text-xs font-bold animate-fadeIn ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-205 dark:bg-emerald-950/20 dark:text-emerald-400' 
            : 'bg-rose-50 text-rose-700 border border-rose-205 dark:bg-rose-955/20 dark:text-rose-400'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Awaiting Review</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{pendingCount} Requests</span>
          </div>
          <Clock size={20} className="text-amber-600 animate-pulse" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Approved Leaves</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{approvedCount} Approved</span>
          </div>
          <CheckCircle2 size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Rejected Requests</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{rejectedCount} Rejected</span>
          </div>
          <XCircle size={20} className="text-rose-505" />
        </Card>
      </div>

      {/* List content */}
      <Card className="accent-border-mint">
        <CardContent className="pt-6">
          <Tabs defaultValue="pending" activeTabState={[activeTab, setActiveTab]}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading leave records...</div>
            ) : (
              <>
                <TabsContent value="pending">
                  {pendingLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Workflow Timeline</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingLeaves.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-bold text-slate-805 dark:text-white">{req.requesterName}</TableCell>
                            <TableCell className="font-semibold text-slate-655 dark:text-slate-400">{req.type}</TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-450">{formatDateRange(req.startDate, req.endDate)}</TableCell>
                            <TableCell className="text-slate-655 dark:text-slate-400 font-semibold">{req.reason}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold font-mono">
                                <span className="text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded">Applied</span>
                                <ArrowRight size={10} />
                                <span className="text-amber-500 animate-pulse bg-amber-50 dark:bg-amber-955/20 px-1 py-0.5 rounded font-extrabold">Manager Review</span>
                                <ArrowRight size={10} />
                                <span className="text-slate-400 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded font-normal">HR Review</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="success" className="px-2.5 py-1" onClick={() => handleActionOpen(req, true)}>
                                  <Check size={12} />
                                  <span>Approve</span>
                                </Button>
                                <Button size="sm" variant="destructive" className="px-2.5 py-1" onClick={() => handleActionOpen(req, false)}>
                                  <X size={12} />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">No pending requests awaiting your sign-off.</div>
                  )}
                </TabsContent>

                <TabsContent value="approved">
                  {approvedLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Approved By</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedLeaves.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-bold text-slate-805 dark:text-white">{req.requesterName}</TableCell>
                            <TableCell className="font-semibold text-slate-655 dark:text-slate-400">{req.type}</TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-450">{formatDateRange(req.startDate, req.endDate)}</TableCell>
                            <TableCell className="font-bold text-slate-700 dark:text-slate-350">{req.approvedBy || 'System'}</TableCell>
                            <TableCell>
                              <Badge variant="success">Approved</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">No approved requests found.</div>
                  )}
                </TabsContent>

                <TabsContent value="rejected">
                  {rejectedLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Rejected By</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rejectedLeaves.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-bold text-slate-855 dark:text-white">{req.requesterName}</TableCell>
                            <TableCell className="font-semibold text-slate-655 dark:text-slate-400">{req.type}</TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-450">{formatDateRange(req.startDate, req.endDate)}</TableCell>
                            <TableCell className="font-bold text-slate-700 dark:text-slate-350">{req.approvedBy || 'System'}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">Rejected</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">No rejected requests found.</div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={isApproveConfirm ? "Approve Team Leave Application?" : "Reject Team Leave Application?"}
        description="Verify date parameters and project calendars before signing."
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
            <Button 
              variant={isApproveConfirm ? 'success' : 'destructive'} 
              onClick={handleConfirmAction}
            >
              {isApproveConfirm ? "Sign and Approve" : "Reject Request"}
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded text-xs dark:bg-slate-800 dark:border-slate-700">
              <span className="text-slate-400 font-bold block mb-1">Requester:</span>
              <span className="font-bold text-slate-805 dark:text-white block">{selectedRequest.requesterName}</span>
              <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">{formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-455 font-bold block">Submission Reason:</span>
              <p className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-105 text-slate-655 dark:text-slate-350 italic">
                "{selectedRequest.reason}"
              </p>
            </div>

            {isApproveConfirm && (
              <div className="p-2.5 rounded border border-indigo-100 bg-indigo-50 text-[10px] text-indigo-705 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30 flex gap-2">
                <Activity size={14} className="shrink-0 mt-0.5" />
                <p>This approval will route the request to HR for final policy checks. Unpaid leaves trigger automatic payroll deductions.</p>
              </div>
            )}
          </div>
        )}
      </Dialog>

    </div>
  );
};
