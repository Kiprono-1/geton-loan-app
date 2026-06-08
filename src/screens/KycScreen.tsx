import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Bank,
  Check,
  ChevronRight,
  Phone,
  Shield,
  User,
} from "../components/Icons";

const tiers = [
  {
    level: 1,
    name: "Basic",
    limit: "KSh 50,000",
    items: ["Email verified", "Phone verified"],
    done: 2,
    total: 2,
  },
  {
    level: 2,
    name: "Verified",
    limit: "KSh 150,000",
    items: ["National ID linked", "M-Pesa added", "Selfie verification"],
    done: 0,
    total: 3,
  },
  {
    level: 3,
    name: "Premium",
    limit: "KSh 250,000",
    items: ["KRA PIN verified", "Bank statement", "Proof of address"],
    done: 0,
    total: 3,
  },
];

export function KycScreen() {
  const { user, navigate } = useApp();
  if (!user) return null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Identity Verification" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Current tier */}
        <div className="bg-aurora-soft relative overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-100/80">
                Current Tier
              </p>
              <p className="text-lg font-bold">
                Tier {user.kycLevel} • Basic
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-emerald-100">Loan limit</p>
          <p className="text-2xl font-bold">KSh 250,000</p>
        </div>

        {/* Tier list */}
        <section className="mt-5 space-y-3">
          {tiers.map((t) => {
            const pct = (t.done / t.total) * 100;
            const isCurrent = t.level === user.kycLevel;
            return (
              <div
                key={t.level}
                className="overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tier {t.level}
                    </p>
                    <p className="text-base font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">Limit: {t.limit}</p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {t.done}/{t.total} DONE
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <ul className="mt-3 space-y-2">
                  {t.items.map((it, i) => {
                    const done = i < t.done;
                    return (
                      <li
                        key={it}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            done
                              ? "bg-brand-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {done && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span
                          className={
                            done
                              ? "text-slate-900 line-through opacity-70"
                              : "text-slate-700"
                          }
                        >
                          {it}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>

        {/* Quick verify actions */}
        <section className="mt-5">
          <h3 className="mb-2.5 text-sm font-bold text-slate-900">
            Verify Now
          </h3>
          <div className="space-y-2.5">
            <Action
              icon={<User size={20} />}
              title="Link your National ID"
              subtitle="Required for higher limits"
              onClick={() => navigate("kyc-id")}
            />
            <Action
              icon={<Phone size={20} />}
              title="Link M-Pesa Number"
              subtitle="For seamless disbursement"
              onClick={() => navigate("kyc-mpesa")}
            />
            <Action
              icon={<Bank size={20} />}
              title="Add KRA PIN"
              subtitle="Required for premium tier"
              onClick={() => navigate("kyc-kra")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Action({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-brand-300 active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-slate-400" />
    </button>
  );
}
