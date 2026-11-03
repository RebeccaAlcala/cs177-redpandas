import type { ReactElement } from "react";
import type { Source, SourceType } from "@/lib/types";

// Per-type label, color and icon, shared by the badge, panel and trace page.
export const TYPE_META: Record<
  SourceType,
  { label: string; text: string; bg: string; ring: string }
> = {
  meeting: { label: "Meeting", text: "text-accent", bg: "bg-accent-soft", ring: "ring-accent/20" },
  slack: { label: "Slack", text: "text-rose-800", bg: "bg-rose-50", ring: "ring-rose-200" },
  doc: { label: "Doc", text: "text-sky-800", bg: "bg-sky-50", ring: "ring-sky-200" },
};

const ICONS: Record<SourceType | "generic", ReactElement> = {
  meeting: (
    <>
      <rect x="2" y="5" width="12" height="14" rx="2" />
      <path d="M14 10l7-4v12l-7-4" />
    </>
  ),
  slack: (
    <>
      <path d="M9 3L7 21M17 3l-2 18M4 9h17M3 15h17" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  generic: (
    <>
      <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" />
    </>
  ),
};

export function TypeIcon({
  type,
  className = "h-3.5 w-3.5",
}: {
  type: SourceType | "generic";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICONS[type]}
    </svg>
  );
}

// Freshness chip styles. Missing status -> no chip.
export const STATUS_META: Record<
  NonNullable<Source["status"]>,
  { label: string; cls: string; hint: string }
> = {
  current: {
    label: "Current",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    hint: "Still the latest word on this topic",
  },
  updated: {
    label: "Updated",
    cls: "bg-amber-50 text-amber-800 ring-amber-200",
    hint: "Changed since this was said; check newer sources",
  },
  overturned: {
    label: "Overturned",
    cls: "bg-red-50 text-red-700 ring-red-200",
    hint: "A later decision reversed this",
  },
};
