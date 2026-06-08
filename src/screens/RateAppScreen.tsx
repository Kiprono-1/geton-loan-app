import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Star } from "../components/Icons";

export function RateAppScreen() {
  const { back, showToast } = useApp();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }
    setDone(true);
    setTimeout(() => {
      showToast("Thanks for your feedback!", "success");
      back();
    }, 1500);
  };

  if (done) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="animate-scale-in flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/40">
            <Star size={48} className="fill-white text-white" />
          </div>
          <h1 className="mt-8 text-2xl font-bold text-slate-900">
            Asante sana! 🙏
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Your {rating}-star rating means the world to us. If you'd like,
            also rate us on the Play Store to help other Kenyans find GETON.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Rate GETON" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-3xl">😍</p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">
            How are we doing?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tap a star to rate your experience
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="transition active:scale-90"
              >
                <Star
                  size={42}
                  className={
                    n <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="mt-3 text-sm font-semibold text-brand-600 animate-fade-in">
              {rating === 5
                ? "🎉 We love you too!"
                : rating === 4
                  ? "😊 Almost perfect!"
                  : rating === 3
                    ? "😐 We'll do better!"
                    : rating === 2
                      ? "😕 What can we fix?"
                      : "😢 We want to make it right!"}
            </p>
          )}
        </div>

        {(rating > 0 && rating < 4) || rating >= 4 ? (
          <section className="mt-5">
            <h3 className="mb-2.5 text-sm font-bold text-slate-900">
              Tell us more (optional)
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback helps us improve..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
          </section>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {["Fast loans!", "Easy to use", "Great support", "Bad experience"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setFeedback((f) => (f ? `${f}, ${t}` : t))}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                {t}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={submit}
          className="w-full rounded-2xl bg-brand-600 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98]"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
