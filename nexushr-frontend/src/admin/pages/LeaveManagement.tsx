import React, { useState } from 'react';
import { 
  useLeaveRequests, useApproveLeave, useRejectLeave 
} from '../hooks/useAdminQuery';
import type { LeaveRequest } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Dialog, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import { 
  CheckCircle2, XCircle, Clock, Check, X, ArrowRight, Activity
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { data: leaves = [], isLoading } = useLeaveRequests();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('pending');

  // Modal target request state
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isApproveConfirm, setIsApproveConfirm] = useState(true); // true = approve, false = reject

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleActionOpen = (req: LeaveRequest, approve: boolean) => {
    setSelectedRequest(req);
    setIsApproveConfirm(approve);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    try {
      if (isApproveConfirm) {
        await approveMutation.mutateAsync(selectedRequest.id);
        showStatus('HR Leave request successfully approved!');
      } else {
        await rejectMutation.mutateAsync(selectedRequest.id);
        showStatus('HR Leave request successfully rejected.');
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

  const getWorkflowTimeline = (req: LeaveRequest) => {
    // Show visual timeline of approvals
    // Employee Leave: Employee -> Manager -> HR -> Approved
    // Manager Leave: Manager -> HR -> Approved
    // HR Leave: HR -> Admin -> Approved
    if (req.requesterRole === 'HR') {
      return (
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold font-mono">
          <span className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-955/20 px-1 py-0.5 rounded">HR Applied</span>
          <ArrowRight size={10} />
          <span className={`px-1 py-0.5 rounded ${req.status === 'PENDING' ? 'text-amber-500 font-extrabold animate-pulse bg-amber-50 dark:bg-amber-955/20' : 'text-slate-400 font-normal bg-slate-50 dark:bg-slate-800'}`}>Admin Review</span>
          <ArrowRight size={10} />
          <span className={`px-1 py-0.5 rounded ${req.status === 'APPROVED' ? 'text-emerald-500 font-extrabold bg-emerald-50 dark:bg-emerald-950/20' : 'text-slate-400 font-normal bg-slate-50 dark:bg-slate-800'}`}>Approved</span>
        </div>
      );
    }

    if (req.requesterRole === 'MANAGER') {
      return (
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold font-mono">
          <span className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/20 px-1 py-0.5 rounded">Manager Applied</span>
          <ArrowRight size={10} />
          <span className="text-slate-400 bg-slate-50 dark:bg-slate-850 px-1 py-0.5 rounded">HR Approved</span>
          <ArrowRight size={10} />
          <span className="text-emerald-500 font-extrabold bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded">Approved</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold font-mono">
        <span className="text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded">Employee Applied</span>
        <ArrowRight size={10} />
        <span className="text-slate-400 bg-slate-50 dark:bg-slate-850 px-1 py-0.5 rounded">Manager Approved</span>
        <ArrowRight size={10} />
        <span className="text-slate-400 bg-slate-50 dark:bg-slate-850 px-1 py-0.5 rounded">HR Approved</span>
        <ArrowRight size={10} />
        <span className="text-emerald-500 font-extrabold bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.5 rounded">Approved</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Leave Approvals & Workflow</h2>
        <p className="text-xs text-slate-500">Review multi-tier workflows, evaluate HR requests, and disburse approvals.</p>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className={`p-3 rounded text-xs font-bold animate-fadeIn ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/30'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Awaiting Action</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLoading ? '...' : pendingCount} Requests</span>
          </div>
          <Clock size={20} className="text-amber-600 animate-pulse" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Approved Requests</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLoading ? '...' : approvedCount} Approved</span>
          </div>
          <CheckCircle2 size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Rejected Requests</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLoading ? '...' : rejectedCount} Rejected</span>
          </div>
          <XCircle size={20} className="text-rose-500" />
        </Card>
      </div>

      {/* Leave Workflow Matrix explanation */}
      <Card className="accent-border-lavender">
        <CardHeader>
          <CardTitle>System Workflow Mappings</CardTitle>
          <CardDescription>Visual mapping of operational review sequences by roles.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold font-mono">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block mb-1">Employee Leaves</span>
            <span className="text-slate-655 dark:text-slate-350">Employee → Mgr → HR</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block mb-1">Manager Leaves</span>
            <span className="text-slate-655 dark:text-slate-350">Manager → HR</span>
          </div>
          <div className="p-3 bg-amber-50/50 dark:bg-amber-955/10 border border-amber-100 dark:border-amber-900/30 rounded">
            <span className="text-amber-705 dark:text-amber-400 text-[10px] block mb-1">HR Leaves (Admin Gated)</span>
            <span className="text-amber-805 dark:text-amber-400">HR → Admin Approval</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800 rounded">
            <span className="text-slate-400 text-[10px] block mb-1">Admin Leaves</span>
            <span className="text-slate-655 dark:text-slate-350">Auto-approved</span>
          </div>
        </CardContent>
      </Card>

      {/* Main List tabs structure */}
      <Card className="accent-border-mint">
        <CardContent className="pt-6">
          <Tabs defaultValue="pending" activeTabState={[activeTab, setActiveTab]}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading leave ledger...</div>
            ) : (
              <>
                <TabsContent value="pending">
                  {pendingLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requester</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Approval Workflow</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingLeaves.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-bold text-slate-855 dark:text-white">{req.requesterName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{req.requesterRole}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-slate-655 dark:text-slate-400">{req.type}</TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-450">{formatDateRange(req.startDate, req.endDate)}</TableCell>
                            <TableCell className="text-slate-655 dark:text-slate-400 font-medium">{req.reason}</TableCell>
                            <TableCell>{getWorkflowTimeline(req)}</TableCell>
                            <TableCell className="text-right">
                              {req.requesterRole === 'HR' && req.workflowStage === 'ADMIN_APPROVAL' ? (
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
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold block pr-2">Awaiting pre-approval</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">No pending requests awaiting Admin signature.</div>
                  )}
                </TabsContent>

                <TabsContent value="approved">
                  {approvedLeaves.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requester</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Approved By</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedLeaves.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-bold text-slate-855 dark:text-white">{req.requesterName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{req.requesterRole}</Badge>
                            </TableCell>
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
                          <TableHead>Requester</TableHead>
                          <TableHead>Role</TableHead>
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
                            <TableCell>
                              <Badge variant="secondary">{req.requesterRole}</Badge>
                            </TableCell>
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

      {/* Approval/Rejection Confirm Dialog */}
      <Dialog
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={isApproveConfirm ? "Approve HR Leave Request?" : "Reject HR Leave Request?"}
        description="Verify calculations and cost impact before signing."
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
            <Button 
              variant={isApproveConfirm ? 'success' : 'destructive'} 
              onClick={handleConfirmAction}
              loading={approveMutation.isPending || rejectMutation.isPending}
            >
              {isApproveConfirm ? "Sign and Approve" : "Reject Request"}
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded text-xs dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold block mb-1">Requester:</span>
                <Badge variant="warning">{selectedRequest.requesterRole}</Badge>
              </div>
              <span className="font-bold text-slate-805 dark:text-white block">{selectedRequest.requesterName}</span>
              <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">{formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-455 font-bold block">Submission Statement:</span>
              <p className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-105 text-slate-655 dark:text-slate-350 italic">
                "{selectedRequest.reason}"
              </p>
            </div>

            <div className="p-2.5 rounded border border-rose-100 bg-rose-50 text-[10px] text-rose-705 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/30 flex gap-2">
              <Activity size={14} className="shrink-0 mt-0.5" />
              <p>Approving this leaves request will bind the user status as ON_LEAVE. Deductions apply automatically if the category type is Unpaid.</p>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
};
