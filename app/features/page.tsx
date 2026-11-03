import { getClaims, getConflicts, getFeatures, getMeetings } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { TEAM_IDS } from "@/components/ui/teams";
import { FeatureList } from "@/components/feature/FeatureList";

// /features: every feature with how often it came up and how many open conflicts it has.
export default function FeaturesPage() {
  const features = getFeatures().map((f) => {
    const claims = getClaims({ featureId: f.id });
    return {
      ...f,
      meetingCount: getMeetings({ featureId: f.id }).length,
      conflictCount: getConflicts(f.id).length,
      teamShare: TEAM_IDS.map((team) => ({
        team,
        amount: claims.filter((c) => c.team === team).length,
      })).filter((s) => s.amount > 0),
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHero
        title="Features"
        subtitle="Browse by feature to see what each team said about it, and where they disagree."
        stats={[
          { label: "Features", value: features.length },
          { label: "Blocked", value: features.filter((f) => f.status === "blocked").length },
          { label: "Open conflicts", value: getConflicts().length },
        ]}
      />
      {features.length === 0 ? (
        <EmptyState message="No features yet. Link a meeting to a feature to get started." />
      ) : (
        <FeatureList features={features} />
      )}
    </main>
  );
}
