import React from 'react';
import { Sparkles, BrainCircuit, Check, Copy } from 'lucide-react';
import { Transaction } from '../types';

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ transactions }) => {
  const [copied, setCopied] = React.useState(false);

  const expenses = transactions.filter(t => t.type === 'debit');
  const totalSpending = expenses.reduce((acc, t) => acc + t.amount, 0);
  const numTransactions = expenses.length;

  const categoryMap: Record<string, number> = {};
  expenses.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  let topCategory = 'Other';
  let topCategoryAmount = 0;
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  const topCategoryPct = totalSpending > 0 ? (topCategoryAmount / totalSpending) * 100 : 0;
  const anomalies = expenses.filter(t => t.isAnomaly);
  const anomalyCount = anomalies.length;

  const summaryText = `Your total spending is ₹${totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })} across ${numTransactions} transactions.\n\n${topCategory} accounts for ${topCategoryPct.toFixed(1)}% of your spending, making it your largest category.\n\n${anomalyCount > 0 ? `You have ${anomalyCount} unusually large transaction(s) identified by Isolation Forest.` : 'Your spending pattern shows consistent transaction distribution without severe statistical outliers.'}\n\nConsider reducing spending in your highest category (${topCategory}) by 10% to save approximately ₹${(topCategoryAmount * 0.10).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/70 text-emerald-400 flex items-center justify-center font-bold">
            🧠
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              Financial Summary
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Deterministic Engine
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Generated in real-time from verified mathematical distributions
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? 'Copied' : 'Copy Summary'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-200 leading-relaxed">
        
        <div className="space-y-2.5 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <p>
            • Your total spending is <strong className="text-white font-mono">₹{totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> across <strong className="text-white font-mono">{numTransactions}</strong> transactions.
          </p>
          <p>
            • <strong className="text-emerald-400">{topCategory}</strong> accounts for <strong className="text-emerald-400">{topCategoryPct.toFixed(1)}%</strong> of your spending, making it your largest category.
          </p>
        </div>

        <div className="space-y-2.5 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <p>
            • {anomalyCount > 0 ? (
              <span>You have <strong className="text-rose-300 font-mono">{anomalyCount}</strong> unusually large transaction(s) flagged for review.</span>
            ) : (
              <span>All active expenses conform to standard statistical baseline boundaries.</span>
            )}
          </p>
          <p>
            • Consider reducing spending in your highest category (<strong className="text-white">{topCategory}</strong>) by 10% to save approximately <strong className="text-emerald-400 font-mono">₹{(topCategoryAmount * 0.10).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.
          </p>
        </div>

      </div>
    </div>
  );
};
