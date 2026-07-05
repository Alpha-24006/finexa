import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currency';
import { formatMonthName } from '../../utils/formatter';
import { exportExpensesToPDF } from '../../utils/exportPDF';
import { 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank 
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { expenses } = useExpenses();


  const [selectedReportType, setSelectedReportType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));

  // 1. Get unique months and years present in expenses for dropdown options
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(e => months.add(e.date.substring(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    expenses.forEach(e => years.add(e.date.substring(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  // 2. Filter expenses based on selection type
  const reportExpenses = useMemo(() => {
    if (selectedReportType === 'monthly') {
      return expenses.filter(e => e.date.substring(0, 7) === selectedMonth);
    }
    
    if (selectedReportType === 'yearly') {
      return expenses.filter(e => e.date.substring(0, 4) === selectedYear);
    }

    // Quarterly filter (last 3 months from selectedMonth)
    if (selectedReportType === 'quarterly' && selectedMonth) {
      const [y, m] = selectedMonth.split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 15);
      
      const prevMonths: string[] = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 15);
        prevMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }

      return expenses.filter(e => prevMonths.includes(e.date.substring(0, 7)));
    }

    return [];
  }, [expenses, selectedReportType, selectedMonth, selectedYear]);

  // 3. Totals and category distributions
  const summary = useMemo(() => {
    const totalSpent = reportExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Set nominal income scales: Monthly vs Quarterly (3x) vs Yearly (12x)
    let nominalIncome = 55000;
    if (selectedReportType === 'quarterly') nominalIncome = 165000;
    if (selectedReportType === 'yearly') nominalIncome = 660000;

    const savings = Math.max(0, nominalIncome - totalSpent);

    const categorySums: Record<string, number> = {};
    reportExpenses.forEach(e => {
      categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.keys(categorySums).map(cat => ({
      category: cat,
      amount: categorySums[cat],
      percentage: totalSpent > 0 ? Math.round((categorySums[cat] / totalSpent) * 100) : 0
    })).sort((a,b) => b.amount - a.amount);

    return {
      totalSpent,
      nominalIncome,
      savings,
      categoryBreakdown
    };
  }, [reportExpenses, selectedReportType]);

  const handlePrintReport = () => {
    let reportTitle = 'Financial Statement';
    if (selectedReportType === 'monthly') {
      reportTitle = `Monthly Report - ${formatMonthName(selectedMonth)}`;
    } else if (selectedReportType === 'quarterly') {
      reportTitle = `Quarterly Report - ending ${formatMonthName(selectedMonth)}`;
    } else {
      reportTitle = `Yearly Report - FY ${selectedYear}`;
    }

    exportExpensesToPDF(reportExpenses, reportTitle);
  };

  return (
    <div className="space-y-6">
      {/* Selector controls bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        {/* Toggle selectors */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {(['monthly', 'quarterly', 'yearly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReportType(type)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 capitalize
                ${selectedReportType === type 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Dropdowns & Print Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedReportType !== 'yearly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="glass-input text-xs font-semibold"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonthName(m)}</option>
              ))}
            </select>
          )}

          {selectedReportType === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="glass-input text-xs font-semibold"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrintReport}
            disabled={reportExpenses.length === 0}
            className="glass-btn flex items-center gap-2 text-xs font-bold shadow-lg"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Generate & Print PDF</span>
          </button>
        </div>
      </div>

      {/* Aggregate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between h-28">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Estimated Income</span>
            <h4 className="text-2xl font-extrabold text-foreground">{formatCurrency(summary.nominalIncome)}</h4>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
            <TrendingUp className="w-6 h-6 animate-pulse-subtle" />
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between h-28">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Spent</span>
            <h4 className="text-2xl font-extrabold text-foreground">{formatCurrency(summary.totalSpent)}</h4>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <TrendingDown className="w-6 h-6 animate-float-slow" />
          </div>
        </div>

        {/* Savings Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex items-center justify-between h-28">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Net Savings</span>
            <h4 className="text-2xl font-extrabold text-green-500">{formatCurrency(summary.savings)}</h4>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Categories Breakdown & Detailed Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category list rank */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
            <span className="font-extrabold text-sm text-foreground">Category Expenditures</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Ranking</span>
          </div>

          <div className="space-y-4">
            {summary.categoryBreakdown.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-muted-foreground">No data for selected period</div>
            ) : (
              summary.categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground font-bold">{item.category}</span>
                  <div className="text-right">
                    <span className="block text-foreground font-extrabold">{formatCurrency(item.amount)}</span>
                    <span className="text-[9px] text-muted-foreground font-extrabold">{item.percentage}% share</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table summary of transactions */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
            <span className="font-extrabold text-sm text-foreground">Statement Transaction Logs</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
              {reportExpenses.length} Records
            </span>
          </div>

          <div className="overflow-y-auto max-h-80 text-xs">
            {reportExpenses.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-muted-foreground">No transactions logged in this report scope.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-muted-foreground font-extrabold border-b border-white/5 uppercase tracking-wider pb-2">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reportExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/5">
                      <td className="py-2.5 text-muted-foreground font-semibold">{exp.date}</td>
                      <td className="py-2.5 font-bold text-foreground">{exp.title}</td>
                      <td className="py-2.5 text-muted-foreground font-semibold">{exp.category}</td>
                      <td className="py-2.5 font-extrabold text-right text-foreground">{formatCurrency(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
