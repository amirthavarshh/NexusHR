import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      if (session.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (session.role === 'MANAGER') navigate('/manager/dashboard', { replace: true });
      else if (session.role === 'HR') navigate('/hr/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: '⚡',
      title: 'Platform',
      desc: 'Unified HR operations across attendance, payroll, leaves, and performance — all in one intelligent workspace.',
      tags: ['Attendance', 'Payroll', 'Leave Management'],
    },
    {
      icon: '🏗️',
      title: 'Infrastructure',
      desc: 'Production-grade Spring Boot backend with PostgreSQL, Redis caching, and JWT-secured APIs — built to scale.',
      tags: ['Spring Boot', 'PostgreSQL', 'Redis'],
    },
    {
      icon: '📊',
      title: 'Metrics',
      desc: 'Real-time analytics and AI-powered insights give HR leaders a 360° view of workforce health and trends.',
      tags: ['AI Insights', 'Analytics', 'Reports'],
    },
  ];

  const stats = [
    { value: '10+', label: 'Modules' },
    { value: '3', label: 'Role Dashboards' },
    { value: '100%', label: 'API Secured' },
    { value: 'AI', label: 'Powered Insights' },
  ];

  const roles = [
    { role: 'Admin', icon: '🛡️', desc: 'Full organizational control — manage users, departments, payroll, and system-wide settings.' },
    { role: 'HR', icon: '👥', desc: 'Streamlined employee management, leave approvals, payroll processing, and review workflows.' },
    { role: 'Manager', icon: '📋', desc: 'Lead your team with attendance tracking, goal setting, performance reviews, and roster management.' },
    { role: 'Employee', icon: '👤', desc: 'Personal dashboard for attendance, leave requests, payslips, and goal tracking.' },
  ];

  return (
    <div style={{ background: '#050b18', color: '#f0f4ff', fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 5vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
        background: scrolled ? 'rgba(5,11,24,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
            NEXUS<span style={{ color: '#6366f1' }}>HR</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Platform', 'Infrastructure', 'Metrics'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: 'rgba(240,244,255,0.65)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0f4ff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.65)')}
            >{item}</a>
          ))}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', borderRadius: 8, padding: '8px 20px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a5b4fc'; }}
          >Sign In</button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 5vw 80px',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%)',
      }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 100, padding: '6px 18px', marginBottom: 36,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#a5b4fc',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block', boxShadow: '0 0 8px #6366f1' }} />
          AI-Enabled &nbsp;·&nbsp; Java Full Stack &nbsp;·&nbsp; Production-Grade
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 800,
          lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 28px',
          maxWidth: 900,
        }}>
          Enterprise HR,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Intelligence-First</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(240,244,255,0.6)',
          maxWidth: 600, lineHeight: 1.65, margin: '0 0 48px',
          fontWeight: 400,
        }}>
          NexusHR unifies your entire workforce lifecycle — from hiring to payroll —
          with real-time AI insights and role-based access for every team member.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none', color: '#fff', borderRadius: 10,
              padding: '14px 36px', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 0 30px rgba(99,102,241,0.4)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)'; }}
          >Get Started →</button>
          <button
            onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(240,244,255,0.8)', borderRadius: 10,
              padding: '14px 36px', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >Explore Features</button>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 0, marginTop: 72,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, overflow: 'hidden', flexWrap: 'wrap',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '20px 40px', textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,244,255,0.45)', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="platform" style={{ padding: '100px 5vw', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 12 }}>What We Offer</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
            Built for every layer of HR
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} id={f.title.toLowerCase()} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 36,
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.border = '1px solid rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.5px' }}>{f.title}</h3>
              <p style={{ color: 'rgba(240,244,255,0.55)', lineHeight: 1.7, margin: '0 0 24px', fontSize: 15 }}>{f.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {f.tags.map(t => (
                  <span key={t} style={{
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc', borderRadius: 6, padding: '4px 12px',
                    fontSize: 12, fontWeight: 600,
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Modules ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 5vw', background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 12 }}>Role-Based Access</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
              A tailored experience for every role
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {roles.map((r, i) => (
              <div key={i} style={{
                background: 'rgba(5,11,24,0.6)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 28, transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{r.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#f0f4ff' }}>{r.role}</div>
                <p style={{ fontSize: 14, color: 'rgba(240,244,255,0.5)', lineHeight: 1.65, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ────────────────────────────────────────────── */}
      <section id="infrastructure" style={{ padding: '100px 5vw', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 12 }}>Tech Stack</p>
        <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 48px' }}>
          Production-grade, battle-tested
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {['Spring Boot 3.3', 'Java 21', 'PostgreSQL 18', 'Redis', 'JWT Auth', 'React 18', 'TypeScript', 'Vite', 'Docker', 'Render Cloud', 'Hibernate ORM', 'WebSocket'].map(tech => (
            <span key={tech} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
              color: 'rgba(240,244,255,0.7)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.border = '1px solid rgba(99,102,241,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(240,244,255,0.7)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}
            >{tech}</span>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section style={{
        margin: '0 5vw 80px', borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.15) 50%, rgba(245,158,11,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        padding: 'clamp(48px, 6vw, 80px) 5vw', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 16px', position: 'relative' }}>
          Ready to modernize your HR?
        </h2>
        <p style={{ color: 'rgba(240,244,255,0.6)', fontSize: 18, margin: '0 0 40px', position: 'relative' }}>
          Sign in to access your personalized dashboard.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: 'none', color: '#fff', borderRadius: 12,
            padding: '16px 48px', fontSize: 18, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 0 40px rgba(99,102,241,0.5)',
            transition: 'all 0.25s', position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(99,102,241,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.5)'; }}
        >Sign In to NexusHR →</button>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>NEXUS<span style={{ color: '#6366f1' }}>HR</span></span>
        <span style={{ color: 'rgba(240,244,255,0.3)', fontSize: 13 }}>© 2026 NexusHR · Built with Spring Boot &amp; React</span>
      </footer>
    </div>
  );
};

export default LandingPage;
