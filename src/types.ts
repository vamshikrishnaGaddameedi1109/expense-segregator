export type Category = 
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Fuel'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Personal Transfer'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Positive for income, negative for expense in raw, normalized to positive for expense
  rawAmount: number;
  type: 'debit' | 'credit';
  category: Category;
  confidence: number;
  isAnomaly: boolean;
  anomalyScore?: number;
}

export interface BudgetConfig {
  [category: string]: number;
}

export interface SpendingInsight {
  id: string;
  icon: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  highlight?: string;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
  color: string;
}
