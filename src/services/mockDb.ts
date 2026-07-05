import type { Expense, Category } from '../types/expense';
import type { Budget } from '../types/budget';
import type { Prediction } from '../types/prediction';
import type { Report } from '../types/report';
import type { Profile } from '../types/user';

// Keys for localStorage
const KEYS = {
  USERS: 'ai_expense_users',
  EXPENSES: 'ai_expense_expenses',
  CATEGORIES: 'ai_expense_categories',
  BUDGETS: 'ai_expense_budgets',
  PREDICTIONS: 'ai_expense_predictions',
  REPORTS: 'ai_expense_reports',
  CURRENT_USER: 'ai_expense_current_user'
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', category_name: 'Food', color: '#EF4444', icon: 'Utensils' },
  { id: '2', category_name: 'Entertainment', color: '#F59E0B', icon: 'Film' },
  { id: '3', category_name: 'Utilities', color: '#10B981', icon: 'Zap' },
  { id: '4', category_name: 'Travel', color: '#3B82F6', icon: 'Plane' },
  { id: '5', category_name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag' },
  { id: '6', category_name: 'Health', color: '#8B5CF6', icon: 'HeartPulse' },
  { id: '7', category_name: 'Others', color: '#6B7280', icon: 'HelpCircle' }
];

// Helper to seed 12 months of historical expenses
const generateHistoricalExpenses = (userId: string): Expense[] => {
  const expenses: Expense[] = [];
  const now = new Date();
  
  // Seed for 12 months, e.g. July 2025 to June 2026
  for (let m = 12; m >= 1; m--) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 15);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Total monthly spending will fluctuate
    // Let's create an upward trend with some seasonal spikes (December, festive season)
    const baseMultiplier = 1 + (12 - m) * 0.03; // ~36% growth over the year
    const seasonalBoost = (date.getMonth() === 11) ? 1.25 : (date.getMonth() === 4 || date.getMonth() === 5) ? 1.15 : 1.0;
    
    const categoriesConfig = [
      { name: 'Food', baseMin: 8000, baseMax: 11000, count: 6 },
      { name: 'Utilities', baseMin: 3000, baseMax: 4500, count: 3 },
      { name: 'Travel', baseMin: 2500, baseMax: 5000, count: 4 },
      { name: 'Entertainment', baseMin: 2000, baseMax: 4500, count: 3 },
      { name: 'Shopping', baseMin: 3000, baseMax: 7000, count: 5 },
      { name: 'Health', baseMin: 1000, baseMax: 2500, count: 1 },
      { name: 'Others', baseMin: 1000, baseMax: 3000, count: 2 }
    ];
    
    categoriesConfig.forEach(cat => {
      const itemsCount = cat.count;
      for (let i = 0; i < itemsCount; i++) {
        const randDay = Math.floor(Math.random() * 28) + 1;
        const dayStr = String(randDay).padStart(2, '0');
        const minVal = cat.baseMin / itemsCount * baseMultiplier * seasonalBoost;
        const maxVal = cat.baseMax / itemsCount * baseMultiplier * seasonalBoost;
        const amount = Math.round(minVal + Math.random() * (maxVal - minVal));
        
        const titles: Record<string, string[]> = {
          'Food': ['Groceries', 'Restaurant Dinner', 'Cafe Coffee', 'Supermarket Run', 'UberEats delivery', 'Snacks'],
          'Utilities': ['Electricity Bill', 'Water Bill', 'Internet Subscription', 'Gas Refill', 'Mobile Recharge'],
          'Travel': ['Uber Ride', 'Metro Pass', 'Gas Station Refill', 'Train Ticket', 'Flight booking', 'Auto Fare'],
          'Entertainment': ['Netflix Subscription', 'Movie Ticket', 'Weekend Party', 'Bowling', 'Spotify', 'Concert'],
          'Shopping': ['Sneakers', 'Winter Jacket', 'Office Desk', 'Jeans', 'T-Shirt', 'Gadget Upgrade', 'Gift for friend'],
          'Health': ['Pharmacy medicines', 'Dental checkup', 'Gym Subscription', 'Doctor consultancy'],
          'Others': ['Miscellaneous', 'ATM Cash Withdrawal', 'Laundry Service', 'Courier Fee']
        };
        
        const catTitles = titles[cat.name] || ['Expense Item'];
        const title = catTitles[Math.floor(Math.random() * catTitles.length)];
        
        const paymentMethods = ['upi', 'card', 'cash', 'bank_transfer'];
        const payment_method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)] as any;
        
        expenses.push({
          id: Math.random().toString(36).substring(2, 11),
          user_id: userId,
          title,
          category: cat.name,
          amount,
          payment_method,
          date: `${year}-${month}-${dayStr}`,
          notes: i % 3 === 0 ? `Historical record for ${cat.name}` : null
        });
      }
    });
  }
  
  return expenses;
};

