import Link from "next/link";
import { getConflicts, getMeetingSummary, getPeople } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamTag } from "@/components/ui/TeamTag";
import { SourceBadge } from "@/components/source";

// Right-hand AI summary for a meeting: conflicts, summary points (with
// source chips), action items, confusion notes. Reads data/ai-cache via
// getMeetingSummary; shows an empty state until #4/#6 generate it.
export function SummaryPanel({ meetingId }: { meetingId: string }) {
  const summary = getMeetingSummary(meetingId);
  if (!summary) {
    return (
      <Card title="AI summary">
        <EmptyState message="The AI summary for this meeting hasn't been generated yet." />
      </Card>
    );
  }

  const points = summary.summaryPoints ?? [];
  const actions = summary.actionItems ?? [];
  const confusions = summary.confusions ?? [];
  const conflictIds = summary.conflictIds ?? [];
  const conflicts = getConflicts().filter((x) => conflictIds.includes(x.id));
  const people = new Map(getPeople().map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      {conflicts.length > 0 ? (
        <div className="space-y-2">
          {conflicts.map((x) => (
            <Link
              key={x.id}
              href={`/conflicts#${x.id}`}
              className="block rounded-2xl border border-orange-200 bg-orange-50 p-5 transition-colors hover:bg-orange-100/70"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-800">
                Conflict detected
                <span className="ml-auto font-normal text-orange-800">
                  {Math.round((x.confidence ?? 0) * 100)}% confidence
                </span>
              </div>
              <p className="mt-2 font-display font-medium text-xl leading-snug text-gray-900">{x.title}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <TeamTag team={x.teamA} />
                <span>vs</span>
                <TeamTag team={x.teamB} />
                <span className="ml-auto font-medium text-orange-800">View →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      <Card title="AI summary">
        {points.length === 0 ? (
          <p className="text-sm text-gray-500">No summary points.</p>
        ) : (
          <ul className="space-y-3">
            {points.map((pt, i) => (
              <li key={pt.claimId || i} className="flex gap-2 text-sm text-gray-800">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                <div className="min-w-0">
                  <span className="leading-relaxed">{pt.text}</span>{" "}
                  <SourceBadge sourceIds={pt.sourceIds ?? []} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Action items">
        {actions.length === 0 ? (
          <p className="text-sm text-gray-500">No action items.</p>
        ) : (
          <ul className="space-y-3">
            {actions.map((a) => {
              const owner = a.ownerId ? people.get(a.ownerId) : undefined;
              return (
                <li key={a.id} className="flex gap-2 text-sm">
                  <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-gray-300" />
                  <div className="min-w-0">
                    <p className="text-gray-800">{a.text}</p>
                    {owner || a.team ? (
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        {owner ? <span>{owner.name}</span> : null}
                        {a.team ? <TeamTag team={a.team} /> : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {confusions.length > 0 ? (
        <Card title="Possible confusion">
          <ul className="space-y-3">
            {confusions.map((c, i) => (
              <li key={i} className="text-sm text-gray-800">
                {c.term ? (
                  <mark className="mr-1 rounded bg-amber-100 px-1 font-medium text-amber-900">
                    &ldquo;{c.term}&rdquo;
                  </mark>
                ) : null}
                {c.text}
                {c.segmentId ? (
                  <Link
                    href={`/meetings/${meetingId}?segment=${c.segmentId}`}
                    scroll={false}
                    className="ml-1 text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
                  >
                    Jump to moment
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

export default SummaryPanel;
