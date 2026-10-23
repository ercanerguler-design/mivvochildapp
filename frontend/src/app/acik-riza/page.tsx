import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("acik-riza");

export default function Page() {
  return <LegalPage slug="acik-riza" />;
}
