import { useApp } from "../context/AppContext";
import { Logo } from "./Logo";
import { Mail, Phone, MapPin } from "./Icons";

/**
 * Site-wide footer with company info, link columns, and contact details.
 * Useful for SEO and trust signals. Hidden on splash/onboarding/auth.
 */
export function SiteFooter() {
  const { navigate } = useApp();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={36} className="shadow-md shadow-pink-500/20" />
              <p className="text-lg font-black tracking-tight">GETON</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Instant loans sent directly to your M-Pesa. Licensed by the
              Central Bank of Kenya.
            </p>
            <p className="mt-3 text-xs font-semibold text-emerald-600">
              CBK Licensed • CR No. 234567
            </p>
          </div>

          {/* Products */}
          <FooterCol
            title="Products"
            links={[
              { label: "Quick Cash Loan", screen: "loan-apply" },
              { label: "Salary Advance", screen: "loan-apply" },
              { label: "Biashara Loan", screen: "loan-apply" },
              { label: "Wallet", screen: "wallet" },
            ]}
            onNav={(s) => navigate(s as never)}
          />

          {/* Company */}
          <FooterCol
            title="Company"
            links={[
              { label: "About GETON", screen: "about" },
              { label: "Help Center", screen: "support" },
              { label: "Contact", screen: "contact" },
              { label: "Refer & earn", screen: "referral" },
            ]}
            onNav={(s) => navigate(s as never)}
          />

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Contact
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>0709 123 456</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>help@geton.co.ke</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span>
                  Westlands Square, 5th Fl
                  <br />
                  Ring Road, Nairobi
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 GETON Financial Services Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("terms")}
              className="hover:text-slate-900"
            >
              Terms
            </button>
            <button
              onClick={() => navigate("privacy")}
              className="hover:text-slate-900"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate("licenses")}
              className="hover:text-slate-900"
            >
              Licenses
            </button>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              v2.4.1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  onNav,
}: {
  title: string;
  links: { label: string; screen: string }[];
  onNav: (s: string) => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <button
              onClick={() => onNav(l.screen)}
              className="text-slate-600 transition hover:text-brand-600"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
