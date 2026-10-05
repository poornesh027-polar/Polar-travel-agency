import React from 'react';
import { SupportedCurrency, CURRENCY_SYMBOLS } from '../types/expense';
import { ScanLine, Plus, Download, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  baseCurrency: SupportedCurrency;
  setBaseCurrency: (c: SupportedCurrency) => void;
  onOpenScanner: () => void;
  onOpenNewTrip: () => void;
  onOpenExport: () => void;
  flaggedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  baseCurrency,
  setBaseCurrency,
  onOpenScanner,
  onOpenNewTrip,
  onOpenExport,
  flaggedCount,
}) => {
  const currencies: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'CAD'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Wayfare
            </span>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`transition-colors pb-1 text-left ${
                currentTab === 'dashboard'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('trips')}
              className={`transition-colors pb-1 text-left ${
                currentTab === 'trips'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Trips & Itineraries
            </button>
            <button
              onClick={() => setCurrentTab('ledger')}
              className={`transition-colors pb-1 text-left ${
                currentTab === 'ledger'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Expenses Ledger
            </button>
            <button
              onClick={() => setCurrentTab('mileage')}
              className={`transition-colors pb-1 text-left ${
                currentTab === 'mileage'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Mileage & Per Diem
            </button>
            <button
              onClick={() => setCurrentTab('policy')}
              className={`relative transition-colors pb-1 text-left flex items-center gap-1.5 ${
                currentTab === 'policy'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <span>Policy Audit</span>
              {flaggedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          </nav>

          {/* Zone 3: Primary actions & Currency selector */}
          <div className="flex items-center gap-2.5">
            {/* Currency selector */}
            <div className="relative inline-flex items-center">
              <label htmlFor="currency-select" className="sr-only">Display Currency</label>
              <select
                id="currency-select"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as SupportedCurrency)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c} ({CURRENCY_SYMBOLS[c]})
                  </option>
                ))}
              </select>
            </div>

            {/* Export button */}
            <button
              onClick={onOpenExport}
              title="Export Report & CSV"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Scan Receipt CTA */}
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Smart Scan</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-4 py-2 border-t border-slate-100 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'dashboard' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('trips')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'trips' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'}`}
          >
            Trips
          </button>
          <button
            onClick={() => setCurrentTab('ledger')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'ledger' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'}`}
          >
            Expenses
          </button>
          <button
            onClick={() => setCurrentTab('mileage')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'mileage' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'}`}
          >
            Mileage
          </button>
          <button
            onClick={() => setCurrentTab('policy')}
            className={`whitespace-nowrap px-2 py-1 rounded ${currentTab === 'policy' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'}`}
          >
            Policy ({flaggedCount})
          </button>
        </div>
      </div>
    </header>
  );
};
