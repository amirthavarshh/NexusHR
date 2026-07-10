import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── tiny keyframe injector ─── */
const injectKeyframes = () => {
  if (document.getElementById('lp-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'lp-keyframes';
  style.textContent = `
    @keyframes lp-fade-up { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes lp-float   { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
    @keyframes lp-pulse-dot { 0%,100% { box-shadow:0 0 0 0 rgba(52,211,153,.6); } 60% { box-shadow:0 0 0 8px rgba(52,211,153,0); } }
  `;
  document.head.appendChild(style);
};

const LandingPage: React.FC = () => {
  const navigate    = useNavigate();
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => { injectKeyframes(); setTimeout(() => setVisible(true), 50); }, []);

  useEffect(() => {
    if (session) {
      if (session.role === 'ADMIN')        navigate('/admin/dashboard',   { replace: true });
      else if (session.role === 'MANAGER') navigate('/manager/dashboard', { replace: true });
      else if (session.role === 'HR')      navigate('/hr/dashboard',      { replace: true });
      else                                 navigate('/dashboard',          { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const indigo   = '#6366f1';
  const indigoLt = '#818cf8';
  const amber    = '#f59e0b';
  const bg       = '#050b18';
  const text     = '#f0f4ff';
  const muted    = 'rgba(240,244,255,0.55)';

  const features = [
    { icon: '⚡', id: 'platform',       title: 'Platform',       desc: 'Unified HR operations across attendance, payroll, leaves, and performance — all in one intelligent workspace.', tags: ['Attendance', 'Payroll', 'Leave Management'] },
    { icon: '🏗️', id: 'infrastructure', title: 'Infrastructure', desc: 'Production-grade Spring Boot backend with PostgreSQL, Redis caching, and JWT-secured APIs — built to scale.',   tags: ['Spring Boot', 'PostgreSQL', 'Redis'] },
    { icon: '📊', id: 'metrics',        title: 'Metrics',        desc: 'Real-time analytics and AI-powered insights give HR leaders a 360° view of workforce health and trends.',       tags: ['AI Insights', 'Analytics', 'Reports'] },
  ];

  const stats = [
    { value: '5+',    label: 'Core Modules' },
    { value: '99.9%', label: 'Uptime' },
    { value: 'AI',    label: 'ML Logic' },
  ];

  const roles = [
    { role: 'Admin',    icon: '🛡️', color: '#f59e0b', desc: 'Full organizational control — manage users, departments, payroll, and system-wide settings.' },
    { role: 'HR',       icon: '👥', color: '#6366f1', desc: 'Streamlined employee management, leave approvals, payroll processing, and review workflows.' },
    { role: 'Manager',  icon: '📋', color: '#10b981', desc: 'Lead your team with attendance tracking, goal setting, performance reviews, and roster management.' },
    { role: 'Employee', icon: '👤', color: '#f472b6', desc: 'Personal dashboard for attendance, leave requests, payslips, and goal tracking.' },
  ];

  const techStack = [
    'Spring Boot 3.3', 'Java 21', 'PostgreSQL', 'Redis',
    'JWT Auth', 'React 18', 'TypeScript', 'Vite',
    'Docker', 'Render Cloud', 'Hibernate ORM', 'WebSocket',
  ];

  const anim = (delay = '0s') =>
    visible ? { animation: `lp-fade-up .7s ease ${delay} both` } : { opacity: 0 };

  return (
    <div style={{ background: bg, color: text, fontFamily: "'Inter','Segoe UI',sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64, padding: '0 5vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(5,11,24,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent',
        transition: 'all 0.35s ease',
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          NEXUS<span style={{ color: indigo }}>HR</span>
        </span>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Platform', 'Infrastructure', 'Metrics'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              style={{ color: muted, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = text)}
              onMouseLeave={e => (e.currentTarget.style.color = muted)}
            >{item}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: '1px solid rgba(99,102,241,0.35)', color: indigoLt, borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = indigoLt; }}
          >Sign In</button>
          <button onClick={() => navigate('/login')}
            style={{ background: `linear-gradient(135deg,${indigo},#4f46e5)`, border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.4)', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(99,102,241,0.6)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(99,102,241,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >Get Started</button>
        </div>
      </nav>

      {/* ── HERO (split layout) ── */}
      <section style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: 60,
        padding: '100px 6vw 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'5%', left:'5%',    width:500, height:500, borderRadius:'50%', background:'rgba(99,102,241,0.12)', filter:'blur(90px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:350, height:350, borderRadius:'50%', background:'rgba(245,158,11,0.07)', filter:'blur(90px)', pointerEvents:'none' }} />

        {/* LEFT — copy */}
        <div style={{ position: 'relative', zIndex: 2, ...anim('0s') }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.28)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 32,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#a5b4fc', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: indigo, display: 'inline-block', boxShadow: `0 0 8px ${indigo}` }} />
            AI-Enabled &nbsp;·&nbsp; Java Full Stack &nbsp;·&nbsp; Production-Grade
          </div>

          <h1 style={{ fontSize: 'clamp(40px,5.5vw,78px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-2.5px', margin: '0 0 24px' }}>
            Enterprise HR,{' '}
            <span style={{ background: `linear-gradient(135deg,${indigo} 0%,${indigoLt} 40%,${amber} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Intelligence-First
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: muted, maxWidth: 520, lineHeight: 1.7, margin: '0 0 40px' }}>
            The unified architecture for the modern employee lifecycle.
            Built on Java 21 and Spring AI for performance-critical global workforce management.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <button onClick={() => navigate('/login')}
              style={{ background: `linear-gradient(135deg,${indigo},#4f46e5)`, border: 'none', color: '#fff', borderRadius: 10, padding: '14px 34px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 28px rgba(99,102,241,0.42)', transition: 'all .25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(99,102,241,0.62)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(99,102,241,0.42)'; }}
            >Get Started →</button>
            <button onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: text, borderRadius: 10, padding: '14px 34px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
            >Explore Features</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', width: 'fit-content' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ padding: '16px 32px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: indigo, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.4)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — dashboard preview cards */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 14, ...anim('0.18s') }}>

          {/* Card 1 — Attrition AI alert */}
          <div style={{
            background: 'rgba(12,17,38,0.9)', border: '1px solid rgba(99,102,241,0.22)',
            borderRadius: 16, padding: '20px 22px', backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
            animation: visible ? 'lp-float 5s ease-in-out infinite' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ⚠ High Flight Risk
              </span>
              <span style={{ fontSize: 11, color: 'rgba(240,244,255,0.28)', fontWeight: 500 }}>ID: #4029</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Attrition Signal</div>
            <div style={{ fontSize: 13, color: muted, marginBottom: 14 }}>Lead Engineer · 4.2 years tenure</div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '78%', background: 'linear-gradient(90deg,#ef4444,#f87171)', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(240,244,255,0.32)' }}>Risk Score</span>
              <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>78 / 100</span>
            </div>
          </div>

          {/* Card 2 — Payroll Run */}
          <div style={{
            background: 'rgba(12,17,38,0.9)', border: '1px solid rgba(16,185,129,0.22)',
            borderRadius: 16, padding: '20px 22px', backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
            animation: visible ? 'lp-float 5s ease-in-out 0.8s infinite' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#34d399', fontWeight: 700 }}>$</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Payroll Run</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.32)' }}>JUNE 2026 · GENERATED</div>
                </div>
              </div>
              <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>PAID</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: '#34d399' }}>$1,248,390.00</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 6 }}>342 employees · Avg $3,650 / employee</div>
          </div>

          {/* Card 3 — Attendance live */}
          <div style={{
            background: 'rgba(12,17,38,0.9)', border: '1px solid rgba(99,102,241,0.22)',
            borderRadius: 16, padding: '18px 22px', backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.38)',
            animation: visible ? 'lp-float 5s ease-in-out 1.6s infinite' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Today's Attendance</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'lp-pulse-dot 1.8s infinite' }} />
                Live
              </span>
            </div>
            {[
              { name: 'Present', pct: 87, color: '#6366f1' },
              { name: 'Remote',  pct: 9,  color: '#f59e0b' },
              { name: 'Absent',  pct: 4,  color: '#ef4444' },
            ].map(r => (
              <div key={r.name} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: muted }}>{r.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.pct}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="platform" style={{ padding: '100px 6vw', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: indigo, textTransform: 'uppercase', marginBottom: 12 }}>What We Offer</p>
          <h2 style={{ fontSize: 'clamp(30px,4vw,50px)', fontWeight: 800, letterSpacing: '-1.5px', margin: 0 }}>Built for every layer of HR</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} id={f.id}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 36, transition: 'all .3s ease', cursor: 'default' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(99,102,241,0.08)'; el.style.borderColor = 'rgba(99,102,241,0.35)'; el.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 38, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.5px' }}>{f.title}</h3>
              <p style={{ color: muted, lineHeight: 1.72, margin: '0 0 24px', fontSize: 15 }}>{f.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {f.tags.map(t => (
                  <span key={t} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', color: '#a5b4fc', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLE MODULES ── */}
      <section style={{ padding: '80px 6vw', background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: indigo, textTransform: 'uppercase', marginBottom: 12 }}>Role-Based Access</p>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>A tailored experience for every role</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {roles.map((r, i) => (
              <div key={i}
                style={{ background: 'rgba(5,11,24,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, transition: 'all .25s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${r.color}55`; el.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${r.color}18`, border: `1px solid ${r.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{r.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: text }}>{r.role}</div>
                <p style={{ fontSize: 14, color: 'rgba(240,244,255,0.5)', lineHeight: 1.65, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="infrastructure" style={{ padding: '100px 6vw', maxWidth: 1240, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: indigo, textTransform: 'uppercase', marginBottom: 12 }}>Tech Stack</p>
        <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 48px' }}>Production-grade, battle-tested</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {techStack.map(tech => (
            <span key={tech}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: 'rgba(240,244,255,0.7)', transition: 'all .2s', cursor: 'default' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLSpanElement; el.style.background = 'rgba(99,102,241,0.12)'; el.style.color = '#a5b4fc'; el.style.borderColor = 'rgba(99,102,241,0.3)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLSpanElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.color = 'rgba(240,244,255,0.7)'; el.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >{tech}</span>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ margin: '0 5vw 80px', borderRadius: 24, background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(79,70,229,0.14) 50%,rgba(245,158,11,0.1))', border: '1px solid rgba(99,102,241,0.25)', padding: 'clamp(48px,6vw,80px) 5vw', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 'clamp(26px,4vw,52px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 16px', position: 'relative' }}>Ready to modernize your HR?</h2>
        <p style={{ color: muted, fontSize: 18, margin: '0 0 40px', position: 'relative' }}>Sign in to access your personalized dashboard.</p>
        <button onClick={() => navigate('/login')}
          style={{ background: `linear-gradient(135deg,${indigo},#4f46e5)`, border: 'none', color: '#fff', borderRadius: 12, padding: '16px 52px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 40px rgba(99,102,241,0.5)', transition: 'all .25s', position: 'relative' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.02)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 60px rgba(99,102,241,0.7)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(99,102,241,0.5)'; }}
        >Sign In to NexusHR →</button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 6vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>NEXUS<span style={{ color: indigo }}>HR</span></span>
        <span style={{ color: 'rgba(240,244,255,0.3)', fontSize: 13 }}>© 2026 NexusHR · Built with Spring Boot &amp; React</span>
      </footer>
    </div>
  );
};

export default LandingPage;
