import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAllEmployees, useAttritionPrediction, useSkillGapAnalysis } from '../hooks/useHrQuery';
import type { Employee } from '../types';
import {
  Card, Badge
} from '../../components/ui';
import { BrainCircuit, AlertTriangle, TrendingDown, ShieldCheck, BarChart3, ChevronDown, ChevronUp, MessageCircle, Send, Loader2, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { api } from '../../api';

// ── Attrition Risk Gauge ──────────────────────────────────────────────────────
const RiskGauge: React.FC<{ score: number; category: string }> = ({ score, category }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const color = category === 'LOW' ? '#14b8a6' : category === 'MEDIUM' ? '#f59e0b' : '#ef4444';
  const bg = category === 'LOW' ? 'bg-teal-50 dark:bg-teal-950/20' : category === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-rose-50 dark:bg-rose-950/20';
  const border = category === 'LOW' ? 'border-teal-200 dark:border-teal-900/30' : category === 'MEDIUM' ? 'border-amber-200 dark:border-amber-900/30' : 'border-rose-200 dark:border-rose-900/30';
  const textColor = category === 'LOW' ? 'text-teal-700 dark:text-teal-400' : category === 'MEDIUM' ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400';
  return (
    <div className={`p-3 rounded-xl ${bg} border ${border} flex items-center gap-3`}>
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${clampedScore} 100`} strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-extrabold ${textColor}`}>{score}%</span>
      </div>
      <div>
        <span className={`text-xs font-extrabold block ${textColor}`}>{category} RISK</span>
        <span className="text-[10px] text-slate-400">Attrition probability</span>
      </div>
    </div>
  );
};

