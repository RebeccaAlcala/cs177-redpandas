import { getConflicts, getFeatures, getMeetings } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeatureList } from "@/components/feature/FeatureList";

// /features: every feature with how often it came up and how many open conflicts it has.
export default function FeaturesPage() {
  const features = getFeatures().map((f) => ({
    ...f,
    meetingCount: getMeetings({ featureId: f.id }).length,
    conflictCount: getConflicts(f.id).length,
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Features"
        subtitle="Browse by feature to see what each team said about it, and where they disagree."
      />
      {features.length === 0 ? (
        <EmptyState message="No features yet. Link a meeting to a feature to get started." />
      ) : (
        <FeatureList features={features} />
      )}
    </main>
  );
}
