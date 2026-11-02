// Skeleton for /meetings/[id] while the server renders (Next.js loading UI).
export default function MeetingDetailLoading() {
  return (
    <main
      className="mx-auto max-w-5xl animate-pulse px-6 py-10"
      aria-busy="true"
      aria-label="Loading meeting"
    >
      <div className="mb-4 h-4 w-24 rounded bg-gray-100" />
      <div className="mb-6 space-y-2">
        <div className="h-7 w-72 max-w-full rounded bg-gray-200" />
        <div className="h-4 w-48 rounded bg-gray-100" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 py-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 h-4 w-28 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-5/6 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
