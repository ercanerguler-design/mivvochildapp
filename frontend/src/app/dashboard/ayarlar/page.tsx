"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { SITE } from "@/lib/site";
import { DeleteAccountCard } from "@/components/dashboard/DeleteAccountCard";


type SettingsState = {
  id: string;
  sensitivityLevel: number;
  notifyPush: boolean;
  notifyEmail: boolean;
  fcmToken: string | null;
  cardPayments?: boolean;
  billing?: {
    trial: {
      limit: number;
      used: number;
      remaining: number;
      exceeded: boolean;
      mode?: "DAYS";
      daysTotal?: number;
      daysRemaining?: number;
      active?: boolean;
      startAt?: string;
      expiresAt?: string;
    };
    credits: number;
    children?: { childId: string; displayName: string; active: boolean; expiresAt?: string | null; daysRemaining: number; coveredBy?: "account" | "child" | null }[];
    unlimited?: {
      active: boolean;
      startAt?: string | null;
      expiresAt?: string | null;
      daysRemaining: number;
    };
    isUnlimitedActive?: boolean;
    childAppFree: boolean;
  };
};

// Alert threshold presets (risk score 0-100). Lower = more alerts. 70 is the default for new accounts.
const SENSITIVITY = [
  { value: 55, label: "Yüksek hassasiyet", desc: "Hafif hakaret ve şüpheli tanışmalar dahil daha fazla uyarı. Küçük yaştaki çocuklar için." },
  { value: 70, label: "Dengeli (önerilen)", desc: "Zorbalık, ağır hakaret, madde teklifi ve daha ciddi durumlar. Gereksiz uyarı az olur." },
  { value: 85, label: "Sadece ciddi durumlar", desc: "Yalnızca tehdit, şantaj, cinsel risk, kendine zarar ve yabancı kişi gibi yüksek riskler." },
] as const;
const closestSensitivity = (v: number) => SENSITIVITY.reduce((a, b) => (Math.abs(b.value - v) < Math.abs(a.value - v) ? b : a)).value;

export default function SettingsPage() {
  const [data, setData] = useState<SettingsState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings/parent")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  async function save() {
    if (!data) return;
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/settings/parent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);
    if (!res.ok) {
      setMessage("Ayarlar kaydedilemedi.");
      return;
    }

    setMessage("Ayarlar kaydedildi.");
  }

  if (!data) {
    return <div className="text-sm text-gray-500">Ayarlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
          <p className="font-semibold text-gray-900">Kullanım Durumu</p>
          <p>{SITE.trialDays} gün deneme: {data.billing?.trial.active ? "Aktif" : "Sona erdi"}</p>
          <p>Kalan deneme günü: {data.billing?.trial.daysRemaining ?? data.billing?.trial.remaining ?? 0}</p>
          <p>Toplam analiz (deneme dahil): {data.billing?.trial.used ?? 0}</p>
          {(data.billing?.children ?? []).length === 0 ? (
            <p>Abonelik: henüz eşleşmiş çocuk yok</p>
          ) : (
            (data.billing?.children ?? []).map((c) => (
              <p key={c.childId}>
                {c.displayName}: {c.coveredBy === "account" ? `hesap aboneliği kapsıyor (${c.daysRemaining} gün kaldı)` : c.active ? `abonelik aktif (${c.daysRemaining} gün kaldı)` : data.billing?.trial.active ? "deneme süresinde" : "aboneliği yok, mesajlar analiz edilmiyor"}
              </p>
            ))
          )}
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Uyarı hassasiyeti</legend>
          <p className="mt-1 text-xs text-gray-500">Hangi mesajlarda size uyarı gönderileceğini belirler. Ciddi tehlikeler (tehdit, cinsel içerik, kendine zarar, yabancı kişi) her seçenekte bildirilir.</p>
          <div className="mt-3 space-y-2">
            {SENSITIVITY.map((o) => {
              const checked = closestSensitivity(data.sensitivityLevel) === o.value;
              return (
                <label key={o.value} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${checked ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input type="radio" name="sensitivity" className="mt-0.5 accent-violet-600" checked={checked} onChange={() => setData({ ...data, sensitivityLevel: o.value })} />
                  <span>
                    <span className="font-semibold text-gray-900">{o.label}</span>
                    <span className="block text-xs text-gray-500">{o.desc}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.notifyPush}
            onChange={(e) => setData({ ...data, notifyPush: e.target.checked })}
          />
          Push bildirimleri
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.notifyEmail}
            onChange={(e) => setData({ ...data, notifyEmail: e.target.checked })}
          />
          E-posta bildirimleri
        </label>

        <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          Telefon bildirimleri için bir şey girmenize gerek yok: Mivvo Ebeveyn uygulamasına giriş yaptığınızda telefonunuz otomatik olarak kaydedilir.
        </p>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="text-sm">
          <p className="font-semibold text-gray-900">Abonelik ve ödeme</p>
          <p className="text-gray-600">Aylık veya yıllık plan satın alın, sürenizi uzatın.</p>
        </div>
        <Link href="/dashboard/abonelik" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
          <CreditCard className="h-4 w-4" /> Aboneliğe git
        </Link>
      </div>

      <DeleteAccountCard />
    </div>
  );
}

