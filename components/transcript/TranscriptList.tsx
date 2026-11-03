"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Person, TeamId, TranscriptSegment } from "@/lib/types";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_META } from "@/components/ui/teams";
import { Avatar } from "./Avatar";
import { formatTimestamp } from "./format";

export type TermNote = { term: string; note: string };

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Wraps search matches (yellow) and confusion terms (amber, dotted, with a
// tooltip) in <mark>. Longest patterns first so "customer data export" wins
// over "customer data".
function renderText(text: string, terms: Map<string, string>, query: string): ReactNode {
  const q = query.trim().toLowerCase();
  const patterns = [...terms.keys()];
  if (q) patterns.push(q);
  if (patterns.length === 0) return text;

  const re = new RegExp(
    `(${[...new Set(patterns)].sort((a, b) => b.length - a.length).map(escapeRegExp).join("|")})`,
    "gi",
  );
  // split() with a capture group puts the matches at odd indexes.
  return text.split(re).map((chunk, i) => {
    if (i % 2 === 0) return chunk;
    const low = chunk.toLowerCase();
    if (q && low === q) {
      return (
        <mark key={i} className="rounded bg-amber-200 px-0.5 text-gray-900">
          {chunk}
        </mark>
      );
    }
    const note = terms.get(low);
    return (
      <mark
        key={i}
        title={note ? `Possible confusion: ${note}` : "Possible confusion"}
        className="cursor-help rounded bg-amber-100 px-0.5 text-amber-950 underline decoration-amber-500 decoration-dotted underline-offset-2"
      >
        {chunk}
      </mark>
    );
  });
}

// Client half of TranscriptViewer: renders the lines and (optionally) a
// search box + team filter. Data comes in as props from the server half.
export function TranscriptList({
  segments,
  people,
  terms,
  highlightSegmentId,
  showControls = false,
}: {
  segments: TranscriptSegment[];
  people: Person[];
  terms: TermNote[];
  highlightSegmentId?: string;
  showControls?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<TeamId | "">("");

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const termMap = useMemo(
    () =>
      new Map(
        terms
          .filter((t) => t.term.trim())
          .map((t) => [t.term.trim().toLowerCase(), t.note] as const),
      ),
    [terms],
  );
  const teamsPresent = useMemo(
    () => [...new Set(segments.map((s) => s.team))].filter((t) => TEAM_META[t]),
    [segments],
  );

  const q = query.trim().toLowerCase();
  const visible = segments.filter((s) => {
    if (team && s.team !== team) return false;
    if (!q) return true;
    const name = peopleById.get(s.speakerId)?.name ?? "";
    return s.text.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });
  const filtering = Boolean(q || team);

  return (
    <div>
      {showControls ? (
        <div className="sticky -top-2 z-10 -mx-2 -mt-2 mb-1 space-y-2 border-b border-gray-100 bg-white/95 px-3 pt-3 pb-2 backdrop-blur">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript or speaker…"
            aria-label="Search transcript"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by team">
            <button
              type="button"
              onClick={() => setTeam("")}
              aria-pressed={team === ""}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                team === ""
                  ? "bg-accent text-white ring-accent"
                  : "bg-white text-gray-600 ring-gray-300 hover:bg-gray-50"
              }`}
            >
              All teams
            </button>
            {teamsPresent.map((t) => {
              const on = team === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTeam(on ? "" : t)}
                  aria-pressed={on}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                    on
                      ? "text-white ring-transparent"
                      : "bg-white text-gray-600 ring-gray-300 hover:bg-gray-50"
                  }`}
                  style={on ? { backgroundColor: TEAM_META[t].color } : undefined}
                >
                  {TEAM_META[t].name}
                </button>
              );
            })}
            {filtering ? (
              <span className="ml-auto text-xs text-gray-500">
                {visible.length} of {segments.length} lines
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-gray-500">
          No lines match.{" "}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTeam("");
            }}
            className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900"
          >
            Clear filters
          </button>
        </p>
      ) : (
        <ol className="space-y-0.5 pt-1">
          {visible.map((seg) => {
            const person = peopleById.get(seg.speakerId);
            const active = seg.id === highlightSegmentId;
            return (
              <li
                key={seg.id}
                id={seg.id}
                className={`flex scroll-mt-24 gap-3 rounded-xl px-3 py-3.5 transition-colors ${
                  active ? "bg-accent-soft ring-1 ring-inset ring-accent/30" : ""
                }`}
              >
                <Avatar person={person} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {person?.name ?? seg.speakerId}
                    </span>
                    <TeamTag team={seg.team} />
                    <span className="font-mono text-xs text-gray-500">
                      {formatTimestamp(seg.startSec)}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm leading-relaxed text-gray-800">
                    {renderText(seg.text, termMap, query)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default TranscriptList;
