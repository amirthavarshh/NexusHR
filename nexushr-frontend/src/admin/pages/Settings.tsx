import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
  Button, Input, Select
} from '../../components/ui';
import { 
  Save, ShieldAlert, Globe, RefreshCw
} from 'lucide-react';

export const Settings: React.FC = () => {
  // Config state values
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxLoginRetries, setMaxLoginRetries] = useState('5');
  const [mfaRequired, setMfaRequired] = useState('false');
  
  const [timeZone, setTimeZone] = useState('UTC-5');
  const [defaultLeavesAllocated, setDefaultLeavesAllocated] = useState('25');
  const [auditLogLevel, setAuditLogLevel] = useState('INFO');

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setStatusMessage('Workspace configuration saved successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    }, 1000);
  };

  const handleClearCache = () => {
    // Clear localStorage values
    const keys = ['hrs', 'managers', 'departments', 'leaves', 'matrix', 'activities'];
    keys.forEach(k => localStorage.removeItem(`admin_${k}`));
    showToast('Admin data reset to default seed values.');
  };

  const showToast = (text: string) => {
    setStatusMessage(text);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Workspace Config Settings</h2>
        <p className="text-xs text-foreground/60">Configure global organizational variables, security policies, and reset defaults.</p>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="p-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Form settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Security configuration card */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm lg:col-span-2 space-y-4">
          <CardHeader className="pb-2 border-b border-surface-border">
            <CardTitle className="flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-amber-500" />
              <span>Enterprise Security Settings</span>
            </CardTitle>
            <CardDescription>Authentication expiration and Multi-Factor parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase">Session Expiry Timeout (Minutes)</label>
                <Input value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} type="number" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase">Maximum Failed Login Retries</label>
                <Input value={maxLoginRetries} onChange={(e) => setMaxLoginRetries(e.target.value)} type="number" />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-foreground/50 uppercase block">Enforce Multi-Factor Authentication (MFA)</label>
              <Select value={mfaRequired} onChange={(e) => setMfaRequired(e.target.value)}>
                <option value="false">MFA Optional (Default)</option>
                <option value="true">Enforce MFA for all Privileged accounts (HR, Manager, Admin)</option>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter className="mt-0">
            <Button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-1.5">
              <Save size={14} />
              <span>Save Workspace Config</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Global operational defaults card */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="pb-2 border-b border-surface-border">
              <CardTitle className="flex items-center gap-1.5">
                <Globe size={16} className="text-amber-500" />
                <span>Regional Settings</span>
              </CardTitle>
              <CardDescription>Default time zone & leaves allocation values.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase">Default Workspace Timezone</label>
                <Select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                  <option value="UTC-5">Eastern Time (US & Canada) [UTC-5]</option>
                  <option value="UTC+0">Coordinated Universal Time [UTC+0]</option>
                  <option value="UTC+5.5">India Standard Time [UTC+5:30]</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase">Default Leaves Allocation (Annual Days)</label>
                <Input value={defaultLeavesAllocated} onChange={(e) => setDefaultLeavesAllocated(e.target.value)} type="number" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase">System Audit Logging Level</label>
                <Select value={auditLogLevel} onChange={(e) => setAuditLogLevel(e.target.value)}>
                  <option value="INFO">INFO (Default - Recommended)</option>
                  <option value="WARN">WARN (Warnings only)</option>
                  <option value="DEBUG">DEBUG (Detailed tracing logs)</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Tools */}
          <Card className="border-t-4 border-t-emerald-500 shadow-sm">
            <CardHeader className="pb-2 border-b border-surface-border">
              <CardTitle className="flex items-center gap-1.5">
                <RefreshCw size={14} className="text-emerald-500" />
                <span>Maintenance Actions</span>
              </CardTitle>
              <CardDescription>Reset temporary workspace databases.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button onClick={handleClearCache} variant="destructive" className="w-full text-xs py-2 flex items-center justify-center gap-1.5">
                <span>Reset Admin Cache Data</span>
              </Button>
              <span className="text-[9px] text-foreground/50 block mt-2 text-center leading-normal">
                This will wipe out any added HR, manager, or department nodes and reload seed data.
              </span>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
