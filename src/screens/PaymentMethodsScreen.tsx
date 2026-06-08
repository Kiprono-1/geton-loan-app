import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Bank,
  Card,
  Check,
  ChevronRight,
  Plus,
  Star,
} from "../components/Icons";

export function PaymentMethodsScreen() {
  const { user, navigate, showToast } = useApp();
  if (!user) return null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Payment Methods" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* M-Pesa */}
        <section>
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">
            Mobile Money
          </h3>
          <div className="space-y-2.5">
            <div className="relative flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-2 ring-brand-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white">
                M
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900">M-Pesa</p>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[9px] font-bold text-brand-700">
                    PRIMARY
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  +254 712 ••• 678 • {user.fullName}
                </p>
              </div>
              <Star size={18} className="text-amber-400" />
            </div>

            <button
              onClick={() => navigate("add-airtel")}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 transition hover:border-brand-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-lg font-black text-white">
                A
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-700">
                  Add Airtel Money
                </p>
                <p className="text-xs text-slate-500">Link your wallet</p>
              </div>
              <Plus size={20} className="text-slate-400" />
            </button>
          </div>
        </section>

        {/* Bank Accounts */}
        <section className="mt-6">
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">
            Bank Accounts
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Bank size={22} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Equity Bank</p>
                <p className="text-xs text-slate-500">
                  ••• 4521 • {user.fullName}
                </p>
              </div>
              <button
                onClick={() => showToast("Set as primary", "success")}
                className="text-[11px] font-semibold text-brand-600"
              >
                Set primary
              </button>
            </div>

            <button
              onClick={() => navigate("add-bank")}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 transition hover:border-brand-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Plus size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-700">
                  Add bank account
                </p>
                <p className="text-xs text-slate-500">KCB, Co-op, Absa, NCBA...</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </button>
          </div>
        </section>

        {/* Cards */}
        <section className="mt-6">
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">
            Saved Cards
          </h3>
          <button
            onClick={() => navigate("add-card")}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 transition hover:border-brand-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Card size={22} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-700">
                Add debit/credit card
              </p>
              <p className="text-xs text-slate-500">
                Visa, Mastercard accepted
              </p>
            </div>
            <Plus size={20} className="text-slate-400" />
          </button>
        </section>

        {/* Info */}
        <div className="mt-6 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <div className="flex gap-2">
            <Check size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
            <p className="text-xs leading-relaxed text-blue-900">
              Your primary payment method is used for loan disbursements and
              automatic repayments. You can change it anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
