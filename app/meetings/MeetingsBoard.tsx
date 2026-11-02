"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Feature, Meeting, Person } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AvatarStack } from "@/components/transcript/Avatar";
import { RecordingBadge } from "@/components/transcript/RecordingBadge";
import { formatDuration, formatMeetingDate } from "@/components/transcript/format";

type Status = Meeting["recordingStatus"];

// Mock-only overrides the PM makes in the demo. Kept in localStorage so they
// survive clicking into a meeting and back. Nothing is written to data/.
type Local = {
  status: Record<string, Status>;
  feature: Record<string, string>; // "" = unlinked
  autoJoin: Record<string, boolean>;
};

const STORAGE_KEY = "mst.meetings.v1";
const EMPTY: Local = { status: {}, feature: {}, autoJoin: {} };

export function MeetingsBoard({
  meetings,
  features,
  people,
  initialFeatureId = "",
}: {
  meetings: Meeting[];
  features: Feature[];
  people: Person[];
  initialFeatureId?: string;
}) {
  const [local, setLocal] = useState<Local>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState(initialFeatureId);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Local>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from storage
        setLocal({
          status: { ...p.status },
          feature: { ...p.feature },
          autoJoin: { ...p.autoJoin },
        });
      }
    } catch {
      // blocked/corrupt storage: start fresh
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    } catch {
      // ignore storage failures
    }
  }, [local, loaded]);

  const featureName = useMemo(
    () => new Map(features.map((f) => [f.id, f.name])),
    [features],
  );
  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const statusOf = (m: Meeting): Status => local.status[m.id] ?? m.recordingStatus;
  const featureOf = (m: Meeting): string =>
    m.id in local.feature ? local.feature[m.id] : m.featureId ?? "";
  const autoJoinOf = (m: Meeting): boolean => local.autoJoin[m.id] ?? true;

  const setStatus = (id: string, s: Status) =>
    setLocal((l) => ({ ...l, status: { ...l.status, [id]: s } }));
  const setFeature = (id: string, f: string) =>
    setLocal((l) => ({ ...l, feature: { ...l.feature, [id]: f } }));
  const toggleAutoJoin = (m: Meeting) =>
    setLocal((l) => ({ ...l, autoJoin: { ...l.autoJoin, [m.id]: !autoJoinOf(m) } }));

  // "Upcoming" = anything not recorded in the seed data. It stays in the card
  // after the PM stops recording so the demo doesn't jump around.
  const upcoming = meetings
    .filter((m) => m.recordingStatus !== "recorded")
    .sort((a, b) => a.date.localeCompare(b.date));

  const listed = meetings
    .filter((m) => !filter || featureOf(m) === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8">
      {/* Auto-join from calendar (mock) */}
      <Card>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Recorder bot · auto-join from Google Calendar
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              The bot joins these meetings, records them, and links the transcript to the feature.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            Calendar connected
          </span>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState message="No upcoming meetings on your calendar." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {upcoming.map((m) => {
              const status = statusOf(m);
              const auto = autoJoinOf(m);
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{m.title}</div>
                    <div className="text-xs text-gray-500">{formatMeetingDate(m.date)}</div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={auto}
                      onClick={() => toggleAutoJoin(m)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        auto ? "bg-gray-900" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                          auto ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                    Auto-join
                  </label>

                  <RecordingBadge status={status} />

                  <div className="w-36 text-right">
                    {status === "scheduled" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(m.id, "recording")}
                        className="w-full rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                      >
                        ● Start recording
                      </button>
                    ) : status === "recording" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(m.id, "recorded")}
                        className="w-full rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        ■ Stop recording
                      </button>
                    ) : (
                      <Link
                        href={`/meetings/${m.id}`}
                        className="text-xs font-medium text-gray-700 hover:text-gray-900 hover:underline"
                      >
                        View transcript →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* All meetings */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">All meetings</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Feature
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800"
            >
              <option value="">All features</option>
              {features.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {listed.length === 0 ? (
          <EmptyState message="No meetings are linked to this feature yet." />
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {listed.map((m) => {
              const fid = featureOf(m);
              const attendees = (m.attendeeIds ?? [])
                .map((id) => peopleById.get(id))
                .filter((p): p is Person => Boolean(p));
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/meetings/${m.id}`}
                      className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                      {m.title}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                      <span>{formatMeetingDate(m.date)}</span>
                      <span aria-hidden>·</span>
                      <span>{formatDuration(m.durationMin)}</span>
                      {fid && featureName.has(fid) ? (
                        <>
                          <span aria-hidden>·</span>
                          <Link
                            href={`/features/${fid}`}
                            className="rounded-full bg-gray-900/5 px-2 py-0.5 font-medium text-gray-700 hover:bg-gray-900/10"
                          >
                            {featureName.get(fid)}
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <AvatarStack people={attendees} />
                  <RecordingBadge status={statusOf(m)} />

                  <select
                    aria-label={`Link ${m.title} to a feature`}
                    value={fid}
                    onChange={(e) => setFeature(m.id, e.target.value)}
                    className="w-44 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                  >
                    <option value="">Link to feature…</option>
                    {features.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MeetingsBoard;
