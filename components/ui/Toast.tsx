import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' } | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 border ${
      toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/80 dark:border-red-900 dark:text-red-300' : 'bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-300'
    } animate-fadeIn`}>
      {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
      <span className="text-sm font-semibold">{toast.message}</span>
    </div>
  );
};
