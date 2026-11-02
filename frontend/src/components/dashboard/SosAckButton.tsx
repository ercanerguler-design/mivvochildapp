"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

/** "İlgilendim" on a help request; hides it on the web panel and in the parent app. */
export function SosAckButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function ack() {
    setBusy(true);
    const res = await fetch("/api/sos/ack", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
    if (res?.ok) router.refresh();
    else setBusy(false);
  }

  return (
    <button type="button" onClick={ack} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-60">
      <Check className="h-4 w-4" /> {busy ? "Kaydediliyor…" : "İlgilendim"}
    </button>
  );
}
