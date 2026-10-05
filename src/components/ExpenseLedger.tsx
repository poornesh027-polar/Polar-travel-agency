import React, { useState } from 'react';
import { ExpenseItem, ExpenseCategory, ExpenseStatus, SupportedCurrency, Trip } from '../types/expense';
import { formatCurrency, formatDate, convertCurrency } from '../utils/formatters';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Check,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  X,
  Paperclip,
  Sparkles,
} from 'lucide-react';

interface ExpenseLedgerProps {
  expenses: ExpenseItem[];
  trips: Trip[];
  baseCurrency: SupportedCurrency;
  onUpdateStatus: (id: string, status: ExpenseStatus) => void;
  onDeleteExpense: (id: string) => void;
  onOpenScanner: () => void;
}

export const ExpenseLedger: React.FC<ExpenseLedgerProps> = ({
  expenses,
  trips,
  baseCurrency,
  onUpdateStatus,
  onDeleteExpense,
  onOpenScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTripFilter, setSelectedTripFilter] = useState<string>('All');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [inspectingExpense, setInspectingExpense] = useState<ExpenseItem | null>(null);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const categories = [
    'All',
    'Flights',
    'Lodging',
    'Meals & Entertainment',
    'Ground Transport',
    'Mileage',
    'Per Diem',
    'Supplies & Equip',
    'Conferences & Fees',
  ];

  const statuses = ['All', 'Submitted', 'Approved', 'Reimbursed', 'Flagged', 'Draft'];

  // Filtering
  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      item.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.attendees && item.attendees.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesTrip = selectedTripFilter === 'All' || item.tripId === selectedTripFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesTrip;
  });

  // Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortField === 'date') {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortAsc ? -diff : diff;
    } else {
      const aVal = convertCurrency(a.amount, a.currency, baseCurrency);
      const bVal = convertCurrency(b.amount, b.currency, baseCurrency);
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
  });

  const toggleSelectAll = () => {
    if (selectedExpenseIds.size === sortedExpenses.length) {
      setSelectedExpenseIds(new Set());
    } else {
      setSelectedExpenseIds(new Set(sortedExpenses.map((e) => e.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedExpenseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedExpenseIds(next);
  };

  const handleBulkStatus = (status: ExpenseStatus) => {
    selectedExpenseIds.forEach((id) => onUpdateStatus(id, status));
    setSelectedExpenseIds(new Set());
  };

  const handleBulkDelete = () => {
    selectedExpenseIds.forEach((id) => onDeleteExpense(id));
    setSelectedExpenseIds(new Set());
  };

  const getTripName = (tripId?: string) => {
    if (!tripId) return 'General Corporate';
    const found = trips.find((t) => t.id === tripId);
    return found ? found.name : 'General Corporate';
  };

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, attendees, or description..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          {/* Trip & Category Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <label htmlFor="filter-trip" className="sr-only">Trip Filter</label>
              <select
                id="filter-trip"
                value={selectedTripFilter}
                onChange={(e) => setSelectedTripFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="All">All Business Trips</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <label htmlFor="filter-category" className="sr-only">Category Filter</label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Segmented Filter Tabs (Adheres to Section 1A) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStatus === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 tabular-nums">
            Showing <strong className="text-slate-800">{sortedExpenses.length}</strong> of {expenses.length} records
          </div>
        </div>
      </div>

      {/* Bulk Action Strip */}
      {selectedExpenseIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl shadow-md text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-semibold tabular-nums">{selectedExpenseIds.size}</span>
            <span>expenses selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus('Approved')}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded font-medium transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleBulkStatus('Reimbursed')}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded font-medium transition-colors"
            >
              Mark Reimbursed
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-rose-700 hover:bg-rose-600 rounded font-medium transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedExpenseIds(new Set())}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* High Density Ledger Grid (Section 2A: Row Height 36-44px) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium select-none">
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={sortedExpenses.length > 0 && selectedExpenseIds.size === sortedExpenses.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else {
                      setSortField('date');
                      setSortAsc(false);
                    }
                  }}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 w-28 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[200px]">Merchant & Description</th>
                <th className="py-2.5 px-3 w-36 whitespace-nowrap">Category</th>
                <th className="py-2.5 px-3 min-w-[150px]">Trip Association</th>
                <th className="py-2.5 px-3 w-28 whitespace-nowrap">Status</th>
                <th
                  onClick={() => {
                    if (sortField === 'amount') setSortAsc(!sortAsc);
                    else {
                      setSortField('amount');
                      setSortAsc(false);
                    }
                  }}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 w-36 whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount ({baseCurrency})</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 w-20 text-center">Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-slate-700">No expense records match criteria</div>
                    <div className="text-xs text-slate-400 mt-1">Try clearing filters or scan a new receipt</div>
                    <button
                      onClick={onOpenScanner}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Scan New Receipt</span>
                    </button>
                  </td>
                </tr>
              ) : (
                sortedExpenses.map((expense) => {
                  const isSelected = selectedExpenseIds.has(expense.id);
                  const converted = convertCurrency(expense.amount, expense.currency, baseCurrency);

                  return (
                    <tr
                      key={expense.id}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-50/90' : ''
                      }`}
                      onClick={() => setInspectingExpense(expense)}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(expense.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-mono tabular-nums">
                        {formatDate(expense.date)}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{expense.merchant}</span>
                          {expense.verifiedByAI && (
                            <span title="Verified by AI OCR" className="text-slate-400">
                              <Sparkles className="w-3 h-3 text-amber-500 inline" />
                            </span>
                          )}
                        </div>
                        {expense.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-sm">
                            {expense.notes}
                          </div>
                        )}
                        {expense.policyFlags && expense.policyFlags.length > 0 && (
                          <div className="text-[11px] text-amber-600 font-medium truncate flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{expense.policyFlags[0]}</span>
                          </div>
                        )}
                      </td>

                      {/* Zero-Pill category format */}
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        <span>{expense.category}</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[160px]">
                        {getTripName(expense.tripId)}
                      </td>

                      {/* Zero-Pill status display: clean unboxed text paired with explicit icon */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {expense.status === 'Approved' && (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {expense.status === 'Reimbursed' && (
                          <span className="text-blue-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reimbursed</span>
                          </span>
                        )}
                        {expense.status === 'Submitted' && (
                          <span className="text-slate-600 font-medium inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Submitted</span>
                          </span>
                        )}
                        {expense.status === 'Flagged' && (
                          <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Flagged</span>
                          </span>
                        )}
                        {expense.status === 'Draft' && (
                          <span className="text-slate-400 font-medium">Draft</span>
                        )}
                      </td>

                      {/* Right-aligned Tabular Numerals */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(converted, baseCurrency)}
                        </div>
                        {expense.currency !== baseCurrency && (
                          <div className="text-[10px] text-slate-400">
                            {formatCurrency(expense.amount, expense.currency)}
                          </div>
                        )}
                      </td>

                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingExpense(expense);
                        }}
                      >
                        <button
                          title="View receipt & details"
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Receipt Inspector Drawer */}
      {inspectingExpense && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Expense Details
                </div>
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {inspectingExpense.merchant}
                </h3>
              </div>
              <button
                onClick={() => setInspectingExpense(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
              {/* Amount Display */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Total Billed</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {formatCurrency(inspectingExpense.amount, inspectingExpense.currency)}
                </div>
                {inspectingExpense.currency !== baseCurrency && (
                  <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                    ≈ {formatCurrency(convertCurrency(inspectingExpense.amount, inspectingExpense.currency, baseCurrency), baseCurrency)} ({baseCurrency} Base)
                  </div>
                )}
                {inspectingExpense.taxAmount > 0 && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Tax / VAT included: {formatCurrency(inspectingExpense.taxAmount, inspectingExpense.currency)}
                  </div>
                )}
              </div>

              {/* Status and Actions */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">Workflow Status</div>
                <div className="flex items-center gap-2">
                  {(['Submitted', 'Approved', 'Reimbursed', 'Flagged'] as ExpenseStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(inspectingExpense.id, st);
                        setInspectingExpense({ ...inspectingExpense, status: st });
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        inspectingExpense.status === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100 text-slate-700">
                <div>
                  <div className="text-slate-400">Date</div>
                  <div className="font-semibold font-mono tabular-nums">{formatDate(inspectingExpense.date)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Category</div>
                  <div className="font-semibold">{inspectingExpense.category}</div>
                </div>
                <div>
                  <div className="text-slate-400">Payment Instrument</div>
                  <div className="font-semibold">{inspectingExpense.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-slate-400">Associated Trip</div>
                  <div className="font-semibold truncate">{getTripName(inspectingExpense.tripId)}</div>
                </div>
                {inspectingExpense.attendees && (
                  <div className="col-span-2">
                    <div className="text-slate-400">Attendees</div>
                    <div className="font-medium text-slate-800">{inspectingExpense.attendees}</div>
                  </div>
                )}
              </div>

              {/* Policy Flags */}
              {inspectingExpense.policyFlags && inspectingExpense.policyFlags.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-800">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Audit Flag</span>
                  </div>
                  {inspectingExpense.policyFlags.map((flag, idx) => (
                    <div key={idx} className="text-xs text-amber-700">· {flag}</div>
                  ))}
                </div>
              )}

              {/* Line Items */}
              {inspectingExpense.lineItems && inspectingExpense.lineItems.length > 0 && (
                <div>
                  <div className="font-semibold text-slate-800 mb-2">Itemized Receipt Items</div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2 text-center w-12">Qty</th>
                          <th className="px-3 py-2 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {inspectingExpense.lineItems.map((li, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-slate-800">{li.description}</td>
                            <td className="px-3 py-2 text-center font-mono tabular-nums text-slate-600">{li.quantity}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-900 font-medium">
                              {formatCurrency(li.price, inspectingExpense.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Mileage Specific Details */}
              {inspectingExpense.mileage && (
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-blue-900">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <span>Business Mileage Route</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div><strong>Route:</strong> {inspectingExpense.mileage.origin} ➔ {inspectingExpense.mileage.destination}</div>
                    <div><strong>Distance:</strong> {inspectingExpense.mileage.distanceMiles} miles ({inspectingExpense.mileage.isRoundTrip ? 'Round Trip' : 'One Way'})</div>
                    <div><strong>Reimbursement Rate:</strong> ${inspectingExpense.mileage.ratePerMile}/mile</div>
                    <div><strong>Vehicle:</strong> {inspectingExpense.mileage.vehicleType}</div>
                    <div><strong>Purpose:</strong> {inspectingExpense.mileage.purpose}</div>
                  </div>
                </div>
              )}

              {/* Receipt File Preview or Simulated Receipt Card */}
              <div>
                <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Receipt Artifact</span>
                  {inspectingExpense.receiptName && (
                    <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                      {inspectingExpense.receiptName}
                    </span>
                  )}
                </div>

                {inspectingExpense.receiptImage ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <img
                      src={inspectingExpense.receiptImage}
                      alt="Scanned receipt visual"
                      className="w-full max-h-64 object-contain bg-slate-50"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-slate-600 font-mono text-[11px]">
                    <div className="text-center font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                      {inspectingExpense.merchant}
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{inspectingExpense.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{inspectingExpense.category}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(inspectingExpense.amount, inspectingExpense.currency)}</span>
                    </div>
                    <div className="text-center text-[10px] text-slate-400 pt-2">
                      Verified AI Digital Receipt Archive
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <button
                onClick={() => {
                  onDeleteExpense(inspectingExpense.id);
                  setInspectingExpense(null);
                }}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setInspectingExpense(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
