"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Gift,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Server,
  Smartphone,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { MivvoLogo } from "@/components/common/MivvoLogo";

// ─── Types (mirror src/lib/admin-data.ts) ─────────────────────────
type MemberStatus = "trial" | "trial_expired" | "paid" | "paid_expired";
type Member = {
  parentId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  status: MemberStatus;
  trialEndsAt: string;
  planExpiresAt: string | null;
  totalPaidTl: number;
  paymentCount: number;
  children: number;
  lastDeviceSeenAt: string | null;
  alerts30d: number;
};
type Month = { month: string; revenue: number; expense: number; net: number; payments: number; signups: number };
type Dashboard = {
  generatedAt: string;
  priceTl: number;
  members: { total: number; newThisMonth: number; newLastMonth: number; trial: number; trialExpired: number; paid: number; paidExpired: number; everPaid: number; conversionRate: number; withChild: number };
  finance: { mrr: number; revenueThisMonth: number; revenueLastMonth: number; expenseThisMonth: number; netThisMonth: number; revenueTotal: number; expense12m: number; arpu: number; monthly: Month[] };
  usage: { alerts30: number; highRisk30: number; analyses30: number; devicesOnline: number; downloads30: { app: string; count: number }[] };
  recentPayments: { id: string; email: string; name: string | null; amountTl: number; days: number; method: string; reason: string | null; createdAt: string }[];
  expenses: { id: string; spent_on: string; category: string; description: string | null; amount_tl: number }[];
  trialEndingSoon: { parentId: string; email: string | null; name: string | null; trialEndsAt: string; children: number }[];
  systemEvents: { kind: string; last_message: string; count: number; last_at: string }[];
};

