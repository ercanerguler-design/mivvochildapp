/**
 * Turkish mobile numbers: accepts "0532 123 45 67", "+90 532 123 45 67", "5321234567" and returns
 * "05321234567", or null when it is not a valid mobile number.
 */
export function normalizeTrMobile(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return /^5\d{9}$/.test(d) ? `0${d}` : null;
}

/** A name with at least two letters (Google may give a single word, which is fine). */
export const validName = (raw: string) => raw.trim().replace(/\s+/g, " ").length >= 2;
