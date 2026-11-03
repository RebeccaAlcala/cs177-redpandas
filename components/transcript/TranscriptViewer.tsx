import type { Person } from "@/lib/types";
import { getMeetingSummary, getPeople, getTranscript } from "@/lib/data";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScrollToSegment } from "./ScrollToSegment";
import { TranscriptList, type TermNote } from "./TranscriptList";

// <TranscriptViewer meetingId highlightSegmentId? />  (docs/CONTRACT.md §4)
//
// Speaker-labeled transcript: avatar, name, TeamTag, mm:ss per line.
// When highlightSegmentId is set, that line is highlighted and scrolled into
// view. Each line has id={segment.id}, so `#m_001_s014` anchors also work.
// Terms from the AI summary's `confusions` are marked inline with a tooltip.
//
// Optional (additive, not in the contract): showControls adds a search box
// and team filter. Off by default so small embeds stay plain.
//
// This is a SERVER component (it reads lib/data). To use it inside a client
// component, render it in a server component and pass it down as children.
export function TranscriptViewer({
  meetingId,
  highlightSegmentId,
  showControls = false,
}: {
  meetingId: string;
  highlightSegmentId?: string;
  showControls?: boolean;
}) {
  const segments = getTranscript(meetingId);
  if (segments.length === 0) {
    return <EmptyState message="No transcript for this meeting yet." />;
  }

  // Only send the speakers we need to the client.
  const speakerIds = new Set(segments.map((s) => s.speakerId));
  const people = getPeople().filter((p: Person) => speakerIds.has(p.id));

  const terms: TermNote[] = (getMeetingSummary(meetingId)?.confusions ?? [])
    .filter((c) => c.term && c.term.trim())
    .map((c) => ({ term: c.term!, note: c.text }));

  const highlightFound =
    !!highlightSegmentId && segments.some((s) => s.id === highlightSegmentId);

  return (
    <div>
      {highlightSegmentId && !highlightFound ? (
        <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          That moment isn&apos;t in this transcript. Showing the full meeting.
        </p>
      ) : null}
      <TranscriptList
        segments={segments}
        people={people}
        terms={terms}
        highlightSegmentId={highlightFound ? highlightSegmentId : undefined}
        showControls={showControls}
      />
      {highlightFound ? <ScrollToSegment segmentId={highlightSegmentId!} /> : null}
    </div>
  );
}

export default TranscriptViewer;
