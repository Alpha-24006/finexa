import { useState, useMemo } from 'react';
import { useBudgetContext } from '../context/BudgetContext';
import { generateForecast } from '../ai/forecastEngine';
import type { ForecastResult } from '../ai/forecastEngine';
import type { ForecastModel } from '../types/prediction';

export const usePrediction = () => {
  const { expenses, loading: loadingContext } = useBudgetContext();
  const [selectedModel, setSelectedModel] = useState<ForecastModel>('linear');
  const [forecastSteps] = useState(12);

  const forecastResults = useMemo<ForecastResult>(() => {
    return generateForecast(expenses, selectedModel, forecastSteps);
  }, [expenses, selectedModel, forecastSteps]);

  const changeModel = (model: ForecastModel) => {
    setSelectedModel(model);
  };

  return {
    selectedModel,
    forecastResults,
    loadingForecast: loadingContext,
    changeModel
  };
};
