import { Transaction } from '../types';

export function computeAnomalies(transactions: Transaction[]): Transaction[] {
  if (transactions.length === 0) return [];

  const amounts = transactions.map(t => t.amount);
  const n = amounts.length;
  
  if (n < 3) {
    return transactions.map(t => ({ ...t, isAnomaly: false, anomalyScore: 0 }));
  }

  // Calculate Mean, Standard Deviation, and Median
  const mean = amounts.reduce((acc, v) => acc + v, 0) / n;
  const variance = amounts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Sorted values for IQR calculation
  const sorted = [...amounts].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const upperThresholdIQR = q3 + 1.8 * iqr;
  const upperThresholdStd = mean + 2.2 * stdDev;

  return transactions.map(t => {
    // A transaction is flagged as an anomaly if it exceeds both standard statistical outlier fences
    // or is extremely high compared to average and exceeds ₹2,500
    const isOutlier = (t.amount > upperThresholdIQR && t.amount > 2000) || 
                      (t.amount > upperThresholdStd && t.amount > 3000) ||
                      (t.amount > mean * 3.5 && t.amount > 2500);

    const score = stdDev > 0 ? (t.amount - mean) / stdDev : 0;

    return {
      ...t,
      isAnomaly: isOutlier,
      anomalyScore: Math.round(score * 10) / 10
    };
  });
}
