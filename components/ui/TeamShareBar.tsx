import type { TeamId } from "@/lib/types";
import { TEAM_META } from "./teams";

export type TeamShare = { team: TeamId; amount: number };

// Stacked bar showing how much each team contributed, in team colors.
export function TeamShareBar({ shares, label }: { shares: TeamShare[]; label: string }) {
  const total = shares.reduce((sum, s) => sum + s.amount, 0);
  if (total === 0) return null;
  const summary = shares
    .map((s) => `${TEAM_META[s.team]?.name ?? s.team} ${Math.round((s.amount / total) * 100)}%`)
    .join(", ");
  return (
    <div
      role="img"
      aria-label={`${label}: ${summary}`}
      title={`${label}: ${summary}`}
      className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full"
    >
      {shares.map((s) => (
        <span
          key={s.team}
          style={{
            width: `${(s.amount / total) * 100}%`,
            backgroundColor: TEAM_META[s.team]?.color ?? "#a39e90",
          }}
        />
      ))}
    </div>
  );
}

export default TeamShareBar;
