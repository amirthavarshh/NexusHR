import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const { session } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Protect Admin Route: Redirection if session is missing or user is not ADMIN
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-700 font-sans selection:bg-amber-100 selection:text-amber-900 relative transition-colors duration-300 dark:bg-slate-900 dark:text-slate-350">
      
      {/* Main outer shell */}
      <div className="flex flex-1 overflow-hidden h-screen">
        
        {/* Left Side Navigation */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Content Panel Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Navbar */}
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

          {/* Child routes content scroll view */}
          <main className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
            <Outlet />
          </main>

        </div>

      </div>
    </div>
  );
};
