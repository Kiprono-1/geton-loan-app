import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check, Info } from "../components/Icons";

export function KycKraScreen() {
  const { back, showToast, user, updateUser } = useApp();
  const [pin, setPin] = useState(user?.kraPin ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return null;

  const valid = /^[A-Z]\d{9}[A-Z]$/i.test(pin);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      showToast("KRA PIN format: A001234567Z", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      updateUser({ kraPin: pin.toUpperCase(), kycLevel: 3 });
      setTimeout(() => {
        showToast("Premium tier unlocked! KSh 250,000 limit", "success");
        back();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Add KRA PIN" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {done ? (
          <div className="mt-12 flex flex-col items-center text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-scale-in">
              <Check size={42} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">
              KRA Verified! 🎉
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              You're now on the Premium tier. Loan limit increased to KSh
              250,000.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="animate-fade-in">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Info size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Why we need your KRA PIN
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    We verify your tax compliance with the Kenya Revenue
                    Authority. This unlocks our highest loan tier and best
                    interest rates.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                KRA PIN
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase().slice(0, 11))}
                placeholder="A001234567Z"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-base tracking-wider text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Format: Letter + 9 digits + Letter (e.g., A001234567Z)
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="text-xs font-bold text-emerald-900">
                Premium tier benefits
              </p>
              <ul className="mt-2 space-y-1 text-xs text-emerald-800">
                <li>✓ Up to KSh 250,000 loan limit</li>
                <li>✓ Lower interest rates (2% / month)</li>
                <li>✓ Priority customer support</li>
                <li>✓ Higher same-day disbursement cap</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!valid || loading}
              className="mt-6 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Verifying with KRA…" : "Verify with KRA"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
