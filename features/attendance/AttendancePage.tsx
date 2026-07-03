import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Play, LogOut } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';

export const AttendancePage: React.FC = () => {
  const { session, showToast } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const { data: todayAttendance, isLoading: loadingToday } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: api.getTodayAttendance,
    enabled: !!session?.employeeId,
  });

  const { data: attendanceHistory = [] } = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: async () => {
      const hist = await api.getMyAttendanceHistory();
      return hist.reverse();
    },
    enabled: !!session?.employeeId,
  });

  const { data: teamAttendance = [] } = useQuery({
    queryKey: ['attendance', 'team'],
    queryFn: async () => {
      const logs = await api.getAllAttendance();
      return logs.reverse();
    },
    enabled: session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR',
  });

  // Mutations
  const clockInMut = useMutation({
    mutationFn: api.clockIn,
    onSuccess: (res) => {
      showToast(`Clocked in successfully. Status: ${res.status}`);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => showToast(err.message || 'Could not complete clock-in', 'error')
  });

  const clockOutMut = useMutation({
    mutationFn: api.clockOut,
    onSuccess: () => {
      showToast('Clocked out successfully.');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: any) => showToast(err.message || 'Could not complete clock-out', 'error')
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const calculateDuration = (clockIn?: string, clockOut?: string): string => {
    if (!clockIn || !clockOut) return '—';
    try {
      const [inH, inM] = clockIn.split(':').map(Number);
      const [outH, outM] = clockOut.split(':').map(Number);
      let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const hrs = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hrs}h ${mins}m`;
    } catch {
      return '—';
    }
  };

  if (!session) return null;

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">Attendance Tracking</h2>
        <p className="text-sm text-foreground/60">Monitor shift logs, check-in statuses, and historical workforce timings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employee clock tracker card & shift logs */}
        {session.employeeId && (
          <>
            {/* Attendance Clock Card */}
            <Card className="lg:col-span-1 p-6 flex flex-col justify-between border-t-4 border-t-emerald-500 shadow-md">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="text-emerald-500 animate-pulse" size={18} />
                  <span>Shift Time Tracker</span>
                </h3>
                <p className="text-xs text-foreground/60 mb-6 font-medium">Log check-ins. Shifts beginning past 09:15 AM flag automatically as Late.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-surface-muted border border-surface-border text-center">
                    <span className="text-[10px] text-foreground/60 block mb-1 uppercase font-bold tracking-wider">Check In</span>
                    <span className="text-lg font-mono font-bold text-foreground">
                      {todayAttendance?.clockIn ? todayAttendance.clockIn.slice(0, 5) : '--:--'}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-muted border border-surface-border text-center">
                    <span className="text-[10px] text-foreground/60 block mb-1 uppercase font-bold tracking-wider">Check Out</span>
                    <span className="text-lg font-mono font-bold text-foreground">
                      {todayAttendance?.clockOut ? todayAttendance.clockOut.slice(0, 5) : '--:--'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex gap-4">
                  <Button 
                    disabled={!!todayAttendance || clockInMut.isPending || loadingToday}
                    onClick={() => clockInMut.mutate()}
                    className="flex-1 text-xs"
                    variant={todayAttendance ? "outline" : "default"}
                  >
                    <Play size={14} className="mr-2" />
                    Clock In
                  </Button>
                  
                  <Button 
                    disabled={!todayAttendance || !!todayAttendance.clockOut || clockOutMut.isPending}
                    onClick={() => clockOutMut.mutate()}
                    className="flex-1 text-xs"
                    variant={(!todayAttendance || todayAttendance.clockOut) ? "outline" : "destructive"}
                  >
                    <LogOut size={14} className="mr-2" />
                    Clock Out
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Attendance Logs Table */}
            <Card className="lg:col-span-2 p-6 shadow-md border-surface-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Your Shifts History</h3>
              {attendanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-foreground/80">
                    <thead>
                      <tr className="border-b border-surface-border text-foreground/50 text-xs uppercase font-bold tracking-wider">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Clock In</th>
                        <th className="pb-3">Clock Out</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {attendanceHistory.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-muted/50 transition-colors">
                          <td className="py-3 font-mono text-xs">{formatDate(log.date)}</td>
                          <td className="py-3 font-mono text-xs">{log.clockIn ? log.clockIn.slice(0, 5) : '--:--'}</td>
                          <td className="py-3 font-mono text-xs">{log.clockOut ? log.clockOut.slice(0, 5) : '--:--'}</td>
                          <td className="py-3 font-mono text-xs">{calculateDuration(log.clockIn, log.clockOut)}</td>
                          <td className="py-3">
                            <Badge variant={log.status === 'PRESENT' ? 'success' : log.status === 'LATE' ? 'warning' : 'destructive'}>
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-foreground/50 text-sm">No shift logs found. Click Clock In to log your check-in.</div>
              )}
            </Card>
          </>
        )}

        {/* Manager view: Team Attendance list */}
        {(session.role === 'MANAGER' || session.role === 'ADMIN' || session.role === 'HR') && (
          <Card className="lg:col-span-3 p-6 shadow-md border-surface-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Team Attendance Ledger</h3>
            {teamAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-foreground/80">
                  <thead>
                    <tr className="border-b border-surface-border text-foreground/50 text-xs uppercase font-bold tracking-wider">
                      <th className="pb-3">Employee</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Clock In</th>
                      <th className="pb-3">Clock Out</th>
                      <th className="pb-3">Duration</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {teamAttendance.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3 font-bold text-foreground">
                          {log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : 'N/A'}
                        </td>
                        <td className="py-3 font-mono text-xs">{formatDate(log.date)}</td>
                        <td className="py-3 font-mono text-xs">{log.clockIn ? log.clockIn.slice(0, 5) : '--:--'}</td>
                        <td className="py-3 font-mono text-xs">{log.clockOut ? log.clockOut.slice(0, 5) : '--:--'}</td>
                        <td className="py-3 font-mono text-xs">{calculateDuration(log.clockIn, log.clockOut)}</td>
                        <td className="py-3">
                          <Badge variant={log.status === 'PRESENT' ? 'success' : log.status === 'LATE' ? 'warning' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/50 text-sm">No workforce clock logs registered yet.</div>
            )}
          </Card>
        )}

      </div>

    </div>
  );
};
