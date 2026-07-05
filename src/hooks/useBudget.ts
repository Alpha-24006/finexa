import { useMemo } from 'react';
import { useBudgetContext } from '../context/BudgetContext';

export interface CategoryBudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  color: string;
  isOver: boolean;
}

export const useBudget = () => {
  const { expenses, budgets, categories } = useBudgetContext();

  const budgetStatus = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Total expenses in the current month
    const currentMonthExpenses = expenses.filter(
      e => e.date.substring(0, 7) === currentMonthStr
    );

    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Find overall monthly budget (category === 'all')
    const overallBudgetObj = budgets.find(b => b.category === 'all');
    const overallLimit = overallBudgetObj ? overallBudgetObj.monthly_limit : 0;
    const remainingOverall = Math.max(0, overallLimit - totalSpent);
    const overallPercentage = overallLimit > 0 ? (totalSpent / overallLimit) * 100 : 0;
    
    // Group current month spending by category
    const categorySpend: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      categorySpend[e.category] = (categorySpend[e.category] || 0) + e.amount;
    });

    // Compute progress status for each category budget
    const categoryStatuses: CategoryBudgetStatus[] = budgets
      .filter(b => b.category !== 'all')
      .map(b => {
        const spent = categorySpend[b.category] || 0;
        const limit = b.monthly_limit;
        const remaining = Math.max(0, limit - spent);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        
        // Find matching category color
        const matchedCat = categories.find(c => c.category_name === b.category);
        const color = matchedCat ? matchedCat.color : '#6B7280';

        return {
          category: b.category,
          limit,
          spent,
          remaining,
          percentage,
          color,
          isOver: spent > limit
        };
      });

    // Alert details
    const categoriesOverBudget = categoryStatuses
      .filter(cs => cs.isOver)
      .map(cs => cs.category);

    const isOverOverallBudget = overallLimit > 0 && totalSpent > overallLimit;

    // Budget suggestions (simple recommendations)
    const suggestions: string[] = [];
    if (isOverOverallBudget) {
      suggestions.push('You are currently over budget. Consider freezing non-essential shopping.');
    }
    
    categoryStatuses.forEach(cs => {
      if (cs.isOver) {
        suggestions.push(`Your spending in "${cs.category}" is over by ₹${(cs.spent - cs.limit).toLocaleString()}. Try reducing dining/deliveries or secondary subscriptions.`);
      } else if (cs.percentage >= 80) {
        suggestions.push(`Warning: You have used ${Math.round(cs.percentage)}% of your "${cs.category}" budget. You only have ₹${cs.remaining.toLocaleString()} left.`);
      }
    });

    if (suggestions.length === 0) {
      suggestions.push('Your budgets look healthy! Maintain your current pacing to reach your savings target.');
    }

    return {
      totalSpent,
      overallLimit,
      remainingOverall,
      overallPercentage,
      categoryStatuses,
      categoriesOverBudget,
      isOverOverallBudget,
      suggestions
    };
  }, [expenses, budgets, categories]);

  return budgetStatus;
};
