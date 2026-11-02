import type { Meeting } from "@/lib/types";

const STYLES: Record<Meeting["recordingStatus"], { label: string; cls: string; dot: string }> = {
  recorded: {
    label: "Recorded",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  recording: {
    label: "Recording",
    cls: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500 animate-pulse",
  },
  scheduled: {
    label: "Scheduled",
    cls: "bg-gray-50 text-gray-600 ring-gray-200",
    dot: "bg-gray-400",
  },
};

// Recording status pill: recorded / recording (pulsing) / scheduled.
export function RecordingBadge({ status }: { status: Meeting["recordingStatus"] }) {
  const s = STYLES[status] ?? STYLES.scheduled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default RecordingBadge;
