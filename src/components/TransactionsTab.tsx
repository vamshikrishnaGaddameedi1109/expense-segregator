import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../utils/categorizer';

interface TransactionsTabProps {
  transactions: Transaction[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ 
  transactions,
  selectedCategory,
  onSelectCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'unusual_only'>('all');
  const [sortKey, setSortKey] = useState<'amount_desc' | 'amount_asc' | 'date_desc' | 'name_asc'>('amount_desc');

  const allCategories = Array.from(new Set(transactions.map(t => t.category))) as Category[];

  // Filter & Sort
  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesAnomaly = anomalyFilter === 'all' || (anomalyFilter === 'unusual_only' && t.isAnomaly);
    return matchesSearch && matchesCat && matchesAnomaly;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'amount_desc') return b.amount - a.amount;
    if (sortKey === 'amount_asc') return a.amount - b.amount;
    if (sortKey === 'date_desc') return b.date.localeCompare(a.date);
    if (sortKey === 'name_asc') return a.description.localeCompare(b.description);
    return 0;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Confidence', 'Anomaly Status'];
    const rows = sorted.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'debit' ? -t.amount : t.amount,
      t.type,
      t.category,
      `${Math.round(t.confidence * 100)}%`,
      t.isAnomaly ? 'Unusual' : 'Normal'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_segregator_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unusualCount = transactions.filter(t => t.isAnomaly).length;

  return (
    <div className="space-y-4">
      
      {/* Category Pills & Filter Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg shadow-black/20 space-y-3">
        
        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All Items ({transactions.length})
          </button>

          {allCategories.map(cat => {
            const isSelected = selectedCategory === cat;
            const color = CATEGORY_COLORS[cat] || '#a1a1aa';
            const count = transactions.filter(t => t.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(isSelected ? 'All' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                    : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{cat}</span>
                <span className="text-[10px] text-zinc-500 font-mono">({count})</span>
              </button>
            );
          })}

          {unusualCount > 0 && (
            <button
              onClick={() => setAnomalyFilter(prev => prev === 'all' ? 'unusual_only' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                anomalyFilter === 'unusual_only'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-zinc-950/80 text-rose-400/80 hover:text-rose-300 border-zinc-800'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>⚠️ Flagged Outliers ({unusualCount})</span>
            </button>
          )}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search merchant, keywords, or amount..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & Export */}
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as any)}
              className="px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="date_desc">Date: Newest First</option>
              <option value="name_asc">Merchant: A–Z</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-xl border border-zinc-700/80 transition active:scale-95 shadow-sm whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Ledger Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-lg shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {sorted.length > 0 ? (
                sorted.map((txn) => {
                  const color = CATEGORY_COLORS[txn.category] || '#94a3b8';
                  const isCredit = txn.type === 'credit';
                  return (
                    <tr 
                      key={txn.id}
                      className="hover:bg-zinc-800/40 transition group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap text-xs">
                        {txn.date || '—'}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-sans font-semibold text-zinc-100 group-hover:text-emerald-300 transition">
                        <div className="flex items-center gap-2">
                          <span>{txn.description}</span>
                          {isCredit && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              Income
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-sans">
                        <button
                          onClick={() => onSelectCategory(txn.category)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold hover:opacity-80 transition"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          {txn.category}
                        </button>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-zinc-100'}>
                          {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-sans">
                        {txn.isAnomaly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            ⚠️ Unusual
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-zinc-400 bg-zinc-800/40">
                            <CheckCircle className="w-3 h-3 text-emerald-500/70" />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-400 font-sans">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/50 text-xs text-zinc-400 flex items-center justify-between">
          <span>Showing <strong className="text-zinc-200">{sorted.length}</strong> of {transactions.length} total entries</span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Clear category filter ({selectedCategory})
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
