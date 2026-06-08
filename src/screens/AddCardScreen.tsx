import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Card, Check } from "../components/Icons";

export function AddCardScreen() {
  const { back, showToast } = useApp();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const valid =
    number.replace(/\s/g, "").length >= 16 && name && expiry.length >= 5 && cvv.length >= 3;

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length < 3) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      showToast("Please complete all card details", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Card added successfully!", "success");
      back();
    }, 1200);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Add Card" showBack showBell={false} />

      <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 px-5 pb-6 pt-2">
          {/* Card preview */}
          <div className="bg-deep relative h-44 overflow-hidden rounded-2xl p-5 text-white shadow-xl shadow-emerald-950/30">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-emerald-200/70">
                  GETON
                </span>
                <Card size={20} className="text-emerald-300" />
              </div>
              <div>
                <p className="font-mono text-lg tracking-wider">
                  {number || "•••• •••• •••• ••••"}
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-200/60">
                      Card holder
                    </p>
                    <p className="text-xs font-bold">
                      {name || "YOUR NAME"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-200/60">
                      Expires
                    </p>
                    <p className="text-xs font-bold">
                      {expiry || "MM/YY"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Card number
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={number}
                onChange={(e) => setNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cardholder name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="JOHN A KAMAU"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expiry
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExp(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CVV
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="•••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <p className="text-xs leading-relaxed text-blue-900">
              <strong>Secure:</strong> Your card details are encrypted with
              256-bit SSL and processed by Paystack. We never store your CVV.
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
                Save Card
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
