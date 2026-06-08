import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Cash, ChevronRight, Shield, TrendingUp } from "../components/Icons";
import { cn } from "../utils/cn";

const slides = [
  {
    icon: Cash,
    title: "Get Cash Instantly",
    description:
      "Borrow up to KSh 250,000 at just 12% APR (1% per month) — the lowest rate in Kenya. Funds sent directly to your M-Pesa in 5 minutes.",
    color: "from-brand-500 to-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Build Your Credit",
    description:
      "Every on-time repayment improves your credit score and unlocks higher loan limits.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description:
      "Bank-grade encryption keeps your data safe. We are licensed and regulated by the CBK.",
    color: "from-indigo-500 to-violet-600",
  },
];

export function OnboardingScreen() {
  const { navigate } = useApp();
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const Icon = slide.icon;

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate("register");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-brand-600" : "w-1.5 bg-slate-200",
              )}
            />
          ))}
        </div>
        <button
          onClick={() => navigate("register")}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          Skip
        </button>
      </div>

      <div
        key={step}
        className="flex flex-1 flex-col items-center justify-center px-8 text-center animate-fade-in"
      >
        <div
          className={cn(
            "mb-10 flex h-44 w-44 items-center justify-center rounded-[2.5rem] bg-gradient-to-br shadow-2xl",
            slide.color,
          )}
        >
          <div className="absolute h-44 w-44 rounded-[2.5rem] bg-white/10 blur-2xl" />
          <Icon size={72} className="relative text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {slide.title}
        </h1>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-slate-500">
          {slide.description}
        </p>
      </div>

      <div className="space-y-3 px-6 pb-10">
        <button
          onClick={next}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          {step === slides.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => navigate("login")}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}
