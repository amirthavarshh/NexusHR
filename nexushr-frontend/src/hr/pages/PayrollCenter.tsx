import React, { useState } from 'react';
import { useAllPayrolls, useRunPayroll, usePayPayroll } from '../hooks/useHrQuery';
import type { Payroll } from '../types';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Dialog,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../admin/components/ui';
import { Play, CreditCard, DollarSign, CheckCircle2, FileText } from 'lucide-react';

export const PayrollCenter: React.FC = () => {
  const { data: payrolls = [], isLoading } = useAllPayrolls();
  const runMutation = useRunPayroll();
  const payMutation = usePayPayroll();

  const [runOpen, setRunOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Payroll | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type }); setTimeout(() => setToast(null), 3500);
  };

  const draftPayrolls = payrolls.filter(p => p.status === 'DRAFT');
  const paidPayrolls = payrolls.filter(p => p.status === 'PAID');
  const totalDraftNet = draftPayrolls.reduce((s, p) => s + p.netSalary, 0);
  const totalPaidNet = paidPayrolls.reduce((s, p) => s + p.netSalary, 0);

  const handleRunPayroll = async () => {
    if (!dateRange.start || !dateRange.end) return;
    try {
      const records = await runMutation.mutateAsync({ start: dateRange.start, end: dateRange.end });
      setRunOpen(false);
      showToast(`Payroll run complete! ${records.length} records generated.`);
      setDateRange({ start: '', end: '' });
    } catch (e: any) { showToast(e.message || 'Payroll run failed.', 'error'); }
  };

  const handlePay = async () => {
    if (!payTarget) return;
    try {
      await payMutation.mutateAsync(payTarget.id);
      setPayTarget(null);
      showToast(`Salary marked as PAID for ${payTarget.employee?.firstName} ${payTarget.employee?.lastName}.`);
    } catch (e: any) { showToast(e.message || 'Payment failed.', 'error'); }
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Payroll Processing Center</h2>
          <p className="text-xs text-slate-500">Run payroll cycles, review records, and mark individual salaries as paid.</p>
        </div>
        <Button onClick={() => setRunOpen(true)} className="self-start sm:self-auto">
          <Play size={14} />
          <span>Run Payroll</span>
        </Button>
      </div>

      {toast && (
        <div className={`p-3 rounded-lg text-xs font-bold border animate-fadeIn ${toast.type === 'success' ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400'}`}>
          {toast.text}
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Draft Records</span>
          <span className="text-2xl font-extrabold text-slate-855 dark:text-white">{draftPayrolls.length}</span>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Awaiting disbursement</span>
        </Card>
        <Card className="bg-teal-50 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Paid Records</span>
          <span className="text-2xl font-extrabold text-slate-855 dark:text-white">{paidPayrolls.length}</span>
          <span className="text-[10px] text-teal-600 font-bold block mt-1">Disbursed this cycle</span>
        </Card>
        <Card className="bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pending Payout</span>
          <span className="text-2xl font-extrabold text-slate-855 dark:text-white font-mono">{fmt(totalDraftNet)}</span>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">Net salary to disburse</span>
        </Card>
        <Card className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 p-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total Paid</span>
          <span className="text-2xl font-extrabold text-slate-855 dark:text-white font-mono">{fmt(totalPaidNet)}</span>
          <span className="text-[10px] text-indigo-600 font-bold block mt-1">Disbursed this cycle</span>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="border border-slate-100 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText size={14} className="text-teal-500" /><span>All Payroll Records</span></CardTitle>
          <CardDescription>{payrolls.length} records — {draftPayrolls.length} draft, {paidPayrolls.length} paid.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading payroll records...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">Allowances</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-bold text-xs text-slate-800 dark:text-white block">{p.employee?.firstName} {p.employee?.lastName}</span>
                      <span className="text-[10px] text-slate-400">{p.employee?.department}</span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{p.payPeriodStart} → {p.payPeriodEnd}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">{fmt(p.basicSalary)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-teal-600 dark:text-teal-400">+{fmt(p.allowances)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-500">−{fmt(p.deductions)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-extrabold text-slate-855 dark:text-white">{fmt(p.netSalary)}</TableCell>
                    <TableCell><Badge variant={p.status === 'PAID' ? 'success' : 'warning'}>{p.status}</Badge></TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono">{p.processedAt || '—'}</TableCell>
                    <TableCell className="text-right">
                      {p.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => setPayTarget(p)} loading={payMutation.isPending && payTarget?.id === p.id}>
                          <CreditCard size={11} />
                          <span className="ml-1">Pay</span>
                        </Button>
                      )}
                      {p.status === 'PAID' && <CheckCircle2 size={14} className="text-teal-500 ml-auto" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Run Payroll Modal */}
      <Dialog
        isOpen={runOpen}
        onClose={() => setRunOpen(false)}
        title="Run Payroll Cycle"
        description="Select a pay period date range to generate payroll records for all active employees."
        footer={
          <>
            <Button variant="outline" onClick={() => setRunOpen(false)}>Cancel</Button>
            <Button onClick={handleRunPayroll} loading={runMutation.isPending} disabled={!dateRange.start || !dateRange.end}>
              <Play size={13} /> <span className="ml-1">Run Payroll</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Pay Period Start *</label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Pay Period End *</label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 text-[11px] font-semibold">
            <DollarSign size={13} className="inline mr-1" />
            This will generate draft payroll records for all active employees. Review and mark each as PAID individually.
          </div>
        </div>
      </Dialog>

      {/* Confirm Pay Modal */}
      <Dialog
        isOpen={!!payTarget}
        onClose={() => setPayTarget(null)}
        title="Confirm Salary Disbursement"
        description={`Mark ${payTarget?.employee?.firstName} ${payTarget?.employee?.lastName}'s salary as PAID?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button onClick={handlePay} loading={payMutation.isPending}>
              <CreditCard size={13} /> <span className="ml-1">Confirm Payment</span>
            </Button>
          </>
        }
      >
        {payTarget && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Employee</span><span className="font-bold">{payTarget.employee?.firstName} {payTarget.employee?.lastName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Basic Salary</span><span className="font-mono font-bold">{fmt(payTarget.basicSalary)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Allowances</span><span className="font-mono text-teal-600">+{fmt(payTarget.allowances)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Deductions</span><span className="font-mono text-rose-500">−{fmt(payTarget.deductions)}</span></div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2"><span className="font-bold text-slate-700 dark:text-slate-350">Net Payout</span><span className="font-mono font-extrabold text-teal-700 dark:text-teal-400">{fmt(payTarget.netSalary)}</span></div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
