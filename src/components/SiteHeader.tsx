import { useApp } from "../context/AppContext";
import { Logo } from "./Logo";
import { Bell, ChevronDown, Logout } from "./Icons";
import { useState, useRef, useEffect } from "react";

/**
 * Top-of-page website header. Sticky, with a desktop nav, user menu,
 * and a notification bell. Hidden on the splash/onboarding/auth screens.
 */
export function SiteHeader() {
  const { user, navigate, logout, notifications } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5 transition active:scale-95"
          aria-label="GETON home"
        >
          <Logo size={36} className="shadow-md shadow-pink-500/20" />
          <div className="hidden text-left sm:block">
            <p className="text-base font-black tracking-tight text-slate-900">
              GETON
            </p>
            <p className="text-[10px] font-medium text-slate-500">
              Instant Loans on M-Pesa
            </p>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink label="Home" screen="home" />
          <NavLink label="Loans" screen="loans" />
          <NavLink label="Wallet" screen="wallet" />
          <NavLink label="Refer" screen="referral" />
          <NavLink label="Support" screen="support" />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate("notifications")}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-3 transition hover:bg-slate-200"
                  aria-label="User menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 text-xs font-bold text-white">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <span className="hidden text-sm font-semibold text-slate-900 sm:inline">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-500 transition ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 animate-fade-in">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-slate-100" />
                    <MenuItem
                      label="Profile"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("profile");
                      }}
                    />
                    <MenuItem
                      label="Wallet"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("wallet");
                      }}
                    />
                    <MenuItem
                      label="Transactions"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("transactions");
                      }}
                    />
                    <MenuItem
                      label="Settings"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("settings");
                      }}
                    />
                    <div className="my-1 h-px bg-slate-100" />
                    <MenuItem
                      label="Log out"
                      icon={<Logout size={16} />}
                      danger
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("login")}
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("register")}
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-600/30 transition active:scale-95"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ label, screen }: { label: string; screen: string }) {
  const { navigate, screen: current } = useApp();
  const active = current === screen;
  return (
    <button
      onClick={() => navigate(screen as never)}
      className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "text-brand-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-brand-600" />
      )}
    </button>
  );
}

function MenuItem({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
