import React from 'react';
import { useTeamAttendance } from '../hooks/useManagerQuery';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
import { 
  Users, UserCheck, UserX, Clock
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const { data: logs = [], isLoading } = useTeamAttendance();

  // Metrics calculation
  const totalReports = logs.length;
  const presentCount = logs.filter((l: any) => l.status === 'PRESENT' || l.status === 'LATE').length;
  const lateCount = logs.filter((l: any) => l.status === 'LATE').length;
  const absentCount = logs.filter((l: any) => l.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-foreground leading-tight">Daily Team Attendance</h2>
        <p className="text-xs text-foreground/60">Track team shift entry check-ins, late notifications, and absence logs.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-indigo-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Direct Reports</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">{totalReports} members</span>
          </div>
          <Users size={20} className="text-indigo-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Present Today</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">{presentCount} checked</span>
          </div>
          <UserCheck size={20} className="text-emerald-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Late Check-ins</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">{lateCount} members</span>
          </div>
          <Clock size={20} className="text-amber-500" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-destructive shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Absent Today</span>
            <span className="text-2xl font-extrabold text-foreground mt-1.5 block leading-none">{absentCount} members</span>
          </div>
          <UserX size={20} className="text-destructive" />
        </Card>
      </div>

      {/* Attendance log sheet */}
      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Sheet today</CardTitle>
          <CardDescription>Verify employee shift timelines.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-foreground/40 text-xs">Loading logs...</div>
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
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-bold text-foreground">{log.employeeName}</TableCell>
                    <TableCell className="text-foreground/80 font-semibold">{log.department}</TableCell>
                    <TableCell className="font-mono text-foreground/70">{log.clockIn || '--:--'}</TableCell>
                    <TableCell className="font-mono text-foreground/70">{log.clockOut || '--:--'}</TableCell>
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
            <div className="text-center py-12 text-foreground/40 text-xs">No daily attendance entries recorded.</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
