import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { managerServices } from '../api/services';
import { 
  Sun, Moon, Bell, Search, ShieldAlert 
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { session, profile } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingName, setPendingName] = useState('');

  useEffect(() => {
    // Check pending leave requests for the indicator
    managerServices.getTeamLeaves().then(leaves => {
      const pending = leaves.filter(l => l.status === 'PENDING');
      setPendingLeaveCount(pending.length);
      if (pending.length > 0) {
        setPendingName(pending[0].requesterName);
      }
    }).catch(() => {});
  }, []);

  if (!session) return null;

  return (
    <header className="h-16 border-b border-surface-border bg-surface flex items-center justify-between px-8 shrink-0 transition-colors">
      
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-surface-muted px-3.5 py-2 rounded-lg border border-surface-border w-80">
        <Search className="text-foreground/50" size={15} />
        <input 
          type="text" 
          placeholder="Search team direct reports, check-ins..." 
          disabled
          className="bg-transparent border-none text-xs outline-none w-full text-foreground placeholder:text-foreground/40"
        />
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="text-foreground/50 hover:text-foreground/80 cursor-pointer p-1.5 rounded-full hover:bg-surface-muted transition-all"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-foreground/50 hover:text-foreground/80 cursor-pointer p-1.5 rounded-full hover:bg-surface-muted transition-all"
          >
            <Bell size={18} />
            {pendingLeaveCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
                {pendingLeaveCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown card */}
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-surface border border-surface-border rounded-lg shadow-xl py-3 z-50 animate-fadeIn">
                <div className="px-4 pb-2 border-b border-surface-border flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Team Alerts</span>
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-extrabold">{pendingLeaveCount} pending</span>
                </div>
                <div className="max-h-60 overflow-y-auto pt-1">
                  {pendingLeaveCount > 0 ? (
                    <div className="p-3 hover:bg-surface-muted flex items-start gap-3 cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShieldAlert size={14} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-foreground block">Pending Team Leave Request</span>
                        <p className="text-[10px] text-foreground/60 mt-0.5">{pendingName} submitted a leave request. Awaiting your approval.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-foreground/40 text-xs font-medium">All team records clear. No alerts.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 border-l border-surface-border pl-6">
          <div className="text-right">
            <span className="text-xs font-bold text-foreground block leading-none mb-0.5">
              {profile ? `${profile.firstName} ${profile.lastName}` : session.username}
            </span>
            <span className="text-[9px] font-extrabold tracking-widest text-primary uppercase">
              {session.role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold border border-surface-border uppercase text-foreground">
            {session.username.slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};
