import React from 'react';
import { 
  useAdminDashboardMetrics, useRecentActivities 
} from '../hooks/useAdminQuery';
import { 
  Users, UserCheck, Users2, Network, Clock, CalendarDays, 
  CreditCard, Activity, UserPlus, FileCheck, Trash2
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '../../components/ui';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: isMetricsLoading } = useAdminDashboardMetrics();
  const { data: activities, isLoading: isActivitiesLoading } = useRecentActivities();

  // Mock data for charts
  const employeeGrowthData = [
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 21 },
    { month: 'Mar', count: 24 },
    { month: 'Apr', count: 27 },
    { month: 'May', count: 30 },
    { month: 'Jun', count: 32 }
  ];

  const deptDistributionData = [
    { name: 'IT', value: 15 },
    { name: 'HR', value: 4 },
    { name: 'Finance', value: 6 },
    { name: 'Sales', value: 12 },
    { name: 'Marketing', value: 8 },
    { name: 'Operations', value: 10 }
  ];

  const attendanceTrendsData = [
    { day: 'Mon', rate: 96 },
    { day: 'Tue', rate: 94 },
    { day: 'Wed', rate: 98 },
    { day: 'Thu', rate: 92 },
    { day: 'Fri', rate: 95 }
  ];

  const leaveAnalyticsData = [
    { month: 'Jan', annual: 4, sick: 2, unpaid: 1 },
    { month: 'Feb', annual: 6, sick: 1, unpaid: 0 },
    { month: 'Mar', annual: 3, sick: 4, unpaid: 2 },
    { month: 'Apr', annual: 5, sick: 2, unpaid: 1 },
    { month: 'May', annual: 8, sick: 3, unpaid: 3 },
    { month: 'Jun', annual: 12, sick: 5, unpaid: 4 }
  ];

  const COLORS = ['#B8860B', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'HR_CREATED':
      case 'MANAGER_CREATED':
        return <UserPlus size={14} className="text-emerald-500" />;
      case 'DEPT_ASSIGNED':
      case 'LEAVE_APPROVED':
        return <FileCheck size={14} className="text-amber-500" />;
      case 'EMPLOYEE_DELETED':
        return <Trash2 size={14} className="text-destructive" />;
      default:
        return <Activity size={14} className="text-foreground/40" />;
    }
  };

  const kpis = [
    { name: 'Total Employees', value: metrics?.totalEmployees, icon: Users, color: 'text-sky-500', border: 'border-t-amber-500' },
    { name: 'Total HRs', value: metrics?.totalHRs, icon: UserCheck, color: 'text-emerald-500', border: 'border-t-emerald-500' },
    { name: 'Total Managers', value: metrics?.totalManagers, icon: Users2, color: 'text-purple-500', border: 'border-t-amber-500' },
    { name: 'Total Departments', value: metrics?.totalDepartments, icon: Network, color: 'text-amber-500', border: 'border-t-emerald-500' },
    { name: 'Attendance Today', value: `${metrics?.attendanceToday}%`, icon: Clock, color: 'text-green-500', border: 'border-t-emerald-500' },
    { name: 'Pending Leaves', value: metrics?.pendingLeaveRequests, icon: CalendarDays, color: 'text-destructive', border: 'border-t-amber-500' },
    { name: 'Payroll Processed', value: `${metrics?.payrollProcessed}%`, icon: CreditCard, color: 'text-indigo-500', border: 'border-t-emerald-500' },
    { name: 'Active Users', value: metrics?.activeUsers, icon: Activity, color: 'text-amber-600', border: 'border-t-amber-500' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Admin Control Panel</h2>
        <p className="text-xs text-foreground/60">Overview of organization health, workforce statistics, and system audits.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className={`p-4 border-t-4 shadow-sm ${kpi.border}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">{kpi.name}</span>
                <Icon size={16} className={kpi.color} />
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-4 block leading-none">
                {isMetricsLoading ? '...' : kpi.value}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employee Growth Area Chart */}
        <Card className="lg:col-span-2 border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader>
            <CardTitle>Workforce Expansion</CardTitle>
            <CardDescription>Visualizes the growth of active staff members count over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={employeeGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8860B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#B8860B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px', fontSize: 10 }} />
                <Area type="monotone" dataKey="count" stroke="#B8860B" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Audit Feed */}
        <Card className="flex flex-col border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <CardTitle>System Activity Feed</CardTitle>
            <CardDescription>Real-time audit log of security actions and account changes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[17.5rem] pr-1 space-y-3.5">
            {isActivitiesLoading ? (
              <div className="text-center py-12 text-foreground/40 text-xs">Loading activity logs...</div>
            ) : activities && activities.length > 0 ? (
              activities.map((act: any) => (
                <div key={act.id} className="flex gap-3 text-xs items-start bg-surface-muted p-2.5 rounded-lg border border-surface-border animate-fadeIn">
                  <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center shrink-0">
                    {getActivityIcon(act.type)}
                  </div>
                  <div>
                    <p className="text-[11px] text-foreground font-bold leading-tight">{act.description}</p>
                    <div className="flex gap-2 text-[10px] text-foreground/50 mt-1">
                      <span>Operator: {act.operator}</span>
                      <span>•</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-foreground/40 text-xs">No audit logs recorded today.</div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Additional Analytics Sub-Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Department Distribution Pie */}
        <Card className="md:col-span-2 border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader>
            <CardTitle>Department Staff distribution</CardTitle>
            <CardDescription>Percentage share of active employees by business units.</CardDescription>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-1.5 pl-4 overflow-y-auto max-h-[14rem]">
              {deptDistributionData.map((d, index) => (
                <div key={d.name} className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-foreground/60">{d.name}</span>
                  </div>
                  <span className="text-foreground font-mono">{d.value} members</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Trends Bar */}
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily present ratio over this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendsData} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px' }} />
                <Bar dataKey="rate" fill="#10B981" radius={[3, 3, 0, 0]} name="Present %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Category distribution */}
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardHeader>
            <CardTitle>Leaves Allocation</CardTitle>
            <CardDescription>Total leave days approved by category.</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveAnalyticsData.slice(-3)} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px' }} />
                <Bar dataKey="annual" stackId="a" fill="#B8860B" name="Annual" />
                <Bar dataKey="sick" stackId="a" fill="#10B981" name="Sick" />
                <Bar dataKey="unpaid" stackId="a" fill="#EF4444" name="Unpaid" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
