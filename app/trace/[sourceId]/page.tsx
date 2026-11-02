// Placeholder route so nav links don't 404. Owned by workstream 5
// (Source tracing) — full-page source view, fallback for the side panel.
export default async function TracePage({
  params,
}: {
  params: Promise<{ sourceId: string }>;
}) {
  const { sourceId } = await params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Source {sourceId}</h1>
      <p className="mt-2 text-gray-600">Placeholder &middot; workstream 5.</p>
    </main>
  );
}
