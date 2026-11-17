"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMeetings } from "@/lib/local-meetings";
import type { LiveConflict } from "@/lib/ai/analysis-types";

interface Row {
  key: string;
  conflict: LiveConflict;
  meetingTitle: string;
}

// Plain text chip for a party in a recorded conflict. We don't use TeamTag
// here: the AI returns free-text team labels (e.g. "Risk", "Growth") that
// aren't guaranteed to match the TeamId enum, so TEAM_META lookups could break.
function PartyChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}

// Client island: conflicts the AI found in the person's own recorded meetings
// (localStorage), shown at the top of /conflicts above the sample backlog.
export function RecordedConflicts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const out: Row[] = [];
    for (const m of loadMeetings()) {
      m.analysis.conflicts.forEach((conflict, i) => {
        out.push({ key: `${m.id}_${i}`, conflict, meetingTitle: m.title });
      });
    }
    setRows(out);
    setLoaded(true);
  }, []);

  if (!loaded || rows.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
        From your recordings
      </h2>
      <ul className="space-y-4">
        {rows.map(({ key, conflict: x, meetingTitle }) => (
          <li
            key={key}
            className="rounded-2xl border border-orange-200 bg-orange-50/40 p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              {x.teamA ? <PartyChip label={x.teamA} /> : null}
              {x.teamA && x.teamB ? (
                <span className="text-xs font-semibold text-orange-800">vs</span>
              ) : null}
              {x.teamB ? <PartyChip label={x.teamB} /> : null}
            </div>
            <h3 className="mt-2.5 font-display font-medium text-2xl leading-snug text-gray-900">
              {x.title}
            </h3>

            {x.quoteA || x.quoteB ? (
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {x.quoteA ? (
                  <blockquote className="rounded-xl bg-white p-4 text-sm leading-relaxed text-gray-700 italic">
                    “{x.quoteA}”
                  </blockquote>
                ) : null}
                {x.quoteB ? (
                  <blockquote className="rounded-xl bg-white p-4 text-sm leading-relaxed text-gray-700 italic">
                    “{x.quoteB}”
                  </blockquote>
                ) : null}
              </div>
            ) : null}

            <p className="mt-4 text-sm leading-relaxed text-gray-700">{x.explanation}</p>

            <Link
              href="/my-meetings"
              className="mt-3 inline-block text-xs text-gray-500 hover:text-gray-900 hover:underline"
            >
              From your recording: {meetingTitle} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecordedConflicts;
