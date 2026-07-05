export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  category: string;
  amount: number;
  payment_method: PaymentMethod;
  date: string; // YYYY-MM-DD
  notes: string | null;
  created_at?: string;
}

export interface Category {
  id: string;
  category_name: string;
  color: string;
  icon: string;
}
