import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Camera, Check } from "../components/Icons";

export function KycIdScreen() {
  const { back, showToast, updateUser, user } = useApp();
  const [step, setStep] = useState<"front" | "back" | "selfie" | "done">("front");
  const [idNumber, setIdNumber] = useState(user?.nationalId ?? "");

  if (!user) return null;

  const submitFront = () => {
    if (idNumber.length < 6) {
      showToast("Enter a valid National ID number", "error");
      return;
    }
    setStep("back");
  };

  const submitBack = () => setStep("selfie");

  const submitSelfie = () => {
    setStep("done");
    setTimeout(() => {
      updateUser({ nationalId: idNumber, kycLevel: Math.max(2, user.kycLevel) as 2 });
      showToast("KYC tier upgraded to Verified!", "success");
      back();
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Link National ID" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Stepper */}
        <div className="flex items-center gap-1.5">
          {["front", "back", "selfie"].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition ${
                ["front", "back", "selfie"].indexOf(step) >= i
                  ? "bg-brand-600"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Step {["front", "back", "selfie"].indexOf(step) + 1} of 3
        </p>

        {step === "front" && (
          <div className="animate-fade-in">
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Front of National ID
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Take a clear photo of the front of your National ID card.
            </p>

            <div className="mt-5">
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Camera size={32} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Tap to capture
                </p>
                <p className="text-[11px] text-slate-500">Camera access needed</p>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                National ID number
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={idNumber}
                onChange={(e) =>
                  setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                placeholder="12345678"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <button
              onClick={submitFront}
              className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}

        {step === "back" && (
          <div className="animate-fade-in">
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Back of National ID
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Now flip your ID and capture the back.
            </p>

            <div className="mt-5">
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Camera size={32} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Tap to capture
                </p>
                <p className="text-[11px] text-slate-500">Make sure it's clear</p>
              </div>
            </div>

            <button
              onClick={submitBack}
              className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}

        {step === "selfie" && (
          <div className="animate-fade-in">
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Take a selfie
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Match your face with the ID photo for verification.
            </p>

            <div className="mt-5">
              <div className="mx-auto h-56 w-56 rounded-full border-2 border-dashed border-slate-300 bg-white">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Camera size={32} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Tap to take</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <p className="text-xs leading-relaxed text-amber-900">
                Make sure you're in a well-lit area and looking straight at the
                camera. Remove glasses and hats.
              </p>
            </div>

            <button
              onClick={submitSelfie}
              className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
            >
              Submit for verification
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="mt-12 flex flex-col items-center text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-scale-in">
              <Check size={42} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Verification in progress
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Your KYC upgrade is being processed. You'll be notified within
              minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
