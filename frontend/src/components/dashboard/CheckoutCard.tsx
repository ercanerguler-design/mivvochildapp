"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Lock, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { PaymentLogos } from "@/components/PaymentLogos";
import { PLANS, YEARLY_SAVING_TL, countFromParam, formatTl, planFromParam, type PlanId } from "@/lib/plans";

export type ChildBilling = { childId: string; displayName: string; active: boolean; expiresAt?: string | null; daysRemaining: number; coveredBy?: "account" | "child" | null };

type Props = {
  /** Each child is billed separately; the parent picks who to pay for. */
  childPlans: ChildBilling[];
};

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : null);

const RESULT = {
  basarili: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: CheckCircle2, text: "Ödemeniz alındı, aboneliğiniz aktif. Teşekkür ederiz!" },
  basarisiz: { tone: "bg-rose-50 text-rose-800 ring-rose-200", icon: AlertTriangle, text: "Ödeme tamamlanamadı. Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz." },
  islemde: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: Clock, text: "Ödemeniz alındı ve doğrulanıyor. Aboneliğiniz birkaç saniye içinde aktif olur; görmek için sayfayı yenileyebilirsiniz." },
  inceleme: { tone: "bg-amber-50 text-amber-800 ring-amber-200", icon: Clock, text: "Ödemeniz banka tarafından inceleniyor. Onaylanınca aboneliğiniz açılır; sorunuz olursa bize yazın." },
} as const;

export function CheckoutCard({ childPlans }: Props) {
  const params = useSearchParams();
  // The cart passes ?plan=yillik&adet=2.
  const [planId, setPlanId] = useState<PlanId>(() => planFromParam(params.get("plan")));
  const wanted = countFromParam(params.get("adet"), 0);
  const { priceTl, days } = PLANS[planId];
  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "" });
  // Children without an active plan are selected by default.
  const [selected, setSelected] = useState<string[]>(() => {
    const unpaid = childPlans.filter((c) => !c.active).map((c) => c.childId);
    return unpaid.length ? unpaid : childPlans.map((c) => c.childId);
  });
  const total = selected.length * priceTl;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const [acceptSale, setAcceptSale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const r = params.get("odeme");
  const result = r === "basarili" || r === "basarisiz" || r === "inceleme" || r === "islemde" ? r : null;

  const valid = selected.length > 0 && form.fullName.trim().split(/\s+/).length >= 2 && form.phone.replace(/\D/g, "").length >= 10 && form.city.trim().length >= 2 && form.address.trim().length >= 5 && acceptSale;

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, acceptSale, childIds: selected, plan: planId }) });
      const json = await res.json();
      if (!res.ok || !json.paymentPageUrl) throw new Error(json.error ?? "Ödeme başlatılamadı.");
      window.location.href = json.paymentPageUrl;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none";
  const Banner = result ? RESULT[result] : null;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Abonelik</h3>
          <p className="text-sm text-gray-500">Çocuk başına · Taahhüt yok, otomatik yenileme yok.</p>
        </div>
        <CreditCard className="h-6 w-6 text-violet-600" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Abonelik planı">
        {(["monthly", "yearly"] as const).map((id) => (
          <label key={id} className={`relative cursor-pointer rounded-xl border-2 p-3 text-sm ${planId === id ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
            <input type="radio" name="plan" className="sr-only" checked={planId === id} onChange={() => setPlanId(id)} />
            {id === "yearly" && YEARLY_SAVING_TL > 0 && <span className="absolute -top-2.5 right-3 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">{formatTl(YEARLY_SAVING_TL)} TL kazanç</span>}
            <span className="block font-semibold text-gray-900">{PLANS[id].name}</span>
            <span className="text-gray-600">{formatTl(PLANS[id].priceTl)} TL · {PLANS[id].days} gün</span>
          </label>
        ))}
      </div>

      {Banner && (
        <div className={`flex gap-2 rounded-lg p-3 text-sm ring-1 ${Banner.tone}`}>
          <Banner.icon className="h-5 w-5 shrink-0" />
          {Banner.text}
        </div>
      )}

      {childPlans.length === 0 ? (
        <p className="rounded-lg bg-violet-50 p-3 text-sm text-violet-800">Önce çocuğunuzun telefonunu eşleştirin; abonelik her çocuk için ayrı başlatılır.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Ödeme yapılacak çocuklar</p>
          {childPlans.map((c) => (
            <label key={c.childId} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-sm hover:bg-gray-50">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={selected.includes(c.childId)} onChange={() => toggle(c.childId)} className="h-4 w-4 accent-violet-600" />
                <span>
                  <span className="font-semibold text-gray-900">{c.displayName}</span>
                  <span className={`ml-2 text-xs ${c.active ? "text-emerald-700" : "text-rose-700"}`}>
                    {c.coveredBy === "account" ? `Hesap aboneliği kapsıyor · ${fmtDate(c.expiresAt) ?? ""} tarihine kadar` : c.active ? `Aktif · ${fmtDate(c.expiresAt) ?? ""} tarihine kadar (${c.daysRemaining} gün)` : "Aboneliği yok · mesajları analiz edilmiyor"}
                  </span>
                </span>
              </span>
              <span className="font-semibold text-gray-900">{formatTl(priceTl)} TL</span>
            </label>
          ))}
          {wanted > childPlans.length && (
            <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">Sepette {wanted} çocuk seçtiniz; şu an {childPlans.length} çocuğunuz eşleştirilmiş. Diğer çocuklarınızın telefonunu eşleştirdikten sonra onlar için de ödeme yapabilirsiniz.</p>
          )}
          <p className="text-xs text-gray-500">Aboneliği devam eden bir çocuk için ödeme yaparsanız {days} gün mevcut sürenin üzerine eklenir.</p>
          <p className="flex justify-between border-t border-gray-100 pt-2 text-sm font-bold text-gray-900">
            <span>Toplam ({selected.length} çocuk, KDV dahil)</span>
            <span>{formatTl(total)} TL</span>
          </p>
        </div>
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
        {busy ? "Güvenli ödeme sayfası açılıyor…" : `Kartla Öde · ${formatTl(total)} TL`}
      </button>
      <PaymentLogos className="justify-center" />
      <p className="text-center text-xs text-gray-400">Ödemeler PayTR güvencesiyle alınır. Kart bilgileriniz Mivvo&apos;ya iletilmez.</p>
    </div>
  );
}
