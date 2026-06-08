import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "../components/Icons";
import { Logo } from "../components/Logo";
import { cn } from "../utils/cn";
import { api, ApiError } from "../lib/api";

export function RegisterScreen() {
  const { register, navigate, showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);

  const valid = name.length > 2 && email.includes("@") && phone.length >= 10 && password.length >= 8 && agree;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    try {
      const res = await api.auth.register({ fullName: name, email, phone, password });
      register(res.user.fullName, res.user.email, res.user.phone, res.user);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Registration failed. Try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div
        className="relative h-44 overflow-hidden"
        style={{ backgroundColor: "#0F0A2E" }}
      >
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl"
          style={{ backgroundColor: "#3B82F6", opacity: 0.4 }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-2xl"
          style={{ backgroundColor: "#EC4899", opacity: 0.4 }}
        />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <Logo size={64} className="shadow-xl shadow-pink-500/20" />
          <h1 className="mt-3 text-2xl font-bold">Create account</h1>
          <p className="text-sm text-purple-200">Join 2M+ Kenyans getting loans</p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="-mt-6 flex flex-1 flex-col overflow-y-auto rounded-t-3xl bg-white px-6 pb-8 pt-7 no-scrollbar"
      >
        <div className="space-y-3.5">
          <Field
            icon={<User size={20} />}
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="John Doe"
          />
          <Field
            icon={<Mail size={20} />}
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
          />
          <Field
            icon={<Phone size={20} />}
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+254 7XX XXX XXX"
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
              <Lock size={20} className="text-slate-400" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAgree((a) => !a)}
              className={cn(
                "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition",
                agree
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white",
              )}
            >
              {agree && <Check size={14} strokeWidth={3} />}
            </button>
            <span className="text-xs leading-relaxed text-slate-600">
              I agree to the{" "}
              <span className="font-semibold text-brand-600">Terms of Service</span>{" "}
              and{" "}
              <span className="font-semibold text-brand-600">Privacy Policy</span> of
              GETON.
            </span>
          </label>
        </div>

        <div className="mt-auto space-y-3 pt-8">
          <button
            type="submit"
            disabled={!valid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("login")}
              className="font-semibold text-brand-600"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
        <span className="text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          required
        />
      </div>
    </div>
  );
}
