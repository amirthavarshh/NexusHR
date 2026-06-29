import React from 'react';
import { useAttendanceToday, useDepartments } from '../hooks/useAdminQuery';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import { 
  Users, UserCheck, UserX, Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

export const AttendanceOverview: React.FC = () => {
  const { data: logs = [], isLoading: isLogsLoading } = useAttendanceToday();
  const { data: depts = [] } = useDepartments();

  // Metrics calculation
  const totalChecked = logs.length;
  const presentCount = logs.filter(l => l.status === 'PRESENT' || l.status === 'LATE').length;
  const absentCount = logs.filter(l => l.status === 'ABSENT').length;
  const attendanceRate = totalChecked > 0 ? Math.round((presentCount / totalChecked) * 100) : 0;

  // Monthly trends data
  const monthlyTrendsData = [
    { name: '01 Jun', rate: 94 },
    { name: '05 Jun', rate: 92 },
    { name: '10 Jun', rate: 96 },
    { name: '15 Jun', rate: 95 },
    { name: '20 Jun', rate: 98 },
    { name: '25 Jun', rate: 94 },
    { name: '30 Jun', rate: 96 }
  ];

  // Mapped department stats (simulated since backend does not filter)
  const deptAttendanceStats = depts.map((d, index) => {
    // Generate simulated rates
    const rates = [96, 92, 100, 95, 88, 97];
    const rate = rates[index % rates.length];
    return {
      name: d.name,
      employeeCount: d.employeeCount,
      rate,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Workforce Attendance Overview</h2>
        <p className="text-xs text-slate-500">Monitor today's active check-in metrics, tracking records, and department statistics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Roster Tracked</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLogsLoading ? '...' : totalChecked} members</span>
          </div>
          <Users size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Present Today</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLogsLoading ? '...' : presentCount} checked-in</span>
          </div>
          <UserCheck size={20} className="text-emerald-500" />
        </Card>

        <Card className="kpi-amber p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Absent Today</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLogsLoading ? '...' : absentCount} members</span>
          </div>
          <UserX size={20} className="text-rose-500" />
        </Card>

        <Card className="kpi-green p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Attendance Ratio</span>
            <span className="text-2xl font-extrabold text-slate-855 dark:text-white mt-1.5 block leading-none">{isLogsLoading ? '...' : `${attendanceRate}%`}</span>
          </div>
          <Percent size={20} className="text-emerald-500" />
        </Card>
      </div>

      {/* Charts and Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Area Chart */}
        <Card className="lg:col-span-2 accent-border-mint">
          <CardHeader>
            <CardTitle>Monthly Attendance Rate Trends</CardTitle>
            <CardDescription>Ratio percentage timeline over the current month.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[80, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" name="Present Ratio %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Stats progress bars */}
        <Card className="accent-border-lavender">
          <CardHeader>
            <CardTitle>Department Statistics</CardTitle>
            <CardDescription>Average attendance ratios sorted by operations units.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[16.5rem] overflow-y-auto pr-1">
            {deptAttendanceStats.map(ds => (
              <div key={ds.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-655 dark:text-slate-400">{ds.name} Unit</span>
                  <span className="font-mono text-slate-800 dark:text-white">{ds.rate}%</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${ds.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* Master Log Ledger Table */}
      <Card className="accent-border-mint">
        <CardHeader>
          <CardTitle>Daily Attendance Ledger</CardTitle>
          <CardDescription>Audit check-in sheet for today.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLogsLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading shift records...</div>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-bold text-slate-855 dark:text-white">{log.employeeName}</TableCell>
                    <TableCell className="text-slate-655 dark:text-slate-400 font-semibold">{log.department}</TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400">{log.clockIn || '--:--'}</TableCell>
                    <TableCell className="font-mono text-slate-700 dark:text-slate-400">{log.clockOut || '--:--'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          log.status === 'PRESENT' ? 'success' : 
                          log.status === 'LATE' ? 'warning' : 'destructive'
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">No attendance logs found for today.</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
