import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Check, ChevronRight, Sparkle } from "../components/Icons";
import { formatCurrency } from "../utils/format";

export function PaymentSuccessScreen() {
  const { currentLoan, navigate, addNotification } = useApp();

  useEffect(() => {
    addNotification({
      title: "Payment successful 🎉",
      message:
        "Your activation fee has been received. Your loan is being disbursed.",
      type: "success",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentLoan) return null;

  const lastFee = currentLoan.paidFees[currentLoan.paidFees.length - 1];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="relative animate-scale-in">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-200" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 shadow-lg shadow-emerald-500/40">
            <Check size={48} strokeWidth={3} className="text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-2xl font-bold text-slate-900">
          Payment Successful!
        </h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Your Paystack payment of{" "}
          <strong className="text-slate-900">
            {lastFee ? formatCurrency(lastFee.amount) : ""}
          </strong>{" "}
          has been received and confirmed via M-Pesa.
        </p>

        {/* Receipt card */}
        <div className="mt-8 w-full max-w-sm rounded-3xl bg-slate-50 p-5 text-left">
          <div className="space-y-3">
            <Row
              label="Amount Paid"
              value={lastFee ? formatCurrency(lastFee.amount) : "—"}
              bold
            />
            <Row label="Reference" value={lastFee?.reference ?? "—"} />
            <Row label="Date" value={new Date().toLocaleString()} />
            <Row label="Status" value="Successful" success />
          </div>
        </div>

        {/* Next step — all done */}
        <div className="mt-6 w-full max-w-sm rounded-2xl bg-brand-50 p-4 text-left ring-1 ring-brand-100">
          <div className="flex items-start gap-2">
            <Sparkle size={20} className="mt-0.5 flex-shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-bold text-brand-800">
                Loan ready to be disbursed!
              </p>
              <p className="mt-1 text-xs text-brand-700">
                Your loan of {formatCurrency(currentLoan.amount)} will be sent
                to your M-Pesa instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={() => navigate("loan-disbursed")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          Receive My Loan
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  success,
}: {
  label: string;
  value: string;
  bold?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`${bold ? "font-bold" : "font-semibold"} ${
          success ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
