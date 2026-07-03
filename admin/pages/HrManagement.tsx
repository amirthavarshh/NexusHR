import React, { useState } from 'react';
import { 
  useHRs, useCreateHR, useUpdateHR, useDeleteHR 
} from '../hooks/useAdminQuery';
import type { HR } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, Select, Dialog, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
import { 
  Search, UserPlus, Filter, Edit, Trash2, Eye, Mail, Phone, Building2
} from 'lucide-react';

export const HrManagement: React.FC = () => {
  const { data: hrs = [], isLoading } = useHRs();
  const createHRMutation = useCreateHR();
  const updateHRMutation = useUpdateHR();
  const deleteHRMutation = useDeleteHR();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Dialog / Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingHR, setEditingHR] = useState<HR | null>(null);
  const [detailHR, setDetailHR] = useState<HR | null>(null);
  
  // Fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('HR');
  const [position, setPosition] = useState('HR Specialist');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Toast / Status notification helper
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingHR(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDepartment('HR');
    setPosition('HR Specialist');
    setStatus('ACTIVE');
    setUsername('');
    setPassword('');
    setFormOpen(true);
  };

  const handleOpenEdit = (hr: HR) => {
    setEditingHR(hr);
    setFirstName(hr.firstName);
    setLastName(hr.lastName);
    setEmail(hr.email);
    setPhone(hr.phone || '');
    setDepartment(hr.department);
    setPosition(hr.position);
    setStatus(hr.status);
    setUsername(hr.user?.username || '');
    setPassword('');
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingHR) {
        await updateHRMutation.mutateAsync({
          id: editingHR.id,
          payload: { firstName, lastName, email, phone, department, position, status }
        });
        showStatus('HR Account updated successfully!');
      } else {
        await createHRMutation.mutateAsync({
          firstName, lastName, email, phone, department, position, status
        });
        showStatus('HR Account created successfully!');
      }
      setFormOpen(false);
    } catch (err: any) {
      showStatus(err.message || 'Could not save HR account', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to terminate this HR profile?')) {
      try {
        await deleteHRMutation.mutateAsync(id);
        showStatus('HR Profile terminated.');
        if (detailHR?.id === id) setDetailHR(null);
      } catch (err: any) {
        showStatus(err.message || 'Failed to delete HR account', 'error');
      }
    }
  };

  // Filtered HR list
  const filteredHRs = hrs.filter((hr: any) => {
    const fullName = `${hr.firstName} ${hr.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || hr.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || hr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">HR Personnel Management</h2>
          <p className="text-xs text-foreground/60">Create, monitor, and configure system permissions for HR Specialists and Officers.</p>
        </div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto flex items-center gap-1.5">
          <UserPlus size={14} />
          <span>Provision HR Account</span>
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
                <span>Filter Status:</span>
              </div>
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full md:w-40"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HR Roster Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main List Table Card */}
        <Card className={`border-t-4 border-t-emerald-500 shadow-sm ${detailHR ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader>
            <CardTitle>HR Directory Roster</CardTitle>
            <CardDescription>Managed HR agents in the system database.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-foreground/40 text-xs">Loading HR roster...</div>
            ) : filteredHRs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHRs.map((hr: any) => (
                    <TableRow 
                      key={hr.id} 
                      className={`cursor-pointer transition-colors ${detailHR?.id === hr.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setDetailHR(hr)}
                    >
                      <TableCell className="font-bold text-foreground">
                        <div>
                          <span>{hr.firstName} {hr.lastName}</span>
                          <span className="text-[10px] text-foreground/50 block font-normal mt-0.5">{hr.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground/80 font-semibold">{hr.position}</TableCell>
                      <TableCell>
                        <Badge variant={hr.status === 'ACTIVE' ? 'success' : 'destructive'}>
                          {hr.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setDetailHR(hr)}>
                            <Eye size={12} className="text-foreground/60" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(hr)}>
                            <Edit size={12} className="text-foreground/60" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(hr.id)}>
                            <Trash2 size={12} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-foreground/40 text-xs">No HR profiles found matching criteria.</div>
            )}
          </CardContent>
        </Card>

        {/* HR Account Details Drawer (Dynamic Sidecard) */}
        {detailHR && (
          <Card className="border-t-4 border-t-primary shadow-sm animate-fadeIn">
            <CardHeader className="flex flex-row justify-between items-start pb-2 border-b border-surface-border">
              <div>
                <CardTitle>HR Detail File</CardTitle>
                <CardDescription>System access profile & configurations.</CardDescription>
              </div>
              <button 
                onClick={() => setDetailHR(null)} 
                className="text-foreground/40 hover:text-foreground/80 cursor-pointer text-xs"
              >
                Close
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-extrabold uppercase border border-primary/20">
                  {detailHR.firstName.slice(0, 2)}
                </div>
                <div>
                  <span className="text-sm font-extrabold text-foreground block">{detailHR.firstName} {detailHR.lastName}</span>
                  <span className="text-[10px] bg-surface-muted text-foreground/80 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{detailHR.position}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center gap-2.5 text-foreground/60">
                  <Mail size={13} className="shrink-0" />
                  <span>{detailHR.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground/60">
                  <Phone size={13} className="shrink-0" />
                  <span>{detailHR.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground/60">
                  <Building2 size={13} className="shrink-0" />
                  <span>{detailHR.department} Department</span>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/80 font-bold">System Credentials:</span>
                  <Badge variant="info">Granted</Badge>
                </div>
                <div className="bg-surface-muted p-2.5 rounded-lg border border-surface-border text-[10px] space-y-1.5">
                  <div className="flex justify-between text-foreground/60">
                    <span>Role Group:</span>
                    <span className="font-bold text-foreground">ROLE_HR</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Username Ref:</span>
                    <span className="font-mono text-foreground/80">{detailHR.user?.username || detailHR.email.split('@')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center gap-1.5" onClick={() => handleOpenEdit(detailHR)}>
                  <Edit size={12} />
                  <span>Edit details</span>
                </Button>
                <Button size="sm" variant="destructive" className="flex-1 flex items-center justify-center gap-1.5" onClick={() => handleDelete(detailHR.id)}>
                  <Trash2 size={12} />
                  <span>Terminate</span>
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
        title={editingHR ? `Edit HR Details: ${editingHR.firstName}` : "Provision HR Specialist Profile"}
        description="Fill out the profile metrics. All credentials will sync to the core user tables."
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createHRMutation.isPending || updateHRMutation.isPending}>
              {editingHR ? "Save changes" : "Provision Profile"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">First Name *</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Last Name *</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Email Address *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane.doe@nexushr.com" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase">Phone Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="555-0100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Department</label>
              <Input value={department} disabled className="bg-surface-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase">Position</label>
              <Select value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="HR Director">HR Director</option>
                <option value="HR Recruiter">HR Recruiter</option>
                <option value="HR Specialist">HR Specialist</option>
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

          {!editingHR && (
            <div className="border-t border-surface-border pt-4 space-y-4">
              <span className="text-[10px] font-extrabold text-foreground/80 block uppercase tracking-wide">System Login Credentials</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/50 uppercase">Username *</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="janedoe" />
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

    </div>
  );
};
