// <UnsourcedFlag /> — red "No source" chip (docs/CONTRACT.md section 4).
// Shown wherever a claim has an empty sourceIds array.
export function UnsourcedFlag() {
  return (
    <span
      title="Nothing in the meeting, Slack or docs backs this claim up yet"
      className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-200"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
        aria-hidden
      >
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
      </svg>
      No source
    </span>
  );
}

export default UnsourcedFlag;