// ── Attrition Card (per employee) ────────────────────────────────────────────
const AttritionCard: React.FC<{ emp: Employee }> = ({ emp }) => {
  const { data: attrition, isLoading } = useAttritionPrediction(emp.id);
  const [expanded, setExpanded] = useState(false);

  const categoryVariant = (c: string) =>
    c === 'LOW' ? 'success' : c === 'MEDIUM' ? 'warning' : 'destructive';
  return (
    <Card className="border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
      >
        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center text-[11px] font-extrabold uppercase shrink-0">
          {emp.firstName.slice(0, 1)}{emp.lastName.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-800 dark:text-white block">{emp.firstName} {emp.lastName}</span>
          <span className="text-[10px] text-slate-400">{emp.position} · {emp.department}</span>
        </div>
        {isLoading ? (
          <div className="w-20 h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        ) : attrition ? (
          <div className="flex items-center gap-2">
            <Badge variant={categoryVariant(attrition.riskCategory)}>
              {attrition.riskCategory}
            </Badge>
            <span className="text-xs font-extrabold font-mono text-slate-700 dark:text-slate-350">{attrition.riskScore}%</span>
          </div>
        ) : null}
        {expanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
      </button>

      {expanded && attrition && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <RiskGauge score={attrition.riskScore} category={attrition.riskCategory} />
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">AI Analysis</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{attrition.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Skill Gap Card (per employee) ─────────────────────────────────────────────
const SkillGapCard: React.FC<{ emp: Employee }> = ({ emp }) => {
  const { data: skillGap, isLoading } = useSkillGapAnalysis(emp.id);
  const [expanded, setExpanded] = useState(false);

  const barData = skillGap?.skills?.map((s: any) => ({
    skill: s.skill.length > 15 ? s.skill.slice(0, 14) + '…' : s.skill,
    Current: s.current,
    Target: s.target,
    Gap: +(s.target - s.current).toFixed(1),
  })) || [];

  return (
    <Card className="border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
      >
        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center text-[11px] font-extrabold uppercase shrink-0">
          {emp.firstName.slice(0, 1)}{emp.lastName.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-800 dark:text-white block">{emp.firstName} {emp.lastName}</span>
          <span className="text-[10px] text-slate-400">{emp.position} · {emp.department}</span>
        </div>
        {isLoading ? (
          <div className="w-28 h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        ) : skillGap?.skills ? (
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 shrink-0">
            {skillGap.skills.length} skill{skillGap.skills.length !== 1 ? 's' : ''} assessed
          </span>
        ) : null}
        {expanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
      </button>

      {expanded && skillGap && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gap Bar Chart */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Skill Gap Analysis</span>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="skill" tick={{ fontSize: 9, fill: '#94a3b8' }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  <Bar dataKey="Current" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Current" />
                  <Bar dataKey="Target" fill="#e2e8f0" radius={[0, 4, 4, 0]} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Recommendations */}
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
              <span className="text-[10px] font-bold text-purple-500 uppercase block mb-1.5">Development Recommendations</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{skillGap.recommendations}</p>
              {/* Skill detail pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skillGap.skills.map((s: any) => (
                  <span key={s.skill} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/30 text-purple-600 dark:text-purple-400">
                    {s.skill}: {s.current}→{s.target}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Embedded HR Chat Panel ────────────────────────────────────────────────────
type HrChatMsg = { id: string; role: 'user' | 'bot'; text: string; sources?: string[]; error?: boolean };
const uid = () => Math.random().toString(36).slice(2, 9);

const HrChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<HrChatMsg[]>([{
    id: 'welcome', role: 'bot',
    text: "Hi! I'm NexusHR Assistant.\n\nAsk me about any HR policies, or ask for workforce insights. I'll answer based on verified policy documents.\n\nExample: \"Who has high attrition risk?\", \"What is the leave approval workflow?\"",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput('');
    setMessages(p => [...p, { id: uid(), role: 'user', text: t }]);
    setLoading(true);
    try {
      const res = await api.chat(t);
      setMessages(p => [...p, { id: uid(), role: 'bot', text: res.answer, sources: res.sources }]);
    } catch {
      setMessages(p => [...p, { id: uid(), role: 'bot', text: 'Unable to reach the AI service. Please try again.', error: true }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const QUICK = ['Leave approval workflow', 'Payroll calculation formula', 'Attendance clock-in rules', 'Performance review cycle'];

  return (
    <Card className="flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden" style={{ height: 520 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <BrainCircuit size={15} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-white">NexusHR HR Assistant</p>
          <p className="text-[10px] text-slate-400">Policy FAQ · Workforce Q&amp;A</p>
        </div>
        <button onClick={() => setMessages([{ id: uid(), role: 'bot', text: 'Chat cleared.' }])}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 animate-fadeIn ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'bot' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                <BrainCircuit size={11} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-sm'
                : msg.error
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-bl-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
            }`}>
              {msg.text}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {msg.sources.map(s => (
                    <span key={s} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                      📎 {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <BrainCircuit size={11} className="text-white" />
            </div>
            <div className="flex items-center gap-1 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm shadow-sm">
              {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && !loading && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2 bg-slate-50 dark:bg-slate-900 shrink-0">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)}
              className="text-[10px] font-semibold px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value.slice(0, 500))}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(input); } }}
          placeholder="Ask anything about HR policies or workforce data…"
          disabled={loading}
          className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors disabled:opacity-50"
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </Card>
  );
};


// ── Main AI Insights Page ─────────────────────────────────────────────────────
export const AIInsights: React.FC = () => {
  const { data: employees = [], isLoading } = useAllEmployees();
  const [activeView, setActiveView] = useState<'attrition' | 'skillgap' | 'assistant'>('attrition');

  const views = [
    { key: 'attrition' as const, label: 'Attrition Risk Board', icon: TrendingDown },
    { key: 'skillgap' as const, label: 'Skill Gap Analysis', icon: BarChart3 },
    { key: 'assistant' as const, label: 'HR Assistant', icon: MessageCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-slate-855 dark:text-white leading-tight flex items-center gap-2">
            <BrainCircuit size={22} className="text-teal-500" />
            <span>AI Workforce Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered attrition risk scoring and skill gap analysis across the entire organisation.
          </p>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {views.map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.key}
                onClick={() => setActiveView(v.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeView === v.key
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={12} />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend / Info Banner */}
      {activeView === 'attrition' ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30 rounded-xl">
            <ShieldCheck size={16} className="text-teal-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase block">Low Risk</span>
              <span className="text-[10px] text-slate-500">Score below 30</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 rounded-xl">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Medium Risk</span>
              <span className="text-[10px] text-slate-500">Score 30–60</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-xl">
            <TrendingDown size={16} className="text-rose-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">High Risk</span>
              <span className="text-[10px] text-slate-500">Score above 60</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-purple-50 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30 rounded-xl flex items-center gap-3">
          <BarChart3 size={16} className="text-purple-600 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Skill ratings are scored <strong>0–5</strong>. Bar charts show current proficiency vs target level. Expand each employee to see development recommendations.
          </p>
        </div>
      )}

      {/* Employee Cards */}
      {activeView === 'assistant' ? (
        <HrChatPanel />
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map(emp =>
            activeView === 'attrition'
              ? <AttritionCard key={emp.id} emp={emp} />
              : <SkillGapCard key={emp.id} emp={emp} />
          )}
        </div>
      )}
    </div>
  );
};
