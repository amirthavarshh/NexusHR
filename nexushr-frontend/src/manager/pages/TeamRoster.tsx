import React, { useState, useEffect } from 'react';
import { 
  useDirectReports, useAttritionPrediction, useSkillGapAnalysis 
} from '../hooks/useManagerQuery';
import type { DirectReport } from '../types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Tabs, TabsList, TabsTrigger, TabsContent
} from '../../admin/components/ui';
import { 
  Search, Eye, Mail, Phone, CalendarDays, Award, DollarSign, BrainCircuit, Activity
} from 'lucide-react';

const AiDiagnosticsTab: React.FC<{ employeeId: number }> = ({ employeeId }) => {
  const { data: attrition, isLoading: isAttritionLoading } = useAttritionPrediction(employeeId);
  const { data: skillGap, isLoading: isSkillGapLoading } = useSkillGapAnalysis(employeeId);

  if (isAttritionLoading || isSkillGapLoading) {
    return <div className="text-center py-8 text-slate-400 text-xs">Computing AI diagnostics...</div>;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-100 text-rose-700 dark:bg-rose-955/20 dark:text-rose-450 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4 pt-2 text-xs">
      {attrition && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">AI Flight Risk</span>
            <Badge variant="outline" className={`font-extrabold ${getRiskColor(attrition.riskLevel)}`}>
              {attrition.riskLevel} ({attrition.riskScore}%)
            </Badge>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-350 ${
                attrition.riskLevel === 'HIGH' ? 'bg-rose-500' :
                attrition.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${attrition.riskScore}%` }}
            />
          </div>

          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded dark:bg-slate-800/10 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 font-bold block mb-1">Key Retaining Factors</span>
            <div className="flex flex-wrap gap-1">
              {attrition.factors?.map((f: string, i: number) => (
                <span key={i} className="bg-slate-100 text-slate-655 text-[9px] font-bold px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-350">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 text-indigo-705 rounded dark:bg-indigo-950/10 dark:border-indigo-900/30 flex gap-2">
            <Activity size={14} className="shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] text-indigo-500 font-bold block mb-0.5">Retention Recommendations</span>
              <p className="leading-relaxed italic">"{attrition.recommendations}"</p>
            </div>
          </div>
        </div>
      )}

      {skillGap && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Competency Analysis</span>
          <div className="space-y-2">
            {skillGap.skills?.map((s: any, idx: number) => {
              const percent = Math.min((s.level / s.requiredLevel) * 100, 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-350">
                    <span>{s.name}</span>
                    <span className="font-mono text-slate-500">{s.level} / {s.requiredLevel}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-amber-50/50 border border-amber-105 text-amber-705 rounded dark:bg-amber-955/10 dark:border-amber-900/30">
            <span className="text-[9px] text-amber-600 font-bold block mb-0.5">Learning Pathway Suggestions</span>
            <p className="whitespace-pre-line leading-relaxed italic">"{skillGap.recommendations}"</p>
          </div>
        </div>
      )}
    </div>
  );
};


export const TeamRoster: React.FC = () => {
  const { data: reports = [], isLoading } = useDirectReports();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<DirectReport | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('details');

  // Reset tab to details when employee changes
  useEffect(() => {
    setActiveDrawerTab('details');
  }, [selectedReport]);

  // Filtered direct reports
  const filteredReports = reports.filter(r => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || r.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight">My Team Roster</h2>
        <p className="text-xs text-slate-500">View direct report profiles, performance records, and salary parameters.</p>
      </div>

      {/* Search Filter */}
      <Card className="accent-border-mint">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100 w-full md:max-w-md dark:bg-slate-800 dark:border-slate-700">
            <Search className="text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs outline-none w-full text-slate-655 dark:text-slate-350 placeholder-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid containing Roster list and drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Reports list */}
        <Card className={`accent-border-mint ${selectedReport ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader>
            <CardTitle>Direct Reports Directory</CardTitle>
            <CardDescription>Managed employee accounts assigned to your department unit.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading roster...</div>
            ) : filteredReports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Performance Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((r) => (
                    <TableRow 
                      key={r.id} 
                      className={`cursor-pointer ${selectedReport?.id === r.id ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                      onClick={() => setSelectedReport(r)}
                    >
                      <TableCell className="font-bold text-slate-805 dark:text-white">
                        <div>
                          <span>{r.firstName} {r.lastName}</span>
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{r.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-655 dark:text-slate-400 font-semibold">{r.position}</TableCell>
                      <TableCell>
                        {r.performanceRating ? (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded dark:bg-amber-955/20 dark:text-amber-400">
                            {r.performanceRating.toFixed(1)} / 5.0
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">Unrated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedReport(r)}>
                          <Eye size={12} className="text-slate-455" />
                          <span className="ml-1 text-[10px]">Profile</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">No direct reports found.</div>
            )}
          </CardContent>
        </Card>

        {/* Detailed drawer card */}
        {selectedReport && (
          <Card className="accent-border-lavender animate-fadeIn">
            <CardHeader className="flex flex-row justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle>Member Profile File</CardTitle>
                <CardDescription>Direct report details.</CardDescription>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
              >
                Close
              </button>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="details" activeTabState={[activeDrawerTab, setActiveDrawerTab]}>
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-1">
                    <BrainCircuit size={13} />
                    <span>AI Diagnostics</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 dark:bg-indigo-955/20 dark:text-indigo-400 text-sm font-extrabold uppercase border border-indigo-200 dark:border-indigo-900/30 shrink-0">
                      {selectedReport.firstName.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-855 dark:text-white block">{selectedReport.firstName} {selectedReport.lastName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-slate-350">{selectedReport.position}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                      <Mail size={13} className="shrink-0" />
                      <span>{selectedReport.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                      <Phone size={13} className="shrink-0" />
                      <span>{selectedReport.phone || 'No phone number set'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                      <CalendarDays size={13} className="shrink-0" />
                      <span>Hired: {new Date(selectedReport.hireDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={13} />
                        <span>Monthly Salary:</span>
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-355">${selectedReport.salary.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Award size={13} />
                        <span>Performance Rating:</span>
                      </span>
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded dark:bg-amber-955/20 dark:text-amber-400">
                        {selectedReport.performanceRating ? selectedReport.performanceRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai">
                  <AiDiagnosticsTab employeeId={selectedReport.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

      </div>

    </div>
  );
};
