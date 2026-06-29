import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-surface border border-surface-border rounded-lg shadow-card overflow-hidden w-full max-w-lg z-10 p-6 flex flex-col gap-4 animate-fadeIn">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-foreground leading-tight">{title}</h3>
            {description && <p className="text-xs text-foreground opacity-70 font-medium mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="text-foreground opacity-50 hover:opacity-100 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="my-2 max-h-[60vh] overflow-y-auto pr-1">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 pt-2 border-t border-surface-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
