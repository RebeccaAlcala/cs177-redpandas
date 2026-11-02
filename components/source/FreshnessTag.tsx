import type { Source } from "@/lib/types";
import { STATUS_META } from "./meta";

// Current / Updated / Overturned chip for a source's `status`.
export function FreshnessTag({ status }: { status?: Source["status"] }) {
  const meta = status ? STATUS_META[status] : undefined;
  if (!meta) return null;
  return (
    <span
      title={meta.hint}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

export default FreshnessTag;
