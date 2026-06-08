import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Eye, EyeOff, Lock, Mail } from "../components/Icons";
import { Logo } from "../components/Logo";
import { api, ApiError } from "../lib/api";

export function LoginScreen() {
  const { login, navigate, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      login(res.user.email, res.user.fullName, res.user);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed. Try again.";
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
          <h1 className="mt-3 text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-purple-200">Sign in to your GETON account</p>
        </div>
      </div>

      <form onSubmit={submit} className="-mt-6 flex flex-1 flex-col rounded-t-3xl bg-white px-6 pt-8">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email address
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
              <Mail size={20} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

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
                placeholder="Enter your password"
                className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Remember me
            </label>
            <button type="button" onClick={() => navigate("register" as any)} className="font-semibold text-brand-600">
              Forgot password?
            </button>
          </div>
        </div>

        <div className="mt-auto space-y-3 pb-8 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            New to GETON?{" "}
            <button
              type="button"
              onClick={() => navigate("register")}
              className="font-semibold text-brand-600"
            >
              Create account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
