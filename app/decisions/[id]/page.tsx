import Link from "next/link";
import {
  getDecisions,
  getFeature,
  getMeeting,
  getPerson,
  getTranscript,
} from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TeamTag } from "@/components/ui/TeamTag";
import { SourceBadge, FreshnessTag } from "@/components/source";
import { Avatar } from "@/components/transcript/Avatar";
import { formatMeetingDate, formatTimestamp } from "@/components/transcript/format";
import { decisionFreshness } from "../freshness";

// /decisions/[id]: "Why" view. The decision, then the transcript lines that led to it.
export default async function DecisionDetailPage({ params }: PageProps<"/decisions/[id]">) {
  const { id } = await params;
  const allDecisions = getDecisions();
  const decision = allDecisions.find((d) => d.id === id);

  if (!decision) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <PageHeader title="Decision not found" />
        <EmptyState message={`We couldn't find a decision with id "${id}".`} />
        <div className="mt-6">
          <Button href="/decisions" variant="secondary">
            ← Back to decisions
          </Button>
        </div>
      </main>
    );
  }

  const feature = getFeature(decision.featureId);
  const freshness = decisionFreshness(decision);
  const meeting = decision.whyMeetingId ? getMeeting(decision.whyMeetingId) : undefined;
  const transcript = decision.whyMeetingId ? getTranscript(decision.whyMeetingId) : [];
  const whyIds = new Set(decision.whySegmentIds ?? []);
  const discussion = transcript.filter((s) => whyIds.has(s.id));
  const laterDecisions =
    freshness === "overturned"
      ? allDecisions.filter((d) => d.featureId === decision.featureId && d.date > decision.date)
      : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/decisions"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900"
      >
        ← All decisions
      </Link>

      <PageHeader
        title="Why this decision?"
        subtitle={feature ? feature.name : undefined}
      />

      <Card>
        <p className="text-base font-medium text-gray-900">{decision.text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="mr-1 text-xs text-gray-500">{formatMeetingDate(decision.date)}</span>
          {decision.madeByTeams.map((t) => (
            <TeamTag key={t} team={t} />
          ))}
          <SourceBadge sourceIds={decision.sourceIds} />
          <FreshnessTag status={freshness} />
        </div>
      </Card>

      {laterDecisions.length > 0 ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-medium">This decision was overturned. Later on this feature:</p>
          <ul className="mt-1 space-y-1">
            {laterDecisions.map((d) => (
              <li key={d.id}>
                <Link href={`/decisions/${d.id}`} className="underline hover:no-underline">
                  {d.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">
            The discussion{meeting ? ` in ${meeting.title}` : ""}
          </h2>
          {meeting ? (
            <Link
              href={`/meetings/${meeting.id}`}
              className="shrink-0 text-xs text-gray-600 hover:text-gray-900 hover:underline"
            >
              Open full meeting →
            </Link>
          ) : null}
        </div>

        {discussion.length === 0 ? (
          <EmptyState message="No recorded discussion is linked to this decision." />
        ) : (
          <ol className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {discussion.map((segment) => {
              const speaker = getPerson(segment.speakerId);
              return (
                <li key={segment.id} className="flex gap-3 px-5 py-4">
                  <Avatar person={speaker} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {speaker?.name ?? "Unknown speaker"}
                      </span>
                      <TeamTag team={segment.team} />
                      <Link
                        href={`/meetings/${segment.meetingId}?segment=${segment.id}`}
                        className="text-xs tabular-nums text-gray-500 hover:text-gray-900 hover:underline"
                      >
                        {formatTimestamp(segment.startSec)}
                      </Link>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">{segment.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
