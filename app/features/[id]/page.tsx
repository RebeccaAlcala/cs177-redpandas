// Placeholder route so nav links don't 404. Owned by workstream 3
// (Features + team views) — per-team views, summary, conflicts for a feature.
export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Feature {id}</h1>
      <p className="mt-2 text-gray-600">Placeholder &middot; workstream 3.</p>
    </main>
  );
}
