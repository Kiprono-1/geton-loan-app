import { TopBar } from "../components/TopBar";

const OPEN_SOURCE = [
  { name: "React", version: "19.2.6", license: "MIT" },
  { name: "Vite", version: "7.3.2", license: "MIT" },
  { name: "Tailwind CSS", version: "4.1.17", license: "MIT" },
  { name: "clsx", version: "2.1.1", license: "MIT" },
  { name: "tailwind-merge", version: "3.4.0", license: "MIT" },
  { name: "TypeScript", version: "5.9.3", license: "Apache-2.0" },
  { name: "Inter Font", version: "—", license: "OFL-1.1" },
];

export function LicensesScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <TopBar title="Open Source Licenses" showBack showBell={false} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 no-scrollbar">
        <p className="text-xs text-slate-500">
          GETON is built with love using these amazing open-source projects.
        </p>

        <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          {OPEN_SOURCE.map((lib, i) => (
            <div
              key={lib.name}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i < OPEN_SOURCE.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {lib.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  v{lib.version} • {lib.license}
                </p>
              </div>
            </div>
          ))}
        </section>

        <p className="mt-4 text-[11px] text-slate-400">
          Full license texts available at github.com/geton/oss
        </p>
      </div>
    </div>
  );
}
