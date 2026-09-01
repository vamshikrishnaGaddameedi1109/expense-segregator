import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  Flame, 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  TrendingDown, 
  ShoppingBag, 
  Utensils, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../utils/categorizer';

interface DashboardTabProps {
  transactions: Transaction[];
  onSelectCategory: (cat: Category) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  transactions,
  onSelectCategory
}) => {
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);

  const expenses = transactions.filter(t => t.type === 'debit');
  const totalSpending = expenses.reduce((acc, t) => acc + t.amount, 0);

  // Group by Category
  const categoryMap: Record<string, { total: number; count: number }> = {};
  expenses.forEach(t => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { total: 0, count: 0 };
    }
    categoryMap[t.category].total += t.amount;
    categoryMap[t.category].count += 1;
  });

  const categoryData = Object.entries(categoryMap)
    .map(([cat, data]) => ({
      name: cat as Category,
      value: Math.round(data.total),
      rawTotal: data.total,
      percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
      count: data.count,
      color: CATEGORY_COLORS[cat as Category] || '#94a3b8'
    }))
    .sort((a, b) => b.value - a.value);

  // Top 5 Expenses
  const top5Expenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  // Dynamic Insights Calculation
  const topCategory = categoryData[0];
  const shoppingCat = categoryData.find(c => c.name === 'Shopping');
  const anomalies = expenses.filter(t => t.isAnomaly);
  const potentialSavings = topCategory ? topCategory.rawTotal * 0.10 : 0;

  const categoryIcons: Record<string, string> = {
    Food: '🍔',
    Shopping: '🛍️',
    Transport: '🚗',
    Bills: '💡',
    Entertainment: '🍿',
    Healthcare: '🏥',
    'Personal Transfer': '💸',
    Other: '📦'
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Donut Chart */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                🍩 Spending by Category
              </h3>
              <p className="text-xs text-zinc-400">
                Interactive distribution across spending verticals
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {categoryData.length} Verticals
            </span>
          </div>

          <div className="h-72 w-full relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                            <div className="flex items-center gap-2 font-bold text-zinc-100 mb-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              {data.name}
                            </div>
                            <div className="text-zinc-300">
                              Amount: <span className="font-semibold text-white">₹{data.rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-zinc-400">
                              Share: <span className="font-semibold text-emerald-400">{data.percentage.toFixed(1)}%</span> ({data.count} items)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                    onMouseLeave={() => setActiveDonutIndex(null)}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#09090b"
                        strokeWidth={2}
                        className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-zinc-500">No expense records detected</div>
            )}

            {/* Center Summary Inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total</span>
              <span className="text-lg font-black text-zinc-100">
                ₹{totalSpending > 100000 ? `${(totalSpending / 1000).toFixed(1)}k` : totalSpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Quick Legend Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-zinc-800/80">
            {categoryData.slice(0, 6).map(cat => (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
                <span className="font-semibold text-zinc-400">{cat.percentage.toFixed(0)}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Bar Chart (Category -> Spending sorted highest to lowest) */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                📊 Category Totals (Sorted)
              </h3>
              <p className="text-xs text-zinc-400">
                Ranked by highest capital outflow
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Descending Order
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                  stroke="#3f3f46"
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#e4e4e7', fontSize: 12 }}
                  width={90}
                  stroke="#3f3f46"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(63, 63, 70, 0.3)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                          <div className="font-bold text-zinc-100 mb-1">{data.name}</div>
                          <div className="text-zinc-300">
                            Total Spent: <span className="font-semibold text-emerald-400">₹{data.rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-zinc-400">
                            Percentage of Total: <span className="font-semibold text-white">{data.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 mt-auto">
            <span>Highest: <strong className="text-zinc-200">{categoryData[0]?.name || 'N/A'}</strong> (₹{categoryData[0]?.value.toLocaleString('en-IN')})</span>
            <span>Lowest: <strong className="text-zinc-200">{categoryData[categoryData.length - 1]?.name || 'N/A'}</strong></span>
          </div>
        </div>

      </div>

      {/* Dynamic Spending Insights & Top 5 Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dynamically Generated Insights */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Dynamic Spending Insights
            </h3>
            <span className="text-xs text-zinc-400 font-medium">
              Calculated from active dataset
            </span>
          </div>

          {/* Insight 1: Largest category statement */}
          {topCategory && (
            <div className="bg-zinc-900/90 border-l-4 border-emerald-500 border-y border-r border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{categoryIcons[topCategory.name] || '🏷️'}</span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">
                    {topCategory.name} is your largest expense category
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    You spent <span className="font-semibold text-emerald-300">₹{topCategory.rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> on {topCategory.name}, which represents <span className="font-semibold text-emerald-300">{topCategory.percentage.toFixed(1)}%</span> of your total spending across {topCategory.count} purchases.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insight 2: Smart Saving Potential */}
          {topCategory && (
            <div className="bg-zinc-900/90 border-l-4 border-teal-500 border-y border-r border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="text-sm font-bold text-teal-300">
                    Smart Optimization Target
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Reducing <span className="font-semibold text-white">{topCategory.name}</span> spending by 10% could save approximately <span className="font-bold text-teal-400">₹{potentialSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> in your upcoming cycle.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insight 3: Shopping / Discretionary Alert if high */}
          {shoppingCat && shoppingCat.percentage > 20 && (
            <div className="bg-zinc-900/90 border-l-4 border-amber-500 border-y border-r border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    High Discretionary Spending Alert
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Your <span className="font-semibold text-white">Shopping</span> expenses ({shoppingCat.percentage.toFixed(1)}% of total) are unusually high compared with your essential baseline expenses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insight 4: Anomaly Detection count */}
          {anomalies.length > 0 && (
            <div className="bg-zinc-900/90 border-l-4 border-rose-500 border-y border-r border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌲</span>
                <div>
                  <h4 className="text-sm font-bold text-rose-300">
                    {anomalies.length} Statistical Outlier Transaction(s) Detected
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    IsolationForest identified purchases that sit significantly beyond your standard distribution (e.g. {anomalies[0]?.description} - ₹{anomalies[0]?.amount.toLocaleString('en-IN')}).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Top 5 Transactions */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  🔥 Top 5 Transactions
                </h3>
                <p className="text-xs text-zinc-400">
                  Sorted by highest transaction amount
                </p>
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-semibold bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
              Ranked 1–5
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {top5Expenses.map((txn, idx) => {
              const color = CATEGORY_COLORS[txn.category] || '#94a3b8';
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0 border border-zinc-700/60">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-100 truncate group-hover:text-emerald-300 transition">
                        {txn.description}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span 
                          className="inline-flex items-center gap-1 font-medium px-1.5 py-0.2 rounded"
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          {categoryIcons[txn.category] || '🏷️'} {txn.category}
                        </span>
                        {txn.date && <span>• {txn.date}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white">
                      ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    {txn.isAnomaly ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded">
                        ⚠️ Unusual
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Normal</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
