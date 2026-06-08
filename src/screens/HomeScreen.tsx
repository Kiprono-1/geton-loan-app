import { useApp } from "../context/AppContext";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bank,
  Briefcase,
  Cash,
  ChevronRight,
  Eye,
  EyeOff,
  Gift,
  Plus,
  Shield,
  Sparkle,
  Star,
  TrendingUp,
} from "../components/Icons";
import { useState } from "react";
import { formatCurrency, formatRelative } from "../utils/format";

const quickActions = [
  {
    key: "borrow",
    label: "Borrow",
    description: "Get a loan",
    icon: Cash,
    screen: "loan-apply",
    gradient: "from-brand-500 to-emerald-600",
    shadow: "shadow-brand-500/30",
  },
  {
    key: "withdraw",
    label: "Withdraw",
    description: "To M-Pesa",
    icon: ArrowUpRight,
    screen: "withdraw",
    gradient: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-500/30",
  },
  {
    key: "wallet",
    label: "Wallet",
    description: "Manage funds",
    icon: Bank,
    screen: "wallet",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/30",
  },
  {
    key: "refer",
    label: "Refer",
    description: "Earn KSh 500",
    icon: Gift,
    screen: "referral",
    gradient: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-500/30",
  },
] as const;

export function HomeScreen() {
  const { user, navigate, activeLoan, transactions } = useApp();
  const [hideBalance, setHideBalance] = useState(false);

  if (!user) return null;

  const eligibleAmount = 250_000;
  const recentTx = transactions.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top branded section — uses the hand-picked aurora gradient */}
      <div className="bg-aurora-soft animate-aurora relative overflow-hidden pb-24 text-white">
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-teal-300/25 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-base font-bold backdrop-blur">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="text-xs text-emerald-50/80">Karibu tena,</p>
              <p className="text-base font-semibold">
                {user.fullName.split(" ")[0]} 👋
              </p>
            </div>
          </div>

          {/* Wallet card — frosted glass with a soft inner gradient */}
          <div className="mt-6 rounded-3xl border border-white/20 bg-white/12 p-5 shadow-2xl shadow-emerald-900/20 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-50/90">
                Wallet Balance
              </span>
              <button
                onClick={() => setHideBalance((h) => !h)}
                className="rounded-full p-1.5 transition hover:bg-white/15"
              >
                {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {hideBalance ? "KSh ••••••" : formatCurrency(user.walletBalance)}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-4">
              <div>
                <p className="text-[11px] text-emerald-50/80">Loan limit</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(eligibleAmount)}
                </p>
              </div>
              <button
                onClick={() => navigate("loan-apply")}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-extrabold text-brand-700 shadow-lg shadow-emerald-900/30 transition active:scale-95"
              >
                <Plus size={14} strokeWidth={3.5} />
                Get Loan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto -mt-12 w-full max-w-6xl flex-1 space-y-6 px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        {/* Quick actions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              const isPrimary = a.key === "borrow";
              return (
                <button
                  key={a.key}
                  onClick={() => navigate(a.screen as never)}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl p-4 text-left transition active:scale-[0.98] ${
                    isPrimary
                      ? `bg-gradient-to-br ${a.gradient} text-white shadow-lg ${a.shadow}`
                      : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-100 hover:ring-slate-200"
                  }`}
                >
                  {/* Decorative blob for primary */}
                  {isPrimary && (
                    <span
                      className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15 blur-2xl"
                      aria-hidden
                    />
                  )}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md transition group-hover:scale-105 ${
                      isPrimary
                        ? "bg-white/25 text-white backdrop-blur"
                        : `bg-gradient-to-br ${a.gradient} text-white ${a.shadow}`
                    }`}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        isPrimary ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {a.label}
                    </p>
                    <p
                      className={`text-[10px] font-medium ${
                        isPrimary ? "text-white/85" : "text-slate-500"
                      }`}
                    >
                      {a.description}
                    </p>
                  </div>
                  {!isPrimary && (
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 text-slate-300"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Active loan or promo banner */}
        {activeLoan ? (
          <button
            onClick={() => navigate("loans")}
            className="bg-deep relative w-full overflow-hidden rounded-3xl p-5 text-left text-white shadow-xl shadow-emerald-950/30"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-700/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                  Active Loan
                </span>
                <ChevronRight size={20} className="opacity-60" />
              </div>
              <p className="mt-3 text-2xl font-bold">
                {formatCurrency(activeLoan.amount)}
              </p>
              <p className="text-xs text-emerald-200/80">
                Monthly: {formatCurrency(activeLoan.monthlyPayment)} •{" "}
                {activeLoan.tenure} months
              </p>
            </div>
          </button>
        ) : (
          <PromoBanner onClick={() => navigate("loan-apply")} />
        )}

        {/* Loan products */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Loan Products</h2>
            <button
              onClick={() => navigate("loans")}
              className="text-xs font-semibold text-brand-600"
            >
              See all
            </button>
          </div>
          <div className="-mx-5 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 px-5">
              <LoanCard
                title="Quick Cash"
                amount="KSh 2.5K – 50K"
                tenure="1–3 months"
                rate="12% APR (1% / month)"
                badge="⭐ 12% APR"
                color="from-brand-500 to-emerald-600"
                icon={<Cash size={22} className="text-white" />}
                onClick={() => navigate("loan-apply")}
              />
              <LoanCard
                title="Salary Advance"
                amount="KSh 10K – 100K"
                tenure="1–3 months"
                rate="12% APR (1% / month)"
                badge="⭐ 12% APR"
                color="from-[#5b6cd1] to-[#8b5cf6]"
                icon={<Briefcase size={22} className="text-white" />}
                onClick={() => navigate("loan-apply")}
              />
              <LoanCard
                title="Biashara Loan"
                amount="KSh 50K – 250K"
                tenure="3–12 months"
                rate="12% APR (1% / month)"
                badge="⭐ 12% APR"
                color="from-[#f59e3b] to-[#e85a76]"
                icon={<TrendingUp size={22} className="text-white" />}
                onClick={() => navigate("loan-apply")}
              />
            </div>
          </div>
        </section>

        {/* Credit score / KYC */}
        <section className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Credit Score
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {user.creditScore}
              </p>
              <p className="text-xs font-medium text-emerald-600">
                <Star size={12} className="mb-0.5 inline" /> Excellent
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-slate-100"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-brand-500"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(user.creditScore / 850) * 97} 97`}
                />
              </svg>
            </div>
          </div>
          <button
            onClick={() => navigate("kyc")}
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-4 py-3 text-left transition hover:bg-brand-100"
          >
            <div className="flex items-center gap-2.5">
              <Shield size={18} className="text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">
                Complete KYC to boost limit
              </span>
            </div>
            <ChevronRight size={18} className="text-brand-600" />
          </button>
        </section>

        {/* Recent transactions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Recent Activity
            </h2>
            <button
              onClick={() => navigate("transactions")}
              className="text-xs font-semibold text-brand-600"
            >
              View all
            </button>
          </div>
          {recentTx.length > 0 ? (
            <div className="space-y-2">
              {recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        tx.type === "fee" || tx.type === "repayment"
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {tx.type === "fee" || tx.type === "repayment" ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownLeft size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatRelative(tx.date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      tx.type === "fee" || tx.type === "repayment"
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {tx.type === "fee" || tx.type === "repayment" ? "-" : "+"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
              <Sparkle size={28} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                No transactions yet
              </p>
              <p className="text-xs text-slate-500">
                Your loan activity will appear here
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function LoanCard({
  title,
  amount,
  tenure,
  rate,
  color,
  icon,
  badge,
  onClick,
}: {
  title: string;
  amount: string;
  tenure: string;
  rate: string;
  color: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-60 flex-shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-5 text-left text-white shadow-lg shadow-slate-900/15 transition active:scale-[0.98]`}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-xl" />
      <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-black/10 blur-xl" />
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          {icon}
        </div>
        {badge && (
          <span className="absolute right-0 top-0 rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-900 shadow-md">
            {badge}
          </span>
        )}
        <p className="mt-3 text-sm font-semibold opacity-90">{title}</p>
        <p className="mt-0.5 text-lg font-bold tracking-tight">{amount}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] font-medium opacity-90">
          <span>{tenure}</span>
          <span>{rate}</span>
        </div>
      </div>
    </button>
  );
}

function PromoBanner({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-sunset relative flex w-full items-center justify-between overflow-hidden rounded-3xl p-5 text-left text-white shadow-xl shadow-orange-500/30 transition active:scale-[0.98]"
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-yellow-300/30 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-rose-400/30 blur-2xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase">
              New
            </span>
            <span className="text-[11px] font-medium opacity-90">Limited offer</span>
          </div>
          <p className="mt-1.5 text-base font-bold leading-tight">
            Get up to KSh 250,000 on M-Pesa in 5 minutes
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline-offset-2">
            Apply now →
          </span>
        </div>
      <div className="ml-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
        <Gift size={28} />
      </div>
    </button>
  );
}
