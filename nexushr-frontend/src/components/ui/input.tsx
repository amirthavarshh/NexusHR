import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input 
      ref={ref}
      className={`w-full px-3 py-2 text-xs rounded border border-surface-border bg-surface text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select 
      ref={ref}
      className={`w-full px-3 py-2 text-xs rounded border border-surface-border bg-surface text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
