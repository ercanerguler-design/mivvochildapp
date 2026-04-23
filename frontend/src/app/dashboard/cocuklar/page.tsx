import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocaleFromServerCookie } from "@/lib/i18n.server";
import { createPairingCode, getPairingTtlMinutes } from "@/lib/pairing";
import { redirect } from "next/navigation";

function getConnectivity(childUpdatedAt: Date, hasToken: boolean) {
  const minutesAgo = Math.floor((Date.now() - childUpdatedAt.getTime()) / (1000 * 60));

  if (minutesAgo <= 10) return { state: "online" as const, minutesAgo };
  if (minutesAgo <= 180) return { state: "offline" as const, minutesAgo };
  if (!hasToken && minutesAgo > 180) return { state: "uninstall" as const, minutesAgo };
  return { state: "offline" as const, minutesAgo };
}

function getAge(birthDate: Date) {
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? years - 1 : years;
}

export default async function ChildrenPage() {
  const locale = await getLocaleFromServerCookie();
  const text = t(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const parent = await db.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      children: {
        include: {
          _count: {
            select: {
              alerts: true,
              contacts: true,
              socialActivities: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!parent) redirect("/kurulum");

  const pairingCode = createPairingCode(parent.id);
  const pairingTtl = getPairingTtlMinutes();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{text.childrenPage.title}</h2>

      <div className="bg-linear-to-br from-violet-600 to-blue-600 text-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold">{text.childrenPage.pairingTitle}</h3>
        <p className="text-violet-100 text-sm mt-1">{text.childrenPage.pairingDesc}</p>

        <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/20">
          <p className="text-xs uppercase tracking-wide text-violet-100">{text.childrenPage.codeLabel}</p>
          <p className="text-2xl font-bold break-all mt-1">{pairingCode}</p>
          <p className="text-xs text-violet-100 mt-2">{text.childrenPage.codeExpire} ({pairingTtl} dk)</p>
        </div>

        <div className="mt-4 text-sm space-y-1 text-violet-50">
          <p className="font-semibold">{text.childrenPage.pairingStepsTitle}</p>
          <p>1. {text.childrenPage.step1}</p>
          <p>2. {text.childrenPage.step2}</p>
          <p>3. {text.childrenPage.step3}</p>
          <p className="text-violet-200">{text.childrenPage.refreshHint}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parent.children.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm">
            {text.childrenPage.noChildren}
          </div>
        ) : (
          parent.children.map((child) => (
            <div key={child.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{child.displayName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${child.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                  {child.isActive ? text.childrenPage.active : text.childrenPage.passive}
                </span>
              </div>
              {(() => {
                const connectivity = getConnectivity(child.updatedAt, Boolean(child.fcmToken));
                const connectivityText =
                  connectivity.state === "online"
                    ? text.childrenPage.online
                    : connectivity.state === "uninstall"
                    ? text.childrenPage.uninstallSuspected
                    : text.childrenPage.offline;
                const connectivityClass =
                  connectivity.state === "online"
                    ? "bg-emerald-50 text-emerald-700"
                    : connectivity.state === "uninstall"
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700";

                return (
                  <div className={`rounded-lg px-3 py-2 text-xs ${connectivityClass}`}>
                    <p className="font-semibold">{text.childrenPage.deviceStatus}: {connectivityText}</p>
                    <p className="opacity-80 mt-0.5">{text.childrenPage.lastSeen}: {connectivity.minutesAgo} dk</p>
                  </div>
                );
              })()}
              <p className="text-xs text-gray-500">
                {text.childrenPage.birthDate}: {child.birthDate ? child.birthDate.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US") : "-"}
                {child.birthDate ? ` (${text.childrenPage.age}: ${getAge(child.birthDate)})` : ""}
              </p>
              <p className="text-xs text-gray-500">{text.childrenPage.deviceId}: {child.deviceId ?? "-"}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-violet-50 p-2">
                  <p className="text-gray-500">{text.childrenPage.alerts}</p>
                  <p className="font-bold text-violet-700">{child._count.alerts}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2">
                  <p className="text-gray-500">{text.childrenPage.contacts}</p>
                  <p className="font-bold text-blue-700">{child._count.contacts}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="text-gray-500">{text.childrenPage.activities}</p>
                  <p className="font-bold text-emerald-700">{child._count.socialActivities}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
