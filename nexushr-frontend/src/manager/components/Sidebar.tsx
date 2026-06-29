import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users2, CalendarClock, CalendarDays, 
  Target, Award, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Tooltip } from '../../admin/components/ui';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard', to: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'My Team Roster', to: '/manager/roster', icon: Users2 },
    { name: 'Attendance Tracker', to: '/manager/attendance', icon: CalendarClock },
    { name: 'Leaves Approvals', to: '/manager/leaves', icon: CalendarDays },
    { name: 'Goals Tracker', to: '/manager/goals', icon: Target },
    { name: 'Performance Reviews', to: '/manager/reviews', icon: Award },
    { name: 'Settings', to: '/manager/settings', icon: Settings },
  ];

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = "flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-all duration-200 cursor-pointer ";
    return isActive 
      ? base + "sidebar-item-active text-amber-700 dark:text-amber-500" 
      : base + "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800";
  };

  return (
    <aside className={`border-r border-slate-100 bg-white p-5 flex flex-col shrink-0 dark:bg-slate-850 dark:border-slate-800 transition-all duration-300 relative ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Brand Header */}
      <div className={`flex items-center gap-3 mb-8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/25 shrink-0">
          M
        </div>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-sm font-bold tracking-tight text-slate-855 dark:text-white leading-none flex items-center gap-1.5">
              <span>NexusHR</span>
              <span className="bg-indigo-100 text-indigo-750 text-[8px] font-extrabold px-1 py-0.5 rounded dark:bg-indigo-950/40 dark:text-indigo-400">MGR</span>
            </h1>
            <span className="text-[10px] font-semibold text-slate-400">Team Commander</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
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

      {/* Sidebar Footer */}
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-955/20 cursor-pointer"
        >
          <LogOut size={16} />
          {!collapsed && <span className="animate-fadeIn">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
