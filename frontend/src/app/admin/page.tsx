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

type ParentSummary = {
  id: string;
  name?: string | null;
  email?: string | null;
  childCount: number;
  missingBirthDateCount?: number;
};

type MissingBirthDateChild = {
  id: string;
  displayName: string;
  parentId: string;
  parentName?: string | null;
  parentEmail?: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [parentId, setParentId] = useState("");
  const [credit, setCredit] = useState(10);
  const [reason, setReason] = useState("Havale ödemesi");
  const [lookup, setLookup] = useState<ParentLookup | null>(null);
  const [parents, setParents] = useState<ParentSummary[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [missingChildren, setMissingChildren] = useState<MissingBirthDateChild[]>([]);
  const [selectedMissingChildId, setSelectedMissingChildId] = useState("");
  const [selectedMissingChildBirthDate, setSelectedMissingChildBirthDate] = useState("");

  async function listParents() {
    setLoading(true);
    setMessage("");

    const normalizedKey = adminKey.trim();

    const res = await fetch("/api/admin/credits", {
      headers: { "x-admin-key": normalizedKey },
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Ebeveyn listesi alınamadı");
      return;
    }

    setParents(json.parents ?? []);
    if (!json.parents?.length) {
      setMessage("Henüz kayıtlı ebeveyn bulunamadı.");
    }
  }

  async function listMissingBirthDateChildren() {
    setLoading(true);
    setMessage("");

    const normalizedKey = adminKey.trim();
    const res = await fetch("/api/admin/credits?mode=missing-birthdate", {
      headers: { "x-admin-key": normalizedKey },
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Eksik doğum tarihi kayıtları alınamadı");
      return;
    }

    setMissingChildren(json.children ?? []);
    if (!json.children?.length) {
      setMessage("Doğum tarihi eksik çocuk kaydı bulunmuyor.");
    }
  }

  async function findParent() {
    setLoading(true);
    setMessage("");
    setLookup(null);

    const normalizedKey = adminKey.trim();

    const res = await fetch(`/api/admin/credits?parentId=${encodeURIComponent(parentId)}`, {
      headers: { "x-admin-key": normalizedKey },
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Sorgu başarısız");
      return;
    }

    setLookup(json);
  }

  async function addCredit() {
    setLoading(true);
    setMessage("");

    const normalizedKey = adminKey.trim();

    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": normalizedKey,
      },
      body: JSON.stringify({ parentId, amount: credit, reason }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Kredi yükleme başarısız");
      return;
    }

    setMessage("Kredi yüklendi.");
    await findParent();
  }

  async function completeBirthDate() {
    if (!selectedMissingChildId || !selectedMissingChildBirthDate) {
      setMessage("Çocuk ve doğum tarihi seçmelisin.");
      return;
    }

    setLoading(true);
    setMessage("");

    const normalizedKey = adminKey.trim();
    const res = await fetch("/api/admin/credits", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": normalizedKey,
      },
      body: JSON.stringify({
        childId: selectedMissingChildId,
        birthDate: selectedMissingChildBirthDate,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Doğum tarihi tamamlama başarısız");
      return;
    }

    setMessage("Doğum tarihi başarıyla tamamlandı.");
    setMissingChildren((prev) => prev.filter((item) => item.id !== selectedMissingChildId));
    setSelectedMissingChildId("");
    setSelectedMissingChildBirthDate("");
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin - Kredi Yönetimi</h1>

      <section className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-gray-700 space-y-1">
        <p className="font-semibold text-violet-700">Giriş adımları</p>
        <p>1) Admin Key alanına ADMIN_PANEL_KEY değerini yaz.</p>
        <p>2) "Ebeveynleri Listele" ile listeden ebeveyn seç.</p>
        <p>3) "Ebeveyni Bul" ile detayı aç, sonra kredi yükle.</p>
      </section>

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
          onClick={listParents}
          disabled={loading || !adminKey}
          className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60"
        >
          {loading ? "Listeleniyor..." : "Ebeveynleri Listele"}
        </button>

        <button
          onClick={listMissingBirthDateChildren}
          disabled={loading || !adminKey}
          className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
        >
          {loading ? "Yükleniyor..." : "Eksik Doğum Tarihlerini Listele"}
        </button>

        <button
          onClick={findParent}
          disabled={loading || !adminKey || !parentId}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? "Sorgulanıyor..." : "Ebeveyni Bul"}
        </button>
      </section>

      {parents.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Ebeveyn Listesi</h2>
          <div className="space-y-2">
            {parents.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setParentId(p.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  parentId === p.id
                    ? "border-violet-300 bg-violet-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-gray-800">{p.name ?? "İsimsiz ebeveyn"}</div>
                <div className="text-gray-500">{p.email ?? "E-posta yok"}</div>
                <div className="text-gray-500">ID: {p.id}</div>
                <div className="text-amber-700">Eksik doğum tarihi: {p.missingBirthDateCount ?? 0}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {missingChildren.length > 0 && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-amber-800">Zorunlu Doğum Tarihi Tamamlama</h2>
          <div className="space-y-2 max-h-64 overflow-auto">
            {missingChildren.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedMissingChildId(child.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedMissingChildId === child.id
                    ? "border-amber-300 bg-white"
                    : "border-amber-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="font-medium text-gray-800">{child.displayName}</div>
                <div className="text-gray-600">Ebeveyn: {child.parentName ?? "-"} ({child.parentEmail ?? "-"})</div>
                <div className="text-gray-500">Çocuk ID: {child.id}</div>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Seçili çocuk ID</label>
              <input
                value={selectedMissingChildId}
                onChange={(e) => setSelectedMissingChildId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="cuid child ID"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Doğum tarihi</label>
              <input
                type="date"
                value={selectedMissingChildBirthDate}
                onChange={(e) => setSelectedMissingChildBirthDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={completeBirthDate}
            disabled={loading || !adminKey || !selectedMissingChildId || !selectedMissingChildBirthDate}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Doğum Tarihini Zorunlu Tamamla"}
          </button>
        </section>
      )}

      {lookup && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Ebeveyn Bilgisi</h2>
          <p className="text-sm text-gray-700">ID: {lookup.parent.id}</p>
          <p className="text-sm text-gray-700">Ad: {lookup.parent.name ?? "-"}</p>
          <p className="text-sm text-gray-700">Email: {lookup.parent.email ?? "-"}</p>
          <p className="text-sm text-gray-700">Çocuk sayısı: {lookup.parent.childCount}</p>
          <p className="text-sm text-gray-700">Ücretsiz analiz: {lookup.billing.trial.used}/{lookup.billing.trial.limit}</p>
          <p className="text-sm font-semibold text-violet-700">Mevcut kredi: {lookup.billing.credits}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Yüklenecek kredi</label>
              <input
                type="number"
                min={1}
                value={credit}
                onChange={(e) => setCredit(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Açıklama</label>
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
            {loading ? "Yükleniyor..." : "Kredi Yükle"}
          </button>
        </section>
      )}

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </main>
  );
}

