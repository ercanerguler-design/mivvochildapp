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
