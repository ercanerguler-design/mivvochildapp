import { analyzeText, preFilter, type AnalysisResult, type AnalyzeContext } from "@/lib/nlp";
import { analyzeWithRules } from "@/lib/nlp-rules";
import { recordSystemEvent } from "@/lib/system-events";

/**
 * Analysis entry point for API routes. Never throws: when the AI is unavailable it records a
 * system event (shown in the admin panel) and falls back to the high-precision rule engine,
 * so critical risks are still reported.
 */
export async function analyzeMessage(text: string, ctx?: AnalyzeContext): Promise<AnalysisResult & { source: "ai" | "rules" | "skipped" }> {
  if (!text?.trim() || preFilter(text)) {
    return { ...(await analyzeText(text, ctx)), source: "skipped" };
  }
  try {
    return { ...(await analyzeText(text, ctx)), source: "ai" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[analysis] AI unavailable, using rule fallback:", message);
    await recordSystemEvent("ai_analysis_failed", message);
    return { ...analyzeWithRules(text), source: "rules" };
  }
}

// The child app often reports the same message twice (single + grouped notification).
// Repeats within a short window reuse the first result instead of paying for a second analysis.
const RECENT_TTL_MS = 3 * 60 * 1000;
const recent = new Map<string, { at: number; result: ReturnType<typeof analyzeMessage> }>();

export function analyzeMessageOnce(scope: string, text: string, ctx?: AnalyzeContext) {
  const now = Date.now();
  const key = `${scope}\u0000${ctx?.platform ?? ""}\u0000${ctx?.isNewContact ? 1 : 0}${ctx?.isNightTime ? 1 : 0}\u0000${(ctx?.history ?? []).join("\u0001")}\u0000${text.trim()}`;
  const hit = recent.get(key);
  if (hit && now - hit.at < RECENT_TTL_MS) return hit.result;
  if (recent.size > 1000) {
    for (const [k, v] of recent) if (now - v.at >= RECENT_TTL_MS) recent.delete(k);
    if (recent.size > 1000) recent.clear();
  }
  const result = analyzeMessage(text, ctx);
  recent.set(key, { at: now, result });
  // A failed analysis must not be reused.
  result.catch(() => recent.delete(key));
  return result;
}
