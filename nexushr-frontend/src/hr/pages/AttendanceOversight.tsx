import React, { useState } from 'react';
import { useAllAttendance } from '../hooks/useHrQuery';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge
} from '../../components/ui';
import { CalendarClock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { AttendanceStatus } from '../types';

const statusVariant = (s: AttendanceStatus) =>
  s === 'PRESENT' ? 'success' : s === 'LATE' ? 'warning' : s === 'ABSENT' ? 'destructive' : 'info';

const DEPARTMENTS = ['', 'Engineering', 'Product', 'Marketing', 'HR', 'Sales', 'Finance'];

export const AttendanceOversight: React.FC = () => {
  const { data: records = [], isLoading } = useAllAttendance();
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const dateFiltered = records.filter(r => !dateFilter || r.date === dateFilter);
  const filtered = dateFiltered.filter(r => !deptFilter || r.employee?.department === deptFilter);

  const presentCount = filtered.filter(r => r.status === 'PRESENT').length;
  const lateCount = filtered.filter(r => r.status === 'LATE').length;
  const absentCount = filtered.filter(r => r.status === 'ABSENT').length;
  const total = filtered.length || 1;

  const presentPct = Math.round((presentCount / total) * 100);
  const latePct = Math.round((lateCount / total) * 100);
  const absentPct = Math.round((absentCount / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">Attendance Oversight</h2>
        <p className="text-xs text-slate-500">Organisation-wide daily attendance records and heatmap analysis.</p>
      </div>

      {/* Filters */}
      <Card className="border border-slate-100 dark:border-slate-800">
        <CardContent className="pt-5 pb-4 flex flex-col md:flex-row gap-3">
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Date</label>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded px-3 py-2 text-xs outline-none focus:border-teal-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="space-y-1 w-full md:w-48">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Department</label>
            <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.filter(Boolean).map(d => <option key={d}>{d}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-teal-50 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Present</span>
            <CheckCircle2 size={18} className="text-teal-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-855 dark:text-white block mb-2">{presentCount}</span>
          <div className="w-full bg-teal-100 dark:bg-teal-900/30 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${presentPct}%` }} />
          </div>
          <span className="text-[10px] text-teal-600 font-bold mt-1 block">{presentPct}% attendance rate</span>
        </Card>

        <Card className="bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Late</span>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-855 dark:text-white block mb-2">{lateCount}</span>
          <div className="w-full bg-amber-100 dark:bg-amber-900/30 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${latePct}%` }} />
          </div>
          <span className="text-[10px] text-amber-600 font-bold mt-1 block">{latePct}% late rate</span>
        </Card>

        <Card className="bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Absent</span>
            <XCircle size={18} className="text-rose-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-855 dark:text-white block mb-2">{absentCount}</span>
          <div className="w-full bg-rose-100 dark:bg-rose-900/30 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${absentPct}%` }} />
          </div>
          <span className="text-[10px] text-rose-600 font-bold mt-1 block">{absentPct}% absence rate</span>
        </Card>
      </div>

      {/* Attendance Records Table */}
      <Card className="border border-slate-100 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock size={14} className="text-teal-500" /><span>Daily Attendance Log</span></CardTitle>
          <CardDescription>All employee clock-in and clock-out records for the selected date.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading attendance data...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No attendance records for this date.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(rec => {
                  let hours = '—';
                  if (rec.clockIn && rec.clockOut) {
                    const [h1, m1] = rec.clockIn.split(':').map(Number);
                    const [h2, m2] = rec.clockOut.split(':').map(Number);
                    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                    hours = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  }
                  return (
                    <TableRow key={rec.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center text-[9px] font-extrabold uppercase shrink-0">
                            {rec.employee?.firstName?.slice(0, 1)}{rec.employee?.lastName?.slice(0, 1)}
                          </div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{rec.employee?.firstName} {rec.employee?.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{rec.employee?.department}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-500">{rec.date}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-350">{rec.clockIn || '—'}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-350">{rec.clockOut || '—'}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">{hours}</TableCell>
                      <TableCell><Badge variant={statusVariant(rec.status)}>{rec.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
