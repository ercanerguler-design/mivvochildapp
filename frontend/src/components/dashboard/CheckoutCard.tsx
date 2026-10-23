"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Lock, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

type Props = {
  priceTl: number;
  days: number;
  unlimited?: { active: boolean; expiresAt?: string | null; daysRemaining: number };
};

const RESULT = {
  basarili: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: CheckCircle2, text: "Ödemeniz alındı, aboneliğiniz aktif. Teşekkür ederiz!" },
  basarisiz: { tone: "bg-rose-50 text-rose-800 ring-rose-200", icon: AlertTriangle, text: "Ödeme tamamlanamadı. Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz." },
  inceleme: { tone: "bg-amber-50 text-amber-800 ring-amber-200", icon: Clock, text: "Ödemeniz banka tarafından inceleniyor. Onaylanınca aboneliğiniz açılır; sorunuz olursa bize yazın." },
} as const;

export function CheckoutCard({ priceTl, days, unlimited }: Props) {
  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "" });
  const [acceptSale, setAcceptSale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const r = useSearchParams().get("odeme");
  const result = r === "basarili" || r === "basarisiz" || r === "inceleme" ? r : null;

  const valid = form.fullName.trim().split(/\s+/).length >= 2 && form.phone.replace(/\D/g, "").length >= 10 && form.city.trim().length >= 2 && form.address.trim().length >= 5 && acceptSale;

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, acceptSale }) });
      const json = await res.json();
      if (!res.ok || !json.paymentPageUrl) throw new Error(json.error ?? "Ödeme başlatılamadı.");
      window.location.href = json.paymentPageUrl;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none";
  const expires = unlimited?.expiresAt ? new Date(unlimited.expiresAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : null;
  const Banner = result ? RESULT[result] : null;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Abonelik</h3>
          <p className="text-sm text-gray-500">{priceTl} TL / {days} gün · Taahhüt yok, otomatik yenileme yok.</p>
        </div>
        <CreditCard className="h-6 w-6 text-violet-600" />
      </div>

      {Banner && (
        <div className={`flex gap-2 rounded-lg p-3 text-sm ring-1 ${Banner.tone}`}>
          <Banner.icon className="h-5 w-5 shrink-0" />
          {Banner.text}
        </div>
      )}

      {unlimited?.active ? (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Aboneliğiniz aktif{expires ? ` · ${expires} tarihine kadar (${unlimited.daysRemaining} gün)` : ""}. Şimdi ödeme yaparsanız süre bu tarihin üzerine eklenir.
        </p>
      ) : (
        <p className="rounded-lg bg-violet-50 p-3 text-sm text-violet-800">Aktif aboneliğiniz yok. Kesintisiz koruma için aboneliğinizi başlatın.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">Ad Soyad</span>
          <input className={input} autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">Cep telefonu</span>
          <input className={input} autoComplete="tel" inputMode="tel" placeholder="05xx xxx xx xx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">Şehir</span>
          <input className={input} autoComplete="address-level1" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-gray-700">Fatura adresi</span>
          <input className={input} autoComplete="street-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
      </div>

      <label className="flex items-start gap-3 text-xs leading-5 text-gray-600">
        <input type="checkbox" checked={acceptSale} onChange={(e) => setAcceptSale(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-violet-600" />
        <span>
          <a href="/on-bilgilendirme" target="_blank" className="font-semibold text-violet-700 underline">Ön Bilgilendirme Formu</a> ve{" "}
          <a href="/mesafeli-satis" target="_blank" className="font-semibold text-violet-700 underline">Mesafeli Satış Sözleşmesi</a>
          &apos;ni okudum, onaylıyorum. <a href="/iptal-iade" target="_blank" className="underline">14 gün içinde koşulsuz iade</a> hakkım olduğunu biliyorum.
        </span>
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        onClick={pay}
        disabled={!valid || busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {busy ? "Güvenli ödeme sayfası açılıyor…" : `Kartla Öde · ${priceTl} TL`}
      </button>
      <p className="text-center text-xs text-gray-400">Ödemeler iyzico güvencesiyle alınır. Kart bilgileriniz Mivvo&apos;ya iletilmez.</p>
    </div>
  );
}
