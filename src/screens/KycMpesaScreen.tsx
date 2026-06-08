import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check } from "../components/Icons";

export function KycMpesaScreen() {
  const { back, showToast, user, updateUser } = useApp();
  const [phone, setPhone] = useState(user?.mpesaNumber ?? user?.phone ?? "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      showToast("Enter a valid M-Pesa number", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      showToast("OTP sent to your M-Pesa", "info");
    }, 1000);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      showToast("Enter the 6-digit code", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("done");
      updateUser({ mpesaNumber: phone });
      setTimeout(() => {
        showToast("M-Pesa linked successfully!", "success");
        back();
      }, 1200);
    }, 1200);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Link M-Pesa" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {step === "phone" && (
          <form onSubmit={sendOtp} className="animate-fade-in">
            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-green-700 p-5 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black text-green-700">
                  M
                </div>
                <div>
                  <p className="text-sm font-bold">Link M-Pesa Number</p>
                  <p className="text-xs opacity-90">
                    Required for all disbursements
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                M-Pesa number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verify} className="animate-fade-in">
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Enter the OTP
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              We sent a 6-digit code to {phone}. Demo: use any 6 digits.
            </p>

            <div className="mt-5">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-widest outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & Link"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="mt-3 w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              Change phone number
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="mt-12 flex flex-col items-center text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-scale-in">
              <Check size={42} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">
              M-Pesa Linked! 🎉
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              You can now receive loans and make repayments via M-Pesa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
