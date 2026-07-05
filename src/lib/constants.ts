export const ROUTES = {
  DASHBOARD: '/',
  EXPENSES: '/expenses',
  BUDGET: '/budget',
  PREDICTION: '/prediction',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password'
};

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' }
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'de', name: 'German (Deutsch)' }
];

export const PAYMENT_METHODS = [
  { code: 'upi', name: 'UPI' },
  { code: 'card', name: 'Credit/Debit Card' },
  { code: 'cash', name: 'Cash' },
  { code: 'bank_transfer', name: 'Bank Transfer' },
  { code: 'other', name: 'Other' }
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  upi: 'UPI',
  card: 'Card',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  other: 'Other'
};
