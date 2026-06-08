import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Bell,
  ChevronRight,
  Info,
  Mail,
  Sparkle,
} from "../components/Icons";
import { cn } from "../utils/cn";

export function SettingsScreen() {
  const { showToast, navigate } = useApp();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="App Settings" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Notifications */}
        <Section title="Notifications">
          <Toggle
            icon={<Bell size={18} />}
            label="Push notifications"
            value={pushNotifs}
            onChange={setPushNotifs}
          />
          <Toggle
            icon={<Mail size={18} />}
            label="Email alerts"
            value={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            icon={<span className="text-xs font-bold">SMS</span>}
            label="SMS notifications"
            value={smsNotifs}
            onChange={setSmsNotifs}
          />
          <Toggle
            icon={<Sparkle size={18} />}
            label="Marketing & promotions"
            value={marketing}
            onChange={setMarketing}
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <Toggle
            icon={<span>🌙</span>}
            label="Dark mode (coming soon)"
            value={darkMode}
            onChange={(v) => {
              setDarkMode(v);
              showToast("Dark mode coming in next update!", "info");
            }}
          />
          <Row
            icon={<span>🌍</span>}
            label="Language"
            value="English"
            onClick={() => navigate("languages")}
          />
          <Row
            icon={<span>💱</span>}
            label="Currency"
            value="KSh (KES)"
            onClick={() => showToast("Currency is locked to KES", "info")}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <div
            onClick={() => navigate("about")}
            className="flex cursor-pointer items-center gap-3 border-b border-slate-50 px-4 py-3.5 hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
              <img src="/logo.png" alt="GETON" className="h-9 w-9 object-cover" />
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-900">
              App version
            </span>
            <span className="text-xs text-slate-500">2.4.1</span>
          </div>
          <Row
            icon={<Info size={18} />}
            label="About GETON"
            onClick={() => navigate("about")}
          />
          <Row
            icon={<Info size={18} />}
            label="Terms of Service"
            onClick={() => navigate("terms")}
          />
          <Row
            icon={<Info size={18} />}
            label="Privacy Policy"
            onClick={() => navigate("privacy")}
          />
          <Row
            icon={<Info size={18} />}
            label="Open source licenses"
            onClick={() => navigate("licenses")}
          />
        </Section>

        {/* Data */}
        <Section title="Storage & Data">
          <Row
            icon={<span>🗂️</span>}
            label="Cache size"
            value="2.4 MB"
            onClick={() => showToast("Cache cleared!", "success")}
          />
          <Row
            icon={<span>📥</span>}
            label="Download my data"
            onClick={() =>
              showToast("Request submitted — check email", "success")
            }
          />
        </Section>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          GETON v2.4.1 • Build 240619
          <br />© 2026 GETON Financial Services Ltd.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {children}
      </div>
    </section>
  );
}

function Toggle({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition last:border-none hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-slate-900">{label}</span>
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

function Row({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition last:border-none enabled:hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-slate-900">{label}</span>
      {value && <span className="text-xs text-slate-500">{value}</span>}
      {onClick && <ChevronRight size={18} className="text-slate-400" />}
    </button>
  );
}
