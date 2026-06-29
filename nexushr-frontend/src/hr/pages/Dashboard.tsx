import React from 'react';
import { useHrMetrics, useHrActivities } from '../hooks/useHrQuery';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '../../admin/components/ui';
import {
  Users, DollarSign, CalendarCheck, TrendingUp, Activity,
  UserCheck, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const DEPT_COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const weeklyHeadcount = [
  { week: 'W1 May', active: 42, onLeave: 3 },
  { week: 'W2 May', active: 44, onLeave: 2 },
  { week: 'W3 May', active: 43, onLeave: 4 },
  { week: 'W4 May', active: 45, onLeave: 2 },
  { week: 'W1 Jun', active: 46, onLeave: 3 },
  { week: 'W2 Jun', active: 47, onLeave: 1 },
  { week: 'W3 Jun', active: 46, onLeave: 2 },
  { week: 'W4 Jun', active: 48, onLeave: 2 },
];

const leaveBarData = [
  { month: 'Mar', ANNUAL: 8, SICK: 4, UNPAID: 1 },
  { month: 'Apr', ANNUAL: 10, SICK: 6, UNPAID: 2 },
  { month: 'May', ANNUAL: 12, SICK: 3, UNPAID: 1 },
  { month: 'Jun', ANNUAL: 7, SICK: 5, UNPAID: 3 },
];

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading } = useHrMetrics();
  const { data: activities = [] } = useHrActivities();

  const deptPieData = metrics
    ? Object.entries(metrics.departmentDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const kpis = metrics ? [
    { label: 'Total Employees', value: metrics.totalEmployees, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-100 dark:border-teal-900/30' },
    { label: 'Active Staff', value: metrics.activeEmployees, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30' },
    { label: 'On Leave Today', value: metrics.onLeaveCount, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-900/30' },
    { label: 'Pending Leaves', value: metrics.pendingLeaves, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-100 dark:border-rose-900/30' },
    { label: 'Avg Salary', value: `$${metrics.averageSalary.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-100 dark:border-indigo-900/30' },
    { label: 'Avg Performance', value: `${metrics.averagePerformance}/5`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-100 dark:border-purple-900/30' },
  ] : [];

  const activityIcon: Record<string, string> = {
    HIRE: '👤', TERMINATE: '⛔', LEAVE_ACTION: '📅', PAYROLL_RUN: '💰', REVIEW: '⭐', GOAL: '🎯'
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">HR Operations Dashboard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Workforce overview, leave utilisation, payroll health, and people analytics.</p>
      </div>

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className={`${kpi.bg} border ${kpi.border} p-4 flex flex-col gap-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{kpi.label}</span>
                  <Icon size={16} className={kpi.color} />
                </div>
                <span className="text-2xl font-extrabold text-slate-855 dark:text-white leading-none">{kpi.value}</span>
              </Card>
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Headcount Area Chart */}
        <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Weekly Active Headcount</CardTitle>
            <CardDescription>Active staff vs on-leave count over the past 8 weeks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyHeadcount}>
                <defs>
                  <linearGradient id="hrActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hrLeave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="active" stroke="#14b8a6" strokeWidth={2} fill="url(#hrActive)" name="Active" />
                <Area type="monotone" dataKey="onLeave" stroke="#f59e0b" strokeWidth={2} fill="url(#hrLeave)" name="On Leave" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dept Distribution PieChart */}
        <Card className="border border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employee count per department.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                  {deptPieData.map((_, idx) => (
                    <Cell key={idx} fill={DEPT_COLORS[idx % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-1 justify-center">
              {deptPieData.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: DEPT_COLORS[idx % DEPT_COLORS.length] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Breakdown + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Leave Type BarChart */}
        <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Monthly Leave Type Breakdown</CardTitle>
            <CardDescription>Annual, sick and unpaid leave requests per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leaveBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="ANNUAL" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Annual" />
                <Bar dataKey="SICK" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Sick" />
                <Bar dataKey="UNPAID" fill="#ef4444" radius={[4, 4, 0, 0]} name="Unpaid" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities Feed */}
        <Card className="border border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={14} className="text-teal-500" />
              <span>Recent HR Activity</span>
            </CardTitle>
            <CardDescription>Latest actions logged in the HR system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.slice(0, 5).map(act => (
              <div key={act.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0">
                  {activityIcon[act.type] || '📌'}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug">{act.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
