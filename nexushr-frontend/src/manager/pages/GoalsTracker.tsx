import React, { useState, useEffect } from 'react';
import { 
  useDirectReports, useEmployeeGoals, useCreateGoal, useUpdateGoal 
} from '../hooks/useManagerQuery';
import type { TeamGoal } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Select, Dialog, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
import { 
  Plus, ClipboardList
} from 'lucide-react';

export const GoalsTracker: React.FC = () => {
  const { data: reports = [] } = useDirectReports();
  const [selectedReportId, setSelectedReportId] = useState<number | ''>('');

  // Fetch goals for selected report
  const { data: goals = [], isLoading: isGoalsLoading } = useEmployeeGoals(selectedReportId as number);
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();

  // Selected report details helper
  const activeReport = reports.find((r: any) => r.id === selectedReportId);

  // Auto-select first direct report
  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  // Dialog Form states
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Status notification helper
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (text: string) => {
    setStatusMessage(text);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setTargetDate('');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !title || !targetDate) return;

    try {
      await createGoalMutation.mutateAsync({
        employeeId: selectedReportId as number,
        title,
        description,
        targetDate
      });
      showStatus('Performance goal assigned successfully!');
      setFormOpen(false);
    } catch {
      showStatus('Could not save performance goal.');
    }
  };

  const handleStatusChange = async (goal: TeamGoal, newStatus: any) => {
    try {
      await updateGoalMutation.mutateAsync({
        id: goal.id,
        employeeId: goal.employeeId,
        status: newStatus
      });
      showStatus('Goal status updated.');
    } catch {
      showStatus('Could not update status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Team Goals Tracking</h2>
          <p className="text-xs text-foreground/60">Establish operational milestones, assign performance targets, and track milestones progress.</p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          disabled={!selectedReportId}
          className="self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Assign Goal Target</span>
        </Button>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="p-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-705 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Employee Selector Bar */}
      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-foreground/50 font-semibold shrink-0">
                <ClipboardList size={14} />
                <span>Select Employee:</span>
              </div>
              <Select 
                value={selectedReportId} 
                onChange={(e) => setSelectedReportId(Number(e.target.value))}
                className="w-full md:w-60"
              >
                {reports.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.position})</option>
                ))}
              </Select>
            </div>
            
            {activeReport && (
              <span className="text-xs text-foreground/40 font-bold shrink-0 font-mono">
                Department: {activeReport.department} unit
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goals List table */}
      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardHeader>
          <CardTitle>Milestones Ledger</CardTitle>
          <CardDescription>Assigned performance targets for the selected employee.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGoalsLoading ? (
            <div className="text-center py-12 text-foreground/40 text-xs">Loading employee targets...</div>
          ) : goals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal Title</TableHead>
                  <TableHead>Target Description</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((g: any) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-bold text-foreground">{g.title}</TableCell>
                    <TableCell className="text-foreground/60 font-semibold">{g.description || 'No description set'}</TableCell>
                    <TableCell className="font-mono text-foreground/70">{new Date(g.targetDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          g.status === 'COMPLETED' ? 'success' : 
                          g.status === 'IN_PROGRESS' ? 'info' : 
                          g.status === 'CANCELLED' ? 'destructive' : 'warning'
                        }
                      >
                        {g.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        value={g.status} 
                        onChange={(e) => handleStatusChange(g, e.target.value)}
                        className="w-32 inline-block text-[11px] h-8 py-0"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-foreground/40 text-xs">No performance milestones assigned yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Goal creation Form modal */}
      <Dialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Assign Performance Milestone Goal"
        description="Establish key results metrics targets for employee review cycles."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createGoalMutation.isPending}>Confirm Assign</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Goal Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optimize SQL latency rates" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Description / Deliverables</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Reduce query latency times down to 100ms on index page queries..."
              className="w-full bg-surface-muted border border-surface-border rounded-lg p-2.5 text-xs h-24 outline-none focus:border-primary dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Target Due Date *</label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
        </form>
      </Dialog>

    </div>
  );
};
