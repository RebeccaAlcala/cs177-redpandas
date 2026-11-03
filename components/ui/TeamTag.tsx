import type { TeamId } from "@/lib/types";
import { TEAM_META } from "./teams";

// <TeamTag team={TeamId} /> — tinted pill with a team-colored dot.
// (docs/CONTRACT.md section 4)
export function TeamTag({ team }: { team: TeamId }) {
  const meta = TEAM_META[team];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${meta.color} 10%, white)`,
        color: `color-mix(in srgb, ${meta.color} 78%, black)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.name}
    </span>
  );
}

export default TeamTag;
