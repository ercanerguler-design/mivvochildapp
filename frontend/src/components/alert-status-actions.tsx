"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AlertStatus = "PENDING" | "SEEN" | "RESOLVED" | "DISMISSED";
type NextStatus = Exclude<AlertStatus, "PENDING">;

type Props = {
  alertId: string;
  currentStatus: AlertStatus;
};

const buttonStyle =
  "rounded-lg border px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function AlertStatusActions({ alertId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<NextStatus | null>(null);

  const updateStatus = async (status: NextStatus) => {
    if (status === currentStatus) return;

    let resolutionNote: string | undefined;
    if (status === "RESOLVED") {
      const promptValue = window.prompt("Kisa cozum notu gir (ornek: konu konusuldu):", "");
      if (promptValue === null) {
        return;
      }

      const trimmed = promptValue.trim();
      if (trimmed.length < 2) {
        window.alert("Lutfen en az 2 karakterlik bir cozum notu gir.");
        return;
      }

      resolutionNote = trimmed;
    }

    setLoading(status);
    try {
      const response = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, status, resolutionNote }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Durum guncellenemedi");
      }

      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Durum guncellenemedi";
      window.alert(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap justify-end gap-1">
      <button
        type="button"
        className={buttonStyle}
        disabled={loading !== null || currentStatus === "SEEN"}
        onClick={() => updateStatus("SEEN")}
      >
        Goruldu
      </button>
      <button
        type="button"
        className={buttonStyle}
        disabled={loading !== null || currentStatus === "RESOLVED"}
        onClick={() => updateStatus("RESOLVED")}
      >
        Cozuldu
      </button>
      <button
        type="button"
        className={buttonStyle}
        disabled={loading !== null || currentStatus === "DISMISSED"}
        onClick={() => updateStatus("DISMISSED")}
      >
        Goz Ardi
      </button>
    </div>
  );
}
