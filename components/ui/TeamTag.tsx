import type { TeamId } from "@/lib/types";
import { TEAM_META } from "./teams";

// <TeamTag team={TeamId} /> — colored pill. (docs/CONTRACT.md section 4)
export function TeamTag({ team }: { team: TeamId }) {
  const meta = TEAM_META[team];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.name}
    </span>
  );
}

export default TeamTag;
