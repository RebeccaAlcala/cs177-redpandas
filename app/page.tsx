import { Button } from "@/components/ui/Button";

// Landing + mock SSO sign-in (docs/CONTRACT.md route "/").
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24">
      <span className="rounded-full bg-gray-900/5 px-3 py-1 text-xs font-medium text-gray-600">
        For product managers
      </span>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900">
        Meeting Source Tracer
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600">
        Record meetings, catch cross-team conflict, and trace every claim back
        to its source — so every decision has a receipt.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button href="/connect">Sign in with company SSO</Button>
        <Button href="/meetings" variant="secondary">
          View the demo
        </Button>
      </div>
      <p className="mt-10 text-xs text-gray-400">
        Mock SSO &middot; no real sign-in &middot; prototype data
      </p>
    </main>
  );
}
