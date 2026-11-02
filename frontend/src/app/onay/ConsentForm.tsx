"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeTrMobile, validName } from "@/lib/phone";

type Props = {
  /** Which parts are missing on this account; only those are asked. */
  needName: boolean;
  needPhone: boolean;
  needConsent: boolean;
  defaultName: string;
};

/** One-time account completion: name, mobile number and the legal consents. */
export function ConsentForm({ needName, needPhone, needConsent, defaultName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = (!needName || validName(name)) && (!needPhone || normalizeTrMobile(phone)) && (!needConsent || (acceptTerms && acceptConsent));

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/account/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(needName ? { name } : {}),
        ...(needPhone ? { phone } : {}),
        ...(needConsent ? { acceptTerms, acceptConsent } : {}),
      }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Kaydedilemedi, tekrar deneyin.");
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  const link = "font-semibold text-brand-700 underline";
  const input = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500";
  return (
    <div className="mt-6 space-y-4">
      {needName && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Ad Soyad</span>
          <input className={input} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" />
        </label>
      )}
      {needPhone && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Cep telefonu</span>
          <input className={input} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" />
          <span className="mt-1 block text-xs text-gray-500">Acil durumlarda ve hesabınızla ilgili önemli bilgilendirmelerde size ulaşmak için.</span>
        </label>
      )}
      {needConsent && (
        <>
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
        </>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        onClick={submit}
        disabled={!ready || busy}
        className="w-full rounded-2xl bg-brand-600 px-5 py-3.5 font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Kaydediliyor…" : "Kaydet ve devam et"}
      </button>
    </div>
  );
}
