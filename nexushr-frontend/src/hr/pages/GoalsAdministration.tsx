import React, { useState } from 'react';
import { useAllEmployees, useEmployeeGoals, useCreateGoal, useUpdateGoalStatus } from '../hooks/useHrQuery';
import type { Employee, GoalStatus } from '../types';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Dialog, Select
} from '../../components/ui';
import { Target, Plus, CheckCircle2, Circle, Loader, XCircle } from 'lucide-react';

const goalStatusConfig: Record<GoalStatus, { label: string; icon: React.FC<any>; color: string; bg: string }> = {
  PENDING:     { label: 'Pending',     icon: Circle,       color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-800' },
  IN_PROGRESS: { label: 'In Progress', icon: Loader,       color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-950/20' },
  COMPLETED:   { label: 'Completed',   icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  CANCELLED:   { label: 'Cancelled',   icon: XCircle,      color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/20' },
};


export const GoalsAdministration: React.FC = () => {
  const { data: employees = [] } = useAllEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { data: goals = [], isLoading: goalsLoading } = useEmployeeGoals(selectedEmployee?.id ?? 0);
  const createMutation = useCreateGoal();
  const statusMutation = useUpdateGoalStatus();

  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAssign = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedEmployee || !form.title || !form.targetDate) return;
    try {
      await createMutation.mutateAsync({
        employeeId: selectedEmployee.id,
        title: form.title,
        description: form.description,
        targetDate: form.targetDate,
      });
      setAssignOpen(false);
      setForm({ title: '', description: '', targetDate: '' });
      showToast(`Goal assigned to ${selectedEmployee.firstName} ${selectedEmployee.lastName}.`);
    } catch (e: any) { showToast(e.message || 'Failed to assign goal.'); }
  };

  const handleStatusChange = async (goalId: number, status: string) => {
    if (!selectedEmployee) return;
    try {
      await statusMutation.mutateAsync({ goalId, status, employeeId: selectedEmployee.id });
      showToast('Goal status updated.');
    } catch (e: any) { showToast(e.message || 'Failed to update status.'); }
  };

  const stats = goals.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Goals Administration</h2>
        <p className="text-xs text-slate-500">Assign, track, and update employee OKRs and performance goals.</p>
      </div>

      {toast && (
        <div className="p-3 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 animate-fadeIn">{toast}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Employee Selector */}
        <Card className="border border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle>Select Employee</CardTitle>
            <CardDescription>View and manage individual goals.</CardDescription>
          </CardHeader>
          <CardContent className="pt-3 space-y-1 max-h-[500px] overflow-y-auto">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  selectedEmployee?.id === emp.id
                    ? 'bg-teal-50 border border-teal-200 dark:bg-teal-950/20 dark:border-teal-900/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0">
                  {emp.firstName.slice(0, 1)}{emp.lastName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{emp.firstName} {emp.lastName}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{emp.department}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Goals Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEmployee ? (
            <>
              {/* Employee Info + Assign Button */}
              <Card className="border border-teal-100 dark:border-teal-900/30 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
                <CardContent className="pt-5 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-teal-200 dark:bg-teal-950/40 dark:border-teal-900/30 flex items-center justify-center text-sm font-extrabold uppercase text-teal-700 dark:text-teal-400">
                      {selectedEmployee.firstName.slice(0, 1)}{selectedEmployee.lastName.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-855 dark:text-white text-sm">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{selectedEmployee.position} · {selectedEmployee.department}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {Object.entries(stats).map(([status, count]) => {
                          const cfg = goalStatusConfig[status as GoalStatus];
                          if (!cfg || count === 0) return null;
                          const Icon = cfg.icon;
                          return (
                            <span key={status} className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                              <Icon size={10} /> {count} {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setAssignOpen(true)}>
                    <Plus size={13} />
                    <span>Assign Goal</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Goals List */}
              <Card className="border border-slate-100 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Goal Ledger</CardTitle>
                  <CardDescription>{goals.length} goal{goals.length !== 1 ? 's' : ''} assigned</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goalsLoading ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Loading goals...</div>
                  ) : goals.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      <Target size={24} className="mx-auto mb-2 opacity-40" />
                      <p>No goals assigned yet.</p>
                    </div>
                  ) : (
                    goals.map(goal => {
                      const cfg = goalStatusConfig[goal.status];
                      const Icon = cfg.icon;
                      const isOverdue = goal.status !== 'COMPLETED' && goal.status !== 'CANCELLED' && new Date(goal.targetDate) < new Date();
                      return (
                        <div key={goal.id} className={`border rounded-xl p-4 transition-all ${cfg.bg} border-slate-100 dark:border-slate-800`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <Icon size={16} className={`${cfg.color} mt-0.5 shrink-0`} />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-white block">{goal.title}</span>
                                {goal.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{goal.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`text-[10px] font-mono font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {isOverdue ? '⚠ Overdue · ' : ''}Due: {new Date(goal.targetDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 w-36">
                              <Select
                                value={goal.status}
                                onChange={e => handleStatusChange(goal.id, e.target.value)}
                                className="text-[10px] py-1"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center py-16">
              <div className="text-center text-slate-400">
                <Target size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Select an employee to manage their goals</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Assign Goal Modal */}
      <Dialog
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={`Assign Goal — ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        description="Define a clear, measurable goal with a specific target date."
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={createMutation.isPending} disabled={!form.title || !form.targetDate}>
              <Target size={13} /> <span className="ml-1">Assign Goal</span>
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Goal Title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Improve API response time by 30%"
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 placeholder-slate-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Provide additional context and success criteria..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 resize-none text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 placeholder-slate-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Target Date *</label>
            <input
              type="date"
              value={form.targetDate}
              onChange={e => setForm({ ...form, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};
