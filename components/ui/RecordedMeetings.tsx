"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMeetings, type SavedMeeting } from "@/lib/local-meetings";

// Client island: the person's own recorded meetings (localStorage), shown at
// the top of /meetings above the sample backlog. Renders nothing until mounted
// or when there are no recordings, so the page stays clean before any recording.
export function RecordedMeetings() {
  const [meetings, setMeetings] = useState<SavedMeeting[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMeetings(loadMeetings());
    setLoaded(true);
  }, []);

  if (!loaded || meetings.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
        Your recordings
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {meetings.map((m) => (
          <li key={m.id}>
            <Link
              href="/my-meetings"
              className="block h-full rounded-2xl border border-accent/20 bg-accent/[0.03] p-5 transition-colors hover:border-accent/40"
            >
              <span className="inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                Recorded by you
              </span>
              <h3 className="mt-2 font-display font-medium text-xl text-gray-900">
                {m.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(m.createdAt).toLocaleString()}
              </p>
              <p className="mt-3 text-sm text-gray-600">
                {m.analysis.summaryPoints.length} summary point
                {m.analysis.summaryPoints.length === 1 ? "" : "s"} ·{" "}
                {m.analysis.conflicts.length} conflict
                {m.analysis.conflicts.length === 1 ? "" : "s"} ·{" "}
                {m.analysis.actionItems.length} action item
                {m.analysis.actionItems.length === 1 ? "" : "s"}
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-accent">
                View summary →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecordedMeetings;
