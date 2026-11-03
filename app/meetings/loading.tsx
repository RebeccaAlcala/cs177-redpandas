// Skeleton for /meetings while the server renders (Next.js loading UI).
export default function MeetingsLoading() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse px-6 py-12"
      aria-busy="true"
      aria-label="Loading meetings"
    >
      <div className="mb-6 space-y-2">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="h-4 w-full max-w-md rounded bg-gray-100" />
      </div>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-4 w-64 max-w-full rounded bg-gray-200" />
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-4 border-t border-gray-100 py-3">
            <div className="h-4 flex-1 rounded bg-gray-100" />
            <div className="h-7 w-28 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="mb-3 h-4 w-32 rounded bg-gray-200" />
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-100" />
            </div>
            <div className="hidden h-6 w-20 rounded-full bg-gray-100 sm:block" />
          </div>
        ))}
      </div>
    </main>
  );
}
