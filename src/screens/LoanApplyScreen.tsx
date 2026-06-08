import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Briefcase,
  Cash,
  Check,
  ChevronRight,
  TrendingUp,
} from "../components/Icons";
import {
  computeLoan,
  formatCurrency,
  MAX_LOAN,
  MIN_LOAN,
} from "../utils/format";
import type { LoanApplication } from "../types";
import { cn } from "../utils/cn";
import { api, ApiError } from "../lib/api";

const purposes = [
  { key: "personal", label: "Personal Use", icon: Cash, color: "bg-brand-500" },
  { key: "business", label: "Biashara", icon: TrendingUp, color: "bg-amber-500" },
  { key: "salary", label: "Salary Advance", icon: Briefcase, color: "bg-indigo-500" },
  { key: "emergency", label: "Emergency", icon: Check, color: "bg-rose-500" },
];

const tenureOptions = [1, 3, 6, 12];

const presetAmounts = [5_000, 25_000, 100_000, 250_000];

export function LoanApplyScreen() {
  const { navigate, setCurrentLoan, user, showToast } = useApp();
  const [amount, setAmount] = useState(25_000);
  const [tenure, setTenure] = useState(3);
  const [purpose, setPurpose] = useState("personal");
  const [loading, setLoading] = useState(false);

  const minAmount = MIN_LOAN;
  const maxAmount = MAX_LOAN;

  // Use user context for tier-based rate calculation
  const userContext = {
    kycLevel: user?.kycLevel,
    repaidLoansCount: 0, // Would come from API in production
    isFirstLoan: true,
  };

  const computation = useMemo(
    () => computeLoan(amount, tenure, userContext),
    [amount, tenure, user?.kycLevel],
  );

  const handleSliderChange = (v: number) => {
    // round to nearest 500
    const rounded = Math.round(v / 500) * 500;
    setAmount(Math.min(maxAmount, Math.max(minAmount, rounded)));
  };

  const proceed = async () => {
    setLoading(true);
    try {
      const res = await api.loans.apply({ amount, tenure, purpose });
      const loan: LoanApplication = {
        id: res.loan.id,
        amount,
        tenure,
        purpose,
        monthlyPayment: computation.monthlyPayment,
        totalRepayment: computation.totalRepayment,
        interestRate: computation.interestRate,
        activationFee: res.loan.activationFee ?? computation.activationFee,
        processingFee: computation.processingFee,
        insuranceFee: computation.insuranceFee,
        verificationFee: computation.verificationFee,
        totalRequiredFees: res.loan.activationFee ?? computation.activationFee,
        paidFees: [],
        status: "pending",
        createdAt: res.loan.createdAt ?? new Date().toISOString(),
      };
      setCurrentLoan(loan);
      navigate("loan-offer");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not submit loan. Try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const sliderPct = ((amount - minAmount) / (maxAmount - minAmount)) * 100;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50">
      <TopBar title="Request a Loan" showBack showBell={false} />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Amount display — aurora gradient */}
        <div className="bg-aurora-soft relative overflow-hidden rounded-3xl p-6 text-white shadow-lg shadow-emerald-950/30">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-300/25 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-50/80">
              How much do you need?
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-medium">KSh</span>
              <input
                type="text"
                value={amount.toLocaleString()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const n = parseInt(raw || "0", 10);
                  setAmount(Math.min(maxAmount, Math.max(minAmount, n)));
                }}
                className="w-full bg-transparent pl-2 text-4xl font-bold tracking-tight outline-none placeholder:text-white/40"
              />
            </div>

            {/* Slider */}
            <div className="mt-5">
              <div className="relative h-2 rounded-full bg-white/20">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-white"
                  style={{ width: `${sliderPct}%` }}
                />
                <input
                  type="range"
                  min={minAmount}
                  max={maxAmount}
                  step={500}
                  value={amount}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div
                  className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-600 bg-white shadow-md"
                  style={{ left: `${sliderPct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-emerald-50/80">
                <span>{formatCurrency(minAmount)}</span>
                <span>{formatCurrency(maxAmount)}</span>
              </div>
            </div>

            {/* Presets */}
            <div className="mt-4 flex flex-wrap gap-2">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    amount === p
                      ? "bg-white text-brand-700"
                      : "bg-white/15 text-white hover:bg-white/25",
                  )}
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tenure */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Repayment Period
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {tenureOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTenure(t)}
                className={cn(
                  "rounded-2xl border-2 py-3 text-center transition active:scale-95",
                  tenure === t
                    ? "border-brand-600 bg-brand-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-lg font-bold",
                    tenure === t ? "text-brand-700" : "text-slate-700",
                  )}
                >
                  {t}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {t === 1 ? "month" : "months"}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Purpose */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Loan Purpose</h3>
          <div className="grid grid-cols-2 gap-2">
            {purposes.map((p) => {
              const Icon = p.icon;
              const active = purpose === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setPurpose(p.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-[0.98]",
                    active
                      ? "border-brand-600 bg-brand-50"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${p.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Repayment preview */}
        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Repayment Summary</h3>
            {computation.interestRate <= 4 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {computation.interestRate <= 2
                  ? "👑 VIP RATE"
                  : computation.interestRate <= 3
                    ? "⭐ PREFERRED"
                    : "✓ LOWEST IN KENYA"}
              </span>
            )}
          </div>
          <div className="mt-4 space-y-3">
            <Row
              label="Monthly Repayment"
              value={formatCurrency(computation.monthlyPayment)}
              highlight
            />
            <Row
              label="Interest Rate"
              value={`${computation.interestRate.toFixed(1)}% / month (${(computation.interestRate * 12).toFixed(0)}% APR)`}
            />
            <Row
              label="Total Interest"
              value={formatCurrency(computation.totalInterest)}
            />
            <Row
              label="Total Repayment"
              value={formatCurrency(computation.totalRepayment)}
            />
          </div>

          {/* Savings vs industry callout */}
          {computation.savedVsIndustry > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-3 ring-1 ring-emerald-100">
              <span className="text-xl">💰</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-900">
                  You save {formatCurrency(computation.savedVsIndustry)}!
                </p>
                <p className="text-[10px] text-emerald-700">
                  vs. industry average of 15% / month
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={proceed}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>Continue <ChevronRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={cn(
          "text-sm font-bold",
          highlight ? "text-lg text-brand-600" : "text-slate-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}
