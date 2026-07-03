import React, { useState } from 'react';
import { usePayrollSummary } from '../hooks/useAdminQuery';
import type { PayrollSlip } from '../types';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Dialog,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
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
  const totalCost = slips.reduce((sum: number, s: any) => sum + s.netSalary, 0);
  const paidCost = slips.filter((s: any) => s.status === 'PAID').reduce((sum: number, s: any) => sum + s.netSalary, 0);
  const pendingCost = slips.filter((s: any) => s.status === 'DRAFT').reduce((sum: number, s: any) => sum + s.netSalary, 0);
  const paidCount = slips.filter((s: any) => s.status === 'PAID').length;

  const chartData = slips.map((s: any) => ({
    name: s.employeeName,
    Salary: s.basicSalary,
    Allowances: s.allowances,
    Deductions: s.deductions
  }));

  const handleExportCSV = () => {
    // Generate CSV in memory and trigger download
    const headers = 'Employee,Period Start,Period End,Basic Salary,Allowances,Deductions,Net Salary,Status\n';
    const rows = slips.map((s: any) => 
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
          <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Payroll Administration & Overview</h2>
          <p className="text-xs text-foreground/60">Monitor salaries disbursement cycles, draft statements, and run exports.</p>
        </div>
        <Button onClick={handleExportCSV} className="self-start sm:self-auto flex items-center gap-1.5">
          <Download size={14} />
          <span>Export Payroll Statement</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Disbursed Volume</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">${paidCost.toLocaleString()}</span>
          </div>
          <CheckCircle2 size={20} className="text-emerald-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Pending Drafts</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">${pendingCost.toLocaleString()}</span>
          </div>
          <AlertCircle size={20} className="text-amber-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Total Cost Cost</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">${totalCost.toLocaleString()}</span>
          </div>
          <DollarSign size={20} className="text-emerald-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Processed Slips</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">{paidCount} / {slips.length} Slips</span>
          </div>
          <CreditCard size={20} className="text-emerald-500" />
        </Card>
      </div>

      {/* Recharts chart summary */}
      <Card className="border-t-4 border-t-primary shadow-sm">
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
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px' }} />
              <Bar dataKey="Salary" fill="#B8860B" />
              <Bar dataKey="Allowances" fill="#10B981" />
              <Bar dataKey="Deductions" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salary Table Grid */}
      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardHeader>
          <CardTitle>Payroll Ledger Statements</CardTitle>
          <CardDescription>Draft and Paid statements for active members.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-foreground/40 text-xs">Loading payroll registry...</div>
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
                {slips.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold text-foreground">{s.employeeName}</TableCell>
                    <TableCell className="font-mono text-foreground/60 text-[10px]">{s.payPeriodStart} ~ {s.payPeriodEnd}</TableCell>
                    <TableCell className="font-mono text-foreground/70">${s.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-foreground/70 text-emerald-500">+${s.allowances.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-foreground/70 text-destructive">-${s.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-foreground font-bold">${s.netSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'PAID' ? 'success' : 'warning'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedSlip(s)} className="flex items-center gap-1">
                        <Eye size={12} className="text-foreground/60" />
                        <span className="text-[10px]">Preview</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-foreground/40 text-xs">No payroll statements exist.</div>
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
            <Button onClick={() => window.print()} className="flex items-center gap-1.5">
              <FileText size={12} />
              <span>Print Payslip</span>
            </Button>
          </>
        }
      >
        {selectedSlip && (
          <div className="space-y-6 pt-2 text-xs">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-surface-border pb-3">
              <div>
                <span className="font-bold text-sm text-foreground block">NexusHR Inc.</span>
                <span className="text-[10px] text-foreground/50 block mt-0.5">Enterprise Payroll Services</span>
              </div>
              <Badge variant={selectedSlip.status === 'PAID' ? 'success' : 'warning'}>
                {selectedSlip.status}
              </Badge>
            </div>

            {/* Employee metadata */}
            <div className="grid grid-cols-2 gap-4 bg-surface-muted p-3 rounded-lg border border-surface-border">
              <div>
                <span className="text-[10px] text-foreground/50 block uppercase font-semibold">Employee name</span>
                <span className="font-bold text-foreground mt-0.5 block">{selectedSlip.employeeName}</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground/50 block uppercase font-semibold">Pay Period</span>
                <span className="font-mono text-foreground/80 mt-0.5 block">{selectedSlip.payPeriodStart} to {selectedSlip.payPeriodEnd}</span>
              </div>
            </div>

            {/* Calculations layout */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-foreground/80 block uppercase tracking-wider">Salary breakdown calculations</span>
              
              <div className="space-y-1.5 pt-1.5 border-t border-surface-border">
                <div className="flex justify-between text-foreground/60">
                  <span>Basic salary:</span>
                  <span className="font-mono text-foreground font-semibold">${selectedSlip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Department allowances (10%):</span>
                  <span className="font-mono text-emerald-500 font-semibold">+${selectedSlip.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Unpaid leave deductions:</span>
                  <span className="font-mono text-destructive font-semibold">-${selectedSlip.deductions.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-surface-border text-sm">
                <span className="font-extrabold text-foreground">Net Disbursed Salary:</span>
                <span className="font-mono font-extrabold text-foreground text-base">${selectedSlip.netSalary.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer warning */}
            <div className="text-[9px] text-foreground/40 text-center leading-relaxed">
              This is a system generated statement of salary credits for NexusHR enterprise accounts.
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
};
