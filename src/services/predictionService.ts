import { supabase, isUsingMock } from './supabase';
import { mockDb } from './mockDb';
import type { Prediction } from '../types/prediction';

export const predictionService = {
  async getPredictions(userId: string): Promise<Prediction[]> {
    if (isUsingMock) {
      return mockDb.getPredictions().filter(p => p.user_id === userId);
    }
    
    const { data, error } = await supabase!
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(error.message);
    return data as Prediction[];
  },

  async savePrediction(prediction: Omit<Prediction, 'id'>): Promise<Prediction> {
    const newPrediction: Prediction = {
      ...prediction,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    if (isUsingMock) {
      mockDb.savePrediction(newPrediction);
      return newPrediction;
    }
    
    const { data, error } = await supabase!
      .from('predictions')
      .insert([prediction])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data as Prediction;
  }
};
