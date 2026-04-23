"use client";

import { useState } from "react";

type ParentLookup = {
  parent: {
    id: string;
    name?: string | null;
    email?: string | null;
    childCount: number;
  };
  billing: {
    trial: {
      limit: number;
      used: number;
      remaining: number;
      exceeded: boolean;
    };
    credits: number;
  };
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [parentId, setParentId] = useState("");
  const [credit, setCredit] = useState(10);
  const [reason, setReason] = useState("Havale odemesi");
  const [lookup, setLookup] = useState<ParentLookup | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function findParent() {
    setLoading(true);
    setMessage("");
    setLookup(null);

    const res = await fetch(`/api/admin/credits?parentId=${encodeURIComponent(parentId)}`, {
      headers: { "x-admin-key": adminKey },
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Sorgu basarisiz");
      return;
    }

    setLookup(json);
  }

  async function addCredit() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ parentId, amount: credit, reason }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Kredi yukleme basarisiz");
      return;
    }

    setMessage("Kredi yuklendi.");
    await findParent();
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin - Kredi Yonetimi</h1>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Admin Key</label>
          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            type="password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="ADMIN_PANEL_KEY"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ebeveyn ID</label>
          <input
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="cuid parent ID"
          />
        </div>

        <button
          onClick={findParent}
          disabled={loading || !adminKey || !parentId}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Sorgulaniyor..." : "Ebeveyni Bul"}
        </button>
      </section>

      {lookup && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Ebeveyn Bilgisi</h2>
          <p className="text-sm text-gray-700">ID: {lookup.parent.id}</p>
          <p className="text-sm text-gray-700">Ad: {lookup.parent.name ?? "-"}</p>
          <p className="text-sm text-gray-700">Email: {lookup.parent.email ?? "-"}</p>
          <p className="text-sm text-gray-700">Cocuk sayisi: {lookup.parent.childCount}</p>
          <p className="text-sm text-gray-700">Ucretsiz analiz: {lookup.billing.trial.used}/{lookup.billing.trial.limit}</p>
          <p className="text-sm font-semibold text-violet-700">Mevcut kredi: {lookup.billing.credits}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Yuklenecek kredi</label>
              <input
                type="number"
                min={1}
                value={credit}
                onChange={(e) => setCredit(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Aciklama</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={addCredit}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Yukleniyor..." : "Kredi Yukle"}
          </button>
        </section>
      )}

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </main>
  );
}
