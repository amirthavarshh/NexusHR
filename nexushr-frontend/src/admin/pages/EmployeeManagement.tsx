import React, { useState } from 'react';
import { 
  useAdminEmployees, useDeleteEmployee, useDepartments 
} from '../hooks/useAdminQuery';
import type { Employee } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Select, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import { 
  Search, Filter, Trash2, Eye, Mail, Phone, Building2, CalendarDays, Award, DollarSign
} from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const { data: employees = [], isLoading } = useAdminEmployees();
  const { data: depts = [] } = useDepartments();
  const deleteEmployeeMutation = useDeleteEmployee();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Detail view sidecard state
  const [detailEmp, setDetailEmp] = useState<Employee | null>(null);

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to terminate this employee profile? All linked access will be revoked.')) {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
        showStatus('Employee profile terminated.');
        if (detailEmp?.id === id) setDetailEmp(null);
      } catch (err: any) {
        showStatus(err.message || 'Failed to delete employee account', 'error');
      }
    }
  };

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Employee Directory Master</h2>
        <p className="text-xs text-slate-500">Monitor all enterprise employees profiles, review job settings, and perform terminations.</p>
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

      {/* Search & Filters Controls */}
      <Card className="accent-border-mint">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100 w-full md:max-w-md dark:bg-slate-800 dark:border-slate-700">
              <Search className="text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search by employee name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs outline-none w-full text-slate-655 dark:text-slate-300 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold shrink-0">
                <Filter size={14} />
                <span>Filter Department:</span>
              </div>
              <Select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full md:w-40"
              >
                <option value="ALL">All Departments</option>
                {depts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Employee Roster Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main List Table Card */}
        <Card className={`accent-border-mint ${detailEmp ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader>
            <CardTitle>Workforce Ledger</CardTitle>
            <CardDescription>All active, on-leave, or terminated employee profiles.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading employee database...</div>
            ) : filteredEmployees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow 
                      key={emp.id} 
                      className={`cursor-pointer ${detailEmp?.id === emp.id ? 'bg-amber-50/30 dark:bg-amber-955/10' : ''}`}
                      onClick={() => setDetailEmp(emp)}
                    >
                      <TableCell className="font-bold text-slate-855 dark:text-white">
                        <div>
                          <span>{emp.firstName} {emp.lastName}</span>
                          <span className="text-[10px] text-slate-450 block font-normal mt-0.5">{emp.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-655 dark:text-slate-400 font-semibold">{emp.department}</TableCell>
                      <TableCell className="text-slate-655 dark:text-slate-400 font-semibold">{emp.position}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            emp.status === 'ACTIVE' ? 'success' : 
                            emp.status === 'ON_LEAVE' ? 'warning' : 'destructive'
                          }
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setDetailEmp(emp)}>
                            <Eye size={12} className="text-slate-450" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(emp.id)}>
                            <Trash2 size={12} className="text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">No employee files match query filter.</div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Profile Drawer Sidecard */}
        {detailEmp && (
          <Card className="accent-border-lavender animate-fadeIn">
            <CardHeader className="flex flex-row justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle>Workforce Detail Profile</CardTitle>
                <CardDescription>Complete demographic & position metadata.</CardDescription>
              </div>
              <button 
                onClick={() => setDetailEmp(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
              >
                Close
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 text-sm font-extrabold uppercase border border-amber-200 dark:border-amber-900/30 shrink-0">
                  {detailEmp.firstName.slice(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-855 dark:text-white block">{detailEmp.firstName} {detailEmp.lastName}</span>
                  <span className="text-[10px] bg-slate-105 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-slate-350">{detailEmp.position}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Mail size={13} className="shrink-0" />
                  <span>{detailEmp.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Phone size={13} className="shrink-0" />
                  <span>{detailEmp.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Building2 size={13} className="shrink-0" />
                  <span>{detailEmp.department} Department</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <CalendarDays size={13} className="shrink-0" />
                  <span>Hired: {new Date(detailEmp.hireDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-1">
                    <DollarSign size={13} />
                    <span>Annualized Salary:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${detailEmp.salary.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-1">
                    <Award size={13} />
                    <span>Performance Rating:</span>
                  </span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded dark:bg-amber-955/20 dark:text-amber-400">
                    {detailEmp.performanceRating ? detailEmp.performanceRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDelete(detailEmp.id)}>
                  <Trash2 size={12} />
                  <span>Terminate Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

    </div>
  );
};
