import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Calendar, Clock, DollarSign, LayoutDashboard, 
  Target, BarChart3, LogOut, Menu, X, Bell
} from 'lucide-react';
import { Button } from './ui';

export const AppShell: React.FC = () => {
  const { session, logout, profile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    const items = [
      { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/attendance', label: 'Attendance', icon: Clock },
      { path: '/leaves', label: 'Time Off', icon: Calendar },
      { path: '/payroll', label: 'Payroll', icon: DollarSign },
      { path: '/goals', label: 'Goals', icon: Target },
      { path: '/team', label: 'Directory', icon: Users },
    ];
    if (session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR') {
      items.push({ path: '/reports', label: 'Reports', icon: BarChart3 });
    }
    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex">
      <div className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-surface-border shadow-card hidden lg:flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
            N
          </div>
          <span className="text-lg font-bold font-display tracking-tight">NexusHR</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground/70 hover:bg-surface-muted hover:text-foreground'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-xs">
              {session?.username?.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.firstName ? `${profile.firstName} ${profile.lastName}` : session?.username}</p>
              <p className="text-[10px] text-foreground/50 uppercase font-semibold tracking-wider truncate">{session?.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-xs" onClick={logout}>
            <LogOut size={14} className="mr-2" /> Sign Out
          </Button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-y-0 left-0 w-64 bg-surface p-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold font-display">NexusHR</span>
              <button onClick={() => setMobileMenuOpen(false)}><X size={20}/></button>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground/70'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <header className="h-16 bg-surface border-b border-surface-border flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-md text-foreground/70 hover:bg-surface-muted">
              <Menu size={20} />
            </button>
            <div className="font-bold font-display text-lg tracking-tight">NexusHR</div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <h1 className="text-sm font-semibold text-foreground/70 uppercase tracking-widest">
              {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Workspace'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-foreground/50 hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
