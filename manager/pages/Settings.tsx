import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
  Button, Input, Select
} from '../../components/ui';
import { 
  Save, ShieldAlert, Globe, RefreshCw
} from 'lucide-react';

export const Settings: React.FC = () => {
  // Config states
  const [timeZone, setTimeZone] = useState('UTC-5');
  const [lateThreshold, setLateThreshold] = useState('15');
  const [notifyOnLeaveRequest, setNotifyOnLeaveRequest] = useState('true');
  const [notifyOnLateClockIn, setNotifyOnLateClockIn] = useState('true');

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Manager team preferences saved!');
    }, 800);
  };

  const handleClearCache = () => {
    const keys = ['direct_reports', 'attendance', 'leaves', 'goals', 'reviews', 'activities'];
    keys.forEach(k => localStorage.removeItem(`manager_${k}`));
    showToast('Manager cache reset to default seeds.');
  };

  const showToast = (text: string) => {
    setStatusMessage(text);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Team Configuration Settings</h2>
        <p className="text-xs text-foreground/60">Configure regional team parameters, notifications thresholds, and alert states.</p>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="p-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-705 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Form settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts card */}
        <Card className="border-t-4 border-t-amber-500 shadow-sm lg:col-span-2 space-y-4">
          <CardHeader className="pb-2 border-b border-surface-border">
            <CardTitle className="flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-amber-500" />
              <span>Team Notifications Settings</span>
            </CardTitle>
            <CardDescription>Establish automatic email/system alerts states triggers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase block">Notify on Direct Report Leave Request</label>
                <Select value={notifyOnLeaveRequest} onChange={(e) => setNotifyOnLeaveRequest(e.target.value)}>
                  <option value="true">Enable notifications immediately</option>
                  <option value="false">Disable alerts</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase block">Notify on Employee Late Clock-In</label>
                <Select value={notifyOnLateClockIn} onChange={(e) => setNotifyOnLateClockIn(e.target.value)}>
                  <option value="true">Enable late notifications</option>
                  <option value="false">Disable alerts</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold text-foreground/50 uppercase block">Late Entry Threshold limit (Minutes)</label>
              <Input type="number" value={lateThreshold} onChange={(e) => setLateThreshold(e.target.value)} placeholder="15" />
              <span className="text-[9px] text-foreground/40 block mt-1">Check-ins after the baseline shift entry plus this offset trigger late tags.</span>
            </div>
          </CardContent>
          <CardFooter className="mt-0 border-t border-surface-border pt-4">
            <Button onClick={handleSaveSettings} disabled={saving}>
              <Save size={14} />
              <span>Save Team Preferences</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Regional & maintenance card */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-indigo-500 shadow-sm">
            <CardHeader className="pb-2 border-b border-surface-border">
              <CardTitle className="flex items-center gap-1.5">
                <Globe size={16} className="text-indigo-500" />
                <span>Timezone Settings</span>
              </CardTitle>
              <CardDescription>Time parameters defaults.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase">Team timezone</label>
                <Select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                  <option value="UTC-5">Eastern Time (US & Canada) [UTC-5]</option>
                  <option value="UTC+0">Coordinated Universal Time [UTC+0]</option>
                  <option value="UTC+5.5">India Standard Time [UTC+5:30]</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-destructive shadow-sm">
            <CardHeader className="pb-2 border-b border-surface-border">
              <CardTitle className="flex items-center gap-1.5">
                <RefreshCw size={14} className="text-destructive" />
                <span>Maintenance Actions</span>
              </CardTitle>
              <CardDescription>Reset temporary team databases.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button onClick={handleClearCache} variant="destructive" className="w-full text-xs py-2">
                <span>Reset Team Cache Data</span>
              </Button>
              <span className="text-[9px] text-foreground/40 block mt-2 text-center leading-normal">
                This will wipe out any modified goals or reviews and restore default seed profiles.
              </span>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
