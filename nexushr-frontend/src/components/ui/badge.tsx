import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide';
  
  const variants = {
    default: 'bg-primary/20 text-primary',
    secondary: 'bg-surface-muted text-foreground',
    destructive: 'bg-destructive/20 text-destructive',
    outline: 'border border-surface-border text-foreground',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    info: 'bg-sky-500/20 text-sky-600'
  };

  return <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
};
