import Link from "next/link";
import { getDecisions, getFeatures } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
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
  const allDecisions = getDecisions();
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
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHero
        title="Decisions"
        subtitle="Every decision per feature, linked to its sources and the discussion behind it."
        stats={[
          { label: "Decisions", value: allDecisions.length },
          {
            label: "Overturned",
            value: allDecisions.filter((d) => decisionFreshness(d) === "overturned").length,
          },
        ]}
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
              <h2 className="mb-4 font-display font-medium text-2xl text-gray-900">
                <Link href={`/features/${feature.id}`} className="hover:underline">
                  {feature.name}
                </Link>
              </h2>
              <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {decisions.map(({ decision: d, freshness }, i) => (
                  <li key={d.id} className="relative py-5 pr-6 pl-12">
                    {/* Timeline rail: newest at the top, joined to the one before it. */}
                    {i < decisions.length - 1 ? (
                      <span className="absolute top-8 -bottom-7 left-6 w-px bg-gray-200" aria-hidden />
                    ) : null}
                    <span
                      className={`absolute top-[1.65rem] left-[1.2rem] h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                        freshness === "overturned" ? "bg-red-500" : "bg-accent"
                      }`}
                      aria-hidden
                    />
                    <div className="flex items-start justify-between gap-4">
                      <p
                        className={`text-base leading-relaxed ${
                          freshness === "overturned" ? "text-gray-500 line-through" : "text-gray-900"
                        }`}
                      >
                        {d.text}
                      </p>
                      <Link
                        href={`/decisions/${d.id}`}
                        className="shrink-0 text-sm font-medium text-accent hover:underline"
                      >
                        Why →
                      </Link>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
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
