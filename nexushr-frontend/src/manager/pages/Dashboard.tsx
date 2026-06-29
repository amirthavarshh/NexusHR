import React from 'react';
import { useTeamMetrics, useTeamActivities } from '../hooks/useManagerQuery';
import { 
  Users, Clock, Activity, CalendarDays, Target
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '../../admin/components/ui';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: isMetricsLoading } = useTeamMetrics();
  const { data: activities = [], isLoading: isActivitiesLoading } = useTeamActivities();

  // Weekly attendance rate chart data
  const attendanceData = [
    { day: 'Mon', rate: 94 },
    { day: 'Tue', rate: 96 },
    { day: 'Wed', rate: 98 },
    { day: 'Thu', rate: 95 },
    { day: 'Fri', rate: 97 }
  ];

  // Team status distribution data
  const statusData = [
    { name: 'Active', value: 4 },
    { name: 'On Leave', value: 1 }
  ];

  const COLORS = ['#10B981', '#F59E0B'];

  const kpis = [
    { name: 'Direct Reports', value: metrics?.totalDirectReports, icon: Users, color: 'text-indigo-500', bg: 'kpi-green' },
    { name: 'Attendance Today', value: `${metrics?.attendanceToday}%`, icon: Clock, color: 'text-emerald-500', bg: 'kpi-green' },
    { name: 'Pending Leaves', value: metrics?.pendingLeaveRequests, icon: CalendarDays, color: 'text-rose-500', bg: 'kpi-amber' },
    { name: 'Active Goals', value: metrics?.activeGoalsCount, icon: Target, color: 'text-purple-500', bg: 'kpi-amber' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Team Overview Dashboard</h2>
        <p className="text-xs text-slate-500">Monitor direct reports, track daily attendance, and approve leave requests.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className={kpi.bg}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{kpi.name}</span>
                <Icon size={16} className={kpi.color} />
              </div>
              <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-4 block leading-none">
                {isMetricsLoading ? '...' : kpi.value}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Area Chart */}
        <Card className="lg:col-span-2 accent-border-mint">
          <CardHeader>
            <CardTitle>Team Attendance Rate Trends</CardTitle>
            <CardDescription>Daily present ratio percentage timeline over this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[80, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" name="Present Ratio %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="accent-border-lavender flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Team Availability</CardTitle>
            <CardDescription>Direct reports active availability status share.</CardDescription>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 pl-4">
              {statusData.map((s, idx) => (
                <div key={s.name} className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-slate-500">{s.name}</span>
                  </div>
                  <span className="text-slate-800 dark:text-white font-mono">{s.value} members</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Activity logs feed */}
      <Card className="accent-border-mint">
        <CardHeader>
          <CardTitle>Recent Team Activities</CardTitle>
          <CardDescription>Real-time audit log of team checks, approvals, and goal assignments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {isActivitiesLoading ? (
            <div className="text-center py-6 text-slate-400 text-xs">Loading activity logs...</div>
          ) : activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs items-start bg-slate-50/50 p-2.5 rounded border border-slate-100 dark:bg-slate-800/10 dark:border-slate-800 animate-fadeIn">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800 shrink-0">
                  <Activity size={12} className="text-slate-400" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] text-slate-700 font-bold dark:text-slate-350 leading-tight">{act.description}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">By: {act.operator}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">No team activities logged today.</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
