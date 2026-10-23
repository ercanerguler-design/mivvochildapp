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
      mode?: "DAYS";
      daysTotal?: number;
      daysRemaining?: number;
      active?: boolean;
      startAt?: string;
      expiresAt?: string;
    };
    credits: number;
    unlimited?: {
      active: boolean;
      startAt?: string | null;
      expiresAt?: string | null;
      daysRemaining: number;
    };
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

type AdminOverview = {
  generatedAt: string;
  summary: {
    totalUsers: number;
    totalParents: number;
    totalChildren: number;
    totalAlerts: number;
    highRiskAlerts: number;
    pendingAlerts: number;
    totalAnalyses: number;
    analysesLast30Days: number;
  };
  downloads: {
    total: number;
    child: number;
    parent: number;
    last30Days: number;
  };
  billing: {
    totalLoadedCredits: number;
    totalConsumedCredits: number;
    loadTransactionCount: number;
    loadedCreditsLast30Days: number;
    totalReceivedTl: number;
    thisMonthReceivedTl: number;
    paidMarkCount: number;
    convertedParentCount: number;
    monthlyRevenue: Array<{
      month: string;
      paid_count: number;
      total_tl: number;
    }>;
  };
  members: {
    recentUsers: Array<{
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      createdAt: string;
      parentProfileId?: string | null;
      childCount: number;
      childProfileId?: string | null;
      childDisplayName?: string | null;
      childIsActive?: boolean | null;
    }>;
    topParents: Array<{
      id: string;
      name?: string | null;
      email?: string | null;
      childCount: number;
      activeChildCount: number;
      missingBirthDateCount: number;
      credits: number;
      createdAt: string;
    }>;
  };
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  hint,
  accent,
}: {
  title: string;
  value: string | number;
  hint: string;
  accent: "violet" | "emerald" | "sky" | "amber";
}) {
  const accentClasses: Record<typeof accent, string> = {
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${accentClasses[accent]}`}>
        {title}
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </article>
  );
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [parentId, setParentId] = useState("");
  const [credit, setCredit] = useState(10);
  const [reason, setReason] = useState("Havale ödemesi");
  const [subscriptionReason, setSubscriptionReason] = useState("299 TL aylik odeme alindi");
  const [subscriptionDays, setSubscriptionDays] = useState(30);
  const [lookup, setLookup] = useState<ParentLookup | null>(null);
  const [parents, setParents] = useState<ParentSummary[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [missingChildren, setMissingChildren] = useState<MissingBirthDateChild[]>([]);
  const [selectedMissingChildId, setSelectedMissingChildId] = useState("");
  const [selectedMissingChildBirthDate, setSelectedMissingChildBirthDate] = useState("");

  async function loadOverview() {
    setLoading(true);
    setMessage("");

    const normalizedKey = adminKey.trim();

    const res = await fetch("/api/admin/overview", {
      headers: { "x-admin-key": normalizedKey },
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Genel panel verileri alınamadı");
      return;
    }

    setOverview(json);
  }

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

  async function findParent(parentIdOverride?: string) {
    setLoading(true);
    setMessage("");
    setLookup(null);

    const normalizedKey = adminKey.trim();
    const targetParentId = parentIdOverride ?? parentId;

    if (!targetParentId) {
      setLoading(false);
      setMessage("Lutfen ebeveyn secin.");
      return;
    }

    const res = await fetch(`/api/admin/credits?parentId=${encodeURIComponent(targetParentId)}`, {
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

  async function selectParent(parentIdValue: string) {
    setParentId(parentIdValue);
    await findParent(parentIdValue);
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
    await loadOverview();
    await findParent();
  }

  async function activateUnlimitedPlan() {
    if (!parentId) {
      setMessage("Lutfen once ebeveyn secin.");
      return;
    }

    setLoading(true);
    setMessage("");

    const normalizedKey = adminKey.trim();
    const res = await fetch("/api/admin/subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": normalizedKey,
      },
      body: JSON.stringify({
        parentId,
        days: subscriptionDays,
        reason: subscriptionReason,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json?.error ?? "Abonelik aktivasyonu basarisiz");
      return;
    }

    setMessage(`${subscriptionDays} gunluk sinirsiz plan aktif edildi.`);
    await loadOverview();
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
    await loadOverview();
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-violet-50/30">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mivvo Admin Center</h1>
              <p className="mt-1 text-sm text-slate-600">
                Üye, indirme, kullanıcı, kredi/ödeme ve risk metriklerini tek panelden yönet.
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
              Premium Admin Dashboard
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadOverview}
              disabled={loading || !adminKey}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Yükleniyor..." : "Genel Paneli Yenile"}
            </button>
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
              onClick={() => {
                void findParent();
              }}
              disabled={loading || !adminKey || !parentId}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "Sorgulanıyor..." : "Ebeveyni Bul"}
            </button>
          </div>
        </section>

        {overview && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Toplam Üye"
                value={overview.summary.totalUsers}
                hint={`Ebeveyn: ${overview.summary.totalParents} | Çocuk: ${overview.summary.totalChildren}`}
                accent="violet"
              />
              <StatCard
                title="Toplam İndirme"
                value={overview.downloads.total}
                hint={`Çocuk: ${overview.downloads.child} | Ebeveyn: ${overview.downloads.parent}`}
                accent="sky"
              />
              <StatCard
                title="Toplam Alınan Ödeme*"
                value={formatCurrency(overview.billing.totalReceivedTl)}
                hint={`Bu ay: ${formatCurrency(overview.billing.thisMonthReceivedTl)} | Isaretlenen: ${overview.billing.paidMarkCount}`}
                accent="emerald"
              />
              <StatCard
                title="Yüksek Risk Uyarı"
                value={overview.summary.highRiskAlerts}
                hint={`Bekleyen: ${overview.summary.pendingAlerts} | Toplam: ${overview.summary.totalAlerts}`}
                accent="amber"
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900">Kullanıcılar (Son Kayıtlar)</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Son güncelleme: {formatDate(overview.generatedAt)}
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-3">Ad</th>
                        <th className="py-2 pr-3">E-posta</th>
                        <th className="py-2 pr-3">Rol</th>
                        <th className="py-2 pr-3">Çocuk</th>
                        <th className="py-2 pr-3">Kayıt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.members.recentUsers.map((u) => (
                        <tr key={u.id} className="border-b border-gray-50 align-top text-gray-700">
                          <td className="py-2 pr-3 font-medium">{u.name ?? "-"}</td>
                          <td className="py-2 pr-3">{u.email ?? "-"}</td>
                          <td className="py-2 pr-3">{u.role}</td>
                          <td className="py-2 pr-3">{u.childCount > 0 ? u.childCount : u.childDisplayName ?? "-"}</td>
                          <td className="py-2 pr-3 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">İş Metrikleri</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-gray-500">Son 30 gün indirme</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{overview.downloads.last30Days}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-gray-500">Toplam analiz</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{overview.summary.totalAnalyses}</p>
                    <p className="text-xs text-gray-500">Son 30 gün: {overview.summary.analysesLast30Days}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-gray-500">Ucretliye cevrilen ebeveyn</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{overview.billing.convertedParentCount}</p>
                    <p className="text-xs text-gray-500">
                      Aylik odeme isaretleme adedi: {overview.billing.paidMarkCount}
                    </p>
                  </div>
                </div>
              </article>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Aylik Odeme Ozeti (299 TL bazli)</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-2 pr-3">Ay</th>
                      <th className="py-2 pr-3">Ucretliye Cevirme Adedi</th>
                      <th className="py-2 pr-3">Toplam Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.billing.monthlyRevenue.map((m) => (
                      <tr key={m.month} className="border-b border-gray-50 text-gray-700">
                        <td className="py-2 pr-3">{m.month}</td>
                        <td className="py-2 pr-3">{m.paid_count}</td>
                        <td className="py-2 pr-3 font-semibold text-emerald-700">{formatCurrency(m.total_tl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Ebeveyn Segmenti</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-2 pr-3">Ebeveyn</th>
                      <th className="py-2 pr-3">Çocuk</th>
                      <th className="py-2 pr-3">Aktif Çocuk</th>
                      <th className="py-2 pr-3">Eksik Doğum Tarihi</th>
                      <th className="py-2 pr-3">Kredi</th>
                      <th className="py-2 pr-3">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.members.topParents.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 text-gray-700">
                        <td className="py-2 pr-3">
                          <div className="font-medium">{p.name ?? "İsimsiz"}</div>
                          <div className="text-xs text-gray-500">{p.email ?? "-"}</div>
                        </td>
                        <td className="py-2 pr-3">{p.childCount}</td>
                        <td className="py-2 pr-3">{p.activeChildCount}</td>
                        <td className="py-2 pr-3">{p.missingBirthDateCount}</td>
                        <td className="py-2 pr-3">{p.credits}</td>
                        <td className="py-2 pr-3">
                          <button
                            type="button"
                            onClick={() => {
                              void selectParent(p.id);
                            }}
                            className="rounded-lg border border-violet-200 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                          >
                            Seç
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                * "Toplam Alınan Ödeme" değeri, "Ödeme alındı" ile ücretliye çevrilen ebeveyn kayıtlarının 299 TL bazlı toplamıdır.
              </p>
            </section>
          </>
        )}

        <section className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-gray-700 space-y-1">
          <p className="font-semibold text-violet-700">Yönetim adımları</p>
          <p>1) Admin Key gir. 2) Genel paneli yenile. 3) Ebeveyn seç. 4) Kredi veya doğum tarihi işlemi yap.</p>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Kredi ve Doğum Tarihi Operasyonları</h2>
          <p className="text-sm text-gray-500">
            Bu bölümde ebeveyn detay sorgulama, kredi yükleme ve eksik doğum tarihi tamamlama işlemleri yapılır.
          </p>
        </div>

      </section>

      {parents.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Ebeveyn Listesi</h2>
          <div className="space-y-2">
            {parents.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  void selectParent(p.id);
                }}
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
          <p className="text-sm text-gray-700">
            14 gün deneme: {lookup.billing.trial.active ? "Aktif" : "Sona erdi"}
          </p>
          <p className="text-sm text-gray-700">
            Kalan deneme günü: {lookup.billing.trial.daysRemaining ?? lookup.billing.trial.remaining}
          </p>
          <p className="text-sm text-gray-700">Toplam analiz: {lookup.billing.trial.used}</p>
          <p className="text-sm font-semibold text-violet-700">Mevcut kredi: {lookup.billing.credits}</p>
          <p className="text-sm text-gray-700">
            Sinirsiz plan: {lookup.billing.unlimited?.active ? "Aktif" : "Pasif"}
          </p>
          <p className="text-sm text-gray-700">
            Plan bitis: {lookup.billing.unlimited?.expiresAt ? formatDate(lookup.billing.unlimited.expiresAt) : "-"}
          </p>
          <p className="text-sm text-gray-700">Kalan sinirsiz gun: {lookup.billing.unlimited?.daysRemaining ?? 0}</p>

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

          <div className="mt-2 rounded-xl border border-sky-100 bg-sky-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-sky-800">Odeme alindi isaretle (Aylik Sinirsiz)</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gun</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={subscriptionDays}
                  onChange={(e) => setSubscriptionDays(Math.max(1, Number(e.target.value) || 30))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Aciklama</label>
                <input
                  value={subscriptionReason}
                  onChange={(e) => setSubscriptionReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              onClick={activateUnlimitedPlan}
              disabled={loading || !adminKey || !parentId}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "Isleniyor..." : `${subscriptionDays} Gun Sinirsiz Aktif Et`}
            </button>
          </div>
        </section>
      )}

      {message && <p className="text-sm text-gray-700">{message}</p>}
      </div>
    </main>
  );
}

