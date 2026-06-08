import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Check, Copy, Lock, Phone, Shield } from "../components/Icons";
import { formatCurrency } from "../utils/format";
import { cn } from "../utils/cn";
import { api, ApiError } from "../lib/api";

/**
 * Single payment method: Paystack M-Pesa STK Push.
 * User enters their M-Pesa number; we call the real API which triggers
 * a Paystack charge, pushing an M-Pesa prompt to their phone via Daraja.
 */
export function PaymentScreen() {
  const { currentLoan, navigate, payActivationFee, addTransaction, showToast } = useApp();
  const [mpesaPhone, setMpesaPhone] = useState("+254 712 345 678");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!currentLoan) return null;

  const totalAmount = currentLoan.activationFee;
  const validPhone = mpesaPhone.replace(/\D/g, "").length >= 10;

  const copyAccount = () => {
    navigator.clipboard?.writeText("GETON001");
    showToast("Account number copied", "success");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPhone) { showToast("Enter a valid M-Pesa number", "error"); return; }
    if (!agree) { showToast("Please accept the terms first", "error"); return; }
    if (!currentLoan.id) { showToast("Loan not found. Please try again.", "error"); return; }

    setLoading(true);
    navigate("payment-processing");

    try {
      // Initiate real Paystack M-Pesa STK push
      const result = await api.payments.initiateActivation({
        loanId: currentLoan.id,
        phone: mpesaPhone.replace(/\s/g, ""),
      });

      // Poll for completion (webhook updates server; we poll until success/fail)
      let attempts = 0;
      const maxAttempts = 24; // 2 minutes (5s × 24)
      const poll = setInterval(async () => {
        attempts++;
        try {
          const status = await api.payments.verify(result.reference);
          if (status.status === "success") {
            clearInterval(poll);
            payActivationFee();
            addTransaction({
              type: "fee",
              description: `Loan activation fee (${formatCurrency(currentLoan.amount)} loan)`,
              amount: totalAmount,
              status: "successful",
            });
            navigate("payment-success");
          } else if (status.status === "failed" || status.status === "abandoned") {
            clearInterval(poll);
            showToast("Payment failed or cancelled. Please try again.", "error");
            navigate("payment");
          } else if (attempts >= maxAttempts) {
            clearInterval(poll);
            showToast("Payment timed out. Check your M-Pesa and try again.", "error");
            navigate("payment");
          }
        } catch {
          // ignore poll errors — keep trying
        }
      }, 5000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not initiate payment. Try again.";
      showToast(msg, "error");
      navigate("payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Pay Activation Fee" showBack showBell={false} />

      <form onSubmit={handlePay} className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="flex-1 px-5 pb-6 pt-2">
          {/* Amount due — aurora gradient */}
          <div className="bg-aurora-soft relative overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-emerald-950/30">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/25 blur-2xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-wide text-emerald-100/80">
                One-Time Activation Fee
              </p>
              <p className="mt-1 text-4xl font-black tracking-tight">
                {formatCurrency(totalAmount)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-100">
                <Lock size={12} />
                <span>Paystack M-Pesa STK Push</span>
              </div>
              <div className="mt-3 rounded-xl bg-white/15 p-3 backdrop-blur">
                <p className="text-[11px] text-emerald-50">
                  ✓ Unlocks {formatCurrency(currentLoan.amount)} loan to your M-Pesa
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              How M-Pesa STK Push works
            </h3>
            <ol className="mt-3 space-y-3">
              <Step
                num="1"
                text="Enter the M-Pesa number registered in your name"
              />
              <Step
                num="2"
                text="Tap Pay — we'll push an M-Pesa prompt to your phone"
              />
              <Step
                num="3"
                text="Enter your M-Pesa PIN to confirm the payment"
              />
            </ol>
          </section>

          {/* M-Pesa STK Push — the only method */}
          <section className="mt-5">
            <h3 className="mb-2.5 text-sm font-bold text-slate-900">
              Payment Method
            </h3>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-2 ring-brand-200">
              {/* M-Pesa branded header */}
              <div className="bg-aurora-soft relative flex items-center gap-3 p-4 text-white">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-emerald-700 shadow-md">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">M-Pesa STK Push</p>
                  <p className="text-[11px] opacity-90">
                    Powered by Paystack & Safaricom Daraja
                  </p>
                </div>
                <span className="rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Phone input */}
              <div className="space-y-4 p-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    M-Pesa Phone Number
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
                    <Phone size={18} className="text-slate-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {validPhone && (
                      <Check size={18} className="text-emerald-500" strokeWidth={3} />
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Must be registered in your name on M-Pesa
                  </p>
                </div>

                {/* Manual fallback */}
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    STK Push not working? Pay manually
                  </p>
                  <div className="mt-2 space-y-2">
                    <Detail label="Paybill" value="247247" copy />
                    <Detail
                      label="Account"
                      value="GETON001"
                      onCopy={copyAccount}
                    />
                    <Detail label="Amount" value={formatCurrency(totalAmount)} />
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                    After paying, tap the button below to confirm.
                  </p>
                </div>

                {/* Consent */}
                <label className="flex items-start gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setAgree((a) => !a)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition",
                      agree
                        ? "border-brand-600 bg-brand-600"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {agree && <Check size={12} strokeWidth={3} className="text-white" />}
                  </button>
                  <span className="text-[11px] leading-relaxed text-slate-600">
                    I authorize Paystack to debit {formatCurrency(totalAmount)}{" "}
                    from my M-Pesa for the loan activation fee. I understand
                    this fee is non-refundable.
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Trust */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Shield size={12} className="text-brand-600" />
            <span>256-bit encryption • PCI-DSS • CBK regulated</span>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4">
          <button
            type="submit"
            disabled={!validPhone || !agree || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            <Phone size={18} />
            Pay {formatCurrency(totalAmount)} via M-Pesa
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            You'll receive an M-Pesa prompt on your phone
          </p>
        </div>
      </form>
    </div>
  );
}

function Step({ num, text }: { num: string; text: string }) {
  return (
    <li className="flex gap-2.5 text-sm text-slate-700">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
        {num}
      </span>
      <span className="text-[12px] leading-relaxed">{text}</span>
    </li>
  );
}

function Detail({
  label,
  value,
  copy,
  onCopy,
}: {
  label: string;
  value: string;
  copy?: boolean;
  onCopy?: () => void;
}) {
  const { showToast } = useApp();
  return (
    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-1.5 last:border-none last:pb-0">
      <span className="text-xs text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => {
          if (onCopy) {
            onCopy();
          } else if (copy) {
            navigator.clipboard?.writeText(value);
            showToast("Copied to clipboard", "success");
          }
        }}
        className={cn(
          "flex items-center gap-1.5 text-sm font-bold text-slate-900",
          (copy || onCopy) && "hover:text-brand-600",
        )}
      >
        {value}
        {(copy || onCopy) && <Copy size={12} className="text-brand-600" />}
      </button>
    </div>
  );
}
