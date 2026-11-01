import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { PAYTR_IFRAME_URL } from "@/lib/paytr";
import { PaytrFrame } from "./PaytrFrame";

export const metadata = { title: "Güvenli ödeme", robots: { index: false } };

/** Hosts PayTR's card form. The token comes from /api/payments/checkout and is single-use. */
export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  if (!t || !/^[A-Za-z0-9]{10,200}$/.test(t)) redirect("/dashboard/ayarlar");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Güvenli ödeme</h1>
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <Lock className="h-4 w-4" /> Kart bilgileriniz PayTR tarafından alınır, Mivvo&apos;ya iletilmez.
          </p>
        </div>
        <Link href="/dashboard/ayarlar" className="text-sm font-semibold text-gray-500 hover:text-gray-800">
          Vazgeç
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2">
        <PaytrFrame src={`${PAYTR_IFRAME_URL}${t}`} />
      </div>
    </div>
  );
}
