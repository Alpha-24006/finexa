import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBudgetContext } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/currency';
import { 
  User, 
  Mail, 
  Shield, 
  Save, 
  Image, 
  Calendar, 
  Coins, 
  Sparkles 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { expenses } = useBudgetContext();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateProfile(fullName, avatar || null);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const totalSpentAllTime = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.full_name}`} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-full border-2 border-primary object-cover shadow-lg"
          />
          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-md">
            <Sparkles className="w-4.5 h-4.5 animate-pulse-subtle" />
          </div>
        </div>

        <div className="text-center md:text-left space-y-1">
          <h3 className="text-2xl font-extrabold text-foreground">{user?.full_name}</h3>
          <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-primary" />
            {user?.email}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Role: {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form controls */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-sm md:col-span-2">
          <h4 className="font-extrabold text-sm text-foreground border-b border-white/5 pb-2 mb-4">Edit Profile Settings</h4>
          
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input pl-10.5 text-xs font-semibold"
                  required
                />
              </div>
            </div>

            {/* Avatar Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Avatar Image URL (DiceBear/Unsplash)</label>
              <div className="relative">
                <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://api.dicebear.com/7.x/..."
                  className="w-full glass-input pl-10.5 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-btn flex items-center justify-center gap-2 py-3 mt-2 shadow-lg"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  <span>Update Details</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Stats card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-sm flex flex-col justify-between">
          <h4 className="font-extrabold text-sm text-foreground border-b border-white/5 pb-2 mb-4">Financial Footprint</h4>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Lifetime Spending</span>
                <span className="font-extrabold text-sm text-foreground">{formatCurrency(totalSpentAllTime)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Recorded Transactions</span>
                <span className="font-extrabold text-sm text-foreground">{expenses.length} Records</span>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground font-semibold border-t border-white/5 pt-4 mt-6 leading-relaxed">
            All user authentication sessions and profiles are encrypted using standard industry encryption models.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper for useMemo inside Profile
import { useMemo } from 'react';
