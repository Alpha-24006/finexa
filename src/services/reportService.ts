import { supabase, isUsingMock } from './supabase';
import { mockDb } from './mockDb';
import type { Report } from '../types/report';
import type { Budget } from '../types/budget';

export const reportService = {
  // Reports Methods
  async getReports(userId: string): Promise<Report[]> {
    if (isUsingMock) {
      return mockDb.getReports().filter(r => r.user_id === userId).sort((a,b) => a.month.localeCompare(b.month));
    }
    
    const { data, error } = await supabase!
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: true });
      
    if (error) throw new Error(error.message);
    return data as Report[];
  },

  // Budgets Methods
  async getBudgets(userId: string): Promise<Budget[]> {
    if (isUsingMock) {
      return mockDb.getBudgets().filter(b => b.user_id === userId);
    }
    
    const { data, error } = await supabase!
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw new Error(error.message);
    return data as Budget[];
  },

  async saveBudget(budget: Omit<Budget, 'id'> & { id?: string }): Promise<Budget> {
    const finalBudget: Budget = {
      ...budget,
      id: budget.id || Math.random().toString(36).substring(2, 11)
    };
    
    if (isUsingMock) {
      mockDb.saveBudget(finalBudget);
      return finalBudget;
    }
    
    // Check if budget already exists for upsert
    const { data: existing } = await supabase!
      .from('budgets')
      .select('id')
      .eq('user_id', budget.user_id)
      .eq('category', budget.category)
      .maybeSingle();
      
    if (existing) {
      const { data, error } = await supabase!
        .from('budgets')
        .update({ monthly_limit: budget.monthly_limit })
        .eq('id', existing.id)
        .select()
        .single();
        if (error) throw new Error(error.message);
        return data as Budget;
    } else {
      const { data, error } = await supabase!
        .from('budgets')
        .insert([budget])
        .select()
        .single();
        if (error) throw new Error(error.message);
        return data as Budget;
    }
  },

  async deleteBudget(id: string): Promise<void> {
    if (isUsingMock) {
      mockDb.deleteBudget(id);
      return;
    }
    
    const { error } = await supabase!
      .from('budgets')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
};
