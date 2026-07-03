import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`bg-surface border border-surface-border rounded-lg shadow-card p-6 ${className}`} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`flex flex-col gap-1.5 mb-4 ${className}`} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h3 className={`text-base font-bold text-foreground ${className}`} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
  <p className={`text-xs text-foreground opacity-70 font-medium ${className}`} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`${className}`} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-surface-border flex items-center justify-end gap-3 ${className}`} {...props} />
);
