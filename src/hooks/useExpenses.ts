import { useState, useMemo } from 'react';
import { useBudgetContext } from '../context/BudgetContext';
import type { Expense } from '../types/expense';

export interface ExpenseFilters {
  search: string;
  category: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount: number | '';
  maxAmount: number | '';
}

export const useExpenses = () => {
  const { expenses, categories, loading, error, addExpense, updateExpense, deleteExpense, addCategory, deleteCategory } = useBudgetContext();
  
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    category: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense | 'none';
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'desc'
  });

  const updateFilters = (newFilters: Partial<ExpenseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const changeSort = (key: keyof Expense) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'desc' };
    });
  };

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(e => e.category === filters.category);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      result = result.filter(e => e.payment_method === filters.paymentMethod);
    }

    // Date range filter
    if (filters.startDate) {
      result = result.filter(e => e.date >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter(e => e.date <= filters.endDate);
    }

    // Amount range filter
    if (filters.minAmount !== '') {
      const min = filters.minAmount as number;
      result = result.filter(e => e.amount >= min);
    }
    if (filters.maxAmount !== '') {
      const max = filters.maxAmount as number;
      result = result.filter(e => e.amount <= max);
    }

    // Sort
    if (sortConfig.key !== 'none') {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string') {
          return direction === 'asc' 
            ? valA.localeCompare(valB as string) 
            : (valB as string).localeCompare(valA);
        }

        if (typeof valA === 'number') {
          return direction === 'asc'
            ? valA - (valB as number)
            : (valB as number) - valA;
        }

        return 0;
      });
    }

    return result;
  }, [expenses, filters, sortConfig]);

  return {
    expenses,
    filteredExpenses,
    categories,
    loading,
    error,
    filters,
    sortConfig,
    updateFilters,
    resetFilters,
    changeSort,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    deleteCategory
  };
};
