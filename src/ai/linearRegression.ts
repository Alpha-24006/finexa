/**
 * Fits a linear regression model (y = mx + c) on historical monthly expenses.
 * Extrapolates to project future expenses.
 */
export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  forecast: (steps: number) => number[];
  fittedValues: number[];
}

export function fitLinearRegression(y: number[]): LinearRegressionResult {
  const n = y.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: y[0] || 0,
      rSquared: 0,
      forecast: (steps) => Array(steps).fill(y[0] || 0),
      fittedValues: y
    };
  }

  // Independent variable x is index [0, 1, 2, ..., n-1]
  const x = Array.from({ length: n }, (_, i) => i);

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate slope (m) and intercept (c)
  const numerator = sumXY - (sumX * sumY) / n;
  const denominator = sumXX - (sumX * sumX) / n;

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Fitted values and R-squared calculation
  const fittedValues = x.map(val => slope * val + intercept);
  
  let ssResidual = 0;
  let ssTotal = 0;

  for (let i = 0; i < n; i++) {
    const diff = y[i] - meanY;
    const residual = y[i] - fittedValues[i];
    ssTotal += diff * diff;
    ssResidual += residual * residual;
  }

  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  // Forecast function
  const forecast = (steps: number): number[] => {
    const predictions: number[] = [];
    for (let i = 0; i < steps; i++) {
      const nextX = n + i;
      predictions.push(Math.max(0, Math.round(slope * nextX + intercept)));
    }
    return predictions;
  };

  return {
    slope,
    intercept,
    rSquared: Math.min(1, Math.max(0, rSquared)),
    forecast,
    fittedValues
  };
}
