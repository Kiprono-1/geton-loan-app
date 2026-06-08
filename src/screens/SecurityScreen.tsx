import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Shield,
} from "../components/Icons";
import { cn } from "../utils/cn";

export function SecurityScreen() {
  const { showToast, navigate } = useApp();
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [transactionPin, setTransactionPin] = useState(true);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Security & Privacy" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Security score */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-emerald-500 p-5 text-white shadow-lg shadow-brand-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-100/80">
                Security Score
              </p>
              <p className="text-lg font-bold">Good</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-3/4 rounded-full bg-white" />
          </div>
          <p className="mt-2 text-xs text-emerald-100">
            Enable 2FA to reach Excellent
          </p>
        </div>

        {/* Quick toggles */}
        <section className="mt-5">
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">
            Authentication
          </h3>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <Toggle
              label="Biometric Login"
              description="Use fingerprint or face to login"
              value={biometric}
              onChange={setBiometric}
            />
            <Toggle
              label="2-Factor Authentication"
              description="Extra security via SMS code"
              value={twoFA}
              onChange={(v) => {
                setTwoFA(v);
                if (v) showToast("2FA enabled — SMS will be sent", "success");
              }}
            />
            <Toggle
              label="Transaction PIN"
              description="Required for all transactions"
              value={transactionPin}
              onChange={setTransactionPin}
            />
          </div>
        </section>

        {/* Actions */}
        <section className="mt-5">
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">
            Manage Credentials
          </h3>
          <div className="space-y-2">
            <Item
              icon={<Lock size={20} />}
              label="Change password"
              onClick={() => navigate("change-password")}
            />
            <Item
              icon={<EyeOff size={20} />}
              label="Change transaction PIN"
              onClick={() => navigate("change-pin")}
            />
            <Item
              icon={<Eye size={20} />}
              label="Login activity"
              badge="3 devices"
              onClick={() => navigate("login-activity")}
            />
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-5">
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">Privacy</h3>
          <div className="space-y-2">
            <Item
              icon={<Shield size={20} />}
              label="Privacy policy"
              onClick={() => navigate("privacy")}
            />
            <Item
              icon={<Check size={20} />}
              label="Data sharing preferences"
              onClick={() => navigate("data-sharing")}
            />
          </div>
        </section>

        {/* Trust info */}
        <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-900">
            🛡️ How we protect you
          </p>
          <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600">
            <li>• 256-bit end-to-end encryption</li>
            <li>• PCI-DSS Level 1 certified</li>
            <li>• ISO 27001 information security</li>
            <li>• Data Protection Act 2019 compliant</li>
            <li>• Independent security audits quarterly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition last:border-none hover:bg-slate-50"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-[11px] text-slate-500">{description}</p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition",
          value ? "bg-brand-600" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
            value ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

function Item({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <span className="flex-1 text-left text-sm font-semibold text-slate-900">
        {label}
      </span>
      {badge && (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {badge}
        </span>
      )}
      <ChevronRight size={18} className="text-slate-400" />
    </button>
  );
}
