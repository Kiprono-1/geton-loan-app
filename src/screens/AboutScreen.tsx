import { TopBar } from "../components/TopBar";

export function AboutScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="About GETON" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <div className="flex flex-col items-center py-6 text-center">
          <img
            src="/logo.png"
            alt="GETON"
            className="h-20 w-20 rounded-2xl shadow-lg shadow-pink-500/20"
          />
          <h1 className="mt-4 text-2xl font-black tracking-tight">GETON</h1>
          <p className="text-sm text-slate-500">Version 2.4.1 • Build 240619</p>
          <p className="mt-1 text-xs text-slate-400">Released June 2026</p>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Our mission</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            GETON is on a mission to provide instant, fair, and transparent
            credit to every working Kenyan. We believe access to short-term
            credit shouldn't depend on a bank relationship or a payslip.
          </p>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Key facts</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { v: "2M+", l: "Customers" },
              { v: "KSh 8B+", l: "Disbursed" },
              { v: "4.8 ★", l: "App rating" },
              { v: "< 5 min", l: "Approval time" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl bg-slate-50 p-3 text-center"
              >
                <p className="text-lg font-black text-brand-600">{s.v}</p>
                <p className="text-[11px] text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Leadership</h3>
          <div className="mt-3 space-y-3 text-sm">
            {[
              { name: "Wanjiku Mwangi", role: "CEO & Co-founder" },
              { name: "Daniel Kiprop", role: "CTO & Co-founder" },
              { name: "Faith Otieno", role: "Chief Credit Officer" },
              { name: "James Wekesa", role: "Chief Compliance Officer" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 text-xs font-bold text-white">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Regulatory</h3>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p>• Licensed by the Central Bank of Kenya</p>
            <p>• Digital Credit Providers Regulations 2022</p>
            <p>• Data Protection Act 2019 compliant</p>
            <p>• Member: Association of Digital Lenders Kenya</p>
          </div>
        </section>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          © 2026 GETON Financial Services Ltd.
          <br />All rights reserved.
        </p>
      </div>
    </div>
  );
}
