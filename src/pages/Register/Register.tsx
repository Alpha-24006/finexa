import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../lib/routes';
import { UserPlus, User, Mail, Lock, BrainCircuit, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUp(email, password, name);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float-slow -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-subtle -z-10" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
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

      {/* Register Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-foreground">Create Account</h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">Join Finance AI to forecast and budget your wealth</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amlan Lenovo"
                className="w-full glass-input pl-10.5 text-xs font-medium"
                required
              />
            </div>
          </div>

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
            <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full glass-input pl-10.5 text-xs font-medium"
                required
              />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline">
            Log In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
