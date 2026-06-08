import { Lock } from "../components/Icons";

export function PaymentProcessingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-8 text-center">
      <div className="relative">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-200" />
        <span
          className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-200"
          style={{ animationDelay: "0.4s" }}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
          <span className="h-14 w-14 animate-spin-slow rounded-full border-4 border-brand-100 border-t-brand-600" />
          <Lock className="absolute text-brand-600" size={24} />
        </div>
      </div>
      <h2 className="mt-10 text-xl font-bold text-slate-900">
        Paystack is processing your payment
      </h2>
      <p className="mt-2 max-w-xs text-sm text-slate-500">
        Check your phone for the M-Pesa prompt from Paystack and enter your PIN
        to confirm. Do not close this screen.
      </p>

      <div className="mt-8 w-full max-w-xs space-y-2 rounded-2xl bg-slate-50 p-4">
        <Step text="Connecting to Paystack" done />
        <Step text="Initiating M-Pesa STK Push" done />
        <Step text="Waiting for M-Pesa PIN confirmation" active />
        <Step text="Confirming transaction" />
      </div>
    </div>
  );
}

function Step({
  text,
  done,
  active,
}: {
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} className="h-2.5 w-2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : active ? (
        <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-brand-200 border-t-brand-600" />
      ) : (
        <span className="h-4 w-4 rounded-full border-2 border-slate-200" />
      )}
      <span
        className={`text-xs ${done ? "text-slate-900 font-medium" : active ? "text-slate-700 font-medium" : "text-slate-400"}`}
      >
        {text}
      </span>
    </div>
  );
}
