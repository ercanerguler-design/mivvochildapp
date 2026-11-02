import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Landmark } from "lucide-react";
import { CheckoutCard } from "@/components/dashboard/CheckoutCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";
import { getParentBillingStatus, listUnusedChildSeats } from "@/lib/subscription";

export const metadata = { title: "Abonelik ve ödeme", robots: { index: false } };

/** Checkout page; the cart sends ?plan=yillik&adet=2 here, PayTR results come back with ?odeme=. */
export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris?next=/dashboard/abonelik");
  const parent = await db.parentProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!parent) redirect("/dashboard");

  const [billing, seats] = await Promise.all([getParentBillingStatus(parent.id), listUnusedChildSeats(parent.id)]);
  const children = billing.children.map((c) => ({
    id: c.childId,
    name: c.displayName,
    active: c.active,
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Abonelik ve ödeme</h2>
        <p className="mt-1 text-sm text-gray-500">Planınızı ve çocuk sayısını seçin; toplam tutarı ödemeden önce sipariş özetinde görürsünüz.</p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
        <CheckoutCard paired={children} pendingSeats={seats.length} />
      </Suspense>

      <details className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-700">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold text-gray-900"><Landmark className="h-4 w-4 text-violet-600" /> Havale / EFT ile ödemek istiyorum</summary>
        <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
          <p><span className="font-medium">Hesap sahibi:</span> {SITE.legal.name}</p>
          <p><span className="font-medium">Banka:</span> Türkiye Garanti Bankası, Etlik Şubesi</p>
          <p><span className="font-medium">IBAN:</span> TR48 0006 2000 7740 0006 2930 33</p>
          <p><span className="font-medium">Hesap No:</span> 774-6293033</p>
        </div>
        <p className="mt-3 text-violet-700">Açıklamaya hesabınızın e-posta adresini ({session.user.email}), plan ve çocuk sayısını yazın. Aboneliğiniz aynı gün etkinleştirilir.</p>
      </details>
    </div>
  );
}
