import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AIChatAssistant } from '../common/AIChatAssistant';
import { ROUTES } from '../../lib/routes';

export const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If session is loading, show glassmorphism screen loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl glass-card border border-white/20 dark:border-white/10 shadow-2xl w-80">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-extrabold text-lg text-foreground animate-pulse-subtle">FINEXA</h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 lg:p-4 lg:pl-2">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto mt-4 rounded-2xl glass-card p-6 border border-white/10 shadow-inner">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
};
