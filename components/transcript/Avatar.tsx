import type { Person } from "@/lib/types";
import { TEAM_META } from "@/components/ui/teams";
import { initials } from "./format";

// Initials circle tinted with the person's team color.
// Works with a missing person (shows "?") so a bad speakerId never crashes.
export function Avatar({
  person,
  size = "md",
}: {
  person?: Person;
  size?: "sm" | "md";
}) {
  const color = person ? TEAM_META[person.team]?.color : undefined;
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      title={person ? `${person.name} · ${person.role}` : "Unknown speaker"}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${dims}`}
      style={{ backgroundColor: color ?? "#9ca3af" }}
    >
      {person ? initials(person.name) : "?"}
    </span>
  );
}

// Overlapping row of avatars, e.g. attendees on a meeting card.
export function AvatarStack({
  people,
  max = 4,
}: {
  people: Person[];
  max?: number;
}) {
  if (people.length === 0) return null;
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size="sm" />
      ))}
      {extra > 0 ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700 ring-2 ring-white">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

export default Avatar;
