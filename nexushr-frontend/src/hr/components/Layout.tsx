import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Toast } from '../../components/ui/Toast';

export const Layout: React.FC = () => {
  const { session, toast } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'HR') return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-teal-100 selection:text-teal-900 relative transition-colors duration-300 dark:bg-slate-900 dark:text-slate-350">
      <Toast toast={toast} />
      <div className="flex flex-1 overflow-hidden h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <main className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
