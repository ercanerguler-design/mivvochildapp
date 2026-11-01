"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteChildButtonProps = {
  childId: string;
  childName: string;
  locale: "tr" | "en";
};

export function DeleteChildButton({ childId, childName, locale }: DeleteChildButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const labels =
    locale === "en"
      ? {
          button: "Delete Child",
          confirm: `Delete ${childName}? All alerts, messages and contacts of this child are permanently deleted. The phone must be paired again.`,
          success: "Child removed successfully.",
          error: "Deletion failed",
          working: "Deleting...",
        }
      : {
          button: "Çocuğu Sil",
          confirm: `${childName} silinsin mi? Bu çocuğa ait tüm uyarılar, mesajlar ve kişiler kalıcı olarak silinir. Telefonun yeniden eşleştirilmesi gerekir.`,
          success: "Çocuk ve tüm kayıtları silindi.",
          error: "Silme başarısız",
          working: "Siliniyor...",
        };

  async function onDelete() {
    if (loading) return;

    const approved = window.confirm(labels.confirm);
    if (!approved) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: "DELETE",
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          body && typeof body === "object" && "error" in body
            ? String((body as { error: unknown }).error)
            : labels.error;
        throw new Error(message);
      }

      window.alert(labels.success);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : labels.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? labels.working : labels.button}
    </button>
  );
}
