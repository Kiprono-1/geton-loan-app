import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Check, ChevronRight, Sparkle } from "../components/Icons";
import { formatCurrency } from "../utils/format";

export function LoanDisbursedScreen() {
  const { currentLoan, navigate, disburseLoan, addTransaction, addNotification } = useApp();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!currentLoan) return;
    // Already disbursed in this session — skip the animation
    if (currentLoan.status === "active" || done) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => {
      disburseLoan();
      addTransaction({
        type: "disbursement",
        description: "Loan disbursement",
        amount: currentLoan.amount,
        status: "successful",
      });
      addNotification({
        title: "Loan disbursed! 🎉",
        message: `${formatCurrency(currentLoan.amount)} has been sent to your M-Pesa.`,
        type: "success",
      });
      setDone(true);
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentLoan) return null;

  if (!done) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-8 text-center">
        <div className="relative">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-200" />
          <span
            className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-200"
            style={{ animationDelay: "0.4s" }}
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <span className="h-14 w-14 animate-spin-slow rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <Sparkle className="absolute text-emerald-600" size={24} />
          </div>
        </div>
        <h2 className="mt-10 text-xl font-bold text-slate-900">
          Disbursing your loan…
        </h2>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          We're sending {formatCurrency(currentLoan.amount)} to your M-Pesa.
          This usually takes less than 30 seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-emerald-50 to-white">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* Confetti dots */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(18)].map((_, i) => {
            const colors = ["bg-emerald-400", "bg-amber-400", "bg-pink-400", "bg-indigo-400"];
            const left = `${Math.random() * 100}%`;
            const delay = `${Math.random() * 0.6}s`;
            const top = `${5 + Math.random() * 30}%`;
            return (
              <span
                key={i}
                className={`absolute h-2 w-2 rounded-full ${colors[i % colors.length]} animate-fade-in`}
                style={{ left, top, animationDelay: delay }}
              />
            );
          })}
        </div>

        <div className="animate-scale-in">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-brand-600 shadow-2xl shadow-emerald-500/50">
            <Check size={56} strokeWidth={3} className="text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">
          Hongera! Loan Disbursed 🎉
        </h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Your loan has been sent to your M-Pesa wallet. You should receive an
          SMS confirmation shortly.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Amount Credited
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-brand-600">
            +{formatCurrency(currentLoan.amount)}
          </p>
          <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-left">
            <Row label="Tenure" value={`${currentLoan.tenure} months`} />
            <Row
              label="First repayment"
              value={new Date(
                Date.now() + 30 * 86_400_000,
              ).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <Row
              label="Monthly amount"
              value={formatCurrency(currentLoan.monthlyPayment)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={() => navigate("home")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          Go to Dashboard
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => navigate("transactions")}
          className="w-full rounded-2xl py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          View Transactions
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
