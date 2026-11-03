import type { TeamId } from "@/lib/types";

// Single source of truth for team display names + colors in the UI.
// Mirrors the colors in data/seed/teams.json. Lives here (not read via
// lib/data) so client components can use it without server-only fs access.
export const TEAM_META: Record<TeamId, { name: string; color: string }> = {
  product: { name: "Product", color: "#6a55c2" },
  compliance: { name: "Compliance", color: "#0f7285" },
  risk: { name: "Risk", color: "#b9403a" },
  security: { name: "Security", color: "#2f5fae" },
  eng: { name: "Engineering", color: "#2f7d55" },
  growth: { name: "Growth", color: "#b8621b" },
};

export const TEAM_IDS = Object.keys(TEAM_META) as TeamId[];
