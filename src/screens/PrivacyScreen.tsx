import { TopBar } from "../components/TopBar";

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: "We collect personal data including: your name, phone number, National ID, KRA PIN, M-Pesa number, device information, IP address, location (with consent), and loan repayment history. We may also collect biometric data for identity verification with your explicit consent.",
  },
  {
    title: "2. How we use your data",
    body: "Your data is used to: (a) verify your identity; (b) assess your creditworthiness; (c) process loan applications and disbursements; (d) collect repayments; (e) detect and prevent fraud; (f) comply with legal and regulatory obligations; (g) improve our services.",
  },
  {
    title: "3. Legal basis (Data Protection Act 2019)",
    body: "We process your data under the following legal bases: contract performance (to provide loans), legal obligation (KYC, CRB reporting), legitimate interest (fraud prevention), and consent (marketing, location, biometrics).",
  },
  {
    title: "4. Sharing your data",
    body: "We share your data with: (a) licensed Credit Reference Bureaus (TransUnion, Metropol, Creditinfo); (b) M-Pesa via Paystack for STK Push payments and disbursements; (c) insurance partners; (d) law enforcement when required by law. We never sell your personal data.",
  },
  {
    title: "5. Data retention",
    body: "We retain your data for 7 years after your last transaction, as required by Kenyan law. Anonymized analytics data may be retained indefinitely.",
  },
  {
    title: "6. Your rights",
    body: "You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion (subject to legal retention); (d) object to processing; (e) withdraw consent; (f) lodge a complaint with the Office of the Data Protection Commissioner.",
  },
  {
    title: "7. Security",
    body: "We protect your data with 256-bit encryption, PCI-DSS Level 1 certification, ISO 27001 controls, regular security audits, and strict employee access controls.",
  },
  {
    title: "8. Cookies & tracking",
    body: "We use essential cookies for authentication and analytics cookies (with your consent) to understand app usage. You can manage cookie preferences in Settings → Privacy.",
  },
  {
    title: "9. International transfers",
    body: "Some of our service providers (cloud hosting, analytics) may process data outside Kenya. We ensure all transfers comply with Chapter VI of the Data Protection Act 2019.",
  },
  {
    title: "10. Contact our DPO",
    body: "For privacy-related questions, contact our Data Protection Officer at dpo@geton.co.ke or +254 709 100 200.",
  },
];

export function PrivacyScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Privacy Policy" showBack showBell={false} />

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
      </div>
    </div>
  );
}
