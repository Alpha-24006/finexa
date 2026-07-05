import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../../hooks/useExpenses';
import { useBudget } from '../../hooks/useBudget';
import { usePrediction } from '../../hooks/usePrediction';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatter';
import { ROUTES } from '../../lib/routes';
import {
  MonthlyExpenseLineChart,
  CategoryPieChart,
  WeeklySpendingBarChart,
  ExpenseHeatmap,
  RadarChart
} from '../../components/charts/ExpenseCharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Wallet,
  Coins,
  Brain,
  ShieldCheck
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, categories } = useExpenses();
  const { totalSpent, overallLimit, remainingOverall, categoryStatuses, suggestions } = useBudget();
  const { forecastResults } = usePrediction();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Weekly spending calculation
  const weeklySpending = useMemo(() => {
    const data = [
      { week: 'Week 1', amount: 0 },
      { week: 'Week 2', amount: 0 },
      { week: 'Week 3', amount: 0 },
      { week: 'Week 4', amount: 0 }
    ];

    const currentMonthExps = expenses.filter(e => e.date.substring(0, 7) === currentMonthStr);
    
    currentMonthExps.forEach(e => {
      const day = parseInt(e.date.split('-')[2], 10);
      if (day <= 7) data[0].amount += e.amount;
      else if (day <= 14) data[1].amount += e.amount;
      else if (day <= 21) data[2].amount += e.amount;
      else data[3].amount += e.amount;
    });

    return data;
  }, [expenses, currentMonthStr]);

  // 2. Pie Chart category grouping
  const pieChartData = useMemo(() => {
    const currentMonthExps = expenses.filter(e => e.date.substring(0, 7) === currentMonthStr);
    const catSums: Record<string, number> = {};

    currentMonthExps.forEach(e => {
      catSums[e.category] = (catSums[e.category] || 0) + e.amount;
    });

    return categories.map(cat => ({
      category: cat.category_name,
      amount: catSums[cat.category_name] || 0,
      color: cat.color
    }));
  }, [expenses, categories, currentMonthStr]);

  // 3. Line Chart historical totals grouping
  const lineChartData = useMemo(() => {
    return forecastResults.historicalPoints.slice(-6); // Last 6 months
  }, [forecastResults]);

  // 4. Recent transactions list (last 5)
  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [expenses]);

  // 5. Savings calculation (mock monthly income vs expenses)
  const currentSavings = useMemo(() => {
    const mockIncome = 55000; // Baseline income for calculations
    return Math.max(0, mockIncome - totalSpent);
  }, [totalSpent]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-indigo-600/5 border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
        <div className="space-y-1">
          <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse-subtle" />
            Financial Intelligence Dashboard
          </h3>
          <p className="text-xs text-muted-foreground font-semibold">
            Track metrics, budget category limits, and verify next month's predictive forecasting.
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.EXPENSES, { state: { openAddModal: true } })}
          className="glass-btn flex items-center gap-2 text-xs font-bold shrink-0 shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Top Professional Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Expense */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-28 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Spent (Month)</span>
          <h4 className="text-lg md:text-xl font-extrabold text-foreground truncate">{formatCurrency(totalSpent)}</h4>
          <span className="text-[9px] text-red-500 font-extrabold flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Pacing</span>
          </span>
        </div>

        {/* Monthly Budget */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-28 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Overall Budget</span>
          <h4 className="text-lg md:text-xl font-extrabold text-foreground truncate">{formatCurrency(overallLimit)}</h4>
          <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <span>Monthly limit</span>
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-28 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Remaining</span>
          <h4 className={`text-lg md:text-xl font-extrabold truncate ${totalSpent > overallLimit ? 'text-red-500 animate-pulse-subtle' : 'text-foreground'}`}>
            {formatCurrency(remainingOverall)}
          </h4>
          <span className={`text-[9px] font-extrabold flex items-center gap-1 ${totalSpent > overallLimit ? 'text-red-400' : 'text-green-500'}`}>
            <Coins className="w-3.5 h-3.5" />
            <span>{totalSpent > overallLimit ? 'Limit Exceeded' : 'Under limit'}</span>
          </span>
        </div>

        {/* Expected Next Month */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-28 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">AI Forecast (Next Month)</span>
          <h4 className="text-lg md:text-xl font-extrabold text-primary truncate">
            {formatCurrency(forecastResults.nextMonthEstimate)}
          </h4>
          <span className="text-[9px] text-primary font-extrabold flex items-center gap-0.5">
            <Brain className="w-3.5 h-3.5 animate-pulse-subtle" />
            <span>Predicted amount</span>
          </span>
        </div>

        {/* Current Savings */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-28 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Current Savings</span>
          <h4 className="text-lg md:text-xl font-extrabold text-green-500 truncate">{formatCurrency(currentSavings)}</h4>
          <span className="text-[9px] text-green-500 font-extrabold flex items-center gap-0.5">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Estimated savings</span>
          </span>
        </div>

        {/* AI Confidence */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between h-28 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">AI Confidence Score</span>
          <h4 className="text-lg md:text-xl font-extrabold text-indigo-500 truncate">{forecastResults.confidence}%</h4>
          <span className="text-[9px] text-indigo-400 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Model accuracy</span>
          </span>
        </div>
      </div>

      {/* Main Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Line Chart */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="font-extrabold text-sm text-foreground">Monthly Expense Progression</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Last 6 Months</span>
          </div>
          <MonthlyExpenseLineChart data={lineChartData} />
        </div>

        {/* Expense Category Pie Chart */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="font-extrabold text-sm text-foreground">Category Distribution</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Current Month</span>
          </div>
          <CategoryPieChart data={pieChartData} />
        </div>

        {/* Weekly Spending Bar Chart */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="font-extrabold text-sm text-foreground">Weekly Spending Pace</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Current Month</span>
          </div>
          <WeeklySpendingBarChart data={weeklySpending} />
        </div>

        {/* Radar Comparison Chart */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="font-extrabold text-sm text-foreground">Spend vs Category Budgets</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Radar Matrix</span>
          </div>
          <RadarChart data={categoryStatuses} />
        </div>

        {/* Daily Activity Heatmap */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="font-extrabold text-sm text-foreground">Spending Heatmap</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Daily Grid</span>
          </div>
          <ExpenseHeatmap expenses={expenses} />
        </div>
      </div>

      {/* Budget Alerts & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <span className="font-extrabold text-sm text-foreground">Recent Transactions</span>
            <button
              onClick={() => navigate(ROUTES.EXPENSES)}
              className="text-xs text-primary font-bold flex items-center gap-0.5 hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-xs font-semibold text-muted-foreground">
                No recent transactions. Click "Add New Expense" to start!
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-muted-foreground font-extrabold border-b border-white/5 uppercase tracking-wider">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3 font-semibold text-foreground">{tx.title}</td>
                      <td className="py-3 text-muted-foreground">{tx.category}</td>
                      <td className="py-3 text-muted-foreground capitalize">{tx.payment_method.replace('_', ' ')}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(tx.date)}</td>
                      <td className="py-3 font-extrabold text-right text-foreground">{formatCurrency(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI Recommendations & Alerts */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-extrabold text-sm text-foreground">AI Budget Suggestions</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-72">
            {suggestions.map((msg, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-xl border flex gap-2.5 text-xs leading-relaxed font-semibold
                  ${msg.includes('Warning') || msg.includes('over') 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                    : msg.includes('Alert') || msg.includes('limit') 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : 'bg-primary/5 border-primary/10 text-foreground/90'
                  }
                `}
              >
                {msg.includes('Warning') || msg.includes('over') || msg.includes('Alert') ? (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 shrink-0 text-primary" />
                )}
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
