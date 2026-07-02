import React, { createContext, useContext, useState } from 'react';

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

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (v: string) => void;
} | null>(null);

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  children, 
  activeTabState,
  className = '' 
}) => {
  const localState = useState(defaultValue);
  const [activeTab, setActiveTab] = activeTabState || localState;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`space-y-4 ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex border-b border-surface-border gap-6 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  activeTab: propActiveTab, 
  setActiveTab: propSetActiveTab, 
  children,
  className = '' 
}) => {
  const ctx = useContext(TabsContext);
  const activeTab = propActiveTab ?? ctx?.activeTab;
  const setActiveTab = propSetActiveTab ?? ctx?.setActiveTab;
  
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
  activeTab: propActiveTab, 
  children,
  className = '' 
}) => {
  const ctx = useContext(TabsContext);
  const activeTab = propActiveTab ?? ctx?.activeTab;
  
  if (activeTab !== value) return null;
  return <div className={`animate-fadeIn ${className}`}>{children}</div>;
};
