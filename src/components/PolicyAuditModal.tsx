import React, { useState } from 'react';
import { ExpenseItem, PolicyRule, SupportedCurrency } from '../types/expense';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Check,
  FileCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface PolicyAuditModalProps {
  expenses: ExpenseItem[];
  policy: PolicyRule;
  onUpdatePolicy: (policy: PolicyRule) => void;
  onResolveFlag: (expenseId: string, resolutionNote: string) => void;
  baseCurrency: SupportedCurrency;
}

export const PolicyAuditModal: React.FC<PolicyAuditModalProps> = ({
  expenses,
  policy,
  onUpdatePolicy,
  onResolveFlag,
  baseCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<'violations' | 'rules'>('violations');
  const [mealCap, setMealCap] = useState(policy.maxMealPerPerson);
  const [receiptThreshold, setReceiptThreshold] = useState(policy.requireReceiptThreshold);
  const [flightClass, setFlightClass] = useState(policy.flightMaxClass);
  const [alcoholRequired, setAlcoholRequired] = useState(policy.alcoholItemizationRequired);
  const [flagWeekend, setFlagWeekend] = useState(policy.flagWeekendTransactions);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const flaggedExpenses = expenses.filter(
    (e) => (e.policyFlags && e.policyFlags.length > 0) || e.status === 'Flagged'
  );

  const complianceRate =
    expenses.length > 0
      ? Math.round(((expenses.length - flaggedExpenses.length) / expenses.length) * 1000) / 10
      : 100;

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePolicy({
      maxMealPerPerson: mealCap,
      requireReceiptThreshold: receiptThreshold,
      flightAdvanceBookingDays: policy.flightAdvanceBookingDays,
      flightMaxClass: flightClass,
      alcoholItemizationRequired: alcoholRequired,
      flagWeekendTransactions: flagWeekend,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-900" />
            <span>Corporate Travel Policy & Audit Engine</span>
          </h2>
          <div className="text-xs text-slate-500">
            Automated compliance rules, spending threshold limits, and flagged item resolution
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'violations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Audit Flags ({flaggedExpenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Policy Rules</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Compliance Rate</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {complianceRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {expenses.length - flaggedExpenses.length} of {expenses.length} claims fully compliant
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Items Requiring Review</div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {flaggedExpenses.length} Claims
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Single meal overages & non-itemized receipts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Meal Allowance Cap</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            ${policy.maxMealPerPerson} / Person
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Receipt required above ${policy.requireReceiptThreshold}
          </div>
        </div>
      </div>

      {/* Tab: Flagged Items */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Flagged Items Pending Auditor Review
            </h3>
            <span className="text-xs text-slate-400 tabular-nums">
              {flaggedExpenses.length} transactions
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {flaggedExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-800">
                  Zero Policy Infractions Detected
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  All logged receipts and expense vouchers adhere to established corporate travel guidelines.
                </div>
              </div>
            ) : (
              flaggedExpenses.map((expense) => (
                <div key={expense.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {expense.merchant}
                      </span>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        · {formatDate(expense.date)}
                      </span>
                      <span className="text-xs text-slate-500">
                        · {expense.category}
                      </span>
                    </div>

                    <div className="text-xs text-amber-700 font-medium flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        {expense.policyFlags && expense.policyFlags.length > 0
                          ? expense.policyFlags.join('; ')
                          : 'Flagged for auditor review'}
                      </div>
                    </div>

                    {expense.attendees && (
                      <div className="text-[11px] text-slate-500">
                        Attendees: {expense.attendees}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="font-bold text-sm font-mono tabular-nums text-slate-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {expense.paymentMethod}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onResolveFlag(expense.id, 'Approved with manager business justification override')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Exception</span>
                      </button>

                      <button
                        onClick={() => onResolveFlag(expense.id, 'Audited: within standard allowance')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Clear Flag
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Policy Rules Configuration */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSaveRules} className="space-y-6 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">
                Company Travel & Expense Guidelines Configuration
              </h3>
              <p className="text-slate-500">
                These thresholds are checked automatically during Smart Receipt OCR and ledger reconciliation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maximum Meal Allowance (Per Person / Meal)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={mealCap}
                    onChange={(e) => setMealCap(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Receipts exceeding this amount per attendee trigger manager justification.
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Receipt Upload Threshold
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={receiptThreshold}
                    onChange={(e) => setReceiptThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  IRS standard: expenses above $25 require itemized proof.
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Airfare Class Policy
                </label>
                <select
                  value={flightClass}
                  onChange={(e) => setFlightClass(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Economy">Economy (All Flights)</option>
                  <option value="Premium Economy">Premium Economy (Flights &gt; 6 hrs)</option>
                  <option value="Business">Business (Executive Travel Only)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={alcoholRequired}
                    onChange={(e) => setAlcoholRequired(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">
                      Require Alcohol Itemization
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Flag any unitemized restaurant receipts containing beverages
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={flagWeekend}
                    onChange={(e) => setFlagWeekend(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">
                      Flag Weekend Transactions
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Audit Saturday/Sunday expenses without approved travel itinerary
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {isSavedNotice ? (
                <div className="text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Company policy guidelines updated!</span>
                </div>
              ) : (
                <div className="text-slate-400 text-[11px]">
                  Changes apply immediately across all future OCR audits
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2 font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                Save Policy Rules
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
