import { useApp } from "../context/AppContext";
import { cn } from "../utils/cn";
import { Check, Info, X } from "./Icons";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const styles = {
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-slate-900 text-white",
  };
  const Icon = toast.type === "success" ? Check : toast.type === "error" ? X : Info;

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[100] -translate-x-1/2 animate-slide-up">
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-2xl shadow-black/20",
          styles[toast.type],
        )}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
