import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("mesafeli-satis");

export default function Page() {
  return <LegalPage slug="mesafeli-satis" />;
}
