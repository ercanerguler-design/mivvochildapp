import { db } from "@/lib/db";

export const FREE_TRIAL_ANALYSIS_LIMIT = Number(
  process.env.FREE_TRIAL_ANALYSIS_LIMIT ?? "7"
);

export async function getParentTrialUsage(parentId: string) {
  const used = await db.socialActivity.count({
    where: {
      child: { parentId },
      analyzedAt: { not: null },
    },
  });

  const remaining = Math.max(0, FREE_TRIAL_ANALYSIS_LIMIT - used);

  return {
    limit: FREE_TRIAL_ANALYSIS_LIMIT,
    used,
    remaining,
    exceeded: used >= FREE_TRIAL_ANALYSIS_LIMIT,
  };
}
