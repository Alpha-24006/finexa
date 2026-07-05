export interface Prediction {
  id: string;
  user_id: string;
  predicted_month: string; // YYYY-MM
  predicted_amount: number;
  confidence: number; // 0 to 100
  model_used: string;
  created_at?: string;
}

export type ForecastModel = 'linear' | 'moving_average' | 'exponential_smoothing' | 'random_forest';
