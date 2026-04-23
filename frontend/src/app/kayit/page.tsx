import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export default async function RegisterPage() {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <MivvoLogo size={34} textClassName="text-2xl" />
          </Link>
          <p className="text-gray-500 text-sm mt-2">{text.auth.registerTitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <RegisterForm locale={locale} />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {text.auth.hasAccount}{" "}
          <Link href="/giris" className="text-violet-600 font-semibold hover:underline">
            {text.auth.goLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
