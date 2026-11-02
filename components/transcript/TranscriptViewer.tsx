import { getPeople, getTranscript } from "@/lib/data";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamTag } from "@/components/ui/TeamTag";
import { Avatar } from "./Avatar";
import { ScrollToSegment } from "./ScrollToSegment";
import { formatTimestamp } from "./format";

// <TranscriptViewer meetingId highlightSegmentId? />  (docs/CONTRACT.md §4)
//
// Speaker-labeled transcript: avatar, name, TeamTag, mm:ss per line.
// When highlightSegmentId is set, that line is highlighted and scrolled into
// view. Each line has id={segment.id}, so `#m_001_s014` anchors also work.
//
// This is a SERVER component (it reads lib/data). To use it inside a client
// component, render it in a server component and pass it down as children.
export function TranscriptViewer({
  meetingId,
  highlightSegmentId,
}: {
  meetingId: string;
  highlightSegmentId?: string;
}) {
  const segments = getTranscript(meetingId);
  if (segments.length === 0) {
    return <EmptyState message="No transcript for this meeting yet." />;
  }

  const people = new Map(getPeople().map((p) => [p.id, p]));
  const highlightFound =
    !!highlightSegmentId && segments.some((s) => s.id === highlightSegmentId);

  return (
    <div>
      {highlightSegmentId && !highlightFound ? (
        <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          That moment isn&apos;t in this transcript. Showing the full meeting.
        </p>
      ) : null}
      <ol className="divide-y divide-gray-100">
        {segments.map((seg) => {
          const person = people.get(seg.speakerId);
          const active = seg.id === highlightSegmentId;
          return (
            <li
              key={seg.id}
              id={seg.id}
              className={`flex scroll-mt-24 gap-3 px-3 py-3 transition-colors ${
                active
                  ? "rounded-lg bg-amber-50 ring-2 ring-inset ring-amber-300"
                  : ""
              }`}
            >
              <Avatar person={person} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {person?.name ?? seg.speakerId}
                  </span>
                  <TeamTag team={seg.team} />
                  <span className="font-mono text-xs text-gray-400">
                    {formatTimestamp(seg.startSec)}
                  </span>
                </div>
                <p className="mt-1 break-words text-sm leading-relaxed text-gray-800">
                  {seg.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {highlightFound ? <ScrollToSegment segmentId={highlightSegmentId!} /> : null}
    </div>
  );
}

export default TranscriptViewer;
