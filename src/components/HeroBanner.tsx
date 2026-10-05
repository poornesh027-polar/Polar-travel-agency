import React from 'react';
import { SupportedCurrency } from '../types/expense';
import { formatCurrency } from '../utils/formatters';
import { ScanLine, Navigation, Compass, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  totalSpend: number;
  pendingSpend: number;
  complianceRate: number;
  activeTripsCount: number;
  baseCurrency: SupportedCurrency;
  onOpenScanner: () => void;
  onOpenMileage: () => void;
  onOpenNewTrip: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalSpend,
  pendingSpend,
  complianceRate,
  activeTripsCount,
  baseCurrency,
  onOpenScanner,
  onOpenMileage,
  onOpenNewTrip,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg border border-slate-800 mb-8">
      {/* Background Image with Measured Scrim */}
      <img
        src="/src/assets/images/hero_travel_executive_1791181657329.jpg"
        alt="Executive travel workstation at twilight airfield"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-30 select-none pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/70" />

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span>Corporate Travel Suite</span>
            <span aria-hidden="true">·</span>
            <span>Automated AI Extraction</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Compliance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
            Intelligent Receipt OCR & Global Travel Expense Management
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed max-w-2xl">
            Effortlessly capture multi-currency receipts, automate VAT recovery, reconcile per-diem allowances, and ensure 100% adherence to corporate spending policies.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-all transform active:scale-95"
            >
              <ScanLine className="w-4 h-4 text-slate-900" />
              <span>Smart Scan Receipt</span>
            </button>

            <button
              onClick={onOpenMileage}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs sm:text-sm rounded-lg border border-slate-700 transition-colors"
            >
              <Navigation className="w-4 h-4 text-slate-300" />
              <span>Log Mileage</span>
            </button>

            <button
              onClick={onOpenNewTrip}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-xs sm:text-sm rounded-lg border border-slate-700 transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-300" />
              <span>New Business Trip</span>
            </button>
          </div>
        </div>

        {/* Real KPI Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total YTD Travel Spend</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums mt-0.5">
              {formatCurrency(totalSpend, baseCurrency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across active & past journeys</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Pending Reimbursement</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400 tabular-nums mt-0.5">
              {formatCurrency(pendingSpend, baseCurrency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Submitted claims awaiting payout</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Policy Compliance Rate</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400 tabular-nums mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{complianceRate.toFixed(1)}%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard corporate guidelines</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Active Business Trips</div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums mt-0.5">
              {activeTripsCount} Trips
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tokyo, London & domestic legs</div>
          </div>
        </div>
      </div>
    </div>
  );
};
