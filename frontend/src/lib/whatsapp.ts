type WhatsAppFallbackInput = {
  toPhone: string;
  childName: string;
  category: string;
  riskScore: number;
  alertId: string;
};

function normalizePhone(raw: string) {
  return raw.replace(/[^\d+]/g, "");
}

export async function sendWhatsAppFallbackIfEnabled(input: WhatsAppFallbackInput) {
  if (process.env.WHATSAPP_ENABLED !== "true") {
    return { sent: false, reason: "disabled" };
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { sent: false, reason: "missing_env" };
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizePhone(input.toPhone),
        type: "text",
        text: {
          preview_url: false,
          body: `Mivvo Acil Uyari: ${input.childName} icin ${input.category} riski tespit edildi (Risk: %${input.riskScore}). Detay: mivvoparent://alerts/${input.alertId}`,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("[WHATSAPP_FALLBACK_ERROR]", text);
    return { sent: false, reason: "request_failed" };
  }

  return { sent: true };
}
