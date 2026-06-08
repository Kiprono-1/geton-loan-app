import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Camera, Check } from "../components/Icons";

export function KycSelfieScreen() {
  const { back, showToast } = useApp();
  const [captured, setCaptured] = useState(false);
  const [done, setDone] = useState(false);

  const capture = () => {
    setCaptured(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        showToast("Selfie verification submitted!", "success");
        back();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Selfie Verification" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {done ? (
          <div className="mt-12 flex flex-col items-center text-center animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-scale-in">
              <Check size={42} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-900">
              Selfie Captured! 📸
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Our AI is verifying your identity. This usually takes under a
              minute.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Verify with selfie
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Take a selfie to confirm it's really you.
            </p>

            <div className="mt-5">
              <div className="mx-auto h-64 w-64 rounded-full border-4 border-dashed border-slate-300 bg-white">
                <div className="flex h-full items-center justify-center">
                  {captured ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 animate-scale-in">
                      <Check size={36} strokeWidth={3} className="text-white" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Camera size={32} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Tap button below
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <p className="text-xs leading-relaxed text-amber-900">
                Make sure you're in a well-lit area, looking straight at the
                camera. Remove glasses and hats.
              </p>
            </div>

            <button
              onClick={capture}
              disabled={captured}
              className="mt-5 w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
            >
              {captured ? "Processing…" : "Take Selfie"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
