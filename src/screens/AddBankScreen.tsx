import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Bank, Check } from "../components/Icons";

const BANKS = [
  "Equity Bank",
  "KCB Bank",
  "Co-operative Bank",
  "Absa Bank",
  "Standard Chartered",
  "NCBA Loop",
  "Stanbic Bank",
  "DTB Bank",
  "I&M Bank",
  "Family Bank",
];

export function AddBankScreen() {
  const { back, showToast, user } = useApp();
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [name, setName] = useState(user?.fullName ?? "");
  const [loading, setLoading] = useState(false);

  const valid = bank && account.length >= 8 && name.length > 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      showToast("Fill in all details correctly", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(`${bank} account linked!`, "success");
      back();
    }, 1100);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Add Bank Account" showBack showBell={false} />

      <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 px-5 pb-6 pt-2">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Bank size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Link a bank</p>
                <p className="text-xs text-slate-500">
                  For loan disbursement & repayments
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bank
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">Select your bank</option>
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account number
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={account}
                onChange={(e) =>
                  setAccount(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
                placeholder="0123456789"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account holder name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="As on your bank account"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <p className="text-xs leading-relaxed text-blue-900">
              <strong>Why we need this:</strong> To disburse your loan and
              collect repayments automatically. We never store your banking
              PIN or password.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <button
            type="submit"
            disabled={!valid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                <Check size={18} strokeWidth={3} />
                Link Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


