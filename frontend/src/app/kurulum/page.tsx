import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { hasCurrentConsents } from "@/lib/consents";
import { SITE, absoluteUrl } from "@/lib/site";
import { SetupWizard } from "./SetupWizard";

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");
  if (!(await hasCurrentConsents(session.user.id).catch(() => true))) redirect("/onay");

  const childUrl = absoluteUrl("/indir/cocuk");
  const qrSvg = await QRCode.toString(childUrl, { type: "svg", margin: 1, color: { dark: "#1E1B4B", light: "#FFFFFF" } });

  return <SetupWizard name={session.user.name?.split(" ")[0] ?? null} qrSvg={qrSvg} childUrl={childUrl} parentPlayUrl={SITE.parentPlayUrl} />;
}
