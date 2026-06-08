import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Smartphone, Monitor, MapPin } from "../components/Icons";

interface Session {
  device: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  current?: boolean;
}

const sessions: Session[] = [
  {
    device: "iPhone 14 Pro",
    os: "iOS 17.4 • Safari",
    location: "Westlands, Nairobi",
    ip: "197.232.x.x",
    lastActive: "Now",
    current: true,
  },
  {
    device: "MacBook Pro",
    os: "macOS 14.3 • Chrome",
    location: "Westlands, Nairobi",
    ip: "197.232.x.x",
    lastActive: "2h ago",
  },
  {
    device: "Samsung Galaxy A54",
    os: "Android 14 • GETON App",
    location: "Mombasa Road, Nairobi",
    ip: "105.161.x.x",
    lastActive: "Yesterday",
  },
];

export function LoginActivityScreen() {
  const { showToast } = useApp();

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Login Activity" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <p className="mb-3 text-xs text-slate-500">
          {sessions.length} active sessions. If you see anything unfamiliar, log
          out and change your password.
        </p>

        <div className="space-y-2.5">
          {sessions.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  {s.os.toLowerCase().includes("ios") ||
                  s.os.toLowerCase().includes("android") ? (
                    <Smartphone size={20} />
                  ) : (
                    <Monitor size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">
                      {s.device}
                    </p>
                    {s.current && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        THIS DEVICE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{s.os}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin size={11} />
                    <span>
                      {s.location} • {s.ip}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-brand-600">
                    Active {s.lastActive}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() =>
                    showToast(`Logged out of ${s.device}`, "success")
                  }
                  className="mt-3 w-full rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  Log out of this device
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => showToast("All other sessions logged out", "success")}
          className="mt-5 w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-95"
        >
          Log out of all other devices
        </button>
      </div>
    </div>
  );
}
