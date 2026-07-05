import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../lib/routes';
import { LogIn, Mail, Lock, BrainCircuit, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Login shortcuts for rapid review
  const handleQuickLogin = async (role: 'user' | 'admin') => {
    setLoading(true);
    setError(null);
    const targetEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
    const targetPass = 'password';
    
    try {
      await signIn(targetEmail, targetPass);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float-slow -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-subtle -z-10" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 animate-float-slow">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 shadow-xl shadow-primary/20">
          <BrainCircuit className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            FINANCE AI
          </h1>
          <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest -mt-1">Predictive Expense System</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-2xl relative">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">Access your AI-powered financial companion</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full glass-input pl-10.5 text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Password</label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-[10px] font-bold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-10.5 text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full glass-btn flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest bg-background">
            Quick Testing Access
          </span>
        </div>

        {/* Quick login grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickLogin('user')}
            disabled={loading}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 active:scale-95 text-primary text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test User</span>
          </button>
          <button
            onClick={() => handleQuickLogin('admin')}
            disabled={loading}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 active:scale-95 text-red-500 text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Admin</span>
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
