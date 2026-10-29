// Placeholder route so nav links don't 404. Owned by workstream 2
// (Meetings + transcript) — they replace this with the transcript + AI summary.
export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Meeting {id}</h1>
      <p className="mt-2 text-gray-600">Placeholder &middot; workstream 2.</p>
    </main>
  );
}
