import React, { useState } from 'react';
import { useAllEmployees, useCreateEmployee, useUpdateEmployee } from '../hooks/useHrQuery';
import type { Employee, EmployeeStatus } from '../types';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Input, Select, Dialog,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../admin/components/ui';
import { Search, Plus, Edit, Eye, Mail, Phone, CalendarDays, DollarSign, Building2 } from 'lucide-react';

const DEPARTMENTS = ['Engineering', 'Product', 'Marketing', 'HR', 'Sales', 'Finance', 'Operations'];
const POSITIONS = ['Software Engineer', 'Senior Engineer', 'Lead Developer', 'Product Manager', 'QA Engineer', 'HR Specialist', 'Sales Engineer', 'DevOps Engineer', 'Data Analyst', 'Designer'];

const statusVariant = (s: EmployeeStatus) =>
  s === 'ACTIVE' ? 'success' : s === 'ON_LEAVE' ? 'warning' : 'destructive';

export const EmployeeManagement: React.FC = () => {
  const { data: employees = [], isLoading } = useAllEmployees();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const [hireOpen, setHireOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Hire form state
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', department: 'Engineering', position: 'Software Engineer', salary: '', username: '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleHire = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.salary || !form.username) return;
    try {
      await createMutation.mutateAsync({
        payload: { ...form, salary: parseFloat(form.salary) },
        username: form.username
      });
      setHireOpen(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', department: 'Engineering', position: 'Software Engineer', salary: '', username: '' });
      showToast(`Successfully hired ${form.firstName} ${form.lastName}!`);
    } catch (e: any) { showToast(e.message || 'Failed to hire employee.'); }
  };

  const handleUpdate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedEmployee) return;
    try {
      await updateMutation.mutateAsync({ id: selectedEmployee.id, payload: selectedEmployee });
      setSelectedEmployee(null);
      showToast('Employee profile updated successfully.');
    } catch (e: any) { showToast(e.message || 'Failed to update profile.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Employee Management</h2>
          <p className="text-xs text-slate-500">Hire, update, and manage all employee accounts and profiles.</p>
        </div>
        <Button onClick={() => setHireOpen(true)} className="self-start sm:self-auto">
          <Plus size={14} />
          <span>Hire Employee</span>
        </Button>
      </div>

      {toast && (
        <div className="p-3 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 animate-fadeIn">{toast}</div>
      )}

      {/* Filters Bar */}
      <Card className="border border-slate-100 dark:border-slate-800">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex-1 dark:bg-slate-800 dark:border-slate-700">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="bg-transparent text-xs outline-none w-full text-slate-600 dark:text-slate-300 placeholder-slate-400" />
            </div>
            <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full md:w-48">
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </Select>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full md:w-40">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roster Table + Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className={`border border-slate-100 dark:border-slate-800 ${selectedEmployee ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader>
            <CardTitle>Employee Roster</CardTitle>
            <CardDescription>{filtered.length} of {employees.length} employees shown</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading roster...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(emp => (
                    <TableRow key={emp.id} className={`cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-teal-50/30 dark:bg-teal-950/10' : ''}`} onClick={() => { setSelectedEmployee(emp); setDrawerMode('view'); }}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0">
                            {emp.firstName.slice(0, 1)}{emp.lastName.slice(0, 1)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-805 dark:text-white text-xs block">{emp.firstName} {emp.lastName}</span>
                            <span className="text-[10px] text-slate-400">{emp.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">{emp.department}</TableCell>
                      <TableCell className="text-xs text-slate-500">{emp.position}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-350">${emp.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        {emp.performanceRating ? (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded dark:bg-amber-950/20 dark:text-amber-400">
                            ⭐ {emp.performanceRating.toFixed(1)}
                          </span>
                        ) : <span className="text-slate-300 text-[10px]">—</span>}
                      </TableCell>
                      <TableCell><Badge variant={statusVariant(emp.status)}>{emp.status}</Badge></TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedEmployee(emp); setDrawerMode('view'); }}>
                            <Eye size={12} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedEmployee({ ...emp }); setDrawerMode('edit'); }}>
                            <Edit size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Profile / Edit Drawer */}
        {selectedEmployee && (
          <Card className="border border-teal-100 dark:border-teal-900/30 animate-fadeIn">
            <CardHeader className="flex flex-row justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle>{drawerMode === 'edit' ? 'Edit Profile' : 'Employee Profile'}</CardTitle>
                <CardDescription>{drawerMode === 'edit' ? 'Update employee details' : 'Full profile details'}</CardDescription>
              </div>
              <div className="flex gap-2">
                {drawerMode === 'view' && (
                  <Button size="sm" variant="outline" onClick={() => setDrawerMode('edit')}>
                    <Edit size={11} /><span className="ml-1">Edit</span>
                  </Button>
                )}
                <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer">✕</button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center text-base font-extrabold uppercase border border-teal-200 dark:border-teal-900/30 shrink-0">
                  {selectedEmployee.firstName.slice(0, 1)}{selectedEmployee.lastName.slice(0, 1)}
                </div>
                <div>
                  {drawerMode === 'view' ? (
                    <>
                      <span className="font-extrabold text-slate-855 dark:text-white block">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold dark:bg-slate-800 dark:text-slate-350">{selectedEmployee.position}</span>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Input value={selectedEmployee.firstName} onChange={e => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })} className="w-24" placeholder="First" />
                      <Input value={selectedEmployee.lastName} onChange={e => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })} className="w-24" placeholder="Last" />
                    </div>
                  )}
                </div>
              </div>

              {drawerMode === 'view' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-slate-500"><Mail size={12} /><span>{selectedEmployee.email}</span></div>
                  <div className="flex items-center gap-2.5 text-slate-500"><Phone size={12} /><span>{selectedEmployee.phone || '—'}</span></div>
                  <div className="flex items-center gap-2.5 text-slate-500"><Building2 size={12} /><span>{selectedEmployee.department}</span></div>
                  <div className="flex items-center gap-2.5 text-slate-500"><CalendarDays size={12} /><span>Hired: {selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-500"><DollarSign size={12} /> Salary</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-350">${selectedEmployee.salary.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <Badge variant={statusVariant(selectedEmployee.status)}>{selectedEmployee.status}</Badge>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Email</label><Input value={selectedEmployee.email} onChange={e => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label><Input value={selectedEmployee.phone || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
                    <Select value={selectedEmployee.department} onChange={e => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Position</label><Input value={selectedEmployee.position} onChange={e => setSelectedEmployee({ ...selectedEmployee, position: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Salary ($)</label><Input type="number" value={selectedEmployee.salary} onChange={e => setSelectedEmployee({ ...selectedEmployee, salary: parseFloat(e.target.value) })} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                    <Select value={selectedEmployee.status} onChange={e => setSelectedEmployee({ ...selectedEmployee, status: e.target.value as EmployeeStatus })}>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="TERMINATED">Terminated</option>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" loading={updateMutation.isPending} className="flex-1">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setDrawerMode('view')}>Cancel</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hire Employee Modal */}
      <Dialog
        isOpen={hireOpen}
        onClose={() => setHireOpen(false)}
        title="Hire New Employee"
        description="Create a new employee profile and system account."
        footer={
          <>
            <Button variant="outline" onClick={() => setHireOpen(false)}>Cancel</Button>
            <Button onClick={handleHire} loading={createMutation.isPending}>Confirm Hire</Button>
          </>
        }
      >
        <form onSubmit={handleHire} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">First Name *</label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Alice" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Last Name *</label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Morgan" /></div>
          </div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Email Address *</label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="alice@nexushr.com" /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">System Username *</label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="alice_morgan" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Department *</label>
              <Select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </Select>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Position *</label>
              <Select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Salary ($) *</label><Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="7500" /></div>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
