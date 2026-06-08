import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { cn } from "../utils/cn";

interface Toggle {
  key: string;
  title: string;
  description: string;
  required?: boolean;
  defaultOn?: boolean;
}

const TOGGLES: Toggle[] = [
  {
    key: "analytics",
    title: "Anonymous analytics",
    description: "Help us improve the app by sharing anonymous usage data.",
    defaultOn: true,
  },
  {
    key: "crash",
    title: "Crash reports",
    description: "Automatically send crash reports so we can fix bugs faster.",
    defaultOn: true,
  },
  {
    key: "personalized",
    title: "Personalized offers",
    description: "Receive loan offers tailored to your financial profile.",
    defaultOn: true,
  },
  {
    key: "research",
    title: "Market research",
    description: "Participate in surveys to help shape our products.",
  },
  {
    key: "thirdParty",
    title: "Third-party integrations",
    description: "Allow data sharing with verified partner services.",
  },
  {
    key: "creditBureau",
    title: "Credit Bureau data",
    description: "Share repayment history with licensed CRBs (required by law).",
    required: true,
  },
];

export function DataSharingScreen() {
  const { back, showToast } = useApp();
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.key, !!t.defaultOn])),
  );

  const save = () => {
    showToast("Privacy preferences saved", "success");
    back();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Data Sharing Preferences" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <p className="text-xs leading-relaxed text-blue-900">
            You have full control over your data. Toggle off anything you don't
            want to share. Required items cannot be disabled.
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          {TOGGLES.map((t) => {
            const on = state[t.key];
            return (
              <div
                key={t.key}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">
                        {t.title}
                      </p>
                      {t.required && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                          REQUIRED
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {t.description}
                    </p>
                  </div>
                  <button
                    disabled={t.required}
                    onClick={() =>
                      setState((s) => ({ ...s, [t.key]: !s[t.key] }))
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition disabled:opacity-60",
                      on ? "bg-brand-600" : "bg-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                        on ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={save}
          className="w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
