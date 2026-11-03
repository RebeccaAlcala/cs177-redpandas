"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { RelatedSources } from "./RelatedSources";
import { SourceCard } from "./SourceCard";
import { useSources } from "./useSources";

const noopSubscribe = () => () => {};

// <SourcePanel sourceIds open onClose /> — slide-over from the right
// (docs/CONTRACT.md section 4). Loads the sources itself from /trace/api, so
// it works from both server and client parents.
// `contradictsSourceId` is an optional extra: pass Claim.contradictsSourceId
// to show the "this conflicts with ..." warning.
export function SourcePanel({
  sourceIds,
  open,
  onClose,
  contradictsSourceId,
}: {
  sourceIds: string[];
  open: boolean;
  onClose: () => void;
  contradictsSourceId?: string;
}) {
  // false on the server / first render, true once hydrated (portal needs document)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [armed, setArmed] = useState(false); // flips a frame after open -> slide-in transition
  const shown = open && armed;
  const closeRef = useRef<HTMLButtonElement>(null);
  const { data, loading, error } = useSources(sourceIds, contradictsSourceId, open);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setArmed(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      setArmed(false);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const sources = data?.sources ?? [];
  const contradicts = data?.contradicts;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${open ? "" : "pointer-events-none"}`}
      inert={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Source details"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-gray-50 shadow-2xl transition-transform duration-200 ${shown ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {sourceIds.length === 1 ? "Source" : `Sources (${sourceIds.length})`}
            </h2>
            <p className="text-xs text-gray-500">Where this came from</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close source panel"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {contradicts ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="font-semibold">⚠ Conflict</div>
              <p className="mt-0.5">
                This conflicts with{" "}
                <Link
                  href={`/trace/${contradicts.id}`}
                  onClick={onClose}
                  className="font-medium underline underline-offset-2"
                >
                  {contradicts.title}
                  {contradicts.version && !contradicts.title.includes(contradicts.version)
                    ? ` ${contradicts.version}`
                    : ""}
                </Link>
                .
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
            </div>
          ) : error ? (
            <EmptyState message="Couldn't load the source details. Try again." />
          ) : sources.length === 0 ? (
            <EmptyState message="No source found. It may have been removed or the ID is wrong." />
          ) : (
            sources.map((item) => <SourceCard key={item.source.id} item={item} onNavigate={onClose} />)
          )}

          {data?.related?.length ? <RelatedSources related={data.related} onNavigate={onClose} /> : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

export default SourcePanel;
