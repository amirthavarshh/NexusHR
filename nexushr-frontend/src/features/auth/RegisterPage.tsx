import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Lock, User, Mail } from 'lucide-react';
import { Card, Button, Input } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';

export const RegisterPage: React.FC = () => {
  const { register, toast } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Could not register user account');
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
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">Sign Up</h2>
            <p className="text-xs text-slate-400 mt-1">Register a new employee access portal workspace.</p>
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
                  placeholder="e.g. jdoe"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={15} />
                </span>
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
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
                  placeholder="Create a strong password"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-[11px] text-slate-400">
              <span className="font-bold text-amber-500 uppercase block mb-1">Registration Notice</span>
              Self-registered accounts are automatically provisioned with the secure <span className="font-bold text-slate-200">Employee role</span> in the enterprise directory.
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 shadow-lg flex justify-center items-center gap-2"
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Already registered? </span>
            <Link to="/login" className="text-xs font-bold text-amber-500 hover:underline">
              Sign In
            </Link>
          </div>

        </Card>
      </div>
    </div>
  );
};
