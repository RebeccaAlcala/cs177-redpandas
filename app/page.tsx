import Link from "next/link";

// Placeholder landing page. Workstream 1 replaces this with the real
// mock-SSO landing in Phase 1.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold">Meeting Source Tracer</h1>
      <p className="mt-3 text-gray-600">
        Record meetings, catch cross-team conflict, and trace every claim back
        to its source.
      </p>
      <Link
        href="/connect"
        className="mt-8 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Sign in with company SSO
      </Link>
      <p className="mt-10 text-xs uppercase tracking-wide text-gray-400">
        Scaffold placeholder &middot; workstream 1
      </p>
    </main>
  );
}
