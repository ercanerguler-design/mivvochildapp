import type { Locale } from "@/lib/i18n";

/**
 * Alert categories as the parent app shows them (parent-app-expo/src/labels.ts). Every web page
 * uses this one list so the web panel and the app always name and colour a category the same way.
 */
export const ALERT_CATEGORIES: Record<string, { tr: string; en: string; emoji: string; badge: string }> = {
  BULLYING: { tr: "Zorbalık", en: "Bullying", emoji: "💔", badge: "bg-rose-100 text-rose-700" },
  THREAT: { tr: "Tehdit", en: "Threat", emoji: "⚠️", badge: "bg-red-100 text-red-700" },
  SEXUAL_RISK: { tr: "Cinsel Risk", en: "Sexual Risk", emoji: "🚨", badge: "bg-fuchsia-100 text-fuchsia-700" },
  STRANGER_CONTACT: { tr: "Yabancı Kişi", en: "Stranger Contact", emoji: "👤", badge: "bg-orange-100 text-orange-700" },
  VIOLENCE: { tr: "Şiddet", en: "Violence", emoji: "⚔️", badge: "bg-amber-100 text-amber-800" },
  PROFANITY: { tr: "Küfür & Hakaret", en: "Profanity & Insults", emoji: "💬", badge: "bg-sky-100 text-sky-700" },
  EXTREME_ANGER: { tr: "Kendine Zarar / Öfke", en: "Self-harm / Anger", emoji: "🔥", badge: "bg-violet-100 text-violet-700" },
  SUBSTANCE: { tr: "Alkol / Madde", en: "Alcohol / Drugs", emoji: "🍺", badge: "bg-teal-100 text-teal-700" },
  DANGEROUS_BEHAVIOR: { tr: "Tehlikeli Davranış", en: "Dangerous Behaviour", emoji: "⚡", badge: "bg-yellow-100 text-yellow-800" },
};

export const categoryLabel = (key: string, locale: Locale = "tr") => {
  const c = ALERT_CATEGORIES[key];
  return c ? `${c.emoji} ${c[locale]}` : key;
};

export const categoryBadge = (key: string) => ALERT_CATEGORIES[key]?.badge ?? "bg-gray-100 text-gray-600";

export const PLATFORM_NAMES: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  SNAPCHAT: "Snapchat",
  TELEGRAM: "Telegram",
  SMS: "SMS",
  OTHER: "Diğer",
};
