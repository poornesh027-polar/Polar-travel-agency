import React, { useState } from 'react';
import { Trip, ExpenseItem, SupportedCurrency, MileageDetails } from '../types/expense';
import { formatCurrency, convertCurrency } from '../utils/formatters';
import { Navigation, Calculator, Plus, CheckCircle, Car, MapPin, Calendar } from 'lucide-react';

interface MileagePerDiemCalculatorProps {
  trips: Trip[];
  baseCurrency: SupportedCurrency;
  onAddExpense: (expense: ExpenseItem) => void;
}

export const MileagePerDiemCalculator: React.FC<MileagePerDiemCalculatorProps> = ({
  trips,
  baseCurrency,
  onAddExpense,
}) => {
  const [activeCalculator, setActiveCalculator] = useState<'mileage' | 'perdiem'>('mileage');

  // Mileage State
  const [origin, setOrigin] = useState('San Francisco Headquarters');
  const [destination, setDestination] = useState('San Jose Tech Center');
  const [distanceMiles, setDistanceMiles] = useState<number>(48);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [ratePerMile, setRatePerMile] = useState<number>(0.67); // 2026 IRS standard
  const [vehicleType, setVehicleType] = useState<MileageDetails['vehicleType']>('Personal Vehicle');
  const [mileageTripId, setMileageTripId] = useState<string>(trips[0]?.id || '');
  const [mileagePurpose, setMileagePurpose] = useState('Client on-site technical inspection');
  const [mileageSuccessMsg, setMileageSuccessMsg] = useState(false);

  // Per Diem State
  const [perDiemTripId, setPerDiemTripId] = useState<string>(trips[0]?.id || '');
  const [tierRate, setTierRate] = useState<number>(85);
  const [daysCount, setDaysCount] = useState<number>(5);
  const [includeTravelDayDeduction, setIncludeTravelDayDeduction] = useState<boolean>(true);
  const [perDiemSuccessMsg, setPerDiemSuccessMsg] = useState(false);

  // Total Mileage calculation
  const totalMiles = isRoundTrip ? distanceMiles * 2 : distanceMiles;
  const mileageTotalAmount = Math.round(totalMiles * ratePerMile * 100) / 100;

  // Total Per Diem calculation
  // First and last days are typically 75% per IRS guidelines
  const perDiemTotalAmount = includeTravelDayDeduction && daysCount >= 2
    ? Math.round(((daysCount - 2) * tierRate + 2 * (tierRate * 0.75)) * 100) / 100
    : Math.round(daysCount * tierRate * 100) / 100;

  const handleLogMileage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || totalMiles <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-mileage-${Date.now()}`,
      merchant: `Mileage: ${origin} to ${destination}`,
      date: new Date().toISOString().split('T')[0],
      amount: mileageTotalAmount,
      currency: 'USD',
      convertedAmount: convertCurrency(mileageTotalAmount, 'USD', baseCurrency),
      taxAmount: 0,
      category: 'Mileage',
      paymentMethod: 'Personal Card',
      status: 'Submitted',
      tripId: mileageTripId || undefined,
      notes: `${totalMiles} miles @ $${ratePerMile}/mi. ${mileagePurpose}`,
      lineItems: [
        {
          description: `${totalMiles} business miles (${vehicleType})`,
          quantity: totalMiles,
          price: ratePerMile,
        },
      ],
      mileage: {
        origin,
        destination,
        distanceMiles: totalMiles,
        ratePerMile,
        isRoundTrip,
        vehicleType,
        purpose: mileagePurpose,
      },
      policyFlags: [],
      createdAt: new Date().toISOString(),
      verifiedByAI: false,
    };

    onAddExpense(newExpense);
    setMileageSuccessMsg(true);
    setTimeout(() => setMileageSuccessMsg(false), 3000);
  };

  const handleLogPerDiem = (e: React.FormEvent) => {
    e.preventDefault();
    if (daysCount <= 0) return;

    const tripObj = trips.find((t) => t.id === perDiemTripId);
    const tripName = tripObj ? tripObj.name : 'Business Trip';

    const newExpense: ExpenseItem = {
      id: `exp-perdiem-${Date.now()}`,
      merchant: `Per Diem Allowance: ${tripName}`,
      date: new Date().toISOString().split('T')[0],
      amount: perDiemTotalAmount,
      currency: 'USD',
      convertedAmount: convertCurrency(perDiemTotalAmount, 'USD', baseCurrency),
      taxAmount: 0,
      category: 'Per Diem',
      paymentMethod: 'Corporate Card',
      status: 'Submitted',
      tripId: perDiemTripId || undefined,
      notes: `${daysCount} days allowance @ $${tierRate}/day (${includeTravelDayDeduction ? '75% travel day rule' : 'full rate'})`,
      lineItems: [
        {
          description: `Daily Per-Diem Allowance (${daysCount} days)`,
          quantity: daysCount,
          price: Math.round((perDiemTotalAmount / daysCount) * 100) / 100,
        },
      ],
      policyFlags: [],
      createdAt: new Date().toISOString(),
      verifiedByAI: false,
    };

    onAddExpense(newExpense);
    setPerDiemSuccessMsg(true);
    setTimeout(() => setPerDiemSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Selector Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Mileage & Per-Diem Calculator
          </h2>
          <div className="text-xs text-slate-500">
            Standard IRS & corporate business vehicle rates, daily living allowances
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveCalculator('mileage')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeCalculator === 'mileage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle Mileage</span>
          </button>
          <button
            onClick={() => setActiveCalculator('perdiem')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeCalculator === 'perdiem'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Per Diem</span>
          </button>
        </div>
      </div>

      {/* Mileage Calculator */}
      {activeCalculator === 'mileage' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleLogMileage} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Departure Origin
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Headquarters (100 Market St, SF)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. San Jose Convention Center"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  One-Way Distance (Miles)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={distanceMiles}
                  onChange={(e) => setDistanceMiles(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mileage Rate ($/mile)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerMile}
                  onChange={(e) => setRatePerMile(parseFloat(e.target.value) || 0.67)}
                  className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                />
                <div className="text-[10px] text-slate-400 mt-1">IRS 2026 standard is $0.67/mi</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as MileageDetails['vehicleType'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Personal Vehicle">Personal Vehicle</option>
                  <option value="Company Fleet">Company Fleet</option>
                  <option value="Electric EV">Electric EV</option>
                </select>
              </div>
            </div>

            {/* Round trip checkbox & trip dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRoundTrip}
                  onChange={(e) => setIsRoundTrip(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">
                  Round Trip (Total: <span className="tabular-nums font-mono">{totalMiles}</span> miles)
                </span>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associate with Trip
                </label>
                <select
                  value={mileageTripId}
                  onChange={(e) => setMileageTripId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">General Corporate Travel</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.destination})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business Purpose
              </label>
              <input
                type="text"
                value={mileagePurpose}
                onChange={(e) => setMileagePurpose(e.target.value)}
                placeholder="e.g. Travel to client site for technical installation"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Calculation Result Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-slate-500 font-medium">Calculated Reimbursement Claim</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  ${mileageTotalAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {totalMiles} miles × ${ratePerMile}/mile
                </div>
              </div>

              <div className="flex items-center gap-3">
                {mileageSuccessMsg && (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>Added to expenses!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Mileage Expense</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Per Diem Calculator */}
      {activeCalculator === 'perdiem' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleLogPerDiem} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Trip
                </label>
                <select
                  value={perDiemTripId}
                  onChange={(e) => {
                    setPerDiemTripId(e.target.value);
                    const found = trips.find((t) => t.id === e.target.value);
                    if (found) setTierRate(found.perDiemDailyRate);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.destination}) · ${t.perDiemDailyRate}/day
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination Allowance Tier ($/day)
                </label>
                <input
                  type="number"
                  value={tierRate}
                  onChange={(e) => setTierRate(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Days on Travel)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseInt(e.target.value) || 1)}
                  className="w-full font-mono px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTravelDayDeduction}
                    onChange={(e) => setIncludeTravelDayDeduction(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">
                      Apply 75% First & Last Travel Day Rule
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Standard IRS M&IE per-diem prorated regulation
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Result Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-slate-500 font-medium">Eligible Per Diem Total</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  ${perDiemTotalAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {daysCount} days allowance based on corporate lodging & meal tier
                </div>
              </div>

              <div className="flex items-center gap-3">
                {perDiemSuccessMsg && (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>Per diem claim logged!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Per Diem Claim</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
