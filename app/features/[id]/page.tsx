import Link from "next/link";
import type { TeamId } from "@/lib/types";
import {
  getClaim,
  getClaims,
  getConflicts,
  getDecisions,
  getFeature,
  getMeetings,
} from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamTag } from "@/components/ui/TeamTag";
import { FeatureStatusBadge } from "@/components/feature/FeatureStatusBadge";
import { SourceBadge } from "@/components/source";
import { TeamColumns, type ConflictRef } from "@/components/feature/TeamColumns";

// The four teams the story map asks for; Product/Growth join only when they said something.
const CORE_TEAMS: TeamId[] = ["compliance", "risk", "security", "eng"];
const EXTRA_TEAMS: TeamId[] = ["product", "growth"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// /features/[id]: overview, what each team said, conflicts, decisions.
export default async function FeatureDetailPage({ params }: PageProps<"/features/[id]">) {
  const { id } = await params;
  const feature = getFeature(id);

  if (!feature) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageHeader title="Feature not found" />
        <EmptyState message="This feature doesn't exist. Go back to the features list." />
        <Link href="/features" className="mt-4 inline-block text-sm text-gray-700 hover:underline">
          ← All features
        </Link>
      </main>
    );
  }

  const meetings = getMeetings({ featureId: id }).sort((a, b) => b.date.localeCompare(a.date));
  const claims = getClaims({ featureId: id });
  const conflicts = getConflicts(id);
  const decisions = getDecisions(id).sort((a, b) => b.date.localeCompare(a.date));

  const teams = [
    ...CORE_TEAMS,
    ...EXTRA_TEAMS.filter((t) => claims.some((c) => c.team === t)),
  ];
  const meetingDates = Object.fromEntries(getMeetings().map((m) => [m.id, m.date]));
  const conflictByClaim: Record<string, ConflictRef> = {};
  for (const x of conflicts) {
    conflictByClaim[x.claimAId] = { id: x.id, title: x.title };
    conflictByClaim[x.claimBId] = { id: x.id, title: x.title };
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/features" className="text-xs text-gray-500 hover:text-gray-800 hover:underline">
        ← All features
      </Link>
      <div className="mt-2">
        <PageHeader
          title={feature.name}
          subtitle={feature.description}
          actions={<FeatureStatusBadge status={feature.status} />}
        />
      </div>

      <div className="space-y-10">
        {/* Overview */}
        <Card title={`Linked meetings (${meetings.length})`}>
          {meetings.length === 0 ? (
            <EmptyState message="No meetings are linked to this feature yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {meetings.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-2.5">
                  <Link
                    href={`/meetings/${m.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {m.title}
                  </Link>
                  <span className="shrink-0 text-xs text-gray-500">{formatDate(m.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* By team */}
        <section>
          <h2 className="mb-4 font-display font-medium text-2xl text-gray-900">What each team said</h2>
          {claims.length === 0 ? (
            <EmptyState message="No team has said anything about this feature yet." />
          ) : (
            <TeamColumns
              teams={teams}
              claims={claims}
              meetingDates={meetingDates}
              conflictByClaim={conflictByClaim}
            />
          )}
        </section>

        {/* Conflicts */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-medium text-2xl text-gray-900">Conflicts ({conflicts.length})</h2>
            <Link href="/conflicts" className="text-xs text-gray-600 hover:text-gray-900 hover:underline">
              All conflicts →
            </Link>
          </div>
          {conflicts.length === 0 ? (
            <EmptyState message="No conflicts found for this feature." />
          ) : (
            <ul className="space-y-3">
              {conflicts.map((x) => {
                const a = getClaim(x.claimAId);
                const b = getClaim(x.claimBId);
                return (
                  <li
                    key={x.id}
                    id={x.id}
                    className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-display font-medium text-xl leading-snug text-gray-900">{x.title}</h3>
                      <span className="text-xs text-gray-500">
                        {Math.round(x.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{x.explanation}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        { team: x.teamA, claim: a },
                        { team: x.teamB, claim: b },
                      ].map(({ team, claim }) => (
                        <div key={team} className="rounded-xl bg-gray-50 p-4">
                          <TeamTag team={team} />
                          <p className="mt-2 text-sm text-gray-800">
                            {claim?.text ?? "Claim not found."}
                          </p>
                          {claim ? (
                            <div className="mt-2">
                              <SourceBadge
                                sourceIds={claim.sourceIds}
                                contradictsSourceId={claim.contradictsSourceId}
                              />
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Decisions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display font-medium text-2xl text-gray-900">Decisions ({decisions.length})</h2>
            <Link href="/decisions" className="text-xs text-gray-600 hover:text-gray-900 hover:underline">
              Decision log →
            </Link>
          </div>
          {decisions.length === 0 ? (
            <EmptyState message="No decisions recorded for this feature yet." />
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {decisions.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                  <Link
                    href={`/decisions/${d.id}`}
                    className="min-w-0 flex-1 text-sm text-gray-900 hover:underline"
                  >
                    {d.text}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    {d.madeByTeams.map((t) => (
                      <TeamTag key={t} team={t} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(d.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
