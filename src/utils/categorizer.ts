import { Category } from '../types';

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',        // Orange
  Shopping: '#ec4899',    // Pink
  Fuel: '#eab308',        // Amber / Yellow
  Transport: '#06b6d4',   // Cyan
  Bills: '#3b82f6',       // Blue
  Entertainment: '#a855f7', // Purple
  Healthcare: '#10b981',  // Emerald
  'Personal Transfer': '#64748b', // Slate
  Other: '#94a3b8'        // Cool Gray
};

export const KEYWORD_RULES: Record<string, Category> = {
  // Explicit User Rules (High Priority)
  'GENERAL STORE': 'Shopping',
  'GENERAL STORES': 'Shopping',
  'PROVISION STORE': 'Shopping',
  FILLING: 'Fuel',
  'FILLING STATION': 'Fuel',
  STATION: 'Fuel',
  'SERVICE STATION': 'Fuel',
  'PETROL STATION': 'Fuel',
  'GAS STATION': 'Fuel',
  'FUEL STATION': 'Fuel',
  FARM: 'Food',
  FARMS: 'Food',
  'FARM FRESH': 'Food',

  // Fuel
  PETROL: 'Fuel',
  DIESEL: 'Fuel',
  FUEL: 'Fuel',
  'INDIAN OIL': 'Fuel',
  HPCL: 'Fuel',
  BPCL: 'Fuel',
  SHELL: 'Fuel',
  CNG: 'Fuel',
  'AUTO FUEL': 'Fuel',

  // Food & Dining
  FOOD: 'Food',
  RESTAURANT: 'Food',
  CAFE: 'Food',
  COFFEE: 'Food',
  ZOMATO: 'Food',
  SWIGGY: 'Food',
  DOMINOS: 'Food',
  PIZZA: 'Food',
  MCDONALD: 'Food',
  BURGER: 'Food',
  STARBUCKS: 'Food',
  BAKERY: 'Food',
  SWEETS: 'Food',
  DHABA: 'Food',
  KITCHEN: 'Food',
  BIRYANI: 'Food',
  TEA: 'Food',
  CHAI: 'Food',
  JUICE: 'Food',
  EATCLUB: 'Food',
  'FOOD COURT': 'Food',

  // Shopping & Groceries
  STORES: 'Shopping',
  MART: 'Shopping',
  SUPERMARKET: 'Shopping',
  AMAZON: 'Shopping',
  FLIPKART: 'Shopping',
  MYNTRA: 'Shopping',
  AJIO: 'Shopping',
  BLINKIT: 'Shopping',
  ZEPTO: 'Shopping',
  INSTAMART: 'Shopping',
  BIGBASKET: 'Shopping',
  DMART: 'Shopping',
  RELIANCE: 'Shopping',
  DECATHLON: 'Shopping',
  ZARA: 'Shopping',
  'H&M': 'Shopping',
  CROMA: 'Shopping',
  SHOP: 'Shopping',
  MALL: 'Shopping',
  CLOTHING: 'Shopping',
  FOOTWEAR: 'Shopping',
  APPLE: 'Shopping',
  KIRANA: 'Shopping',

  // Transport & Commute
  UBER: 'Transport',
  OLA: 'Transport',
  RAPIDO: 'Transport',
  METRO: 'Transport',
  RAILWAY: 'Transport',
  IRCTC: 'Transport',
  PARKING: 'Transport',
  FASTAG: 'Transport',
  TOLL: 'Transport',
  AUTO: 'Transport',
  CAB: 'Transport',
  AIRLINES: 'Transport',
  INDIGO: 'Transport',

  // Bills & Utilities
  ELECTRICITY: 'Bills',
  BESCOM: 'Bills',
  TSSPDCL: 'Bills',
  MSEDCL: 'Bills',
  AIRTEL: 'Bills',
  JIO: 'Bills',
  VI: 'Bills',
  VODAFONE: 'Bills',
  BROADBAND: 'Bills',
  WIFI: 'Bills',
  'ACT FIBERNET': 'Bills',
  GAS: 'Bills',
  INDANE: 'Bills',
  WATER: 'Bills',
  RECHARGE: 'Bills',
  CRED: 'Bills',
  INSURANCE: 'Bills',
  LIC: 'Bills',
  RENT: 'Bills',
  MAINTENANCE: 'Bills',

  // Entertainment
  NETFLIX: 'Entertainment',
  SPOTIFY: 'Entertainment',
  'PRIME VIDEO': 'Entertainment',
  HOTSTAR: 'Entertainment',
  BOOKMYSHOW: 'Entertainment',
  PVR: 'Entertainment',
  INOX: 'Entertainment',
  CINEMA: 'Entertainment',
  MOVIE: 'Entertainment',
  GAMING: 'Entertainment',
  STEAM: 'Entertainment',
  PLAYSTATION: 'Entertainment',
  YOUTUBE: 'Entertainment',

  // Healthcare
  PHARMACY: 'Healthcare',
  APOLLO: 'Healthcare',
  MEDPLUS: 'Healthcare',
  NETMEDS: 'Healthcare',
  PHARMEASY: 'Healthcare',
  '1MG': 'Healthcare',
  HOSPITAL: 'Healthcare',
  CLINIC: 'Healthcare',
  DOCTOR: 'Healthcare',
  LAB: 'Healthcare',
  DIAGNOSTICS: 'Healthcare',
  DENTAL: 'Healthcare',
  GYM: 'Healthcare',
  'CULT FIT': 'Healthcare',

  // Personal Transfers
  UPI: 'Personal Transfer',
  TRANSFER: 'Personal Transfer',
  'SENT TO': 'Personal Transfer',
  FRIEND: 'Personal Transfer'
};

