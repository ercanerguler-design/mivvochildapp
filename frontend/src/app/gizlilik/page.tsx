import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Mivvo",
  description: "Mivvo gizlilik politikası ve veri işleme esasları.",
};

export default async function PrivacyPage() {
  const locale = await getLocaleFromServerCookie();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {isEn ? "Privacy Policy" : "Gizlilik Politikası"}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {isEn
            ? "Last update: April 23, 2026"
            : "Son güncelleme: 23 Nisan 2026"}
        </p>

        <section className="space-y-6 text-sm leading-7 text-gray-700">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "1. Data We Process" : "1. İşlenen Veriler"}</h2>
            <p>
              {isEn
                ? "Mivvo processes only the minimum data required to detect digital safety risks for children. Full conversations are not permanently stored; only risk-related excerpts and risk metadata may be stored."
                : "Mivvo, çocukların dijital güvenlik risklerini tespit etmek için gerekli minimum veriyi işler. Tüm konuşmalar kalıcı olarak saklanmaz; yalnızca riskli içerik parçaları ve risk metadatası saklanabilir."}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "2. Purpose of Processing" : "2. Veri İşleme Amaçları"}</h2>
            <p>
              {isEn
                ? "Data is processed for child safety monitoring, risk detection, parent notification, product security, and legal compliance."
                : "Veriler; çocuk güvenliğinin sağlanması, risk tespiti, ebeveyn bilgilendirmesi, ürün güvenliği ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir."}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "3. Data Retention" : "3. Saklama Süresi"}</h2>
            <p>
              {isEn
                ? "Data is retained only for the required period for service delivery and legal obligations. Upon valid deletion requests, data is deleted or anonymized in accordance with applicable law."
                : "Veriler, hizmetin sunulması ve yasal yükümlülükler için gerekli süre boyunca saklanır. Geçerli silme taleplerinde, uygulanabilir mevzuata uygun şekilde silinir veya anonimleştirilir."}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "4. Contact" : "4. İletişim"}</h2>
            <p>
              {isEn
                ? "For privacy-related requests, contact us at sce@scegrup.com."
                : "Gizlilikle ilgili talepleriniz için sce@scegrup.com adresinden bizimle iletişime geçebilirsiniz."}
            </p>
          </div>
        </section>

        <div className="mt-10">
          <Link href="/" className="text-sm font-semibold text-violet-700 hover:text-violet-800">
            {isEn ? "Back to Home" : "Ana Sayfaya Dön"}
          </Link>
        </div>
      </div>
    </main>
  );
}
