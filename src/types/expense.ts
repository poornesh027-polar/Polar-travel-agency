export type ExpenseCategory = 
  | 'Flights'
  | 'Lodging'
  | 'Meals & Entertainment'
  | 'Ground Transport'
  | 'Mileage'
  | 'Per Diem'
  | 'Supplies & Equip'
  | 'Conferences & Fees'
  | 'Other';

export type ExpenseStatus = 'Draft' | 'Submitted' | 'Approved' | 'Reimbursed' | 'Flagged';

export type PaymentMethod = 'Corporate Card' | 'Personal Card' | 'Cash' | 'Virtual Card';

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface MileageDetails {
  origin: string;
  destination: string;
  distanceMiles: number;
  ratePerMile: number;
  isRoundTrip: boolean;
  vehicleType: 'Personal Vehicle' | 'Company Fleet' | 'Electric EV';
  purpose: string;
}

export interface ExpenseItem {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  currency: string;
  convertedAmount: number; // in base currency (e.g. USD)
  taxAmount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  tripId?: string;
  notes?: string;
  lineItems: LineItem[];
  receiptImage?: string;
  receiptName?: string;
  policyFlags: string[];
  attendees?: string;
  mileage?: MileageDetails;
  createdAt: string;
  verifiedByAI?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  purpose: string;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Archived';
  perDiemDailyRate: number;
}

export interface PolicyRule {
  maxMealPerPerson: number;
  requireReceiptThreshold: number;
  flightAdvanceBookingDays: number;
  flightMaxClass: 'Economy' | 'Premium Economy' | 'Business';
  alcoholItemizationRequired: boolean;
  flagWeekendTransactions: boolean;
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'CAD';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  SGD: 'S$',
  CAD: 'C$',
};

export const EXCHANGE_RATES_TO_USD: Record<SupportedCurrency, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  JPY: 0.0066,
  SGD: 0.75,
  CAD: 0.73,
};
