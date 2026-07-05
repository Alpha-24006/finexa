import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import { formatMonthNameShort } from '../../utils/formatter';
import type { CategoryBudgetStatus } from '../../hooks/useBudget';

// Custom Tooltip component for consistent glass styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-white/20 p-3 rounded-xl text-xs font-semibold shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color || item.fill }} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            {item.name}: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Monthly Expense Line Chart
export const MonthlyExpenseLineChart: React.FC<{ data: { month: string; amount: number }[] }> = ({ data }) => {
  const chartData = data.map(d => ({
    name: formatMonthNameShort(d.month),
    amount: d.amount
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="rgba(156,163,175,0.6)" fontSize={10} tickLine={false} />
          <YAxis stroke="rgba(156,163,175,0.6)" fontSize={10} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            name="Spent"
            stroke="url(#lineColor)"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Expense Category Pie Chart
export const CategoryPieChart: React.FC<{ data: { category: string; amount: number; color: string }[] }> = ({ data }) => {
  const activeData = data.filter(d => d.amount > 0);

  return (
    <div className="w-full h-72 flex items-center justify-center">
      {activeData.length === 0 ? (
        <div className="text-center text-xs font-semibold text-muted-foreground">No data for pie visualization</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs font-bold text-foreground/80">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// 3. Weekly Spending Bar Chart
export const WeeklySpendingBarChart: React.FC<{ data: { week: string; amount: number }[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="week" stroke="rgba(156,163,175,0.6)" fontSize={10} tickLine={false} />
          <YAxis stroke="rgba(156,163,175,0.6)" fontSize={10} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" name="Spent" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Prediction Graph (Area Chart + Line Chart)
interface PredictionPoint {
  month: string;
  amount: number;
  isForecast: boolean;
}

export const PredictionGraph: React.FC<{ data: PredictionPoint[] }> = ({ data }) => {
  const chartData = data.map(d => ({
    name: formatMonthNameShort(d.month),
    actual: d.isForecast ? null : d.amount,
    forecast: d.amount,
    isForecast: d.isForecast
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="rgba(156,163,175,0.6)" fontSize={10} tickLine={false} />
          <YAxis stroke="rgba(156,163,175,0.6)" fontSize={10} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span className="text-xs font-bold text-foreground/80">{value}</span>} />
          <Area
            type="monotone"
            dataKey="actual"
            name="Historical Spend"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorActual)"
            dot={{ r: 3, fill: '#0f172a' }}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            name="AI Forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorForecast)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. Radar Chart (Category Spending vs Budget Limits)
export const RadarChart: React.FC<{ data: CategoryBudgetStatus[] }> = ({ data }) => {
  const activeData = data.slice(0, 7).map(d => ({
    subject: d.category,
    Spent: d.spent,
    Limit: d.limit,
    fullMark: Math.max(d.spent, d.limit) * 1.1
  }));

  return (
    <div className="w-full h-80 flex items-center justify-center">
      {activeData.length === 0 ? (
        <div className="text-center text-xs font-semibold text-muted-foreground">Define budget limits to enable radar visual</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={activeData}>
            <PolarGrid stroke="rgba(156,163,175,0.2)" />
            <PolarAngleAxis dataKey="subject" stroke="rgba(156,163,175,0.7)" fontSize={10} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="rgba(156,163,175,0.4)" fontSize={8} />
            <Radar name="Actual Spent" dataKey="Spent" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            <Radar name="Budget Limit" dataKey="Limit" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span className="text-xs font-bold text-foreground/80">{value}</span>} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// 6. Expense Heatmap (Custom calendar view grid representing spending concentrations)
interface HeatmapProps {
  expenses: { date: string; amount: number }[];
}

export const ExpenseHeatmap: React.FC<HeatmapProps> = ({ expenses }) => {
  // Generate date matrix for the last 30 days
  const data = React.useMemo(() => {
    const matrix: Record<string, number> = {};
    expenses.forEach(e => {
      matrix[e.date] = (matrix[e.date] || 0) + e.amount;
    });

    const list = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const amount = matrix[dateStr] || 0;
      list.push({
        dateStr,
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount
      });
    }
    return list;
  }, [expenses]);

  const getColorClass = (amount: number) => {
    if (amount === 0) return 'bg-white/5 border border-white/5';
    if (amount < 1000) return 'bg-primary/20 text-white border border-primary/30';
    if (amount < 3000) return 'bg-primary/45 text-white border border-primary/50';
    if (amount < 7000) return 'bg-primary/70 text-white border border-primary/75';
    return 'bg-primary text-white border border-primary-foreground/30 shadow-lg';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
        <span>Daily Activity (Last 28 Days)</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/5" />
          <span className="w-2.5 h-2.5 rounded bg-primary/20" />
          <span className="w-2.5 h-2.5 rounded bg-primary/45" />
          <span className="w-2.5 h-2.5 rounded bg-primary/70" />
          <span className="w-2.5 h-2.5 rounded bg-primary" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {data.map((day, idx) => (
          <div
            key={idx}
            className={`aspect-square flex flex-col justify-between p-1.5 rounded-xl transition-all duration-200 cursor-help ${getColorClass(day.amount)}`}
            title={`${day.dateStr}: Spent ${formatCurrency(day.amount)}`}
          >
            <span className="text-[10px] font-bold opacity-60 leading-none">{day.day}</span>
            <span className="text-[9px] font-extrabold uppercase truncate tracking-wider leading-none text-right">
              {day.amount > 0 ? formatCurrency(day.amount) : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
