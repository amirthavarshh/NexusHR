import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { BrainCircuit, Award, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Legend 
} from 'recharts';
import { Card, Button } from '../../components/ui';

export const ReportsPage: React.FC = () => {
  const { session, showToast } = useAuth();
  
  // AI reports
  const [attritionReports, setAttritionReports] = useState<Record<number, any>>({});
  const [skillGapData, setSkillGapData] = useState<Record<number, any>>({});

  const isPrivileged = session?.role === 'MANAGER' || session?.role === 'ADMIN' || session?.role === 'HR';

  const { data: employeesList = [] } = useQuery({
    queryKey: ['employees', 'reports'],
    queryFn: api.getAllEmployees,
    enabled: isPrivileged
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics', 'reports'],
    queryFn: api.getWorkforceMetrics,
    enabled: isPrivileged
  });

  const inspectAttritionMut = useMutation({
    mutationFn: (empId: number) => api.getAttritionPrediction(empId),
    onSuccess: (data, empId) => {
      setAttritionReports(prev => ({ ...prev, [empId]: data }));
      showToast('AI Attrition prediction calculated successfully.');
    },
    onError: () => showToast('Could not load AI attrition report', 'error')
  });

  const inspectSkillGapMut = useMutation({
    mutationFn: (empId: number) => api.getSkillGapAnalysis(empId),
    onSuccess: (data, empId) => {
      setSkillGapData(prev => ({ ...prev, [empId]: data }));
      showToast('AI Skill template gap calculated successfully.');
    },
    onError: () => showToast('Could not load AI skill gap report', 'error')
  });

  const inspectEmployeeAttrition = (empId: number) => {
    if (attritionReports[empId]) return;
    inspectAttritionMut.mutate(empId);
  };

  const inspectEmployeeSkillGap = (empId: number) => {
    if (skillGapData[empId]) return;
    inspectSkillGapMut.mutate(empId);
  };

  if (!session) return null;

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">AI Workplace Analytics & Reports</h2>
        <p className="text-sm text-foreground/60">Examine workforce metrics, analyze predictive attrition, and identify skill gap distributions.</p>
      </div>

      {metrics ? (
        <div className="space-y-6">
          
          {/* Metric Summary Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <Card className="p-4 text-center border-t-4 border-t-primary shadow-sm">
              <span className="text-xs text-foreground/50 block mb-1 font-bold">Active Team Size</span>
              <span className="text-2xl font-bold text-foreground">{metrics.totalEmployees}</span>
            </Card>
            <Card className="p-4 text-center border-t-4 border-t-emerald-500 shadow-sm">
              <span className="text-xs text-foreground/50 block mb-1 font-bold">Average Monthly Pay</span>
              <span className="text-2xl font-bold text-emerald-600">${Math.round(metrics.averageSalary).toLocaleString()}</span>
            </Card>
            <Card className="p-4 text-center border-t-4 border-t-amber-500 shadow-sm">
              <span className="text-xs text-foreground/50 block mb-1 font-bold">Avg Performance KPI</span>
              <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-2xl">{metrics.averagePerformance.toFixed(2)}</span>
              </div>
            </Card>
            <Card className="p-4 text-center border-t-4 border-t-sky-500 shadow-sm">
              <span className="text-xs text-foreground/50 block mb-1 font-bold">Active Departments</span>
              <span className="text-2xl font-bold text-foreground">
                {Object.keys(metrics.departmentDistribution || {}).length}
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Department Headcount distribution chart */}
            <Card className="p-6 min-h-[300px] flex flex-col justify-between border-t-4 border-t-primary shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">Workforce Headcount Distribution</h3>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(metrics.departmentDistribution || {}).map(([dept, count]) => ({ name: dept, count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 500 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px' }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Salary Distribution representation */}
            <Card className="p-6 min-h-[300px] flex flex-col justify-between border-t-4 border-t-orange-400 shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4">Monthly Compensation Breakdown</h3>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeesList.map((e: any) => ({ name: e.firstName + ' ' + e.lastName[0] + '.', salary: e.salary }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 500 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px' }} />
                    <Bar dataKey="salary" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Attrition Risk Monitor Panel */}
            <Card className="p-6 border-t-4 border-t-rose-500 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BrainCircuit className="text-rose-500" size={18} />
                <span>AI Predictive Attrition Board</span>
              </h3>
              
              <div className="space-y-4">
                {employeesList.map((emp: any) => {
                  const rep = attritionReports[emp.id];
                  return (
                    <div key={emp.id} className="p-4 rounded-lg bg-surface border border-surface-border shadow-sm animate-fadeIn hover:border-foreground/20 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            rep?.riskScore > 70 ? 'bg-destructive' :
                            rep?.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div>
                            <h4 className="text-xs font-bold text-foreground">
                              {emp.firstName} {emp.lastName}
                            </h4>
                            <span className="text-[10px] text-foreground/50">Role: {emp.position} | Dept: {emp.department}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[9px] text-foreground/50 block uppercase font-bold">AI Attrition Risk</span>
                            <span className={`text-sm font-mono font-bold ${
                              rep?.riskScore > 70 ? 'text-destructive' :
                              rep?.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {rep ? `${rep.riskScore}%` : 'Calculating...'}
                            </span>
                          </div>
                          
                          {!rep && (
                            <Button 
                              onClick={() => inspectEmployeeAttrition(emp.id)}
                              variant="default"
                              size="sm"
                              className="h-8 text-[10px]"
                              disabled={inspectAttritionMut.isPending}
                            >
                              Run AI Analysis
                            </Button>
                          )}
                        </div>
                      </div>

                      {rep && (
                        <>
                          <div className="mt-3 p-3 rounded-md bg-surface-muted text-xs text-foreground/80 border border-surface-border leading-relaxed animate-fadeIn">
                            <span className="font-bold text-amber-500 block mb-1">AI Recommendation Commentary:</span>
                            {rep.explanation}
                          </div>
                          <div className="mt-2 p-3 rounded-md bg-surface-muted border border-surface-border text-xs text-foreground/80 leading-relaxed flex items-start gap-2.5 animate-fadeIn">
                            <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-foreground block mb-0.5">AI HR Transformation Insight:</span>
                              HR teams spend too much time on manual processes. NexusHR streamlines this employee's lifecycle, attendance, payroll, and performance tracking, delivering AI-powered insights.
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Skill Gap Insights Panel */}
            <Card className="p-6 border-t-4 border-t-sky-500 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="text-sky-500" size={18} />
                <span>Skill Gap Insights Board</span>
              </h3>
              
              <div className="space-y-4">
                {employeesList.map((emp: any) => {
                  const data = skillGapData[emp.id];
                  return (
                    <div key={emp.id} className="p-4 rounded-lg bg-surface border border-surface-border shadow-sm animate-fadeIn hover:border-foreground/20 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">
                            {emp.firstName} {emp.lastName}
                          </h4>
                          <span className="text-[10px] text-foreground/50 block">Role: {emp.position} | Dept: {emp.department}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {!data && (
                            <Button 
                              type="button"
                              onClick={() => inspectEmployeeSkillGap(emp.id)}
                              variant="default"
                              size="sm"
                              className="h-8 text-[10px]"
                              disabled={inspectSkillGapMut.isPending}
                            >
                              Run Skill Analysis
                            </Button>
                          )}
                        </div>
                      </div>

                      {data && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                          {/* Competency Chart */}
                          <div className="w-full h-[180px] bg-surface-muted p-2 rounded-md border border-surface-border">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data.skills} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="skill" stroke="#64748b" tick={{ fontSize: 8, fontWeight: 500 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 8 }} domain={[0, 5]} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-border)', borderRadius: '6px', fontSize: 10 }} />
                                <Legend wrapperStyle={{ fontSize: 9 }} />
                                <Bar dataKey="current" fill="#B8860B" radius={[2, 2, 0, 0]} name="Current" />
                                <Bar dataKey="target" fill="#64748b" radius={[2, 2, 0, 0]} name="Target" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Skill Gap Recommendations */}
                          <div className="p-3 rounded-md bg-surface-muted border border-surface-border text-xs text-foreground/80 leading-relaxed flex items-start gap-2.5">
                            <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-foreground block mb-1">AI Upskilling Plan:</span>
                              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                                {data.recommendations?.split('\n').map((rec: string, rIdx: number) => {
                                  const cleanRec = rec.replace(/^(\d+\.\s*|-\s*|\*\s*)/, '').trim();
                                  if (!cleanRec || cleanRec.toLowerCase().includes('recommended action plan')) return null;
                                  return <li key={rIdx}>{cleanRec}</li>;
                                })}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-foreground/50 text-sm">Failed to generate AI metrics.</div>
      )}

    </div>
  );
};
