import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { Transaction, Category, BudgetConfig } from '../types';
import { CATEGORY_COLORS } from '../utils/categorizer';

interface SpendingAnalysisTabProps {
  transactions: Transaction[];
}

const DEFAULT_BUDGETS: BudgetConfig = {
  Food: 5000,
  Shopping: 3000,
  Transport: 2000,
  Bills: 4000,
  Entertainment: 1500,
  Healthcare: 2500,
  Other: 2000,
  'Personal Transfer': 5000
};

export const SpendingAnalysisTab: React.FC<SpendingAnalysisTabProps> = ({ transactions }) => {
  const [budgets, setBudgets] = useState<BudgetConfig>(DEFAULT_BUDGETS);

  const expenses = transactions.filter(t => t.type === 'debit');

  // Timeline / Date Aggregation
  const dateMap: Record<string, number> = {};
  expenses.forEach(t => {
    if (t.date) {
      dateMap[t.date] = (dateMap[t.date] || 0) + t.amount;
    }
  });

  const timelineData = Object.entries(dateMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Monthly Period Comparison (if multiple months exist in dataset)
  const monthMap: Record<string, number> = {};
  expenses.forEach(t => {
    if (t.date) {
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      monthMap[monthKey] = (monthMap[monthKey] || 0) + t.amount;
    }
  });

  const months = Object.keys(monthMap).sort();
  let currentMonthSpent = 0;
  let prevMonthSpent = 0;
  let pctChange = 0;
  let hasMonthComparison = false;

  if (months.length >= 2) {
    hasMonthComparison = true;
    prevMonthSpent = monthMap[months[months.length - 2]];
    currentMonthSpent = monthMap[months[months.length - 1]];
    pctChange = prevMonthSpent > 0 ? ((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100 : 0;
  } else if (timelineData.length >= 4) {
    // If only 1 month, compare first half vs second half of dates
    const mid = Math.floor(timelineData.length / 2);
    prevMonthSpent = timelineData.slice(0, mid).reduce((a, b) => a + b.amount, 0);
    currentMonthSpent = timelineData.slice(mid).reduce((a, b) => a + b.amount, 0);
    pctChange = prevMonthSpent > 0 ? ((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100 : 0;
    hasMonthComparison = true;
  }

  // Category Spend Totals
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const handleBudgetChange = (cat: string, value: number) => {
    setBudgets(prev => ({
      ...prev,
      [cat]: Math.max(100, value)
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Monthly / Timeline Trend Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Trend Line / Area Chart */}
        <div className="lg:col-span-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                📈 Spending Timeline & Velocity
              </h3>
              <p className="text-xs text-zinc-400">
                Daily capital outflow trajectory
              </p>
            </div>
            {hasMonthComparison && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                pctChange > 0 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {pctChange > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{pctChange > 0 ? `+${pctChange.toFixed(1)}%` : `${pctChange.toFixed(1)}%`} vs prior cycle</span>
              </div>
            )}
          </div>

          <div className="h-64 w-full pt-2">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#3f3f46" 
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    tickFormatter={d => d.substring(5)} // Show MM-DD
                  />
                  <YAxis 
                    stroke="#3f3f46" 
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    tickFormatter={val => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                            <div className="font-bold text-zinc-100 mb-1">{d.date}</div>
                            <div className="text-emerald-400 font-bold">
                              Daily Total: ₹{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#spendGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Timeline dates will generate automatically from OCR timestamps.
              </div>
            )}
          </div>
        </div>

        {/* Right: Period Comparison Cards */}
        <div className="lg:col-span-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-1">
              📊 Period Comparison
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Cyclical momentum & period variance
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-zinc-400">Current Period Spend</span>
                <div className="text-xl font-black text-white mt-0.5">
                  ₹{currentMonthSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-zinc-400">Previous Period Spend</span>
                <div className="text-xl font-black text-zinc-300 mt-0.5">
                  ₹{prevMonthSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {hasMonthComparison && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              pctChange > 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}>
              <strong>{pctChange > 0 ? '📈 Spending Surge:' : '📉 Prudent Decline:'}</strong> Spending {pctChange > 0 ? `increased by ${pctChange.toFixed(1)}%` : `decreased by ${Math.abs(pctChange).toFixed(1)}%`} compared with the previous period.
            </div>
          )}
        </div>

      </div>

      {/* Category-wise Budget Warning System (Section 6) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              🎯 Category-Wise Budget Warnings & Progress
            </h3>
            <p className="text-xs text-zinc-400">
              Customize monthly spending targets to trigger automated threshold alerts
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            Real-time threshold evaluation
          </span>
        </div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryTotals).map(([cat, spent]) => {
            const budgetLimit = budgets[cat] || 3000;
            const pctUsed = (spent / budgetLimit) * 100;
            const isExceeded = spent > budgetLimit;
            const isWarning = pctUsed >= 80 && !isExceeded;
            const color = CATEGORY_COLORS[cat as Category] || '#94a3b8';

            return (
              <div 
                key={cat}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isExceeded 
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30' 
                    : isWarning 
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-amber-950/30' 
                    : 'bg-zinc-950/80 border-zinc-800/80'
                }`}
              >
                {/* Header with Category Name & Budget Input */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-bold text-sm text-zinc-100">{cat}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-zinc-400">Budget: ₹</span>
                    <input
                      type="number"
                      value={budgetLimit}
                      step={500}
                      min={100}
                      onChange={e => handleBudgetChange(cat, parseFloat(e.target.value) || 100)}
                      className="w-20 px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-right text-white font-mono font-bold focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="my-2">
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pctUsed)}%` }}
                    />
                  </div>
                </div>

                {/* Status Callout */}
                <div className="mt-2 text-xs">
                  {isExceeded ? (
                    <div className="text-rose-300 font-semibold flex items-center gap-1">
                      <span>🚨</span>
                      <span><strong>{cat} budget exceeded</strong> by ₹{(spent - budgetLimit).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                    </div>
                  ) : isWarning ? (
                    <div className="text-amber-300 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span><strong>{cat} is at {pctUsed.toFixed(0)}%</strong> of its budget (₹{spent.toLocaleString('en-IN')} / ₹{budgetLimit.toLocaleString('en-IN')})</span>
                    </div>
                  ) : (
                    <div className="text-zinc-400 flex items-center justify-between">
                      <span>₹{spent.toLocaleString('en-IN', { minimumFractionDigits: 0 })} spent</span>
                      <span className="font-mono text-emerald-400">{pctUsed.toFixed(0)}% used</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
