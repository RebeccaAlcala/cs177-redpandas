import Link from "next/link";
import type { Person } from "@/lib/types";
import { getFeature, getMeeting, getPerson, getTranscript } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { TranscriptViewer } from "@/components/transcript/TranscriptViewer";
import { RecordingBadge } from "@/components/transcript/RecordingBadge";
import { Avatar } from "@/components/transcript/Avatar";
import { formatDuration, formatMeetingDate } from "@/components/transcript/format";
import { SummaryPanel } from "./SummaryPanel";

// /meetings/[id]: header, transcript (left), AI summary (right).
// Supports ?segment=m_001_s014 to jump to and highlight a transcript line.
export default async function MeetingDetailPage({
  params,
  searchParams,
}: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const segment = typeof sp.segment === "string" ? sp.segment : undefined;

  const meeting = getMeeting(id);
  if (!meeting) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <PageHeader title="Meeting not found" />
        <EmptyState message={`We couldn't find a meeting with id "${id}".`} />
        <div className="mt-6">
          <Button href="/meetings" variant="secondary">
            ← Back to meetings
          </Button>
        </div>
      </main>
    );
  }

  const feature = meeting.featureId ? getFeature(meeting.featureId) : undefined;
  const attendees = (meeting.attendeeIds ?? [])
    .map((pid) => getPerson(pid))
    .filter((p): p is Person => Boolean(p));
  const segmentCount = getTranscript(meeting.id).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/meetings"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900"
      >
        ← All meetings
      </Link>

      <PageHeader
        title={meeting.title}
        subtitle={`${formatMeetingDate(meeting.date)} · ${formatDuration(meeting.durationMin)}`}
        actions={<RecordingBadge status={meeting.recordingStatus} />}
      />

      <div className="-mt-2 mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Feature</span>
          {feature ? (
            <Link
              href={`/features/${feature.id}`}
              className="rounded-full bg-gray-900/5 px-2.5 py-0.5 font-medium text-gray-800 hover:bg-gray-900/10"
            >
              {feature.name}
            </Link>
          ) : (
            <span className="text-gray-400">Not linked</span>
          )}
        </div>
        {attendees.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-500">Attendees</span>
            {attendees.map((p) => (
              <span key={p.id} className="flex items-center gap-1.5 text-gray-800">
                <Avatar person={p} size="sm" />
                {p.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Transcript</h2>
            <span className="text-xs text-gray-400">
              {segmentCount} line{segmentCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-2">
            <TranscriptViewer meetingId={meeting.id} highlightSegmentId={segment} />
          </div>
        </section>

        <aside className="lg:sticky lg:top-6">
          <SummaryPanel meetingId={meeting.id} />
        </aside>
      </div>
    </main>
  );
}
