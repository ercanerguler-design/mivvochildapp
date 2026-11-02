/** Accepted card brands and PayTR, shown in the footer and the cart. */
export function PaymentLogos({ className = "" }: { className?: string }) {
  const box = "flex h-8 items-center justify-center rounded-md bg-white px-2.5 ring-1 ring-gray-200";
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Kabul edilen kartlar: Visa, Mastercard, Troy. Ödeme altyapısı: PayTR">
      <span className={box} title="Visa">
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-hidden="true"><text x="0" y="14" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="17" fill="#1A1F71">VISA</text></svg>
      </span>
      <span className={box} title="Mastercard">
        <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-hidden="true"><circle cx="13" cy="12" r="10" fill="#EB001B" /><circle cx="25" cy="12" r="10" fill="#F79E1B" /><path d="M19 4a10 10 0 0 1 0 16 10 10 0 0 1 0-16Z" fill="#FF5F00" /></svg>
      </span>
      <span className={box} title="Troy">
        <svg viewBox="0 0 40 16" className="h-4 w-auto" aria-hidden="true"><text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="15" fill="#00A3AD">troy</text></svg>
      </span>
      <span className={`${box} gap-1 text-[11px] font-bold text-gray-700`} title="PayTR güvenli ödeme">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#16a34a" strokeWidth="2.5" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        PayTR · 3D Secure
      </span>
    </div>
  );
}
