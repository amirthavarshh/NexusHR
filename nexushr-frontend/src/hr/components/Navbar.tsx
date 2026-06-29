import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hrServices } from '../api/services';
import { Sun, Moon, Bell, Search, ClipboardList } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { session, profile } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [pendingPayrolls, setPendingPayrolls] = useState(0);

  useEffect(() => {
    hrServices.getAllLeaves().then(leaves => {
      setPendingLeaves(leaves.filter(l => l.status === 'PENDING').length);
    }).catch(() => {});
    hrServices.getAllPayrolls().then(payrolls => {
      setPendingPayrolls(payrolls.filter(p => p.status === 'DRAFT').length);
    }).catch(() => {});
  }, []);

  const totalAlerts = pendingLeaves + pendingPayrolls;
  if (!session) return null;

  return (
    <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-8 shrink-0 dark:bg-slate-850 dark:border-slate-800">

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-100 w-80 dark:bg-slate-800 dark:border-slate-700">
        <Search className="text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search employees, records, payroll..."
          disabled
          className="bg-transparent border-none text-xs outline-none w-full text-slate-650 dark:text-slate-300 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-5">
        {/* KPI Badges */}
        <div className="hidden md:flex items-center gap-3">
          {pendingLeaves > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
              <ClipboardList size={11} />
              <span>{pendingLeaves} pending leaves</span>
            </div>
          )}
          {pendingPayrolls > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold">
              <span>{pendingPayrolls} unpaid payrolls</span>
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Bell size={18} />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-teal-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-3 z-50 animate-fadeIn">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">HR Alerts</span>
                  <span className="text-[9px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-extrabold dark:bg-teal-950/40 dark:text-teal-400">{totalAlerts} items</span>
                </div>
                <div className="max-h-60 overflow-y-auto pt-1">
                  {pendingLeaves > 0 && (
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 shrink-0 text-xs font-bold">{pendingLeaves}</div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Pending Leave Approvals</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{pendingLeaves} employee leave request{pendingLeaves > 1 ? 's' : ''} awaiting HR sign-off.</p>
                      </div>
                    </div>
                  )}
                  {pendingPayrolls > 0 && (
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 shrink-0 text-xs font-bold">{pendingPayrolls}</div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-white block">Draft Payroll Records</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{pendingPayrolls} payroll records in DRAFT status need processing.</p>
                      </div>
                    </div>
                  )}
                  {totalAlerts === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs">All HR operations clear. No pending alerts.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-5 dark:border-slate-800">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-855 dark:text-white block leading-none mb-0.5">
              {profile ? `${profile.firstName} ${profile.lastName}` : session.username}
            </span>
            <span className="text-[9px] font-extrabold tracking-widest text-teal-600 dark:text-teal-400 uppercase">HR OFFICER</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold border border-teal-200 uppercase text-teal-700 dark:bg-teal-950/40 dark:border-teal-900/30 dark:text-teal-400">
            {session.username.slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};
