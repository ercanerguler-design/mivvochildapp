"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";

export function RegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const text = t(locale);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptConsent, setAcceptConsent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(text.auth.passwordMismatch);
      return;
    }
    if (form.password.length < 8) {
      setError(text.auth.passwordMin);
      return;
    }
    if (!acceptTerms || !acceptConsent) {
      setError(locale === "en" ? "Please accept the terms and the explicit consent to continue." : "Devam etmek için sözleşmeleri ve açık rıza metnini onaylayın.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, acceptTerms, acceptConsent }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? text.auth.registerError);
      setLoading(false);
      return;
    }

    // Otomatik giriş yap
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/kurulum");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          {text.auth.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          placeholder="Adınız Soyadınız"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          {text.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          placeholder="ornek@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          {text.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          placeholder="En az 8 karakter"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          {text.auth.passwordRepeat}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-3 rounded-xl bg-violet-50/60 p-4">
      <label className="flex items-start gap-3 text-xs leading-5 text-gray-600">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-violet-600" />
        <span><Link href="/kullanim-kosullari" target="_blank" className="font-semibold text-violet-700 underline">Kullanım Koşulları</Link>&apos;nı okudum, kabul ediyorum; <Link href="/kvkk" target="_blank" className="font-semibold text-violet-700 underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum.</span>
      </label>
      <label className="flex items-start gap-3 text-xs leading-5 text-gray-600">
        <input type="checkbox" checked={acceptConsent} onChange={(e) => setAcceptConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-violet-600" />
        <span><Link href="/acik-riza" target="_blank" className="font-semibold text-violet-700 underline">Açık Rıza Metni</Link> kapsamında çocuğumun mesaj bildirimlerinin risk analizi için işlenmesine ve yurt dışındaki hizmet sağlayıcılara aktarılmasına açık rıza veriyorum.</span>
      </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {text.auth.createAccountButton}
      </button>
    </form>
  );
}
