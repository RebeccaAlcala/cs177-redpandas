import type { Decision, Source } from "@/lib/types";
import { getSources } from "@/lib/data";

// Decisions have no status of their own, so a decision is as fresh as its
// stalest source: one overturned source marks the whole decision overturned.
export function decisionFreshness(decision: Decision): Source["status"] {
  const statuses = getSources(decision.sourceIds).map((s) => s.status);
  if (statuses.includes("overturned")) return "overturned";
  if (statuses.includes("updated")) return "updated";
  return statuses.includes("current") ? "current" : undefined;
}
