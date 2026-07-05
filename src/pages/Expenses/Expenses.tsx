import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatter';
import { exportExpensesToCSV } from '../../utils/exportCSV';
import { exportExpensesToPDF } from '../../utils/exportPDF';
import { PAYMENT_METHODS } from '../../lib/constants';
import type { Expense, PaymentMethod } from '../../types/expense';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Filter, 
  RotateCcw, 
  Download, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const Expenses: React.FC = () => {
  const location = useLocation();
  const {
    filteredExpenses,
    categories,
    filters,
    sortConfig,
    updateFilters,
    resetFilters,
    changeSort,
    addExpense,
    updateExpense,
    deleteExpense
  } = useExpenses();

  // Dialog & drawer states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // CSV Import states
  const [csvText, setCsvText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Open modal if redirected from dashboard welcome banner
  useEffect(() => {
    if (location.state && (location.state as any).openAddModal) {
      resetForm();
      setIsAddModalOpen(true);
    }
  }, [location.state]);

  const resetForm = () => {
    setTitle('');
    setCategory(categories[0]?.category_name || 'Food');
    setAmount('');
    setPaymentMethod('upi');
    setDate(new Date().toISOString().substring(0, 10));
    setNotes('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setTitle(expense.title);
    setCategory(expense.category);
    setAmount(expense.amount);
    setPaymentMethod(expense.payment_method);
    setDate(expense.date);
    setNotes(expense.notes || '');
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) return;
    
    await addExpense({
      title,
      category,
      amount: Number(amount),
      payment_method: paymentMethod,
      date,
      notes: notes.trim() || null
    });
    
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense || !title || !amount || !category || !date) return;

    await updateExpense({
      ...selectedExpense,
      title,
      category,
      amount: Number(amount),
      payment_method: paymentMethod,
      date,
      notes: notes.trim() || null
    });

    setIsEditModalOpen(false);
    setSelectedExpense(null);
  };

  // CSV parsing import handler
  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    if (!csvText.trim()) return;

    try {
      const lines = csvText.split('\n');

      // Standard headers: Title, Category, Amount, Payment Method, Date, Notes
      const recordsToImport: Omit<Expense, 'id' | 'user_id'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split ignoring commas inside quotes
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length < 5) continue;

        const recordTitle = cols[0].replace(/"/g, '').trim();
        const recordCat = cols[1].replace(/"/g, '').trim();
        const recordAmt = parseFloat(cols[2]);
        const recordPay = cols[3].replace(/"/g, '').trim().toLowerCase() as PaymentMethod;
        const recordDate = cols[4].replace(/"/g, '').trim();
        const recordNotes = cols[5] ? cols[5].replace(/"/g, '').trim() : null;

        if (!recordTitle || !recordCat || isNaN(recordAmt) || !recordDate) {
          throw new Error(`Parse error on row ${i + 1}. Verify required fields (Title, Category, Amount, Date).`);
        }

        recordsToImport.push({
          title: recordTitle,
          category: recordCat,
          amount: recordAmt,
          payment_method: PAYMENT_METHODS.map(m=>m.code).includes(recordPay) ? recordPay : 'other',
          date: recordDate,
          notes: recordNotes
        });
      }

      // Insert all records
      await Promise.all(recordsToImport.map(r => addExpense(r)));
      
      setIsImportModalOpen(false);
      setCsvText('');
    } catch (err: any) {
      setImportError(err.message || 'Malformed CSV format. Check headers: Title, Category, Amount, Payment Method, Date, Notes');
    }
  };

  // Reset filter reset pagination to page 1
  const handleFilterChange = (updates: any) => {
    updateFilters(updates);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header controls toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        {/* Actions grid */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="glass-btn flex items-center gap-2 text-xs font-bold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="glass-btn-secondary flex items-center gap-1.5 text-xs font-semibold py-2.5"
          >
            <Upload className="w-4 h-4 text-primary" />
            <span>Import CSV</span>
          </button>

          <div className="flex items-center gap-1.5 border border-white/10 rounded-xl p-1 bg-white/5">
            <button
              onClick={() => exportExpensesToCSV(filteredExpenses)}
              className="p-1.5 text-foreground hover:bg-white/10 rounded-lg text-xs font-bold"
              title="Download CSV file"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportExpensesToPDF(filteredExpenses)}
              className="p-1.5 text-foreground hover:bg-white/10 rounded-lg text-xs font-bold"
              title="Export printable PDF report"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar & filter trigger */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Search transactions..."
              className="w-full glass-input pl-10.5 text-xs font-medium"
            />
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-foreground flex items-center gap-1.5 text-xs font-bold relative
              ${Object.values(filters).some(v => v !== '') ? 'bg-primary/10 border-primary/20 text-primary' : ''}
            `}
          >
            <Filter className="w-4.5 h-4.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Ledger grid table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-muted-foreground font-extrabold border-b border-white/5 uppercase tracking-wider bg-white/5">
                <th className="p-4 cursor-pointer hover:text-foreground select-none" onClick={() => changeSort('date')}>
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4 cursor-pointer hover:text-foreground select-none" onClick={() => changeSort('title')}>
                  Description {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4 cursor-pointer hover:text-foreground select-none" onClick={() => changeSort('category')}>
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4 cursor-pointer hover:text-foreground select-none" onClick={() => changeSort('payment_method')}>
                  Method {sortConfig.key === 'payment_method' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4 cursor-pointer hover:text-foreground select-none" onClick={() => changeSort('amount')}>
                  Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs font-semibold text-muted-foreground bg-white/2">
                    No transactions found matching active search/filter parameters.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-all">
                    <td className="p-4 text-muted-foreground font-semibold">{formatDate(exp.date)}</td>
                    <td className="p-4 font-bold text-foreground">{exp.title}</td>
                    <td className="p-4 text-muted-foreground font-semibold">{exp.category}</td>
                    <td className="p-4 text-muted-foreground uppercase font-bold">{exp.payment_method.replace('_', ' ')}</td>
                    <td className="p-4 font-extrabold text-foreground">{formatCurrency(exp.amount)}</td>
                    <td className="p-4 text-muted-foreground font-medium max-w-xs truncate">{exp.notes || '—'}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title="Edit expense details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/2">
          <span className="text-[10px] text-muted-foreground font-semibold">
            Showing {filteredExpenses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Filters Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsFilterDrawerOpen(false)} />
          
          {/* Drawer content */}
          <div className="relative w-80 max-w-full h-full bg-background border-l border-white/10 shadow-2xl flex flex-col p-6 overflow-y-auto animate-float-slow">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="font-extrabold text-sm text-foreground">Advanced Filters</span>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full glass-input text-xs font-semibold"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.category_name}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange({ paymentMethod: e.target.value })}
                  className="w-full glass-input text-xs font-semibold"
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.code} value={m.code}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Filters */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                  className="w-full glass-input text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                  className="w-full glass-input text-xs font-semibold"
                />
              </div>

              {/* Amount Range Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Min Price</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange({ minAmount: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="Min"
                    className="w-full glass-input text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange({ maxAmount: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="Max"
                    className="w-full glass-input text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => { resetFilters(); setIsFilterDrawerOpen(false); }}
              className="w-full glass-btn-secondary flex items-center justify-center gap-2 py-3 mt-6 border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Dialog Modals */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} />
          
          <div className="relative w-full max-w-lg glass-card border border-white/20 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl z-10 animate-float-slow">
            <h3 className="font-extrabold text-lg text-foreground border-b border-white/5 pb-2 mb-4">
              {isAddModalOpen ? 'Record Transaction' : 'Update Transaction'}
            </h3>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Description / Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Restaurant Lunch, Electric bill..."
                    className="w-full glass-input text-xs font-semibold"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter amount"
                    className="w-full glass-input text-xs font-semibold"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input text-xs font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.category_name}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input text-xs font-semibold"
                    required
                  />
                </div>

                {/* Payment method */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full glass-input text-xs font-semibold"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.code} value={m.code}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground block font-semibold">Notes / Details</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context (optional)"
                  rows={2}
                  className="w-full glass-input text-xs font-semibold resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="glass-btn-secondary text-xs font-bold py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn text-xs font-bold py-2.5 px-4 shadow-lg shadow-primary/10"
                >
                  {isAddModalOpen ? 'Log Transaction' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsImportModalOpen(false)} />
          
          <div className="relative w-full max-w-xl glass-card border border-white/20 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl z-10 animate-float-slow">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
              <h3 className="font-extrabold text-lg text-foreground">Import Expenses from CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <form onSubmit={handleCSVImport} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paste raw comma-separated values (CSV) matching headers below:
                <code className="block bg-white/5 dark:bg-black/20 p-2 rounded border border-white/10 text-[10px] font-bold font-mono mt-1 text-primary">
                  Title,Category,Amount,Payment Method,Date,Notes
                </code>
              </p>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Coffee Run,Food,150,cash,2026-07-01,Espresso double shot\nTrain tickets,Travel,850,card,2026-07-02,Return tickets\nGas refill,Travel,3500,upi,2026-07-04,Weekly trip fill`}
                rows={8}
                className="w-full glass-input text-[11px] font-mono leading-normal resize-none focus:ring-primary"
                required
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setIsImportModalOpen(false); setCsvText(''); setImportError(null); }}
                  className="glass-btn-secondary text-xs font-bold py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-btn text-xs font-bold py-2.5 px-4 shadow-lg"
                >
                  Parse & Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
