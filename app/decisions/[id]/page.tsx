// Placeholder route so nav links don't 404. Owned by workstream 6 — the
// "Why" view (discussion behind a decision) lives here.
export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Decision {id}</h1>
      <p className="mt-2 text-gray-600">Placeholder &middot; workstream 6.</p>
    </main>
  );
}
