import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBudgetContext } from '../../context/BudgetContext';
import { expenseService } from '../../services/expenseService';
import { mockDb } from '../../services/mockDb';
import { formatCurrency } from '../../utils/currency';
import type { Expense } from '../../types/expense';
import type { Profile } from '../../types/user';
import { 
  ShieldAlert, 
  Users, 
  Tags, 
  History, 
  Trash2, 
  Plus, 
  BrainCircuit,
  DollarSign
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { categories, addCategory, deleteCategory } = useBudgetContext();

  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'expenses' | 'prediction'>('users');
  
  // Admin local states
  const [users, setUsers] = useState<Profile[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);


  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8b5cf6');
  const [newCatIcon, setNewCatIcon] = useState('HelpCircle');

  const fetchAdminData = async () => {
    try {
      // Fetch users from mockDb
      const userList = mockDb.getUsers();
      setUsers(userList);

      // Fetch all expenses from all users
      const expenseList = await expenseService.getAllExpensesAdmin();
      setAllExpenses(expenseList);
    } catch (err) {
      console.error('Failed to load admin logs:', err);
    } finally {
      // Done fetching
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own active admin profile!");
      return;
    }
    if (confirm("Are you sure you want to delete this user and purge all of their transactions/budgets?")) {
      mockDb.deleteUser(id);
      fetchAdminData();
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await addCategory({
      category_name: newCatName.trim(),
      color: newCatColor,
      icon: newCatIcon
    });

    setNewCatName('');
    setNewCatColor('#8b5cf6');
    setNewCatIcon('HelpCircle');
  };

  const handlePurgeCategory = async (id: string, name: string) => {
    if (name === 'Others') {
      alert("The fallback category 'Others' cannot be removed.");
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}"? Transactions under this category will fall back to "Others".`)) {
      await deleteCategory(id);
      fetchAdminData();
    }
  };

  // 1. Calculate prediction statistics
  const predictionStats = useMemo(() => {
    const totalUsers = users.length;
    const totalTxCount = allExpenses.length;
    const totalSpentGlobal = allExpenses.reduce((s,e) => s + e.amount, 0);
    const averageTxAmount = totalTxCount > 0 ? Math.round(totalSpentGlobal / totalTxCount) : 0;
    
    // Group tx by category
    const catGroup: Record<string, number> = {};
    allExpenses.forEach(e => {
      catGroup[e.category] = (catGroup[e.category] || 0) + 1;
    });

    return {
      totalUsers,
      totalTxCount,
      totalSpentGlobal,
      averageTxAmount,
      catGroup
    };
  }, [users, allExpenses]);

  // Block non-admins from loading content
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-foreground">Access Restricted</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            The Administration Console is restricted to accounts with Admin credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Panel Header tabs */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-foreground">Administration Console</span>
            <p className="text-[10px] text-muted-foreground font-semibold">Oversee user profiles, category trees, and global analytics.</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'users' ? 'bg-red-500 text-white shadow-md' : 'text-muted-foreground hover:bg-white/10'}
            `}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'categories' ? 'bg-red-500 text-white shadow-md' : 'text-muted-foreground hover:bg-white/10'}
            `}
          >
            <Tags className="w-4 h-4" />
            <span>Categories Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'expenses' ? 'bg-red-500 text-white shadow-md' : 'text-muted-foreground hover:bg-white/10'}
            `}
          >
            <History className="w-4 h-4" />
            <span>Global Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'prediction' ? 'bg-red-500 text-white shadow-md' : 'text-muted-foreground hover:bg-white/10'}
            `}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>ML Statistics</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
          <h3 className="font-extrabold text-base text-foreground border-b border-white/5 pb-2 mb-4">Active User Directory</h3>
          
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted-foreground font-extrabold border-b border-white/5 uppercase tracking-wider pb-3">
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="py-3 flex items-center gap-3">
                      <img 
                        src={u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.full_name}`} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full border border-white/10 object-cover"
                      />
                      <span className="font-bold text-foreground">{u.full_name}</span>
                    </td>
                    <td className="py-3 text-muted-foreground font-semibold">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold
                        ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary-foreground'}
                      `}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === currentUser.id}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-35"
                        title="Purge user details"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category List */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm md:col-span-2">
            <h3 className="font-extrabold text-base text-foreground border-b border-white/5 pb-2 mb-4">Category Tree</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/2">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.category_name}
                  </span>
                  <button
                    onClick={() => handlePurgeCategory(c.id, c.category_name)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
            <h3 className="font-extrabold text-base text-foreground border-b border-white/5 pb-2 mb-4">Create Category</h3>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="E.g. Subscriptions, Tax"
                  className="w-full glass-input"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Color Code</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="flex-1 glass-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-muted-foreground block">Lucide Icon ID</label>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full glass-input"
                >
                  <option value="HelpCircle">HelpCircle</option>
                  <option value="ShoppingBag">ShoppingBag</option>
                  <option value="HeartPulse">HeartPulse</option>
                  <option value="DollarSign">DollarSign</option>
                  <option value="FileText">FileText</option>
                  <option value="Home">Home</option>
                  <option value="Car">Car</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full glass-btn flex items-center justify-center gap-1.5 py-3 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
          <h3 className="font-extrabold text-base text-foreground border-b border-white/5 pb-2 mb-4">Global Transaction Logs</h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted-foreground font-extrabold border-b border-white/5 uppercase tracking-wider pb-3">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5">
                    <td className="py-2.5 text-muted-foreground font-semibold">{exp.date}</td>
                    <td className="py-2.5 font-bold text-foreground">{exp.title}</td>
                    <td className="py-2.5 text-muted-foreground font-semibold">{exp.category}</td>
                    <td className="py-2.5 text-muted-foreground uppercase font-bold">{exp.payment_method}</td>
                    <td className="py-2.5 font-extrabold text-right text-foreground">{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'prediction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prediction logs */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
            <h3 className="font-extrabold text-base text-foreground border-b border-white/5 pb-2 mb-4">System Predictions Info</h3>
            
            <div className="space-y-4 font-semibold text-xs leading-relaxed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Profiles</span>
                  <span className="text-sm font-extrabold text-foreground">{predictionStats.totalUsers} profiles active</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Global Spent Total</span>
                  <span className="text-sm font-extrabold text-foreground">{formatCurrency(predictionStats.totalSpentGlobal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Transactions Logged</span>
                  <span className="text-sm font-extrabold text-foreground">{predictionStats.totalTxCount} transaction instances</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Statistics logs */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
            <h3 className="font-extrabold text-base text-foreground border-b border-white/5 pb-2 mb-4">Category Frequency Distribution</h3>

            <div className="space-y-3.5 font-bold text-xs">
              {Object.keys(predictionStats.catGroup).map((cat) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-foreground">{cat}</span>
                  <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-extrabold">
                    {predictionStats.catGroup[cat]} records
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
