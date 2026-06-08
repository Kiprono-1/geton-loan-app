import { useState } from "react";
import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "../components/Icons";
import { formatCurrency, formatRelative } from "../utils/format";
import { cn } from "../utils/cn";

const filters = ["All", "Loans", "Fees", "Repayments"] as const;
type Filter = (typeof filters)[number];

export function TransactionsScreen() {
  const { transactions } = useApp();
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = transactions.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Loans") return t.type === "disbursement";
    if (filter === "Fees") return t.type === "fee";
    if (filter === "Repayments") return t.type === "repayment";
    return true;
  });

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Transactions" />

      {/* Filter chips */}
      <div className="overflow-x-auto bg-white px-5 pb-3 no-scrollbar">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition",
                filter === f
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 no-scrollbar">
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const isOut = tx.type === "fee" || tx.type === "repayment";
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
                      isOut ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600",
                    )}
                  >
                    {isOut ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatRelative(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">{tx.reference}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        isOut ? "text-red-600" : "text-emerald-600",
                      )}
                    >
                      {isOut ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        tx.status === "successful"
                          ? "bg-emerald-100 text-emerald-700"
                          : tx.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <Receipt size={36} className="text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No transactions yet
            </h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Your loan activity, payments, and disbursements will appear here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
