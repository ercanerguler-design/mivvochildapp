import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("kullanim-kosullari");

export default function Page() {
  return <LegalPage slug="kullanim-kosullari" />;
}
