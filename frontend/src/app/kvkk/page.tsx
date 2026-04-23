import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Mivvo",
  description: "Mivvo 6698 sayılı KVKK aydınlatma metni.",
};

export default async function KvkkPage() {
  const locale = await getLocaleFromServerCookie();
  const isEn = locale === "en";

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {isEn ? "KVKK Disclosure Text" : "KVKK Aydınlatma Metni"}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          {isEn
            ? "Prepared under Turkish Data Protection Law No. 6698"
            : "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır."}
        </p>

        <section className="space-y-6 text-sm leading-7 text-gray-700">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "Data Controller" : "Veri Sorumlusu"}</h2>
            <p>
              SCE Grup / Mivvo
              <br />
              Cetin Emec Bulvari No:25/3, Ankara
              <br />
              sce@scegrup.com
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "Legal Basis and Purpose" : "Hukuki Sebep ve Amaç"}</h2>
            <p>
              {isEn
                ? "Personal data is processed based on explicit consent, legal obligations, and legitimate interests for the purposes of child safety monitoring, risk alerting, and service continuity."
                : "Kişisel veriler; açık rıza, hukuki yükümlülük ve meşru menfaat hukuki sebeplerine dayanılarak çocuk güvenliği takibi, risk uyarısı üretimi ve hizmet sürekliliği amaçlarıyla işlenir."}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "Your Rights" : "Haklarınız"}</h2>
            <p>
              {isEn
                ? "Under Article 11 of KVKK, you may request information on processed data, correction, deletion, and objection to unlawful processing."
                : "KVKK'nın 11. maddesi kapsamında; işlenen veriye ilişkin bilgi talep etme, düzeltme, silme ve hukuka aykırı işleme itiraz etme haklarına sahipsiniz."}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{isEn ? "Application Method" : "Başvuru Yöntemi"}</h2>
            <p>
              {isEn
                ? "You can submit your requests to sce@scegrup.com. Applications are evaluated and finalized within legal time limits."
                : "Taleplerinizi sce@scegrup.com adresine iletebilirsiniz. Başvurular yasal süreler içinde değerlendirilir ve sonuçlandırılır."}
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
