import type { TeamId } from "@/lib/types";

// Single source of truth for team display names + colors in the UI.
// Mirrors the colors in data/seed/teams.json. Lives here (not read via
// lib/data) so client components can use it without server-only fs access.
export const TEAM_META: Record<TeamId, { name: string; color: string }> = {
  product: { name: "Product", color: "#7c3aed" },
  compliance: { name: "Compliance", color: "#0891b2" },
  risk: { name: "Risk", color: "#dc2626" },
  security: { name: "Security", color: "#2563eb" },
  eng: { name: "Engineering", color: "#16a34a" },
  growth: { name: "Growth", color: "#ea580c" },
};

export const TEAM_IDS = Object.keys(TEAM_META) as TeamId[];
