"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Info, Lock, Minus, Plus, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { PaymentLogos } from "@/components/PaymentLogos";
import { PLANS, YEARLY_SAVING_TL, countFromParam, formatTl, planFromParam, type PlanId } from "@/lib/plans";

type Props = {
  /** Paired children on the account, and how many of them have no active plan. */
  pairedCount: number;
  unpaidCount: number;
  /** Paid periods already waiting for a child to be paired. */
  pendingSeats: number;
};

const KDV_RATE = 0.2;
const MAX_CHILDREN = 10;
const tl2 = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const RESULT = {
  basarili: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: CheckCircle2, text: "Ödemeniz alındı, aboneliğiniz aktif. Teşekkür ederiz!" },
  basarisiz: { tone: "bg-rose-50 text-rose-800 ring-rose-200", icon: AlertTriangle, text: "Ödeme tamamlanamadı. Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz." },
  islemde: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: Clock, text: "Ödemeniz alındı ve doğrulanıyor. Aboneliğiniz birkaç saniye içinde aktif olur; görmek için sayfayı yenileyebilirsiniz." },
  inceleme: { tone: "bg-amber-50 text-amber-800 ring-amber-200", icon: Clock, text: "Ödemeniz banka tarafından inceleniyor. Onaylanınca aboneliğiniz açılır; sorunuz olursa bize yazın." },
} as const;

/**
 * Checkout: plan, number of children, billing details and an always-visible order summary.
 * No child names are shown or sent; the server applies the payment to children without a plan first.
 */
