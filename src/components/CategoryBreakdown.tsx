import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../utils/categorizer';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory
}) => {
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

  const topCategory = categoryData[0];
  const anomalies = expenses.filter(t => t.isAnomaly);
  const highestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Category Donut & Quick Breakdown */}
      <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>🍩</span> Spending by Category
            </h3>
            <p className="text-xs text-zinc-400">
              Interactive distribution across expense verticals
            </p>
          </div>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-2">
          {/* Donut Chart */}
          <div className="sm:col-span-5 h-56 relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 shadow-xl text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-zinc-100 mb-0.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                              {data.name}
                            </div>
                            <div className="text-zinc-300">
                              ₹{data.rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-emerald-400 font-semibold">
                              {data.percentage.toFixed(1)}% of total
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
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#09090b"
                        strokeWidth={2}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        onClick={() => onSelectCategory(entry.name === selectedCategory ? 'All' : entry.name)}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-zinc-500">No data</div>
            )}
            
            {/* Center Total Inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total</span>
              <span className="text-sm font-extrabold text-zinc-100 font-mono">
                ₹{totalSpending > 99999 ? `${(totalSpending / 1000).toFixed(0)}k` : totalSpending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Ranked Category List */}
          <div className="sm:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
            {categoryData.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
                  className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between text-xs border ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-zinc-200 truncate">{cat.name}</span>
                    <span className="text-[10px] text-zinc-500">({cat.count})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-bold text-zinc-100">
                      ₹{cat.rawTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-semibold w-10 text-right">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Click any category above to filter the transaction ledger</span>
          <span><strong>{categoryData.length}</strong> categories active</span>
        </div>
      </div>

      {/* Key Insights & Anomaly Card */}
      <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Spending Highlights
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Key automated takeaways from your current transactions
          </p>
        </div>

        <div className="space-y-2.5 flex-1 justify-center flex flex-col">
          {/* Top Category Highlight */}
          {topCategory && (
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mb-0.5">
                Largest Expense Category
              </div>
              <div className="text-sm font-bold text-zinc-100">
                <span className="text-emerald-400">{topCategory.name}</span> takes up <span className="text-emerald-400">{topCategory.percentage.toFixed(1)}%</span> of your budget (₹{topCategory.rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).
              </div>
            </div>
          )}

          {/* Highest Single Transaction */}
          {highestExpense && (
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mb-0.5">
                Highest Single Purchase
              </div>
              <div className="text-sm font-bold text-zinc-100 flex items-center justify-between">
                <span className="truncate mr-2">{highestExpense.description}</span>
                <span className="font-mono text-emerald-400 shrink-0">
                  ₹{highestExpense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Categorized under {highestExpense.category} ({highestExpense.date})
              </div>
            </div>
          )}

          {/* Outlier Alert if any */}
          {anomalies.length > 0 ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-rose-300">
                  {anomalies.length} Unusual Transaction{anomalies.length > 1 ? 's' : ''} Flagged
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Significantly higher than your standard spending pattern. Tagged with ⚠️ in the ledger.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
              ✓ All transactions fall within normal expected expenditure thresholds.
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Deterministic classification & ML outlier score</span>
        </div>
      </div>

    </div>
  );
};
