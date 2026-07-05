import type { Expense } from '../types/expense';
import type { Budget } from '../types/budget';

export interface AIInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  message: string;
  category?: string;
  percentageChange?: number;
  tip?: string;
}

export function generateInsightsAndRecommendations(
  expenses: Expense[],
  budgets: Budget[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  
  if (expenses.length === 0) {
    return [
      {
        id: 'no-data',
        type: 'info',
        message: 'Welcome to your AI Expense Advisor! Start recording expenses to get smart recommendations.',
        tip: 'Try adding your recurring bills first.'
      }
    ];
  }

  // Get current month and previous month string representation YYYY-MM
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const lastMonth = new Date();
  lastMonth.setMonth(now.getMonth() - 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  // Filter expenses by month
  const currentExpenses = expenses.filter(e => e.date.substring(0, 7) === currentMonthStr);
  const previousExpenses = expenses.filter(e => e.date.substring(0, 7) === lastMonthStr);

  // Group by category
  const currentCategorySum: Record<string, number> = {};
  const previousCategorySum: Record<string, number> = {};

  currentExpenses.forEach(e => {
    currentCategorySum[e.category] = (currentCategorySum[e.category] || 0) + e.amount;
  });

  previousExpenses.forEach(e => {
    previousCategorySum[e.category] = (previousCategorySum[e.category] || 0) + e.amount;
  });

  // 1. Compare Category-wise spending trends
  Object.keys(currentCategorySum).forEach(cat => {
    const currentVal = currentCategorySum[cat];
    const prevVal = previousCategorySum[cat] || 0;
    
    if (prevVal > 0) {
      const pctChange = ((currentVal - prevVal) / prevVal) * 100;
      
      if (pctChange >= 15) {
        insights.push({
          id: `trend-${cat}`,
          type: 'warning',
          message: `You spent ${Math.round(pctChange)}% more on ${cat} this month compared to last month.`,
          category: cat,
          percentageChange: pctChange,
          tip: `Consider reviewing transaction notes for ${cat} to identify non-essential purchases.`
        });
      } else if (pctChange <= -15) {
        insights.push({
          id: `trend-${cat}`,
          type: 'success',
          message: `Great job! Your spending in ${cat} decreased by ${Math.round(Math.abs(pctChange))}% this month.`,
          category: cat,
          percentageChange: pctChange,
          tip: `Try redirecting these saved funds into your high-yield savings goals.`
        });
      }
    }
  });

  // 2. Budget vs Expense alerts
  budgets.forEach(b => {
    if (b.category === 'all') {
      const totalExpense = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
      const ratio = totalExpense / b.monthly_limit;
      
      if (ratio > 1.0) {
        insights.push({
          id: 'budget-all-over',
          type: 'alert',
          message: `You have exceeded your total monthly budget limit of ₹${b.monthly_limit.toLocaleString()} by ₹${(totalExpense - b.monthly_limit).toLocaleString()}!`,
          tip: 'Reduce discretionary spend in Shopping or Entertainment immediately to stabilize your balance.'
        });
      } else if (ratio >= 0.85) {
        insights.push({
          id: 'budget-all-warn',
          type: 'warning',
          message: `You have utilized ${Math.round(ratio * 100)}% of your overall monthly budget limit (₹${b.monthly_limit.toLocaleString()}).`,
          tip: 'You have only ₹' + Math.round(b.monthly_limit - totalExpense).toLocaleString() + ' remaining. Slow down on non-essential purchases.'
        });
      }
    } else {
      const catSum = currentCategorySum[b.category] || 0;
      const ratio = catSum / b.monthly_limit;
      
      if (ratio > 1.0) {
        insights.push({
          id: `budget-over-${b.category}`,
          type: 'alert',
          message: `Overspending Alert: Your ${b.category} expenses (₹${catSum.toLocaleString()}) exceeded the ₹${b.monthly_limit.toLocaleString()} category limit.`,
          category: b.category,
          tip: `Look into generic brands for ${b.category} or trim shopping listings to balance the budget.`
        });
      } else if (ratio >= 0.8) {
        insights.push({
          id: `budget-warn-${b.category}`,
          type: 'warning',
          message: `Budget Warning: You spent ${Math.round(ratio * 100)}% of your ${b.category} limit (₹${b.monthly_limit.toLocaleString()}).`,
          category: b.category,
          tip: `You have ₹${Math.round(b.monthly_limit - catSum).toLocaleString()} left for ${b.category} until the end of the month.`
        });
      }
    }
  });

  // 3. General savings recommendation suggestions
  const totalSpend = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalSpend > 10000) {
    const potentialSaving = Math.round(totalSpend * 0.1);
    insights.push({
      id: 'savings-recommendation',
      type: 'info',
      message: `AI Recommendation: You can save ₹${potentialSaving.toLocaleString()} next month by cutting back 10% across discretionary items.`,
      tip: 'Cancel unused subscriptions and make a shopping list before ordering meals.'
    });
  }

  // 4. Stable categories
  const commonCategories = ['Utilities', 'Health'];
  commonCategories.forEach(cat => {
    const curr = currentCategorySum[cat] || 0;
    const prev = previousCategorySum[cat] || 0;
    if (curr > 0 && prev > 0 && Math.abs((curr - prev) / prev) < 0.08) {
      insights.push({
        id: `stable-${cat}`,
        type: 'info',
        message: `${cat} bills remain stable and predictable.`,
        tip: `Excellent for setting aside precise cash blocks in your monthly planning.`
      });
    }
  });

  return insights;
}
