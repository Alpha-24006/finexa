import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../lib/routes';
import { Mail, ArrowLeft, BrainCircuit, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float-slow -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-subtle -z-10" />

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

      {/* Forgot Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Link to={ROUTES.LOGIN} className="p-2 rounded-lg hover:bg-white/10 text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-xl font-extrabold text-foreground">Reset Password</h2>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-500 mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Reset Link Sent</h3>
              <p className="text-xs text-muted-foreground mt-1 px-4">
                We have sent instructions to **${email}** to reset your password. Please check your inbox.
              </p>
            </div>
            <Link to={ROUTES.LOGIN} className="w-full glass-btn-secondary block text-xs font-bold text-center mt-4">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Enter the email address associated with your account, and we will email you a password recovery link.
            </p>

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
