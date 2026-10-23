import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("iptal-iade");

export default function Page() {
  return <LegalPage slug="iptal-iade" />;
}
