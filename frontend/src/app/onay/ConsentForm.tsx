"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConsentForm() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/consents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acceptTerms, acceptConsent }) });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Kaydedilemedi, tekrar deneyin.");
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  const link = "font-semibold text-brand-700 underline";
  return (
    <div className="mt-6 space-y-4">
      <label className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-600" />
        <span>
          <Link href="/kullanim-kosullari" target="_blank" className={link}>Kullanım Koşulları</Link>&apos;nı okudum ve kabul ediyorum;{" "}
          <Link href="/kvkk" target="_blank" className={link}>KVKK Aydınlatma Metni</Link>&apos;ni okudum.
        </span>
      </label>
      <label className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        <input type="checkbox" checked={acceptConsent} onChange={(e) => setAcceptConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-600" />
        <span>
          <Link href="/acik-riza" target="_blank" className={link}>Açık Rıza Metni</Link> kapsamında çocuğumun mesaj bildirimlerinin risk analizi için işlenmesine ve yurt dışındaki hizmet sağlayıcılara aktarılmasına açık rıza veriyorum.
        </span>
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        onClick={submit}
        disabled={!acceptTerms || !acceptConsent || busy}
        className="w-full rounded-2xl bg-brand-600 px-5 py-3.5 font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Kaydediliyor…" : "Onayla ve devam et"}
      </button>
    </div>
  );
}
