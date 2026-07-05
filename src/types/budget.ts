export interface Budget {
  id: string;
  user_id: string;
  category: string; // 'all' or category_name
  monthly_limit: number;
}
