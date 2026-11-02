import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasCurrentConsents } from "@/lib/consents";
import { validName } from "@/lib/phone";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import { ConsentForm } from "./ConsentForm";

export const metadata: Metadata = { title: "Hesabınızı tamamlayın", robots: { index: false, follow: false } };

/** Shown once before the panel when the name, mobile number or current consents are missing. */
export default async function ConsentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  const [user, consented] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { name: true, phone: true } }),
    hasCurrentConsents(session.user.id),
  ]);
  const needName = !user?.name || !validName(user.name);
  const needPhone = !user?.phone;
  const needConsent = !consented;
  if (!needName && !needPhone && !needConsent) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-orange-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-brand-600/10 ring-1 ring-gray-100">
        <MivvoLogo size={36} textClassName="text-2xl" />
        <h1 className="mt-6 font-display text-2xl font-black text-gray-900">{needName || needPhone ? "Hesabınızı tamamlayın" : "Devam etmeden önce"}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {needName || needPhone
            ? "Panelinize geçmeden önce birkaç bilgiyi tamamlamanız gerekiyor. Bu işlem yalnızca bir kez yapılır."
            : "Kullanım koşullarımızı ve kişisel verilerin korunmasına ilişkin metinlerimizi güncelledik. Mivvo'yu kullanmaya devam etmek için lütfen aşağıdaki onayları verin."}
        </p>
        <ConsentForm needName={needName} needPhone={needPhone} needConsent={needConsent} defaultName={user?.name ?? ""} />
      </div>
    </main>
  );
}
