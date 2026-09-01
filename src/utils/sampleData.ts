import { Transaction } from '../types';
import { categorizeDescription } from './categorizer';
import { computeAnomalies } from './anomalyDetector';

export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  rawOCRText: string;
  records: Array<{
    date: string;
    description: string;
    rawAmount: number;
  }>;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'monthly_gpay',
    name: 'Google Pay — Comprehensive Monthly Ledger',
    description: '20 diverse transactions across Food, Shopping, Bills, Transport with 2 anomalies.',
    rawOCRText: `Google Pay
Transaction History - July/August 2024
Paid to SWIGGY BANGALORE 02 Jul ₹450.00 Debited from HDFC Bank
Paid to INDIAN OIL PETROL PUMP 04 Jul ₹1,800.00 Debited from SBI
Paid to AMAZON INDIA RETAIL 05 Jul ₹2,499.00 Debited from HDFC Bank
Paid to STARBUCKS COFFEE 08 Jul ₹380.00 Debited from HDFC Bank
Paid to AIRTEL BROADBAND BILL 10 Jul ₹1,179.00 Debited from ICICI
Paid to UBER RIDES TRIP 12 Jul ₹340.00 Debited from Paytm UPI
Paid to APOLLO PHARMACY 14 Jul ₹850.00 Debited from HDFC Bank
Paid to ZOMATO ONLINE MEAL 16 Jul ₹620.00 Debited from HDFC Bank
Paid to NETFLIX SUBSCRIPTION 18 Jul ₹649.00 Debited from SBI
Paid to DMART SUPERMARKET 20 Jul ₹3,450.00 Debited from HDFC Bank
Paid to BESCOM ELECTRICITY 22 Jul ₹1,420.00 Debited from SBI
Paid to BOOKMYSHOW PVR CINEMA 25 Jul ₹980.00 Debited from ICICI
Paid to APPLE STORE INDIA 28 Jul ₹18,900.00 Debited from HDFC Bank
Paid to BURGER KING DINING 30 Jul ₹320.00 Debited from HDFC Bank
Paid to SWIGGY INSTAMART 02 Aug ₹560.00 Debited from HDFC Bank
Paid to HPCL AUTO FUEL 05 Aug ₹2,100.00 Debited from SBI
Paid to MYNTRA FASHION 09 Aug ₹1,890.00 Debited from ICICI
Received from SALARY CREDIT TECH CORP 12 Aug ₹85,000.00 Credited to HDFC Bank
Paid to SPOTIFY PREMIUM 15 Aug ₹119.00 Debited from SBI
Paid to ZEPTO GROCERIES 18 Aug ₹410.00 Debited from HDFC Bank`,
    records: [
      { date: '2024-07-02', description: 'SWIGGY BANGALORE', rawAmount: -450.00 },
      { date: '2024-07-04', description: 'INDIAN OIL PETROL PUMP', rawAmount: -1800.00 },
      { date: '2024-07-05', description: 'AMAZON INDIA RETAIL', rawAmount: -2499.00 },
      { date: '2024-07-08', description: 'STARBUCKS COFFEE', rawAmount: -380.00 },
      { date: '2024-07-10', description: 'AIRTEL BROADBAND BILL', rawAmount: -1179.00 },
      { date: '2024-07-12', description: 'UBER RIDES TRIP', rawAmount: -340.00 },
      { date: '2024-07-14', description: 'APOLLO PHARMACY', rawAmount: -850.00 },
      { date: '2024-07-16', description: 'ZOMATO ONLINE MEAL', rawAmount: -620.00 },
      { date: '2024-07-18', description: 'NETFLIX SUBSCRIPTION', rawAmount: -649.00 },
      { date: '2024-07-20', description: 'DMART SUPERMARKET', rawAmount: -3450.00 },
      { date: '2024-07-22', description: 'BESCOM ELECTRICITY', rawAmount: -1420.00 },
      { date: '2024-07-25', description: 'BOOKMYSHOW PVR CINEMA', rawAmount: -980.00 },
      { date: '2024-07-28', description: 'APPLE STORE INDIA', rawAmount: -18900.00 },
      { date: '2024-07-30', description: 'BURGER KING DINING', rawAmount: -320.00 },
      { date: '2024-08-02', description: 'SWIGGY INSTAMART', rawAmount: -560.00 },
      { date: '2024-08-05', description: 'HPCL AUTO FUEL', rawAmount: -2100.00 },
      { date: '2024-08-09', description: 'MYNTRA FASHION', rawAmount: -1890.00 },
      { date: '2024-08-12', description: 'SALARY CREDIT TECH CORP', rawAmount: 85000.00 },
      { date: '2024-08-15', description: 'SPOTIFY PREMIUM', rawAmount: -119.00 },
      { date: '2024-08-18', description: 'ZEPTO GROCERIES', rawAmount: -410.00 }
    ]
  },
  {
    id: 'phonepe_dining_shopping',
    name: 'PhonePe — Food & Weekend Outing',
    description: 'High frequency Food & Dining weekend trail.',
    rawOCRText: `PhonePe History
Paid to PARADISE BIRYANI 10 Aug ₹1,450.00 Debited from SBI
Paid to CHAI POINT 10 Aug ₹180.00 Debited from SBI
Paid to ZARA SELECT CITYWALK 11 Aug ₹6,890.00 Debited from HDFC
Paid to PVR CINEMAS IMAX 11 Aug ₹1,240.00 Debited from HDFC
Paid to DOMINOS PIZZA 12 Aug ₹790.00 Debited from SBI
Paid to RAPIDO BIKE TAXI 12 Aug ₹65.00 Debited from Paytm
Paid to MEDPLUS PHARMACY 13 Aug ₹420.00 Debited from SBI
Paid to MCDONALD'S DRIVE THRU 14 Aug ₹540.00 Debited from HDFC
Paid to DECATHLON SPORTS 15 Aug ₹3,200.00 Debited from HDFC`,
    records: [
      { date: '2024-08-10', description: 'PARADISE BIRYANI', rawAmount: -1450.00 },
      { date: '2024-08-10', description: 'CHAI POINT', rawAmount: -180.00 },
      { date: '2024-08-11', description: 'ZARA SELECT CITYWALK', rawAmount: -6890.00 },
      { date: '2024-08-11', description: 'PVR CINEMAS IMAX', rawAmount: -1240.00 },
      { date: '2024-08-12', description: 'DOMINOS PIZZA', rawAmount: -790.00 },
      { date: '2024-08-12', description: 'RAPIDO BIKE TAXI', rawAmount: -65.00 },
      { date: '2024-08-13', description: 'MEDPLUS PHARMACY', rawAmount: -420.00 },
      { date: '2024-08-14', description: 'MCDONALDS DRIVE THRU', rawAmount: -540.00 },
      { date: '2024-08-15', description: 'DECATHLON SPORTS', rawAmount: -3200.00 }
    ]
  },
  {
    id: 'paytm_bills_transport',
    name: 'Paytm — Monthly Utilities & Commute',
    description: 'Utility bills, metro recharges, and fastag toll payments.',
    rawOCRText: `Paytm Payments
Paid to BESCOM ELECTRICITY BILL 01 Aug ₹2,350.00 Debited from ICICI
Paid to ACT FIBERNET BROADBAND 03 Aug ₹1,415.00 Debited from ICICI
Paid to BHARAT GAS LPG CYLINDER 05 Aug ₹920.00 Debited from SBI
Paid to METRO SMARTCARD RECHARGE 07 Aug ₹500.00 Debited from Paytm Wallet
Paid to FASTAG HIGHWAY TOLL 08 Aug ₹380.00 Debited from Paytm Wallet
Paid to SHELL PETROL STATION 09 Aug ₹2,500.00 Debited from ICICI
Paid to LIC INSURANCE PREMIUM 12 Aug ₹8,400.00 Debited from ICICI`,
    records: [
      { date: '2024-08-01', description: 'BESCOM ELECTRICITY BILL', rawAmount: -2350.00 },
      { date: '2024-08-03', description: 'ACT FIBERNET BROADBAND', rawAmount: -1415.00 },
      { date: '2024-08-05', description: 'BHARAT GAS LPG CYLINDER', rawAmount: -920.00 },
      { date: '2024-08-07', description: 'METRO SMARTCARD RECHARGE', rawAmount: -500.00 },
      { date: '2024-08-08', description: 'FASTAG HIGHWAY TOLL', rawAmount: -380.00 },
      { date: '2024-08-09', description: 'SHELL PETROL STATION', rawAmount: -2500.00 },
      { date: '2024-08-12', description: 'LIC INSURANCE PREMIUM', rawAmount: -8400.00 }
    ]
  }
];

export function buildTransactionsFromPreset(preset: SamplePreset): Transaction[] {
  const parsed = preset.records.map((r, index) => {
    const isCredit = r.rawAmount > 0;
    const { category, confidence } = categorizeDescription(r.description);
    return {
      id: `txn-${preset.id}-${index + 1}`,
      date: r.date,
      description: r.description,
      rawAmount: r.rawAmount,
      amount: Math.abs(r.rawAmount),
      type: isCredit ? ('credit' as const) : ('debit' as const),
      category: isCredit ? ('Personal Transfer' as const) : category,
      confidence: confidence,
      isAnomaly: false
    };
  });

  // Only run anomaly detection on expense transactions
  const expenses = parsed.filter(p => p.type === 'debit');
  const anomaliesComputed = computeAnomalies(expenses);

  return parsed.map(p => {
    if (p.type === 'credit') return p;
    const match = anomaliesComputed.find(a => a.id === p.id);
    return match || p;
  });
}
