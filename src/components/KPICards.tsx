import React from 'react';
import { 
  Wallet, 
  Receipt, 
  Tag, 
  TrendingUp, 
  ArrowUpRight, 
  AlertTriangle 
} from 'lucide-react';
import { Transaction } from '../types';

interface KPICardsProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
}

export const KPICards: React.FC<KPICardsProps> = ({
  transactions,
  filteredTransactions
}) => {
  // Expenses only (debits)
  const expenses = filteredTransactions.filter(t => t.type === 'debit');
  const totalSpending = expenses.reduce((acc, t) => acc + t.amount, 0);
  const numTransactions = expenses.length;
  const avgTransaction = numTransactions > 0 ? totalSpending / numTransactions : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  let topCategory = 'N/A';
  let topCategoryAmount = 0;
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  const topCategoryPct = totalSpending > 0 ? (topCategoryAmount / totalSpending) * 100 : 0;
  const anomalyCount = expenses.filter(t => t.isAnomaly).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Spending */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-700/80 transition group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span className="text-base">💰</span> Total Spending
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ₹{totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
          <span className="text-emerald-400 font-semibold flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            Active View
          </span>
          <span>• Across filtered items</span>
        </div>
      </div>

      {/* 2. Number of Transactions */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-700/80 transition group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span className="text-base">📊</span> Transactions
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {numTransactions}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
          {anomalyCount > 0 ? (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {anomalyCount} Unusual Anomaly
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold">100% Normalized</span>
          )}
          <span>• Categorized</span>
        </div>
      </div>

      {/* 3. Top Spending Category */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-700/80 transition group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span className="text-base">🏷️</span> Top Category
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
          {topCategory}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
          <span>₹{topCategoryAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
          <span className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
            {topCategoryPct.toFixed(1)}% share
          </span>
        </div>
      </div>

      {/* 4. Average Transaction */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-700/80 transition group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span className="text-base">📈</span> Avg Transaction
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ₹{avgTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
          <span className="text-zinc-400">Per debit event</span>
          <span>• Across all buckets</span>
        </div>
      </div>

    </div>
  );
};
