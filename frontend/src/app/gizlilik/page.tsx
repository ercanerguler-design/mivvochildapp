import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("gizlilik");

export default function Page() {
  return <LegalPage slug="gizlilik" />;
}
