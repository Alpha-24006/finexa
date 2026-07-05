/**
 * Fits a Double Exponential Smoothing (Holt's Linear Trend) model.
 * Level: L_t = alpha * Y_t + (1 - alpha) * (L_{t-1} + T_{t-1})
 * Trend: T_t = beta * (L_t - L_{t-1}) + (1 - beta) * T_{t-1}
 * Forecast: F_{t+k} = L_t + k * T_t
 */
export interface ExponentialSmoothingResult {
  alpha: number;
  beta: number;
  forecast: (steps: number) => number[];
  fittedValues: number[];
  meanAbsoluteError: number;
}

export function fitExponentialSmoothing(
  y: number[],
  alpha = 0.5,
  beta = 0.3
): ExponentialSmoothingResult {
  const n = y.length;
  if (n === 0) {
    return {
      alpha,
      beta,
      forecast: (steps) => Array(steps).fill(0),
      fittedValues: [],
      meanAbsoluteError: 0
    };
  }
  
  if (n < 2) {
    return {
      alpha,
      beta,
      forecast: (steps) => Array(steps).fill(y[0]),
      fittedValues: [y[0]],
      meanAbsoluteError: 0
    };
  }

  const levels = new Array<number>(n);
  const trends = new Array<number>(n);
  const fittedValues = new Array<number>(n);

  // Initialize level and trend
  levels[0] = y[0];
  trends[0] = y[1] - y[0];
  fittedValues[0] = y[0];

  let absoluteErrorSum = 0;

  for (let t = 1; t < n; t++) {
    // Prediction for time t made at time t-1
    fittedValues[t] = Math.round(levels[t - 1] + trends[t - 1]);
    absoluteErrorSum += Math.abs(y[t] - fittedValues[t]);

    // Update level and trend with actual data
    levels[t] = alpha * y[t] + (1 - alpha) * (levels[t - 1] + trends[t - 1]);
    trends[t] = beta * (levels[t] - levels[t - 1]) + (1 - beta) * trends[t - 1];
  }

  const meanAbsoluteError = absoluteErrorSum / (n - 1);

  // Forecast function
  const forecast = (steps: number): number[] => {
    const lastLevel = levels[n - 1];
    const lastTrend = trends[n - 1];
    const predictions: number[] = [];
    
    for (let k = 1; k <= steps; k++) {
      predictions.push(Math.max(0, Math.round(lastLevel + k * lastTrend)));
    }
    
    return predictions;
  };

  return {
    alpha,
    beta,
    forecast,
    fittedValues,
    meanAbsoluteError
  };
}
