import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/ui';

interface PayrollPageProps {
  roleView: 'employee' | 'manager';
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ roleView }) => {
  const { session, showToast } = useAuth();
  const queryClient = useQueryClient();
  
  // Date states for running payroll
  const [payrollStart, setPayrollStart] = useState('');
  const [payrollEnd, setPayrollEnd] = useState('');

  const isManagerOrAdmin = roleView === 'manager' && (session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR');
  const isEmployee = roleView === 'employee' && !!session?.employeeId;

  const { data: payrolls = [] } = useQuery({
    queryKey: ['payrolls', 'my'],
    queryFn: async () => {
      const slips = await api.getMyPayrolls();
      return slips.reverse();
    },
    enabled: isEmployee
  });

  const { data: payrollAll = [] } = useQuery({
    queryKey: ['payrolls', 'all'],
    queryFn: async () => {
      const allSlips = await api.getAllPayrolls();
      return allSlips.reverse();
    },
    enabled: isManagerOrAdmin
  });

  const runPayrollMut = useMutation({
    mutationFn: () => api.runPayroll(payrollStart, payrollEnd),
    onSuccess: (results) => {
      showToast(`Payroll slips computed for ${results.length} active members`);
      
      // Auto complete onboarding step 8: "Add Payroll Cycle"
      const savedSteps = localStorage.getItem('onboardingCompletedSteps');
      const steps = savedSteps ? JSON.parse(savedSteps) : [];
      if (!steps.includes(8)) {
        steps.push(8);
        localStorage.setItem('onboardingCompletedSteps', JSON.stringify(steps));
      }
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (err: any) => showToast(err.message || 'Could not run payroll cycle', 'error')
  });

  const paySalaryMut = useMutation({
    mutationFn: api.payPayroll,
    onSuccess: () => {
      showToast('Salary payment successfully disbursed');
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (err: any) => showToast(err.message || 'Disbursement failed', 'error')
  });

  const handleRunPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollStart || !payrollEnd) {
      showToast('Please specify both start and end dates', 'error');
      return;
    }
    if (new Date(payrollEnd) < new Date(payrollStart)) {
      showToast('End date cannot be before start date', 'error');
      return;
    }
    runPayrollMut.mutate();
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
        <h2 className="text-2xl font-bold font-display text-foreground">
          {roleView === 'manager' ? 'Payroll Administration' : 'My Personal Payslips'}
        </h2>
        <p className="text-sm text-foreground/60">
          {roleView === 'manager' 
            ? 'Run payroll cycles, manage allowances, verify deductions, and disburse salary payments.' 
            : 'Access and download your historically processed monthly compensation slips.'}
        </p>
      </div>

      {isManagerOrAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Run Payroll Form */}
          <Card className="p-6 h-fit border-t-4 border-t-primary shadow-sm animate-fadeIn">
            <h3 className="text-base font-bold text-foreground mb-4">Run Payroll Cycle</h3>
            <form onSubmit={handleRunPayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1">Start Date</label>
                <Input type="date" required value={payrollStart} onChange={(e) => setPayrollStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1">End Date</label>
                <Input type="date" required value={payrollEnd} onChange={(e) => setPayrollEnd(e.target.value)} />
              </div>
              <Button type="submit" disabled={runPayrollMut.isPending} className="w-full">
                {runPayrollMut.isPending ? <RefreshCw className="animate-spin" size={14} /> : 'Calculate Statements'}
              </Button>
            </form>
          </Card>

          {/* All Payroll Records */}
          <Card className="lg:col-span-2 p-6 border-t-4 border-t-sky-500 shadow-sm animate-fadeIn">
            <h3 className="text-base font-bold text-foreground mb-4">Workforce Payslips</h3>
            {payrollAll.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-foreground/80">
                  <thead>
                    <tr className="border-b border-surface-border text-foreground/50 font-semibold text-xs">
                      <th className="py-2.5">Employee</th>
                      <th className="py-2.5">Pay Period</th>
                      <th className="py-2.5">Basic</th>
                      <th className="py-2.5">Allowances</th>
                      <th className="py-2.5">Deductions</th>
                      <th className="py-2.5">Net Salary</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollAll.map((row: any) => (
                      <tr key={row.id} className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{row.employee?.firstName} {row.employee?.lastName}</td>
                        <td className="py-3 font-mono text-xs">{formatDate(row.payPeriodStart)} - {formatDate(row.payPeriodEnd)}</td>
                        <td className="py-3 font-mono text-xs">${row.basicSalary.toLocaleString()}</td>
                        <td className="py-3 font-mono text-xs text-emerald-600">+${row.allowances.toLocaleString()}</td>
                        <td className="py-3 font-mono text-xs text-rose-500">-${row.deductions.toLocaleString()}</td>
                        <td className="py-3 font-mono text-xs font-bold text-foreground">${row.netSalary.toLocaleString()}</td>
                        <td className="py-3">
                          <Badge variant={row.status === 'PAID' ? 'success' : 'warning'}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {row.status !== 'PAID' ? (
                            <Button
                              onClick={() => paySalaryMut.mutate(row.id)}
                              variant="default"
                              size="sm"
                              className="h-7 text-xs px-2"
                              disabled={paySalaryMut.isPending}
                            >
                              Mark Paid
                            </Button>
                          ) : (
                            <span className="text-[10px] text-foreground/50 font-medium">Disbursed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/50">No payroll statements calculated yet.</div>
            )}
          </Card>
        </div>
      )}

      {isEmployee && (
        <Card className="p-6 border-t-4 border-t-primary shadow-sm animate-fadeIn">
          <h3 className="text-base font-bold text-foreground mb-4">My Personal Payslips</h3>
          {payrolls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm text-foreground/80">
                <thead>
                  <tr className="border-b border-surface-border text-foreground/50 font-semibold text-xs">
                    <th className="py-2.5">Pay Period</th>
                    <th className="py-2.5">Basic Salary</th>
                    <th className="py-2.5">Allowances</th>
                    <th className="py-2.5">Deductions</th>
                    <th className="py-2.5">Net Salary</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((row: any) => (
                    <tr key={row.id} className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3 font-semibold font-mono text-xs text-foreground">{formatDate(row.payPeriodStart)} - {formatDate(row.payPeriodEnd)}</td>
                      <td className="py-3 font-mono text-xs">${row.basicSalary.toLocaleString()}</td>
                      <td className="py-3 font-mono text-xs text-emerald-600">+${row.allowances.toLocaleString()}</td>
                      <td className="py-3 font-mono text-xs text-rose-500">-${row.deductions.toLocaleString()}</td>
                      <td className="py-3 font-mono text-xs font-bold text-foreground">${row.netSalary.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant={row.status === 'PAID' ? 'success' : 'warning'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-mono text-xs text-foreground/50">
                        {row.processedAt ? formatDate(row.processedAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-foreground/50">No payslips available in your history.</div>
          )}
        </Card>
      )}

    </div>
  );
};
