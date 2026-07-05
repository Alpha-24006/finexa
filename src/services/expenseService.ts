import { supabase, isUsingMock } from './supabase';
import { mockDb } from './mockDb';
import type { Expense, Category } from '../types/expense';

export const expenseService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    if (isUsingMock) {
      return mockDb.getExpenses().filter(e => e.user_id === userId);
    }
    
    const { data, error } = await supabase!
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    return data as Expense[];
  },

  async getAllExpensesAdmin(): Promise<Expense[]> {
    if (isUsingMock) {
      return mockDb.getExpenses();
    }
    
    const { data, error } = await supabase!
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    return data as Expense[];
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    if (isUsingMock) {
      mockDb.saveExpense(newExpense);
      return newExpense;
    }
    
    const { data, error } = await supabase!
      .from('expenses')
      .insert([expense])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data as Expense;
  },

  async updateExpense(expense: Expense): Promise<Expense> {
    if (isUsingMock) {
      mockDb.saveExpense(expense);
      return expense;
    }
    
    const { data, error } = await supabase!
      .from('expenses')
      .update(expense)
      .eq('id', expense.id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data as Expense;
  },

  async deleteExpense(id: string): Promise<void> {
    if (isUsingMock) {
      mockDb.deleteExpense(id);
      return;
    }
    
    const { error } = await supabase!
      .from('expenses')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  },

  async getCategories(): Promise<Category[]> {
    if (isUsingMock) {
      return mockDb.getCategories();
    }
    
    const { data, error } = await supabase!
      .from('categories')
      .select('*');
      
    if (error) throw new Error(error.message);
    return data as Category[];
  },

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    if (isUsingMock) {
      mockDb.saveCategory(newCategory);
      return newCategory;
    }
    
    const { data, error } = await supabase!
      .from('categories')
      .insert([category])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isUsingMock) {
      mockDb.deleteCategory(id);
      return;
    }
    
    const { error } = await supabase!
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
};
