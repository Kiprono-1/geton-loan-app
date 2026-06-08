import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { ArrowDownLeft, Bank, Check } from "../components/Icons";
import { formatCurrency } from "../utils/format";
import { cn } from "../utils/cn";

type Source = "mpesa" | "bank" | "card";

export function DepositScreen() {
  const { user, updateUser, navigate, addTransaction, addNotification, showToast } = useApp();

  const [source, setSource] = useState<Source>("mpesa");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const numericAmount = parseInt(amount.replace(/[^\d]/g, "") || "0", 10);
  const valid = numericAmount > 0;

  const presets = [500, 2000, 5000, 10000];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      showToast("Enter a valid amount", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      updateUser({ walletBalance: user.walletBalance + numericAmount });
      addTransaction({
        type: "deposit",
        description: `Deposit from ${
          source === "mpesa" ? "M-Pesa" : source === "bank" ? "Bank" : "Card"
        }`,
        amount: numericAmount,
        status: "successful",
      });
      addNotification({
        title: "Deposit successful",
        message: `${formatCurrency(numericAmount)} credited to your GETON wallet.`,
        type: "success",
      });
      setLoading(false);
      setSuccess(true);
    }, 1600);
  };

  if (success) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="animate-scale-in flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 shadow-lg shadow-emerald-500/40">
            <Check size={48} strokeWidth={3} className="text-white" />
          </div>
          <h1 className="mt-8 text-2xl font-bold text-slate-900">
            Deposit Successful!
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            {formatCurrency(numericAmount)} has been credited to your wallet.
          </p>
        </div>
        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <button
            onClick={() => navigate("home")}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Deposit Funds" showBack showBell={false} />

      <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 px-5 pb-6 pt-2">
          {/* Balance */}
          <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-emerald-500 p-5 text-white shadow-lg shadow-brand-500/20">
            <p className="text-xs uppercase tracking-wide text-emerald-100/80">
              Current Balance
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatCurrency(user.walletBalance)}
            </p>
          </div>

          {/* Amount input */}
          <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              Amount to Deposit
            </label>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-medium text-slate-400">KSh</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setAmount(raw ? parseInt(raw).toLocaleString() : "");
                }}
                placeholder="0"
                className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-slate-300"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p.toLocaleString())}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <section className="mt-5">
            <h3 className="mb-2.5 text-sm font-bold text-slate-900">
              Deposit from
            </h3>
            <div className="space-y-2">
              <SourceOption
                active={source === "mpesa"}
                onClick={() => setSource("mpesa")}
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-base font-black text-white">
                    M
                  </div>
                }
                title="M-Pesa"
                subtitle={user.phone}
              />
              <SourceOption
                active={source === "bank"}
                onClick={() => setSource("bank")}
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Bank size={20} />
                  </div>
                }
                title="Equity Bank"
                subtitle="••• 4521"
              />
              <SourceOption
                active={source === "card"}
                onClick={() => setSource("card")}
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                    💳
                  </div>
                }
                title="Debit/Credit Card"
                subtitle="Visa, Mastercard"
              />
            </div>
          </section>

          {/* Info */}
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <p className="text-xs leading-relaxed text-emerald-900">
              ✓ <strong>Free deposits</strong> — no transaction fees.
              Funds arrive instantly in your wallet.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <button
            type="submit"
            disabled={!valid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                <ArrowDownLeft size={18} />
                Deposit {numericAmount > 0 ? formatCurrency(numericAmount) : ""}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SourceOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition active:scale-[0.99]",
        active ? "border-brand-600 bg-brand-50" : "border-slate-200",
      )}
    >
      {icon}
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2",
          active ? "border-brand-600 bg-brand-600" : "border-slate-300",
        )}
      >
        {active && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}
