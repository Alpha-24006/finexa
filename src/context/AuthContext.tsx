import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { Profile } from '../types/user';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (e: string, p: string) => Promise<Profile>;
  signUp: (e: string, p: string, n: string) => Promise<Profile>;
  signOut: () => Promise<void>;
  updateProfile: (n: string, a: string | null) => Promise<Profile>;
  deleteAccount: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const curr = await authService.getCurrentSessionUser();
      setUser(curr);
    } catch (err) {
      console.error('Session refresh failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signIn = async (e: string, p: string) => {
    setLoading(true);
    try {
      const u = await authService.signIn(e, p);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (e: string, p: string, n: string) => {
    setLoading(true);
    try {
      const u = await authService.signUp(e, p, n);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (n: string, a: string | null) => {
    const updated = await authService.updateProfile(n, a);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await authService.deleteAccount(user.id);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        deleteAccount,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
