import React from 'react';
import { usePrediction } from '../../hooks/usePrediction';
import { PredictionGraph } from '../../components/charts/ExpenseCharts';
import { formatCurrency } from '../../utils/currency';
import type { ForecastModel } from '../../types/prediction';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  Info
} from 'lucide-react';

export const Prediction: React.FC = () => {
  const { selectedModel, forecastResults, changeModel } = usePrediction();

  const modelDescriptions: Record<ForecastModel, {
    name: string;
    description: string;
    math: string;
    useCase: string;
  }> = {
    linear: {
      name: 'Linear Regression (Ordinary Least Squares)',
      description: 'Fits a linear trend line (y = mx + c) through historical monthly points, projecting a constant straight-line growth or decline trend.',
      math: 'y_t = \\beta_0 + \\beta_1 \\cdot t',
      useCase: 'Best for long-term trends showing constant linear growth or contraction in spending patterns.'
    },
    moving_average: {
      name: 'Moving Average (SMA-3)',
      description: 'Forecasts by calculating the simple arithmetic mean of the last 3 months. It smooths out short-term fluctuations to forecast stability.',
      math: 'y_t = \\frac{1}{N} \\sum_{i=1}^{N} y_{t-i}',
      useCase: 'Best for users with highly erratic, unpredictable spending where a stabilized baseline is required.'
    },
    exponential_smoothing: {
      name: 'Exponential Smoothing (Holt\'s Trend)',
      description: 'Applies exponentially decreasing weights to past months (giving higher importance to recent months) and separates local level from local linear trends.',
      math: 'L_t = \\alpha y_t + (1-\\alpha)(L_{t-1} + T_{t-1})',
      useCase: 'Highly effective for financial data where recent changes represent stronger indicator shifts than older history.'
    },
    random_forest: {
      name: 'Random Forest Regression (Autoregressive Ensemble)',
      description: 'An advanced machine learning decision tree ensemble trained client-side. Evaluates time lags (Month-1, Month-2, Month-3 values) and seasonal month numbers to project non-linear, complex shapes.',
      math: 'y_t = \\text{Forest}(y_{t-1}, y_{t-2}, y_{t-3}, \\text{month})',
      useCase: 'Best for complex datasets showing seasonal patterns, spikes, and non-linear shifts.'
    }
  };

  const activeModelMeta = modelDescriptions[selectedModel];

  return (
    <div className="space-y-6">
      {/* Model Selection Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BrainCircuit className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-foreground">Forecast Model Switcher</span>
            <p className="text-[10px] text-muted-foreground font-semibold">Change ML model to alter prediction characteristics.</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {(Object.keys(modelDescriptions) as ForecastModel[]).map((model) => (
            <button
              key={model}
              onClick={() => changeModel(model)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200
                ${selectedModel === model 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                }
              `}
            >
              {model.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-foreground">12-Month Predictive Forecast Curve</h3>
            <p className="text-xs text-muted-foreground font-semibold">Consolidated timeline showing historical spend and future projections.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8b5cf6]">
              <span className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3b82f6]">
              <span className="w-3 h-3 rounded-full bg-[#3b82f6] border border-dashed" />
              <span>AI Forecast</span>
            </div>
          </div>
        </div>

        {forecastResults.historicalPoints.length < 3 ? (
          <div className="text-center py-20 text-xs font-semibold text-muted-foreground border border-dashed border-white/10 rounded-2xl">
            I need at least 3 months of historical transaction aggregates to render forecast curves. Log more items!
          </div>
        ) : (
          <PredictionGraph data={forecastResults.dataPoints} />
        )}
      </div>

      {/* Forecast Projections & Confidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Next Month expected */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between h-36">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Expected Next Month</span>
          <h4 className="text-3xl font-extrabold text-primary my-2">
            {formatCurrency(forecastResults.nextMonthEstimate)}
          </h4>
          <p className="text-[10px] text-muted-foreground font-semibold">Forecast for the next immediate interval</p>
        </div>

        {/* Expected Quarter */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between h-36">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Expected Quarterly Spend</span>
          <h4 className="text-3xl font-extrabold text-foreground my-2">
            {formatCurrency(forecastResults.quarterEstimate)}
          </h4>
          <p className="text-[10px] text-muted-foreground font-semibold">Sum of forecasts for the upcoming 3 months</p>
        </div>

        {/* Expected Yearly */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between h-36">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Expected Yearly Spend</span>
          <h4 className="text-3xl font-extrabold text-foreground my-2">
            {formatCurrency(forecastResults.yearEstimate)}
          </h4>
          <p className="text-[10px] text-muted-foreground font-semibold">Extrapolated total over 12 forecast intervals</p>
        </div>

        {/* Trend & Confidence Card */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between h-36">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Model Diagnostics</span>
          <div className="flex items-center justify-between my-2">
            <div>
              <span className="text-2xl font-extrabold text-indigo-500">{forecastResults.confidence}%</span>
              <p className="text-[9px] uppercase font-extrabold text-muted-foreground">Confidence Score</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider
                ${forecastResults.trend === 'up' 
                  ? 'bg-red-500/10 text-red-500' 
                  : forecastResults.trend === 'down' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-white/10 text-foreground'
                }
              `}>
                {forecastResults.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {forecastResults.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                <span>{forecastResults.trend}</span>
              </span>
              <p className="text-[9px] uppercase font-extrabold text-muted-foreground mt-1">Trend direction</p>
            </div>
          </div>
          <span className="text-[9px] text-indigo-400 font-extrabold flex items-center gap-1 mt-auto">
            <Info className="w-3.5 h-3.5" />
            <span>Calculated from historical residual MAPE</span>
          </span>
        </div>
      </div>

      {/* Educational Model Details */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4 text-primary">
          <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          <span className="font-extrabold text-sm text-foreground">Model Math & Architecture Reference</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-semibold">
          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-extrabold">Active Classifier</span>
              <span className="font-extrabold text-sm text-foreground">{activeModelMeta.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-extrabold">Description</span>
              <p className="text-foreground/80 mt-1">{activeModelMeta.description}</p>
            </div>
          </div>

          <div className="space-y-3 md:border-l md:border-white/5 md:pl-6">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-extrabold">Mathematical Representation</span>
              <code className="block bg-white/5 dark:bg-black/30 p-2.5 rounded-xl border border-white/10 font-mono text-[10px] text-primary mt-1">
                {activeModelMeta.math}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-extrabold">Optimal Use Case</span>
              <p className="text-foreground/80 mt-1">{activeModelMeta.useCase}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
