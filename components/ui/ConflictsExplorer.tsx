"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TeamId } from "@/lib/types";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_META } from "@/components/ui/teams";
import { SourceBadge } from "@/components/source";
import { loadMeetings } from "@/lib/local-meetings";

// One side of a seed conflict, resolved server-side so SourceBadge just needs ids.
export interface SeedSide {
  teamId: TeamId;
  claimText: string;
  sourceIds: string[];
  contradictsSourceId?: string;
}

export interface SeedConflictView {
  id: string;
  title: string;
  significance: number; // 0..1 (seed confidence)
  explanation: string;
  featureId?: string;
  featureName?: string;
  suggestedQuestions: string[];
  sideA: SeedSide;
  sideB: SeedSide;
}

interface RecordedConflictView {
  id: string;
  title: string;
  significance: number; // 0..1 (AI significance; default when older)
  explanation: string;
  teamA?: string;
  teamB?: string;
  quoteA?: string;
  quoteB?: string;
  meetingTitle: string;
}

// Sensitivity stops. `min` is the significance a conflict must reach to be shown.
const LEVELS = [
  { id: "significant", label: "Only significant", min: 0.85 },
  { id: "balanced", label: "Balanced", min: 0.7 },
  { id: "all", label: "Catch everything", min: 0 },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];

const SENSITIVITY_KEY = "mst.conflict-sensitivity";
const DISMISSED_KEY = "mst.conflict-dismissed";

function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function PartyChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}

