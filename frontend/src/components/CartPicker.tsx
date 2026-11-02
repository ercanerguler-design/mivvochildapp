"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Landmark, Lock, Minus, Plus, RotateCcw, Zap } from "lucide-react";
import { PaymentLogos } from "@/components/PaymentLogos";
import { MAX_CART_CHILDREN, PLANS, YEARLY_SAVING_TL, formatTl, type PlanId } from "@/lib/plans";

const KDV_RATE = 0.2;
const tl2 = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  initialPlan: PlanId;
  initialCount: number;
  signedIn: boolean;
  /** Names of the signed-in parent's paired children (empty for visitors). */
  kids: string[];
};

/** Plan and child-count picker of the public cart, with the order summary. */
export function CartPicker({ initialPlan, initialCount, signedIn, kids }: Props) {
  const max = Math.max(MAX_CART_CHILDREN, kids.length);
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [count, setCount] = useState(Math.min(Math.max(1, initialCount), max));
  const plan = PLANS[planId];
  const total = plan.priceTl * count;
  const net = Math.round((total / (1 + KDV_RATE)) * 100) / 100;
  const kdv = Math.round((total - net) * 100) / 100;

  const checkout = `/dashboard/ayarlar?plan=${plan.slug}&adet=${count}#abonelik`;
  const next = signedIn ? checkout : `/giris?next=${encodeURIComponent(checkout)}`;
  const monthlyEquivalent = Math.round(PLANS.yearly.priceTl / 12);

  const option = (id: PlanId) =>
    `relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition-colors ${planId === id ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-label="Ürünler" className="rounded-3xl bg-white p-6 ring-1 ring-gray-200">
        <h2 className="text-lg font-bold text-gray-900">1. Plan seçin</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Abonelik planı">
          <label className={option("monthly")}>
            <input type="radio" name="plan" className="sr-only" checked={planId === "monthly"} onChange={() => setPlanId("monthly")} />
            <span className="font-bold text-gray-900">{PLANS.monthly.name}</span>
            <span className="mt-1 font-display text-2xl font-black text-gray-950">{formatTl(PLANS.monthly.priceTl)} TL</span>
            <span className="text-sm text-gray-500">çocuk başına · 30 gün</span>
          </label>
          <label className={option("yearly")}>
            <input type="radio" name="plan" className="sr-only" checked={planId === "yearly"} onChange={() => setPlanId("yearly")} />
            {YEARLY_SAVING_TL > 0 && <span className="absolute -top-3 right-4 rounded-full bg-coral-500 px-2.5 py-0.5 text-xs font-bold text-white">{formatTl(YEARLY_SAVING_TL)} TL kazanç</span>}
            <span className="font-bold text-gray-900">{PLANS.yearly.name}</span>
            <span className="mt-1 font-display text-2xl font-black text-gray-950">{formatTl(PLANS.yearly.priceTl)} TL</span>
            <span className="text-sm text-gray-500">çocuk başına · 365 gün · aylık ~{formatTl(monthlyEquivalent)} TL</span>
          </label>
        </div>

        <h2 className="mt-8 text-lg font-bold text-gray-900">2. Kaç çocuk için?</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-2xl ring-1 ring-gray-200">
            <button type="button" aria-label="Azalt" disabled={count <= 1} onClick={() => setCount((c) => Math.max(1, c - 1))} className="p-3 text-gray-700 disabled:opacity-30">
              <Minus className="h-5 w-5" />
            </button>
            <output aria-live="polite" className="w-12 text-center text-xl font-black text-gray-950">{count}</output>
            <button type="button" aria-label="Artır" disabled={count >= max} onClick={() => setCount((c) => Math.min(max, c + 1))} className="p-3 text-gray-700 disabled:opacity-30">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">Her çocuk için ayrı koruma: {count} × {formatTl(plan.priceTl)} TL</p>
        </div>
        {kids.length > 0 && <p className="mt-2 text-sm text-gray-700">Eşleştirilmiş çocuklarınız: {kids.join(", ")}</p>}
        {kids.length > 0 && count > kids.length && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Şu an {kids.length} çocuğunuz eşleştirilmiş. Diğer çocuklarınızın telefonunu eşleştirdikten sonra onlar için de ödeme yapabilirsiniz.</p>
        )}

        <ul className="mt-6 grid gap-1.5 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-2">
          <li>✓ 9 risk kategorisinde sürekli koruma</li>
          <li>✓ Sınırsız uyarı ve anlık bildirim</li>
          <li>✓ Ebeveyn uygulaması ve web paneli</li>
          <li>✓ Haftalık ve aylık raporlar</li>
        </ul>
        <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-3">
          <p className="flex gap-2"><Zap className="h-5 w-5 shrink-0 text-brand-600" /> Teslimat: ödeme onayıyla hesabınızda hemen aktif olur.</p>
          <p className="flex gap-2"><RotateCcw className="h-5 w-5 shrink-0 text-brand-600" /> Otomatik yenileme yok; 14 gün içinde koşulsuz iade.</p>
          <p className="flex gap-2"><Lock className="h-5 w-5 shrink-0 text-brand-600" /> Kart bilgileriniz Mivvo&apos;ya iletilmez.</p>
        </div>
      </section>

      <aside aria-label="Sipariş özeti" className="h-fit rounded-3xl bg-white p-6 ring-1 ring-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Sipariş özeti</h2>
        <p className="mt-3 text-sm text-gray-700">Mivvo {plan.name} · {plan.days} gün</p>
        <p className="text-sm text-gray-500">{count} çocuk × {tl2(plan.priceTl)} TL</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><dt>Ara toplam (KDV hariç)</dt><dd>{tl2(net)} TL</dd></div>
          <div className="flex justify-between text-gray-600"><dt>KDV (%20)</dt><dd>{tl2(kdv)} TL</dd></div>
          <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-gray-950"><dt>Toplam</dt><dd>{tl2(total)} TL</dd></div>
        </dl>

        <Link href={next} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white hover:bg-brand-700">
          <Lock className="h-4 w-4" /> Ödemeye Geç
        </Link>
        {!signedIn && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Abonelik çocuğunuzun cihazına bağlandığı için ödeme hesabınızdan yapılır. Hesabınız yoksa <Link href="/kayit" className="font-semibold text-brand-700 underline">ücretsiz kaydolun</Link>.
          </p>
        )}

        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-700">Ödeme yöntemleri</p>
          <p className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Kredi / banka kartı (PayTR güvencesiyle, 3D Secure, tek çekim)</p>
          <p className="flex items-center gap-2"><Landmark className="h-4 w-4" /> Havale / EFT</p>
          <PaymentLogos className="pt-2" />
        </div>
        <p className="mt-4 text-xs leading-5 text-gray-500">
          Ödemeden önce <Link href="/on-bilgilendirme" className="underline">Ön Bilgilendirme Formu</Link>, <Link href="/mesafeli-satis" className="underline">Mesafeli Satış Sözleşmesi</Link> ve <Link href="/iptal-iade" className="underline">İptal ve İade Politikası</Link>&apos;nı onaylarsınız.
        </p>
      </aside>
    </div>
  );
}
