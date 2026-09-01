import React from 'react';
import { 
  Sparkles, 
  Upload, 
  Trash2
} from 'lucide-react';

interface NavbarProps {
  onUploadClick: () => void;
  onClearData: () => void;
  totalTxns: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onUploadClick,
  onClearData,
  totalTxns
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-md text-emerald-400 font-black text-xl">
              💳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
                  Expense Segregator
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  OCR Intelligence
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Payment Screenshot Ingestion • Auto Categorization • Outliers
              </p>
            </div>
          </div>

          <button
            onClick={onUploadClick}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end w-full md:w-auto">
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            {totalTxns > 0 ? 'Upload Another Screenshot' : 'Upload Screenshot'}
          </button>

          {totalTxns > 0 && (
            <button
              onClick={onClearData}
              title="Clear transactions and start fresh"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-zinc-400 hover:text-rose-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/30 rounded-xl transition text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
