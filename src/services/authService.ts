import { supabase, isUsingMock } from './supabase';
import { mockDb } from './mockDb';
import type { Profile } from '../types/user';

export const authService = {
  async getCurrentSessionUser(): Promise<Profile | null> {
    if (isUsingMock) {
      return mockDb.getCurrentUser();
    }
    
    const { data: { user }, error } = await supabase!.auth.getUser();
    if (error || !user) return null;
    
    // Fetch profile
    const { data: profile } = await supabase!
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profile) return profile as Profile;
    
    // Fallback if profile doesn't exist yet but user is authenticated
    const newProfile: Profile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || 'User',
      email: user.email || '',
      avatar: user.user_metadata?.avatar || null,
      role: 'user'
    };
    
    return newProfile;
  },

  async signUp(email: string, password: string, fullName: string): Promise<Profile> {
    if (isUsingMock) {
      const users = mockDb.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('User already exists');
      }
      
      const newProfile: Profile = {
        id: Math.random().toString(36).substring(2, 11),
        full_name: fullName,
        email: email,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      mockDb.saveUser(newProfile);
      mockDb.setCurrentUser(newProfile);
      return newProfile;
    }
    
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
        }
      }
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign up failed');
    
    const profile: Profile = {
      id: data.user.id,
      full_name: fullName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
      role: 'user'
    };
    
    // Create profile row in DB
    const { error: profileError } = await supabase!
      .from('users')
      .insert([profile]);
      
    if (profileError) {
      console.error('Error inserting user profile:', profileError);
    }
    
    return profile;
  },

  async signIn(email: string, password: string): Promise<Profile> {
    if (isUsingMock) {
      const users = mockDb.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Simple mock passwords checking
      if (password === 'wrong') {
        throw new Error('Invalid email or password');
      }
      
      mockDb.setCurrentUser(user);
      return user;
    }
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');
    
    // Fetch profile
    const { data: profile, error: profileErr } = await supabase!
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileErr || !profile) {
      // Create user profile if missing
      const newProfile: Profile = {
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || 'User',
        email: data.user.email || '',
        avatar: data.user.user_metadata?.avatar || null,
        role: 'user'
      };
      
      await supabase!.from('users').insert([newProfile]);
      return newProfile;
    }
    
    return profile as Profile;
  },

  async signOut(): Promise<void> {
    if (isUsingMock) {
      mockDb.setCurrentUser(null);
      return;
    }
    await supabase!.auth.signOut();
  },

  async resetPassword(email: string): Promise<void> {
    if (isUsingMock) {
      const users = mockDb.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('User not found');
      // In mock, just succeed
      return;
    }
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw new Error(error.message);
  },

  async updateProfile(fullName: string, avatarUrl: string | null): Promise<Profile> {
    const currentUser = await this.getCurrentSessionUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const updated = {
      ...currentUser,
      full_name: fullName,
      avatar: avatarUrl
    };
    
    if (isUsingMock) {
      mockDb.saveUser(updated);
      mockDb.setCurrentUser(updated);
      return updated;
    }
    
    // Update Auth User Metadata
    await supabase!.auth.updateUser({
      data: { full_name: fullName, avatar: avatarUrl }
    });
    
    // Update Profile Row
    const { error } = await supabase!
      .from('users')
      .update({ full_name: fullName, avatar: avatarUrl })
      .eq('id', currentUser.id);
      
    if (error) throw new Error(error.message);
    
    return updated;
  },

  async deleteAccount(userId: string): Promise<void> {
    if (isUsingMock) {
      mockDb.deleteUser(userId);
      mockDb.setCurrentUser(null);
      return;
    }
    
    // RLS and cascade deletes will clean up databases on Supabase
    // Delete profile row
    await supabase!.from('users').delete().eq('id', userId);
    
    // Note: deleting supabase auth user requires administrative privilege (supabase client with service role key)
    // or standard auth deletion. For standard, we call supabase.auth.admin.deleteUser (needs service role)
    // or let auth account expire / we log out. We will simulate it by deleting profile and logging out.
    await supabase!.auth.signOut();
  }
};
