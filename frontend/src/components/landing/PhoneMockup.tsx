import { BellRing, Lightbulb } from "lucide-react";
import { MivvoMark } from "@/components/common/MivvoLogo";
import type { LandingContent } from "./content";

/** Pure-CSS phone showing a sample parent alert; no image download needed. */
export function PhoneMockup({ p }: { p: LandingContent["hero"]["phone"] }) {
  const bars = [62, 80, 45, 90, 70, 30, 55];
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" aria-hidden="true">
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-brand-500/30 via-fuchsia-400/20 to-coral-400/30 blur-3xl" />
      <div className="rounded-[2.75rem] bg-gray-900 p-2.5 shadow-2xl shadow-brand-700/30">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-brand-50 to-white">
          <div className="flex items-center justify-between px-6 pb-2 pt-3 text-[11px] font-semibold text-gray-800">
            <span>{p.time}</span>
            <span className="h-5 w-20 rounded-full bg-gray-900" />
            <span>5G</span>
          </div>

          <div className="animate-float mx-3 mt-3 rounded-2xl bg-white/95 p-3.5 shadow-lg ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <MivvoMark size={18} />
              <span className="font-semibold text-gray-700">{p.app}</span>
              <span className="ml-auto">{p.now}</span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <BellRing className="h-4 w-4 text-orange-500" /> {p.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{p.body}</p>
          </div>

          <div className="mx-3 mt-3 rounded-2xl bg-brand-600 p-3.5 text-white shadow-lg shadow-brand-600/30">
            <p className="flex items-center gap-1.5 text-xs font-bold">
              <Lightbulb className="h-3.5 w-3.5" /> {p.tipTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/90">{p.tip}</p>
          </div>

          <div className="mx-3 mb-5 mt-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-black/5">
            <p className="text-[11px] font-semibold text-gray-500">{p.weekly}</p>
            <div className="mt-2 flex h-16 items-end gap-1.5">
              {bars.map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-md ${i === 3 ? "bg-coral-400" : "bg-brand-500/70"}`} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[11px]">
              <span className="text-gray-500"><b className="text-gray-900">1.284</b> {p.safe}</span>
              <span className="text-gray-500"><b className="text-orange-600">3</b> {p.alerts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
