"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Copy, Loader2, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import { absoluteUrl } from "@/lib/site";

type Step = 1 | 2 | 3;
type Paired = { id: string; displayName: string; pairedAt: string };

export function SetupWizard({ name, qrSvg, childUrl, parentPlayUrl }: { name: string | null; qrSvg: string; childUrl: string; parentPlayUrl: string }) {
  const [step, setStep] = useState<Step>(1);
  const [code, setCode] = useState<{ code: string; expiresAt: number } | null>(null);
  const [codeError, setCodeError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [paired, setPaired] = useState<Paired | null>(null);
  // Server time when the wizard started waiting; any pairing after it is "new".
  const baseline = useRef<number | null>(null);

  const newCode = useCallback(async () => {
    setCodeError("");
    setCopied(false);
    const res = await fetch("/api/setup/pairing-code", { method: "POST" });
    if (!res.ok) {
      setCodeError("Kod oluşturulamadı. Sayfayı yenileyip tekrar deneyin.");
      return;
    }
    const j = await res.json();
    setCode({ code: j.code, expiresAt: j.expiresAt });
  }, []);

  // Step 2: create a code once, tick the countdown, and watch for a newly paired phone.
  useEffect(() => {
    if (step !== 2) return;
    let alive = true;
    if (!code) {
      fetch("/api/setup/pairing-code", { method: "POST" })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((j) => alive && setCode({ code: j.code, expiresAt: j.expiresAt }))
        .catch(() => alive && setCodeError("Kod oluşturulamadı. Sayfayı yenileyip tekrar deneyin."));
    }
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const poll = window.setInterval(async () => {
      const r = await fetch("/api/setup/status").catch(() => null);
      if (!r?.ok || !alive) return;
      const { children, serverTime } = (await r.json()) as { children: Paired[]; serverTime: string };
      if (baseline.current === null) {
        baseline.current = new Date(serverTime).getTime() - 5_000;
        return;
      }
      const fresh = children.find((c) => new Date(c.pairedAt).getTime() > baseline.current!);
      if (fresh && alive) {
        setPaired(fresh);
        setStep(3);
      }
    }, 4000);
    return () => {
      alive = false;
      window.clearInterval(tick);
      window.clearInterval(poll);
    };
  }, [step, code]);

  const remaining = code ? Math.max(0, Math.floor((code.expiresAt - now) / 1000)) : 0;
  const expired = Boolean(code) && remaining === 0;

  const steps = ["Uygulamaları indirin", "Telefonu eşleştirin", "Koruma açık"];

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <MivvoLogo size={32} textClassName="text-2xl" />
          <Link href="/dashboard" className="text-sm font-semibold text-gray-500 hover:text-gray-800">Daha sonra yap →</Link>
        </div>

        <h1 className="mt-8 font-display text-3xl font-black tracking-tight text-gray-900">{name ? `Hoş geldin ${name}! ` : "Hoş geldiniz! "}Korumayı 3 adımda başlatın</h1>
        <p className="mt-2 text-gray-600">Ortalama kurulum süresi 5 dakika. Kurulumu çocuğunuzla birlikte yapmanızı öneririz.</p>

        <ol className="mt-8 flex items-center gap-2">
          {steps.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${done ? "bg-emerald-500 text-white" : active ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <span className={`hidden text-sm font-semibold sm:block ${active ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                {i < steps.length - 1 && <span className={`h-0.5 flex-1 rounded ${done ? "bg-emerald-400" : "bg-gray-200"}`} />}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl shadow-brand-600/5 ring-1 ring-gray-100 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Sizin telefonunuz</p>
                  <p className="mt-1 text-lg font-black text-gray-900">Mivvo Ebeveyn</p>
                  <p className="mt-1 text-sm text-gray-600">Uyarıları anında bildirim olarak alın. Bu hesapla giriş yapın.</p>
                  <a href={parentPlayUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white">
                    <Smartphone className="h-4 w-4" /> Google Play&apos;den indir
                  </a>
                </div>
                <div className="rounded-2xl bg-orange-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">Çocuğunuzun telefonu</p>
                  <p className="mt-1 text-lg font-black text-gray-900">Mivvo Çocuk</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white p-1 ring-1 ring-orange-100 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} role="img" aria-label="Çocuk uygulaması indirme QR kodu" />
                    <p className="text-sm text-gray-600">Çocuğunuzun telefon kamerasıyla okutun veya <a href={childUrl} className="font-semibold text-orange-700 underline">bağlantıyı açın</a>.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 font-bold text-white hover:bg-brand-700">
                Uygulama çocuğumun telefonunda kurulu <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Çocuğunuzun telefonunu eşleştirin</h2>
                <ol className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>1. Çocuğunuzun telefonunda <b>Mivvo Çocuk</b>&apos;u açın ve açıklama ekranını birlikte okuyun.</li>
                  <li>2. Aşağıdaki <b>eşleştirme kodunu</b> girin, çocuğunuzun adını ve doğum tarihini yazın.</li>
                  <li>3. İstenen iki izni verin. Eşleşme tamamlanınca bu sayfa kendiliğinden ilerler.</li>
                </ol>
              </div>

              <div className="rounded-2xl bg-gray-950 p-5 text-white">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>Eşleştirme kodu</span>
                  {code && !expired && <span>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")} geçerli</span>}
                </div>
                {!code && !codeError && <p className="mt-3 flex items-center gap-2 text-gray-300"><Loader2 className="h-4 w-4 animate-spin" /> Oluşturuluyor…</p>}
                {codeError && <p className="mt-3 text-rose-300">{codeError}</p>}
                {code && (
                  <>
                    {!expired && (
                      <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center sm:flex-row sm:text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/api/qr?s=360&d=${encodeURIComponent(absoluteUrl(`/e/${code.code}`))}`} alt="Eşleştirme QR kodu" width={180} height={180} className="h-44 w-44 shrink-0" />
                        <p className="text-sm text-gray-700"><b className="text-gray-900">En kolayı:</b> Çocuğunuzun telefonunda kamerayı açıp bu QR&apos;a tutun. Mivvo Çocuk açılır ve kod kendiliğinden dolar.</p>
                      </div>
                    )}
                    <p className="mt-4 text-xs font-semibold text-gray-400">veya kodu kopyalayıp yapıştırın:</p>
                    <p className={`mt-1 break-all font-mono text-sm leading-relaxed ${expired ? "text-gray-500 line-through" : ""}`}>{code.code}</p>
                    <div className="mt-4 flex gap-2">
                      {!expired ? (
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(code.code).catch(() => undefined);
                            setCopied(true);
                          }}
                          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-900"
                        >
                          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? "Kopyalandı" : "Kopyala"}
                        </button>
                      ) : null}
                      <button onClick={() => void newCode()} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">
                        <RefreshCw className="h-4 w-4" /> {expired ? "Süresi doldu · Yeni kod" : "Yeni kod"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin text-brand-600" /> Çocuğunuzun telefonunun bağlanması bekleniyor…</p>
              <p className="text-xs text-gray-400">İpucu: Kodu WhatsApp ile çocuğunuzun telefonuna gönderip oradan kopyalayabilirsiniz. Mivvo Ebeveyn uygulamasında da &quot;Çocuklar&quot; sekmesinden kod oluşturabilirsiniz.</p>
              <button onClick={() => setStep(1)} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Geri</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-10 w-10 text-emerald-500" /></div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{paired ? `Telefon bağlandı: ${paired.displayName}` : "Telefon bağlandı"}</h2>
                <p className="mt-2 text-gray-600">Koruma açık. Riskli bir mesaj tespit edildiğinde size hemen bildirim göndereceğiz.</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 text-left text-sm text-gray-600">
                <p className="flex gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" /> Çocuğunuzun telefonunda &quot;Mivvo koruması açık&quot; bildirimini görüyorsanız kurulum tamamdır.</p>
              </div>
              <Link href="/dashboard" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 font-bold text-white hover:bg-brand-700">
                Panele git <ArrowRight className="h-5 w-5" />
              </Link>
              <button onClick={() => { setPaired(null); setCode(null); baseline.current = null; setStep(2); }} className="text-sm font-semibold text-brand-600">+ Başka bir çocuk ekle</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
