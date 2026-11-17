import { getClaim, getConflicts, getFeature, getFeatures } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { ImportDemoBar } from "@/components/ui/ImportDemoBar";
import {
  ConflictsExplorer,
  type SeedConflictView,
} from "@/components/ui/ConflictsExplorer";
import { isDemoImported } from "@/lib/demo";

// /conflicts: an interactive conflict list. Conflicts from the user's own
// recordings sit on top of the sample backlog (opt-in via "Import meeting data").
// A sensitivity control lets the reader choose how many potential conflicts to
// surface, and each one can be dismissed as a false positive ("Not a conflict").
// Supports ?feature=f_data_export and ?team=risk as the initial filter.
export default async function ConflictsPage({ searchParams }: PageProps<"/conflicts">) {
  const sp = await searchParams;
  const initialFeatureId = typeof sp.feature === "string" ? sp.feature : "";
  const initialTeam = typeof sp.team === "string" ? sp.team : "";
  const imported = await isDemoImported();

  // Resolve seed conflicts into a serializable shape the client explorer can
  // render (claim text + source ids, so SourceBadge works client-side).
  const seedConflicts: SeedConflictView[] = (imported ? getConflicts() : []).map((x) => {
    const claimA = getClaim(x.claimAId);
    const claimB = getClaim(x.claimBId);
    const feature = getFeature(x.featureId);
    return {
      id: x.id,
      title: x.title,
      significance: x.confidence,
      explanation: x.explanation,
      featureId: feature?.id,
      featureName: feature?.name,
      suggestedQuestions: x.suggestedQuestions,
      sideA: {
        teamId: x.teamA,
        claimText: claimA?.text ?? "",
        sourceIds: claimA?.sourceIds ?? [],
        contradictsSourceId: claimA?.contradictsSourceId,
      },
      sideB: {
        teamId: x.teamB,
        claimText: claimB?.text ?? "",
        sourceIds: claimB?.sourceIds ?? [],
        contradictsSourceId: claimB?.contradictsSourceId,
      },
    };
  });

  const featureOptions = (imported ? getFeatures() : []).map((f) => ({ id: f.id, name: f.name }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PageHero
        title="Conflicts"
        subtitle="Where teams contradict each other, with the evidence on both sides. Tune the sensitivity, and dismiss anything that isn't a real disagreement."
        stats={[{ label: "In backlog", value: seedConflicts.length }]}
      />

      <ImportDemoBar imported={imported} />

      <ConflictsExplorer
        seedConflicts={seedConflicts}
        imported={imported}
        featureOptions={featureOptions}
        initialFeatureId={initialFeatureId}
        initialTeam={initialTeam}
      />
    </main>
  );
}
