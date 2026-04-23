import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  ShieldAlert,
  Moon,
  UserPlus,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ─── Platform meta ──────────────────────────────────────────
const PLATFORMS = [
  { key: "INSTAGRAM",  label: "Instagram",  color: "from-pink-500 to-rose-500",   bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-100",  emoji: "📸" },
  { key: "WHATSAPP",   label: "WhatsApp",   color: "from-emerald-500 to-green-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", emoji: "💬" },
  { key: "TIKTOK",     label: "TikTok",     color: "from-gray-800 to-gray-600",   bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-100",  emoji: "🎵" },
  { key: "SNAPCHAT",   label: "Snapchat",   color: "from-yellow-400 to-amber-400", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100", emoji: "👻" },
  { key: "TELEGRAM",   label: "Telegram",   color: "from-blue-500 to-sky-500",    bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",  emoji: "✈️" },
  { key: "SMS",        label: "SMS",        color: "from-violet-500 to-purple-500", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", emoji: "📱" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  BULLYING: "Zorbalık",
  VIOLENCE: "Şiddet",
  SEXUAL_RISK: "Cinsel Risk",
  THREAT: "Tehdit",
  PROFANITY: "Küfür",
  EXTREME_ANGER: "Aşırı Öfke",
  STRANGER_CONTACT: "Yabancı Kişi",
};

const CATEGORY_COLORS: Record<string, string> = {
  BULLYING: "bg-rose-100 text-rose-700",
  VIOLENCE: "bg-red-100 text-red-700",
  SEXUAL_RISK: "bg-purple-100 text-purple-700",
  THREAT: "bg-orange-100 text-orange-700",
  PROFANITY: "bg-yellow-100 text-yellow-700",
  EXTREME_ANGER: "bg-pink-100 text-pink-700",
  STRANGER_CONTACT: "bg-indigo-100 text-indigo-700",
};

export default async function SosyalMedyaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { children: { select: { id: true, displayName: true } } },
  });

  if (!parent) redirect("/kurulum");

  const childIds = parent.children.map((c) => c.id);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    platformAlerts,
    allContacts,
    nightActivitiesCount,
    newContactsToday,
    totalActivities24h,
    recentActivities,
    newContactsList,
  ] = await Promise.all([
    db.alert.groupBy({
      by: ["platform"],
      where: { childId: { in: childIds }, platform: { not: null }, createdAt: { gte: since24h } },
      _count: { id: true },
    }),
    db.contact.findMany({
      where: { childId: { in: childIds } },
      select: { isKnown: true },
    }),
    db.socialActivity.count({
      where: { childId: { in: childIds }, isNightTime: true, createdAt: { gte: since24h } },
    }),
    db.contact.count({
      where: { childId: { in: childIds }, firstSeenAt: { gte: since24h } },
    }),
    db.socialActivity.count({
      where: { childId: { in: childIds }, createdAt: { gte: since24h } },
    }),
    db.socialActivity.findMany({
      where: { childId: { in: childIds }, createdAt: { gte: since7d } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        child: { select: { displayName: true } },
        alert: { select: { category: true, status: true, riskScore: true } },
        contact: { select: { isKnown: true, displayName: true } },
      },
    }),
    db.contact.findMany({
      where: { childId: { in: childIds }, isKnown: false, firstSeenAt: { gte: since7d } },
      orderBy: { firstSeenAt: "desc" },
      take: 10,
      include: { child: { select: { displayName: true } } },
    }),
  ]);

  const totalContacts = allContacts.length;
  const unknownContacts = allContacts.filter((c) => !c.isKnown).length;
  const unknownRatio = totalContacts > 0 ? Math.round((unknownContacts / totalContacts) * 100) : 0;

  const alertsByPlatform: Record<string, number> = {};
  for (const row of platformAlerts) {
    if (row.platform) alertsByPlatform[row.platform] = row._count.id;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sosyal Medya İzleme</h2>
        <p className="text-sm text-gray-500 mt-1">
          Instagram, WhatsApp, TikTok ve diğer platformlardaki aktiviteler
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalActivities24h}</div>
            <div className="text-xs text-gray-500">Son 24s Aktivite</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Moon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{nightActivitiesCount}</div>
            <div className="text-xs text-gray-500">Gece Aktivitesi</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{newContactsToday}</div>
            <div className="text-xs text-gray-500">Yeni Tanışma (24s)</div>
          </div>
        </div>

        <div className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${
          unknownRatio >= 50 ? "border-red-200 bg-red-50" :
          unknownRatio >= 30 ? "border-orange-200 bg-orange-50" : "border-gray-100"
        }`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            unknownRatio >= 50 ? "bg-red-100" :
            unknownRatio >= 30 ? "bg-orange-100" : "bg-gray-100"
          }`}>
            <Users className={`w-5 h-5 ${
              unknownRatio >= 50 ? "text-red-600" :
              unknownRatio >= 30 ? "text-orange-600" : "text-gray-600"
            }`} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              unknownRatio >= 50 ? "text-red-700" :
              unknownRatio >= 30 ? "text-orange-700" : "text-gray-900"
            }`}>
              %{unknownRatio}
            </div>
            <div className="text-xs text-gray-500">Bilinmeyen Kişi</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Platform Durumu (Son 24 Saat)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLATFORMS.map((p) => {
            const count = alertsByPlatform[p.key] ?? 0;
            return (
              <div
                key={p.key}
                className={`rounded-2xl border p-4 text-center ${p.bg} ${p.border}`}
              >
                <div className="text-2xl mb-1">{p.emoji}</div>
                <div className={`text-xs font-semibold mb-2 ${p.text}`}>{p.label}</div>
                {count > 0 ? (
                  <div className="flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-sm font-bold text-red-600">{count}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-600">Temiz</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Son Aktiviteler</h3>
            <p className="text-xs text-gray-400 mt-0.5">Son 7 gün</p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldAlert className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Henüz aktivite kaydedilmedi.</p>
              <p className="text-gray-300 text-xs mt-1">Mobil uygulama kurulumunu tamamlayın.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {recentActivities.map((act) => {
                const platformMeta = PLATFORMS.find((p) => p.key === act.platform);
                const nightIcon = act.isNightTime ? "🌙 " : "";
                const newIcon = act.isNewContact ? "🆕 " : "";

                return (
                  <div key={act.id} className="px-5 py-3.5 flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${platformMeta?.bg ?? "bg-gray-50"}`}>
                      {platformMeta?.emoji ?? "📱"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${platformMeta?.text ?? "text-gray-600"}`}>
                          {platformMeta?.label ?? act.platform}
                        </span>
                        {act.contactUsername && (
                          <span className="text-xs text-gray-400">@{act.contactUsername}</span>
                        )}
                        {act.alert && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            CATEGORY_COLORS[act.alert.category] ?? "bg-gray-100 text-gray-600"
                          }`}>
                            {CATEGORY_LABELS[act.alert.category] ?? act.alert.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {nightIcon}{newIcon}
                        {act.messageContent ?? act.activityType}
                      </p>

                      <p className="text-xs text-gray-300 mt-0.5">
                        {act.child.displayName} •{" "}
                        {new Date(act.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {act.alert && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        act.alert.riskScore >= 80 ? "bg-red-100 text-red-600" :
                        act.alert.riskScore >= 50 ? "bg-orange-100 text-orange-600" :
                        "bg-yellow-100 text-yellow-600"
                      }`}>
                        %{act.alert.riskScore}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Yeni Tanışmalar</h3>
            <p className="text-xs text-gray-400 mt-0.5">Son 7 gün</p>
          </div>

          {newContactsList.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Yeni tanışma yok</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {newContactsList.map((contact) => {
                const platformMeta = PLATFORMS.find((p) => p.key === contact.platform);
                return (
                  <div key={contact.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      contact.isKnown ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {(contact.displayName ?? contact.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.displayName ?? `@${contact.username}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {platformMeta?.label ?? contact.platform} • {contact.child.displayName}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      contact.isKnown ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {contact.isKnown ? "Tanıdık" : "Bilinmeyen"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {newContactsList.some((c) => !c.isKnown) && (
            <div className="px-5 py-3 border-t border-orange-100 bg-orange-50 rounded-b-2xl">
              <p className="text-xs text-orange-600">
                ⚠️ Bilinmeyen kişiler dikkat gerektiriyor.
                Tanıdığınız kişileri onaylayabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nightActivitiesCount >= 5 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
            <Moon className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                Gece saatlerinde artan iletişim
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Son 24 saatte {nightActivitiesCount} gece aktivitesi tespit edildi.
                Çocuğunuzla uyku düzeni hakkında konuşmanızı öneririz.
              </p>
            </div>
          </div>
        )}

        {unknownRatio >= 30 && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
            <Users className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                Yüksek bilinmeyen kullanıcı oranı
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                İletişim kurulan kişilerin %{unknownRatio}&apos;i bilinmiyor.
                Çocuğunuzla çevrimiiçi güvenlik kurallarını gözden geçirin.
              </p>
            </div>
          </div>
        )}

        {newContactsToday >= 3 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                Sosyal medyada yeni kişiyle yoğun mesajlaşma
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Bugün {newContactsToday} yeni kişiyle iletişim kuruldu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
