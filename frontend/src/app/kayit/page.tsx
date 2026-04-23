import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-violet-600" />
            <span className="text-2xl font-extrabold text-gray-900">Mivvo</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Ücretsiz ebeveyn hesabı oluşturun</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-violet-600 font-semibold hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
