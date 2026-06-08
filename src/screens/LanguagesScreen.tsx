import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check } from "../components/Icons";
import { cn } from "../utils/cn";

const LANGUAGES = [
  { code: "en", name: "English", local: "English", flag: "🇬🇧" },
  { code: "sw", name: "Kiswahili", local: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", name: "French", local: "Français", flag: "🇫🇷", soon: true },
  { code: "ar", name: "Arabic", local: "العربية", flag: "🇸🇦", soon: true },
  { code: "am", name: "Amharic", local: "አማርኛ", flag: "🇪🇹", soon: true },
  { code: "ha", name: "Hausa", local: "Hausa", flag: "🇳🇬", soon: true },
  { code: "yo", name: "Yoruba", local: "Yorùbá", flag: "🇳🇬", soon: true },
  { code: "ig", name: "Igbo", local: "Igbo", flag: "🇳🇬", soon: true },
  { code: "zu", name: "Zulu", local: "isiZulu", flag: "🇿🇦", soon: true },
];

export function LanguagesScreen() {
  const { back, showToast } = useApp();
  const [selected, setSelected] = useState("en");

  const save = () => {
    const lang = LANGUAGES.find((l) => l.code === selected);
    if (lang?.soon) {
      showToast("This language is coming soon!", "info");
      return;
    }
    showToast(`Language set to ${lang?.name}`, "success");
    back();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Language" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <p className="mb-3 text-xs text-slate-500">
          Choose your preferred language. Affects app text, notifications, and
          SMS messages.
        </p>

        <div className="space-y-2">
          {LANGUAGES.map((l) => {
            const isSelected = selected === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelected(l.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 transition active:scale-[0.99]",
                  isSelected ? "ring-brand-300 bg-brand-50" : "ring-slate-100",
                )}
              >
                <div className="text-2xl">{l.flag}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">
                      {l.name}
                    </p>
                    {l.soon && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                        SOON
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{l.local}</p>
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                    <Check size={14} strokeWidth={3} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={save}
          className="w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          Apply Language
        </button>
      </div>
    </div>
  );
}
