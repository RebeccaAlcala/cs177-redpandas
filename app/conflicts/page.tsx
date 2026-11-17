import { getClaim, getConflicts, getFeature, getFeatures } from "@/lib/data";
import { PageHero } from "@/components/ui/PageHero";
import { ImportDemoBar } from "@/components/ui/ImportDemoBar";
import {
  ConflictsExplorer,
  type SeedConflictView,
} from "@/components/ui/ConflictsExplorer";
import { FeaturePromo } from "@/components/landing/FeaturePromo";
import { isDemoImported } from "@/lib/demo";
import { getSessionUser } from "@/lib/auth";

// /conflicts: an interactive conflict list. Conflicts from the user's own
// recordings sit on top of the sample backlog (opt-in via "Import meeting data").
// A sensitivity control lets the reader choose how many potential conflicts to
// surface, and each one can be dismissed as a false positive ("Not a conflict").
// Supports ?feature=f_data_export and ?team=risk as the initial filter.
export default async function ConflictsPage({ searchParams }: PageProps<"/conflicts">) {
  const user = await getSessionUser();
  if (!user) {
    return (
      <FeaturePromo
        eyebrow="Conflicts"
        title="Catch cross-team conflict before it ships."
        blurb="The AI flags where teams contradict each other — a number, a policy, a commitment — and shows the evidence on both sides. You choose how sensitive it is, and dismiss anything that isn't a real disagreement."
        points={[
          { title: "Both sides, with evidence", text: "Each conflict shows what each team said and the source behind it." },
          { title: "Tune the sensitivity", text: "From only the clearest conflicts to every borderline one — your call." },
          { title: "Dismiss false positives", text: "Mark anything that isn't a real conflict, and it stays out of the way." },
        ]}
      />
    );
  }

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

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <span aria-hidden>💡</span>
        <p>
          Use <span className="font-medium text-gray-900">Conflict sensitivity</span> to choose how
          many to surface, and mark anything that isn&apos;t a real disagreement as{" "}
          <span className="font-medium text-gray-900">“Not a conflict.”</span>
        </p>
      </div>

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
