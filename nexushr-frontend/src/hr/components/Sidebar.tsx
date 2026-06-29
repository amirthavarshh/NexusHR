import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarClock,
  CreditCard, Star, Target, BrainCircuit,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Tooltip } from '../../components/ui';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const links = [
  { name: 'Dashboard',           to: '/hr/dashboard',    icon: LayoutDashboard },
  { name: 'Employees',           to: '/hr/employees',    icon: Users },
  { name: 'Leave Center',        to: '/hr/leaves',       icon: CalendarCheck },
  { name: 'Attendance',          to: '/hr/attendance',   icon: CalendarClock },
  { name: 'Payroll Center',      to: '/hr/payroll',      icon: CreditCard },
  { name: 'Performance Reviews', to: '/hr/reviews',      icon: Star },
  { name: 'Goals Admin',         to: '/hr/goals',        icon: Target },
  { name: 'AI Insights',         to: '/hr/ai-insights',  icon: BrainCircuit },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = 'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ';
    return isActive
      ? base + 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40'
      : base + 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800';
  };

  return (
    <aside className={`border-r border-slate-100 bg-white p-5 flex flex-col shrink-0 dark:bg-slate-850 dark:border-slate-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>

      {/* Brand Header */}
      <div className={`flex items-center gap-3 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/25 shrink-0">
          H
        </div>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-sm font-bold tracking-tight text-slate-850 dark:text-white leading-none flex items-center gap-1.5">
              <span>NexusHR</span>
              <span className="bg-teal-100 text-teal-700 text-[8px] font-extrabold px-1 py-0.5 rounded dark:bg-teal-950/40 dark:text-teal-400">HR</span>
            </h1>
            <span className="text-[10px] font-semibold text-slate-400">People Operations</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {links.map(link => {
          const Icon = link.icon;
          const content = (
            <NavLink to={link.to} className={getLinkClass}>
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="animate-fadeIn">{link.name}</span>}
            </NavLink>
          );
          return collapsed ? (
            <Tooltip key={link.name} content={link.name}>{content}</Tooltip>
          ) : (
            <div key={link.name}>{content}</div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="animate-fadeIn">Collapse Menu</span>}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 cursor-pointer"
        >
          <LogOut size={16} />
          {!collapsed && <span className="animate-fadeIn">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
