import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("on-bilgilendirme");

export default function Page() {
  return <LegalPage slug="on-bilgilendirme" />;
}
