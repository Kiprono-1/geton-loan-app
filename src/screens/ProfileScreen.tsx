import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Bank,
  Bell,
  Calculator,
  ChartLine,
  ChevronRight,
  Gift,
  Headset,
  Help,
  Info,
  Language,
  Lock,
  Logout,
  MapPin,
  Settings,
  Share,
  Shield,
  Star,
  User,
} from "../components/Icons";

export function ProfileScreen() {
  const { user, logout, navigate } = useApp();
  if (!user) return null;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Profile" />

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {/* Profile card — aurora gradient */}
        <button
          onClick={() => navigate("edit-profile-photo")}
          className="bg-aurora-soft relative w-full overflow-hidden rounded-3xl p-5 text-left text-white shadow-lg shadow-emerald-950/30 active:scale-[0.99]"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">{user.fullName}</p>
              <p className="text-xs text-emerald-100">{user.email}</p>
              <p className="text-[11px] text-emerald-100/80">{user.phone}</p>
            </div>
            <ChevronRight size={20} className="opacity-70" />
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
            <Stat
              label="Credit Score"
              value={String(user.creditScore)}
              onClick={() => navigate("kyc")}
            />
            <Stat
              label="KYC Level"
              value={`Tier ${user.kycLevel}`}
              onClick={() => navigate("kyc")}
            />
            <Stat
              label="Member since"
              value={new Date(user.joinedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            />
          </div>
        </button>

        {/* Quick links — 4-up grid */}
        <section className="mt-5">
          <div className="grid grid-cols-4 gap-2.5">
            <QuickLink
              icon={<Gift size={20} />}
              label="Refer"
              color="bg-pink-500"
              onClick={() => navigate("referral")}
            />
            <QuickLink
              icon={<ChartLine size={20} />}
              label="Activity"
              color="bg-indigo-500"
              onClick={() => navigate("transactions")}
            />
            <QuickLink
              icon={<Calculator size={20} />}
              label="Calculator"
              color="bg-amber-500"
              onClick={() => navigate("loan-apply")}
            />
            <QuickLink
              icon={<Headset size={20} />}
              label="Support"
              color="bg-emerald-500"
              onClick={() => navigate("support")}
            />
          </div>
        </section>

        {/* Refer & earn */}
        <button
          onClick={() => navigate("referral")}
          className="bg-sunset mt-5 flex w-full items-center gap-3 overflow-hidden rounded-3xl p-4 text-left text-white shadow-md shadow-orange-500/30 transition active:scale-[0.99]"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Gift size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Refer friends, earn KSh 500</p>
            <p className="text-xs opacity-90">Share your unique referral code</p>
          </div>
          <ChevronRight size={20} className="opacity-80" />
        </button>

        {/* Account section */}
        <Section title="Account">
          <Item
            icon={<User size={20} />}
            label="Personal Information"
            onClick={() => navigate("personal-info")}
          />
          <Item
            icon={<Shield size={20} />}
            label="Identity Verification"
            badge={`Tier ${user.kycLevel}`}
            onClick={() => navigate("kyc")}
          />
          <Item
            icon={<Bank size={20} />}
            label="M-Pesa & Bank"
            onClick={() => navigate("payment-methods")}
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <Item
            icon={<Bell size={20} />}
            label="Notifications"
            onClick={() => navigate("notifications")}
          />
          <Item
            icon={<Lock size={20} />}
            label="Security & Privacy"
            onClick={() => navigate("security")}
          />
          <Item
            icon={<Settings size={20} />}
            label="App Settings"
            onClick={() => navigate("settings")}
          />
          <Item
            icon={<Language size={20} />}
            label="Language"
            value="English"
            onClick={() => navigate("languages")}
          />
        </Section>

        {/* Support section */}
        <Section title="Support">
          <Item
            icon={<Help size={20} />}
            label="Help Center"
            onClick={() => navigate("support")}
          />
          <Item
            icon={<Headset size={20} />}
            label="Contact Us"
            onClick={() => navigate("contact")}
          />
          <Item
            icon={<MapPin size={20} />}
            label="Find a branch"
            onClick={() => navigate("contact")}
          />
          <Item
            icon={<Star size={20} />}
            label="Rate GETON"
            onClick={() => navigate("rate-app")}
          />
          <Item
            icon={<Share size={20} />}
            label="Share with friends"
            onClick={() => navigate("referral")}
          />
        </Section>

        {/* About section */}
        <Section title="About">
          <Item
            icon={<Info size={20} />}
            label="About GETON"
            onClick={() => navigate("about")}
          />
          <Item
            icon={<Info size={20} />}
            label="Terms of Service"
            onClick={() => navigate("terms")}
          />
          <Item
            icon={<Info size={20} />}
            label="Privacy Policy"
            onClick={() => navigate("privacy")}
          />
          <Item
            icon={<Info size={20} />}
            label="Open source licenses"
            onClick={() => navigate("licenses")}
          />
          <Item
            icon={<Info size={20} />}
            label="App version"
            value="2.4.1"
          />
        </Section>

        <button
          onClick={logout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100"
        >
          <Logout size={18} />
          Log out
        </button>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          GETON Financial Services Ltd. • CR No. 234567
          <br />
          Licensed by the Central Bank of Kenya
        </p>
      </div>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
        {children}
      </div>
    </section>
  );
}

function Item({
  icon,
  label,
  badge,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition last:border-none hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-slate-900">{label}</span>
      {value && <span className="text-xs text-slate-500">{value}</span>}
      {badge && (
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
          {badge}
        </span>
      )}
      <ChevronRight size={18} className="text-slate-400" />
    </button>
  );
}

function QuickLink({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100 transition active:scale-95"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${color}`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
    </button>
  );
}

function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left transition active:opacity-60"
    >
      <p className="text-[11px] text-emerald-100/80">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </button>
  );
}


