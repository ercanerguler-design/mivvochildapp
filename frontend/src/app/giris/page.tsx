import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-violet-600">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-2xl font-extrabold text-gray-900">Mivvo</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Ebeveyn panelinize giriş yapın</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-violet-600 font-semibold hover:underline">
            Ücretsiz kaydolun
          </Link>
        </p>
      </div>
    </div>
  );
}
