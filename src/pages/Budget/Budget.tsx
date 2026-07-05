import React, { useState } from 'react';
import { useBudgetContext } from '../../context/BudgetContext';
import { useBudget } from '../../hooks/useBudget';
import { formatCurrency } from '../../utils/currency';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp
} from 'lucide-react';

export const Budget: React.FC = () => {
  const { budgets, categories, saveBudget, deleteBudget } = useBudgetContext();
  const { totalSpent, overallLimit, categoryStatuses, suggestions } = useBudget();

  // Form modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [limitInput, setLimitInput] = useState<number | ''>('');

  const handleOpenModal = (category = 'all', currentLimit?: number) => {
    setSelectedCategory(category);
    setLimitInput(currentLimit || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (limitInput === '' || limitInput < 0) return;

    await saveBudget({
      category: selectedCategory,
      monthly_limit: Number(limitInput)
    });

    setIsModalOpen(false);
    setLimitInput('');
  };

  // Find remaining budget categories we can configure
  const activeBudgetCategoryNames = budgets.map(b => b.category);
  const configurableCategories = categories.filter(
    c => !activeBudgetCategoryNames.includes(c.category_name)
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Budget Limit Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider block">Overall Monthly Budget</span>
            <h4 className="text-3xl font-extrabold text-foreground">{formatCurrency(overallLimit)}</h4>
            <p className="text-xs text-muted-foreground font-semibold">Total allowed expenditure this month</p>
          </div>
          <button
            onClick={() => handleOpenModal('all', overallLimit)}
            className="p-3 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-all duration-200"
            title="Configure overall limit"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        {/* Total Spent progress card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider block">Total Spent (Actual)</span>
            <h4 className="text-3xl font-extrabold text-foreground">{formatCurrency(totalSpent)}</h4>
          </div>
          <div className="w-full mt-4">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1 uppercase">
              <span>Progress</span>
              <span>{overallLimit > 0 ? Math.round((totalSpent / overallLimit) * 100) : 0}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-500
                  ${totalSpent > overallLimit ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-indigo-500'}
                `}
                style={{ width: `${Math.min(100, overallLimit > 0 ? (totalSpent / overallLimit) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI suggestions sidebar panel */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="w-4 h-4 animate-pulse-subtle" />
              <span className="text-xs uppercase font-extrabold tracking-wider">AI Budget Advice</span>
            </div>
            <p className="text-xs leading-relaxed font-semibold text-muted-foreground mt-2 max-h-24 overflow-y-auto">
              {suggestions[0] || 'No alerts. Your budget pacing is looking healthy.'}
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal('all', overallLimit)}
            className="text-left text-xs font-extrabold text-primary flex items-center gap-1 hover:underline mt-4"
          >
            <span>Update Limit</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Budgets Ledger */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
          <div>
            <h3 className="font-extrabold text-base text-foreground">Category-specific Budget Tracking</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Monitor allowances allocated to unique spending divisions.</p>
          </div>

          <button
            onClick={() => {
              if (configurableCategories.length === 0) {
                alert('All categories already have budget configurations!');
                return;
              }
              handleOpenModal(configurableCategories[0].category_name);
            }}
            className="glass-btn flex items-center gap-2 text-xs font-bold py-2.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category Limit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryStatuses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-xs font-semibold text-muted-foreground border border-dashed border-white/10 rounded-2xl">
              No category limits configured. Click "Add Category Limit" to define specific budgets.
            </div>
          ) : (
            categoryStatuses.map((item) => (
              <div 
                key={item.category}
                className={`glass-card p-5 rounded-2xl border border-white/5 shadow-sm transition-all duration-300 flex flex-col justify-between
                  ${item.isOver ? 'border-red-500/20 shadow-red-500/5 bg-red-500/5' : 'hover:border-white/15'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span 
                      className="text-xs font-extrabold px-3 py-1 rounded-full text-white inline-block shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.category}
                    </span>
                    <div className="text-sm font-extrabold text-foreground mt-3">
                      {formatCurrency(item.spent)} <span className="text-xs font-semibold text-muted-foreground">spent of {formatCurrency(item.limit)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(item.category, item.limit)}
                      className="p-1.5 text-muted-foreground hover:bg-white/10 rounded-lg"
                      title="Edit Category Limit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const bObj = budgets.find(b => b.category === item.category);
                        if (bObj) deleteBudget(bObj.id);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Remove Category Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-6 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                    <span>Remaining: {formatCurrency(item.remaining)}</span>
                    <span>{Math.round(item.percentage)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500`}
                      style={{ 
                        width: `${Math.min(100, item.percentage)}%`,
                        backgroundColor: item.isOver ? '#EF4444' : item.color
                      }}
                    />
                  </div>
                </div>

                {/* Breached Indicator */}
                {item.isOver && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-extrabold text-red-500 bg-red-500/15 p-2 rounded-xl border border-red-500/10">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse-subtle" />
                    <span>Breached by {formatCurrency(item.spent - item.limit)}!</span>
                  </div>
                )}
                {!item.isOver && item.percentage >= 80 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-extrabold text-amber-500 bg-amber-500/15 p-2 rounded-xl border border-amber-500/10">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Approaching budget limit!</span>
                  </div>
                )}
                {!item.isOver && item.percentage < 80 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-extrabold text-green-500 bg-green-500/15 p-2 rounded-xl border border-green-500/10">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Budget pacing safe</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Budget Limit Form Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-md glass-card border border-white/20 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl z-10 animate-float-slow">
            <h3 className="font-extrabold text-lg text-foreground border-b border-white/5 pb-2 mb-4">
              Configure Limit
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Target Area</label>
                {selectedCategory === 'all' ? (
                  <input
                    type="text"
                    value="Overall Monthly Limit"
                    disabled
                    className="w-full glass-input text-xs font-semibold bg-white/5 dark:bg-black/10 cursor-not-allowed opacity-75"
                  />
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full glass-input text-xs font-semibold"
                  >
                    <option value={selectedCategory}>{selectedCategory}</option>
                    {configurableCategories.map(c => (
                      <option key={c.id} value={c.category_name}>{c.category_name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Monthly Limit Amount */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Monthly Limit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter budget limit"
                    className="w-full glass-input pl-8.5 text-xs font-semibold"
                    required
                    min={0}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="glass-btn-secondary text-xs font-bold py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn text-xs font-bold py-2.5 px-4 shadow-lg"
                >
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
