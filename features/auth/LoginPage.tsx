import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Lock, User } from 'lucide-react';
import { Card, Button, Input } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';

export const LoginPage: React.FC = () => {
  const { login, toast } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Incorrect credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 font-sans relative overflow-hidden">
      <Toast toast={toast} />
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 space-y-6 border-surface-border bg-surface shadow-2xl relative z-10">
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold mx-auto mb-3 shadow-lg shadow-amber-500/25 text-lg">
              N
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials to access the NexusHR workspace.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900 rounded-lg flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={15} />
                </span>
                <Input 
                  type="text" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="manager or alice"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={15} />
                </span>
                <Input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="manager123 or employee123"
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 shadow-lg flex justify-center items-center gap-2"
              size="lg"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Don't have an account? </span>
            <Link to="/register" className="text-xs font-bold text-amber-500 hover:underline">
              Create Employee Account
            </Link>
          </div>

        </Card>
      </div>
    </div>
  );
};