const STATUS: Record<MemberStatus, { label: string; cls: string }> = {
  trial: { label: "Deneme", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  trial_expired: { label: "Deneme bitti", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  paid: { label: "Ücretli", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  paid_expired: { label: "Abonelik bitti", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const EXPENSE_CATEGORIES = [
  "Sunucu (Vercel)",
  "Veritabanı (Neon)",
  "Yapay zekâ (OpenAI)",
  "Uygulama (Expo/EAS)",
  "Google Play",
  "Ödeme komisyonu (iyzico)",
  "Pazarlama / Reklam",
  "Personel",
  "Muhasebe / Hukuk",
  "Diğer",
];

const tl = (n: number) => `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n)} ₺`;
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }) : "–");
const monthLabel = (k: string) => new Date(`${k}-01T00:00:00`).toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
const ago = (iso: string | null) => {
  if (!iso) return "–";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m} dk önce`;
  if (m < 1440) return `${Math.floor(m / 60)} sa önce`;
  return `${Math.floor(m / 1440)} gün önce`;
};
const KEY_STORAGE = "mivvo_admin_key";

type Tab = "overview" | "members" | "finance" | "system";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const api = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", "x-admin-key": key, ...(init.headers ?? {}) } });
      if (res.status === 401) {
        setAuthed(false);
        throw new Error("Yetkisiz: anahtar hatalı veya çok fazla deneme yapıldı.");
      }
      return res;
    },
    [key]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api("/api/admin/dashboard");
      if (!res.ok) throw new Error("Veriler alınamadı.");
      setData(await res.json());
      setAuthed(true);
      try {
        sessionStorage.setItem(KEY_STORAGE, key);
      } catch {}
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [api, key]);

  // Restore the key for this browser tab only.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY_STORAGE);
      // Restoring from browser storage after mount (not available during server render).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setKey(saved);
    } catch {}
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3500);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(KEY_STORAGE);
    } catch {}
    setAuthed(false);
    setData(null);
    setKey("");
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
          className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
        >
          <MivvoLogo size={34} textClassName="text-2xl" />
          <h1 className="mt-6 text-xl font-black text-gray-900">Yönetim paneli</h1>
          <p className="mt-1 text-sm text-gray-500">Devam etmek için yönetici anahtarını girin.</p>
          <input type="password" autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="ADMIN_PANEL_KEY" className="mt-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none" />
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <button disabled={!key || loading} className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50">
            {loading ? "Kontrol ediliyor…" : "Giriş yap"}
          </button>
        </form>
      </main>
    );
  }

  const nav: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "overview", label: "Genel bakış", icon: LayoutDashboard },
    { key: "members", label: "Üyeler", icon: Users },
    { key: "finance", label: "Finans", icon: Wallet },
    { key: "system", label: "Sistem", icon: Server },
  ];
  const aiDown = data?.systemEvents.find((e) => e.kind === "ai_analysis_failed" && data && new Date(data.generatedAt).getTime() - new Date(e.last_at).getTime() < 24 * 3600_000);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="border-b border-gray-200 bg-white lg:fixed lg:inset-y-0 lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <MivvoLogo size={28} textClassName="text-xl" />
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white lg:mt-2 lg:inline-block">YÖNETİM</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {nav.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${tab === n.key ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden px-3 lg:absolute lg:bottom-4 lg:block lg:w-full">
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100">
            <LogOut className="h-4 w-4" /> Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/90 px-5 py-3 backdrop-blur sm:px-8">
          <div>
            <h1 className="text-lg font-black text-gray-900">{nav.find((n) => n.key === tab)?.label}</h1>
            <p className="text-xs text-gray-400">Son güncelleme: {data ? new Date(data.generatedAt).toLocaleTimeString("tr-TR") : "–"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
            </button>
            <button onClick={logout} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 lg:hidden" aria-label="Çıkış">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="space-y-6 p-5 sm:p-8">
          {aiDown && (
            <div className="flex gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Yapay zekâ analizi son 24 saatte hata verdi ({aiDown.count} kez)</p>
                <p>Mesajlar şu an yedek kural motoruyla taranıyor. Son hata: {aiDown.last_message.slice(0, 160)}</p>
              </div>
            </div>
          )}
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {data && tab === "overview" && <Overview d={data} goMembers={() => setTab("members")} />}
          {data && tab === "members" && <MembersTab api={api} priceTl={data.priceTl} notify={notify} onChange={load} />}
          {data && tab === "finance" && <FinanceTab d={data} api={api} notify={notify} onChange={load} />}
          {data && tab === "system" && <SystemTab d={data} api={api} notify={notify} />}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

// ─── Building blocks ──────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 ${className}`}>{children}</div>;
}

function Kpi({ label, value, sub, icon: Icon, tone = "violet", trend }: { label: string; value: string; sub?: string; icon: typeof Users; tone?: "violet" | "emerald" | "amber" | "rose" | "sky"; trend?: number | null }) {
  const tones = { violet: "bg-violet-50 text-violet-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600", sky: "bg-sky-50 text-sky-600" };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`rounded-xl p-2 ${tones[tone]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-gray-900">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {trend !== undefined && trend !== null && (
          <span className={`flex items-center gap-0.5 font-bold ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
        {sub && <span className="text-gray-400">{sub}</span>}
      </div>
    </Card>
  );
}

const pct = (now: number, prev: number) => (prev ? Math.round(((now - prev) / prev) * 100) : null);

