import React, { useState } from 'react';
import { Trip, ExpenseItem, SupportedCurrency } from '../types/expense';
import { formatCurrency, formatDate, convertCurrency } from '../utils/formatters';
import {
  Compass,
  Calendar,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

interface TripManagerProps {
  trips: Trip[];
  expenses: ExpenseItem[];
  baseCurrency: SupportedCurrency;
  onAddTrip: (trip: Trip) => void;
  onOpenScannerForTrip: (tripId: string) => void;
}

export const TripManager: React.FC<TripManagerProps> = ({
  trips,
  expenses,
  baseCurrency,
  onAddTrip,
  onOpenScannerForTrip,
}) => {
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(trips[0] || null);

  // New Trip Form State
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<number>(3000);
  const [purpose, setPurpose] = useState('');
  const [perDiemRate, setPerDiemRate] = useState<number>(85);

  const calculateTripSpent = (tripId: string) => {
    return expenses
      .filter((e) => e.tripId === tripId)
      .reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, baseCurrency), 0);
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination) return;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name,
      destination,
      country: country || 'International',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      budget: Number(budget) || 3000,
      currency: baseCurrency,
      purpose: purpose || 'Corporate business travel',
      status: 'Active',
      perDiemDailyRate: Number(perDiemRate) || 85,
    };

    onAddTrip(newTrip);
    setSelectedTrip(newTrip);
    setIsAddTripModalOpen(false);

    // Reset
    setName('');
    setDestination('');
    setCountry('');
    setPurpose('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Business Travel Itineraries & Budget Control
          </h2>
          <div className="text-xs text-slate-500">
            Reconcile multi-city corporate trips, flight segments, and per-diem caps
          </div>
        </div>

        <button
          onClick={() => setIsAddTripModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Business Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => {
          const spent = calculateTripSpent(trip.id);
          const percentUsed = Math.min(100, Math.round((spent / trip.budget) * 100));
          const isSelected = selectedTrip?.id === trip.id;
          const isOverBudget = spent > trip.budget;

          return (
            <div
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className={`rounded-2xl border p-5 transition-all cursor-pointer bg-white relative ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Trip Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {trip.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{trip.destination}</span>
                  </div>
                </div>

                {/* Zero-Pill status indicator */}
                <span className="text-xs font-medium text-slate-500 shrink-0">
                  {trip.status === 'Active' && <span className="text-emerald-700 font-semibold">Active</span>}
                  {trip.status === 'Completed' && <span className="text-slate-500">Completed</span>}
                  {trip.status === 'Upcoming' && <span className="text-blue-700 font-semibold">Upcoming</span>}
                </span>
              </div>

              {/* Dates */}
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="tabular-nums">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>

              {/* Purpose snippet */}
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {trip.purpose}
              </p>

              {/* Budget Progress Bar */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Spent vs Budget</span>
                  <span className={`font-mono tabular-nums font-semibold ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatCurrency(spent, baseCurrency, true)} / {formatCurrency(trip.budget, baseCurrency, true)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-rose-600'
                        : percentUsed > 80
                        ? 'bg-amber-500'
                        : 'bg-slate-900'
                    }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                  <span>{percentUsed}% consumed</span>
                  <span>Per diem: ${trip.perDiemDailyRate}/day</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Trip Details & Associated Expense Items */}
      {selectedTrip && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Itinerary Breakdown
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedTrip.name} · {selectedTrip.destination}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5">
                {formatDate(selectedTrip.startDate)} to {formatDate(selectedTrip.endDate)} · Purpose: {selectedTrip.purpose}
              </div>
            </div>

            <button
              onClick={() => onOpenScannerForTrip(selectedTrip.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach Receipt to Trip</span>
            </button>
          </div>

          {/* Trip Summary Stat Cards (High-density, unboxed) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 font-medium">Allocated Budget</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {formatCurrency(selectedTrip.budget, baseCurrency)}
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-medium">Reconciled Spend</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {formatCurrency(calculateTripSpent(selectedTrip.id), baseCurrency)}
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-medium">Remaining Headroom</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
                {formatCurrency(
                  Math.max(0, selectedTrip.budget - calculateTripSpent(selectedTrip.id)),
                  baseCurrency
                )}
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-medium">Daily Per-Diem Cap</div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                ${selectedTrip.perDiemDailyRate} / day
              </div>
            </div>
          </div>

          {/* List of Trip Expenses */}
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Itemized Trip Receipts & Vouchers
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Merchant</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount ({baseCurrency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {expenses.filter((e) => e.tripId === selectedTrip.id).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No expenses logged for this trip yet. Click "Attach Receipt to Trip" to scan or add one.
                      </td>
                    </tr>
                  ) : (
                    expenses
                      .filter((e) => e.tripId === selectedTrip.id)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.merchant}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {item.status}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatCurrency(
                              convertCurrency(item.amount, item.currency, baseCurrency),
                              baseCurrency
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      {isAddTripModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-sm text-slate-900">Create New Business Trip</h3>
              <button
                onClick={() => setIsAddTripModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trip Name / Project
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zurich Banking Symposium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zurich"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Switzerland"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Budget Cap ({baseCurrency})
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Daily Per-Diem ($/day)
                  </label>
                  <input
                    type="number"
                    value={perDiemRate}
                    onChange={(e) => setPerDiemRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Purpose & Justification
                </label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, customer meetings, conference talks..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTripModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
