/**
 * A lightweight Random Forest Regressor implementation in pure TypeScript.
 * Uses time-lag features (lag1, lag2, lag3, month_of_year) to train a set of regression trees.
 */

interface DecisionTreeNode {
  featureIndex?: number;
  threshold?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  value?: number; // prediction value if leaf node
}

class RegressionTree {
  private root: DecisionTreeNode | null = null;
  
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(maxDepth = 4, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(X: number[][], y: number[]) {
    this.root = this.buildTree(X, y, 0);
  }

  predictSingle(x: number[]): number {
    return this.traverseTree(this.root, x);
  }

  private traverseTree(node: DecisionTreeNode | null, x: number[]): number {
    if (!node) return 0;
    if (node.value !== undefined) return node.value;
    if (node.featureIndex === undefined || node.threshold === undefined) return 0;
    
    if (x[node.featureIndex] <= node.threshold) {
      return this.traverseTree(node.left || null, x);
    } else {
      return this.traverseTree(node.right || null, x);
    }
  }

  private buildTree(X: number[][], y: number[], depth: number): DecisionTreeNode {
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;

    // Leaf conditions
    if (depth >= this.maxDepth || numSamples < this.minSamplesSplit || numFeatures === 0) {
      const avgValue = y.reduce((a, b) => a + b, 0) / (numSamples || 1);
      return { value: avgValue };
    }

    let bestFeature = -1;
    let bestThreshold = 0;
    let bestVariance = Infinity;
    let bestLeftIdx: number[] = [];
    let bestRightIdx: number[] = [];

    // Find best split
    for (let f = 0; f < numFeatures; f++) {
      const featureValues = X.map(row => row[f]);
      const uniqueValues = Array.from(new Set(featureValues)).sort((a, b) => a - b);
      
      // Test thresholds between adjacent unique values
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i+1]) / 2;
        const leftIdx: number[] = [];
        const rightIdx: number[] = [];

        for (let j = 0; j < numSamples; j++) {
          if (X[j][f] <= threshold) leftIdx.push(j);
          else rightIdx.push(j);
        }

        if (leftIdx.length === 0 || rightIdx.length === 0) continue;

        const leftY = leftIdx.map(idx => y[idx]);
        const rightY = rightIdx.map(idx => y[idx]);

        const leftVar = this.calculateVariance(leftY) * leftY.length;
        const rightVar = this.calculateVariance(rightY) * rightY.length;
        const totalVariance = leftVar + rightVar;

        if (totalVariance < bestVariance) {
          bestVariance = totalVariance;
          bestFeature = f;
          bestThreshold = threshold;
          bestLeftIdx = leftIdx;
          bestRightIdx = rightIdx;
        }
      }
    }

    // If no split reduces variance
    if (bestFeature === -1) {
      const avgValue = y.reduce((a, b) => a + b, 0) / numSamples;
      return { value: avgValue };
    }

    // Recurse left and right
    const leftX = bestLeftIdx.map(idx => X[idx]);
    const leftY = bestLeftIdx.map(idx => y[idx]);
    const rightX = bestRightIdx.map(idx => X[idx]);
    const rightY = bestRightIdx.map(idx => y[idx]);

    return {
      featureIndex: bestFeature,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1)
    };
  }

  private calculateVariance(arr: number[]): number {
    const n = arr.length;
    if (n <= 1) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    return arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  }
}

export class RandomForestRegressor {
  private trees: RegressionTree[] = [];
  
  private numTrees: number;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(numTrees = 5, maxDepth = 4, minSamplesSplit = 2) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(X: number[][], y: number[]) {
    this.trees = [];
    const numSamples = X.length;
    if (numSamples === 0) return;

    for (let i = 0; i < this.numTrees; i++) {
      // Bootstrap sample (sampling with replacement)
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let j = 0; j < numSamples; j++) {
        const randIdx = Math.floor(Math.random() * numSamples);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }

      const tree = new RegressionTree(this.maxDepth, this.minSamplesSplit);
      tree.fit(bootX, bootY);
      this.trees.push(tree);
    }
  }

  predict(X: number[][]): number[] {
    return X.map(row => {
      const predictions = this.trees.map(tree => tree.predictSingle(row));
      return Math.round(predictions.reduce((a, b) => a + b, 0) / (this.trees.length || 1));
    });
  }
}

/**
 * Fits a Random Forest Regression on expenses using time-lag features.
 */
export function fitRandomForestForecast(y: number[], monthsOfYear: number[]): {
  forecast: (steps: number) => number[];
  fittedValues: number[];
  meanAbsoluteError: number;
} {
  const n = y.length;
  // We need at least 4 observations to form lag features (lag 1, lag 2, lag 3) and fit a tree
  if (n < 5) {
    // Fallback: simple average or linear regression
    return {
      forecast: (steps) => Array(steps).fill(y[n-1] || 0),
      fittedValues: y,
      meanAbsoluteError: 0
    };
  }

  // Build X and y
  // Features: [lag_1, lag_2, lag_3, month_of_year]
  const X: number[][] = [];
  const targets: number[] = [];

  for (let t = 3; t < n; t++) {
    X.push([y[t - 1], y[t - 2], y[t - 3], monthsOfYear[t]]);
    targets.push(y[t]);
  }

  // Train Forest
  const forest = new RandomForestRegressor(10, 4, 2);
  forest.fit(X, targets);

  // Generate historical fitted values
  const fittedValues: number[] = [...y.slice(0, 3)]; // First 3 can't be predicted using lag-3
  const predictedTrain = forest.predict(X);
  fittedValues.push(...predictedTrain);

  let absoluteErrorSum = 0;
  for (let i = 3; i < n; i++) {
    absoluteErrorSum += Math.abs(y[i] - fittedValues[i]);
  }
  const meanAbsoluteError = absoluteErrorSum / (n - 3);

  // Autoregressive multi-step forecast
  const forecast = (steps: number): number[] => {
    const historyY = [...y];
    const historyMonths = [...monthsOfYear];
    const predictions: number[] = [];

    for (let k = 0; k < steps; k++) {
      const len = historyY.length;
      const lastMonth = historyMonths[len - 1];
      const nextMonthNum = (lastMonth + 1) % 12;
      
      const features = [historyY[len - 1], historyY[len - 2], historyY[len - 3], nextMonthNum];
      const nextVal = forest.predict([features])[0];
      
      predictions.push(nextVal);
      historyY.push(nextVal);
      historyMonths.push(nextMonthNum);
    }

    return predictions;
  };

  return {
    forecast,
    fittedValues,
    meanAbsoluteError
  };
}
