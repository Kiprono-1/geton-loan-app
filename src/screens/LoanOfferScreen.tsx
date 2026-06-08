import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Cash, Check, ChevronRight, Info, Shield } from "../components/Icons";
import { formatCurrency } from "../utils/format";

export function LoanOfferScreen() {
  const { currentLoan, navigate } = useApp();

  if (!currentLoan) return null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Loan Offer" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Approval banner */}
        <div className="animate-scale-in rounded-3xl bg-gradient-to-br from-emerald-50 to-brand-100 p-5 ring-1 ring-brand-200/60">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <Check size={24} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-800">
                Pre-approved! 🎉
              </p>
              <p className="text-xs text-brand-700">
                Your loan request has been approved
              </p>
            </div>
          </div>
        </div>

        {/* Loan amount card — deep gradient with subtle glow */}
        <div className="bg-deep relative mt-5 overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-emerald-950/30">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-emerald-200/80">
                Loan Amount
              </span>
              <Cash size={18} className="text-emerald-400" />
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {formatCurrency(currentLoan.amount)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-[11px] text-emerald-200/70">Monthly Payment</p>
                <p className="mt-0.5 text-base font-semibold">
                  {formatCurrency(currentLoan.monthlyPayment)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-200/70">Tenure</p>
                <p className="mt-0.5 text-base font-semibold">
                  {currentLoan.tenure}{" "}
                  {currentLoan.tenure === 1 ? "month" : "months"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-200/70">Interest Rate</p>
                <p className="mt-0.5 text-base font-semibold">
                  {currentLoan.interestRate}% / mo
                </p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-200/70">Total Repayment</p>
                <p className="mt-0.5 text-base font-semibold">
                  {formatCurrency(currentLoan.totalRepayment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important notice */}
        <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Info size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                One-Time Activation Fee
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Before disbursement, a single one-time activation fee of{" "}
                <strong>{formatCurrency(currentLoan.activationFee)}</strong> is
                required. This covers processing, insurance, and KYC
                verification. Pay once — no hidden charges.
              </p>
            </div>
          </div>
        </div>

        {/* Activation fee summary (single payment) */}
        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="bg-aurora-soft border-b border-slate-100 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-white/90">
              Total One-Time Payment
            </p>
            <p className="mt-1 text-3xl font-bold text-white">
              {formatCurrency(currentLoan.activationFee)}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-50/90">
              Pay once via M-Pesa STK Push
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              What's included
            </p>
            <div className="space-y-2.5">
              <FeeRow
                title="Processing Fee"
                subtitle="Application review"
                amount={currentLoan.processingFee}
              />
              <FeeRow
                title="Insurance Premium"
                subtitle="Default protection"
                amount={currentLoan.insuranceFee}
              />
              <FeeRow
                title="ID & IPRS Verification"
                subtitle="Mandatory KYC check"
                amount={currentLoan.verificationFee}
              />
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield size={14} className="text-brand-600" />
          <span>Licensed by CBK • Funds secured by KDIC</span>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={() => navigate("fee-required")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          Accept Offer & Continue
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function FeeRow({
  title,
  subtitle,
  amount,
}: {
  title: string;
  subtitle: string;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Check size={12} strokeWidth={3} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-900">
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
