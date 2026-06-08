import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Cash,
  ChevronRight,
  Clock,
  Plus,
  Sparkle,
  TrendingUp,
} from "../components/Icons";
import { formatCurrency, formatDate } from "../utils/format";

export function LoansScreen() {
  const { activeLoan, navigate } = useApp();

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="My Loans" />

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {activeLoan ? (
          <>
            <div className="bg-aurora-soft relative overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-emerald-950/30">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Active Loan
                </span>
                <Cash size={18} />
              </div>
              <p className="mt-3 text-xs text-emerald-100">Outstanding balance</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatCurrency(activeLoan.totalRepayment)}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[0%] rounded-full bg-white" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-emerald-100">
                <span>Paid: KSh 0</span>
                <span>0% repaid</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
                <Stat label="Monthly" value={formatCurrency(activeLoan.monthlyPayment)} />
                <Stat
                  label="Next due"
                  value={formatDate(
                    new Date(Date.now() + 30 * 86_400_000).toISOString(),
                  )}
                />
              </div>
            </div>

            {/* Repayment schedule */}
            <section className="mt-5">
              <h3 className="mb-3 text-sm font-bold text-slate-900">
                Repayment Schedule
              </h3>
              <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100">
                {Array.from({ length: activeLoan.tenure }).map((_, i) => {
                  const due = new Date(Date.now() + (i + 1) * 30 * 86_400_000);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(activeLoan.monthlyPayment)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Due {formatDate(due)}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                        <Clock size={11} />
                        UPCOMING
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <EmptyState onApply={() => navigate("loan-apply")} />
        )}

        {/* Loan products */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Get Another Loan
          </h3>
          <div className="space-y-2.5">
            <ProductRow
              title="Quick Cash"
              subtitle="KSh 500 – KSh 50,000"
              icon={<Cash size={20} className="text-white" />}
              color="bg-brand-500"
              onClick={() => navigate("loan-apply")}
            />
            <ProductRow
              title="Biashara Loan"
              subtitle="KSh 50,000 – KSh 250,000"
              icon={<TrendingUp size={20} className="text-white" />}
              color="bg-amber-500"
              onClick={() => navigate("loan-apply")}
            />
          </div>
        </section>
      </div>

    </div>
  );
}

function EmptyState({ onApply }: { onApply: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-50">
        <Sparkle size={40} className="text-brand-500" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">No active loans</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-500">
        You don't have any active loans. Apply now and get funded instantly.
      </p>
      <button
        onClick={onApply}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition active:scale-95"
      >
        <Plus size={18} strokeWidth={3} />
        Request a Loan
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-emerald-100/80">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

function ProductRow({
  title,
  subtitle,
  icon,
  color,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-brand-300 active:scale-[0.99]"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <ChevronRight size={20} className="text-slate-400" />
    </button>
  );
}
