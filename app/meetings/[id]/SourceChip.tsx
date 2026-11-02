import Link from "next/link";

// PLACEHOLDER for #5's <SourceBadge sourceIds /> (and <UnsourcedFlag />).
// Same props as the contract so swapping it later is a one-line change.
export function SourceChip({ sourceIds }: { sourceIds: string[] }) {
  if (!sourceIds || sourceIds.length === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-200">
        No source
      </span>
    );
  }
  return (
    <Link
      href={`/trace/${sourceIds[0]}`}
      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-200"
    >
      <span aria-hidden>↗</span>
      {sourceIds.length} source{sourceIds.length === 1 ? "" : "s"}
    </Link>
  );
}

export default SourceChip;
