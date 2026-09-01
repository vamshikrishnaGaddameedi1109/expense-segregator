import React, { useState } from 'react';
import { Transaction } from './types';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { TransactionsTab } from './components/TransactionsTab';
import { UploadModal } from './components/UploadModal';
import { UploadHero } from './components/UploadHero';

export default function App() {
  // Empty state from the start - waiting for user's screenshot
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload parsed handler
  const handleDataParsed = (newTxns: Transaction[], _ocrText: string) => {
    if (newTxns.length > 0) {
      setTransactions(newTxns);
      setSelectedCategory('All');
    }
  };

  const handleClearData = () => {
    setTransactions([]);
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navbar */}
      <Navbar
        onUploadClick={() => setIsUploadOpen(true)}
        onClearData={handleClearData}
        totalTxns={transactions.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {transactions.length === 0 ? (
          /* Empty Initial State: Direct Screenshot Dropzone Hero */
          <UploadHero
            onDataParsed={handleDataParsed}
          />
        ) : (
          /* Active Dashboard with Parsed Transactions */
          <div className="space-y-6 animate-fade-in">
            {/* Top Metric KPI Cards */}
            <KPICards
              transactions={transactions}
              filteredTransactions={transactions}
            />

            {/* Category Breakdown & Highlights */}
            <CategoryBreakdown
              transactions={transactions}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Transactions Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <span>📋</span> Extracted Transaction Ledger
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Classified payments from your screenshot with category tags and outlier checks
                  </p>
                </div>
              </div>

              <TransactionsTab
                transactions={transactions}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal (accessible via header button) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataParsed={handleDataParsed}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#09090b] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <div>
            <strong className="text-zinc-400">Expense Segregator</strong> • Personal Expense Intelligence
          </div>
          <div>
            In-Browser OCR • Automatic Categorization • Outlier Detection
          </div>
        </div>
      </footer>

    </div>
  );
}
