import React, { useState } from 'react';
import { usePayrollSummary } from '../hooks/useAdminQuery';
import type { PayrollSlip } from '../types';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Dialog,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import { 
  CreditCard, DollarSign, Download, Eye, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

export const PayrollOverview: React.FC = () => {
  const { data: slips = [], isLoading } = usePayrollSummary();
  const [selectedSlip, setSelectedSlip] = useState<PayrollSlip | null>(null);

  // Financial aggregates
  const totalCost = slips.reduce((sum, s) => sum + s.netSalary, 0);
  const paidCost = slips.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.netSalary, 0);
  const pendingCost = slips.filter(s => s.status === 'DRAFT').reduce((sum, s) => sum + s.netSalary, 0);
  const paidCount = slips.filter(s => s.status === 'PAID').length;

  const chartData = slips.map(s => ({
    name: s.employeeName,
    Salary: s.basicSalary,
    Allowances: s.allowances,
    Deductions: s.deductions
  }));

  const handleExportCSV = () => {
    // Generate CSV in memory and trigger download
    const headers = 'Employee,Period Start,Period End,Basic Salary,Allowances,Deductions,Net Salary,Status\n';
    const rows = slips.map(s => 
      `"${s.employeeName}",${s.payPeriodStart},${s.payPeriodEnd},${s.basicSalary},${s.allowances},${s.deductions},${s.netSalary},${s.status}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payroll_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Payroll Administration & Overview</h2>
          <p className="text-xs text-slate-500">Monitor salaries disbursement cycles, draft statements, and run exports.</p>
        </div>
        <Button onClick={handleExportCSV} className="btn-primary self-start sm:self-auto">
          <Download size={14} />
          <span>Export Payroll Statement</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Disbursed Volume</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">${paidCost.toLocaleString()}</span>
          </div>
          <CheckCircle2 size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Pending Drafts</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">${pendingCost.toLocaleString()}</span>
          </div>
          <AlertCircle size={20} className="text-amber-600" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Total Cost Cost</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">${totalCost.toLocaleString()}</span>
          </div>
          <DollarSign size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Processed Slips</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{paidCount} / {slips.length} Slips</span>
          </div>
          <CreditCard size={20} className="text-emerald-500" />
        </Card>
      </div>

      {/* Recharts chart summary */}
      <Card className="accent-border-mint">
        <CardHeader>
          <CardTitle>Compensation Breakdown by Employee</CardTitle>
          <CardDescription>Visual comparison of salary parameters, allowances, and unpaid leave deductions.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="Salary" fill="#B8860B" />
              <Bar dataKey="Allowances" fill="#10B981" />
              <Bar dataKey="Deductions" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salary Table Grid */}
      <Card className="accent-border-mint">
        <CardHeader>
          <CardTitle>Payroll Ledger Statements</CardTitle>
          <CardDescription>Draft and Paid statements for active members.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading payroll registry...</div>
          ) : slips.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slips.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold text-slate-855 dark:text-white">{s.employeeName}</TableCell>
                    <TableCell className="font-mono text-slate-655 dark:text-slate-400 text-[10px]">{s.payPeriodStart} ~ {s.payPeriodEnd}</TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400">${s.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400 text-emerald-600">+${s.allowances.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400 text-rose-500">-${s.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-slate-805 dark:text-white font-bold">${s.netSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'PAID' ? 'success' : 'warning'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedSlip(s)}>
                        <Eye size={12} className="text-slate-450" />
                        <span className="ml-1 text-[10px]">Preview</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">No payroll statements exist.</div>
          )}
        </CardContent>
      </Card>

      {/* Payslip preview modal */}
      <Dialog
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        title="Employee Payslip Statement"
        description="Official payroll computation sheet details."
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedSlip(null)}>Close</Button>
            <Button onClick={() => window.print()} className="btn-primary">
              <FileText size={12} />
              <span>Print Payslip</span>
            </Button>
          </>
        }
      >
        {selectedSlip && (
          <div className="space-y-6 pt-2 text-xs">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-bold text-sm text-slate-850 dark:text-white block">NexusHR Inc.</span>
                <span className="text-[10px] text-slate-405 block mt-0.5">Enterprise Payroll Services</span>
              </div>
              <Badge variant={selectedSlip.status === 'PAID' ? 'success' : 'warning'}>
                {selectedSlip.status}
              </Badge>
            </div>

            {/* Employee metadata */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-semibold">Employee name</span>
                <span className="font-bold text-slate-805 dark:text-white mt-0.5 block">{selectedSlip.employeeName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-semibold">Pay Period</span>
                <span className="font-mono text-slate-700 dark:text-slate-350 mt-0.5 block">{selectedSlip.payPeriodStart} to {selectedSlip.payPeriodEnd}</span>
              </div>
            </div>

            {/* Calculations layout */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-455 block uppercase tracking-wider">Salary breakdown calculations</span>
              
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span>Basic salary:</span>
                  <span className="font-mono text-slate-800 dark:text-white font-semibold">${selectedSlip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Department allowances (10%):</span>
                  <span className="font-mono text-emerald-600 font-semibold">+${selectedSlip.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Unpaid leave deductions:</span>
                  <span className="font-mono text-rose-500 font-semibold">-${selectedSlip.deductions.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-205 dark:border-slate-800 text-sm">
                <span className="font-extrabold text-slate-855 dark:text-white">Net Disbursed Salary:</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-base">${selectedSlip.netSalary.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer warning */}
            <div className="text-[9px] text-slate-400 text-center leading-relaxed">
              This is a system generated statement of salary credits for NexusHR enterprise accounts.
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
};
