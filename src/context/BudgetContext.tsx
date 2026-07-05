import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { expenseService } from '../services/expenseService';
import { reportService } from '../services/reportService';
import type { Expense, Category } from '../types/expense';
import type { Budget } from '../types/budget';

interface BudgetContextType {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshAllData: () => Promise<void>;
  addExpense: (e: Omit<Expense, 'user_id' | 'id'> & { id?: string }) => Promise<void>;
  updateExpense: (e: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  saveBudget: (b: Omit<Budget, 'user_id' | 'id'> & { id?: string }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAllData = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setBudgets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [expData, budData, catData] = await Promise.all([
        expenseService.getExpenses(user.id),
        reportService.getBudgets(user.id),
        expenseService.getCategories()
      ]);
      setExpenses(expData);
      setBudgets(budData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Failed to load expense and budget data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const addExpense = async (expense: Omit<Expense, 'user_id' | 'id'> & { id?: string }) => {
    if (!user) return;
    try {
      await expenseService.addExpense({ ...expense, user_id: user.id });
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
      throw err;
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      await expenseService.updateExpense(expense);
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
      throw err;
    }
  };

  const saveBudget = async (budget: Omit<Budget, 'user_id' | 'id'> & { id?: string }) => {
    if (!user) return;
    try {
      await reportService.saveBudget({ ...budget, user_id: user.id });
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await reportService.deleteBudget(id);
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
      throw err;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await expenseService.addCategory(category);
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await expenseService.deleteCategory(id);
      await refreshAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      throw err;
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        expenses,
        budgets,
        categories,
        loading,
        error,
        refreshAllData,
        addExpense,
        updateExpense,
        deleteExpense,
        saveBudget,
        deleteBudget,
        addCategory,
        deleteCategory
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudgetContext must be used within BudgetProvider');
  return context;
};
