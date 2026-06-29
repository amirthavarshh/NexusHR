import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Sparkles } from 'lucide-react';
import { EmployeeDetailDrawer } from './EmployeeDetailDrawer';
import { Dialog as Modal, Card, Button, Input, Badge } from '../../components/ui';

export const TeamDirectoryPage: React.FC = () => {
  const { showToast, setupDepts } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Employee details drawer
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // New Employee Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState(setupDepts[0] || 'Engineering');
  const [pos, setPos] = useState('');
  const [salary, setSalary] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

  // Profile Edit modal state inside directory
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPos, setEditPos] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editEmpId, setEditEmpId] = useState<number | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: api.getAllEmployees
  });

  const registerEmployeeMut = useMutation({
    mutationFn: (payload: any) => api.createProfile(payload, usernameInput || undefined),
    onSuccess: () => {
      showToast(`Profile card registered and linked to ${usernameInput} successfully!`);
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPos('');
      setSalary('');
      setUsernameInput('');
      
      // Auto complete onboarding step 5: "Add First Employee"
      const savedSteps = localStorage.getItem('onboardingCompletedSteps');
      const steps = savedSteps ? JSON.parse(savedSteps) : [];
      if (!steps.includes(5)) {
        steps.push(5);
        localStorage.setItem('onboardingCompletedSteps', JSON.stringify(steps));
      }
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => showToast(err.message || 'Failed to establish profile', 'error')
  });

  const updateProfileMut = useMutation({
    mutationFn: (payload: any) => api.updateProfile(editEmpId!, payload),
    onSuccess: (updated) => {
      showToast('Profile updated successfully!');
      if (selectedEmp && selectedEmp.id === editEmpId) {
        setSelectedEmp(updated);
      }
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => showToast(err.message || 'Failed to update profile', 'error')
  });

  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    registerEmployeeMut.mutate({
      firstName,
      lastName,
      email,
      phone,
      department: dept,
      position: pos,
      salary: parseFloat(salary)
    });
  };

  const startEditProfile = (emp: any) => {
    setEditEmpId(emp.id);
    setEditFirstName(emp.firstName || '');
    setEditLastName(emp.lastName || '');
    setEditEmail(emp.email || '');
    setEditPhone(emp.phone || '');
    setEditDept(emp.department || '');
    setEditPos(emp.position || '');
    setEditSalary(emp.salary ? emp.salary.toString() : '');
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmpId) return;
    updateProfileMut.mutate({
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      phone: editPhone,
      department: editDept,
      position: editPos,
      salary: parseFloat(editSalary)
    });
  };

  // Filter
  const filteredEmployees = employees.filter((emp: any) => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                          emp.department.toLowerCase().includes(search.toLowerCase()) ||
                          emp.position.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Team Directory</h2>
          <p className="text-sm text-foreground/60">Register new employees, log formal reviews, and access details.</p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-3 gap-4 animate-fadeIn">
        <Card className="p-4 text-center border-t-4 border-t-amber-500 shadow-sm">
          <span className="text-[10px] text-foreground/50 uppercase block mb-1 font-bold">Total Employees</span>
          <span className="text-xl font-extrabold text-foreground">{employees.length}</span>
        </Card>
        <Card className="p-4 text-center border-t-4 border-t-emerald-500 shadow-sm">
          <span className="text-[10px] text-foreground/50 uppercase block mb-1 font-bold">Active Employees</span>
          <span className="text-xl font-extrabold text-foreground">
            {employees.filter((e: any) => e.status === 'ACTIVE').length}
          </span>
        </Card>
        <Card className="p-4 text-center border-t-4 border-t-amber-500 shadow-sm">
          <span className="text-[10px] text-foreground/50 uppercase block mb-1 font-bold">Departments</span>
          <span className="text-xl font-extrabold text-foreground">
            {new Set(employees.map((e: any) => e.department)).size}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Register Employee Form */}
        <Card className="p-6 h-fit border-t-4 border-t-primary shadow-sm animate-fadeIn">
          <h3 className="text-lg font-bold text-foreground mb-4">Register Employee Profile</h3>
          <p className="text-xs text-foreground/60 mb-4 font-medium">Create profile cards linked to unique workspace users.</p>
          
          <form onSubmit={handleRegisterEmployee} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="text" required placeholder="First Name" value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input 
                type="text" required placeholder="Last Name" value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Input 
              type="email" required placeholder="Work Email" value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              type="tel" placeholder="Phone Number" value={phone} 
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={dept} onChange={(e) => setDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground"
              >
                {setupDepts.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
              <Input 
                type="text" required placeholder="Position" value={pos} 
                onChange={(e) => setPos(e.target.value)}
              />
            </div>
            <Input 
              type="number" required placeholder="Monthly Salary ($)" value={salary} 
              onChange={(e) => setSalary(e.target.value)}
            />
            <div className="pt-2">
              <label className="block text-[10px] text-amber-500 font-bold mb-1 uppercase tracking-wider">Link Account Username</label>
              <Input 
                type="text" placeholder="Login username to bind" value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>

            <Button 
              type="submit"
              disabled={registerEmployeeMut.isPending}
              className="w-full"
            >
              Bind and Create Profile
            </Button>
          </form>
        </Card>

        {/* Directory Listings Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-t-4 border-t-orange-400 shadow-sm animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-foreground">Directory</h3>
              <div className="flex gap-2 items-center">
                {/* Search query input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-foreground/50">
                    <Search size={12} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, position..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 rounded-md border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground w-48"
                  />
                </div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2 py-1.5 rounded-md border border-surface-border text-xs focus:outline-none bg-surface-muted text-foreground font-semibold"
                >
                  <option value="ALL">All Depts</option>
                  {setupDepts.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredEmployees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredEmployees.map((emp: any) => (
                  <div 
                    key={emp.id} 
                    onClick={() => setSelectedEmp(emp)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                      selectedEmp?.id === emp.id 
                        ? 'bg-primary/10 border-primary shadow-sm' 
                        : 'bg-surface border-surface-border hover:border-foreground/20'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{emp.firstName} {emp.lastName}</h4>
                      <span className="text-[10px] text-foreground/60 block">{emp.position}</span>
                      <span className="text-[9px] font-mono text-foreground/50 uppercase tracking-widest mt-1 block font-semibold">{emp.department}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant="warning" className="gap-1 justify-end">
                        <Sparkles size={10} />
                        <span className="text-[10px]">{emp.performanceRating?.toFixed(1) || '3.0'}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/50 text-sm">No employees matched your criteria.</div>
            )}
          </Card>
        </div>

      </div>

      {/* Selected Employee details panel drawer */}
      {selectedEmp && (
        <EmployeeDetailDrawer 
          employee={selectedEmp}
          onClose={() => setSelectedEmp(null)}
          onEditProfile={() => startEditProfile(selectedEmp)}
        />
      )}

      {/* Edit Profile Modal inside Directory */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">First Name *</label>
              <Input type="text" required value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Last Name *</label>
              <Input type="text" required value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Email Address *</label>
              <Input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Phone Number</label>
              <Input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Department *</label>
              <select 
                value={editDept} onChange={(e) => setEditDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none bg-surface-muted text-foreground"
              >
                {setupDepts.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 mb-1">Position / Title *</label>
              <Input type="text" required value={editPos} onChange={(e) => setEditPos(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/50 mb-1">Basic Salary ($ / month) *</label>
            <Input type="number" required min="0" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
          </div>
          <Button 
            type="submit" 
            disabled={updateProfileMut.isPending}
            className="w-full flex items-center justify-center gap-1.5"
          >
            {updateProfileMut.isPending ? 'Saving...' : '✓ Save Changes'}
          </Button>
        </form>
      </Modal>

    </div>
  );
};
