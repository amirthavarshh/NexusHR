import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/ui';

export const GoalsPage: React.FC = () => {
  const { session, showToast } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  // Goal creation form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');

  const isPrivileged = session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR';

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'goals'],
    queryFn: api.getAllEmployees,
    enabled: isPrivileged,
  });

  // Set default selected employee when list loads
  useEffect(() => {
    if (isPrivileged && employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    } else if (!isPrivileged && session?.employeeId) {
      setSelectedEmpId(session.employeeId);
    }
  }, [employees, isPrivileged, session?.employeeId, selectedEmpId]);

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', selectedEmpId],
    queryFn: async () => {
      const list = await api.getGoals(selectedEmpId!);
      return list.reverse();
    },
    enabled: !!selectedEmpId
  });

  const assignGoalMut = useMutation({
    mutationFn: (payload: any) => api.createGoal(payload),
    onSuccess: () => {
      showToast('New goal assigned successfully.');
      setNewTitle('');
      setNewDesc('');
      setNewTargetDate('');
      queryClient.invalidateQueries({ queryKey: ['goals', selectedEmpId] });
    },
    onError: (err: any) => showToast(err.message || 'Could not assign goal', 'error')
  });

  const updateGoalStatusMut = useMutation({
    mutationFn: ({ goalId, status }: { goalId: number, status: string }) => api.updateGoalStatus(goalId, status),
    onSuccess: (_, variables) => {
      showToast(`Goal status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['goals', selectedEmpId] });
    },
    onError: (err: any) => showToast(err.message || 'Could not update status', 'error')
  });

  const handleToggleGoalStatus = (goalId: number, currentStatus: string) => {
    let nextStatus = 'PENDING';
    if (currentStatus === 'PENDING') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';

    updateGoalStatusMut.mutate({ goalId, status: nextStatus });
  };

  const handleAssignGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !newTitle || !newTargetDate) return;
    assignGoalMut.mutate({
      employeeId: selectedEmpId,
      title: newTitle,
      description: newDesc,
      targetDate: newTargetDate
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
      
      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">Goals & Performance Milestones</h2>
        <p className="text-sm text-foreground/60">View current deliverables, assign task timelines, and track overall goal completions.</p>
      </div>

      {isPrivileged && (
        <Card className="p-4 border-t-4 border-t-amber-500 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Select Team Member</label>
            <select
              value={selectedEmpId || ''}
              onChange={(e) => setSelectedEmpId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none bg-surface-muted text-foreground min-w-[240px]"
            >
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.position})</option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {selectedEmpId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List Grid */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-t-4 border-t-primary shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold text-foreground mb-4">Target Goals & Milestones</h3>
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goals.map((goal: any) => {
                    const isOverdue = new Date(goal.targetDate) < new Date() && goal.status !== 'COMPLETED';
                    return (
                      <div key={goal.id} className="p-4 rounded-lg bg-surface-muted border border-surface-border shadow-sm flex flex-col justify-between animate-fadeIn">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-bold text-foreground">{goal.title}</h4>
                            <Badge variant={goal.status === 'COMPLETED' ? 'success' : goal.status === 'IN_PROGRESS' ? 'default' : 'warning'}>
                              {goal.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground/80 mb-4">{goal.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-surface-border">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-foreground/60">Target: <span className="font-mono">{formatDate(goal.targetDate)}</span></span>
                            {isOverdue && <span className="text-destructive font-bold uppercase text-[8px]">Overdue</span>}
                          </div>
                          {goal.status !== 'COMPLETED' && (
                            <Button
                              onClick={() => handleToggleGoalStatus(goal.id, goal.status)}
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-[10px]"
                              disabled={updateGoalStatusMut.isPending}
                            >
                              {goal.status === 'PENDING' ? 'Start Goal (In Progress)' : 'Mark Completed'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-foreground/50 text-xs">No active goals assigned yet.</div>
              )}
            </Card>
          </div>

          {/* Manager Assign Goal Form panel */}
          <Card className="p-6 h-fit border-t-4 border-t-orange-400 shadow-sm animate-fadeIn">
            <h3 className="text-lg font-bold text-foreground mb-4">Assign Goal</h3>
            {isPrivileged ? (
              <form onSubmit={handleAssignGoal} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Goal Title</label>
                  <Input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Optimize API suites" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide details..."
                    className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none bg-surface-muted text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">Target Date</label>
                  <Input type="date" required value={newTargetDate} onChange={(e) => setNewTargetDate(e.target.value)} />
                </div>
                <Button type="submit" disabled={assignGoalMut.isPending} className="w-full flex items-center justify-center gap-1.5">
                  <Plus size={14} />
                  <span>{assignGoalMut.isPending ? 'Assigning...' : 'Assign Goal'}</span>
                </Button>
              </form>
            ) : (
              <p className="text-xs text-foreground/50">Only workspace managers can assign goals. Use standard buttons to update self status.</p>
            )}
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-foreground/50 text-sm">Please establish a profile card or link accounts to see milestones.</div>
      )}

    </div>
  );
};
