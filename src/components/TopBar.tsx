import { useApp } from "../context/AppContext";
import { Bell, ChevronLeft } from "./Icons";
import { Logo } from "./Logo";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showBell?: boolean;
  variant?: "default" | "transparent" | "brand";
  rightElement?: React.ReactNode;
}

export function TopBar({
  title,
  showBack = false,
  showBell = true,
  variant = "default",
  rightElement,
}: TopBarProps) {
  const { back, navigate, notifications } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  const bg =
    variant === "brand"
      ? "bg-transparent text-white"
      : variant === "transparent"
        ? "bg-transparent text-slate-900"
        : "bg-white text-slate-900 border-b border-slate-100";

  return (
    <div
      className={`sticky top-16 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 ${bg}`}
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={back}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 ${
              variant === "brand"
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <Logo size={40} className="shadow-md shadow-pink-500/20" />
        )}
        {title && <h1 className="text-base font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        {showBell && (
          <button
            onClick={() => navigate("notifications")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 ${
              variant === "brand"
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
