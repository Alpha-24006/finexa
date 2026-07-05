import { fitLinearRegression } from './linearRegression';
import { fitMovingAverage } from './movingAverage';
import { fitExponentialSmoothing } from './exponentialSmoothing';
import { fitRandomForestForecast } from './randomForest';
import type { Expense } from '../types/expense';
import type { ForecastModel } from '../types/prediction';

export interface ForecastDataPoint {
  month: string; // YYYY-MM
  amount: number;
  isForecast: boolean;
}

export interface ForecastResult {
  nextMonthEstimate: number;
  quarterEstimate: number;
  yearEstimate: number;
  confidence: number; // 0 to 100
  trend: 'up' | 'down' | 'stable';
  dataPoints: ForecastDataPoint[];
  historicalPoints: { month: string; amount: number }[];
}

export function generateForecast(
  expenses: Expense[],
  model: ForecastModel = 'linear',
  forecastSteps = 12
): ForecastResult {
  // Aggregate expenses by month (YYYY-MM)
  const monthlyTotals: Record<string, number> = {};
  
  // Sort expenses by date ascending to process chronologically
  const sortedExpenses = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
  
  sortedExpenses.forEach(e => {
    const month = e.date.substring(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
  });

  const sortedMonths = Object.keys(monthlyTotals).sort();
  const historicalAmounts = sortedMonths.map(m => monthlyTotals[m]);
  
  const historicalPoints = sortedMonths.map(m => ({
    month: m,
    amount: Math.round(monthlyTotals[m])
  }));

  // Default values if not enough data
  if (historicalAmounts.length === 0) {
    return {
      nextMonthEstimate: 0,
      quarterEstimate: 0,
      yearEstimate: 0,
      confidence: 100,
      trend: 'stable',
      dataPoints: [],
      historicalPoints: []
    };
  }

  if (historicalAmounts.length < 3) {
    // Return simple averages if less than 3 months of data
    const avg = Math.round(historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length);
    const forecastPoints: ForecastDataPoint[] = [];
    
    // Generate months ahead
    let currentMonth = new Date();
    for (let i = 0; i < forecastSteps; i++) {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      const mStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      forecastPoints.push({
        month: mStr,
        amount: avg,
        isForecast: true
      });
    }

    return {
      nextMonthEstimate: avg,
      quarterEstimate: avg * 3,
      yearEstimate: avg * 12,
      confidence: 50,
      trend: 'stable',
      dataPoints: [
        ...historicalPoints.map(p => ({ month: p.month, amount: p.amount, isForecast: false })),
        ...forecastPoints
      ],
      historicalPoints
    };
  }

  // Generate helper month numbers (0-11) for RF seasonal index
  const monthsOfYear = sortedMonths.map(m => parseInt(m.split('-')[1], 10) - 1);

  let predictions: number[] = [];
  let fittedValues: number[] = [];


  switch (model) {
    case 'linear': {
      const lr = fitLinearRegression(historicalAmounts);
      predictions = lr.forecast(forecastSteps);
      fittedValues = lr.fittedValues;
      // Compute MAE manually for linear
      let diff = 0;
      for (let i = 0; i < historicalAmounts.length; i++) {
        diff += Math.abs(historicalAmounts[i] - fittedValues[i]);
      }
      break;
    }
    case 'moving_average': {
      const ma = fitMovingAverage(historicalAmounts, 3);
      predictions = ma.forecast(forecastSteps);
      fittedValues = ma.fittedValues;
      break;
    }
    case 'exponential_smoothing': {
      const es = fitExponentialSmoothing(historicalAmounts, 0.4, 0.2);
      predictions = es.forecast(forecastSteps);
      fittedValues = es.fittedValues;
      break;
    }
    case 'random_forest': {
      const rf = fitRandomForestForecast(historicalAmounts, monthsOfYear);
      predictions = rf.forecast(forecastSteps);
      fittedValues = rf.fittedValues;
      break;
    }
    default:
      predictions = Array(forecastSteps).fill(historicalAmounts[historicalAmounts.length - 1]);
      fittedValues = historicalAmounts;

  }

  // Compute confidence using Mean Absolute Percentage Error (MAPE)
  let mapeSum = 0;
  let count = 0;
  for (let i = 0; i < historicalAmounts.length; i++) {
    if (historicalAmounts[i] > 0) {
      mapeSum += Math.abs(historicalAmounts[i] - fittedValues[i]) / historicalAmounts[i];
      count++;
    }
  }
  const mape = count === 0 ? 0 : (mapeSum / count) * 100;
  // Confidence goes down as error goes up. Cap between 10% and 98% for realistic AI feels.
  const confidence = Math.round(Math.min(98, Math.max(10, 100 - mape)));

  // Projections
  const nextMonthEstimate = predictions[0] || 0;
  const quarterEstimate = predictions.slice(0, 3).reduce((a, b) => a + b, 0);
  const yearEstimate = predictions.reduce((a, b) => a + b, 0);

  // Trend detection based on slope of last 3 months vs first predicted month
  const lastIndex = historicalAmounts.length - 1;
  const lastVal = historicalAmounts[lastIndex];
  const trendVal = nextMonthEstimate - lastVal;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (trendVal > lastVal * 0.03) trend = 'up';
  else if (trendVal < -lastVal * 0.03) trend = 'down';

  // Construct consolidated timeline
  const dataPoints: ForecastDataPoint[] = [];
  historicalPoints.forEach(p => {
    dataPoints.push({ month: p.month, amount: p.amount, isForecast: false });
  });

  // Calculate future month strings
  const lastMonthStr = sortedMonths[sortedMonths.length - 1];
  const parts = lastMonthStr.split('-');
  let currentYear = parseInt(parts[0], 10);
  let currentMonthVal = parseInt(parts[1], 10);

  for (let i = 0; i < forecastSteps; i++) {
    currentMonthVal++;
    if (currentMonthVal > 12) {
      currentMonthVal = 1;
      currentYear++;
    }
    const monthStr = `${currentYear}-${String(currentMonthVal).padStart(2, '0')}`;
    dataPoints.push({
      month: monthStr,
      amount: predictions[i] || 0,
      isForecast: true
    });
  }

  return {
    nextMonthEstimate,
    quarterEstimate,
    yearEstimate,
    confidence,
    trend,
    dataPoints,
    historicalPoints
  };
}
