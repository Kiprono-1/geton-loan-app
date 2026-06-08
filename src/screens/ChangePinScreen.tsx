import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check, Delete } from "../components/Icons";

export function ChangePinScreen() {
  const { back, showToast } = useApp();
  const [step, setStep] = useState<"current" | "new" | "confirm" | "done">("current");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const currentTarget =
    step === "current" ? pin : step === "new" ? newPin : confirmPin;
  const setCurrent =
    step === "current" ? setPin : step === "new" ? setNewPin : setConfirmPin;

  const handlePress = (n: string) => {
    if (currentTarget.length >= 4) return;
    const updated = currentTarget + n;
    setCurrent(updated);
    if (updated.length === 4) {
      // Capture the value at the time of press (not after state updates)
      const finalValue = updated;
      setTimeout(() => {
        if (step === "current") {
          if (finalValue === "1234") {
            setStep("new");
            setPin("");
          } else {
            setPin("");
            showToast("Incorrect PIN. Try 1234 for demo", "error");
          }
        } else if (step === "new") {
          setStep("confirm");
          setNewPin("");
        } else if (step === "confirm") {
          if (finalValue === newPin) {
            setStep("done");
            setTimeout(() => {
              showToast("Transaction PIN changed!", "success");
              back();
            }, 1500);
          } else {
            setConfirmPin("");
            showToast("PINs don't match", "error");
          }
        }
      }, 200);
    }
  };

  const handleDelete = () => {
    setCurrent(currentTarget.slice(0, -1));
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Change Transaction PIN" showBack showBell={false} />

      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-4">
        <div className="mt-2 text-center">
          <p className="text-base font-bold text-slate-900">
            {step === "current" && "Enter current PIN"}
            {step === "new" && "Enter new PIN"}
            {step === "confirm" && "Confirm new PIN"}
            {step === "done" && "PIN changed!"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {step === "current" && "Demo: use 1234"}
            {step === "new" && "4 digits, no repeating sequences"}
            {step === "confirm" && "Re-enter the PIN you just chose"}
            {step === "done" && "Returning…"}
          </p>
        </div>

        {/* PIN dots */}
        <div className="mt-8 flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full transition ${
                i < currentTarget.length ? "bg-brand-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {step === "done" ? (
          <div className="mt-12 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 animate-scale-in">
            <Check size={42} strokeWidth={3} className="text-white" />
          </div>
        ) : (
          <div className="mt-12 grid w-full max-w-xs grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
              (k) => {
                if (k === "")
                  return <div key="spacer" />;
                if (k === "del")
                  return (
                    <button
                      key="del"
                      type="button"
                      onClick={handleDelete}
                      className="flex h-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition active:scale-95 hover:bg-slate-200"
                    >
                      <Delete size={22} />
                    </button>
                  );
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handlePress(k)}
                    className="flex h-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-slate-900 shadow-sm ring-1 ring-slate-100 transition active:scale-95 hover:bg-slate-50"
                  >
                    {k}
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
