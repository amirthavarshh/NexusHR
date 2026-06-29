import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
  Button, Input, Select
} from '../../admin/components/ui';
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
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Team Configuration Settings</h2>
        <p className="text-xs text-slate-500">Configure regional team parameters, notifications thresholds, and alert states.</p>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="p-3 rounded text-xs font-bold bg-emerald-50 text-emerald-705 border border-emerald-205 dark:bg-emerald-950/20 dark:text-emerald-400 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Form settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts card */}
        <Card className="accent-border-mint lg:col-span-2 space-y-4">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-amber-705" />
              <span>Team Notifications Settings</span>
            </CardTitle>
            <CardDescription>Establish automatic email/system alerts states triggers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Notify on Direct Report Leave Request</label>
                <Select value={notifyOnLeaveRequest} onChange={(e) => setNotifyOnLeaveRequest(e.target.value)}>
                  <option value="true">Enable notifications immediately</option>
                  <option value="false">Disable alerts</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Notify on Employee Late Clock-In</label>
                <Select value={notifyOnLateClockIn} onChange={(e) => setNotifyOnLateClockIn(e.target.value)}>
                  <option value="true">Enable late notifications</option>
                  <option value="false">Disable alerts</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">Late Entry Threshold limit (Minutes)</label>
              <Input type="number" value={lateThreshold} onChange={(e) => setLateThreshold(e.target.value)} placeholder="15" />
              <span className="text-[9px] text-slate-400 block mt-1">Check-ins after the baseline shift entry plus this offset trigger late tags.</span>
            </div>
          </CardContent>
          <CardFooter className="mt-0">
            <Button onClick={handleSaveSettings} loading={saving}>
              <Save size={14} />
              <span>Save Team Preferences</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Regional & maintenance card */}
        <div className="space-y-6">
          <Card className="accent-border-lavender">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-1.5">
                <Globe size={16} className="text-amber-700" />
                <span>Timezone Settings</span>
              </CardTitle>
              <CardDescription>Time parameters defaults.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Team timezone</label>
                <Select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                  <option value="UTC-5">Eastern Time (US & Canada) [UTC-5]</option>
                  <option value="UTC+0">Coordinated Universal Time [UTC+0]</option>
                  <option value="UTC+5.5">India Standard Time [UTC+5:30]</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="accent-border-mint">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-1.5">
                <RefreshCw size={14} className="text-emerald-500" />
                <span>Maintenance Actions</span>
              </CardTitle>
              <CardDescription>Reset temporary team databases.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button onClick={handleClearCache} variant="destructive" className="w-full text-xs py-2">
                <span>Reset Team Cache Data</span>
              </Button>
              <span className="text-[9px] text-slate-400 block mt-2 text-center leading-normal">
                This will wipe out any modified goals or reviews and restore default seed profiles.
              </span>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
