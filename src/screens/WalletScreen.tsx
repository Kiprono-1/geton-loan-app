import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bank,
  Card,
  Eye,
  EyeOff,
  Plus,
} from "../components/Icons";
import { useState } from "react";
import { formatCurrency } from "../utils/format";

export function WalletScreen() {
  const { user, navigate } = useApp();
  const [hide, setHide] = useState(false);
  if (!user) return null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="My Wallet" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Wallet card */}
        <div className="bg-deep relative overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-emerald-950/30">
          <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-slate-300">
                Available Balance
              </span>
              <button
                onClick={() => setHide((h) => !h)}
                className="rounded-full p-1.5 hover:bg-white/10"
              >
                {hide ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {hide ? "KSh ••••••" : formatCurrency(user.walletBalance)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-300">
              <Card size={14} />
              <span>M-Pesa • +254 712 ••• 678</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Action
            label="Withdraw"
            icon={<ArrowUpRight size={20} />}
            color="bg-brand-500"
            onClick={() => navigate("withdraw")}
          />
          <Action
            label="Deposit"
            icon={<ArrowDownLeft size={20} />}
            color="bg-indigo-500"
            onClick={() => navigate("deposit")}
          />
          <Action
            label="Loan"
            icon={<Plus size={20} />}
            color="bg-amber-500"
            onClick={() => navigate("loan-apply")}
          />
        </div>

        {/* Linked accounts */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Linked Accounts</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white">
                M
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">M-Pesa</p>
                <p className="text-xs text-slate-500">
                  +254 712 ••• 678 • {user.fullName}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                PRIMARY
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Bank size={22} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Equity Bank</p>
                <p className="text-xs text-slate-500">
                  ••• 4521 • {user.fullName}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                LINKED
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Action({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 transition active:scale-95"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${color}`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
    </button>
  );
}
