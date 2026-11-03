import Link from "next/link";
import { getDecisions, getFeatures } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { TeamTag } from "@/components/ui/TeamTag";
import { SourceBadge, FreshnessTag } from "@/components/source";
import { formatMeetingDate } from "@/components/transcript/format";
import { FilterPill } from "./FilterPill";
import { decisionFreshness } from "./freshness";

// /decisions: decision log grouped by feature, newest first.
// Supports ?feature=f_data_export and ?status=overturned.
export default async function DecisionsPage({ searchParams }: PageProps<"/decisions">) {
  const sp = await searchParams;
  const featureId = typeof sp.feature === "string" ? sp.feature : "";
  const overturnedOnly = sp.status === "overturned";

  const features = getFeatures();
  const href = (feature: string, overturned: boolean) => {
    const params = new URLSearchParams();
    if (feature) params.set("feature", feature);
    if (overturned) params.set("status", "overturned");
    const query = params.toString();
    return query ? `/decisions?${query}` : "/decisions";
  };

  const groups = features
    .filter((f) => !featureId || f.id === featureId)
    .map((feature) => ({
      feature,
      decisions: getDecisions(feature.id)
        .map((decision) => ({ decision, freshness: decisionFreshness(decision) }))
        .filter((d) => !overturnedOnly || d.freshness === "overturned")
        .sort((a, b) => b.decision.date.localeCompare(a.decision.date)),
    }))
    .filter((g) => g.decisions.length > 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Decisions"
        subtitle="Every decision per feature, linked to its sources and the discussion behind it."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterPill href={href("", overturnedOnly)} active={!featureId}>
          All features
        </FilterPill>
        {features.map((f) => (
          <FilterPill key={f.id} href={href(f.id, overturnedOnly)} active={featureId === f.id}>
            {f.name}
          </FilterPill>
        ))}
        <span className="mx-1 h-4 w-px bg-gray-300" aria-hidden />
        <FilterPill href={href(featureId, !overturnedOnly)} active={overturnedOnly}>
          Overturned only
        </FilterPill>
      </div>

      {groups.length === 0 ? (
        <EmptyState message="No decisions match these filters." />
      ) : (
        <div className="space-y-8">
          {groups.map(({ feature, decisions }) => (
            <section key={feature.id}>
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                <Link href={`/features/${feature.id}`} className="hover:underline">
                  {feature.name}
                </Link>
              </h2>
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {decisions.map(({ decision: d, freshness }) => (
                  <li key={d.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <p
                        className={`text-sm ${
                          freshness === "overturned" ? "text-gray-500 line-through" : "text-gray-900"
                        }`}
                      >
                        {d.text}
                      </p>
                      <Link
                        href={`/decisions/${d.id}`}
                        className="shrink-0 text-sm font-medium text-gray-900 hover:underline"
                      >
                        Why →
                      </Link>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="mr-1 text-xs text-gray-500">{formatMeetingDate(d.date)}</span>
                      {d.madeByTeams.map((t) => (
                        <TeamTag key={t} team={t} />
                      ))}
                      <SourceBadge sourceIds={d.sourceIds} />
                      <FreshnessTag status={freshness} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
