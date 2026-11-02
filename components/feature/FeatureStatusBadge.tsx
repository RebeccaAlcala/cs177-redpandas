import type { Feature } from "@/lib/types";

type Status = Feature["status"];

export const STATUS_META: Record<Status, { label: string; cls: string }> = {
  planning: { label: "Planning", cls: "bg-gray-100 text-gray-700 ring-gray-200" },
  in_progress: { label: "In progress", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-700 ring-red-200" },
  shipped: { label: "Shipped", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

export function FeatureStatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status] ?? STATUS_META.planning;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

export default FeatureStatusBadge;
