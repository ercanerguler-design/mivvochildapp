export type Locale = "tr" | "en";

const DEFAULT_LOCALE: Locale = "tr";

export function getLocaleFromClientCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;

  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("mivvo_locale="))
    ?.split("=")[1];

  if (value === "tr" || value === "en") return value;
  return DEFAULT_LOCALE;
}

export const dictionary = {
  tr: {
    appName: "Mivvo",
    dashboard: {
      panelTitle: "Ebeveyn Paneli",
      welcome: "Hoş geldiniz",
      parentDefaultName: "Ebeveyn",
      summaryText: "Çocuklarınızın dijital güvenlik durumu aşağıda özetlenmiştir.",
      stats: {
        total: "Toplam Uyarı",
        pending: "Bekleyen",
        resolved: "Çözüldü",
        childCount: "Takip Edilen Çocuk",
      },
      recentAlerts: "Son Uyarılar",
      viewAll: "Tümünü Gör",
      noAlerts: "Henüz uyarı yok. Her şey yolunda!",
      children: "Çocuklarım",
      manage: "Yönet",
      activeProtection: "Aktif koruma",
      passiveProtection: "Pasif",
      pendingSuffix: "bekleyen",
    },
    sidebar: {
      overview: "Genel Bakış",
      alerts: "Uyarılar",
      social: "Sosyal Medya",
      children: "Çocuklarım",
      reports: "Raporlar",
      settings: "Ayarlar",
      signOut: "Çıkış Yap",
    },
    social: {
      title: "Sosyal Medya İzleme",
      subtitle: "Instagram, WhatsApp, TikTok ve diğer platformlardaki aktiviteler",
      cards: {
        totalActivity: "Son 24s Aktivite",
        nightActivity: "Gece Aktivitesi",
        newContacts: "Yeni Tanışma (24s)",
        unknownRatio: "Bilinmeyen Kişi",
      },
      metrics: {
        profanity24h: "24s Küfürlü Etkileşim",
        aggressiveInstagram: "Instagram Agresif Dil (24s)",
      },
      platformStatus: "Platform Durumu (Son 24 Saat)",
      clean: "Temiz",
      recentActivities: "Son Aktiviteler",
      last7d: "Son 7 gün",
      noActivity: "Henüz aktivite kaydedilmedi.",
      setupHint: "Mobil uygulama kurulumunu tamamlayın.",
      newContactsTitle: "Yeni Tanışmalar",
      noNewContacts: "Yeni tanışma yok",
      known: "Tanıdık",
      unknown: "Bilinmeyen",
      unknownHint: "Bilinmeyen kişiler dikkat gerektiriyor. Tanıdığınız kişileri onaylayabilirsiniz.",
      insightNightTitle: "Gece saatlerinde artan iletişim",
      insightNightDesc: "Son 24 saatte {{count}} gece aktivitesi tespit edildi. Çocuğunuzla uyku düzeni hakkında konuşmanızı öneririz.",
      insightUnknownTitle: "Yüksek bilinmeyen kullanıcı oranı",
      insightUnknownDesc: "İletişim kurulan kişilerin %{{ratio}}'i bilinmiyor. Çocuğunuzla çevrimiçi güvenlik kurallarını gözden geçirin.",
      insightNewContactTitle: "Sosyal medyada yeni kişiyle yoğun mesajlaşma",
      insightNewContactDesc: "Bugün {{count}} yeni kişiyle iletişim kuruldu.",
    },
    pages: {
      alerts: "Uyarılar",
      children: "Çocuklar",
      reports: "Raporlar",
      settings: "Ayarlar",
    },
  },
  en: {
    appName: "Mivvo",
    dashboard: {
      panelTitle: "Parent Panel",
      welcome: "Welcome",
      parentDefaultName: "Parent",
      summaryText: "Your children's digital safety summary is shown below.",
      stats: {
        total: "Total Alerts",
        pending: "Pending",
        resolved: "Resolved",
        childCount: "Tracked Children",
      },
      recentAlerts: "Recent Alerts",
      viewAll: "View All",
      noAlerts: "No alerts yet. Everything looks good!",
      children: "Children",
      manage: "Manage",
      activeProtection: "Active protection",
      passiveProtection: "Passive",
      pendingSuffix: "pending",
    },
    sidebar: {
      overview: "Overview",
      alerts: "Alerts",
      social: "Social Media",
      children: "Children",
      reports: "Reports",
      settings: "Settings",
      signOut: "Sign Out",
    },
    social: {
      title: "Social Media Monitoring",
      subtitle: "Activities across Instagram, WhatsApp, TikTok and other platforms",
      cards: {
        totalActivity: "24h Activity",
        nightActivity: "Night Activity",
        newContacts: "New Contacts (24h)",
        unknownRatio: "Unknown Contact Ratio",
      },
      metrics: {
        profanity24h: "Profanity Interactions (24h)",
        aggressiveInstagram: "Aggressive Language on Instagram (24h)",
      },
      platformStatus: "Platform Status (Last 24 Hours)",
      clean: "Clean",
      recentActivities: "Recent Activities",
      last7d: "Last 7 days",
      noActivity: "No activity recorded yet.",
      setupHint: "Complete mobile app setup first.",
      newContactsTitle: "New Contacts",
      noNewContacts: "No new contacts",
      known: "Known",
      unknown: "Unknown",
      unknownHint: "Unknown contacts require attention. You can mark trusted contacts.",
      insightNightTitle: "Increased communication at night",
      insightNightDesc: "{{count}} night-time activities detected in the last 24 hours. Consider discussing sleep routine.",
      insightUnknownTitle: "High ratio of unknown users",
      insightUnknownDesc: "%{{ratio}} of contacted users are unknown. Review online safety rules with your child.",
      insightNewContactTitle: "Intense messaging with newly added contacts",
      insightNewContactDesc: "{{count}} new contacts communicated with today.",
    },
    pages: {
      alerts: "Alerts",
      children: "Children",
      reports: "Reports",
      settings: "Settings",
    },
  },
} as const;

export function t(locale: Locale) {
  return dictionary[locale];
}

export function replaceTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((output, [key, value]) => {
    return output.replace(`{{${key}}}`, String(value));
  }, template);
}