export function CheckoutCard({ pairedCount, unpaidCount, pendingSeats }: Props) {
  const params = useSearchParams();
  const [planId, setPlanId] = useState<PlanId>(() => planFromParam(params.get("plan")));
  const plan = PLANS[planId];
  const [count, setCount] = useState(() => Math.min(MAX_CHILDREN, countFromParam(params.get("adet"), unpaidCount || pairedCount || 1)));

  const total = count * plan.priceTl;
  const net = Math.round((total / (1 + KDV_RATE)) * 100) / 100;
  const kdv = Math.round((total - net) * 100) / 100;
  const startLater = Math.max(0, count - pairedCount);

  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "" });
  const [acceptSale, setAcceptSale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const r = params.get("odeme");
  const result = r === "basarili" || r === "basarisiz" || r === "inceleme" || r === "islemde" ? r : null;
  const Banner = result ? RESULT[result] : null;

  const formOk = form.fullName.trim().split(/\s+/).length >= 2 && form.phone.replace(/\D/g, "").length >= 10 && form.city.trim().length >= 2 && form.address.trim().length >= 5;
  const valid = count > 0 && formOk && acceptSale;
  const missing = !formOk ? "Fatura bilgilerini eksiksiz doldurun." : !acceptSale ? "Devam etmek için sözleşmeleri onaylayın." : "";

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, acceptSale, count, plan: planId }),
      });
      const json = await res.json();
      if (!res.ok || !json.paymentPageUrl) throw new Error(json.error ?? "Ödeme başlatılamadı.");
      window.location.href = json.paymentPageUrl;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const section = "rounded-2xl border border-gray-100 bg-white p-5 sm:p-6";
  const stepTitle = "flex items-center gap-2.5 text-base font-bold text-gray-900";
  const stepNo = "flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white";
  const input = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  return (
    <div className="space-y-5">
      {Banner && (
        <div className={`flex gap-2 rounded-xl p-4 text-sm ring-1 ${Banner.tone}`}>
          <Banner.icon className="h-5 w-5 shrink-0" />
          {Banner.text}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className={section}>
            <h2 className={stepTitle}><span className={stepNo}>1</span> Plan</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Abonelik planı">
              {(["monthly", "yearly"] as const).map((id) => (
                <label key={id} className={`relative cursor-pointer rounded-xl border-2 p-4 ${planId === id ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="plan" className="sr-only" checked={planId === id} onChange={() => setPlanId(id)} />
                  {id === "yearly" && YEARLY_SAVING_TL > 0 && <span className="absolute -top-2.5 right-3 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">{formatTl(YEARLY_SAVING_TL)} TL kazanç</span>}
                  <span className="block font-semibold text-gray-900">{PLANS[id].name}</span>
                  <span className="mt-1 block text-xl font-black text-gray-950">{formatTl(PLANS[id].priceTl)} TL</span>
                  <span className="text-sm text-gray-500">çocuk başına · {PLANS[id].days} gün{id === "yearly" ? ` · aylık ~${formatTl(Math.round(PLANS.yearly.priceTl / 12))} TL` : ""}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={section}>
            <h2 className={stepTitle}><span className={stepNo}>2</span> Çocuk sayısı</h2>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-gray-600">Abonelik çocuk başınadır. Kaç çocuğunuz için ödeme yapacaksınız?</p>
              <div className="flex items-center rounded-xl ring-1 ring-gray-200">
                <button type="button" aria-label="Azalt" disabled={count <= 1} onClick={() => setCount((n) => Math.max(1, n - 1))} className="p-3 text-gray-700 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                <output aria-live="polite" className="w-10 text-center text-lg font-black text-gray-950">{count}</output>
                <button type="button" aria-label="Artır" disabled={count >= MAX_CHILDREN} onClick={() => setCount((n) => Math.min(MAX_CHILDREN, n + 1))} className="p-3 text-gray-700 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-4 flex gap-2 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
              <span>
                {pairedCount > 0
                  ? `Hesabınızda ${pairedCount} eşleştirilmiş çocuk var${unpaidCount ? `, ${unpaidCount} tanesinin aboneliği yok` : ""}. Ödeme önce aboneliği olmayan çocuklara uygulanır; aboneliği devam eden çocukta yeni süre mevcut sürenin üzerine eklenir.`
                  : "Henüz eşleştirilmiş çocuk yok."}
                {startLater > 0 && ` ${startLater} çocuğun aboneliği, telefonunu eşleştirdiğiniz gün başlar.`}
                {pendingSeats > 0 && ` Hesabınızda eşleştirme bekleyen ${pendingSeats} ödenmiş abonelik de var.`}
              </span>
            </p>
          </section>

          <section className={section}>
            <h2 className={stepTitle}><span className={stepNo}>3</span> Fatura bilgileri</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
          </section>
        </div>

        <aside aria-label="Sipariş özeti" className="h-fit rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 lg:sticky lg:top-6">
          <h2 className="text-base font-bold text-gray-900">Sipariş özeti</h2>
          <div className="mt-4 flex justify-between gap-3 border-b border-gray-100 pb-4 text-sm">
            <span className="text-gray-700">
              Mivvo {plan.name}
              <span className="block text-xs text-gray-500">{plan.days} gün · {count} çocuk × {tl2(plan.priceTl)} TL</span>
            </span>
            <span className="font-semibold text-gray-900">{tl2(total)} TL</span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><dt>Ara toplam (KDV hariç)</dt><dd>{tl2(net)} TL</dd></div>
            <div className="flex justify-between text-gray-600"><dt>KDV (%20)</dt><dd>{tl2(kdv)} TL</dd></div>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-black text-gray-950"><dt>Toplam</dt><dd>{tl2(total)} TL</dd></div>
          </dl>

          <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-gray-600">
            <input type="checkbox" checked={acceptSale} onChange={(e) => setAcceptSale(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-violet-600" />
            <span>
              <Link href="/on-bilgilendirme" target="_blank" className="font-semibold text-violet-700 underline">Ön Bilgilendirme Formu</Link> ve{" "}
              <Link href="/mesafeli-satis" target="_blank" className="font-semibold text-violet-700 underline">Mesafeli Satış Sözleşmesi</Link>&apos;ni okudum, onaylıyorum.
            </span>
          </label>

          {error && <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-sm text-rose-700">{error}</p>}

          <button
            onClick={pay}
            disabled={!valid || busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {busy ? "Güvenli ödeme sayfası açılıyor…" : `Güvenli Öde · ${tl2(total)} TL`}
          </button>
          {!valid && !busy && missing && <p className="mt-2 text-center text-xs text-gray-500">{missing}</p>}

          <PaymentLogos className="mt-4 justify-center" />
          <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /> Kart bilgileriniz PayTR tarafından alınır, Mivvo&apos;ya iletilmez.</li>
            <li className="flex gap-2"><Zap className="h-4 w-4 shrink-0 text-violet-600" /> Ödeme onayıyla abonelik hemen başlar.</li>
            <li className="flex gap-2"><RotateCcw className="h-4 w-4 shrink-0 text-violet-600" /> Otomatik yenileme yok · <Link href="/iptal-iade" target="_blank" className="underline">14 gün içinde koşulsuz iade</Link></li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
