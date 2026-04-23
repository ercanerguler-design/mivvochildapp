"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { MivvoLogo } from "@/components/common/MivvoLogo";

type Step = "profile" | "child" | "done";

export default function KurulumPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile step
  const [fcmToken, setFcmToken] = useState("");

  // Child step
  const [childName, setChildName] = useState("");
  const [childDeviceId, setChildDeviceId] = useState("");

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/setup/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fcmToken }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Hata oluştu.");
      return;
    }
    setStep("child");
  }

  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/setup/child", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: childName, deviceId: childDeviceId }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Hata oluştu.");
      return;
    }
    setStep("done");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <MivvoLogo size={34} textClassName="text-2xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Kurulum Sihirbazı</h1>
          <p className="text-sm text-gray-500 mt-1">Birkaç adımda korumaya başlayın</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {(["profile", "child", "done"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step === s
                    ? "bg-violet-600 text-white"
                    : ["child", "done"].includes(step) && i === 0
                    ? "bg-emerald-500 text-white"
                    : step === "done" && i === 1
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {(step === "child" && i === 0) || (step === "done" && i <= 1) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className={`w-12 h-0.5 ${i < ["profile","child","done"].indexOf(step) ? "bg-emerald-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* STEP 1: Profile */}
          {step === "profile" && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Ebeveyn Profili</h2>
                <p className="text-sm text-gray-500">
                  Bildirim almak için telefon FCM token&apos;ınızı girebilirsiniz (opsiyonel). 
                  Daha sonra ayarlardan da ekleyebilirsiniz.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  FCM Token{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  value={fcmToken}
                  onChange={(e) => setFcmToken(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  placeholder="Mobil uygulama kurulduktan sonra otomatik alınır"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Devam Et
              </button>
            </form>
          )}

          {/* STEP 2: Add Child */}
          {step === "child" && (
            <form onSubmit={handleAddChild} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">İlk Çocuğu Ekle</h2>
                <p className="text-sm text-gray-500">
                  Takip etmek istediğiniz çocuğun bilgilerini girin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Çocuğun Adı
                </label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  placeholder="Örn: Ahmet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cihaz ID{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  value={childDeviceId}
                  onChange={(e) => setChildDeviceId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  placeholder="Mobil uygulamadan otomatik alınır"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Çocuk Ekle &amp; Devam Et
              </button>
            </form>
          )}

          {/* STEP 3: Done */}
          {step === "done" && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Kurulum Tamamlandı!</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Mivvo artık çocuğunuzu korumaya hazır. Dashboard&apos;dan tüm uyarıları takip edebilirsiniz.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Dashboard&apos;a Git
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
