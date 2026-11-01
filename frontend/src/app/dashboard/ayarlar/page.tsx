"use client";

import { useEffect, useState } from "react";
import { CheckoutCard } from "@/components/dashboard/CheckoutCard";
import { SITE } from "@/lib/site";
import { DeleteAccountCard } from "@/components/dashboard/DeleteAccountCard";

const MONTHLY_PRICE_TL = SITE.monthlyPriceTl;

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
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-gray-700">
          <p className="font-semibold text-violet-700">Ebeveyn ID: {data.id}</p>
          <p className="mt-1">Ödeme açıklamasına ebeveyn ID ve ad-soyad yazılmalıdır.</p>
        </div>

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

        <div>
          <label className="text-sm font-medium text-gray-700">Risk eşiği: {data.sensitivityLevel}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={data.sensitivityLevel}
            onChange={(e) => setData({ ...data, sensitivityLevel: Number(e.target.value) })}
            className="w-full mt-2"
          />
        </div>

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

      <div id="abonelik" className="scroll-mt-24" />
      {data.cardPayments ? (
        <CheckoutCard priceTl={MONTHLY_PRICE_TL} days={30} childPlans={data.billing?.children ?? []} />
      ) : (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-sm text-violet-900">
          <p className="font-semibold">Aylık abonelik: çocuk başına {MONTHLY_PRICE_TL} TL (KDV dahil) · 30 gün</p>
          <p className="mt-1">Her çocuk için ayrı abonelik gerekir (örneğin 2 çocuk için {MONTHLY_PRICE_TL * 2} TL). Ödemeler şu an havale/EFT ile alınmaktadır. Ödemenizi aşağıdaki hesaba yaptıktan sonra hangi çocuk(lar) için ödediğinizi WhatsApp veya e-posta ile bildirin; abonelik aynı gün aktif edilir. Kartla ödeme yakında.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 text-sm text-gray-700">
        <h3 className="text-lg font-semibold text-gray-900">Havale / EFT ile ödeme</h3>
        <p><span className="font-medium">Şirket Adı:</span> SCE Innovation Ltd.Şti</p>
        <p><span className="font-medium">Banka:</span> Türkiye Garanti Bankası</p>
        <p><span className="font-medium">IBAN:</span> TR48 0006 2000 7740 0006 2930 33</p>
        <p><span className="font-medium">Hesap No:</span> 774-6293033</p>
        <p><span className="font-medium">Şube:</span> Etlik Şubesi</p>
        <p className="text-violet-700 font-medium">
          Açıklama kısmına ebeveyn ID&apos;nizi ve adınızı yazmanızı rica ederiz.
        </p>
      </div>
      <DeleteAccountCard />
    </div>
  );
}

