import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Camera, Check } from "../components/Icons";

const AVATARS = [
  { bg: "from-brand-500 to-emerald-600", initials: "AK" },
  { bg: "from-amber-400 to-orange-600", initials: "JD" },
  { bg: "from-indigo-500 to-violet-600", initials: "SM" },
  { bg: "from-pink-500 to-rose-600", initials: "FK" },
  { bg: "from-cyan-500 to-blue-600", initials: "TM" },
  { bg: "from-purple-500 to-fuchsia-600", initials: "WN" },
];

export function EditProfilePhotoScreen() {
  const { user, back, showToast } = useApp();
  const [selected, setSelected] = useState(0);

  if (!user) return null;

  const save = () => {
    showToast("Profile photo updated!", "success");
    back();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Edit Profile Photo" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <p className="mb-3 text-xs text-slate-500">
          Choose an avatar style. Camera capture coming soon.
        </p>

        {/* Current */}
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Current
          </p>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-2xl font-black text-white shadow-lg ${
                AVATARS[selected].bg
              }`}
            >
              {AVATARS[selected].initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
              <p className="text-xs text-slate-500">
                Choose a new style below
              </p>
            </div>
          </div>
        </section>

        {/* Take photo (disabled) */}
        <button
          disabled
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 text-left opacity-60"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Camera size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Take a photo
            </p>
            <p className="text-[11px] text-slate-500">Coming soon</p>
          </div>
        </button>

        {/* Avatars */}
        <section className="mt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Choose avatar
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {AVATARS.map((a, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br text-3xl font-black text-white shadow-md transition ${
                  selected === i
                    ? `${a.bg} ring-4 ring-brand-400 ring-offset-2`
                    : `${a.bg} opacity-90`
                }`}
              >
                {a.initials}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={save}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          <Check size={18} strokeWidth={3} />
          Save Photo
        </button>
      </div>
    </div>
  );
}
