import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Check,
  ChevronRight,
  Clock,
  Lock,
  Shield,
} from "../components/Icons";
import { formatCurrency } from "../utils/format";

export function FeeRequiredScreen() {
  const { currentLoan, navigate } = useApp();

  if (!currentLoan) return null;

  const totalPaid = currentLoan.paidFees.reduce((s, f) => s + f.amount, 0);
  const allPaid = totalPaid >= currentLoan.activationFee;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Activate Loan" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Hero — loan awaiting, deep gradient */}
        <div className="bg-deep relative overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-emerald-950/30">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
            <Clock size={14} />
            <span>Awaiting Activation</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Loan amount ready for disbursement
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {formatCurrency(currentLoan.amount)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-300">
            <Check size={12} strokeWidth={3} />
            <span>Sent to M-Pesa upon payment confirmation</span>
          </div>
        </div>

        {/* SINGLE payment card */}
        <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-100/40 ring-2 ring-brand-100">
          {/* Header — the headline single-payment card uses aurora gradient */}
          <div className="bg-aurora-soft relative p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-emerald-100/90">
              One-Time Activation Fee
            </p>
            <p className="mt-1 text-4xl font-black tracking-tight">
              {formatCurrency(currentLoan.activationFee)}
            </p>
            <p className="mt-1 text-xs text-emerald-100">
              Pay once. No recurring charges.
            </p>
          </div>

          {/* Breakdown */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              What this covers
            </p>
            <div className="space-y-2">
              <BreakdownRow
                label="Processing & Application"
                amount={currentLoan.processingFee}
              />
              <BreakdownRow
                label="Loan Insurance Premium"
                amount={currentLoan.insuranceFee}
              />
              <BreakdownRow
                label="IPRS Verification & CRB Check"
                amount={currentLoan.verificationFee}
              />
              <div className="!mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                <span className="text-sm font-bold text-slate-900">
                  Total Due
                </span>
                <span className="text-base font-black text-brand-700">
                  {formatCurrency(currentLoan.activationFee)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-5 space-y-2">
          <Benefit text={`Instant disbursement of ${formatCurrency(currentLoan.amount)}`} />
          <Benefit text="Money sent directly to your M-Pesa" />
          <Benefit text="No collateral or guarantor needed" />
          <Benefit text="100% refundable if loan is not disbursed" />
        </div>

        {/* Trust */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Lock size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Secure Payment</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              All payments are processed through Paystack M-Pesa STK Push with 256-bit
              encryption. Your details are never stored on our servers.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Shield size={12} className="text-brand-600" />
          <span>CBK Licensed • PCI-DSS Compliant</span>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        {allPaid ? (
          <button
            onClick={() => navigate("loan-disbursed")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition active:scale-[0.98]"
          >
            <Check size={20} strokeWidth={3} />
            Receive Loan Disbursement
          </button>
        ) : (
          <button
            onClick={() => navigate("payment")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
          >
            <Lock size={18} />
            Pay {formatCurrency(currentLoan.activationFee)} & Activate
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Check size={14} strokeWidth={3} />
      </span>
      <span className="text-xs font-medium text-slate-700">{text}</span>
    </div>
  );
}
