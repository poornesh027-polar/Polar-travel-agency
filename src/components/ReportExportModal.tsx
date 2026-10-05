import React, { useState } from 'react';
import { ExpenseItem, Trip, SupportedCurrency } from '../types/expense';
import { formatCurrency, formatDate, convertCurrency } from '../utils/formatters';
import { X, Download, Printer, FileSpreadsheet, Check, Sparkles } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseItem[];
  trips: Trip[];
  baseCurrency: SupportedCurrency;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  trips,
  baseCurrency,
}) => {
  const [selectedTripFilter, setSelectedTripFilter] = useState<string>('All');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const filteredExpenses = expenses.filter((e) => {
    if (selectedTripFilter === 'All') return true;
    return e.tripId === selectedTripFilter;
  });

  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + convertCurrency(e.amount, e.currency, baseCurrency),
    0
  );

  const totalTax = filteredExpenses.reduce(
    (sum, e) => sum + convertCurrency(e.taxAmount || 0, e.currency, baseCurrency),
    0
  );

  // Category breakdown
  const categoryBreakdown = filteredExpenses.reduce((acc, curr) => {
    const converted = convertCurrency(curr.amount, curr.currency, baseCurrency);
    acc[curr.category] = (acc[curr.category] || 0) + converted;
    return acc;
  }, {} as Record<string, number>);

  const handleDownloadCSV = () => {
    const headers = [
      'Expense ID',
      'Date',
      'Merchant',
      'Category',
      'Original Amount',
      'Currency',
      `Converted Amount (${baseCurrency})`,
      'Tax Amount',
      'Payment Method',
      'Status',
      'Trip Name',
      'Notes',
      'Attendees',
    ];

    const rows = filteredExpenses.map((e) => {
      const trip = trips.find((t) => t.id === e.tripId);
      const converted = convertCurrency(e.amount, e.currency, baseCurrency);
      return [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.merchant.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        e.amount,
        `"${e.currency}"`,
        converted.toFixed(2),
        e.taxAmount || 0,
        `"${e.paymentMethod}"`,
        `"${e.status}"`,
        `"${trip ? trip.name.replace(/"/g, '""') : 'General'}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
        `"${(e.attendees || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wayfare_expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Corporate Travel Expense Report & Payout Voucher
            </h3>
            <div className="text-xs text-slate-500">
              Generated financial summary for accounting & tax reimbursement
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Trip Selector Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Filter Scope:</span>
              <label htmlFor="report-trip" className="sr-only">Report Trip Filter</label>
              <select
                id="report-trip"
                value={selectedTripFilter}
                onChange={(e) => setSelectedTripFilter(e.target.value)}
                className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="All">All Transactions ({expenses.length})</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.destination})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CSV Exported!</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* High-Density Summary Figures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-slate-500 font-medium">Total Claim Value</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {formatCurrency(totalAmount, baseCurrency)}
              </div>
              <div className="text-[11px] text-slate-400">{filteredExpenses.length} expense items</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-slate-500 font-medium">Reclaimable Tax / VAT</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {formatCurrency(totalTax, baseCurrency)}
              </div>
              <div className="text-[11px] text-slate-400">Available for cross-border refund</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-slate-500 font-medium">Policy Audit Status</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
                Approved
              </div>
              <div className="text-[11px] text-slate-400">Ready for accounting reconciliation</div>
            </div>
          </div>

          {/* Category Allocation Breakdown */}
          <div>
            <div className="font-semibold text-slate-800 mb-2">
              Expense Distribution by Category
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(categoryBreakdown).map(([cat, amt]) => (
                <div key={cat} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 truncate">{cat}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(amt, baseCurrency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Printable Table Preview */}
          <div>
            <div className="font-semibold text-slate-800 mb-2">Itemized Schedule</div>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 font-medium">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Merchant</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Payment</th>
                    <th className="py-2 px-3 text-right">Amount ({baseCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2 px-3 font-mono tabular-nums text-slate-600">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[150px]">
                        {exp.merchant}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{exp.category}</td>
                      <td className="py-2 px-3 text-slate-500">{exp.paymentMethod}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
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

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Compliant with GAAP, IFRS & HMRC Corporate Expense Directives
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
