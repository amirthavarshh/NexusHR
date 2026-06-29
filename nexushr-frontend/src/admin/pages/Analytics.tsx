import React from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '../components/ui';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

export const Analytics: React.FC = () => {
  const growthData = [
    { month: 'Jan', employees: 18, active: 16 },
    { month: 'Feb', employees: 21, active: 19 },
    { month: 'Mar', employees: 24, active: 22 },
    { month: 'Apr', employees: 27, active: 25 },
    { month: 'May', employees: 30, active: 27 },
    { month: 'Jun', employees: 32, active: 30 }
  ];

  const payrollCostData = [
    { month: 'Jan', basic: 150000, allowances: 15000, deductions: 2000, net: 163000 },
    { month: 'Feb', basic: 165000, allowances: 16500, deductions: 1000, net: 180500 },
    { month: 'Mar', basic: 180000, allowances: 18000, deductions: 3500, net: 194500 },
    { month: 'Apr', basic: 190000, allowances: 19000, deductions: 4000, net: 205000 },
    { month: 'May', basic: 205000, allowances: 20500, deductions: 2500, net: 223000 },
    { month: 'Jun', basic: 210000, allowances: 21000, deductions: 5000, net: 226000 }
  ];

  const leaveTrendsData = [
    { week: 'Wk 1', annual: 8, sick: 4, unpaid: 2 },
    { week: 'Wk 2', annual: 12, sick: 2, unpaid: 1 },
    { week: 'Wk 3', annual: 6, sick: 7, unpaid: 0 },
    { week: 'Wk 4', annual: 15, sick: 3, unpaid: 4 }
  ];

  const attendanceTrendsData = [
    { week: 'Wk 1', present: 96, late: 3 },
    { week: 'Wk 2', present: 94, late: 5 },
    { week: 'Wk 3', present: 98, late: 1 },
    { week: 'Wk 4', present: 95, late: 4 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Advanced Workforce Analytics</h2>
        <p className="text-xs text-slate-500">Deep-dive graphs covering personnel growth, payroll cost allocation, and leaves trends.</p>
      </div>

      {/* Grid containing core Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employee growth area */}
        <Card className="accent-border-mint">
          <CardHeader>
            <CardTitle>Workforce Headcount Expansion</CardTitle>
            <CardDescription>Compares total registered employee profiles against active login users.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8860B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#B8860B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="employees" stroke="#B8860B" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Mapped" />
                <Area type="monotone" dataKey="active" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payroll Cost Analysis bar stack */}
        <Card className="accent-border-lavender">
          <CardHeader>
            <CardTitle>Monthly Payroll Cost Statement</CardTitle>
            <CardDescription>Summation cost of basic salaries, allowances, and unpaid deductions.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollCostData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="basic" stackId="p" fill="#B8860B" name="Basic" />
                <Bar dataKey="allowances" stackId="p" fill="#10B981" name="Allowances" />
                <Bar dataKey="deductions" stackId="p" fill="#EF4444" name="Deductions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Trends Bar Chart */}
        <Card className="accent-border-mint">
          <CardHeader>
            <CardTitle>Weekly Leaves Rate Trends</CardTitle>
            <CardDescription>Total leave days allocated by categories this month.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="annual" fill="#B8860B" name="Annual" />
                <Bar dataKey="sick" fill="#10B981" name="Sick" />
                <Bar dataKey="unpaid" fill="#3B82F6" name="Unpaid" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends Line Chart */}
        <Card className="accent-border-lavender">
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
            <CardDescription>Compares weekly present percentage ratios against late clock-ins count.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2.5} name="Present Ratio %" />
                <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} name="Late Check-ins" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