// Seed default users
const DEFAULT_USERS: Profile[] = [
  {
    id: 'u1',
    full_name: 'Amlan Lenovo',
    email: 'user@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amlan',
    role: 'user',
    created_at: new Date().toISOString()
  },
  {
    id: 'a1',
    full_name: 'System Administrator',
    email: 'admin@example.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

// Seed default budgets
const DEFAULT_BUDGETS = (userId: string): Budget[] => [
  { id: 'b1', user_id: userId, category: 'all', monthly_limit: 45000 },
  { id: 'b2', user_id: userId, category: 'Food', monthly_limit: 12000 },
  { id: 'b3', user_id: userId, category: 'Entertainment', monthly_limit: 5000 },
  { id: 'b4', user_id: userId, category: 'Utilities', monthly_limit: 5000 },
  { id: 'b5', user_id: userId, category: 'Travel', monthly_limit: 6000 },
  { id: 'b6', user_id: userId, category: 'Shopping', monthly_limit: 10000 },
  { id: 'b7', user_id: userId, category: 'Health', monthly_limit: 4000 }
];

export const initMockDb = () => {
  // Ensure Categories
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  // Ensure Users
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  
  // Verify default user has seeded data
  const expenses = localStorage.getItem(KEYS.EXPENSES);
  if (!expenses || JSON.parse(expenses).length === 0) {

    const seededExpenses = [
      ...generateHistoricalExpenses('u1'),
      ...generateHistoricalExpenses('a1')
    ];
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(seededExpenses));
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify([...DEFAULT_BUDGETS('u1'), ...DEFAULT_BUDGETS('a1')]));
    
    // Seed reports summary
    updateReportsFromExpenses();
  }
};

export const updateReportsFromExpenses = () => {
  const expenses: Expense[] = JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]');

  
  // Aggregate expenses by month and user
  const monthlyAgg: Record<string, { income: number; expense: number }> = {};
  
  expenses.forEach(e => {
    const key = `${e.user_id}_${e.date.substring(0, 7)}`;
    if (!monthlyAgg[key]) {
      // Setup a nominal income of 50000 to 70000 for realistic savings calculation
      const baseIncome = e.user_id === 'a1' ? 90000 : 55000;
      monthlyAgg[key] = { income: baseIncome, expense: 0 };
    }
    monthlyAgg[key].expense += e.amount;
  });
  
  const reports: Report[] = [];
  Object.keys(monthlyAgg).forEach(key => {
    const [userId, month] = key.split('_');
    const { income, expense } = monthlyAgg[key];
    reports.push({
      id: Math.random().toString(36).substring(2, 11),
      user_id: userId,
      month,
      income,
      expense,
      savings: Math.max(0, income - expense)
    });
  });
  
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
};

// Initialize DB immediately on load
initMockDb();

export const mockDb = {
  // Users CRUD
  getUsers: (): Profile[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  saveUser: (user: Profile) => {
    const users = mockDb.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) users[idx] = user;
    else users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  deleteUser: (id: string) => {
    const users = mockDb.getUsers().filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    // Cascade delete user data
    const expenses = mockDb.getExpenses().filter(e => e.user_id !== id);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    
    const budgets = mockDb.getBudgets().filter(b => b.user_id !== id);
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
    
    const predictions = mockDb.getPredictions().filter(p => p.user_id !== id);
    localStorage.setItem(KEYS.PREDICTIONS, JSON.stringify(predictions));
  },
  
  // Current logged in user context
  getCurrentUser: (): Profile | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (!data) {
      // Default fallback is Amlan Lenovo
      const defaults = mockDb.getUsers();
      const defUser = defaults.find(u => u.role === 'user') || defaults[0];
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(defUser));
      return defUser;
    }
    return JSON.parse(data);
  },
  setCurrentUser: (user: Profile | null) => {
    if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(KEYS.CURRENT_USER);
  },
  
  // Expenses CRUD
  getExpenses: (): Expense[] => JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]'),
  saveExpense: (expense: Expense) => {
    const expenses = mockDb.getExpenses();
    const idx = expenses.findIndex(e => e.id === expense.id);
    if (idx > -1) expenses[idx] = expense;
    else expenses.push(expense);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    updateReportsFromExpenses();
  },
  deleteExpense: (id: string) => {
    const expenses = mockDb.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    updateReportsFromExpenses();
  },
  
  // Categories CRUD
  getCategories: (): Category[] => JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]'),
  saveCategory: (category: Category) => {
    const categories = mockDb.getCategories();
    const idx = categories.findIndex(c => c.id === category.id || c.category_name.toLowerCase() === category.category_name.toLowerCase());
    if (idx > -1) categories[idx] = category;
    else categories.push(category);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },
  deleteCategory: (id: string) => {
    const category = mockDb.getCategories().find(c => c.id === id);
    if (category) {
      const categories = mockDb.getCategories().filter(c => c.id !== id);
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
      
      // Update expenses of this category to 'Others'
      const expenses = mockDb.getExpenses().map(e => {
        if (e.category === category.category_name) {
          return { ...e, category: 'Others' };
        }
        return e;
      });
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    }
  },
  
  // Budgets CRUD
  getBudgets: (): Budget[] => JSON.parse(localStorage.getItem(KEYS.BUDGETS) || '[]'),
  saveBudget: (budget: Budget) => {
    const budgets = mockDb.getBudgets();
    const idx = budgets.findIndex(b => b.user_id === budget.user_id && b.category === budget.category);
    if (idx > -1) budgets[idx] = budget;
    else budgets.push(budget);
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  },
  deleteBudget: (id: string) => {
    const budgets = mockDb.getBudgets().filter(b => b.id !== id);
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  },
  
  // Predictions CRUD
  getPredictions: (): Prediction[] => JSON.parse(localStorage.getItem(KEYS.PREDICTIONS) || '[]'),
  savePrediction: (pred: Prediction) => {
    const preds = mockDb.getPredictions();
    const idx = preds.findIndex(p => p.user_id === pred.user_id && p.predicted_month === pred.predicted_month && p.model_used === pred.model_used);
    if (idx > -1) preds[idx] = pred;
    else preds.push(pred);
    localStorage.setItem(KEYS.PREDICTIONS, JSON.stringify(preds));
  },
  
  // Reports CRUD
  getReports: (): Report[] => JSON.parse(localStorage.getItem(KEYS.REPORTS) || '[]')
};
