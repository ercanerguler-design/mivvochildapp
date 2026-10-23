"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm }) });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Hesap silinemedi.");
      setBusy(false);
      return;
    }
    await signOut({ callbackUrl: "/?hesap=silindi" });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-rose-100 bg-white p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Trash2 className="h-5 w-5 text-rose-500" /> Hesabımı ve verilerimi sil
      </h3>
      <p className="text-sm text-gray-600">
        Hesabınız, tüm çocuk profilleri, uyarılar ve aktivite kayıtları kalıcı olarak silinir. Çocuk telefonlarındaki uygulama veri göndermeyi durdurur. Yasal zorunluluk nedeniyle yalnızca ödeme kayıtları ve onay kayıtları saklanır. Bu işlem geri alınamaz.
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
          Hesabı silmek istiyorum
        </button>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm text-gray-700">
            Onaylamak için <b>SİL</b> yazın
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" autoComplete="off" />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={remove} disabled={confirm !== "SİL" || busy} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Siliniyor…" : "Kalıcı olarak sil"}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
