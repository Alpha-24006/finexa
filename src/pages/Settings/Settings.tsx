import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBudgetContext } from '../../context/BudgetContext';
import { CURRENCIES, LANGUAGES } from '../../lib/constants';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  RefreshCw, 
  Volume2, 
  Globe, 
  Coins, 
  Sun, 
  Moon,
  AlertTriangle
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { refreshAllData } = useBudgetContext();

  // Local settings bindings
  const [currency, setCurrency] = useState(() => localStorage.getItem('user_currency') || 'INR');
  const [language, setLanguage] = useState(() => localStorage.getItem('user_lang') || 'en');
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(false);
  const [notifyOverspeed, setNotifyOverspeed] = useState(true);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_currency', currency);
    localStorage.setItem('user_lang', language);
    setSuccessMsg('Preferences saved successfully!');
    
    // Refresh calculations across contexts
    refreshAllData();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you absolutely sure you want to wipe all transaction records? This cannot be undone.')) {
      // Clear localStorage tables related to expenses and budgets
      localStorage.removeItem('ai_expense_expenses');
      localStorage.removeItem('ai_expense_budgets');
      localStorage.removeItem('ai_expense_predictions');
      localStorage.removeItem('ai_expense_reports');
      
      // Force reload context
      refreshAllData();
      alert('Local database tables wiped and re-seeded successfully!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Main Configurations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core preferences form */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-sm">
          <h4 className="font-extrabold text-sm text-foreground border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
            <SettingsIcon className="w-4.5 h-4.5" />
            System Preferences
          </h4>

          <form onSubmit={handleSavePreferences} className="space-y-4">
            {/* Currency */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Default Currency</label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full glass-input pl-10.5 text-xs font-semibold"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">System Language</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full glass-input pl-10.5 text-xs font-semibold"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Visual Theme</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 hover:bg-white/10 text-foreground transition-all font-semibold text-xs"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  Toggle {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold bg-white/5 px-2 py-0.5 rounded">Active</span>
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full glass-btn text-xs font-bold py-3 mt-2 shadow-lg"
            >
              Save Preferences
            </button>
          </form>
        </div>

        {/* Notifications Drawer config */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-foreground border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
              <Volume2 className="w-4.5 h-4.5" />
              Notifications Configuration
            </h4>

            {/* Budget Alert checkbox */}
            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs font-semibold text-foreground">
              <span className="flex flex-col">
                <span>Budget Alert warnings</span>
                <span className="text-[9px] text-muted-foreground">Notify when expenses cross 85% limit</span>
              </span>
              <input
                type="checkbox"
                checked={notifyBudget}
                onChange={(e) => setNotifyBudget(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Overspending notification */}
            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs font-semibold text-foreground">
              <span className="flex flex-col">
                <span>Critical Overspending warning</span>
                <span className="text-[9px] text-muted-foreground">Immediate alerts upon category breach</span>
              </span>
              <input
                type="checkbox"
                checked={notifyOverspeed}
                onChange={(e) => setNotifyOverspeed(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>

            {/* Weekly summary email checkbox */}
            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs font-semibold text-foreground">
              <span className="flex flex-col">
                <span>Weekly Prediction summaries</span>
                <span className="text-[9px] text-muted-foreground">Email AI forecast predictions on Sundays</span>
              </span>
              <input
                type="checkbox"
                checked={notifyWeekly}
                onChange={(e) => setNotifyWeekly(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </label>
          </div>

          <p className="text-[9px] text-muted-foreground font-semibold border-t border-white/5 pt-4 mt-6 leading-relaxed">
            Note: System notifications require browser cookie and local storage permission to execute background listeners.
          </p>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="glass-card p-6 rounded-3xl border border-red-500/20 bg-red-500/5 shadow-sm">
        <h4 className="font-extrabold text-sm text-red-500 border-b border-red-500/10 pb-2 mb-4 flex items-center gap-1.5">
          <AlertTriangle className="w-4.5 h-4.5" />
          Danger Zone
        </h4>

        <p className="text-xs text-muted-foreground/80 font-semibold mb-6">
          Wiping transactions or deleting profiles will clear historical database records permanently, disrupting forecasting accuracy until new logs are populated.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={handleResetData}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Account Database</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you absolutely sure you want to delete your account? All logs will be permanently erased.')) {
                deleteAccount();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/10"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
