"use client";

import { useEffect, useState } from "react";

type SettingsState = {
  sensitivityLevel: number;
  notifyPush: boolean;
  notifyEmail: boolean;
  fcmToken: string | null;
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
      setMessage("Could not save settings.");
      return;
    }

    setMessage("Settings saved.");
  }

  if (!data) {
    return <div className="text-sm text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Risk threshold: {data.sensitivityLevel}</label>
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
          Push notifications
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.notifyEmail}
            onChange={(e) => setData({ ...data, notifyEmail: e.target.checked })}
          />
          Email notifications
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
          {saving ? "Saving..." : "Save"}
        </button>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
