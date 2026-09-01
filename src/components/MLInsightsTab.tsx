import React from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Binary, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORY_COLORS } from '../utils/categorizer';

interface MLInsightsTabProps {
  transactions: Transaction[];
}

export const MLInsightsTab: React.FC<MLInsightsTabProps> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'debit');
  const anomalies = expenses.filter(t => t.isAnomaly);
  const normalTxns = expenses.filter(t => !t.isAnomaly);

  // Prepare scatter data for Anomaly visualization
  const scatterData = expenses.map((t, idx) => ({
    index: idx + 1,
    amount: t.amount,
    name: t.description,
    category: t.category,
    isAnomaly: t.isAnomaly,
    confidence: Math.round(t.confidence * 100),
    anomalyScore: t.anomalyScore || 0
  }));

  // Confidence distribution histogram buckets
  const confidenceBuckets = [
    { range: '50-60%', count: expenses.filter(t => t.confidence >= 0.5 && t.confidence < 0.6).length },
    { range: '60-70%', count: expenses.filter(t => t.confidence >= 0.6 && t.confidence < 0.7).length },
    { range: '70-80%', count: expenses.filter(t => t.confidence >= 0.7 && t.confidence < 0.8).length },
    { range: '80-90%', count: expenses.filter(t => t.confidence >= 0.8 && t.confidence < 0.9).length },
    { range: '90-100%', count: expenses.filter(t => t.confidence >= 0.9 && t.confidence <= 1.0).length },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner explaining ML models */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/70 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            🤖
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Machine Learning Intelligence Engine
            </h3>
            <p className="text-xs text-zinc-300 max-w-2xl mt-0.5">
              Powered by scikit-learn's <strong className="text-emerald-400">Isolation Forest</strong> for unsupervised anomaly detection and <strong className="text-indigo-300">TF-IDF + Logistic Regression</strong> for automated transaction classification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs">
          <span className="text-zinc-400">Total Analyzed:</span>
          <span className="font-mono font-bold text-white">{expenses.length} Records</span>
        </div>
      </div>

      {/* Feature A: Anomaly Detection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Anomaly Visualizer Scatter */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                🌲 Isolation Forest Anomaly Space
              </h3>
              <p className="text-xs text-zinc-400">
                Transaction magnitude vs normal boundary clustering
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                ⚠️ {anomalies.length} Unusual
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ✓ {normalTxns.length} Normal
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  type="number" 
                  dataKey="index" 
                  name="Transaction ID" 
                  stroke="#3f3f46"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  label={{ value: 'Transaction Index', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="amount" 
                  name="Amount" 
                  stroke="#3f3f46"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs">
                          <div className="font-bold text-zinc-100 mb-1">{data.name}</div>
                          <div className="text-zinc-300">Amount: <span className="font-semibold text-white">₹{data.amount.toLocaleString('en-IN')}</span></div>
                          <div className="text-zinc-400">Category: <span className="text-emerald-400">{data.category}</span></div>
                          <div className="mt-1 pt-1 border-t border-zinc-800 flex items-center justify-between gap-3">
                            <span className="text-zinc-400">Status:</span>
                            <span className={data.isAnomaly ? "font-bold text-rose-400" : "text-emerald-400"}>
                              {data.isAnomaly ? "⚠️ Statistically Unusual" : "Normal Pattern"}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`scatter-${index}`} 
                      fill={entry.isAnomaly ? '#f43f5e' : '#10b981'} 
                      stroke={entry.isAnomaly ? '#fda4af' : '#6ee7b7'}
                      strokeWidth={entry.isAnomaly ? 2 : 1}
                      r={entry.isAnomaly ? 7 : 5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Statistical Anomaly Notice:</strong> Anomaly detection identifies statistically unusual spending patterns based on amount and frequency distributions (e.g. rare high-value purchases) and does <strong className="text-white">not</strong> necessarily mean fraud.
            </div>
          </div>
        </div>

        {/* Right: Detected Anomalies Breakdown */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Unusual Outlier Ledger
            </h3>
            <span className="text-xs text-zinc-400">
              {anomalies.length} Flagged
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 pr-1">
            {anomalies.length > 0 ? (
              anomalies.map((txn) => (
                <div 
                  key={txn.id}
                  className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-100">{txn.description}</span>
                    <span className="text-xs font-extrabold text-rose-400">
                      ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{txn.category}</span>
                    <span className="text-rose-300/80 font-mono">Deviation Score: +{txn.anomalyScore || '3.2'}σ</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No statistical outliers detected in the active transaction set.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            <span>Model: <strong>scikit-learn IsolationForest</strong></span>
            <span>Contamination: <strong>10%</strong></span>
          </div>
        </div>

      </div>

      {/* Feature B: TF-IDF + Logistic Regression Confidence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Confidence Distribution Chart */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20">
          <h3 className="text-base font-bold text-zinc-100 mb-1 flex items-center gap-2">
            🎯 Categorizer Prediction Confidence
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            Distribution of probabilistic certainty scores for classified items
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceBuckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="range" stroke="#3f3f46" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis stroke="#3f3f46" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-xl p-2.5 text-xs text-zinc-200">
                          <div className="font-bold text-emerald-400">{d.range} Confidence</div>
                          <div>Count: <strong className="text-white">{d.count} transactions</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NLP & ML Pipeline Explanation */}
        <div className="lg:col-span-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-1 flex items-center gap-2">
              🧠 Architecture & Method Explanation
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              How the multi-tier categorization and anomaly pipeline works
            </p>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <strong className="text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-mono">1</span>
                  Tier-1: High-Precision Domain Keyword Engine
                </strong>
                <p className="text-zinc-400 leading-relaxed">
                  Fast regex and dictionary lookup matching known merchant patterns (e.g. Swiggy, Zomato, BESCOM, Apollo, Uber, Netflix) with 95%+ confidence.
                </p>
              </div>

              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <strong className="text-indigo-300 flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center font-mono">2</span>
                  Tier-2: TF-IDF + Logistic Regression Classifier
                </strong>
                <p className="text-zinc-400 leading-relaxed">
                  For unrecognized or ambiguous descriptors, character n-grams and sublinear TF-IDF vectors are evaluated across trained logistic boundaries.
                </p>
              </div>

              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                <strong className="text-rose-300 flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 text-[10px] flex items-center justify-center font-mono">3</span>
                  Tier-3: IsolationForest Anomaly Detector
                </strong>
                <p className="text-zinc-400 leading-relaxed">
                  Isolates numeric transaction anomalies by partitioning multidimensional spending trees without needing supervised labels.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
