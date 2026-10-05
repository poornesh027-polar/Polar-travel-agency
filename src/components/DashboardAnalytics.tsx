import React from 'react';
import { ExpenseItem, Trip, SupportedCurrency, ExpenseCategory } from '../types/expense';
import { formatCurrency, formatDate, convertCurrency } from '../utils/formatters';
import {
  TrendingUp,
  CreditCard,
  PieChart,
  Globe,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plane,
  Building2,
  Utensils,
  Car,
} from 'lucide-react';

interface DashboardAnalyticsProps {
  expenses: ExpenseItem[];
  trips: Trip[];
  baseCurrency: SupportedCurrency;
  onNavigateToTab: (tab: string) => void;
  onOpenScanner: () => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  expenses,
  trips,
  baseCurrency,
  onNavigateToTab,
  onOpenScanner,
}) => {
  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  let totalConverted = 0;

  expenses.forEach((e) => {
    const val = convertCurrency(e.amount, e.currency, baseCurrency);
    totalConverted += val;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + val;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Currency Exposure
  const currencyTotals: Record<string, { original: number; converted: number }> = {};
  expenses.forEach((e) => {
    const curr = e.currency.toUpperCase();
    if (!currencyTotals[curr]) currencyTotals[curr] = { original: 0, converted: 0 };
    currencyTotals[curr].original += e.amount;
    currencyTotals[curr].converted += convertCurrency(e.amount, e.currency, baseCurrency);
  });

  // Recent 5 expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Flights':
        return <Plane className="w-3.5 h-3.5 text-blue-600" />;
      case 'Lodging':
        return <Building2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Meals & Entertainment':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'Ground Transport':
      case 'Mileage':
        return <Car className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Category Spending Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-slate-700" />
                <span>Spend Distribution by Category</span>
              </h3>
              <div className="text-xs text-slate-500">
                Normalized to {baseCurrency} base currency
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('ledger')}
              className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Bar Segment Visualization */}
          <div className="space-y-3 pt-1">
            {sortedCategories.map(([category, amt]) => {
              const percent = totalConverted > 0 ? (amt / totalConverted) * 100 : 0;

              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="font-semibold text-slate-800">{category}</span>
                    </div>
                    <div className="font-mono tabular-nums text-slate-700">
                      <strong>{formatCurrency(amt, baseCurrency)}</strong>
                      <span className="text-slate-400 text-[11px] ml-1.5">
                        ({percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all duration-500"
                      style={{ width: `${Math.max(2, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Currency Exposure Footnote Strip */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Multi-Currency Transaction Exposure</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(currencyTotals).map(([curr, data]) => (
                <div
                  key={curr}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="text-slate-500 font-medium">{curr}</div>
                  <div className="font-bold font-mono tabular-nums text-slate-800 text-xs mt-0.5">
                    {formatCurrency(data.original, curr)}
                  </div>
                  {curr !== baseCurrency && (
                    <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                      ≈ {formatCurrency(data.converted, baseCurrency)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Active Trips Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Itineraries & Trips
              </h3>
              <button
                onClick={() => onNavigateToTab('trips')}
                className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {trips.slice(0, 3).map((trip) => {
                const tripExpenses = expenses.filter((e) => e.tripId === trip.id);
                const spent = tripExpenses.reduce(
                  (sum, e) => sum + convertCurrency(e.amount, e.currency, baseCurrency),
                  0
                );
                const percent = Math.min(100, Math.round((spent / trip.budget) * 100));

                return (
                  <div
                    key={trip.id}
                    onClick={() => onNavigateToTab('trips')}
                    className="py-3 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {trip.name}
                      </span>
                      <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                        {trip.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {trip.destination} · {formatDate(trip.startDate)}
                    </div>

                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          spent > trip.budget
                            ? 'bg-rose-500'
                            : percent > 80
                            ? 'bg-amber-500'
                            : 'bg-slate-900'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
                      <span>{formatCurrency(spent, baseCurrency, true)} used</span>
                      <span>{formatCurrency(trip.budget, baseCurrency, true)} budget</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('trips')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs text-center border border-slate-200 transition-colors"
            >
              Manage Trips & Itineraries
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Recent Expense Vouchers & Receipts</span>
            </h3>
            <div className="text-xs text-slate-500">
              Latest items audited by smart OCR engine
            </div>
          </div>

          <button
            onClick={onOpenScanner}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            + Scan Receipt
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Merchant</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Amount ({baseCurrency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentExpenses.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => onNavigateToTab('ledger')}
                  className="hover:bg-slate-50/60 cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-[200px]">
                    {exp.merchant}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{exp.category}</td>
                  <td className="py-2.5 px-3 text-slate-500">{exp.paymentMethod}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs font-medium text-slate-700">
                      {exp.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(
                      convertCurrency(exp.amount, exp.currency, baseCurrency),
                      baseCurrency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
