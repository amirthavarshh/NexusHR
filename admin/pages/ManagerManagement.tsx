import React, { useState } from 'react';
import { 
  useManagers, useCreateManager, useUpdateManager, useDeleteManager,
  useDepartments, useUpdateDepartment, useAdminEmployees
} from '../hooks/useAdminQuery';
import type { Manager } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Select, Dialog, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
import { 
  Search, UserPlus, Filter, Edit, Trash2, Eye, Mail, Phone, Building2, Link2, Users
} from 'lucide-react';

export const ManagerManagement: React.FC = () => {
  const { data: managers = [], isLoading: isManagersLoading } = useManagers();
  const { data: depts = [] } = useDepartments();
  const { data: employees = [] } = useAdminEmployees();

  const createManagerMutation = useCreateManager();
  const updateManagerMutation = useUpdateManager();
  const deleteManagerMutation = useDeleteManager();
  const updateDeptMutation = useUpdateDepartment();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Dialog / Form states
  const [formOpen, setFormOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [bindingManager, setBindingManager] = useState<Manager | null>(null);
  const [detailManager, setDetailManager] = useState<Manager | null>(null);

  // Fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('IT');
  const [position, setPosition] = useState('Engineering Manager');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Selected Department for Assignment binding
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');

  // Toast / Status notification helper
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingManager(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDepartment('IT');
    setPosition('Engineering Manager');
    setStatus('ACTIVE');
    setUsername('');
    setPassword('');
    setFormOpen(true);
  };

  const handleOpenEdit = (mgr: Manager) => {
    setEditingManager(mgr);
    setFirstName(mgr.firstName);
    setLastName(mgr.lastName);
    setEmail(mgr.email);
    setPhone(mgr.phone || '');
    setDepartment(mgr.department);
    setPosition(mgr.position);
    setStatus(mgr.status);
    setUsername(mgr.user?.username || '');
    setPassword('');
    setFormOpen(true);
  };

  const handleOpenDeptBind = (mgr: Manager) => {
    setBindingManager(mgr);
    // Find department currently assigned to this manager
    const currentDept = depts.find((d: any) => d.managerId === mgr.id);
    setSelectedDeptId(currentDept ? currentDept.id : '');
    setDeptOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingManager) {
        await updateManagerMutation.mutateAsync({
          id: editingManager.id,
          payload: { firstName, lastName, email, phone, department, position, status }
        });
        showStatus('Manager Account updated successfully!');
      } else {
        await createManagerMutation.mutateAsync({
          firstName, lastName, email, phone, department, position, status
        });
        showStatus('Manager Account created successfully!');
      }
      setFormOpen(false);
    } catch (err: any) {
      showStatus(err.message || 'Could not save manager account', 'error');
    }
  };

  const handleDeptAssignSubmit = async () => {
    if (!bindingManager || !selectedDeptId) return;

    try {
      // Bind manager to department
      await updateDeptMutation.mutateAsync({
        id: selectedDeptId as number,
        payload: { managerId: bindingManager.id }
      });
      showStatus(`Manager successfully assigned to department.`);
      setDeptOpen(false);
      setDetailManager(null); // Close detail sidecard to refresh
    } catch (err: any) {
      showStatus(err.message || 'Failed to assign department', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this manager profile?')) {
      try {
        await deleteManagerMutation.mutateAsync(id);
        showStatus('Manager profile deleted.');
        if (detailManager?.id === id) setDetailManager(null);
      } catch (err: any) {
        showStatus(err.message || 'Failed to delete manager account', 'error');
      }
    }
  };

  // Get employees assigned to department managed by selected manager
  const getManagedTeam = (mgr: Manager) => {
    // Find department managed by this manager
    const managedDept = depts.find((d: any) => d.managerId === mgr.id);
    if (!managedDept) return [];
    return employees.filter((e: any) => e.department.toLowerCase() === managedDept.name.toLowerCase());
  };

  // Filtered Managers list
  const filteredManagers = managers.filter((mgr: any) => {
    const fullName = `${mgr.firstName} ${mgr.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || mgr.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || mgr.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Manager Management</h2>
          <p className="text-xs text-foreground/60">Create manager accounts, assign business unit departments, and monitor direct reports.</p>
        </div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto flex items-center gap-1.5">
          <UserPlus size={14} />
          <span>Provision Manager Account</span>
        </Button>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className={`p-3 rounded-lg text-xs font-bold animate-fadeIn ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Search & Filters Controls */}
      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 bg-surface-muted px-3.5 py-1.5 rounded-lg border border-surface-border w-full md:max-w-md">
              <Search className="text-foreground/50" size={14} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs outline-none w-full text-foreground placeholder:text-foreground/40"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs text-foreground/50 font-semibold shrink-0">
                <Filter size={14} />
                <span>Department:</span>
              </div>
              <Select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full md:w-40"
              >
                <option value="ALL">All Departments</option>
                {depts.map((d: any) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Managers Roster Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main List Table Card */}
        <Card className={`border-t-4 border-t-emerald-500 shadow-sm ${detailManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader>
            <CardTitle>Managers Directory Roster</CardTitle>
            <CardDescription>Managed enterprise line managers.</CardDescription>
          </CardHeader>
          <CardContent>
            {isManagersLoading ? (
              <div className="text-center py-12 text-foreground/40 text-xs">Loading managers roster...</div>
            ) : filteredManagers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Dept Focus</TableHead>
                    <TableHead>Managed unit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManagers.map((mgr: any) => {
                    const deptManaged = depts.find((d: any) => d.managerId === mgr.id);
                    return (
                      <TableRow 
                        key={mgr.id} 
                        className={`cursor-pointer transition-colors ${detailManager?.id === mgr.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setDetailManager(mgr)}
                      >
                        <TableCell className="font-bold text-foreground">
                          <div>
                            <span>{mgr.firstName} {mgr.lastName}</span>
                            <span className="text-[10px] text-foreground/50 block font-normal mt-0.5">{mgr.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground/80 font-semibold">{mgr.position}</TableCell>
                        <TableCell>
                          {deptManaged ? (
                            <Badge variant="success">{deptManaged.name}</Badge>
                          ) : (
                            <span className="text-xs text-foreground/40 font-bold flex items-center gap-1">
                              <span>Unassigned</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setDetailManager(mgr)}>
                              <Eye size={12} className="text-foreground/60" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleOpenDeptBind(mgr)}>
                              <Link2 size={12} className="text-foreground/60" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleOpenEdit(mgr)}>
                              <Edit size={12} className="text-foreground/60" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(mgr.id)}>
                              <Trash2 size={12} className="text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-foreground/40 text-xs">No managers found matching criteria.</div>
            )}
          </CardContent>
        </Card>

        {/* Manager Details and Team Drawer Sidecard */}
        {detailManager && (
          <Card className="border-t-4 border-t-primary shadow-sm animate-fadeIn">
            <CardHeader className="flex flex-row justify-between items-start pb-2 border-b border-surface-border">
              <div>
                <CardTitle>Manager Profile File</CardTitle>
                <CardDescription>System access & direct reports overview.</CardDescription>
              </div>
              <button 
                onClick={() => setDetailManager(null)} 
                className="text-foreground/40 hover:text-foreground/80 cursor-pointer text-xs"
              >
                Close
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-extrabold uppercase border border-primary/20">
                  {detailManager.firstName.slice(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-extrabold text-foreground block">{detailManager.firstName} {detailManager.lastName}</span>
                  <span className="text-[10px] bg-surface-muted text-foreground/80 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{detailManager.position}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center gap-2.5 text-foreground/60">
                  <Mail size={13} className="shrink-0" />
                  <span>{detailManager.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground/60">
                  <Phone size={13} className="shrink-0" />
                  <span>{detailManager.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground/60">
                  <Building2 size={13} className="shrink-0" />
                  <span>{detailManager.department} Department Focus</span>
                </div>
              </div>

              {/* Direct Reports Team list */}
              <div className="pt-4 border-t border-surface-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/80 font-bold flex items-center gap-1.5">
                    <Users size={13} />
                    <span>Direct Reports ({getManagedTeam(detailManager).length}):</span>
                  </span>
                  <Badge variant="info">Dept Ledger</Badge>
                </div>
                <div className="bg-surface-muted p-2.5 rounded-lg border border-surface-border text-[10px] space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {getManagedTeam(detailManager).length > 0 ? (
                    getManagedTeam(detailManager).map((emp: any) => (
                      <div key={emp.id} className="flex justify-between items-center text-foreground/80 pb-1.5 border-b border-surface-border last:border-b-0 last:pb-0">
                        <span className="font-bold">{emp.firstName} {emp.lastName}</span>
                        <span className="text-foreground/50">{emp.position}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-foreground/40 block text-center py-2">No team employees registered to this manager's department yet.</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center gap-1.5" onClick={() => handleOpenDeptBind(detailManager)}>
                  <Link2 size={12} />
                  <span>Bind Dept</span>
                </Button>
                <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center gap-1.5" onClick={() => handleOpenEdit(detailManager)}>
                  <Edit size={12} />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Account Provisioning Dialog / Edit Form Modal */}
      <Dialog 
        isOpen={formOpen} 
        onClose={() => setFormOpen(false)}
        title={editingManager ? `Edit Manager: ${editingManager.firstName}` : "Provision Line Manager Account"}
        description="Fill out the profile metrics. All credentials will sync to the core user tables."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createManagerMutation.isPending || updateManagerMutation.isPending}>
              {editingManager ? "Save changes" : "Provision Profile"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">First Name *</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Sarah" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Last Name *</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Connor" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Email Address *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah.connor@nexushr.com" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Department Focus</label>
              <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                {depts.map((d: any) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Position</label>
              <Select value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="Engineering Director">Engineering Director</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Marketing Manager">Marketing Manager</option>
                <option value="Operations Director">Operations Director</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Profile Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </div>

          {!editingManager && (
            <div className="border-t border-surface-border pt-4 space-y-4">
              <span className="text-[10px] font-extrabold text-foreground/80 block uppercase tracking-wide">System Login Credentials</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/50 uppercase">Username *</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="sarahconnor" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/50 uppercase">Password *</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}
        </form>
      </Dialog>

      {/* Bind Department dialog */}
      <Dialog
        isOpen={deptOpen}
        onClose={() => setDeptOpen(false)}
        title="Assign Manager Department Unit"
        description="Bind this manager profile to head a specific operational department."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeptOpen(false)}>Cancel</Button>
            <Button onClick={handleDeptAssignSubmit}>Confirm Assignment</Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-surface-muted border border-surface-border rounded-lg text-xs">
            <span className="text-foreground/50 block mb-0.5">Manager Profile:</span>
            <span className="font-bold text-foreground">{bindingManager?.firstName} {bindingManager?.lastName}</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase block">Select Department to Lead</label>
            <Select 
              value={selectedDeptId} 
              onChange={(e) => setSelectedDeptId(Number(e.target.value))}
            >
              <option value="">No Active Head Department</option>
              {depts.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} Department (Current Head: {d.managerName || 'None'})</option>
              ))}
            </Select>
          </div>
        </div>
      </Dialog>

    </div>
  );
};
