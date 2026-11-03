import Link from "next/link";
import type { TeamId } from "@/lib/types";
import { getClaim, getConflicts, getFeature, getFeatures } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamTag } from "@/components/ui/TeamTag";
import { TEAM_IDS, TEAM_META } from "@/components/ui/teams";
import { SourceBadge } from "@/components/source";
import { FilterPill } from "../decisions/FilterPill";

// /conflicts: cross-team conflicts, highest confidence first.
// Supports ?feature=f_data_export and ?team=risk.
export default async function ConflictsPage({ searchParams }: PageProps<"/conflicts">) {
  const sp = await searchParams;
  const featureId = typeof sp.feature === "string" ? sp.feature : "";
  const team = typeof sp.team === "string" ? (sp.team as TeamId) : "";

  const href = (nextFeature: string, nextTeam: string) => {
    const params = new URLSearchParams();
    if (nextFeature) params.set("feature", nextFeature);
    if (nextTeam) params.set("team", nextTeam);
    const query = params.toString();
    return query ? `/conflicts?${query}` : "/conflicts";
  };

  const all = getConflicts();
  const teamsInConflict = TEAM_IDS.filter((t) => all.some((x) => x.teamA === t || x.teamB === t));
  const conflicts = all
    .filter((x) => !featureId || x.featureId === featureId)
    .filter((x) => !team || x.teamA === team || x.teamB === team)
    .sort((a, b) => b.confidence - a.confidence);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <PageHeader
        title="Conflicts"
        subtitle="Where teams contradict each other, with the evidence on both sides. Highest confidence first."
      />

      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill href={href("", team)} active={!featureId}>
            All features
          </FilterPill>
          {getFeatures().map((f) => (
            <FilterPill key={f.id} href={href(f.id, team)} active={featureId === f.id}>
              {f.name}
            </FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill href={href(featureId, "")} active={!team}>
            All teams
          </FilterPill>
          {teamsInConflict.map((t) => (
            <FilterPill key={t} href={href(featureId, t)} active={team === t}>
              {TEAM_META[t].name}
            </FilterPill>
          ))}
        </div>
      </div>

      {conflicts.length === 0 ? (
        <EmptyState message="No conflicts match these filters." />
      ) : (
        <ul className="space-y-4">
          {conflicts.map((x) => {
            const feature = getFeature(x.featureId);
            const confidence = Math.round(x.confidence * 100);
            const sides = [
              { team: x.teamA, claim: getClaim(x.claimAId) },
              { team: x.teamB, claim: getClaim(x.claimBId) },
            ];
            return (
              <li
                key={x.id}
                id={x.id}
                className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0 flex-1 basis-64">
                    <h2 className="font-display text-2xl leading-snug text-gray-900">{x.title}</h2>
                    {feature ? (
                      <Link
                        href={`/features/${feature.id}`}
                        className="mt-0.5 inline-block text-xs text-gray-500 hover:text-gray-900 hover:underline"
                      >
                        {feature.name} →
                      </Link>
                    ) : null}
                  </div>
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
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {sides.map(({ team: sideTeam, claim }) => (
                    <div key={sideTeam} className="rounded-xl bg-gray-50 p-4">
                      <TeamTag team={sideTeam} />
                      <p className="mt-2.5 text-sm leading-relaxed text-gray-800">
                        {claim?.text ?? "Claim not found."}
                      </p>
                      {claim ? (
                        <div className="mt-3">
                          <SourceBadge
                            sourceIds={claim.sourceIds}
                            contradictsSourceId={claim.contradictsSourceId}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-sm leading-relaxed text-gray-700">{x.explanation}</p>

                {x.suggestedQuestions.length > 0 ? (
                  <div className="mt-3">
                    <h3 className="text-xs font-semibold text-gray-900">Questions to ask next</h3>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-gray-700">
                      {x.suggestedQuestions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
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
