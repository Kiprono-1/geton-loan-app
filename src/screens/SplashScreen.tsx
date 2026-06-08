import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Logo } from "../components/Logo";

export function SplashScreen() {
  const { navigate, isAuthed } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(isAuthed ? "home" : "onboarding");
    }, 1200);
    return () => clearTimeout(t);
  }, [navigate, isAuthed]);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white"
      style={{ backgroundColor: "#0F0A2E" }}
    >
      {/* Background glow decorations matching the logo colors */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "#3B82F6" }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: "#EC4899" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <span className="absolute inset-0 animate-pulse-ring rounded-3xl bg-white/30" />
          <span
            className="absolute inset-0 animate-pulse-ring rounded-3xl bg-white/30"
            style={{ animationDelay: "0.4s" }}
          />
          <Logo size={112} className="relative shadow-2xl shadow-pink-500/30" />
        </div>
        <p className="mt-8 text-sm font-medium text-purple-200">
          Instant Loans. Anytime. Anywhere.
        </p>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
        <p className="text-xs text-purple-300/70">v2.4.1 • Licensed by CBK</p>
      </div>
    </div>
  );
}
