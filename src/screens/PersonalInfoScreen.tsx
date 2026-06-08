import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check, Mail, Phone, User as UserIcon } from "../components/Icons";

export function PersonalInfoScreen() {
  const { user, updateUser, showToast, back, navigate } = useApp();

  const [name, setName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [nationalId, setNationalId] = useState(user?.nationalId ?? "");
  const [kraPin, setKraPin] = useState(user?.kraPin ?? "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateUser({
        fullName: name,
        email,
        phone,
        nationalId,
        kraPin,
      });
      setLoading(false);
      showToast("Profile updated successfully!", "success");
      back();
    }, 900);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Personal Information" showBack showBell={false} />

      <form
        onSubmit={save}
        className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-2 no-scrollbar"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center pb-4 pt-2">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-emerald-600 text-2xl font-bold text-white shadow-lg">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <button
              type="button"
              onClick={() => navigate("edit-profile-photo")}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-2 ring-white"
            >
              ✏️
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Field
            icon={<UserIcon size={18} />}
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="John Doe"
          />
          <Field
            icon={<Mail size={18} />}
            label="Email Address"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="you@email.co.ke"
          />
          <Field
            icon={<Phone size={18} />}
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            type="tel"
            placeholder="+254 7XX XXX XXX"
          />
          <Field
            icon={<span className="text-xs font-bold">ID</span>}
            label="National ID Number"
            value={nationalId}
            onChange={setNationalId}
            placeholder="12345678"
            inputMode="numeric"
          />
          <Field
            icon={<span className="text-xs font-bold">KRA</span>}
            label="KRA PIN (optional)"
            value={kraPin}
            onChange={setKraPin}
            placeholder="A001234567Z"
          />
        </div>

        <div className="mt-auto pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                <Check size={18} strokeWidth={3} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
        <span className="flex h-6 w-6 items-center justify-center text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
