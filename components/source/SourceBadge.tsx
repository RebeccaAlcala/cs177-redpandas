"use client";

import { useCallback, useState, type MouseEvent } from "react";
import type { SourceType } from "@/lib/types";
import { TYPE_META, TypeIcon } from "./meta";
import { SourcePanel } from "./SourcePanel";
import { UnsourcedFlag } from "./UnsourcedFlag";
import { useSources } from "./useSources";

// <SourceBadge sourceIds /> — pill with the source-type icon(s) and a count;
// click opens <SourcePanel> (docs/CONTRACT.md section 4).
// An empty sourceIds renders <UnsourcedFlag /> so unsourced claims are always
// flagged. `contradictsSourceId` is an optional extra (Claim.contradictsSourceId).
export function SourceBadge({
  sourceIds,
  contradictsSourceId,
}: {
  sourceIds: string[];
  contradictsSourceId?: string;
}) {
  if (!sourceIds || sourceIds.length === 0) return <UnsourcedFlag />;
  return <SourceBadgeInner sourceIds={sourceIds} contradictsSourceId={contradictsSourceId} />;
}

function SourceBadgeInner({
  sourceIds,
  contradictsSourceId,
}: {
  sourceIds: string[];
  contradictsSourceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { data } = useSources(sourceIds, contradictsSourceId);

  // Distinct types in order of appearance; generic link icon until loaded.
  const types = Array.from(new Set((data?.sources ?? []).map((s) => s.source.type)));
  const iconTypes: (SourceType | "generic")[] = types.length ? types.slice(0, 3) : ["generic"];
  const label = `${sourceIds.length} source${sourceIds.length === 1 ? "" : "s"}`;
  const hint = data?.sources.length
    ? data.sources.map((s) => s.source.title).join("\n")
    : "View sources";

  function onClick(e: MouseEvent) {
    e.preventDefault(); // the badge may sit inside a link or clickable card
    e.stopPropagation();
    setEverOpened(true);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        title={hint}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-200"
      >
        <span className="inline-flex items-center gap-0.5">
          {iconTypes.map((t) => (
            <span key={t} className={t === "generic" ? "text-gray-500" : TYPE_META[t].text}>
              <TypeIcon type={t} className="h-3 w-3" />
            </span>
          ))}
        </span>
        {label}
        {contradictsSourceId ? (
          <span className="text-amber-600" title="Conflicts with another source" aria-label="conflict">
            ⚠
          </span>
        ) : null}
      </button>
      {everOpened ? (
        <SourcePanel
          sourceIds={sourceIds}
          open={open}
          onClose={close}
          contradictsSourceId={contradictsSourceId}
        />
      ) : null}
    </>
  );
}

export default SourceBadge;
