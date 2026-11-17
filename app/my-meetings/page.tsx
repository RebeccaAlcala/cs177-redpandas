"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AnalysisView } from "@/components/record/AnalysisView";
import {
  loadMeetings,
  deleteMeeting,
  type SavedMeeting,
} from "@/lib/local-meetings";

export default function MyMeetingsPage() {
  const [meetings, setMeetings] = useState<SavedMeeting[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMeetings(loadMeetings());
    setLoaded(true);
  }, []);

  function remove(id: string) {
    deleteMeeting(id);
    setMeetings(loadMeetings());
    if (openId === id) setOpenId(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display font-medium text-4xl tracking-tight text-gray-900">
          My meetings
        </h1>
        <Button href="/record">Record a meeting</Button>
      </div>

      {!loaded ? null : meetings.length === 0 ? (
        <div className="rounded-2xl bg-gray-100/70 px-6 py-12 text-center text-sm text-gray-500">
          No recordings yet. Record a meeting and its AI summary will show up
          here (saved in this browser).
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {meetings.map((m) => {
            const open = openId === m.id;
            return (
              <li
                key={m.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <button
                    onClick={() => setOpenId(open ? null : m.id)}
                    className="flex-1 text-left"
                  >
                    <span className="font-medium text-gray-900">{m.title}</span>
                    <span className="block text-xs text-gray-500">
                      {new Date(m.createdAt).toLocaleString()} ·{" "}
                      {m.analysis.summaryPoints.length} points ·{" "}
                      {m.analysis.conflicts.length} conflicts
                    </span>
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOpenId(open ? null : m.id)}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      {open ? "Hide" : "View"}
                    </button>
                    <button
                      onClick={() => remove(m.id)}
                      className="text-sm text-gray-400 hover:text-red-600"
                      aria-label={`Delete ${m.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {open ? (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-5">
                    <AnalysisView analysis={m.analysis} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
