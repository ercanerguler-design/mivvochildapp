import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("guvenlik");

export default function Page() {
  return <LegalPage slug="guvenlik" />;
}
