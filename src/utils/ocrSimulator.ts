import { Transaction } from '../types';
import { categorizeDescription } from './categorizer';
import { computeAnomalies } from './anomalyDetector';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseOCRTextToTransactions(text: string): Transaction[] {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const records: Array<{ date: string; description: string; rawAmount: number; type: 'debit' | 'credit' }> = [];

  // Match pattern: Paid to / Received from ... Debited from / Credited to
  const regex = /(Paid to|Received from|Payment to|Transfer to|Money Sent to)\s+(.*?)\s+(Debited from|Credited to|Completed|Successful|Failed|$)/gi;
  const flatText = text.replace(/\s+/g, ' ');

  let match;
  while ((match = regex.exec(flatText)) !== null) {
    const direction = match[1];
    const middle = match[2];
    const isDebit = /paid|sent|payment to|transfer to/i.test(direction);

    // Extract Date
    let dateStr = '';
    const dateMatch = middle.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === dateMatch[2].toLowerCase()) + 1;
      const month = monthIdx.toString().padStart(2, '0');
      dateStr = `2024-${month}-${day}`;
    }

    // Extract Amount
    const cleanMiddle = middle.replace(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/gi, '');
    const amountMatches = cleanMiddle.match(/(?:₹|Rs\.?|INR|\b)?\s*(\d[\d,]*\.?\d*)/g);

    if (amountMatches && amountMatches.length > 0) {
      const lastAmtStr = amountMatches[amountMatches.length - 1].replace(/[₹RsINR,\s]/gi, '');
      const amt = parseFloat(lastAmtStr);
      if (!isNaN(amt) && amt > 0) {
        // Merchant Name
        const namePart = cleanMiddle.substring(0, cleanMiddle.lastIndexOf(lastAmtStr));
        const tokens = namePart.split(/\s+/).filter(t => t.length > 1 && !/^(debited|credited|from|to|at|ref|upi|bank)$/i.test(t));
        const name = tokens.join(' ').toUpperCase().trim() || 'UPI MERCHANT';

        records.push({
          date: dateStr || new Date().toISOString().split('T')[0],
          description: name,
          rawAmount: isDebit ? -amt : amt,
          type: isDebit ? 'debit' : 'credit'
        });
      }
    }
  }

  // Fallback: If structured pattern yielded few results, scan line by line
  if (records.length === 0) {
    for (const line of lines) {
      const amtMatch = line.match(/(?:₹|Rs\.?|INR)?\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/);
      if (amtMatch) {
        const val = parseFloat(amtMatch[1].replace(/,/g, ''));
        if (val >= 1 && val <= 500000) {
          const isCredit = /credited|received|\+|cashback/i.test(line);
          const cleanDesc = line.replace(/(?:₹|Rs\.?|INR|[0-9,\.]+|Paid to|Received from|Debited from|Credited to)/gi, '').trim();
          const tokens = cleanDesc.split(/\s+/).filter(t => t.length > 1 && !/^(debited|credited|from|to|at)$/i.test(t));
          const name = tokens.join(' ').toUpperCase().trim() || 'MERCHANT TRANSACTION';

          records.push({
            date: new Date().toISOString().split('T')[0],
            description: name,
            rawAmount: isCredit ? val : -val,
            type: isCredit ? 'credit' : 'debit'
          });
        }
      }
    }
  }

  const transactions: Transaction[] = records.map((r, i) => {
    const { category, confidence } = categorizeDescription(r.description);
    return {
      id: `ocr-${Date.now()}-${i + 1}`,
      date: r.date,
      description: r.description,
      rawAmount: r.rawAmount,
      amount: Math.abs(r.rawAmount),
      type: r.type,
      category: r.type === 'credit' ? 'Personal Transfer' : category,
      confidence,
      isAnomaly: false
    };
  });

  const expenses = transactions.filter(t => t.type === 'debit');
  const scored = computeAnomalies(expenses);

  return transactions.map(t => {
    if (t.type === 'credit') return t;
    const match = scored.find(s => s.id === t.id);
    return match || t;
  });
}
