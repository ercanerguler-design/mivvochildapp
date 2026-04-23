"use client";

import { useEffect, useState } from "react";

type SettingsState = {
  id: string;
  sensitivityLevel: number;
  notifyPush: boolean;
  notifyEmail: boolean;
  fcmToken: string | null;
  billing?: {
    trial: {
      limit: number;
      used: number;
      remaining: number;
      exceeded: boolean;
    };
    credits: number;
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
          <p>Ücretsiz analiz: {data.billing?.trial.used ?? 0} / {data.billing?.trial.limit ?? 7}</p>
          <p>Kalan ücretsiz hak: {data.billing?.trial.remaining ?? 0}</p>
          <p>Mevcut kredi: {data.billing?.credits ?? 0}</p>
          <p>Çocuk uygulaması: {data.billing?.childAppFree ? "Ücretsiz" : "Ücretli"}</p>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">FCM token</label>
          <input
            type="text"
            value={data.fcmToken ?? ""}
            onChange={(e) => setData({ ...data, fcmToken: e.target.value || null })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 text-sm text-gray-700">
        <h3 className="text-lg font-semibold text-gray-900">Banka / Havale Bilgileri</h3>
        <p><span className="font-medium">Şirket Adı:</span> SCE Innovation Ltd.Şti</p>
        <p><span className="font-medium">Banka:</span> Türkiye Garanti Bankası</p>
        <p><span className="font-medium">IBAN:</span> TR48 0006 2000 7740 0006 2930 33</p>
        <p><span className="font-medium">Hesap No:</span> 774-6293033</p>
        <p><span className="font-medium">Şube:</span> Etlik Şubesi</p>
        <p className="text-violet-700 font-medium">
          Açıklama kısmına ebeveyn ID&apos;nizi ve adınızı yazmanızı rica ederiz.
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
          Kart ödeme (Iyzico / VISA): Yakında gelecek. Aylık abonelik bedeli 299 TL.
        </div>
      </div>
    </div>
  );
}

