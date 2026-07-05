import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../lib/routes';
import { 
  LayoutDashboard, 
  DollarSign, 
  Wallet, 
  BrainCircuit, 
  BarChart3, 
  FileText, 
  Settings, 
  User, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLinkClick = () => {
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Expenses', path: ROUTES.EXPENSES, icon: DollarSign },
    { name: 'Budgets', path: ROUTES.BUDGET, icon: Wallet },
    { name: 'AI Prediction', path: ROUTES.PREDICTION, icon: BrainCircuit },
    { name: 'Analytics', path: ROUTES.ANALYTICS, icon: BarChart3 },
    { name: 'Reports', path: ROUTES.REPORTS, icon: FileText },
    { name: 'Profile', path: ROUTES.PROFILE, icon: User },
    { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
  ];

  const adminItem = { name: 'Admin Panel', path: ROUTES.ADMIN, icon: ShieldAlert };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-full 
        glass-card border-r border-white/20 dark:border-white/10 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4 lg:rounded-2xl
      `}>
        {/* Logo and close btn */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 shadow-lg shadow-primary/20">
              <BrainCircuit className="w-6 h-6 text-white animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                FINEXA
              </span>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest -mt-1">Forecaster</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 lg:hidden text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-indigo-600/10 text-primary border-l-4 border-primary shadow-sm shadow-primary/5' 
                  : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* Admin link conditionally visible */}
          {user?.role === 'admin' && (
            <NavLink
              to={adminItem.path}
              onClick={handleLinkClick}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 mt-4
                ${isActive 
                  ? 'bg-red-500/10 text-red-500 border-l-4 border-red-500' 
                  : 'text-red-400 hover:bg-red-500/5'}
              `}
            >
              <adminItem.icon className="w-5 h-5" />
              <span>{adminItem.name}</span>
            </NavLink>
          )}
        </nav>

        {/* Bottom User Info & Controls */}
        <div className="p-4 border-t border-white/10 space-y-4">
          {/* User profile preview */}
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 dark:bg-black/10">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.full_name}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-foreground">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary-foreground'}`}>
                {user.role}
              </span>
            </div>
          )}

          {/* Theme toggle & Signout */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-foreground transition-all duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4.5 h-4.5 text-amber-400" />
                  <span className="text-xs font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4.5 h-4.5 text-indigo-400" />
                  <span className="text-xs font-semibold">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={signOut}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all duration-200"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="text-xs font-bold">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
