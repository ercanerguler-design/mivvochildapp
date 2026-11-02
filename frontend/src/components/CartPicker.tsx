"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Landmark, Lock, Minus, Plus, RotateCcw, Zap } from "lucide-react";
import { PaymentLogos } from "@/components/PaymentLogos";
import { MAX_CART_CHILDREN, PLANS, YEARLY_SAVING_TL, formatTl, type PlanId } from "@/lib/plans";
import type { Locale } from "@/lib/i18n";

const KDV_RATE = 0.2;
const tl2 = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  initialPlan: PlanId;
  initialCount: number;
  signedIn: boolean;
  /** Number of the signed-in parent's paired children (0 for visitors). */
  pairedCount: number;
  locale: Locale;
};

/** Plan and child-count picker of the public cart, with the order summary. */
export function CartPicker({ initialPlan, initialCount, signedIn, pairedCount, locale }: Props) {
  const en = locale === "en";
  const t = (tr: string, eng: string) => (en ? eng : tr);
  const TL = en ? "TRY" : "TL";
  const planName = (id: PlanId) => (en ? PLANS[id].nameEn : PLANS[id].name);
  const max = Math.max(MAX_CART_CHILDREN, pairedCount);
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [count, setCount] = useState(Math.min(Math.max(1, initialCount), max));
  const plan = PLANS[planId];
  const total = plan.priceTl * count;
  const net = Math.round((total / (1 + KDV_RATE)) * 100) / 100;
  const kdv = Math.round((total - net) * 100) / 100;

  const checkout = `/dashboard/abonelik?plan=${plan.slug}&adet=${count}`;
  const next = signedIn ? checkout : `/giris?next=${encodeURIComponent(checkout)}`;
  const monthlyEquivalent = Math.round(PLANS.yearly.priceTl / 12);

  const option = (id: PlanId) =>
    `relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition-colors ${planId === id ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
      <section aria-label="Ürünler" className="rounded-3xl bg-white p-6 ring-1 ring-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{t("1. Plan seçin", "1. Choose a plan")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t("Abonelik planı", "Subscription plan")}>
          <label className={option("monthly")}>
            <input type="radio" name="plan" className="sr-only" checked={planId === "monthly"} onChange={() => setPlanId("monthly")} />
            <span className="font-bold text-gray-900">{planName("monthly")}</span>
            <span className="mt-1 font-display text-2xl font-black text-gray-950">{formatTl(PLANS.monthly.priceTl)} {TL}</span>
            <span className="text-sm text-gray-500">{t("çocuk başına · 30 gün", "per child · 30 days")}</span>
          </label>
          <label className={option("yearly")}>
            <input type="radio" name="plan" className="sr-only" checked={planId === "yearly"} onChange={() => setPlanId("yearly")} />
            {YEARLY_SAVING_TL > 0 && <span className="absolute -top-3 right-4 rounded-full bg-coral-500 px-2.5 py-0.5 text-xs font-bold text-white">{t(`${formatTl(YEARLY_SAVING_TL)} TL kazanç`, `Save ${formatTl(YEARLY_SAVING_TL)} TRY`)}</span>}
            <span className="font-bold text-gray-900">{planName("yearly")}</span>
            <span className="mt-1 font-display text-2xl font-black text-gray-950">{formatTl(PLANS.yearly.priceTl)} {TL}</span>
            <span className="text-sm text-gray-500">{t(`çocuk başına · 365 gün · aylık ~${formatTl(monthlyEquivalent)} TL`, `per child · 365 days · ~${formatTl(monthlyEquivalent)} TRY a month`)}</span>
          </label>
        </div>

        <h2 className="mt-8 text-lg font-bold text-gray-900">{t("2. Kaç çocuk için?", "2. How many children?")}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-2xl ring-1 ring-gray-200">
            <button type="button" aria-label={t("Azalt", "Decrease")} disabled={count <= 1} onClick={() => setCount((c) => Math.max(1, c - 1))} className="p-3 text-gray-700 disabled:opacity-30">
              <Minus className="h-5 w-5" />
            </button>
            <output aria-live="polite" className="w-12 text-center text-xl font-black text-gray-950">{count}</output>
            <button type="button" aria-label={t("Artır", "Increase")} disabled={count >= max} onClick={() => setCount((c) => Math.min(max, c + 1))} className="p-3 text-gray-700 disabled:opacity-30">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600">{t("Her çocuk için ayrı koruma", "Separate protection for each child")}: {count} × {formatTl(plan.priceTl)} {TL}</p>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t("Telefonu henüz eşleştirilmemiş çocuğunuzun aboneliği, eşleştirdiğiniz gün başlar.", "For a child whose phone is not paired yet, the subscription starts on the day you pair it.")}</p>

        <ul className="mt-6 grid gap-1.5 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-2">
          <li>✓ {t("9 risk kategorisinde sürekli koruma", "Continuous protection in 9 risk categories")}</li>
          <li>✓ {t("Sınırsız uyarı ve anlık bildirim", "Unlimited alerts and instant notifications")}</li>
          <li>✓ {t("Ebeveyn uygulaması ve web paneli", "Parent app and web dashboard")}</li>
          <li>✓ {t("Haftalık ve aylık raporlar", "Weekly and monthly reports")}</li>
        </ul>
        <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-3">
          <p className="flex gap-2"><Zap className="h-5 w-5 shrink-0 text-brand-600" /> {t("Teslimat: ödeme onayıyla hesabınızda hemen aktif olur.", "Delivery: active on your account as soon as payment is confirmed.")}</p>
          <p className="flex gap-2"><RotateCcw className="h-5 w-5 shrink-0 text-brand-600" /> {t("Otomatik yenileme yok; 14 gün içinde koşulsuz iade.", "No auto-renewal; full refund within 14 days.")}</p>
          <p className="flex gap-2"><Lock className="h-5 w-5 shrink-0 text-brand-600" /> {t("Kart bilgileriniz Mivvo'ya iletilmez.", "Your card details never reach Mivvo.")}</p>
        </div>
      </section>

      <aside aria-label={t("Sipariş özeti", "Order summary")} className="h-fit rounded-3xl bg-white p-6 ring-1 ring-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{t("Sipariş özeti", "Order summary")}</h2>
        <p className="mt-3 text-sm text-gray-700">Mivvo {planName(planId)} · {plan.days} {t("gün", "days")}</p>
        <p className="text-sm text-gray-500">{count} {t("çocuk", "child(ren)")} × {tl2(plan.priceTl)} {TL}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><dt>{t("Ara toplam (KDV hariç)", "Subtotal (excl. VAT)")}</dt><dd>{tl2(net)} {TL}</dd></div>
          <div className="flex justify-between text-gray-600"><dt>{t("KDV (%20)", "VAT (20%)")}</dt><dd>{tl2(kdv)} {TL}</dd></div>
          <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-gray-950"><dt>{t("Toplam", "Total")}</dt><dd>{tl2(total)} {TL}</dd></div>
        </dl>

        <Link href={next} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white hover:bg-brand-700">
          <Lock className="h-4 w-4" /> {t("Ödemeye Geç", "Proceed to Payment")}
        </Link>
        {!signedIn && (
          <p className="mt-2 text-center text-xs text-gray-500">
            {t("Abonelik çocuğunuzun cihazına bağlandığı için ödeme hesabınızdan yapılır. Hesabınız yoksa", "The subscription is linked to your child's device, so payment is made from your account. No account yet?")}{" "}
            <Link href="/kayit" className="font-semibold text-brand-700 underline">{t("ücretsiz kaydolun", "Sign up free")}</Link>.
          </p>
        )}

        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-700">{t("Ödeme yöntemleri", "Payment methods")}</p>
          <p className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> {t("Kredi / banka kartı (PayTR güvencesiyle, 3D Secure, tek çekim)", "Credit / debit card (secured by PayTR, 3D Secure, single payment)")}</p>
          <p className="flex items-center gap-2"><Landmark className="h-4 w-4" /> {t("Havale / EFT", "Bank transfer")}</p>
          <PaymentLogos className="pt-2" />
        </div>
        <p className="mt-4 text-xs leading-5 text-gray-500">
          {en ? (
            <>Before paying you accept the <Link href="/on-bilgilendirme" className="underline">Pre-Contract Information</Link>, <Link href="/mesafeli-satis" className="underline">Distance Sales Agreement</Link> and <Link href="/iptal-iade" className="underline">Cancellation &amp; Refund Policy</Link> (in Turkish, legally binding).</>
          ) : (
            <>Ödemeden önce <Link href="/on-bilgilendirme" className="underline">Ön Bilgilendirme Formu</Link>, <Link href="/mesafeli-satis" className="underline">Mesafeli Satış Sözleşmesi</Link> ve <Link href="/iptal-iade" className="underline">İptal ve İade Politikası</Link>&apos;nı onaylarsınız.</>
          )}
        </p>
      </aside>
    </div>
  );
}
