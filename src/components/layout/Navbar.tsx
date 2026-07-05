import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBudget } from '../../hooks/useBudget';
import { Bell, Menu, Calendar, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const { totalSpent, overallLimit, categoriesOverBudget, isOverOverallBudget } = useBudget();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Financial Dashboard';
      case '/expenses': return 'Expense Tracker';
      case '/budget': return 'Budget Planner';
      case '/prediction': return 'AI Prediction Studio';
      case '/analytics': return 'Deep Analytics';
      case '/reports': return 'Financial Reports';
      case '/profile': return 'User Profile';
      case '/settings': return 'System Settings';
      case '/admin': return 'Administration Console';
      default: return 'Finance AI';
    }
  };

  // Compile notification messages
  const notifications: string[] = [];
  if (isOverOverallBudget) {
    notifications.push(`Alert: You exceeded your monthly budget of ${formatCurrency(overallLimit)}!`);
  } else if (overallLimit > 0 && totalSpent >= overallLimit * 0.85) {
    notifications.push(`Warning: You have used ${Math.round((totalSpent / overallLimit) * 100)}% of your overall budget.`);
  }

  categoriesOverBudget.forEach(cat => {
    notifications.push(`Overspent: "${cat}" category budget has been breached.`);
  });

  if (notifications.length === 0) {
    notifications.push('All system operations are healthy. No budget warnings.');
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="relative flex items-center justify-between px-6 py-4 rounded-2xl glass-card border border-white/20 dark:border-white/10 shadow-lg">
      {/* Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2.5 rounded-xl border border-white/15 hover:bg-white/10 text-foreground lg:hidden transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-extrabold text-xl md:text-2xl text-foreground tracking-tight">
            {getPageTitle()}
          </h2>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">
            <span>Finance AI</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {currentDate}
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4 relative">
        {/* Quick AI Tip Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse-subtle" />
          <span>AI Assistant Ready</span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2.5 rounded-xl border border-white/15 hover:bg-white/15 text-foreground transition-all duration-200 relative
            ${notifications.length > 1 && !notifications.includes('All system operations are healthy. No budget warnings.') ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
          `}
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && !notifications.includes('All system operations are healthy. No budget warnings.') && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border border-white dark:border-slate-900 rounded-full" />
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-14 w-80 glass-card border border-white/20 dark:border-slate-800/80 shadow-2xl rounded-2xl p-4 z-50 animate-float-slow">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-extrabold text-sm text-foreground">Active Notifications</span>
              {notifications.length > 0 && !notifications.includes('All system operations are healthy. No budget warnings.') && (
                <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full">
                  {notifications.length} Alerts
                </span>
              )}
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl text-xs font-medium border
                    ${msg.includes('Alert') || msg.includes('Overspent') 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400' 
                      : msg.includes('Warning') 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400' 
                        : 'bg-white/5 border-white/10 text-muted-foreground'
                    }
                  `}
                >
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
