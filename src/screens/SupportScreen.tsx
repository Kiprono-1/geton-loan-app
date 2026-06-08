import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { ChevronRight, Help, Mail, Phone } from "../components/Icons";
import { cn } from "../utils/cn";

const faqs = [
  {
    q: "Why do I need to pay activation fees?",
    a: "Activation fees cover processing, mandatory KYC verification through IPRS and CRB, and insurance against default. These regulatory fees are required before any loan can be disbursed.",
  },
  {
    q: "When will my loan be disbursed?",
    a: "Loans are sent to your M-Pesa instantly upon successful payment of all activation fees. You'll receive an M-Pesa confirmation SMS within seconds.",
  },
  {
    q: "Are the activation fees refundable?",
    a: "No. Activation fees are non-refundable as they cover services provided by third parties (CRB, IPRS, insurance provider, Paystack).",
  },
  {
    q: "Is GETON licensed?",
    a: "Yes. GETON is licensed and regulated by the Central Bank of Kenya (CBK) under the Digital Credit Providers Regulations 2022 and complies with the Data Protection Act 2019.",
  },
  {
    q: "How do I repay my loan?",
    a: "Repayments are made via M-Pesa STK Push from your phone (Paystack prompts you to enter your M-Pesa PIN on the due date). You can also repay early from your wallet to save on interest.",
  },
  {
    q: "What is the interest rate?",
    a: "GETON has the LOWEST rates in Kenya — just 12% APR! Standard: 1% / month (12% APR). Premium KYC Tier 3 (KRA PIN): 0.8% / month (9.6% APR). VIP customers (5+ repaid loans): 0.5% / month (6% APR) — our absolute lowest. For example, a KSh 10,000 loan over 3 months at 1%/month has a total repayment of KSh 10,300. By choosing GETON, you save up to 93% vs. the industry average of 15% per month (180% APR).",
  },
  {
    q: "What if I repay late?",
    a: "We give you a 3-day grace period after your due date. After that, a fair 3% penalty applies to the overdue amount (reduced from 5%). We send free SMS reminders 3 days and 1 day before your due date. Always communicate with us — we can usually help.",
  },
];

export function SupportScreen() {
  const { showToast } = useApp();

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Help & Support" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        {/* Contact options */}
        <div className="grid grid-cols-2 gap-3">
          <ContactCard
            icon={<Phone size={22} className="text-white" />}
            color="bg-brand-500"
            title="Call Us"
            subtitle="0709 123 456"
            onClick={() => showToast("Calling support…", "info")}
          />
          <ContactCard
            icon={<Mail size={22} className="text-white" />}
            color="bg-indigo-500"
            title="Email"
            subtitle="help@geton.co.ke"
            onClick={() => showToast("Opening email…", "info")}
          />
        </div>

        {/* Live chat */}
        <button
          onClick={() => showToast("Live chat opening…", "info")}
          className="bg-aurora-soft mt-3 flex w-full items-center gap-3 rounded-2xl p-4 text-left text-white shadow-md shadow-emerald-500/30 transition active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Help size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Chat with support</p>
            <p className="text-xs opacity-90">Average response: 2 mins • 24/7</p>
          </div>
          <ChevronRight size={20} className="opacity-80" />
        </button>

        {/* FAQs */}
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          GETON Financial Services Ltd. • CR No. 234567
          <br />
          Licensed by the Central Bank of Kenya
          <br />
          Westlands, Nairobi
        </p>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  color,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:ring-brand-300 active:scale-[0.99]"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        <ChevronRight
          size={18}
          className={cn(
            "flex-shrink-0 text-slate-400 transition-transform",
            open && "rotate-90",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-700 animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}
