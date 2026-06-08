import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check, Eye, EyeOff, Lock } from "../components/Icons";

export function ChangePasswordScreen() {
  const { back, showToast } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = current.length > 0 && next.length >= 6 && next === confirm;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Password changed successfully!", "success");
      back();
    }, 900);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Change Password" showBack showBell={false} />

      <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <p className="text-xs leading-relaxed text-blue-900">
            Choose a strong password with at least 6 characters, mixing letters, numbers, and symbols.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <PasswordField
            label="Current password"
            value={current}
            onChange={setCurrent}
            show={show}
            onToggle={() => setShow((s) => !s)}
          />
          <PasswordField
            label="New password"
            value={next}
            onChange={setNext}
            show={show}
            onToggle={() => setShow((s) => !s)}
          />
          <PasswordField
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            show={show}
            onToggle={() => setShow((s) => !s)}
          />
        </div>

        <div className="mt-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Your password must have:</p>
          <ul className="mt-2 space-y-1">
            <li className={`flex items-center gap-1.5 ${next.length >= 6 ? "text-emerald-600" : ""}`}>
              <span className={next.length >= 6 ? "✓" : "○"} /> At least 6 characters
            </li>
            <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(next) ? "text-emerald-600" : ""}`}>
              <span className={/[A-Z]/.test(next) ? "✓" : "○"} /> One uppercase letter
            </li>
            <li className={`flex items-center gap-1.5 ${/[0-9]/.test(next) ? "text-emerald-600" : ""}`}>
              <span className={/[0-9]/.test(next) ? "✓" : "○"} /> One number
            </li>
          </ul>
        </div>

        <div className="mt-auto pt-6">
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
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
        <Lock size={18} className="text-slate-400" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="••••••••"
        />
        <button type="button" onClick={onToggle} className="text-slate-400 hover:text-slate-600">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
