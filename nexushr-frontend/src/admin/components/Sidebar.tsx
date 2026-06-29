import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, UserCheck, Users2, Network, Contact, 
  CalendarClock, CreditCard, CalendarDays, PieChart, ShieldAlert, 
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Tooltip } from '../../components/ui';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'HR Management', to: '/admin/hr', icon: UserCheck },
    { name: 'Manager Management', to: '/admin/managers', icon: Users2 },
    { name: 'Department Management', to: '/admin/departments', icon: Network },
    { name: 'Employee Management', to: '/admin/employees', icon: Contact },
    { name: 'Attendance Overview', to: '/admin/attendance', icon: CalendarClock },
    { name: 'Payroll Overview', to: '/admin/payroll', icon: CreditCard },
    { name: 'Leave Management', to: '/admin/leaves', icon: CalendarDays },
    { name: 'Analytics', to: '/admin/analytics', icon: PieChart },
    { name: 'Roles & Permissions', to: '/admin/roles-permissions', icon: ShieldAlert },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ";
    return isActive 
      ? base + "bg-primary/10 text-primary" 
      : base + "text-foreground/60 hover:bg-surface-muted hover:text-foreground";
  };

  return (
    <aside className={`border-r border-surface-border bg-surface p-5 flex flex-col shrink-0 transition-all duration-300 relative ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Brand Header */}
      <div className={`flex items-center gap-3 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-primary-foreground font-bold shadow-md shrink-0">
          A
        </div>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-sm font-bold tracking-tight text-foreground leading-none flex items-center gap-1.5">
              <span>NexusHR</span>
              <span className="bg-primary/20 text-primary text-[8px] font-extrabold px-1 py-0.5 rounded">ADMIN</span>
            </h1>
            <span className="text-[10px] font-semibold text-foreground/50">System Controller</span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto max-h-[70vh] pr-1">
        {links.map((link) => {
          const Icon = link.icon;
          const content = (
            <NavLink to={link.to} className={getLinkClass}>
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="animate-fadeIn">{link.name}</span>}
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={link.name} content={link.name}>
              {content}
            </Tooltip>
          ) : (
            <div key={link.name}>{content}</div>
          );
        })}
      </nav>

      {/* Sidebar footer collapse & logout */}
      <div className="mt-auto pt-4 border-t border-surface-border space-y-1">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-foreground/60 hover:bg-surface-muted hover:text-foreground cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="animate-fadeIn">Collapse Menu</span>}
        </button>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <LogOut size={16} />
          {!collapsed && <span className="animate-fadeIn">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