function SignalTag({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const strong = value >= 0.85;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        strong ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-600"
      }`}
      title="How confident the detector is that this is a real conflict"
    >
      {pct}% confidence
    </span>
  );
}

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
      title="Mark this as a false positive — not an actual disagreement"
    >
      Not a conflict
    </button>
  );
}

export function ConflictsExplorer({
  seedConflicts,
  imported,
  featureOptions,
  initialFeatureId = "",
  initialTeam = "",
}: {
  seedConflicts: SeedConflictView[];
  imported: boolean;
  featureOptions: { id: string; name: string }[];
  initialFeatureId?: string;
  initialTeam?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [level, setLevel] = useState<LevelId>("balanced");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);
  const [recorded, setRecorded] = useState<RecordedConflictView[]>([]);
  const [featureId, setFeatureId] = useState(initialFeatureId);
  const [team, setTeam] = useState<string>(initialTeam);

  // Hydrate everything client-side (sensitivity, dismissals, recorded meetings).
  useEffect(() => {
    const savedLevel = readString(SENSITIVITY_KEY);
    if (savedLevel && LEVELS.some((l) => l.id === savedLevel)) {
      setLevel(savedLevel as LevelId);
    }
    const savedDismissed = readString(DISMISSED_KEY);
    if (savedDismissed) {
      try {
        const parsed = JSON.parse(savedDismissed);
        if (Array.isArray(parsed)) setDismissed(parsed.filter((x) => typeof x === "string"));
      } catch {
        /* ignore */
      }
    }
    const rows: RecordedConflictView[] = [];
    for (const m of loadMeetings()) {
      m.analysis.conflicts.forEach((c, i) => {
        rows.push({
          id: `${m.id}_${i}`,
          title: c.title,
          significance: typeof c.significance === "number" ? c.significance : 0.7,
          explanation: c.explanation,
          teamA: c.teamA,
          teamB: c.teamB,
          quoteA: c.quoteA,
          quoteB: c.quoteB,
          meetingTitle: m.title,
        });
      });
    }
    setRecorded(rows);
    setLoaded(true);
  }, []);

  function chooseLevel(id: LevelId) {
    setLevel(id);
    writeString(SENSITIVITY_KEY, id);
  }

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      writeString(DISMISSED_KEY, JSON.stringify(next));
      return next;
    });
  }

  function restore(id: string) {
    setDismissed((prev) => {
      const next = prev.filter((x) => x !== id);
      writeString(DISMISSED_KEY, JSON.stringify(next));
      return next;
    });
  }

  const minSig = LEVELS.find((l) => l.id === level)?.min ?? 0;
  const isDismissed = (id: string) => dismissed.includes(id);

  // Seed conflicts filtered by the feature/team pills (recorded are the user's
  // own and aren't feature-tagged, so the pills don't apply to them).
  const seedFiltered = useMemo(
    () =>
      seedConflicts
        .filter((c) => !featureId || c.featureId === featureId)
        .filter((c) => !team || c.sideA.teamId === team || c.sideB.teamId === team),
    [seedConflicts, featureId, team],
  );

  const teamsPresent = useMemo(() => {
    const set = new Set<TeamId>();
    for (const c of seedConflicts) {
      set.add(c.sideA.teamId);
      set.add(c.sideB.teamId);
    }
    return [...set];
  }, [seedConflicts]);

  // Counts across everything currently in scope (recorded + filtered seed).
  const inScope = [
    ...recorded.map((r) => ({ id: r.id, sig: r.significance })),
    ...seedFiltered.map((s) => ({ id: s.id, sig: s.significance })),
  ];
  const liveScope = inScope.filter((x) => !isDismissed(x.id));
  const visibleCount = liveScope.filter((x) => x.sig >= minSig).length;
  const hiddenBySensitivity = liveScope.length - visibleCount;
  const dismissedInScope = inScope.filter((x) => isDismissed(x.id)).length;

  const recordedVisible = recorded.filter((r) => r.significance >= minSig && !isDismissed(r.id));
  const seedVisible = seedFiltered.filter((s) => s.significance >= minSig && !isDismissed(s.id));

  const recordedDismissed = recorded.filter((r) => isDismissed(r.id));
  const seedDismissed = seedFiltered.filter((s) => isDismissed(s.id));

  return (
    <div>
      {/* Sensitivity control */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Conflict sensitivity</div>
            <p className="mt-0.5 text-xs text-gray-500">
              Choose how many potential conflicts to surface.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => chooseLevel(l.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  level === l.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="font-medium text-gray-700">
            Showing {visibleCount} of {liveScope.length}
          </span>
          {hiddenBySensitivity > 0 ? <span>· {hiddenBySensitivity} hidden by sensitivity</span> : null}
          {dismissedInScope > 0 ? (
            <button
              onClick={() => setShowDismissed((v) => !v)}
              className="underline-offset-2 hover:text-gray-800 hover:underline"
            >
              · {dismissedInScope} marked “not a conflict” ({showDismissed ? "hide" : "show"})
            </button>
          ) : null}
        </div>
      </div>

      {/* Feature / team pills (seed backlog only) */}
      {imported && (featureOptions.length > 0 || teamsPresent.length > 0) ? (
        <div className="mb-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Pill active={!featureId} onClick={() => setFeatureId("")}>
              All features
            </Pill>
            {featureOptions.map((f) => (
              <Pill key={f.id} active={featureId === f.id} onClick={() => setFeatureId(f.id)}>
                {f.name}
              </Pill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill active={!team} onClick={() => setTeam("")}>
              All teams
            </Pill>
            {teamsPresent.map((t) => (
              <Pill key={t} active={team === t} onClick={() => setTeam(t)}>
                {TEAM_META[t].name}
              </Pill>
            ))}
          </div>
        </div>
      ) : null}

      {!loaded ? (
        <div className="rounded-2xl bg-gray-100/70 px-6 py-12 text-center text-sm text-gray-400">
          Loading conflicts…
        </div>
      ) : (
        <>
          {recordedVisible.length > 0 ? (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                From your recordings
              </h2>
              <ul className="space-y-4">
                {recordedVisible.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-orange-200 bg-orange-50/40 p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {r.teamA ? <PartyChip label={r.teamA} /> : null}
                        {r.teamA && r.teamB ? (
                          <span className="text-xs font-semibold text-orange-800">vs</span>
                        ) : null}
                        {r.teamB ? <PartyChip label={r.teamB} /> : null}
                        <SignalTag value={r.significance} />
                      </div>
                      <DismissButton onDismiss={() => dismiss(r.id)} />
                    </div>
                    <h3 className="mt-2.5 font-display font-medium text-2xl leading-snug text-gray-900">
                      {r.title}
                    </h3>
                    {r.quoteA || r.quoteB ? (
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {r.quoteA ? (
                          <blockquote className="rounded-xl bg-white p-4 text-sm leading-relaxed text-gray-700 italic">
                            “{r.quoteA}”
                          </blockquote>
                        ) : null}
                        {r.quoteB ? (
                          <blockquote className="rounded-xl bg-white p-4 text-sm leading-relaxed text-gray-700 italic">
                            “{r.quoteB}”
                          </blockquote>
                        ) : null}
                      </div>
                    ) : null}
                    <p className="mt-4 text-sm leading-relaxed text-gray-700">{r.explanation}</p>
                    <Link
                      href="/my-meetings"
                      className="mt-3 inline-block text-xs text-gray-500 hover:text-gray-900 hover:underline"
                    >
                      From your recording: {r.meetingTitle} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {seedVisible.length > 0 ? (
            <section>
              {recordedVisible.length > 0 ? (
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Team backlog
                </h2>
              ) : null}
              <ul className="space-y-4">
                {seedVisible.map((c) => (
                  <SeedCard key={c.id} c={c} onDismiss={() => dismiss(c.id)} />
                ))}
              </ul>
            </section>
          ) : null}

          {visibleCount === 0 ? (
            <div className="rounded-2xl bg-gray-100/70 px-6 py-12 text-center text-sm text-gray-500">
              {liveScope.length === 0
                ? imported
                  ? "No conflicts here yet. Record a meeting, or adjust the filters."
                  : "No conflicts from your recordings yet. Use “Import meeting data” above to load the sample backlog, or record a meeting."
                : "No conflicts at this sensitivity. Switch to “Catch everything” to see borderline ones."}
            </div>
          ) : null}

          {/* Dismissed list */}
          {showDismissed && (recordedDismissed.length > 0 || seedDismissed.length > 0) ? (
            <section className="mt-10 border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-400 uppercase">
                Marked “not a conflict”
              </h2>
              <ul className="space-y-2">
                {[...recordedDismissed.map((r) => ({ id: r.id, title: r.title })),
                  ...seedDismissed.map((s) => ({ id: s.id, title: s.title }))].map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5"
                  >
                    <span className="text-sm text-gray-500 line-through">{d.title}</span>
                    <button
                      onClick={() => restore(d.id)}
                      className="shrink-0 text-xs font-medium text-accent hover:underline"
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function SeedCard({ c, onDismiss }: { c: SeedConflictView; onDismiss: () => void }) {
  const confidence = Math.round(c.significance * 100);
  const sides = [c.sideA, c.sideB];
  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 basis-64">
          <div className="mb-1.5 flex items-center gap-2">
            <SignalTag value={c.significance} />
          </div>
          <h2 className="font-display font-medium text-2xl leading-snug text-gray-900">{c.title}</h2>
          {c.featureId && c.featureName ? (
            <Link
              href={`/features/${c.featureId}`}
              className="mt-0.5 inline-block text-xs text-gray-500 hover:text-gray-900 hover:underline"
            >
              {c.featureName} →
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40 shrink-0">
            <div className="mb-1 text-xs text-gray-600">{confidence}% confidence</div>
            <div
              role="meter"
              aria-label="Confidence"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={confidence}
              className="h-1.5 overflow-hidden rounded-full bg-gray-100"
            >
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${confidence}%` }} />
            </div>
          </div>
          <DismissButton onDismiss={onDismiss} />
        </div>
      </div>

      <div className="mt-4 grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr]">
        {sides.map((side, i) => (
          <Fragment key={side.teamId + i}>
            {i === 1 ? (
              <span className="mx-auto flex h-8 w-8 items-center justify-center self-center rounded-full bg-orange-100 text-xs font-semibold text-orange-800">
                vs
              </span>
            ) : null}
            <div className="rounded-xl bg-gray-50 p-4">
              <TeamTag team={side.teamId} />
              <p className="mt-2.5 text-sm leading-relaxed text-gray-800">
                {side.claimText || "Claim not found."}
              </p>
              <div className="mt-3">
                <SourceBadge sourceIds={side.sourceIds} contradictsSourceId={side.contradictsSourceId} />
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-gray-700">{c.explanation}</p>

      {c.suggestedQuestions.length > 0 ? (
        <div className="mt-3">
          <h3 className="text-xs font-semibold text-gray-900">Questions to ask next</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-gray-700">
            {c.suggestedQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

export default ConflictsExplorer;
