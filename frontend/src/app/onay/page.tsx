import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasCurrentConsents } from "@/lib/consents";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import { ConsentForm } from "./ConsentForm";

export const metadata: Metadata = { title: "Sözleşme onayı", robots: { index: false, follow: false } };

export default async function ConsentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  if (await hasCurrentConsents(session.user.id)) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-orange-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-brand-600/10 ring-1 ring-gray-100">
        <MivvoLogo size={36} textClassName="text-2xl" />
        <h1 className="mt-6 font-display text-2xl font-black text-gray-900">Devam etmeden önce</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Kullanım koşullarımızı ve kişisel verilerin korunmasına ilişkin metinlerimizi güncelledik. Mivvo&apos;yu kullanmaya devam etmek için lütfen aşağıdaki onayları verin.
        </p>
        <ConsentForm />
      </div>
    </main>
  );
}