const SEED_CORPUS: [string, Category][] = [
  ['SWIGGY BANGALORE ORDER FOOD', 'Food'],
  ['ZOMATO ONLINE ORDER MEAL', 'Food'],
  ['COUNTRY FARM ORGANIC VEGETABLES', 'Food'],
  ['DOMINOS PIZZA DINING', 'Food'],
  ['MCDONALDS BURGER COMBO', 'Food'],
  ['STARBUCKS COFFEE CAFE', 'Food'],
  ['CHAI POINT TEA SNACKS', 'Food'],
  ['UDUPI VEG RESTAURANT MEALS', 'Food'],
  ['PARADISE BIRYANI DINNER', 'Food'],
  ['SRI LAKSHMI GENERAL STORE PROVISIONS', 'Shopping'],
  ['AMAZON INDIA SHOPPING RETAIL', 'Shopping'],
  ['FLIPKART INTERNET PVT LTD', 'Shopping'],
  ['MYNTRA FASHION APPAREL', 'Shopping'],
  ['BLINKIT GROCERY DELIVERY', 'Shopping'],
  ['ZEPTO QUICK COMMERCE', 'Shopping'],
  ['INSTAMART SWIGGY GROCERY', 'Shopping'],
  ['DMART AVENUE SUPERMARTS', 'Shopping'],
  ['INDIAN OIL PETROL PUMP FUEL STATION', 'Fuel'],
  ['HPCL AUTO FUEL FILLING STATION', 'Fuel'],
  ['SHELL PETROL FILLING STATION', 'Fuel'],
  ['UBER INDIA RIDES TRIP', 'Transport'],
  ['OLA CABS PRIVATE LIMITED', 'Transport'],
  ['RAPIDO BIKE TAXI COMMUTE', 'Transport'],
  ['FASTAG TOLL PLAZA HIGHWAY', 'Transport'],
  ['AIRTEL POSTPAID MOBILE BILL', 'Bills'],
  ['JIO TELECOM RECHARGE PREPAID', 'Bills'],
  ['BESCOM ELECTRICITY BILL', 'Bills'],
  ['ACT FIBERNET BROADBAND INTERNET', 'Bills'],
  ['NETFLIX SUBSCRIPTION STREAMING', 'Entertainment'],
  ['SPOTIFY MUSIC PREMIUM', 'Entertainment'],
  ['BOOKMYSHOW MOVIE TICKETS', 'Entertainment'],
  ['PVR CINEMAS MULTIPLEX', 'Entertainment'],
  ['APOLLO PHARMACY MEDICINES', 'Healthcare'],
  ['MEDPLUS CHEMIST DRUGS', 'Healthcare'],
  ['PHARMEASY ONLINE MEDICINE', 'Healthcare'],
  ['MAX HEALTHCARE CLINIC DOCTOR', 'Healthcare'],
  ['CULT FIT GYM SUBSCRIPTION', 'Healthcare']
];

export function categorizeDescription(description: string): { category: Category; confidence: number } {
  const upper = description.toUpperCase().trim();

  // 1. Direct explicit user rules
  // Rule: If "farm" is present -> Food
  if (/\bFARM\b|\bFARMS\b|FARM/i.test(upper)) {
    return { category: 'Food', confidence: 0.98 };
  }

  // Rule: If "general store" -> Shopping
  if (/GENERAL\s*STORE|GENERAL\s*STORES/i.test(upper)) {
    return { category: 'Shopping', confidence: 0.98 };
  }

  // Rule: If "filling" or "station" -> Fuel
  if (/FILLING|STATION|PETROL|DIESEL|FUEL/i.test(upper)) {
    return { category: 'Fuel', confidence: 0.98 };
  }

  // 2. Keyword rules mapping
  for (const [kw, cat] of Object.entries(KEYWORD_RULES)) {
    if (upper.includes(kw)) {
      return { category: cat, confidence: 0.96 };
    }
  }

  // 3. TF-IDF Token Similarity fallback
  const tokens = upper.split(/\s+/).filter(t => t.length > 2);
  let bestScore = 0;
  let bestCat: Category = 'Other';

  for (const [corpusText, cat] of SEED_CORPUS) {
    const corpusTokens = corpusText.split(/\s+/);
    let matchCount = 0;
    for (const t of tokens) {
      if (corpusTokens.some(ct => ct.includes(t) || t.includes(ct))) {
        matchCount++;
      }
    }
    const score = matchCount / Math.max(tokens.length, 1);
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  if (bestScore > 0.3) {
    return { category: bestCat, confidence: Math.min(0.92, 0.70 + bestScore * 0.25) };
  }

  return { category: 'Other', confidence: 0.65 };
}
