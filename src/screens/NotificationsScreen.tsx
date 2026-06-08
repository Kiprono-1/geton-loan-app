import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Bell, Check, Info, Sparkle, Warning } from "../components/Icons";
import { formatRelative } from "../utils/format";
import { cn } from "../utils/cn";

export function NotificationsScreen() {
  const { notifications, markAllNotificationsRead } = useApp();

  useEffect(() => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Notifications" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {notifications.length > 0 ? (
          <div className="space-y-2.5">
            {notifications.map((n) => {
              const meta = typeMeta[n.type];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1",
                    n.read ? "ring-slate-100" : "ring-brand-200",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                      meta.bg,
                      meta.text,
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {n.message}
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      {formatRelative(n.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <Bell size={36} className="text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No notifications
            </h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const typeMeta = {
  success: { icon: Check, bg: "bg-emerald-50", text: "text-emerald-600" },
  info: { icon: Info, bg: "bg-blue-50", text: "text-blue-600" },
  warning: { icon: Warning, bg: "bg-amber-50", text: "text-amber-600" },
  alert: { icon: Sparkle, bg: "bg-rose-50", text: "text-rose-600" },
} as const;


