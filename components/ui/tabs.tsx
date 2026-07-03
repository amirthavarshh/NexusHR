import React from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  activeTabState?: [string, (v: string) => void];
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (v: string) => void;
}

interface TabsTriggerProps {
  value: string;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  activeTab?: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  children, 
  activeTabState,
  className = '' 
}) => {
  const localState = React.useState(defaultValue);
  const [activeTab, setActiveTab] = activeTabState || localState;

  return (
    <div className={`space-y-4 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  activeTab, 
  setActiveTab,
  className = '' 
}) => (
  <div className={`flex border-b border-surface-border gap-6 ${className}`}>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeTab, setActiveTab } as any);
      }
      return child;
    })}
  </div>
);

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  activeTab, 
  setActiveTab, 
  children,
  className = '' 
}) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`pb-2.5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
        isActive 
          ? 'border-primary text-primary' 
          : 'border-transparent text-foreground opacity-50 hover:opacity-100'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  activeTab, 
  children,
  className = '' 
}) => {
  if (activeTab !== value) return null;
  return <div className={`animate-fadeIn ${className}`}>{children}</div>;
};
