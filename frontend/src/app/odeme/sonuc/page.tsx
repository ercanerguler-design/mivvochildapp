import { ResultRedirect } from "./ResultRedirect";

export const metadata = { title: "Ödeme sonucu", robots: { index: false } };

/**
 * PayTR opens merchant_ok_url / merchant_fail_url inside its iframe. This page moves the whole
 * window back to the subscription page. It only shows a message: the subscription itself is activated
 * by PayTR's signed server notification, never by this redirect.
 */
export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const result = d === "islemde" ? "islemde" : "basarisiz";
  return <ResultRedirect href={`/dashboard/abonelik?odeme=${result}`} />;
}
