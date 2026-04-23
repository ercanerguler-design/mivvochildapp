import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

export async function getLocaleFromServerCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("mivvo_locale")?.value;
  if (raw === "tr" || raw === "en") return raw;
  return "tr";
}
