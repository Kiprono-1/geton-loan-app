import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import {
  Check,
  Copy,
  Gift,
  Phone,
  Sparkle,
  TrendingUp,
} from "../components/Icons";
import { formatCurrency } from "../utils/format";

export function ReferralScreen() {
  const { user, showToast } = useApp();
  if (!user) return null;

  const code = "GETON" + user.fullName.split(" ")[0].toUpperCase().slice(0, 3) + "24";
  const link = `https://geton.co.ke/ref/${code}`;

  const stats = {
    invited: 0,
    successful: 0,
    earned: 0,
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(code);
    showToast("Code copied!", "success");
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Get a loan with GETON",
          text: `Use my code ${code} to get a KSh 500 bonus on your first loan!`,
          url: link,
        })
        .catch(() => showToast("Sharing cancelled", "info"));
    } else {
      navigator.clipboard?.writeText(link);
      showToast("Link copied!", "success");
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Refer & Earn" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Hero — sunset gradient */}
        <div className="bg-sunset relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-orange-500/30">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-yellow-300/30 blur-3xl" />
          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
              <Gift size={32} />
            </div>
            <p className="mt-3 text-sm opacity-90">Invite friends, earn up to</p>
            <p className="mt-1 text-4xl font-black tracking-tight">
              KSh 500
            </p>
            <p className="text-xs opacity-90">per successful referral</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatCard label="Invited" value={String(stats.invited)} icon={<Phone size={16} />} />
          <StatCard
            label="Successful"
            value={String(stats.successful)}
            icon={<Check size={16} />}
          />
          <StatCard
            label="Earned"
            value={formatCurrency(stats.earned)}
            icon={<TrendingUp size={16} />}
          />
        </div>

        {/* Referral code */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Your Referral Code
          </p>
          <button
            onClick={copyCode}
            className="mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-4"
          >
            <span className="text-2xl font-black tracking-wider text-brand-700">
              {code}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-brand-600">
              <Copy size={14} />
              COPY
            </span>
          </button>

          <button
            onClick={shareLink}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/30 transition active:scale-[0.98]"
          >
            <Sparkle size={16} />
            Share with friends
          </button>
        </section>

        {/* How it works */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">How it works</h3>
          <div className="mt-4 space-y-4">
            <Step
              num="1"
              title="Share your code"
              text="Send your unique code to friends via WhatsApp or SMS"
            />
            <Step
              num="2"
              title="They sign up & borrow"
              text="They get a KSh 500 bonus on their first loan"
            />
            <Step
              num="3"
              title="You earn KSh 500"
              text="Reward credited to your wallet after successful repayment"
            />
          </div>
        </section>

        {/* Terms */}
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
          <p className="text-xs leading-relaxed text-amber-900">
            💡 <strong>Pro tip:</strong> The more friends you invite, the more
            you earn. There's no limit to how much you can make!
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Terms apply. Reward credited 30 days after referee's first repayment.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <p className="mt-2 text-base font-bold text-slate-900">{value}</p>
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function Step({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
        {num}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}
