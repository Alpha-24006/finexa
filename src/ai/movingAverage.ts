/**
 * Computes moving average of historical expenses.
 * Extrapolates future points by iteratively averaging the most recent windows.
 */
export interface MovingAverageResult {
  windowSize: number;
  forecast: (steps: number) => number[];
  fittedValues: number[];
  meanAbsoluteError: number;
}

export function fitMovingAverage(y: number[], windowSize = 3): MovingAverageResult {
  const n = y.length;
  const actualWindow = Math.min(windowSize, n);
  
  if (actualWindow === 0) {
    return {
      windowSize: 0,
      forecast: (steps) => Array(steps).fill(0),
      fittedValues: [],
      meanAbsoluteError: 0
    };
  }

  // Fitted values (historical forecasts)
  const fittedValues: number[] = [];
  let absoluteErrorSum = 0;
  let count = 0;

  for (let i = 0; i < n; i++) {
    if (i < actualWindow) {
      fittedValues.push(y[i]); // Not enough data, use actual
    } else {
      const sum = y.slice(i - actualWindow, i).reduce((a, b) => a + b, 0);
      const prediction = Math.round(sum / actualWindow);
      fittedValues.push(prediction);
      absoluteErrorSum += Math.abs(y[i] - prediction);
      count++;
    }
  }

  const meanAbsoluteError = count === 0 ? 0 : absoluteErrorSum / count;

  // Forecast function (extrapolating autoregressively)
  const forecast = (steps: number): number[] => {
    const history = [...y];
    const predictions: number[] = [];
    
    for (let i = 0; i < steps; i++) {
      const activeWindow = Math.min(actualWindow, history.length);
      if (activeWindow === 0) {
        predictions.push(0);
        continue;
      }
      const sum = history.slice(history.length - activeWindow).reduce((a, b) => a + b, 0);
      const nextVal = Math.round(sum / activeWindow);
      predictions.push(nextVal);
      history.push(nextVal);
    }
    
    return predictions;
  };

  return {
    windowSize: actualWindow,
    forecast,
    fittedValues,
    meanAbsoluteError
  };
}