function RevenueChart({ months }: { months: Month[] }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.revenue, m.expense]));
  return (
    <div>
      <div className="flex h-56 items-end gap-1.5 sm:gap-3">
        {months.map((m) => (
          <div key={m.month} className="group relative flex flex-1 flex-col items-center gap-1">
            <div className="pointer-events-none absolute -top-14 z-10 hidden whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-[11px] text-white group-hover:block">
              Gelir {tl(m.revenue)} · Gider {tl(m.expense)}
              <br />
              Net {tl(m.net)} · {m.signups} yeni üye
            </div>
            <div className="flex h-48 w-full items-end justify-center gap-0.5">
              <div className="w-1/2 max-w-5 rounded-t-md bg-violet-500" style={{ height: `${(m.revenue / max) * 100}%`, minHeight: m.revenue ? 4 : 0 }} />
              <div className="w-1/2 max-w-5 rounded-t-md bg-rose-300" style={{ height: `${(m.expense / max) * 100}%`, minHeight: m.expense ? 4 : 0 }} />
            </div>
            <span className="text-[10px] text-gray-400 sm:text-xs">{monthLabel(m.month)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Gelir</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-300" /> Gider</span>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function Overview({ d, goMembers }: { d: Dashboard; goMembers: () => void }) {
  const m = d.members;
  const f = d.finance;
  const funnel = [
    { label: "Toplam kayıt", value: m.total, cls: "bg-violet-600" },
    { label: "Çocuk eşleştiren", value: m.withChild, cls: "bg-violet-500" },
    { label: "Denemesi biten", value: m.trialExpired + m.paid + m.paidExpired, cls: "bg-amber-400" },
    { label: "En az bir kez ödeyen", value: m.everPaid, cls: "bg-emerald-500" },
    { label: "Şu an ücretli", value: m.paid, cls: "bg-emerald-600" },
  ];
  const fmax = Math.max(1, ...funnel.map((x) => x.value));

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Toplam üye" value={String(m.total)} sub={`bu ay +${m.newThisMonth}`} icon={Users} trend={pct(m.newThisMonth, m.newLastMonth)} />
        <Kpi label="Deneme sürümünde" value={String(m.trial)} sub={`${m.trialExpired} kişinin denemesi bitti`} icon={Clock} tone="amber" />
        <Kpi label="Ücretli üye" value={String(m.paid)} sub={`${m.paidExpired} aboneliği bitti`} icon={CreditCard} tone="emerald" />
        <Kpi label="Dönüşüm oranı" value={`%${m.conversionRate}`} sub="denemesi bitenlerden ödeyen" icon={TrendingUp} tone="sky" />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Aylık tekrarlayan gelir (MRR)" value={tl(f.mrr)} sub={`${m.paid} × ${tl(d.priceTl)}`} icon={Wallet} tone="emerald" />
        <Kpi label="Bu ay gelir" value={tl(f.revenueThisMonth)} sub={`geçen ay ${tl(f.revenueLastMonth)}`} icon={TrendingUp} trend={pct(f.revenueThisMonth, f.revenueLastMonth)} />
        <Kpi label="Bu ay gider" value={tl(f.expenseThisMonth)} icon={TrendingDown} tone="rose" />
        <Kpi label="Bu ay net" value={tl(f.netThisMonth)} sub={f.netThisMonth >= 0 ? "kâr" : "zarar"} icon={BarChart3} tone={f.netThisMonth >= 0 ? "emerald" : "rose"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Son 12 ay gelir / gider</h2>
            <span className="text-xs text-gray-400">Toplam gelir {tl(f.revenueTotal)}</span>
          </div>
          <RevenueChart months={f.monthly} />
        </Card>
        <Card>
          <h2 className="mb-4 font-bold text-gray-900">Üye hunisi</h2>
          <div className="space-y-3">
            {funnel.map((x) => (
              <div key={x.label}>
                <div className="flex justify-between text-sm"><span className="text-gray-600">{x.label}</span><span className="font-bold text-gray-900">{x.value}</span></div>
                <div className="mt-1 h-2 rounded-full bg-gray-100"><div className={`h-2 rounded-full ${x.cls}`} style={{ width: `${(x.value / fmax) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Denemesi 3 gün içinde bitecekler</h2>
            <button onClick={goMembers} className="text-sm font-semibold text-violet-600">Tüm üyeler →</button>
          </div>
          {d.trialEndingSoon.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Yakında denemesi bitecek üye yok.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {d.trialEndingSoon.map((t) => (
                <li key={t.parentId} className="flex items-center justify-between py-2.5 text-sm">
                  <div><p className="font-semibold text-gray-900">{t.name ?? "–"}</p><p className="text-gray-500">{t.email}</p></div>
                  <div className="text-right"><p className="font-semibold text-amber-600">{date(t.trialEndsAt)}</p><p className="text-xs text-gray-400">{t.children} çocuk</p></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 font-bold text-gray-900">Kullanım (son 30 gün)</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Analiz edilen mesaj", value: d.usage.analyses30, icon: Activity },
              { label: "Üretilen uyarı", value: d.usage.alerts30, icon: AlertTriangle },
              { label: "Yüksek riskli uyarı", value: d.usage.highRisk30, icon: AlertTriangle },
              { label: "Son 24 saatte aktif cihaz", value: d.usage.devicesOnline, icon: Smartphone },
              ...d.usage.downloads30.map((x) => ({ label: `APK indirme (${x.app === "child" ? "çocuk" : "ebeveyn"})`, value: x.count, icon: Download })),
            ].map((x) => (
              <div key={x.label} className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1.5 text-xs text-gray-500"><x.icon className="h-3.5 w-3.5" />{x.label}</p>
                <p className="mt-1 text-xl font-black text-gray-900">{new Intl.NumberFormat("tr-TR").format(x.value)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

// ─── Members ──────────────────────────────────────────────────────
function MembersTab({ api, priceTl, notify, onChange }: { api: (p: string, i?: RequestInit) => Promise<Response>; priceTl: number; notify: (m: string) => void; onChange: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [grantFor, setGrantFor] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await api("/api/admin/members");
    if (res.ok) setMembers((await res.json()).members);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    let alive = true;
    api("/api/admin/members")
      .then((r) => (r.ok ? r.json() : { members: [] }))
      .then((j) => alive && setMembers(j.members))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [api]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: members.length };
    for (const m of members) c[m.status] = (c[m.status] ?? 0) + 1;
    return c;
  }, [members]);

  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr-TR");
    return members.filter((m) => (status === "all" || m.status === status) && (!needle || [m.name, m.email, m.phone].some((v) => v?.toLocaleLowerCase("tr-TR").includes(needle))));
  }, [members, q, status]);

  async function exportCsv() {
    const res = await api(`/api/admin/members?format=csv${status !== "all" ? `&status=${status}` : ""}`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mivvo-uyeler-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const chips: { key: MemberStatus | "all"; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "trial", label: "Deneme" },
    { key: "trial_expired", label: "Deneme bitti" },
    { key: "paid", label: "Ücretli" },
    { key: "paid_expired", label: "Abonelik bitti" },
  ];

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.key} onClick={() => setStatus(c.key)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${status === c.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c.label} <span className="opacity-60">{counts[c.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ad, e-posta, telefon…" className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none" />
          </label>
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Üye</th>
              <th className="px-3 py-3">Durum</th>
              <th className="px-3 py-3">Kayıt</th>
              <th className="px-3 py-3">Bitiş</th>
              <th className="px-3 py-3 text-right">Ödenen</th>
              <th className="px-3 py-3 text-center">Çocuk</th>
              <th className="px-3 py-3 text-center">Uyarı (30g)</th>
              <th className="px-3 py-3">Son cihaz</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-400">Yükleniyor…</td></tr>
            ) : shown.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
            ) : (
              shown.map((m) => (
                <tr key={m.parentId} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{m.name ?? "–"}</p>
                    <p className="text-xs text-gray-500">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                  </td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS[m.status].cls}`}>{STATUS[m.status].label}</span></td>
                  <td className="px-3 py-3 text-gray-600">{date(m.createdAt)}</td>
                  <td className="px-3 py-3 text-gray-600">{date(m.planExpiresAt ?? m.trialEndsAt)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-gray-900">{m.totalPaidTl ? tl(m.totalPaidTl) : "–"}</td>
                  <td className="px-3 py-3 text-center">{m.children}</td>
                  <td className="px-3 py-3 text-center">{m.alerts30d || "–"}</td>
                  <td className="px-3 py-3 text-gray-500">{ago(m.lastDeviceSeenAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setGrantFor(m)} className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">Abonelik ekle</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {grantFor && (
        <GrantModal
          member={grantFor}
          priceTl={priceTl}
          onClose={() => setGrantFor(null)}
          onSubmit={async (body) => {
            const res = await api("/api/admin/subscription", { method: "POST", body: JSON.stringify({ parentId: grantFor.parentId, ...body }) });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Kaydedilemedi");
            setGrantFor(null);
            notify("Abonelik tanımlandı");
            void fetchMembers();
            onChange();
          }}
        />
      )}
    </Card>
  );
}

function GrantModal({ member, priceTl, onClose, onSubmit }: { member: Member; priceTl: number; onClose: () => void; onSubmit: (b: { days: number; amountTl: number; reason?: string }) => Promise<void> }) {
  const [kind, setKind] = useState<"paid" | "gift">("paid");
  const [days, setDays] = useState(30);
  const [amount, setAmount] = useState(priceTl);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900">Abonelik ekle</h3>
            <p className="text-sm text-gray-500">{member.name ?? member.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={() => { setKind("paid"); setAmount(priceTl); }} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ring-1 ${kind === "paid" ? "bg-emerald-50 text-emerald-700 ring-emerald-300" : "text-gray-600 ring-gray-200"}`}><CreditCard className="h-4 w-4" /> Ödeme alındı</button>
          <button onClick={() => { setKind("gift"); setAmount(0); }} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ring-1 ${kind === "gift" ? "bg-violet-50 text-violet-700 ring-violet-300" : "text-gray-600 ring-gray-200"}`}><Gift className="h-4 w-4" /> Hediye</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-gray-700">Süre (gün)
            <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">Alınan tutar (₺)
            <input type="number" min={0} value={amount} disabled={kind === "gift"} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 disabled:bg-gray-50" />
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium text-gray-700">Not (isteğe bağlı)
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Örn. Havale – dekont no 1234" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
        </label>
        <p className="mt-3 text-xs text-gray-400">{kind === "gift" ? "Hediye abonelikler gelir olarak sayılmaz." : "Bu tutar gelir raporlarına eklenir."} Aktif abonelik varsa süre mevcut bitişin üzerine eklenir.</p>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <button
          disabled={busy || days < 1}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await onSubmit({ days, amountTl: kind === "gift" ? 0 : Math.max(0, Math.round(amount)), reason: reason || undefined });
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
          className="mt-5 w-full rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {busy ? "Kaydediliyor…" : `${days} gün tanımla`}
        </button>
      </div>
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────
function FinanceTab({ d, api, notify, onChange }: { d: Dashboard; api: (p: string, i?: RequestInit) => Promise<Response>; notify: (m: string) => void; onChange: () => void }) {
  const f = d.finance;
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ spentOn: today, category: EXPENSE_CATEGORIES[0], description: "", amountTl: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addExpense() {
    setBusy(true);
    setError("");
    const res = await api("/api/admin/expenses", { method: "POST", body: JSON.stringify({ ...form, amountTl: Number(form.amountTl.replace(",", ".")) }) });
    setBusy(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? "Kaydedilemedi");
    setForm({ ...form, description: "", amountTl: "" });
    notify("Gider eklendi");
    onChange();
  }

  async function removeExpense(id: string) {
    if (!confirm("Bu gider kaydı silinsin mi?")) return;
    await api(`/api/admin/expenses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    notify("Gider silindi");
    onChange();
  }

  const totals = f.monthly.reduce((a, m) => ({ revenue: a.revenue + m.revenue, expense: a.expense + m.expense, net: a.net + m.net, payments: a.payments + m.payments, signups: a.signups + m.signups }), { revenue: 0, expense: 0, net: 0, payments: 0, signups: 0 });

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Toplam gelir" value={tl(f.revenueTotal)} sub="tüm zamanlar" icon={Wallet} tone="emerald" />
        <Kpi label="Gider (12 ay)" value={tl(f.expense12m)} icon={TrendingDown} tone="rose" />
        <Kpi label="Net (12 ay)" value={tl(totals.net)} icon={BarChart3} tone={totals.net >= 0 ? "emerald" : "rose"} />
        <Kpi label="Ödeyen başına gelir" value={tl(f.arpu)} sub="ARPU" icon={Users} tone="sky" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-0">
          <h2 className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">Aylık özet</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="px-5 py-2.5 text-left">Ay</th><th className="px-3 py-2.5 text-right">Gelir</th><th className="px-3 py-2.5 text-right">Gider</th><th className="px-3 py-2.5 text-right">Net</th><th className="px-3 py-2.5 text-right">Ödeme</th><th className="px-5 py-2.5 text-right">Yeni üye</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...f.monthly].reverse().map((m) => (
                  <tr key={m.month}>
                    <td className="px-5 py-2.5 font-medium text-gray-700">{monthLabel(m.month)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-900">{tl(m.revenue)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{tl(m.expense)}</td>
                    <td className={`px-3 py-2.5 text-right font-bold ${m.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{tl(m.net)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{m.payments}</td>
                    <td className="px-5 py-2.5 text-right text-gray-600">{m.signups}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-5 py-2.5">Toplam</td>
                  <td className="px-3 py-2.5 text-right">{tl(totals.revenue)}</td>
                  <td className="px-3 py-2.5 text-right">{tl(totals.expense)}</td>
                  <td className={`px-3 py-2.5 text-right ${totals.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{tl(totals.net)}</td>
                  <td className="px-3 py-2.5 text-right">{totals.payments}</td>
                  <td className="px-5 py-2.5 text-right">{totals.signups}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900"><Plus className="h-4 w-4" /> Gider ekle</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-gray-700">Tarih
              <input type="date" value={form.spentOn} onChange={(e) => setForm({ ...form, spentOn: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-gray-700">Tutar (₺)
              <input inputMode="decimal" value={form.amountTl} onChange={(e) => setForm({ ...form, amountTl: e.target.value })} placeholder="0,00" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
            </label>
          </div>
          <label className="mt-3 block text-sm font-medium text-gray-700">Kategori
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2">
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium text-gray-700">Açıklama
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Örn. Ekim ayı OpenAI faturası" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
          </label>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          <button onClick={addExpense} disabled={busy || !Number(form.amountTl.replace(",", "."))} className="mt-4 w-full rounded-xl bg-gray-900 py-2.5 font-bold text-white hover:bg-gray-800 disabled:opacity-50">Kaydet</button>

          <h3 className="mb-2 mt-6 text-sm font-bold text-gray-900">Son giderler</h3>
          <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
            {d.expenses.length === 0 && <li className="py-4 text-center text-sm text-gray-400">Henüz gider girilmedi.</li>}
            {d.expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0"><p className="truncate font-medium text-gray-900">{e.category}</p><p className="truncate text-xs text-gray-500">{date(e.spent_on)}{e.description ? ` · ${e.description}` : ""}</p></div>
                <div className="flex items-center gap-2"><span className="font-bold text-gray-900">{tl(e.amount_tl)}</span><button onClick={() => removeExpense(e.id)} className="rounded p-1 text-gray-300 hover:bg-rose-50 hover:text-rose-600" aria-label="Sil"><Trash2 className="h-4 w-4" /></button></div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="p-0">
        <h2 className="border-b border-gray-100 px-5 py-4 font-bold text-gray-900">Son ödemeler ve abonelik hareketleri</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="px-5 py-2.5 text-left">Tarih</th><th className="px-3 py-2.5 text-left">Üye</th><th className="px-3 py-2.5 text-left">Yöntem</th><th className="px-3 py-2.5 text-right">Süre</th><th className="px-5 py-2.5 text-right">Tutar</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {d.recentPayments.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">Henüz ödeme yok.</td></tr>}
              {d.recentPayments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-2.5 text-gray-600">{date(p.createdAt)}</td>
                  <td className="px-3 py-2.5"><p className="font-medium text-gray-900">{p.name ?? "–"}</p><p className="text-xs text-gray-500">{p.email}</p></td>
                  <td className="px-3 py-2.5 text-gray-600">{p.method}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{p.days} gün</td>
                  <td className={`px-5 py-2.5 text-right font-bold ${p.amountTl ? "text-gray-900" : "text-violet-600"}`}>{p.amountTl ? tl(p.amountTl) : "Hediye"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ─── System ───────────────────────────────────────────────────────
type MissingChild = { id: string; displayName: string; parentEmail: string | null; createdAt: string };

function SystemTab({ d, api, notify }: { d: Dashboard; api: (p: string, i?: RequestInit) => Promise<Response>; notify: (m: string) => void }) {
  const [missing, setMissing] = useState<MissingChild[] | null>(null);
  const [dates, setDates] = useState<Record<string, string>>({});

  const loadMissing = useCallback(async () => {
    const res = await api("/api/admin/credits?mode=missing-birthdate");
    if (res.ok) setMissing((await res.json()).children);
  }, [api]);

  useEffect(() => {
    let alive = true;
    api("/api/admin/credits?mode=missing-birthdate")
      .then((r) => (r.ok ? r.json() : { children: [] }))
      .then((j) => alive && setMissing(j.children))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [api]);

  const eventLabel: Record<string, string> = { ai_analysis_failed: "Yapay zekâ analizi hatası", retention_run: "Otomatik veri temizliği" };

  return (
    <>
      <Card>
        <h2 className="mb-3 font-bold text-gray-900">Sistem olayları (son 72 saat)</h2>
        {d.systemEvents.length === 0 ? (
          <p className="flex items-center gap-2 py-4 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Kayıtlı sorun yok.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {d.systemEvents.map((e) => (
              <li key={e.kind} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div>
                  <p className={`font-semibold ${e.kind.includes("failed") ? "text-rose-700" : "text-gray-900"}`}>{eventLabel[e.kind] ?? e.kind}</p>
                  <p className="text-xs text-gray-500">{e.last_message.slice(0, 200)}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-gray-500"><p>{ago(e.last_at)}</p><p>{e.count} kez</p></div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-bold text-gray-900">Doğum tarihi eksik çocuk profilleri</h2>
        <p className="mb-3 text-sm text-gray-500">Doğum tarihi olmayan profiller için mesaj analizi yapılmaz (18 yaş kontrolü).</p>
        {!missing ? (
          <p className="text-sm text-gray-400">Yükleniyor…</p>
        ) : missing.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Eksik kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {missing.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <div><p className="font-semibold text-gray-900">{c.displayName}</p><p className="text-xs text-gray-500">{c.parentEmail}</p></div>
                <div className="flex gap-2">
                  <input type="date" value={dates[c.id] ?? ""} onChange={(e) => setDates({ ...dates, [c.id]: e.target.value })} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm" />
                  <button
                    disabled={!dates[c.id]}
                    onClick={async () => {
                      const res = await api("/api/admin/credits", { method: "PATCH", body: JSON.stringify({ childId: c.id, birthDate: dates[c.id] }) });
                      if (res.ok) {
                        notify("Doğum tarihi kaydedildi");
                        void loadMissing();
                      } else alert((await res.json().catch(() => ({}))).error ?? "Kaydedilemedi");
                    }}
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Kaydet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
