"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Info, Lock, Minus, Plus, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { PaymentLogos } from "@/components/PaymentLogos";
import { PLANS, YEARLY_SAVING_TL, countFromParam, formatTl, planFromParam, type PlanId } from "@/lib/plans";

export type PairedChild = { id: string; name: string; active: boolean; expiresAt: string | null };

type Props = {
  /** Paired children of this parent (names are shown only here, never sent to the payment provider). */
  paired: PairedChild[];
  /** Paid periods already waiting for a child to be paired. */
  pendingSeats: number;
};

const KDV_RATE = 0.2;
const MAX_CHILDREN = 10;
const tl2 = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "");

const RESULT = {
  basarili: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: CheckCircle2, text: "Ödemeniz alındı, aboneliğiniz aktif. Teşekkür ederiz!" },
  basarisiz: { tone: "bg-rose-50 text-rose-800 ring-rose-200", icon: AlertTriangle, text: "Ödeme tamamlanamadı. Kartınızdan çekim yapılmadıysa tekrar deneyebilirsiniz." },
  islemde: { tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: Clock, text: "Ödemeniz alındı ve doğrulanıyor. Aboneliğiniz birkaç saniye içinde aktif olur; görmek için sayfayı yenileyebilirsiniz." },
  inceleme: { tone: "bg-amber-50 text-amber-800 ring-amber-200", icon: Clock, text: "Ödemeniz banka tarafından inceleniyor. Onaylanınca aboneliğiniz açılır; sorunuz olursa bize yazın." },
} as const;

/**
 * Checkout: plan, which children, billing details and an always-visible order summary.
 * The parent ticks the paired children to pay for and can add children whose phone is not paired yet.
 */
export function CheckoutCard({ paired, pendingSeats }: Props) {
  const params = useSearchParams();
  const [planId, setPlanId] = useState<PlanId>(() => planFromParam(params.get("plan")));
  const plan = PLANS[planId];
  // Preselect from the cart's child count: children without a plan first, then the others; anything
  // beyond the paired children becomes "not paired yet". Without a count, preselect unpaid children.
  const [selected, setSelected] = useState<string[]>(() => {
    const order = [...paired].sort((a, b) => Number(a.active) - Number(b.active));
    const wanted = countFromParam(params.get("adet"), 0);
    if (wanted > 0) return order.slice(0, wanted).map((c) => c.id);
    const unpaid = paired.filter((c) => !c.active).map((c) => c.id);
    return unpaid.length ? unpaid : paired.slice(0, 1).map((c) => c.id);
  });
  const [newChildren, setNewChildren] = useState(() => {
    const wanted = countFromParam(params.get("adet"), 0);
    if (wanted > 0) return Math.min(MAX_CHILDREN, Math.max(0, wanted - paired.length));
    return paired.length === 0 ? 1 : 0;
  });
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const count = selected.length + newChildren;

  const total = count * plan.priceTl;
  const net = Math.round((total / (1 + KDV_RATE)) * 100) / 100;
  const kdv = Math.round((total - net) * 100) / 100;

  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "" });
  const [acceptSale, setAcceptSale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const r = params.get("odeme");
  const result = r === "basarili" || r === "basarisiz" || r === "inceleme" || r === "islemde" ? r : null;
  const Banner = result ? RESULT[result] : null;

  const formOk = form.fullName.trim().split(/\s+/).length >= 2 && form.phone.replace(/\D/g, "").length >= 10 && form.city.trim().length >= 2 && form.address.trim().length >= 5;
  const valid = count > 0 && formOk && acceptSale;
  const missing = count === 0 ? "Ödeme yapacağınız çocuğu seçin." : !formOk ? "Fatura bilgilerini eksiksiz doldurun." : !acceptSale ? "Devam etmek için sözleşmeleri onaylayın." : "";

  async function pay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, acceptSale, childIds: selected, newChildren, plan: planId }),
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
            <h2 className={stepTitle}><span className={stepNo}>2</span> Çocuklar</h2>
            <p className="mt-1 text-sm text-gray-500">Abonelik çocuk başınadır. Ödeme yapacağınız çocukları işaretleyin.</p>

            {paired.length > 0 && (
              <div className="mt-4 space-y-2">
                {paired.map((c) => {
                  const on = selected.includes(c.id);
                  return (
                    <label key={c.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 text-sm transition-colors ${on ? "border-violet-400 bg-violet-50/60" : "border-gray-200 hover:bg-gray-50"}`}>
                      <span className="flex items-center gap-3">
                        <input type="checkbox" checked={on} onChange={() => toggle(c.id)} className="h-4 w-4 accent-violet-600" />
                        <span>
                          <span className="block font-semibold text-gray-900">{c.name}</span>
                          <span className={`text-xs ${c.active ? "text-emerald-700" : "text-rose-700"}`}>
                            {c.active ? `Aktif · ${fmtDate(c.expiresAt)} tarihine kadar · yeni süre bunun üzerine eklenir` : "Aboneliği yok · mesajları analiz edilmiyor"}
                          </span>
                        </span>
                      </span>
                      <span className={`shrink-0 font-semibold ${on ? "text-gray-900" : "text-gray-400"}`}>{formatTl(plan.priceTl)} TL</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 p-3.5">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{paired.length ? "Telefonu henüz eşleştirilmemiş çocuk" : "Çocuk sayısı"}</p>
                <p className="text-xs text-gray-500">Bu çocukların aboneliği, telefonunu eşleştirdiğiniz gün başlar.</p>
              </div>
              <div className="flex items-center rounded-xl ring-1 ring-gray-200">
                <button type="button" aria-label="Azalt" disabled={newChildren <= 0} onClick={() => setNewChildren((n) => Math.max(0, n - 1))} className="p-2.5 text-gray-700 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                <output aria-live="polite" className="w-9 text-center font-black text-gray-950">{newChildren}</output>
                <button type="button" aria-label="Artır" disabled={newChildren >= MAX_CHILDREN} onClick={() => setNewChildren((n) => Math.min(MAX_CHILDREN, n + 1))} className="p-2.5 text-gray-700 disabled:opacity-30"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            {pendingSeats > 0 && (
              <p className="mt-3 flex gap-2 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0" /> Hesabınızda eşleştirme bekleyen {pendingSeats} ödenmiş abonelik var; yeni çocuğunuzun telefonunu eşleştirdiğinizde otomatik başlar.
              </p>
            )}
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
          <p className="mt-1 text-sm text-gray-500">Mivvo {plan.name} · {plan.days} gün</p>
          <ul className="mt-4 space-y-2 border-b border-gray-100 pb-4 text-sm">
            {paired.filter((c) => selected.includes(c.id)).map((c) => (
              <li key={c.id} className="flex justify-between gap-3 text-gray-700"><span className="truncate">{c.name}</span><span className="shrink-0">{tl2(plan.priceTl)} TL</span></li>
            ))}
            {newChildren > 0 && (
              <li className="flex justify-between gap-3 text-gray-700"><span>{paired.length ? "Eşleştirilecek çocuk" : "Çocuk"} × {newChildren}</span><span className="shrink-0">{tl2(plan.priceTl * newChildren)} TL</span></li>
            )}
            {count === 0 && <li className="text-gray-400">Henüz çocuk seçilmedi</li>}
          </ul>
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
