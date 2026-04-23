import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

export const metadata: Metadata = {
  title: "İletişim | Mivvo",
  description: "Mivvo iletişim bilgileri.",
};

export default async function ContactPage() {
  const locale = await getLocaleFromServerCookie();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{isEn ? "Contact" : "İletişim"}</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <h2 className="mb-2 text-base font-semibold text-gray-900">📍 {isEn ? "Head Office" : "Merkez Adres"}</h2>
            <p className="text-sm text-gray-700 leading-6">
              Çetin Emeç Bulvarı No:25/3
              <br />
              ANKARA
            </p>
          </section>

          <section className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <h2 className="mb-2 text-base font-semibold text-gray-900">📞 {isEn ? "Phone Center" : "Telefon Merkezi"}</h2>
            <p className="text-sm text-gray-700 leading-6">
              0850 888 1 889
              <br />
              {isEn ? "Monday-Friday: 09:00-18:00" : "Pazartesi-Cuma: 09:00-18:00"}
            </p>
          </section>

          <section className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <h2 className="mb-2 text-base font-semibold text-gray-900">💬 {isEn ? "Contact Channels" : "İletişim Kanalları"}</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p>WhatsApp: +90 543 392 92 30</p>
              <p>Email: sce@scegrup.com</p>
            </div>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm font-semibold text-violet-700 hover:text-violet-800">
            {isEn ? "Back to Home" : "Ana Sayfaya Dön"}
          </Link>
        </div>
      </div>
    </main>
  );
}
