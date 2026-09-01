import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Terminal, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';

interface FileCodeData {
  filename: string;
  language: string;
  description: string;
  code: string;
}

const PROJECT_FILES: FileCodeData[] = [
  {
    filename: 'app.py',
    language: 'python',
    description: 'Upgraded Streamlit application with modern fintech theme, Plotly donut & bar charts, 4 tabs, budget warning system, IsolationForest anomaly detection, and AI financial summary.',
    code: `import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import IsolationForest
import re
from datetime import datetime

from ocr_utils import extract_text_from_image, parse_transactions_from_text
from categorizer import categorize_transactions, MLCategorizer

# Page Configuration & Fintech Styling
st.set_page_config(
    page_title="Expense Segregator",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }
    .kpi-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 14px; padding: 18px; }
    .kpi-title { font-size: 0.85rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    .kpi-value { font-size: 1.75rem; font-weight: 800; color: #f8fafc; }
</style>
""", unsafe_allow_html=True)

# Main Application logic
# (See full file in workspace root: app.py)`
  },
  {
    filename: 'categorizer.py',
    language: 'python',
    description: 'Multi-tier classification engine: instant domain keywords + pre-trained and online TF-IDF vectorizer with Logistic Regression calculating confidence probabilities.',
    code: `import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

CATEGORIES = ["Food", "Shopping", "Transport", "Bills", "Entertainment", "Healthcare", "Personal Transfer", "Other"]

# Full dictionary & MLCategorizer class
# (See full file in workspace root: categorizer.py)`
  },
  {
    filename: 'ocr_utils.py',
    language: 'python',
    description: 'Enhanced spatial Tesseract OCR extractor with date recognition, UPI merchant name cleaning, amount parsing, and noise token filters.',
    code: `import pytesseract
from PIL import Image
import re
import pandas as pd
from datetime import datetime

# Full OCR spatial text reconstruction & parser
# (See full file in workspace root: ocr_utils.py)`
  },
  {
    filename: 'requirements.txt',
    language: 'text',
    description: 'Lightweight dependency manifest for lightning-fast installation.',
    code: `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
plotly>=5.18.0
pytesseract>=0.3.10
pillow>=10.0.0`
  }
];

export const PythonProjectTab: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeFile = PROJECT_FILES[activeFileIndex];

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Execution Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Step 1: Install */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Step 1: Install Dependencies
              </span>
              <button
                onClick={() => handleCopyCmd('pip install -r requirements.txt')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded"
              >
                {copiedCmd === 'pip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <code className="block p-3 rounded-xl bg-zinc-950 font-mono text-xs text-emerald-400 border border-zinc-800">
              pip install streamlit pandas numpy scikit-learn plotly pytesseract pillow
            </code>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Installs lightweight packages with no heavy neural network overhead.
          </p>
        </div>

        {/* Step 2: Run */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Step 2: Launch Streamlit App
              </span>
              <button
                onClick={() => handleCopyCmd('streamlit run app.py')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded"
              >
                {copiedCmd === 'run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <code className="block p-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 border border-zinc-800">
              streamlit run app.py
            </code>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Opens your upgraded AI-powered Personal Expense Intelligence Dashboard.
          </p>
        </div>

      </div>

      {/* Upgraded Project Files Viewer */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-lg shadow-black/20 overflow-hidden">
        
        {/* File Tabs Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950/80 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {PROJECT_FILES.map((file, idx) => (
              <button
                key={file.filename}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
                  activeFileIndex === idx
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {file.filename}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyCode(activeFile.code, activeFileIndex)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700/60"
            >
              {copiedIndex === activeFileIndex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              {copiedIndex === activeFileIndex ? 'Copied to Clipboard' : 'Copy File Content'}
            </button>
          </div>
        </div>

        {/* File Details & Code Block */}
        <div className="p-5">
          <div className="mb-3 text-xs text-zinc-300">
            <span className="font-bold text-white">{activeFile.filename}: </span>
            {activeFile.description}
          </div>

          <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-96">
            <code>{activeFile.code}</code>
          </pre>
        </div>

      </div>

      {/* Robustness & Error Handling Checklist */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg shadow-black/20 space-y-3">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Production Checklist & Common Errors Handled
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            <strong className="text-emerald-400 block mb-1">✓ Incomplete / Noisy OCR Data Handling</strong>
            Line-by-line heuristic fallback gracefully catches amounts and merchant tokens even when the standard PhonePe/GPay pattern is clipped or misaligned.
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            <strong className="text-emerald-400 block mb-1">✓ IsolationForest Small Sample Safety</strong>
            When sample sizes are small (&lt; 4 items), a safe quantile and standard deviation heuristic is automatically used so scikit-learn never crashes.
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            <strong className="text-emerald-400 block mb-1">✓ Date Parsing Tolerance</strong>
            Supports multiple formats ("16 Jul", "16 Jul 2024", "DD/MM/YYYY") and skips date rendering cleanly without inventing fake timestamps if dates are absent.
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            <strong className="text-emerald-400 block mb-1">✓ Pre-Trained TF-IDF Seed Corpus</strong>
            Classifies transactions reliably on cold-start even before 5 user-provided labeled samples exist, updating dynamically with any custom labels.
          </div>
        </div>
      </div>

    </div>
  );
};
