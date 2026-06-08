import { useApp } from "../context/AppContext";
import { TopBar } from "../components/TopBar";
import { Mail, Phone } from "../components/Icons";

export function ContactScreen() {
  const { showToast } = useApp();

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Contact Us" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => showToast("Calling 0709 123 456…", "info")}
            className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Phone size={22} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Call us</p>
              <p className="text-xs text-slate-500">0709 123 456</p>
            </div>
          </button>
          <button
            onClick={() => showToast("Opening email…", "info")}
            className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white">
              <Mail size={22} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Email</p>
              <p className="text-xs text-slate-500">help@geton.co.ke</p>
            </div>
          </button>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Head Office</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Westlands Square, 5th Floor
            <br />
            Ring Road Westlands
            <br />
            P.O. Box 12345-00100
            <br />
            Nairobi, Kenya
          </p>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Working Hours</h3>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Mon - Fri</span>
              <span className="font-semibold text-slate-900">7:00 - 22:00</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span className="font-semibold text-slate-900">8:00 - 20:00</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday & Public Holidays</span>
              <span className="font-semibold text-slate-900">9:00 - 18:00</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            24/7 emergency support via M-Pesa & email
          </p>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Office Branches</h3>
          <div className="mt-2 space-y-3 text-sm">
            {[
              { city: "Mombasa", addr: "Nyali Centre, 2nd Floor" },
              { city: "Kisumu", addr: "Mega Plaza, Oginga Odinga St" },
              { city: "Eldoret", addr: "Zion Mall, Uganda Rd" },
              { city: "Nakuru", addr: "Westside Mall, Kenyatta Ave" },
            ].map((b) => (
              <div key={b.city} className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{b.city}</p>
                  <p className="text-xs text-slate-500">{b.addr}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
