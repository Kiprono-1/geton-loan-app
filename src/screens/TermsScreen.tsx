import { TopBar } from "../components/TopBar";

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By creating an account with GETON Financial Services Ltd. (\"GETON\"), you confirm that you are at least 18 years old, a Kenyan resident, and agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.",
  },
  {
    title: "2. Eligibility",
    body: "To use GETON, you must: (a) be a Kenyan resident with a valid National ID; (b) have an active M-Pesa registered in your name; (c) provide truthful and accurate information during registration; (d) have no history of fraud or default with any digital lender.",
  },
  {
    title: "3. Loans & Activation Fee",
    body: "GETON offers short-term loans from KSh 500 to KSh 250,000. Each loan requires a one-time, non-refundable activation fee paid before disbursement. The activation fee covers KYC verification, loan processing, and insurance. Activation fees are clearly displayed before payment.",
  },
  {
    title: "4. Interest & Repayment",
    body: "Interest is charged at a flat monthly rate of 1% on the outstanding principal (12% APR) for standard customers. Premium KYC Tier 3 customers enjoy 0.8% (9.6% APR), and VIP customers with 5+ repaid loans enjoy 0.5% (6% APR) — the lowest rate in Kenya. Repayment is due in equal monthly installments over the agreed tenure. Late repayment incurs a 3% penalty on the overdue amount (with a 3-day grace period). Full early repayment is allowed at any time without penalty.",
  },
  {
    title: "5. Credit Reporting",
    body: "GETON is required to report your loan performance to licensed Credit Reference Bureaus (CRBs) in Kenya. Default on repayment may negatively impact your credit score and future borrowing ability.",
  },
  {
    title: "6. Data & Privacy",
    body: "We collect and process your personal data in accordance with the Kenyan Data Protection Act 2019. Your data is used for KYC verification, credit scoring, fraud prevention, and regulatory reporting. We do not sell your personal data to third parties.",
  },
  {
    title: "7. Account suspension",
    body: "GETON reserves the right to suspend or terminate your account if we suspect fraudulent activity, identity theft, or violation of these terms. We will notify you in writing within 14 days of any such action.",
  },
  {
    title: "8. Limitation of liability",
    body: "GETON is not liable for any indirect, incidental, or consequential damages arising from use of the Service. Our maximum liability is limited to the total fees paid by you in the 12 months preceding the claim.",
  },
  {
    title: "9. Governing law",
    body: "These terms are governed by the laws of the Republic of Kenya. Any disputes will be resolved by the Kenyan courts.",
  },
  {
    title: "10. Changes to terms",
    body: "GETON may update these terms from time to time. Material changes will be communicated via in-app notification and SMS at least 30 days before they take effect.",
  },
];

export function TermsScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Terms of Service" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <p className="text-xs text-slate-500">
          Last updated: June 15, 2026
        </p>

        <div className="mt-4 space-y-3">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
            >
              <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Questions? Contact us at legal@geton.co.ke
        </p>
      </div>
    </div>
  );
}
