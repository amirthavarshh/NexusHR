import React, { useState } from 'react';
import { 
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
  useManagers 
} from '../hooks/useAdminQuery';
import type { Department } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Select, Dialog, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import { 
  Search, Network, Plus, Edit, Trash2, User, DollarSign, Users
} from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { data: depts = [], isLoading: isDeptsLoading } = useDepartments();
  const { data: managers = [] } = useManagers();

  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog / Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Fields state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [budget, setBudget] = useState(50000);
  const [managerId, setManagerId] = useState<number | ''>('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Status Toast alert helper
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setBudget(50000);
    setManagerId('');
    setStatus('ACTIVE');
    setFormOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setBudget(dept.budget);
    setManagerId(dept.managerId || '');
    setStatus(dept.status);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      showStatus('Please fill in name and code.', 'error');
      return;
    }

    try {
      const payload: any = { name, code, budget, status };
      if (managerId) {
        payload.managerId = Number(managerId);
      }

      if (editingDept) {
        await updateDeptMutation.mutateAsync({
          id: editingDept.id,
          payload
        });
        showStatus('Department node updated successfully.');
      } else {
        await createDeptMutation.mutateAsync(payload);
        showStatus('Department node created successfully.');
      }
      setFormOpen(false);
    } catch (err: any) {
      showStatus(err.message || 'Could not save department information', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department? All linked stats will be archived.')) {
      try {
        await deleteDeptMutation.mutateAsync(id);
        showStatus('Department node deleted.');
      } catch (err: any) {
        showStatus(err.message || 'Failed to delete department', 'error');
      }
    }
  };

  // Filtered depts list
  const filteredDepts = depts.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Financial statistics
  const totalBudget = depts.reduce((sum, d) => sum + d.budget, 0);
  const averageBudget = depts.length > 0 ? totalBudget / depts.length : 0;

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Department Administration</h2>
          <p className="text-xs text-slate-500">Configure organizational departments nodes, assign budget ledgers, and map managers.</p>
        </div>
        <Button onClick={handleOpenCreate} className="btn-primary self-start sm:self-auto">
          <Plus size={14} />
          <span>Create Department Node</span>
        </Button>
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

      {/* Quick Budget Statistics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Enterprise Departments</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{depts.length} Nodes</span>
          </div>
          <Network size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Total Budget Allocation</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">${totalBudget.toLocaleString()}</span>
          </div>
          <DollarSign size={20} className="text-amber-600" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Average Department Budget</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">${Math.round(averageBudget).toLocaleString()}</span>
          </div>
          <Users size={20} className="text-emerald-500" />
        </Card>
      </div>

      {/* Search Input Controls */}
      <Card className="accent-border-mint">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100 w-full md:max-w-md dark:bg-slate-800 dark:border-slate-700">
            <Search className="text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by department name or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs outline-none w-full text-slate-655 dark:text-slate-300 placeholder-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Department Roster Table Card */}
      <Card className="accent-border-mint">
        <CardHeader>
          <CardTitle>Departments Structure Directory</CardTitle>
          <CardDescription>Default business unit nodes mapped to cost ledgers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isDeptsLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading department metrics...</div>
          ) : filteredDepts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Manager Head</TableHead>
                  <TableHead>Employee Count</TableHead>
                  <TableHead>Budget Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-bold text-slate-750 dark:text-slate-350">{d.code}</TableCell>
                    <TableCell className="font-bold text-slate-805 dark:text-white">{d.name}</TableCell>
                    <TableCell>
                      {d.managerName ? (
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-400 font-semibold">
                          <User size={12} className="text-slate-450" />
                          <span>{d.managerName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400 font-bold">{d.employeeCount} active</TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400 font-bold">${d.budget.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'ACTIVE' ? 'success' : 'destructive'}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(d)}>
                          <Edit size={12} className="text-slate-450" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}>
                          <Trash2 size={12} className="text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">No department nodes match.</div>
          )}
        </CardContent>
      </Card>

      {/* Creation/Edit Dialog Form Modal */}
      <Dialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingDept ? `Modify Department: ${editingDept.name}` : "Create Organizational Department Node"}
        description="Establish a new cost ledger and system routing endpoint."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createDeptMutation.isPending || updateDeptMutation.isPending}>
              {editingDept ? "Save changes" : "Create Node"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Department Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Operations" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Department Code *</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OPS-DEPT" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Budget Ledger Limit ($) *</label>
            <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} placeholder="100000" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Manager Head Unit</label>
            <Select value={managerId} onChange={(e) => setManagerId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">No Active Head Assigned</option>
              {managers.map(mgr => (
                <option key={mgr.id} value={mgr.id}>{mgr.firstName} {mgr.lastName} ({mgr.position})</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Department Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </div>
        </form>
      </Dialog>

    </div>
  );
};
