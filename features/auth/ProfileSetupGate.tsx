import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useMutation } from '@tanstack/react-query';
import { BrainCircuit, Check } from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { Card, Button, Input } from '../../components/ui';

export const ProfileSetupGate: React.FC = () => {
  const { session, setSession, setProfile, logout, toast, showToast } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [pos, setPos] = useState('');
  const [salary, setSalary] = useState('');

  const setupProfileMut = useMutation({
    mutationFn: (payload: any) => api.createProfile(payload),
    onSuccess: (newEmp) => {
      localStorage.setItem('employeeId', newEmp.id.toString());
      setSession({
        ...session!,
        employeeId: newEmp.id
      });
      setProfile(newEmp);
      showToast('Profile card generated successfully!');
      
      // Auto complete onboarding step 5: "Add First Employee" (since self-profile is created)
      const savedSteps = localStorage.getItem('onboardingCompletedSteps');
      const steps = savedSteps ? JSON.parse(savedSteps) : [];
      if (!steps.includes(5)) {
        steps.push(5);
        localStorage.setItem('onboardingCompletedSteps', JSON.stringify(steps));
      }
      
      navigate('/dashboard');
    },
    onError: (err: any) => showToast(err.message || 'Failed to establish profile', 'error')
  });

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If the user already has a profile linked, skip setup
  if (session.employeeId !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setupProfileMut.mutate({
      firstName,
      lastName,
      email,
      phone,
      department: dept,
      position: pos,
      salary: parseFloat(salary)
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background font-sans relative overflow-hidden">
      <Toast toast={toast} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-xl relative z-10">
        <Card className="p-8 shadow-2xl space-y-6">
          
          <div className="text-center">
            <BrainCircuit className="text-primary mx-auto mb-2 animate-pulse" size={36} />
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">Create Your Profile Card</h2>
            <p className="text-xs text-foreground/60 mt-1">Provide your employee details to activate your HRMS session.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">First Name *</label>
                <Input 
                  type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Last Name *</label>
                <Input 
                  type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Email Address *</label>
                <Input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Phone Number</label>
                <Input 
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Department *</label>
                <Input 
                  type="text" required value={dept} onChange={(e) => setDept(e.target.value)}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Job Title / Position *</label>
                <Input 
                  type="text" required value={pos} onChange={(e) => setPos(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Basic Salary ($ / month) *</label>
              <Input 
                type="number" required min="0" value={salary} onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-surface-border">
              <Button 
                type="button" 
                onClick={logout}
                variant="outline"
              >
                Sign Out
              </Button>
              <Button 
                type="submit" 
                disabled={setupProfileMut.isPending}
                className="flex items-center gap-1.5"
              >
                <Check size={14} />
                {setupProfileMut.isPending ? 'Creating...' : 'Establish Profile'}
              </Button>
            </div>
          </form>

        </Card>
      </div>
    </div>
  );
};
