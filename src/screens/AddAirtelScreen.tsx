import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check, Phone } from "../components/Icons";

export function AddAirtelScreen() {
  const { back, showToast } = useApp();
  const [phone, setPhone] = useState("+254 ");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = phone.replace(/\D/g, "").length >= 12 && name.length > 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      showToast("Enter valid phone and name", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Airtel Money linked successfully!", "success");
      back();
    }, 1100);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Link Airtel Money" showBack showBell={false} />

      <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 px-5 pb-6 pt-2">
          <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-red-500 to-red-700 p-5 text-white shadow-lg shadow-red-500/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black text-red-600">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Airtel Money</p>
              <p className="text-xs opacity-90">Link your wallet in seconds</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Airtel phone number
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
                <Phone size={18} className="text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name on account
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="As registered with Airtel"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
            <p className="text-xs leading-relaxed text-amber-900">
              We'll send an OTP to this number to verify ownership. Standard
              Airtel SMS rates apply.
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
                Link Airtel Money
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
