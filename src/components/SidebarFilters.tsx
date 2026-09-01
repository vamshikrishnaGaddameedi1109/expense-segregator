import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Upload, 
  Sliders, 
  Tag, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { CATEGORY_COLORS } from '../utils/categorizer';

interface SidebarFiltersProps {
  categories: Category[];
  selectedCategories: Category[];
  onToggleCategory: (cat: Category) => void;
  onSelectAllCategories: () => void;
  onClearCategories: () => void;
  minAmount: number;
  maxPossibleAmount: number;
  onChangeMinAmount: (val: number) => void;
  onResetFilters: () => void;
  onOpenUpload: () => void;
  rawOCRText: string;
  transactions: Transaction[];
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onSelectAllCategories,
  onClearCategories,
  minAmount,
  maxPossibleAmount,
  onChangeMinAmount,
  onResetFilters,
  onOpenUpload,
  rawOCRText,
  transactions
}) => {
  const [showRawOCR, setShowRawOCR] = React.useState(false);

  const dates = transactions
    .map(t => t.date)
    .filter(Boolean)
    .sort();

  const minDate = dates[0] || '';
  const maxDate = dates[dates.length - 1] || '';

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      
      {/* Upload Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg shadow-black/20">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          OCR Ingestion
        </h3>
        <button
          onClick={onOpenUpload}
          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-98 flex items-center justify-center gap-2"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Screenshot / Text
        </button>
      </div>

      {/* Filter Parameters */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-4 shadow-black/20">
        
        {/* Header with Reset */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Filters
          </h3>
          <button
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>

        {/* Date / Period Filter Range if available */}
        {minDate && (
          <div>
            <div className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Detected Date Range
            </div>
            <div className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-400 text-center">
              {minDate} <span className="text-zinc-600">to</span> {maxDate}
            </div>
          </div>
        )}

        {/* Minimum Transaction Amount */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              Min Amount:
            </span>
            <span className="font-mono font-bold text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              ₹{minAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(1000, maxPossibleAmount)}
            step={50}
            value={minAmount}
            onChange={e => onChangeMinAmount(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
            <span>₹0</span>
            <span>₹{Math.max(1000, maxPossibleAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              Categories ({selectedCategories.length}/{categories.length})
            </span>
            <div className="flex gap-2 text-[11px]">
              <button 
                onClick={onSelectAllCategories} 
                className="text-zinc-400 hover:text-white"
              >
                All
              </button>
              <button 
                onClick={onClearCategories} 
                className="text-zinc-400 hover:text-white"
              >
                None
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {categories.map(cat => {
              const isChecked = selectedCategories.includes(cat);
              const color = CATEGORY_COLORS[cat] || '#94a3b8';

              return (
                <label
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer select-none transition ${
                    isChecked
                      ? 'bg-zinc-950/90 border-zinc-700/90 text-zinc-200'
                      : 'bg-zinc-950/30 border-zinc-800/50 text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: isChecked ? color : '#52525b' }} 
                    />
                    <span className="font-medium">{cat}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handled by parent click
                    className="accent-emerald-500 w-3.5 h-3.5 rounded pointer-events-none"
                  />
                </label>
              );
            })}
          </div>
        </div>

      </div>

      {/* Raw OCR Text Expander for Debugging */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-lg shadow-black/20">
        <button
          onClick={() => setShowRawOCR(prev => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white transition"
        >
          <span className="flex items-center gap-1.5">
            {showRawOCR ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            Raw OCR Text (Debug)
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {showRawOCR ? 'Hide' : 'Inspect'}
          </span>
        </button>

        {showRawOCR && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
              {rawOCRText || 'No raw OCR stream available.'}
            </pre>
          </div>
        )}
      </div>

    </aside>
  );
};
