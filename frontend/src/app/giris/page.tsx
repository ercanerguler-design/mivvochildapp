import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { MivvoLogo } from "@/components/common/MivvoLogo";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-violet-600">
            <MivvoLogo size={34} textClassName="text-2xl" />
          </Link>
          <p className="text-gray-500 text-sm mt-2">{text.auth.loginTitle}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <LoginForm locale={locale} />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {text.auth.noAccount}{" "}
          <Link href="/kayit" className="text-violet-600 font-semibold hover:underline">
            {text.auth.goRegister}
          </Link>
        </p>
      </div>
    </div>
  );
}
