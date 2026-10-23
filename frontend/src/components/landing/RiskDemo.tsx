"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Sparkles, MessageSquareText, Lightbulb } from "lucide-react";
import type { DemoSample } from "./content";

type Labels = {
  pick: string;
  incoming: string;
  analyzing: string;
  riskScore: string;
  category: string;
  why: string;
  tip: string;
  safeTitle: string;
  disclaimer: string;
};

function scoreColor(score: number) {
  if (score >= 90) return { bar: "bg-rose-500", text: "text-rose-600", chip: "bg-rose-50 text-rose-700 ring-rose-200" };
  if (score >= 70) return { bar: "bg-orange-500", text: "text-orange-600", chip: "bg-orange-50 text-orange-700 ring-orange-200" };
  return { bar: "bg-amber-400", text: "text-amber-600", chip: "bg-amber-50 text-amber-700 ring-amber-200" };
}

export function RiskDemo({ samples, labels }: { samples: readonly DemoSample[]; labels: Labels }) {
  const [active, setActive] = useState(0);
  // Index whose result is on screen; differs from `active` during the short "analyzing" pause.
  const [shown, setShown] = useState(0);
  const loading = shown !== active;

  useEffect(() => {
    const id = window.setTimeout(() => setShown(active), 650);
    return () => window.clearTimeout(id);
  }, [active]);

  const sample = samples[active];
  const r = sample.result;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-500">{labels.pick}</p>
        <div className="grid gap-3" role="tablist" aria-label={labels.pick}>
          {samples.map((s, i) => (
            <button
              key={s.text}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`group rounded-2xl border p-4 text-left transition-all ${
                i === active
                  ? "border-brand-600 bg-white shadow-lg shadow-brand-600/10 ring-1 ring-brand-600"
                  : "border-gray-200 bg-white/70 hover:border-brand-500/50 hover:bg-white"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                <MessageSquareText className="h-3.5 w-3.5" />
                {s.app} · {s.sender}
              </div>
              <p className="line-clamp-2 text-sm text-gray-800">“{s.text}”</p>
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-brand-600/5 sm:p-8" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{labels.incoming}</p>
        <div className="mt-3 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-gray-800">
          <p className="text-xs font-semibold text-gray-500">{sample.app} · {sample.sender}</p>
          <p className="mt-1">{sample.text}</p>
        </div>

        <div className="mt-6 min-h-56">
          {loading ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3 text-brand-600">
              <Sparkles className="h-7 w-7 animate-pulse" />
              <p className="text-sm font-semibold">{labels.analyzing}</p>
            </div>
          ) : r.safe ? (
            <div key={active} className="animate-pop rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <ShieldCheck className="h-5 w-5" /> {labels.safeTitle}
              </div>
              <p className="mt-2 text-sm text-emerald-900/80">{r.note}</p>
            </div>
          ) : (
            <div key={active} className="animate-pop space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400">{labels.category}</p>
                  <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${scoreColor(r.score).chip}`}>
                    {r.category} · {r.level}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-400">{labels.riskScore}</p>
                  <p className={`font-display text-4xl font-black ${scoreColor(r.score).text}`}>
                    {r.score}
                    <span className="text-base text-gray-400">/100</span>
                  </p>
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${scoreColor(r.score).bar} transition-all duration-700`} style={{ width: `${r.score}%` }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{labels.why}</p>
                <p className="mt-1 text-sm text-gray-600">{r.why}</p>
              </div>
              <div className="flex gap-3 rounded-2xl bg-brand-50 p-4">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-bold text-brand-700">{labels.tip}</p>
                  <p className="mt-0.5 text-sm text-gray-700">{r.tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-gray-400">{labels.disclaimer}</p>
      </div>
    </div>
  );
}
